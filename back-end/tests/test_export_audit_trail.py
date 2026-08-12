import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def get_auth_headers(email="faculty@sod.edu"):
    res = client.post(
        "/api/v1/auth/login",
        json={"email_or_dept_id": email, "password": "Password123!"}
    )
    assert res.status_code == 200, res.text
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_download_duty_report_csv():
    headers = get_auth_headers()
    response = client.get("/api/v1/export/report/csv", headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    csv_text = response.text
    assert "Task ID" in csv_text
    assert "Hourly Rate" in csv_text
    assert "Title" in csv_text

def test_get_export_swap_audit_trail():
    headers = get_auth_headers()
    response = client.get("/api/v1/export/swaps/audit-log", headers=headers)
    assert response.status_code == 200
    logs = response.json()
    assert isinstance(logs, list)
