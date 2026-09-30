from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_ok_and_the_generator(monkeypatch):
    monkeypatch.setenv("STUDY_SHEET_GENERATOR", "fixture")
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_AUTH_TOKEN", raising=False)

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "generator": "fixture", "has_api_key": False}


def test_health_says_whether_a_key_is_set_without_revealing_it(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant-test-value")

    body = client.get("/api/health").json()

    assert body["has_api_key"] is True
    assert "sk-ant-test-value" not in str(body)


def test_openapi_schema_lists_health_route():
    # The frontend's TypeScript types will be generated from this schema.
    response = client.get("/openapi.json")

    assert response.status_code == 200
    assert "/api/health" in response.json()["paths"]
