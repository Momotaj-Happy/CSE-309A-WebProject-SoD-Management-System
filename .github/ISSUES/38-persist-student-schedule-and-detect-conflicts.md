# Issue #38: Persist Student Academic Schedule and Detect Conflicts

## Issue Overview
- **Issue ID:** #38
- **Feature Name:** Academic Schedule Persistence & Conflict Detection
- **Epic:** Epic E2 - Schedule Engine & Conflict Detection
- **Mapped FRs:** `FR-SCHED-01`, `FR-SCHED-02`, `FR-TASK-03`
- **Mapped USs:** `US-004`, `US-005`

---

## Objectives
1. Implement backend storage (in-memory mock DB) for student academic schedules.
2. Add CRUD REST endpoints for retrieving and saving schedules.
3. Implement schedule conflict detection when creating duty tasks.
4. Update the frontend IRAS Parser to persist parsed schedules to the backend.
5. Add a visual schedule calendar/timetable on the Student Profile tab.
6. Display warning alerts in the Faculty Task Assignment interface when there is an academic schedule overlap.

---

## Acceptance Criteria
- [ ] `POST /api/v1/schedule/save` successfully stores a student's parsed schedule.
- [ ] `GET /api/v1/schedule/me` retrieves the current authenticated student's schedule.
- [ ] `GET /api/v1/schedule/student/{id}` retrieves a specific student's schedule (restricted to managers and faculty).
- [ ] `POST /api/v1/tasks` (task assignment) runs validation against the student's academic schedule and returns a conflict error/warning if the duty time overlaps.
- [ ] React frontend calls the backend to save the schedule after parsing.
- [ ] Student Profile page displays their weekly academic timetable.
- [ ] Faculty Task Assignment interface displays warning indicators/overlays if a selected student is busy during the selected duty hours.

---

## Implementation Tasks
- [ ] Create branch `happy/#38-persist-schedule-and-detect-conflicts`
- [ ] Backend: Update schedule model to support database mapping and payload saving (`back-end/api/models/schedule.py`)
- [ ] Backend: Add `schedule_service.py` to manage CRUD operations for academic schedules
- [ ] Backend: Add schedule routes (`back-end/api/routes/schedule.py`) for `/api/v1/schedule/save`, `/api/v1/schedule/me`, and `/api/v1/schedule/student/{id}`
- [ ] Backend: Implement conflict detection utility and integrate it into `TaskService.create_task`
- [ ] Frontend: Update IRAS parser page to call `api.saveSchedule` on success
- [ ] Frontend: Implement `api.getSchedule` and render a weekly schedule visualizer in the Profile view
- [ ] Frontend: Integrate schedule checking in Faculty task assignment form, displaying warnings if there is a conflict
- [ ] Verification: Test the parsing and persistence flow locally, and verify conflict alerts
