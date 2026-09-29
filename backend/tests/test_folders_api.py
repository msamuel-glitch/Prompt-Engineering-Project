"""Filing sheets in folders, and opening a database made before folders existed."""

import sqlite3

import pytest
from fastapi.testclient import TestClient

from app import storage
from app.generation import FakeSheetGenerator
from app.main import app
from app.sheets import get_generator

client = TestClient(app)


@pytest.fixture(autouse=True)
def fake_generator():
    app.dependency_overrides[get_generator] = FakeSheetGenerator
    yield
    app.dependency_overrides.pop(get_generator, None)


@pytest.fixture
def sheet_id(make_pdf) -> str:
    response = client.post(
        "/api/sheets", files={"file": ("stats.pdf", make_pdf(["Regression\nThe model"]))}
    )
    assert response.status_code == 200
    return response.json()["id"]


def move(sheet_id: str, folder: str):
    return client.put(f"/api/sheets/{sheet_id}/folder", json={"folder": folder})


def test_a_new_sheet_is_unfiled(sheet_id):
    assert client.get(f"/api/sheets/{sheet_id}").json()["folder"] == ""
    assert client.get("/api/folders").json() == []


def test_a_sheet_is_filed_by_naming_its_folder(sheet_id):
    response = move(sheet_id, "  Statistics  ")

    assert response.status_code == 200
    assert response.json()["folder"] == "Statistics"
    assert client.get("/api/folders").json() == ["Statistics"]
    assert client.get("/api/sheets").json()[0]["folder"] == "Statistics"


def test_a_sheet_moves_from_one_folder_to_another(sheet_id):
    move(sheet_id, "Statistics")

    move(sheet_id, "Maths")

    assert client.get("/api/folders").json() == ["Maths"]


def test_an_empty_name_takes_a_sheet_back_out_of_its_folder(sheet_id):
    move(sheet_id, "Statistics")

    assert move(sheet_id, "").json()["folder"] == ""
    assert client.get("/api/folders").json() == []


def test_the_library_can_be_narrowed_to_one_folder(sheet_id, make_pdf):
    move(sheet_id, "Statistics")
    client.post("/api/sheets", files={"file": ("m.pdf", make_pdf(["Marketing\nThe Ps"]))})

    filed = client.get("/api/sheets", params={"folder": "Statistics"}).json()
    unfiled = client.get("/api/sheets", params={"folder": ""}).json()

    assert [row["id"] for row in filed] == [sheet_id]
    assert [row["title"] for row in unfiled] == ["Marketing"]


def test_moving_an_unknown_sheet_is_reported_as_missing():
    assert move("unknown", "Statistics").status_code == 404


def test_a_database_written_before_folders_existed_still_opens(tmp_path):
    """A student's saved sheets must survive the column being added."""
    path = tmp_path / "old.db"
    old_schema = storage.SCHEMA.replace(",\n    folder         TEXT NOT NULL DEFAULT ''", "")
    connection = sqlite3.connect(path)
    connection.execute(old_schema)
    connection.commit()
    connection.close()

    with storage.connect(path) as opened:
        columns = {row[1] for row in opened.execute("PRAGMA table_info(sheets)")}

    assert "folder" in columns
    assert storage.list_all(path) == []
