# Final Project Submission Report

**Independent University, Bangladesh**  
**Department of Computer Science & Engineering**  
**CSE309: Web Application & Internet**  
**Semester:** Summer 2026  

---

### **Submission Information**
* **Submitted By:** Momotaj Happy
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
2. **IRAS Academic Schedule Parser Engine:** Enables students to upload or copy-paste raw class schedules from the IRAS web portal, automatically parsing and mapping lecture slots onto an interactive 7-day weekly timetable grid.
3. **Academic Availability & Schedule Management:** Full CRUD management of parsed student course schedules and custom marked unavailable time slots.
4. **Duty Task Assignment & Conflict Detection Engine:** Allows faculty and managers to create duty tasks while automatically validating incoming task times against student class schedules and custom unavailable windows (blocking overlapping assignments with HTTP 409 Conflict).
5. **Shift Swap Proxy Engine & Audit Trail:** Provides a peer-to-peer shift swap feed where students can offer, request, or accept duty proxy shifts with complete immutable audit logs.
6. **Student Monthly Billing & Multi-Tier Financial Approvals:** Automatically aggregates completed duty task hours into monthly billing summaries for student submission, followed by faculty verification and department manager financial approval.
7. **Reporting & Export Utilities:** Offers administrative export toolbar for generating CSV reports of duty completions, shift swaps, and monthly bill statements.

### Overall Team Contribution
The project was developed collaboratively by **Momotaj Happy** and **Zaid Fahad**. Both team members implemented complete full-stack feature slices (FastAPI backend + React frontend) divided across three structured development checkpoints.

---

## 2. My Contributions

As a core developer on this project, my (**Momotaj Happy**) individual technical contributions spanned technical feature planning, IRAS parser engine development, academic schedule availability management, shift swap proxy engine implementation, student monthly billing submission, and unit test automation:

### Technical Planning & Requirements Architecture
* **Work Distribution & Technical Feature Specifications:** Author of `docs/23-work-distribution.md`, establishing the 3-checkpoint technical breakdown, Pydantic schemas, REST API CRUD specifications, and React component architecture for both team members.
* **Requirements & Design Documentation:** Co-authored initial system specification documents including `docs/01-project-overview.md`, `docs/08-prd.md`, and `docs/13-functional-requirements.md`.

### Module 1: IRAS Schedule Parser & Availability Engine (Issue #34, Issue #38 / PR #35, PR #39)
* **Backend (FastAPI):**
  - Engineered `ParserService` in `back-end/api/services/parser_service.py` featuring a multi-line `LINE_PATTERN` scanner, tab-separated line parsing, and condensed regex strategies to parse raw copy-pasted IRAS academic schedules into structured course slots.
  - Implemented IRAS single-letter day code normalization (`S`→`SUN`, `M`→`MON`, `T`→`TUE`, `W`→`WED`, `R`→`THU`, `F`→`FRI`, `A`→`SAT`, and multi-day codes `ST`, `MW`, `AR`).
  - Developed `ScheduleService` in `back-end/api/services/schedule_service.py` providing full CRUD operations for student schedules and custom unavailable slots.
  - Implemented REST CRUD endpoints in `back-end/api/routes/schedule.py`:
    - `POST /api/v1/schedule/parse` (Parse raw schedule text)
    - `POST /api/v1/schedule/save` (201 Created - Save/persist student schedule)
    - `GET /api/v1/schedule/me` (200 OK - Read logged-in student schedule)
    - `GET /api/v1/schedule/student/{student_id}` (200 OK - Read student schedule by ID for Faculty/Managers)
    - `PUT /api/v1/schedule/courses/{course_id}` (200 OK - Update specific course slot attributes)
    - `DELETE /api/v1/schedule/courses/{course_id}` (204 No Content - Delete course slot entry)
    - `POST /api/v1/schedule/unavailable` (201 Created - Add custom unavailable slot)
    - `DELETE /api/v1/schedule/unavailable/{slot_id}` (204 No Content - Delete unavailable slot)
  - Authored automated unit test suite `back-end/tests/test_schedule_engine.py`.
* **Frontend (React + TypeScript):**
  - Developed `SchedulePage.tsx` with "Save Schedule to Profile" action, feedback toast alerts, and raw JSON inspector.
  - Developed `ScheduleWeeklyGrid.tsx` rendering an interactive 7-day timetable grid for course lectures and unavailable slots, supporting day code mapping (`DAY_CODE_MAP`) and inline deletion controls.
  - Developed `UnavailableSlotModal.tsx` for marking custom unavailable time windows.
  - Integrated `ScheduleWeeklyGrid` into `UserProfileCard.tsx`.

### Module 2: Shift Swap Proxy Engine & Audit Logging (Issue #41 / PR #45)
* **Backend (FastAPI):**
  - Created Pydantic models in `back-end/api/models/swap.py`: `SwapStatusEnum` (`OPEN`, `ACCEPTED`, `CANCELLED`), `SwapRequestCreate`, `ShiftSwapResponse`, `AuditLogEntry`.
  - Built `SwapService` in `back-end/api/services/swap_service.py` supporting shift swap broadcasting, open swap querying, shift acceptance (transferring task assignment to acceptor), request cancellation/withdrawal, and immutable audit log recording (`_AUDIT_LOG_DB`).
  - Implemented REST CRUD endpoints in `back-end/api/routes/swaps.py`:
    - `POST /api/v1/tasks/swaps` (201 Created - Broadcast shift swap request)
    - `GET /api/v1/tasks/swaps` (200 OK - Read open swap requests)
    - `GET /api/v1/tasks/swaps/audit-log` (200 OK - Read shift swap transaction audit log entries)
    - `GET /api/v1/tasks/swaps/{swap_id}` (200 OK - Read single swap request details)
    - `POST /api/v1/tasks/swaps/{swap_id}/accept` (200 OK - Accept swap request)
    - `DELETE /api/v1/tasks/swaps/{swap_id}` (204 No Content - Cancel/withdraw swap request)
  - Mounted `swaps.router` in `back-end/main.py`.
  - Authored automated unit test suite `back-end/tests/test_shift_swap_engine.py`.
* **Frontend (React + TypeScript):**
  - Developed `ShiftSwapFeed.tsx`: Live feed of open shift swap broadcasts with interactive "Accept Shift" and "Withdraw Request" controls.
  - Developed `SwapAuditTable.tsx`: Table rendering immutable shift swap audit trails with search filtering.
  - Integrated swap feed and audit log table into `Dashboard.tsx` with broadcast modal dialog (`swapModalTask`).

### Module 3: Student Monthly Billing & Bill Submission (Issue #42)
* **Backend (FastAPI):**
  - Created Pydantic models in `back-end/api/models/billing.py`: `BillStatusEnum`, `BillItem`, `MonthlyBillResponse`, `BillSubmitPayload`.
  - Developed `BillingService` computing billable hours and financial amounts for `COMPLETED` duty tasks within the given month/year and handling draft submission (`DRAFT` → `SUBMITTED`).
  - REST endpoints: `GET /api/v1/bills/my-current`, `POST /api/v1/bills/submit`, `GET /api/v1/bills/student/{student_id}`.
* **Frontend (React + TypeScript):**
  - Built `StudentBillSummary.tsx` and integrated monthly billing status cards and submission workflows into `BillingPage.tsx`.

---

## 3. Challenges and Solutions

### Challenge 1: Robust Parsing of Diverse IRAS Web Table Formats & Control Characters
* **Issue:** Copy-pasting class tables directly from the IRAS web portal introduced mixed tab characters (`\t`), multiple spaces, and control characters that caused standard single-line regex matches to fail or strip tabbed column alignment.
* **Solution:** Engineered a multi-strategy parser in `ParserService` featuring a primary multi-line `LINE_PATTERN` scanner, tab-separated line splitting, and condensed regex fallbacks. Updated the frontend API client sanitization to explicitly preserve tab characters (`\t`) and newlines while stripping non-printable control characters.

### Challenge 2: Day Code Normalization & Multi-Day Grid Alignment
* **Issue:** IRAS schedule formats use single-letter codes (`S`, `M`, `T`, `W`, `R`, `F`, `A`) and combined day strings (e.g. `ST` for Sun/Tue, `MW` for Mon/Wed, `AR` for Sat/Thu), which failed to map to standard 7-day grid columns (`MON`, `TUE`, `WED`, etc.).
* **Solution:** Implemented `normalize_days()` function converting IRAS day codes to standard comma-separated strings (`SUN, TUE`, `SAT, THU`) and built a `DAY_CODE_MAP` lookup dictionary in `ScheduleWeeklyGrid.tsx` for 100% accurate column placement.

### Challenge 3: Shift Swap State Consistency & Immutable Auditability
* **Issue:** Ensuring shift swaps reassign duty tasks without creating duplicate assignments or allowing un-audited proxy transfers.
* **Solution:** Designed atomic state transitions (`OPEN` → `ACCEPTED` / `CANCELLED`) in `SwapService` that automatically update task ownership and append an immutable event entry to `AuditLogEntry` on every transaction.

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
