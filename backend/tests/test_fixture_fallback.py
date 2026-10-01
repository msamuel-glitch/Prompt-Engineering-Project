"""What the fixture generator does with a course it has no recording for."""

import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.extraction import extract_course
from app.generation import FixtureSheetGenerator
from app.main import app

client = TestClient(app)


@pytest.fixture
def generator() -> FixtureSheetGenerator:
    return FixtureSheetGenerator(get_settings().fixture_path)


def test_another_course_gets_a_placeholder_rather_than_the_wrong_sheet(
    generator, make_pdf
):
    other = extract_course("lecture.pdf", make_pdf(["Marketing\nThe four Ps"]))

    sheet = generator.generate(other)

    # The recording is about regression: nothing of it may reach this sheet.
    assert "Régression" not in sheet.title
    assert sheet.title == "Marketing"


def test_the_fallback_is_reported_as_a_placeholder_not_as_the_recording(
    generator, make_pdf
):
    """A sheet must never claim to be the recording when it is not."""
    generator.generate(extract_course("lecture.pdf", make_pdf(["Marketing\nThe Ps"])))

    assert generator.name == "fake"
    assert generator.prompt_version is None


def test_the_recorded_course_still_gets_the_recording(generator):
    with open("../prompts/examples/synthetic_course_regression_fr.pptx", "rb") as handle:
        course = extract_course("course.pptx", handle.read())

    sheet = generator.generate(course)

    assert generator.name == "fixture"
    assert generator.prompt_version == "v2"
    assert len(sheet.sections) == 7


def test_the_api_accepts_any_course_in_fixture_mode(monkeypatch, make_pdf):
    monkeypatch.setenv("STUDY_SHEET_GENERATOR", "fixture")

    response = client.post(
        "/api/sheets", files={"file": ("lecture.pdf", make_pdf(["Marketing\nThe Ps"]))}
    )

    assert response.status_code == 200
    assert response.json()["generator"] == "fake"
