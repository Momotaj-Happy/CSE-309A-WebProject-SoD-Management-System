# Issue #36: Implement User Management Feature (Auth & Role-Based Access Control)

## Issue Overview
- **Issue ID:** #36
- **Feature Name:** User Management & Authentication System
- **Epic:** Epic E1 - Authentication and Role Management
- **Mapped FRs:** `FR-AUTH-01`, `FR-AUTH-02`, `FR-AUTH-03`
- **Mapped USs:** `US-001`, `US-002`, `US-003`

---

## Objectives
1. Implement secure user registration with Department ID, Email, Password, Full Name, and System Role.
2. Implement JWT-based authentication for user login and session verification (`/api/v1/auth/login`, `/api/v1/users/me`).
3. Implement Role-Based Access Control (RBAC) supporting four roles:
   - `STUDENT` (SoD Student)
   - `FACULTY` (Faculty Member)
   - `LAB_MGR` (Lab Manager)
   - `DEPT_MGR` (Department Manager)
4. Implement Admin/Manager API & UI for role assignment, user search, filtering, and profile updates (`PATCH /api/v1/admin/roles`, `GET /api/v1/users`).
5. Build a modern, responsive React + TypeScript frontend with a rich UI for Auth (Login/Register) and User Management directory.

---

## Acceptance Criteria
- [x] `POST /api/v1/auth/register` creates a user record with hashed password, validating unique `dept_id` and `email`.
- [x] `POST /api/v1/auth/login` verifies credentials and returns a signed JWT access token.
- [x] `GET /api/v1/users/me` retrieves authenticated user profile using Bearer JWT.
- [x] `GET /api/v1/users` lists all users with role and search filtering.
- [x] `PATCH /api/v1/admin/roles` updates user roles (restricted to Manager/Admin roles).
- [x] React frontend features interactive Login, Registration, User Profile, and User Management Directory with RBAC visualizer.

---

## Implementation Tasks
- [x] Create feature branch `36-implement-user-management-feature`
- [x] Backend: Create User Pydantic models & schemas (`back-end/api/models/user.py`)
- [x] Backend: Create Security & JWT token services (`back-end/api/services/auth_service.py`)
- [x] Backend: Create User service & data store (`back-end/api/services/user_service.py`)
- [x] Backend: Implement Auth & User routes (`back-end/api/routes/auth.py`, `back-end/api/routes/users.py`)
- [x] Backend: Mount routes in `back-end/main.py` with CORS support
- [x] Frontend: Build Auth Context & API client (`front-end/src/context/AuthContext.tsx`, `front-end/src/services/api.ts`)
- [x] Frontend: Build Login & Register forms (`front-end/src/components/LoginForm.tsx`, `front-end/src/components/RegisterForm.tsx`)
- [x] Frontend: Build User Directory & Role Management UI (`front-end/src/components/UserDirectory.tsx`, `front-end/src/components/UserProfile.tsx`)
- [x] Frontend: Create modern CSS styling with theme tokens (`front-end/src/index.css`)
- [x] Verification: Run backend server tests & frontend build checks
