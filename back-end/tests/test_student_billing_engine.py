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


def test_get_current_bill():
    token = get_student_token()
    res = client.get(
        "/api/v1/bills/my-current?month_year=2026-07",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "bill_id" in data
    assert "total_hours" in data
    assert "total_amount" in data
    assert data["month_year"] == "2026-07"


def test_submit_monthly_bill():
    token = get_student_token()
    payload = {"month_year": "2026-07"}
    res = client.post(
        "/api/v1/bills/submit",
        headers={"Authorization": f"Bearer {token}"},
        json=payload
    )
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "SUBMITTED"
    assert data["submitted_at"] is not None


def test_student_bill_history():
    token = get_student_token()
    res = client.get(
        "/api/v1/bills/student/mock-1",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    bills = res.json()
    assert isinstance(bills, list)
    assert len(bills) >= 1


if __name__ == "__main__":
    print("Running Student Monthly Billing unit tests...")
    test_get_current_bill()
    test_submit_monthly_bill()
    test_student_bill_history()
    print("STUDENT MONTHLY BILLING TESTS PASSED SUCCESSFULLY!")
