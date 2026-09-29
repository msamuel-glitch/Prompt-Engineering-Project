"""Data contracts shared by the AI output, the API and the frontend."""

from typing import Literal

from pydantic import BaseModel, Field

SourceType = Literal["page", "slide"]


# The field descriptions below are sent to the model as part of the output
# schema: changing them changes the prompt (see prompts/study-sheet/).
class Section(BaseModel):
    title: str = Field(description="Short heading of the section")
    points: list[str] = Field(
        description="Key ideas of the section, one short sentence or formula each"
    )
    sources: list[int] = Field(
        description="Numbers of the pages or slides this section is based on"
    )


# No docstring on the models sent to the AI: it would become part of the schema.
class StudySheet(BaseModel):
    title: str = Field(description="Title of the course")
    sections: list[Section]


class StudySheetResponse(BaseModel):
    """Result of uploading a course: the sheet and what we know about it."""

    file_name: str
    source_type: SourceType
    source_count: int = Field(description="Number of pages or slides in the file")
    sheet: StudySheet
    word_count: int
    warnings: list[str] = Field(
        description="Problems found by the automatic checks, for the student to review"
    )
    generator: str = Field(description='Model that wrote the sheet, or "fake"')
    prompt_version: str | None


class StoredSheet(StudySheetResponse):
    """A saved sheet: the generation result plus what persistence adds."""

    id: str
    created_at: str
    tags: list[str]
    edited: bool = Field(
        description="True once the student changed the version the AI wrote"
    )


class SheetSummary(BaseModel):
    """One row of the subject library."""

    id: str
    created_at: str
    title: str
    file_name: str
    source_type: SourceType
    source_count: int
    word_count: int
    tags: list[str]
    edited: bool


class TagsUpdate(BaseModel):
    tags: list[str] = Field(description="Subject tags, replacing the current ones")
