import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def get_auth_headers(email="student@sod.edu"):
    res = client.post(
        "/api/v1/auth/login",
        json={"email_or_dept_id": email, "password": "Password123!"}
    )
    assert res.status_code == 200, res.text
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_student_billing_lifecycle():
    student_headers = get_auth_headers("student@sod.edu")
    faculty_headers = get_auth_headers("faculty@sod.edu")
    manager_headers = get_auth_headers("deptmgr@sod.edu")

    # 1. Student reads current bill
    res_cur = client.get("/api/v1/bills/my-current", headers=student_headers)
    assert res_cur.status_code == 200
    bill = res_cur.json()
    assert "student_id" in bill
    assert "total_amount" in bill

    # 2. Student submits monthly bill
    res_sub = client.post(
        "/api/v1/bills/submit",
        headers=student_headers,
        json={"month": "July", "year": 2026, "notes": "Completed quantum lab research hours."}
    )
    assert res_sub.status_code == 201
    sub_data = res_sub.json()
    assert sub_data["status"] == "SUBMITTED"
    bill_id = sub_data["bill_id"]

    # 3. Faculty reads pending bills
    res_pend_fac = client.get("/api/v1/bills/pending", headers=faculty_headers)
    assert res_pend_fac.status_code == 200
    pending_fac = res_pend_fac.json()
    assert any(b["bill_id"] == bill_id for b in pending_fac)

    # 4. Faculty verifies bill
    res_ver = client.patch(
        f"/api/v1/bills/{bill_id}/verify",
        headers=faculty_headers,
        json={"action": "VERIFY", "notes": "Task log notes verified."}
    )
    assert res_ver.status_code == 200
    ver_data = res_ver.json()
    assert ver_data["status"] == "VERIFIED"

    # 5. Manager approves bill
    res_app = client.patch(
        f"/api/v1/bills/{bill_id}/approve",
        headers=manager_headers,
        json={"action": "APPROVE", "notes": "Approved for departmental payout."}
    )
    assert res_app.status_code == 200
    app_data = res_app.json()
    assert app_data["status"] == "APPROVED"
