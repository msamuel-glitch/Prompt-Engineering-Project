"""POST /api/sheets: upload a course file and get a study sheet."""

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from app.checks import check_sheet, count_words, describe
from app.config import get_settings
from app.extraction import ExtractionError, UnsupportedFileError, extract_course
from app.generation import (
    ClaudeSheetGenerator,
    FakeSheetGenerator,
    GenerationError,
    SheetGenerator,
)
from app.prompts import PromptNotFoundError, load_prompt
from app.schemas import StudySheetResponse

MAX_FILE_BYTES = 30 * 1024 * 1024
# About 75,000 tokens: bounds the cost of one request. Longer courses need a
# strategy such as splitting, still to be decided (see PROJECT_BRIEF.md).
MAX_COURSE_CHARACTERS = 300_000

router = APIRouter()


def get_generator() -> SheetGenerator:
    settings = get_settings()
    if settings.generator == "fake":
        return FakeSheetGenerator()
    if settings.generator != "claude":
        raise HTTPException(
            500, 'STUDY_SHEET_GENERATOR must be "claude" or "fake" in backend/.env.'
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


@router.post("/api/sheets", response_model=StudySheetResponse)
def create_sheet(
    file: UploadFile, generator: SheetGenerator = Depends(get_generator)
) -> StudySheetResponse:
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

    warnings = []
    if course.empty_units:
        warnings.append(
            f"No text found on {describe(course, course.empty_units)} (images or "
            "scans?): not sent to the AI."
        )
    warnings.extend(check_sheet(sheet, course))

    return StudySheetResponse(
        file_name=file_name,
        source_type=course.source_type,
        source_count=len(course.units),
        sheet=sheet,
        word_count=count_words(sheet),
        warnings=warnings,
        generator=generator.name,
        prompt_version=generator.prompt_version,
    )
