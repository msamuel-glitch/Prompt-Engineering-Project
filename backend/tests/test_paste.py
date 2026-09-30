import json

import pytest
from fastapi.testclient import TestClient

from app.extraction import Course, CourseUnit
from app.main import app
from app.paste import PASTE_GENERATOR, AnswerError, build_paste_prompt, parse_answer
from app.schemas import Section, StudySheet

client = TestClient(app)

COURSE = Course("slide", [CourseUnit(1, "Regression"), CourseUnit(2, "Model")])
SHEET = StudySheet(
    title="Regression",
    sections=[Section(title="Model", points=["y = a + bx"], sources=[2])],
)


def test_v2_prompt_contains_the_course_and_the_schema():
    prompt, importable = build_paste_prompt(COURSE, "v2")

    assert importable
    assert "[Slide 1]\nRegression\n\n[Slide 2]\nModel" in prompt
    assert "{course_text}" not in prompt and "{schema}" not in prompt
    # The schema carries the field descriptions, as it does through the API.
    assert "Numbers of the pages or slides this section is based on" in prompt


def test_v1_prompt_is_free_text_and_cannot_be_imported():
    prompt, importable = build_paste_prompt(COURSE, "v1")

    assert not importable
    assert "[Slide 2]\nModel" in prompt
    assert "JSON" not in prompt


@pytest.mark.parametrize(
    "answer",
    [
        SHEET.model_dump_json(),
        f"Here is the sheet:\n```json\n{SHEET.model_dump_json(indent=2)}\n```\nGood luck!",
        f"Sure! {SHEET.model_dump_json()} Let me know if you need changes.",
    ],
    ids=["bare JSON", "fenced block with text around", "JSON inside a sentence"],
)
def test_answers_are_read_however_claude_wraps_them(answer):
    assert parse_answer(answer) == SHEET


def test_answer_without_json_is_explained():
    with pytest.raises(AnswerError, match="No JSON object"):
        parse_answer("Sorry, I cannot see the course.")


def test_answer_with_the_wrong_shape_names_the_problem():
    answer = json.dumps({"title": "Regression", "sections": [{"title": "Model"}]})

    with pytest.raises(AnswerError, match=r"sections\.0\.points"):
        parse_answer(answer)


def test_prompt_route_prepares_the_prompt_for_an_uploaded_course(make_pptx):
    data = make_pptx([["Regression", "Model"]])

    response = client.post("/api/sheets/prompt", files={"file": ("course.pptx", data)})

    assert response.status_code == 200
    body = response.json()
    assert body["source_type"] == "slide"
    assert body["prompt_version"] == "v2"
    assert body["importable"] is True
    assert "[Slide 1]\nRegression\nModel" in body["prompt"]


def test_prompt_route_rejects_an_unknown_version(make_pptx):
    data = make_pptx([["Regression", "Model"]])

    response = client.post(
        "/api/sheets/prompt?version=v99", files={"file": ("course.pptx", data)}
    )

    assert response.status_code == 404


def test_import_saves_the_sheet_and_checks_its_sources(make_pptx):
    data = make_pptx([["Regression", "Model"]])
    answer = StudySheet(
        title="Regression",
        sections=[Section(title="Model", points=["y"], sources=[1, 5])],
    ).model_dump_json()

    response = client.post(
        "/api/sheets/import",
        files={"file": ("course.pptx", data)},
        data={"answer": answer, "prompt_version": "v2"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["generator"] == PASTE_GENERATOR
    assert body["prompt_version"] == "v2"
    assert body["warnings"] == ['Section "Model" cites slide 5, beyond the 1 in the file.']
    # Saved like any other sheet: it is in the library.
    library = client.get("/api/sheets").json()
    assert [sheet["id"] for sheet in library] == [body["id"]]


def test_import_of_an_unusable_answer_saves_nothing(make_pptx):
    data = make_pptx([["Regression", "Model"]])

    response = client.post(
        "/api/sheets/import",
        files={"file": ("course.pptx", data)},
        data={"answer": "I could not do it."},
    )

    assert response.status_code == 422
    assert "No JSON object" in response.json()["detail"]
    assert client.get("/api/sheets").json() == []
