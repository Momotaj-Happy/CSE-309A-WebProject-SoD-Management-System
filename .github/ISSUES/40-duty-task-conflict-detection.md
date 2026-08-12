# Issue #40: Feature 2 - Duty Task & Schedule Conflict Detection Engine (Zaid)

## Description
Implement full-stack REST CRUD endpoints and React UI components for creating, assigning, querying, updating, and cancelling Student on Duty (SoD) tasks, integrated with an automated Schedule Conflict Detection Engine that prevents assigning duty slots during a student's academic lectures or custom marked unavailable times.

## Developer Assignment
- **Developer:** Zaid (`zaid-fahad`)
- **Checkpoint:** Checkpoint 1 - Task 1.2
- **Module:** Feature 2 - Duty Task & Conflict Detection Engine

---

## Technical Specifications & Requirements

### 1. Backend Specifications (`FastAPI`)
- **Pydantic Schemas (`back-end/api/models/task.py`):**
  - `TaskTypeEnum`: `LAB`, `EXAM`, `FACULTY`
  - `TaskStatusEnum`: `PENDING`, `COMPLETED`, `CANCELLED`, `SWAPPED`
  - `DutyTaskCreate`: `title`, `task_type`, `location`, `scheduled_date`, `start_time`, `end_time`, `hourly_rate`, `student_id`, `log_notes`
  - `DutyTaskUpdate`: `status`, `log_notes`, `title`, `location`, `scheduled_date`, `start_time`, `end_time`
  - `DutyTask`: `id`, `title`, `task_type`, `location`, `scheduled_date`, `start_time`, `end_time`, `hourly_rate`, `student_id`, `assigned_by`, `status`, `log_notes`, `created_at`
- **Conflict Engine & Task Service (`back-end/api/services/task_service.py`):**
  - Compare incoming duty task date/time against student's saved academic courses and custom unavailable slots.
  - Return `409 Conflict` if duty overlaps student's class schedule or unavailable window.
- **REST Endpoints (`back-end/api/routes/tasks.py`):**
  - `POST /api/v1/tasks` (201 Created / 409 Conflict) - Create new duty task with overlap validation.
  - `GET /api/v1/tasks` (200 OK) - Read duty tasks with filters (`student_id`, `status`, `task_type`).
  - `GET /api/v1/tasks/{task_id}` (200 OK) - Read single task details.
  - `PATCH /api/v1/tasks/{task_id}` (200 OK) - Update task status or completion log notes.
  - `DELETE /api/v1/tasks/{task_id}` (204 No Content) - Delete/cancel assigned duty task.
- **Automated Unit Tests:** `back-end/tests/test_task_conflict_engine.py`

### 2. Frontend Specifications (`React + TypeScript + Vite`)
- **API Client (`front-end/src/services/api.ts`):** `createTask()`, `listTasks()`, `getTask()`, `updateTaskStatus()`, `deleteTask()`.
- **Components:**
  - `FacultyTaskAssignment.tsx`: Task creation form with student selector & live schedule conflict alert.
  - `StudentDuties.tsx`: Interactive student duty management list with status toggle and log note editor.
  - `TaskConflictAlert.tsx`: Warning component displaying schedule overlap details.
  - `TaskDetailModal.tsx`: Dialog showing complete task metadata and audit timestamps.
