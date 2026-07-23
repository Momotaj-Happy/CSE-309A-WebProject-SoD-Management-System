import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict
from api.models.user import UserCreate, UserResponse, UserRole, UserBase
from api.services.auth_service import hash_password, verify_password

# In-Memory Storage seeded with initial demo users
_USERS_DB: Dict[str, dict] = {}


def _init_demo_users():
    """Seeds demo users for all 4 roles if database is empty."""
    if _USERS_DB:
        return

    demo_users = [
        {
            "dept_id": "SOD-2024-001",
            "email": "student@sod.edu",
            "password": "Password123!",
            "full_name": "Momotaj Happy",
            "role": UserRole.STUDENT
        },
        {
            "dept_id": "FAC-2024-101",
            "email": "faculty@sod.edu",
            "password": "Password123!",
            "full_name": "Dr. Zaid Fahad",
            "role": UserRole.FACULTY
        },
        {
            "dept_id": "LBM-2024-201",
            "email": "labmgr@sod.edu",
            "password": "Password123!",
            "full_name": "Sarah Connor",
            "role": UserRole.LAB_MGR
        },
        {
            "dept_id": "DPM-2024-301",
            "email": "deptmgr@sod.edu",
            "password": "Password123!",
            "full_name": "Prof. Charles Xavier",
            "role": UserRole.DEPT_MGR
        }
    ]

    for u in demo_users:
        user_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        _USERS_DB[user_id] = {
            "id": user_id,
            "dept_id": u["dept_id"],
            "email": u["email"].lower(),
            "password_hash": hash_password(u["password"]),
            "full_name": u["full_name"],
            "role": u["role"],
            "created_at": created_at
        }


# Call initializer
_init_demo_users()


class UserService:
    @staticmethod
    def get_by_id(user_id: str) -> Optional[UserResponse]:
        user_data = _USERS_DB.get(user_id)
        if not user_data:
            return None
        return UserResponse(
            id=user_data["id"],
            dept_id=user_data["dept_id"],
            email=user_data["email"],
            full_name=user_data["full_name"],
            role=user_data["role"],
            created_at=user_data["created_at"]
        )

    @staticmethod
    def get_by_email(email: str) -> Optional[dict]:
        email_clean = email.lower().strip()
        for user in _USERS_DB.values():
            if user["email"] == email_clean:
                return user
        return None

    @staticmethod
    def get_by_dept_id(dept_id: str) -> Optional[dict]:
        dept_clean = dept_id.upper().strip()
        for user in _USERS_DB.values():
            if user["dept_id"].upper() == dept_clean:
                return user
        return None

    @staticmethod
    def get_all(role_filter: Optional[str] = None, search: Optional[str] = None) -> List[UserResponse]:
        results = []
        for user in _USERS_DB.values():
            if role_filter and user["role"] != role_filter:
                continue
            if search:
                s = search.lower()
                matches = (
                    s in user["full_name"].lower() or
                    s in user["email"].lower() or
                    s in user["dept_id"].lower()
                )
                if not matches:
                    continue

            results.append(
                UserResponse(
                    id=user["id"],
                    dept_id=user["dept_id"],
                    email=user["email"],
                    full_name=user["full_name"],
                    role=user["role"],
                    created_at=user["created_at"]
                )
            )
        return results

    @staticmethod
    def create_user(user_create: UserCreate) -> UserResponse:
        user_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        user_entry = {
            "id": user_id,
            "dept_id": user_create.dept_id.upper().strip(),
            "email": user_create.email.lower().strip(),
            "password_hash": hash_password(user_create.password),
            "full_name": user_create.full_name.strip(),
            "role": user_create.role,
            "created_at": created_at
        }
        _USERS_DB[user_id] = user_entry

        return UserResponse(
            id=user_id,
            dept_id=user_entry["dept_id"],
            email=user_entry["email"],
            full_name=user_entry["full_name"],
            role=user_entry["role"],
            created_at=user_entry["created_at"]
        )

    @staticmethod
    def update_role(user_id: str, new_role: UserRole) -> Optional[UserResponse]:
        if user_id not in _USERS_DB:
            return None
        _USERS_DB[user_id]["role"] = new_role
        user_data = _USERS_DB[user_id]

        return UserResponse(
            id=user_data["id"],
            dept_id=user_data["dept_id"],
            email=user_data["email"],
            full_name=user_data["full_name"],
            role=user_data["role"],
            created_at=user_data["created_at"]
        )

    @staticmethod
    def delete_user(user_id: str) -> bool:
        if user_id in _USERS_DB:
            del _USERS_DB[user_id]
            return True
        return False
