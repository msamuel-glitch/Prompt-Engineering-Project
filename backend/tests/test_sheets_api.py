import pytest
from fastapi.testclient import TestClient

from app.generation import FakeSheetGenerator, GenerationError
from app.main import app
from app.schemas import Section, StudySheet
from app.sheets import get_generator

client = TestClient(app)


class FixedGenerator:
    """Returns a given sheet, or raises a given error, without calling any AI."""

    name = "test-model"
    prompt_version = "v2"

    def __init__(self, sheet=None, error=None):
        self._sheet = sheet
        self._error = error

    def generate(self, course):
        if self._error:
            raise self._error
        return self._sheet


@pytest.fixture
def use_generator():
    def install(generator):
        app.dependency_overrides[get_generator] = lambda: generator

    yield install
    app.dependency_overrides.pop(get_generator, None)


def upload(file_name: str, data: bytes):
    return client.post("/api/sheets", files={"file": (file_name, data)})


def test_pdf_upload_returns_a_sheet_with_its_sources(make_pdf, use_generator):
    use_generator(FakeSheetGenerator())

    response = upload("stats.pdf", make_pdf(["Regression\nThe model", "", "R squared"]))

    assert response.status_code == 200
    body = response.json()
    assert body["file_name"] == "stats.pdf"
    assert body["source_type"] == "page"
    assert body["source_count"] == 3
    assert body["generator"] == "fake"
    assert [s["sources"] for s in body["sheet"]["sections"]] == [[1], [3]]
    assert body["warnings"] == ["No text found on page 2 (images or scans?): not sent to the AI."]


def test_invalid_sources_from_the_ai_become_warnings(make_pptx, use_generator):
    sheet = StudySheet(
        title="Course", sections=[Section(title="Model", points=["y"], sources=[9])]
    )
    use_generator(FixedGenerator(sheet))

    response = upload("slides.pptx", make_pptx([["Model", "y = a + bx"]]))

    assert response.status_code == 200
    assert response.json()["warnings"] == [
        'Section "Model" cites slide 9, beyond the 1 in the file.'
    ]


def test_unsupported_file_type_is_rejected(use_generator):
    use_generator(FakeSheetGenerator())

    response = upload("notes.txt", b"plain text")

    assert response.status_code == 415
    assert response.json()["detail"] == "Only PDF and PPTX files are supported."


def test_file_without_text_is_rejected(make_pdf, use_generator):
    use_generator(FakeSheetGenerator())

    response = upload("scan.pdf", make_pdf([""]))

    assert response.status_code == 422
    assert "OCR" in response.json()["detail"]


def test_generation_failure_is_reported(make_pdf, use_generator):
    use_generator(FixedGenerator(error=GenerationError("The AI is unavailable.")))

    response = upload("stats.pdf", make_pdf(["Regression"]))

    assert response.status_code == 502
    assert response.json()["detail"] == "The AI is unavailable."


def test_missing_api_key_is_explained(make_pdf, monkeypatch):
    monkeypatch.setenv("STUDY_SHEET_GENERATOR", "claude")
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_AUTH_TOKEN", raising=False)

    response = upload("stats.pdf", make_pdf(["Regression"]))

    assert response.status_code == 503
    assert "ANTHROPIC_API_KEY" in response.json()["detail"]
