import pytest

from app.extraction import (
    Course,
    CourseUnit,
    ExtractionError,
    UnsupportedFileError,
    extract_course,
)


def test_pdf_pages_are_numbered_from_one(make_pdf):
    course = extract_course("course.pdf", make_pdf(["Introduction\nFirst idea", "Second page"]))

    assert course.source_type == "page"
    assert [unit.number for unit in course.units] == [1, 2]
    assert course.units[0].text == "Introduction\nFirst idea"


def test_pptx_slides_keep_titles_and_numbers(make_pptx):
    data = make_pptx([["Supply", "Definition"], ["Demand", "Curve", "Elasticity"]])

    course = extract_course("Course.PPTX", data)

    assert course.source_type == "slide"
    assert [unit.number for unit in course.units] == [1, 2]
    assert course.units[1].text == "Demand\nCurve\nElasticity"


def test_pages_without_text_are_reported_and_left_out_of_the_prompt(make_pdf):
    course = extract_course("course.pdf", make_pdf(["First", "", "Third"]))

    assert course.empty_units == [2]
    assert course.to_prompt_text() == "[Page 1]\nFirst\n\n[Page 3]\nThird"


def test_prompt_text_uses_slide_markers():
    course = Course("slide", [CourseUnit(1, "Title"), CourseUnit(2, "Point")])

    assert course.to_prompt_text() == "[Slide 1]\nTitle\n\n[Slide 2]\nPoint"


def test_other_file_types_are_rejected():
    with pytest.raises(UnsupportedFileError):
        extract_course("notes.docx", b"anything")


def test_file_without_any_text_is_rejected(make_pdf):
    with pytest.raises(ExtractionError, match="OCR"):
        extract_course("scan.pdf", make_pdf(["", ""]))


@pytest.mark.parametrize("file_name", ["broken.pdf", "broken.pptx"])
def test_damaged_file_gives_a_readable_error(file_name):
    with pytest.raises(ExtractionError, match="could not be read"):
        extract_course(file_name, b"not really a course file")
