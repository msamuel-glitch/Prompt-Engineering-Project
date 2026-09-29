"""Automatic checks on a generated sheet, reported to the student as warnings."""

from app.extraction import Course
from app.schemas import StudySheet

# Provisional stand-in for "two A4 pages" until the print view exists; same
# value as the length criterion in prompts/study-sheet/evaluation.md.
WORD_LIMIT = 900


def count_words(sheet: StudySheet) -> int:
    texts = [sheet.title]
    for section in sheet.sections:
        texts.append(section.title)
        texts.extend(section.points)
    return sum(len(text.split()) for text in texts)


def check_sheet(sheet: StudySheet, course: Course) -> list[str]:
    warnings = []
    last = len(course.units)
    empty = set(course.empty_units)
    for section in sheet.sections:
        name = f'Section "{section.title}"'
        if not section.sources:
            warnings.append(f"{name} has no source reference.")
        missing = [n for n in section.sources if not 1 <= n <= last]
        if missing:
            warnings.append(
                f"{name} cites {describe(course, missing)}, beyond the {last} in the file."
            )
        blank = [n for n in section.sources if n in empty]
        if blank:
            warnings.append(
                f"{name} cites {describe(course, blank)}, where no text was found."
            )

    words = count_words(sheet)
    if words > WORD_LIMIT:
        warnings.append(
            f"The sheet has {words} words, more than the {WORD_LIMIT}-word target "
            "for two A4 pages."
        )
    return warnings


def describe(course: Course, numbers: list[int]) -> str:
    """Name pages or slides in a sentence: "page 3" or "pages 3, 7"."""
    noun = course.source_type if len(numbers) == 1 else f"{course.source_type}s"
    return f"{noun} {', '.join(str(n) for n in numbers)}"
