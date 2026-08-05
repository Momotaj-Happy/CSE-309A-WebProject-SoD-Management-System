import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"


def test_login_demo_user():
    response = client.post(
        "/api/v1/auth/login",
        json={"email_or_dept_id": "student@sod.edu", "password": "Password123!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "STUDENT"
    assert data["user"]["dept_id"] == "SOD-2024-001"
    return data["access_token"]


def test_register_new_user():
    new_user = {
        "dept_id": "TEST-SOD-999",
        "email": "newstudent@sod.edu",
        "password": "SecurePassword123",
        "full_name": "Test Student",
        "role": "STUDENT"
    }
    response = client.post("/api/v1/auth/register", json=new_user)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newstudent@sod.edu"


def test_get_current_user_profile():
    token = test_login_demo_user()
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    user = response.json()
    assert user["email"] == "student@sod.edu"


def test_list_and_filter_users():
    token = test_login_demo_user()
    response = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    users = response.json()
    assert len(users) >= 4

    # Test filtering by role
    res_faculty = client.get(
        "/api/v1/users?role=FACULTY",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res_faculty.status_code == 200
    assert all(u["role"] == "FACULTY" for u in res_faculty.json())


def test_update_role_permission():
    # Login as Dept Manager to update role
    res_login = client.post(
        "/api/v1/auth/login",
        json={"email_or_dept_id": "deptmgr@sod.edu", "password": "Password123!"}
    )
    mgr_token = res_login.json()["access_token"]

    # Register target user
    client.post("/api/v1/auth/register", json={
        "dept_id": "PROMO-001",
        "email": "promoted@sod.edu",
        "password": "Password123!",
        "full_name": "Promoted User",
        "role": "STUDENT"
    })

    # Find ID of promoted user
    users = client.get("/api/v1/users?search=promoted@sod.edu", headers={"Authorization": f"Bearer {mgr_token}"}).json()
    target_id = users[0]["id"]

    # Update role to FACULTY
    patch_res = client.patch(
        "/api/v1/admin/roles",
        headers={"Authorization": f"Bearer {mgr_token}"},
        json={"user_id": target_id, "role": "FACULTY"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["role"] == "FACULTY"


if __name__ == "__main__":
    print("Running automated backend tests...")
    test_root_endpoint()
    test_login_demo_user()
    test_register_new_user()
    test_get_current_user_profile()
    test_list_and_filter_users()
    test_update_role_permission()
    print("ALL BACKEND TESTS PASSED SUCCESSFULLY!")
