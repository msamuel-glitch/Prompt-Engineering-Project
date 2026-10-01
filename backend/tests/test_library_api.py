import pytest
from fastapi.testclient import TestClient

from app.generation import FakeSheetGenerator
from app.main import app
from app.sheets import get_generator

client = TestClient(app)


@pytest.fixture(autouse=True)
def fake_generator():
    """No test here calls an AI: the placeholder generator is enough."""
    app.dependency_overrides[get_generator] = FakeSheetGenerator
    yield
    app.dependency_overrides.pop(get_generator, None)


@pytest.fixture
def saved(make_pdf):
    """A sheet generated from a two-page course and already saved."""
    response = client.post(
        "/api/sheets",
        files={"file": ("stats.pdf", make_pdf(["Regression\nThe model", "R squared"]))},
    )
    assert response.status_code == 200
    return response.json()


def test_a_generated_sheet_is_saved_and_listed(saved):
    assert saved["edited"] is False
    assert saved["tags"] == []

    library = client.get("/api/sheets").json()

    assert [row["id"] for row in library] == [saved["id"]]
    assert library[0]["title"] == saved["sheet"]["title"]
    assert library[0]["source_count"] == 2


def test_a_library_card_previews_what_the_sheet_covers(saved):
    card = client.get("/api/sheets").json()[0]

    headings = [section["title"] for section in saved["sheet"]["sections"]]
    assert card["section_count"] == len(headings)
    assert card["preview"] == headings[:3]


def test_a_saved_sheet_can_be_read_again(saved):
    again = client.get(f"/api/sheets/{saved['id']}").json()

    assert again == saved


def test_editing_marks_the_sheet_and_keeps_the_ai_version(saved):
    edited = dict(saved["sheet"])
    edited["sections"] = [dict(edited["sections"][0], title="My own wording")]

    response = client.put(f"/api/sheets/{saved['id']}/sheet", json=edited)

    assert response.status_code == 200
    body = response.json()
    assert body["edited"] is True
    assert body["sheet"]["sections"][0]["title"] == "My own wording"
    # The library shows the student's title, not the one the AI wrote.
    assert client.get("/api/sheets").json()[0]["edited"] is True


def test_restoring_brings_back_the_ai_version(saved):
    edited = dict(saved["sheet"], title="Rewritten")
    client.put(f"/api/sheets/{saved['id']}/sheet", json=edited)

    response = client.post(f"/api/sheets/{saved['id']}/restore")

    assert response.status_code == 200
    assert response.json()["sheet"] == saved["sheet"]
    assert response.json()["edited"] is False


def test_checks_are_re_run_on_the_edited_version(saved):
    """Warnings follow the sheet as it is now, not as the AI first wrote it."""
    assert saved["warnings"] == []
    edited = dict(saved["sheet"])
    # The course has two pages, so citing page 9 cannot be right.
    edited["sections"] = [dict(edited["sections"][0], sources=[9])]

    body = client.put(f"/api/sheets/{saved['id']}/sheet", json=edited).json()

    assert body["warnings"] == [
        'Section "Regression" cites page 9, beyond the 2 in the file.'
    ]


def test_tags_are_cleaned_and_filter_the_library(saved):
    response = client.put(
        f"/api/sheets/{saved['id']}/tags",
        json={"tags": ["Statistics", "  Statistics  ", "", "Maths"]},
    )

    assert response.json()["tags"] == ["Statistics", "Maths"]
    assert len(client.get("/api/sheets", params={"tag": "Maths"}).json()) == 1
    assert client.get("/api/sheets", params={"tag": "History"}).json() == []


def test_a_deleted_sheet_leaves_the_library(saved):
    assert client.delete(f"/api/sheets/{saved['id']}").status_code == 204

    assert client.get("/api/sheets").json() == []
    assert client.get(f"/api/sheets/{saved['id']}").status_code == 404


@pytest.mark.parametrize(
    "method,url",
    [
        ("get", "/api/sheets/unknown"),
        ("put", "/api/sheets/unknown/tags"),
        ("post", "/api/sheets/unknown/restore"),
        ("delete", "/api/sheets/unknown"),
    ],
)
def test_an_unknown_sheet_is_reported_as_missing(method, url):
    response = getattr(client, method)(url, **({"json": {"tags": []}} if "tags" in url else {}))

    assert response.status_code == 404
    assert "unknown" in response.json()["detail"]
