import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def get_student_token():
    res = client.post(
        "/api/v1/auth/login",
        json={"email_or_dept_id": "student@sod.edu", "password": "Password123!"}
    )
    assert res.status_code == 200
    return res.json()["access_token"]


def get_faculty_token():
    res = client.post(
        "/api/v1/auth/login",
        json={"email_or_dept_id": "faculty@sod.edu", "password": "Password123!"}
    )
    assert res.status_code == 200
    return res.json()["access_token"]


def test_parse_raw_schedule():
    raw_text = "PHY101 Mechanics 01 Room201 MON:09:00-11:00"
    res = client.post("/api/v1/schedule/parse", json={"raw_text": raw_text})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["courses"]) >= 1


def test_save_and_get_schedule():
    token = get_student_token()
    courses_payload = {
        "courses": [
            {
                "id": "CSE309",
                "name": "Web Systems Engineering",
                "section": "1",
                "room": "Lab303",
                "days": "MON,WED",
                "time": "10:00 - 12:00"
            }
        ]
    }

    # Save schedule
    save_res = client.post(
        "/api/v1/schedule/save",
        headers={"Authorization": f"Bearer {token}"},
        json=courses_payload
    )
    assert save_res.status_code == 201
    save_data = save_res.json()
    assert save_data["success"] is True
    assert any(c["id"] == "CSE309" for c in save_data["courses"])

    # Get my schedule
    get_res = client.get(
        "/api/v1/schedule/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert any(c["id"] == "CSE309" for c in get_data["courses"])


def test_unavailable_slot_crud():
    token = get_student_token()
    slot_payload = {
        "day": "SAT",
        "start_time": "14:00",
        "end_time": "16:00",
        "note": "Lab Research Meeting"
    }

    # Create unavailable slot
    create_res = client.post(
        "/api/v1/schedule/unavailable",
        headers={"Authorization": f"Bearer {token}"},
        json=slot_payload
    )
    assert create_res.status_code == 201
    created_slot = create_res.json()
    assert created_slot["day"] == "SAT"
    assert created_slot["note"] == "Lab Research Meeting"
    slot_id = created_slot["id"]

    # Delete unavailable slot
    del_res = client.delete(
        f"/api/v1/schedule/unavailable/{slot_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert del_res.status_code == 204


def test_faculty_inspect_student_schedule():
    fac_token = get_faculty_token()
    users = client.get("/api/v1/users?search=student@sod.edu", headers={"Authorization": f"Bearer {fac_token}"}).json()
    student_id = users[0]["id"]

    res = client.get(
        f"/api/v1/schedule/student/{student_id}",
        headers={"Authorization": f"Bearer {fac_token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "courses" in data


if __name__ == "__main__":
    print("Running Schedule Engine unit tests...")
    test_parse_raw_schedule()
    test_save_and_get_schedule()
    test_unavailable_slot_crud()
    test_faculty_inspect_student_schedule()
    print("SCHEDULE ENGINE BACKEND TESTS PASSED SUCCESSFULLY!")
