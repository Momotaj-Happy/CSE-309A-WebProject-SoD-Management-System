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

def test_create_and_list_shift_swaps():
    token = get_student_token()
    payload = {
        "task_id": "task-2",
        "reason": "Midterm exam invigilation conflict with PHY301"
    }

    res = client.post(
        "/api/v1/tasks/swaps",
        headers={"Authorization": f"Bearer {token}"},
        json=payload
    )
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "OPEN"
    assert data["reason"] == "Midterm exam invigilation conflict with PHY301"
    swap_id = data["swap_id"]

    list_res = client.get("/api/v1/tasks/swaps/?status=OPEN", headers={"Authorization": f"Bearer {token}"})
    assert list_res.status_code == 200
    swaps = list_res.json()
    assert any(s["swap_id"] == swap_id for s in swaps)

def test_accept_shift_swap():
    token_stu = get_student_token()
    token_fac = get_faculty_token()
    list_res = client.get("/api/v1/tasks/swaps/?status=OPEN", headers={"Authorization": f"Bearer {token_stu}"})
    assert list_res.status_code == 200
    open_swaps = list_res.json()
    assert len(open_swaps) > 0
    target_swap = open_swaps[0]

    accept_res = client.post(
        f"/api/v1/tasks/swaps/{target_swap['swap_id']}/accept",
        headers={"Authorization": f"Bearer {token_fac}"}
    )
    assert accept_res.status_code == 200
    acc_data = accept_res.json()
    assert acc_data["status"] == "ACCEPTED"
    assert acc_data["acceptor_name"] == "Dr. Zaid Fahad"

def test_cancel_shift_swap():
    token = get_student_token()
    payload = {
        "task_id": "task-3",
        "reason": "Personal family emergency"
    }

    create_res = client.post(
        "/api/v1/tasks/swaps",
        headers={"Authorization": f"Bearer {token}"},
        json=payload
    )
    assert create_res.status_code == 201
    swap_id = create_res.json()["swap_id"]

    cancel_res = client.delete(
        f"/api/v1/tasks/swaps/{swap_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert cancel_res.status_code == 204

def test_get_audit_trail():
    token = get_student_token()
    res = client.get("/api/v1/tasks/swaps/audit-log", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)
    assert len(logs) > 0
    event_types = [l["event_type"] for l in logs]
    assert "SWAP_CREATED" in event_types

if __name__ == "__main__":
    print("Running Shift Swap Engine unit tests...")
    test_create_and_list_shift_swaps()
    test_accept_shift_swap()
    test_cancel_shift_swap()
    test_get_audit_trail()
    print("SHIFT SWAP BACKEND TESTS PASSED SUCCESSFULLY!")
