"""Upload and health API tests."""

import io


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_upload_csv(client):
    csv_content = b"region,revenue,month\nNorth,50000,2024-01\nSouth,30000,2024-01"
    response = client.post(
        "/api/upload/",
        files={"file": ("test_sales.csv", io.BytesIO(csv_content), "text/csv")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert data["row_count"] == 2
    assert len(data["starter_questions"]) > 0


def test_upload_non_csv_rejected(client):
    response = client.post(
        "/api/upload/",
        files={"file": ("file.txt", io.BytesIO(b"not a csv"), "text/plain")},
    )
    assert response.status_code == 400


def test_default_session_available(client):
    r = client.get("/api/upload/default-session")
    assert r.status_code == 200
    data = r.json()
    assert data.get("available") is True
    assert data["session_id"] == "natwest-demo"
    assert "session_natwest_demo" in data["table_name"]
