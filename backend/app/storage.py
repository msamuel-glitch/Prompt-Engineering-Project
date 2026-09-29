"""Saved study sheets, in a local SQLite file.

A record keeps two versions of the sheet: the one the AI wrote, which is never
modified, and the one the student edits. Restoring the AI version is therefore
copying the first over the second.

Word count and warnings are not stored. They are derived from the current sheet
each time a record is read, so an edited sheet can never carry the checks of an
older version.
"""

import json
import sqlite3
import uuid
from collections.abc import Iterator
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from app.extraction import Course, CourseUnit
from app.schemas import SourceType, StudySheet

SCHEMA = """
CREATE TABLE IF NOT EXISTS sheets (
    id             TEXT PRIMARY KEY,
    created_at     TEXT NOT NULL,
    file_name      TEXT NOT NULL,
    source_type    TEXT NOT NULL,
    source_count   INTEGER NOT NULL,
    empty_units    TEXT NOT NULL,
    generator      TEXT NOT NULL,
    prompt_version TEXT,
    original_sheet TEXT NOT NULL,
    current_sheet  TEXT NOT NULL,
    tags           TEXT NOT NULL
)
"""


class SheetNotFoundError(Exception):
    """No saved sheet has that identifier."""


@dataclass
class Record:
    id: str
    created_at: str
    file_name: str
    source_type: SourceType
    source_count: int
    empty_units: list[int]
    generator: str
    prompt_version: str | None
    original_sheet: StudySheet
    current_sheet: StudySheet
    tags: list[str]

    @property
    def edited(self) -> bool:
        return self.current_sheet != self.original_sheet

    def course(self) -> Course:
        """A stand-in course for re-running the checks after an edit.

        The original file is not kept, so the units carry no real text. The
        checks only look at how many units there are and which ones were empty,
        which is exactly what is stored here.
        """
        empty = set(self.empty_units)
        units = [
            CourseUnit(number=number, text="" if number in empty else "-")
            for number in range(1, self.source_count + 1)
        ]
        return Course(source_type=self.source_type, units=units)


@contextmanager
def connect(path: Path) -> Iterator[sqlite3.Connection]:
    """Open the database, creating the file and the table if needed.

    sqlite3's own connection context manager commits but does not close, which
    leaves the file locked on Windows; this one does both.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    try:
        connection.execute(SCHEMA)
        yield connection
        connection.commit()
    finally:
        connection.close()


def _to_record(row: sqlite3.Row) -> Record:
    return Record(
        id=row["id"],
        created_at=row["created_at"],
        file_name=row["file_name"],
        source_type=row["source_type"],
        source_count=row["source_count"],
        empty_units=json.loads(row["empty_units"]),
        generator=row["generator"],
        prompt_version=row["prompt_version"],
        original_sheet=StudySheet.model_validate_json(row["original_sheet"]),
        current_sheet=StudySheet.model_validate_json(row["current_sheet"]),
        tags=json.loads(row["tags"]),
    )


def save(
    path: Path,
    *,
    file_name: str,
    source_type: SourceType,
    source_count: int,
    empty_units: list[int],
    generator: str,
    prompt_version: str | None,
    sheet: StudySheet,
    tags: list[str] | None = None,
) -> Record:
    """Store a freshly generated sheet as both the AI version and the current one."""
    record_id = uuid.uuid4().hex
    created_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    sheet_json = sheet.model_dump_json()
    with connect(path) as connection:
        connection.execute(
            "INSERT INTO sheets VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                record_id,
                created_at,
                file_name,
                source_type,
                source_count,
                json.dumps(empty_units),
                generator,
                prompt_version,
                sheet_json,
                sheet_json,
                json.dumps(tags or []),
            ),
        )
    return get(path, record_id)


def get(path: Path, record_id: str) -> Record:
    with connect(path) as connection:
        row = connection.execute(
            "SELECT * FROM sheets WHERE id = ?", (record_id,)
        ).fetchone()
    if row is None:
        raise SheetNotFoundError(f"No saved sheet with id {record_id}.")
    return _to_record(row)


def list_all(path: Path, tag: str | None = None) -> list[Record]:
    """Saved sheets, newest first, optionally only those carrying a tag."""
    with connect(path) as connection:
        rows = connection.execute(
            "SELECT * FROM sheets ORDER BY created_at DESC, rowid DESC"
        ).fetchall()
    records = [_to_record(row) for row in rows]
    if tag is None:
        return records
    return [record for record in records if tag in record.tags]


def _update(path: Path, record_id: str, column: str, value: str) -> Record:
    with connect(path) as connection:
        changed = connection.execute(
            f"UPDATE sheets SET {column} = ? WHERE id = ?", (value, record_id)
        ).rowcount
    if changed == 0:
        raise SheetNotFoundError(f"No saved sheet with id {record_id}.")
    return get(path, record_id)


def update_sheet(path: Path, record_id: str, sheet: StudySheet) -> Record:
    """Replace the student's version; the AI version is left untouched."""
    return _update(path, record_id, "current_sheet", sheet.model_dump_json())


def restore(path: Path, record_id: str) -> Record:
    """Put the AI version back as the student's version."""
    record = get(path, record_id)
    return update_sheet(path, record_id, record.original_sheet)


def set_tags(path: Path, record_id: str, tags: list[str]) -> Record:
    cleaned = list(dict.fromkeys(tag.strip() for tag in tags if tag.strip()))
    return _update(path, record_id, "tags", json.dumps(cleaned))


def delete(path: Path, record_id: str) -> None:
    with connect(path) as connection:
        changed = connection.execute(
            "DELETE FROM sheets WHERE id = ?", (record_id,)
        ).rowcount
    if changed == 0:
        raise SheetNotFoundError(f"No saved sheet with id {record_id}.")
