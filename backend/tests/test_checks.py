from app.checks import WORD_LIMIT, check_sheet, count_words
from app.extraction import Course, CourseUnit
from app.schemas import Section, StudySheet

COURSE = Course(
    "page", [CourseUnit(1, "Intro"), CourseUnit(2, ""), CourseUnit(3, "Model")]
)


def sheet_with(*sections: Section) -> StudySheet:
    return StudySheet(title="Course", sections=list(sections))


def test_valid_sources_give_no_warning():
    sheet = sheet_with(Section(title="Model", points=["y = a + bx"], sources=[1, 3]))

    assert check_sheet(sheet, COURSE) == []


def test_sources_outside_the_file_are_flagged():
    sheet = sheet_with(Section(title="Model", points=["y"], sources=[3, 7, 0]))

    assert check_sheet(sheet, COURSE) == [
        'Section "Model" cites pages 7, 0, beyond the 3 in the file.'
    ]


def test_sources_without_text_and_missing_sources_are_flagged():
    sheet = sheet_with(
        Section(title="Graph", points=["See figure"], sources=[2]),
        Section(title="Advice", points=["Revise"], sources=[]),
    )

    assert check_sheet(sheet, COURSE) == [
        'Section "Graph" cites page 2, where no text was found.',
        'Section "Advice" has no source reference.',
    ]


def test_sheets_over_the_word_limit_are_flagged():
    long_point = " ".join(["word"] * WORD_LIMIT)
    sheet = sheet_with(Section(title="Long", points=[long_point], sources=[1]))

    warnings = check_sheet(sheet, COURSE)

    assert count_words(sheet) == WORD_LIMIT + 2  # plus the two titles
    assert warnings == [
        f"The sheet has {WORD_LIMIT + 2} words, more than the {WORD_LIMIT}-word "
        "target for two A4 pages."
    ]
