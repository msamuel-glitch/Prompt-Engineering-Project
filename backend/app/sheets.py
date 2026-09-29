"""/api/sheets: generate a study sheet from a course, then keep it."""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from app import storage
from app.checks import check_sheet, count_words, describe
from app.config import get_settings
from app.extraction import ExtractionError, UnsupportedFileError, extract_course
from app.generation import (
    ClaudeSheetGenerator,
    FakeSheetGenerator,
    FixtureSheetGenerator,
    GenerationError,
    SheetGenerator,
)
from app.prompts import PromptNotFoundError, load_prompt
from app.schemas import (
    FolderUpdate,
    SheetSummary,
    StoredSheet,
    StudySheet,
    TagsUpdate,
)

MAX_FILE_BYTES = 30 * 1024 * 1024
# About 75,000 tokens: bounds the cost of one request. Longer courses need a
# strategy such as splitting, still to be decided (see PROJECT_BRIEF.md).
MAX_COURSE_CHARACTERS = 300_000

router = APIRouter()


def get_generator() -> SheetGenerator:
    settings = get_settings()
    if settings.generator == "fake":
        return FakeSheetGenerator()
    if settings.generator == "fixture":
        try:
            return FixtureSheetGenerator(settings.fixture_path)
        except GenerationError as error:
            raise HTTPException(500, str(error)) from error
    if settings.generator != "claude":
        raise HTTPException(
            500,
            'STUDY_SHEET_GENERATOR must be "claude", "fixture" or "fake" in '
            "backend/.env.",
        )
    if not settings.has_api_key:
        raise HTTPException(
            503,
            "No Anthropic API key: set ANTHROPIC_API_KEY in backend/.env, or set "
            "STUDY_SHEET_GENERATOR=fake to try the app without AI.",
        )
    try:
        template = load_prompt("study-sheet", settings.prompt_version)
    except PromptNotFoundError as error:
        raise HTTPException(500, str(error)) from error
    return ClaudeSheetGenerator(
        settings.claude_model, template, settings.prompt_version
    )


def get_db_path() -> Path:
    return get_settings().db_path


def as_response(record: storage.Record) -> StoredSheet:
    """Describe a saved record, re-running the checks on its current version.

    Word count and warnings are computed here rather than stored, so that an
    edited sheet never shows the checks of the version the AI wrote.
    """
    course = record.course()
    warnings = []
    if record.empty_units:
        warnings.append(
            f"No text found on {describe(course, record.empty_units)} (images or "
            "scans?): not sent to the AI."
        )
    warnings.extend(check_sheet(record.current_sheet, course))
    return StoredSheet(
        id=record.id,
        created_at=record.created_at,
        file_name=record.file_name,
        source_type=record.source_type,
        source_count=record.source_count,
        sheet=record.current_sheet,
        word_count=count_words(record.current_sheet),
        warnings=warnings,
        generator=record.generator,
        prompt_version=record.prompt_version,
        folder=record.folder,
        tags=record.tags,
        edited=record.edited,
    )


def found(record_id: str, path: Path) -> storage.Record:
    try:
        return storage.get(path, record_id)
    except storage.SheetNotFoundError as error:
        raise HTTPException(404, str(error)) from error


@router.post("/api/sheets", response_model=StoredSheet)
def create_sheet(
    file: UploadFile,
    generator: SheetGenerator = Depends(get_generator),
    db_path: Path = Depends(get_db_path),
) -> StoredSheet:
    data = file.file.read(MAX_FILE_BYTES + 1)
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(413, "The file is larger than 30 MB.")

    file_name = file.filename or ""
    try:
        course = extract_course(file_name, data)
    except UnsupportedFileError as error:
        raise HTTPException(415, str(error)) from error
    except ExtractionError as error:
        raise HTTPException(422, str(error)) from error

    characters = len(course.to_prompt_text())
    if characters > MAX_COURSE_CHARACTERS:
        raise HTTPException(
            413,
            f"The course is too long for one request ({characters:,} characters, "
            f"limit {MAX_COURSE_CHARACTERS:,}). Try a shorter part of it.",
        )

    try:
        sheet = generator.generate(course)
    except GenerationError as error:
        raise HTTPException(502, str(error)) from error

    record = storage.save(
        db_path,
        file_name=file_name,
        source_type=course.source_type,
        source_count=len(course.units),
        empty_units=course.empty_units,
        generator=generator.name,
        prompt_version=generator.prompt_version,
        sheet=sheet,
    )
    return as_response(record)


@router.get("/api/sheets", response_model=list[SheetSummary])
def list_sheets(
    tag: str | None = None,
    folder: str | None = None,
    db_path: Path = Depends(get_db_path),
) -> list[SheetSummary]:
    """The library: saved sheets, newest first, narrowed by folder or tag.

    `folder=` with an empty value keeps the sheets that are not filed anywhere,
    which is how the interface shows its "Unfiled" group.
    """
    records = storage.list_all(db_path, tag)
    if folder is not None:
        records = [record for record in records if record.folder == folder]
    return [
        SheetSummary(
            id=record.id,
            created_at=record.created_at,
            title=record.current_sheet.title,
            file_name=record.file_name,
            source_type=record.source_type,
            source_count=record.source_count,
            word_count=count_words(record.current_sheet),
            section_count=len(record.current_sheet.sections),
            # Enough headings to tell two sheets apart at a glance.
            preview=[
                section.title for section in record.current_sheet.sections[:3]
            ],
            folder=record.folder,
            tags=record.tags,
            edited=record.edited,
            generator=record.generator,
            prompt_version=record.prompt_version,
        )
        for record in records
    ]


@router.get("/api/folders", response_model=list[str])
def list_folders(db_path: Path = Depends(get_db_path)) -> list[str]:
    """Every folder in use, so the library can offer them without scanning."""
    return storage.folders(db_path)


@router.put("/api/sheets/{sheet_id}/folder", response_model=StoredSheet)
def move_sheet(
    sheet_id: str, update: FolderUpdate, db_path: Path = Depends(get_db_path)
) -> StoredSheet:
    """File a sheet in a folder, creating it by naming it."""
    found(sheet_id, db_path)
    return as_response(storage.set_folder(db_path, sheet_id, update.folder))


@router.get("/api/sheets/{sheet_id}", response_model=StoredSheet)
def read_sheet(sheet_id: str, db_path: Path = Depends(get_db_path)) -> StoredSheet:
    return as_response(found(sheet_id, db_path))


@router.put("/api/sheets/{sheet_id}/sheet", response_model=StoredSheet)
def edit_sheet(
    sheet_id: str, sheet: StudySheet, db_path: Path = Depends(get_db_path)
) -> StoredSheet:
    """Save the student's version. The version the AI wrote is kept aside."""
    found(sheet_id, db_path)
    return as_response(storage.update_sheet(db_path, sheet_id, sheet))


@router.post("/api/sheets/{sheet_id}/restore", response_model=StoredSheet)
def restore_sheet(sheet_id: str, db_path: Path = Depends(get_db_path)) -> StoredSheet:
    """Undo every edit by putting the AI version back."""
    found(sheet_id, db_path)
    return as_response(storage.restore(db_path, sheet_id))


@router.put("/api/sheets/{sheet_id}/tags", response_model=StoredSheet)
def set_tags(
    sheet_id: str, update: TagsUpdate, db_path: Path = Depends(get_db_path)
) -> StoredSheet:
    found(sheet_id, db_path)
    return as_response(storage.set_tags(db_path, sheet_id, update.tags))


@router.delete("/api/sheets/{sheet_id}", status_code=204)
def delete_sheet(sheet_id: str, db_path: Path = Depends(get_db_path)) -> None:
    found(sheet_id, db_path)
    storage.delete(db_path, sheet_id)
