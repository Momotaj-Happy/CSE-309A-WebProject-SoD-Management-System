from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    STUDENT = "STUDENT"
    FACULTY = "FACULTY"
    LAB_MGR = "LAB_MGR"
    DEPT_MGR = "DEPT_MGR"


class UserBase(BaseModel):
    dept_id: str = Field(..., description="Unique Department ID, e.g. SOD-2024-001")
    email: EmailStr = Field(..., description="Institutional Email Address")
    full_name: str = Field(..., description="User's Full Name")
    role: UserRole = Field(default=UserRole.STUDENT, description="System Role")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")


class UserLogin(BaseModel):
    email_or_dept_id: str = Field(..., description="Email address or Department ID")
    password: str = Field(..., description="User Password")


class UserResponse(UserBase):
    id: str
    created_at: str

    class Config:
        from_attributes = True


class UserUpdateRole(BaseModel):
    user_id: str = Field(..., description="Target User ID")
    role: UserRole = Field(..., description="New User Role")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
