# Departmental SoD Management System - Feature Breakdown & Work Distribution Plan

## Technical Architecture Overview

The system is built on a decoupled client-server architecture:
- **Backend:** FastAPI (Python 3.11+) implementing RESTful APIs with Pydantic schema validation, JWT Bearer authentication, and HTTP response handling.
- **Frontend:** React 18 (TypeScript) built with Vite, Tailwind CSS, custom hooks, and centralized state management via Context API and API client abstractions.

---

## Technical Feature Breakdown (Full-Stack CRUD & REST Specifications)

### Feature 1: Academic Schedule Engine & Availability Management
- **Backend (FastAPI):**
  - **Data Models / Pydantic Schemas:** `CourseItem`, `AcademicSchedule`, `SaveScheduleRequest`, `UnavailableSlotCreate`, `ScheduleResponse`.
  - **REST API Endpoints (CRUD):**
    - `POST /api/v1/schedule` - Create/persist student academic schedule.
    - `GET /api/v1/schedule/me` - Read authenticated student's schedule.
    - `GET /api/v1/schedule/student/{student_id}` - Read student schedule by ID (Faculty/Manager permission).
    - `PUT /api/v1/schedule/me` - Update existing course slots or schedule entries.
    - `POST /api/v1/schedule/unavailable` - Create custom unavailable time slots.
    - `DELETE /api/v1/schedule/unavailable/{slot_id}` - Delete custom unavailable slot.
- **Frontend (React + TypeScript):**
  - **Components:** `SchedulePage`, `ScheduleWeeklyGrid`, `ScheduleInput`, `UnavailableSlotModal`.
  - **Hooks & Services:** `useAcademicSchedule`, `api.saveSchedule()`, `api.getSchedule()`, `api.deleteUnavailableSlot()`.

### Feature 2: Duty Task & Schedule Conflict Detection Engine
- **Backend (FastAPI):**
  - **Data Models / Pydantic Schemas:** `DutyTask`, `DutyTaskCreate`, `DutyTaskUpdate`, `TaskStatusEnum` (`PENDING`, `COMPLETED`, `CANCELLED`, `SWAPPED`).
  - **REST API Endpoints (CRUD):**
    - `POST /api/v1/tasks` - Create new duty task with overlap validation (returns `HTTP 409 Conflict` if duty overlaps student's class schedule or unavailable slot).
    - `GET /api/v1/tasks` - Read duty tasks with query parameters (`student_id`, `status`, `task_type`).
    - `GET /api/v1/tasks/{task_id}` - Read single task record details.
    - `PATCH /api/v1/tasks/{task_id}` - Update task status or completion log notes.
    - `DELETE /api/v1/tasks/{task_id}` - Delete/cancel assigned duty task.
- **Frontend (React + TypeScript):**
  - **Components:** `FacultyTaskAssignment`, `StudentDuties`, `TaskConflictAlert`, `TaskDetailModal`.
  - **Hooks & Services:** `useTasks`, `api.createTask()`, `api.listTasks()`, `api.updateTaskStatus()`, `api.deleteTask()`.

### Feature 3: Shift Swap Proxy Engine & Audit Logging
- **Backend (FastAPI):**
  - **Data Models / Pydantic Schemas:** `SwapRequest`, `SwapRequestCreate`, `ShiftSwapResponse`, `AuditLogEntry`.
  - **REST API Endpoints (CRUD):**
    - `POST /api/v1/tasks/swaps` - Create shift swap request for an assigned task.
    - `GET /api/v1/tasks/swaps` - Read open swap requests filtered by user eligibility.
    - `GET /api/v1/tasks/swaps/{swap_id}` - Read single swap request details.
    - `POST /api/v1/tasks/swaps/{swap_id}/accept` - Accept swap request (validates accepting student's class schedule, updates task `student_id`).
    - `DELETE /api/v1/tasks/swaps/{swap_id}` - Cancel/withdraw open swap request.
    - `GET /api/v1/tasks/swaps/audit-log` - Read immutable audit trail of swap transactions.
- **Frontend (React + TypeScript):**
  - **Components:** `Dashboard`, `ShiftSwapFeed`, `SwapRequestModal`, `SwapAuditTable`.
  - **Hooks & Services:** `useShiftSwaps`, `api.createSwap()`, `api.listSwaps()`, `api.acceptSwap()`, `api.cancelSwap()`.

### Feature 4: Monthly Financial Billing & Multi-Stage Approval Pipeline
- **Backend (FastAPI):**
  - **Data Models / Pydantic Schemas:** `MonthlyBill`, `BillStatusEnum` (`DRAFT`, `SUBMITTED`, `VERIFIED`, `APPROVED`), `BillSubmitPayload`, `BillActionPayload`.
  - **REST API Endpoints (CRUD):**
    - `GET /api/v1/bills/my-current` - Read authenticated student's current month draft bill and earnings.
    - `POST /api/v1/bills/submit` - Create/submit monthly bill for verification (`DRAFT` -> `SUBMITTED`).
    - `GET /api/v1/bills/pending` - Read pending bills awaiting verification/approval.
    - `PATCH /api/v1/bills/{bill_id}/verify` - Update bill status to verified (Faculty action, `SUBMITTED` -> `VERIFIED`).
    - `PATCH /api/v1/bills/{bill_id}/approve` - Update bill status to approved (Dept Manager action, `VERIFIED` -> `APPROVED`).
    - `DELETE /api/v1/bills/{bill_id}` - Reject/delete bill submission with feedback.
- **Frontend (React + TypeScript):**
  - **Components:** `BillingPage`, `StudentBillSummary`, `FacultyBillVerification`, `ManagerFinancialApproval`.
  - **Hooks & Services:** `useBilling`, `api.getCurrentBill()`, `api.submitBill()`, `api.verifyBill()`, `api.approveBill()`.

### Feature 5: Reporting & Schedule Export Utility
- **Backend (FastAPI):**
  - **REST API Endpoints:**
    - `GET /api/v1/export/report/csv` - Read/generate monthly payroll report as downloadable CSV attachment.
    - `GET /api/v1/export/schedule/image` - Read/generate visual schedule metadata for image rendering.
- **Frontend (React + TypeScript):**
  - **Components:** `ExportToolbar`, `ScheduleCanvasExporter`, `PayrollReportDownloader`.
  - **Hooks & Services:** `api.downloadPayrollCsv()`, Client-side Canvas HTML-to-Image renderer.

---

## 3-Checkpoint Work Distribution (Happy & Zaid)

Both team members (**Happy** and **Zaid**) will implement complete **full-stack feature slices (Backend REST API + Frontend UI)** for their assigned modules.

| Checkpoint | Developer | Feature Assigned | Technical Deliverables |
|---|---|---|---|
| **Checkpoint 1** | **Happy** | **Feature 1:** Academic Schedule Engine | Backend `POST/GET/PUT/DELETE` endpoints for `/api/v1/schedule`, `ScheduleService`, Frontend `ScheduleWeeklyGrid` & `UnavailableSlotModal`. |
| | **Zaid** | **Feature 2:** Duty Task & Conflict Detection | Backend `POST/GET/PATCH/DELETE` endpoints for `/api/v1/tasks`, schedule conflict validator, Frontend `TaskAssignmentForm` & `TaskConflictAlert`. |
| **Checkpoint 2** | **Happy** | **Feature 3:** Shift Swap Proxy Engine | Backend `POST/GET/DELETE` endpoints for `/api/v1/tasks/swaps` & accept handler, Frontend `Dashboard` integration & `ShiftSwapFeed`. |
| | **Zaid** | **Feature 5 & Audit:** Reporting & Swap Audit Logs | Backend `GET` endpoints for `/api/v1/export/report/csv` & `/api/v1/tasks/swaps/audit-log`, Frontend `SwapAuditTable` & `ExportToolbar`. |
| **Checkpoint 3** | **Happy** | **Feature 4 (Part A):** Student Billing & Submission | Backend `GET /bills/my-current` & `POST /bills/submit` endpoints, Frontend `StudentBillSummary` & Submit workflow. |
| | **Zaid** | **Feature 4 (Part B):** Faculty Verification & Manager Approval | Backend `PATCH /bills/{id}/verify` & `PATCH /bills/{id}/approve` endpoints, Frontend `FacultyBillVerification` & `ManagerFinancialApproval`. |

---

## GitHub Collaboration & Execution Protocol

1. **Issue Creation:** For every feature task, write the issue markdown file `.github/ISSUES/#issue_num-feature-name.md` detailing API endpoints, schemas, and UI components.
2. **Branch Creation:** Create branch matching naming pattern: `username/#issue_num-feature-name` (e.g. `happy/#38-academic-schedule-engine`).
3. **Commit Standard:** Commit with issue prefix `[#38] Add POST /api/v1/schedule endpoint and Pydantic schemas`.
4. **Pull Request (PR):** Open a PR targeting `dev` branch with summary of endpoints, schemas, and UI components created.
5. **Permission Gate:** Ask the user for explicit permission before merging PR to `dev`.
6. **Issue Closure & Branch Cleanup:** Merge PR to `dev`, mark issue closed, and delete local and remote feature branches.
