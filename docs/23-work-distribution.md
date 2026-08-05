# Departmental SoD Management System - Work Distribution & Checkpoint Plan

## Project Overview & Current Status

The Departmental SoD (Student on Duty) Management System is designed to automate student duty tracking, task assignments, and monthly bill processing for the Department of Physical Science. 

Based on our analysis of the codebase and repository history, the following modules have been implemented and merged into `main`:
1. **Module 01: IRAS Schedule Parser**
   - Backend service to parse raw academic schedule text into structured course items.
   - Frontend React page allowing students to paste raw schedule text and view parsed course lists.
2. **Module 02: User Management & Authentication (RBAC)**
   - Backend JWT authentication (`/auth/login`, `/auth/register`) and role management (`/users/me`, `/admin/roles`).
   - Frontend components for login, registration, user directory, and RBAC matrix.

---

## Remaining Features to Implement

To achieve the full product requirements (from the PRD and SRS), the following features must be completed:
1. **Academic Schedule Persistence & Conflict Detection:** Save parsed schedules and check for duty task assignment overlaps.
2. **Dashboard Integration & Shift Swap Proxy Engine:** Display the main dashboard, connect the shift swap feed, and enable students to request and accept swaps with availability validation.
3. **Monthly Billing Approval Pipeline:** Automate the multi-stage payment verification process (Student Draft -> Faculty Verification -> Manager Approval) and support CSV exports.

---

## 3-Checkpoint Work Distribution

We divide the remaining work into 3 checkpoints distributed between **Happy** and **Zaid**. Both members will work on both Frontend and Backend, following REST API best practices and implementing proper CRUD operations.

```mermaid
gantt
    title SoD Management System Implementation Timeline
    dateFormat  YYYY-MM-DD
    section Checkpoint 1
    Schedule Persistence & Conflict Alert (Happy)  :active, cp1, 2026-08-06, 3d
    section Checkpoint 2
    Dashboard & Swap Proxy Engine (Zaid)            :after cp1, cp2, 3d
    section Checkpoint 3
    Billing Pipeline & CSV Exports (Happy & Zaid)   :after cp2, cp3, 4d
```

### Checkpoint 1: Academic Schedule Persistence & Conflict Detection
* **Assignee:** Happy (Full Stack)
* **Goal:** Enable students to persist parsed schedules and prevent duty assignment conflicts.
* **Backend Tasks:**
  - Create database model (in-memory mock store) for `AcademicSchedule` linked to `student_id`.
  - Add CRUD REST endpoints:
    - `POST /api/v1/schedule/save` - Save student's parsed academic schedule.
    - `GET /api/v1/schedule/me` - Retrieve current student's academic schedule.
    - `GET /api/v1/schedule/student/{id}` - Retrieve specific student's schedule (Manager/Faculty only).
  - Update `TaskService.create_task` to perform conflict check: cross-reference the assigned task day and time against the student's saved academic schedule. Return a warning/error response if a conflict is detected.
* **Frontend Tasks:**
  - Update IRAS Parser page to call the schedule save endpoint.
  - Add a weekly timetable visualization on the "My Profile" tab.
  - In "Assign Tasks" page, query student availability and show a visual overlap alert before assigning a conflicting duty.

### Checkpoint 2: Dashboard Integration & Shift Swap Proxy Engine
* **Assignee:** Zaid (Full Stack)
* **Goal:** Connect the main landing dashboard and complete the peer-to-peer shift swapping flow.
* **Backend Tasks:**
  - Enhance shift swap endpoints:
    - `GET /api/v1/tasks/swaps` - List open swap requests.
    - `POST /api/v1/tasks/swaps` - Broadcast a swap request.
    - `POST /api/v1/tasks/swaps/{id}/accept` - Accept swap request.
  - Implement validation: Ensure a student cannot accept a swap if they have an academic schedule conflict or an existing duty assignment at that time.
* **Frontend Tasks:**
  - Connect the `Dashboard` component into `App.tsx` as the landing tab (it is currently disconnected).
  - Enhance the Dashboard to display metrics (assigned duties, pending hours, open swaps, estimated earnings).
  - Implement a visible "Accept Swap" action in the Dashboard's Shift Swap Broadcast Feed.

### Checkpoint 3: Monthly Billing Pipeline & Reporting
* **Assignee:** Happy & Zaid (Full Stack Collaboration)
* **Goal:** Complete the monthly financial billing cycle and payroll exports.
* **Backend Tasks:**
  - Create database models for `MonthlyBill`.
  - Add billing REST endpoints:
    - `GET /api/v1/bills/my-current` - Fetch student's current month's completed duties and earnings.
    - `POST /api/v1/bills/submit` - Student submits bill for the month (status changes to `SUBMITTED`).
    - `GET /api/v1/bills/pending` - Fetch submitted bills for Faculty verification.
    - `POST /api/v1/bills/{id}/verify` - Faculty verifies bill items (status changes to `VERIFIED`).
    - `POST /api/v1/bills/{id}/approve` - Department Manager final approval (status changes to `APPROVED`).
    - `GET /api/v1/export/report/csv` - Export approved monthly bills to payroll CSV.
* **Frontend Tasks:**
  - Create a "Billing & Approvals" tab in the Navbar.
  - **Student View:** Display monthly summary cards, task audit log, and a "Submit Monthly Bill" button.
  - **Faculty View:** Render a list of pending student bills with a "Verify" checklist.
  - **Manager View:** Render a directory of verified bills with "Approve for Payment" button and a "Download Payroll CSV" button.

---

## GitHub Collaboration & Branching Strategy

To maintain a clean repository and track changes effectively, we will follow this GitHub workflow:
1. **Issue Creation:** First, create a detailed GitHub issue under `.github/ISSUES/{issue-num}-{description}.md` and on GitHub itself with the full requirements and acceptance criteria.
2. **Branch Creation:** Create a local branch named: `username/#issue-num-description` (e.g. `happy/#38-persist-schedule`).
3. **Commit Messages:** Prefix commit messages with the issue number (e.g. `[#38] Add schedule persistence database model`).
4. **Pull Request (PR):** When the checkpoint work is done, create a detailed Pull Request describing changes.
5. **Merge to Development Branch (`dev`):** 
   - Ask for explicit user permission before merging.
   - Once permission is granted, merge the PR into the `dev` branch.
   - Close the issue and delete the feature branch.
