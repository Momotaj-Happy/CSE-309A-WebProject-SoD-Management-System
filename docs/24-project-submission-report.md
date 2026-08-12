# Final Project Submission Report

**Independent University, Bangladesh**  
**Department of Computer Science & Engineering**  
**CSE309: Web Application & Internet**  
**Semester:** Summer 2026  

---

### **Submission Information**
* **Submitted By:** Zaid Fahad
* **Student ID:** [Insert Student ID Here]
* **Section:** [Insert Section Here]
* **Team Number:** [Insert Team Number Here]
* **Project Title:** Departmental Student on Duty (SoD) Management System
* **GitHub Repository:** [https://github.com/Momotaj-Happy/CSE-309A-WebProject-SoD-Management-System](https://github.com/Momotaj-Happy/CSE-309A-WebProject-SoD-Management-System)
* **Submitted To:** Sayef Reyadh, Adjunct Lecturer, Department of Computer Science & Engineering, Independent University, Bangladesh
* **Date of Submission:** August 12, 2026

---

## 1. Project Overview

The **Departmental Student on Duty (SoD) Management System** is a full-stack web platform engineered for the Department of Physical Science at Independent University, Bangladesh (IUB). The system automates and streamlines student duty tracking, academic schedule parsing, shift proxy/swap workflows, and monthly financial bill processing.

### Problem Solved
Previously, departmental student duty management relied on manual paper rosters, untracked peer-to-peer shift swaps, and error-prone monthly paper billing. This resulted in scheduling conflicts with academic lectures, lack of visibility into duty completions, delays in financial approvals, and administrative overhead. The SoD Management System replaces these manual processes with an intelligent orchestration engine featuring automated schedule conflict validation, role-based access control (RBAC), and a multi-tier financial approval pipeline (Student → Faculty → Department Manager).

### Main Features
1. **Authentication & Role-Based Access Control (RBAC):** Secure JWT authentication supporting `STUDENT`, `FACULTY`, and `MANAGER` roles with customized interfaces and route protection.
2. **IRAS Academic Schedule Parser:** Enables students to upload or import class schedules, automatically mapping lecture slots onto an interactive weekly timetable grid.
3. **Duty Task Assignment & Conflict Detection Engine:** Allows faculty and managers to create duty tasks while automatically validating incoming task times against student class schedules and custom unavailable windows (blocking overlapping assignments with HTTP 409 Conflict).
4. **Shift Swap Proxy Engine & Audit Trail:** Provides a peer-to-peer shift swap feed where students can offer, request, or accept duty proxy shifts with complete immutable audit logs.
5. **Student Billing & Multi-Tier Financial Approvals:** Automatically aggregates completed duty task hours into monthly billing summaries for student submission, followed by faculty verification and department manager financial approval.
6. **Reporting & CSV Export Utilities:** Offers administrative export toolbar for generating CSV reports of duty completions, shift swaps, and monthly bill statements.

### Overall Team Contribution
The project was developed collaboratively by **Zaid Fahad** and **Momotaj Happy**. Both team members implemented complete full-stack feature slices (FastAPI backend + React frontend) divided across three structured development checkpoints.

---

## 2. My Contributions

As a core developer on this project, my (**Zaid Fahad**) individual technical contributions spanned software architecture design, core authentication infrastructure, duty task conflict validation, audit logging, financial approval workflows, and SDLC documentation:

### Architecture & System Documentation
* **Software Requirements Specification (SRS):** Primary author of `docs/17-srs.md`, mapping functional requirements (`FR-001` through `FR-050`), non-functional requirements, use cases, and IEEE-style system scope.
* **Technical Design Document (TDD):** Authored `docs/20-tdd.md`, defining system architecture, database ERD schemas, REST API conventions, and security specifications.
* **Backend Infrastructure Setup:** Initialized the FastAPI project structure (`back-end/`), dependency injection patterns, Pydantic schemas, and server startup routing.

### Module 1: User Management & Role-Based Access Control (Issue #36 / PR #37)
* **Backend (FastAPI):** Implemented password hashing (`bcrypt`/`passlib`), JSON Web Token (JWT) generation & validation, authentication endpoints (`/api/v1/auth/login`, `/api/v1/auth/me`), and role authorization decorators (`STUDENT`, `FACULTY`, `MANAGER`).
* **Frontend (React + TypeScript):** Built `AuthContext`, persistent token storage, login views, and protected route guards.

### Module 2: Duty Task & Conflict Detection Engine (Issue #40)
* **Backend (FastAPI):** Built task CRUD endpoints (`POST/GET/PATCH/DELETE /api/v1/tasks`) and Pydantic models (`DutyTaskCreate`, `DutyTaskUpdate`, `DutyTask`).
* **Schedule Conflict Engine:** Engineered algorithm in `back-end/api/services/task_service.py` that checks incoming task timestamps against student class schedules and marked unavailable slots, returning HTTP 409 Conflict on overlap.
* **Frontend (React + TS):** Created `FacultyTaskAssignment.tsx` (task creation form with student selector), `StudentDuties.tsx` (interactive task list), `TaskConflictAlert.tsx` (real-time conflict warning), and `TaskDetailModal.tsx`.

### Module 3: Reporting & Swap Audit Trail Utility (Issue #44)
* **Backend (FastAPI):** Created endpoints `/api/v1/export/report/csv` for downloading duty metrics and `/api/v1/tasks/swaps/audit-log` for fetching shift transfer logs.
* **Frontend (React + TS):** Built `SwapAuditTable.tsx` and `ExportToolbar.tsx` with one-click CSV generation.

### Module 4: Faculty Verification & Manager Financial Approval Pipeline (Issue #43)
* **Backend (FastAPI):** Developed bill state transition endpoints (`PATCH /bills/{id}/verify` for Faculty and `PATCH /bills/{id}/approve` for Manager).
* **Frontend (React + TS):** Developed `FacultyBillVerification.tsx` and `ManagerFinancialApproval.tsx` dashboards.

---

## 3. Challenges and Solutions

### Challenge 1: Complex Schedule Conflict Detection Across Academic Classes & Custom Unavailable Slots
* **Issue:** Validating task assignments required comparing a single-instance duty timestamp (e.g., Monday 10:00 AM–12:00 PM) against weekly recurring academic course schedules as well as custom single/recurring unavailable slots marked by students.
* **Solution:** Developed a normalized minute-offset converter in `task_service.py` that translates all weekly days and times into absolute daily minute ranges (e.g., Monday 09:00–10:30 → 540 to 630 minutes). The conflict engine executes deterministic interval overlap math `(startA < endB) and (endA > startB)` across all active schedule records before allowing task creation.

### Challenge 2: Multi-Role Authorization & Client State Synchronization
* **Issue:** Enforcing granular permissions so that Students can only submit bills and request swaps, Faculty can create tasks and verify bills, and Managers can approve payments, without UI state becoming out-of-sync with backend JWT claims.
* **Solution:** Centralized auth logic using a custom FastAPI dependency (`require_role([...])`) that decodes and validates JWT claims on every request. On the frontend, React `AuthContext` provides role claims to dynamic navigation bars and component renderers, automatically redirecting unauthorized attempts.

### Challenge 3: Financial Bill Consistency & Shift Swap Auditability
* **Issue:** When a student swaps a duty task with a peer, calculating accurate monthly billing hours without double-counting hours or allowing modifications after bill submission was difficult.
* **Solution:** Implemented an immutable audit logging service that records all proxy shift handoffs with timestamps. Enforced state lock checks on bill records (`DRAFT` → `SUBMITTED` → `VERIFIED` → `APPROVED`) so that task hours linked to submitted or approved bills cannot be modified or re-swapped.

---

## 4. Learning Reflection

### Technical Skills Gained
* **Modern Web Development:** Mastered building RESTful microservices with **Python FastAPI**, leveraging **Pydantic** for rigorous data validation and **SQLAlchemy** for database operations.
* **Frontend Architecture:** Deepened expertise in **React with TypeScript and Vite**, building modular UI components, custom hooks, and centralized state management.
* **Security & Auth Standards:** Learned industry-standard security practices including password hashing (`bcrypt`), stateless JWT authentication, and Role-Based Access Control (RBAC).

### Engineering Practices & Git Workflow
* **SDLC & Requirements Engineering:** Gained hands-on experience authoring production-grade software documentation including SRS, TDD, ERD, and API contracts.
* **GitHub Collaboration Protocol:** Practiced team software development using issue tracking (`.github/ISSUES/`), feature branch conventions (`username/#issue_num-feature-name`), structured commit messages, pull requests targeting `dev`, and strict code review gates.
* **Quality Assurance & Testing:** Enhanced proficiency in writing automated unit tests (`pytest`), validating API response contracts, and performing full-stack debugging.

---

## Declaration

I declare that the information provided in this report accurately reflects my individual contribution to the project. All work described is my own contribution to the project.

**Student Signature:** _______________________  
**Date:** August 12, 2026
