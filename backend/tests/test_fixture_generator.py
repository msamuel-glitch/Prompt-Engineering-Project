"""The recorded sheet served when no API key is available."""

import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.extraction import extract_course
from app.generation import FixtureSheetGenerator
from app.main import app

client = TestClient(app)
COURSE = "../prompts/examples/synthetic_course_regression_fr.pptx"


@pytest.fixture
def recorded_course() -> bytes:
    with open(COURSE, "rb") as handle:
        return handle.read()


@pytest.fixture
def generator() -> FixtureSheetGenerator:
    return FixtureSheetGenerator(get_settings().fixture_path)


def test_the_recording_is_served_for_the_course_it_was_made_from(
    generator, recorded_course
):
    sheet = generator.generate(extract_course("course.pptx", recorded_course))

    assert generator.prompt_version == "v2"
    assert "Régression linéaire simple" in sheet.title
    assert len(sheet.sections) == 7


def test_the_recording_never_reaches_a_sheet_about_another_course(
    generator, make_pdf
):
    """The invariant behind the fallback, checked from the recording's side.

    What happens instead is in test_fixture_fallback.py; what must never happen
    is that a sheet about one course carries content recorded from another.
    """
    other = extract_course("other.pdf", make_pdf(["Marketing and the four Ps"]))

    sheet = generator.generate(other)

    recorded = {section.title for section in generator._sheet.sections}
    assert {section.title for section in sheet.sections}.isdisjoint(recorded)


def test_the_recording_never_cites_the_slides_it_should_not(generator, recorded_course):
    """Slide 6 lost its graph, 11 is exam logistics and 12 is empty."""
    sheet = generator.generate(extract_course("course.pptx", recorded_course))

    cited = {number for section in sheet.sections for number in section.sources}

    assert cited.isdisjoint({6, 11, 12})


def test_the_api_reports_the_sheet_as_recorded_not_generated(
    monkeypatch, recorded_course
):
    monkeypatch.setenv("STUDY_SHEET_GENERATOR", "fixture")

    response = client.post(
        "/api/sheets", files={"file": ("course.pptx", recorded_course)}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["generator"] == "fixture"
    assert body["prompt_version"] == "v2"
    assert body["warnings"] == []


def test_an_unknown_generator_name_is_explained(monkeypatch, make_pdf):
    monkeypatch.setenv("STUDY_SHEET_GENERATOR", "magic")

    response = client.post("/api/sheets", files={"file": ("c.pdf", make_pdf(["Text"]))})

    assert response.status_code == 500
    assert "fixture" in response.json()["detail"]
