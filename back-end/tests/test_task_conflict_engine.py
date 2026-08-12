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

def test_create_task_success():
    headers = get_auth_headers("faculty@sod.edu")
    payload = {
        "title": "Quantum Mechanics Discussion Lead",
        "task_type": "FACULTY",
        "location": "Room 305",
        "scheduled_date": "2026-07-28",  # TUE
        "start_time": "14:00",
        "end_time": "16:00",
        "hourly_rate": 25.0,
        "student_id": "mock-1",
        "assigned_by": "Dr. Zaid Fahad"
    }
    response = client.post("/api/v1/tasks", json=payload, headers=headers)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["status"] == "PENDING"

def test_create_task_schedule_conflict():
    headers = get_auth_headers("faculty@sod.edu")
    # 'mock-1' has PHY101 lecture on MON (09:00 - 11:00)
    payload = {
        "title": "Physics Lab Assistant",
        "task_type": "LAB",
        "location": "Science Lab 201",
        "scheduled_date": "2026-07-27",  # MON
        "start_time": "09:30",
        "end_time": "11:30",
        "hourly_rate": 18.5,
        "student_id": "mock-1",
        "assigned_by": "Dr. Zaid Fahad"
    }
    response = client.post("/api/v1/tasks", json=payload, headers=headers)
    assert response.status_code == 409
    assert "Schedule Conflict" in response.json()["detail"]

def test_create_task_unavailable_slot_conflict():
    headers = get_auth_headers("faculty@sod.edu")
    # 'mock-1' has custom unavailable slot on SUN (10:00 - 12:00)
    payload = {
        "title": "Sunday Library Duty",
        "task_type": "FACULTY",
        "location": "Main Library",
        "scheduled_date": "2026-07-26",  # SUN
        "start_time": "10:30",
        "end_time": "11:30",
        "hourly_rate": 15.0,
        "student_id": "mock-1",
        "assigned_by": "Dr. Zaid Fahad"
    }
    response = client.post("/api/v1/tasks", json=payload, headers=headers)
    assert response.status_code == 409
    assert "custom marked unavailable window" in response.json()["detail"]

def test_get_and_delete_task():
    headers = get_auth_headers("faculty@sod.edu")
    res_list = client.get("/api/v1/tasks", headers=headers)
    assert res_list.status_code == 200
    tasks = res_list.json()
    assert len(tasks) > 0

    target_id = tasks[0]["id"]
    res_get = client.get(f"/api/v1/tasks/{target_id}", headers=headers)
    assert res_get.status_code == 200
    assert res_get.json()["id"] == target_id

    res_del = client.delete(f"/api/v1/tasks/{target_id}", headers=headers)
    assert res_del.status_code == 204
