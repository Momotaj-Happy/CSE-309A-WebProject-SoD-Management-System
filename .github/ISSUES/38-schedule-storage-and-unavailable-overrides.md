# Issue #38: Implement Academic Schedule Storage, Retrieval & Unavailable Slot Overrides

## Issue Overview
- **Issue ID:** #38
- **Assignee:** Happy (`Momotaj-Happy`)
- **Feature Name:** Academic Schedule Persistence & Unavailable Overrides
- **Epic:** Epic E2 - Schedule Engine & Availability
- **Mapped FRs:** `FR-PARSER-01`, `FR-PARSER-02`, `FR-PARSER-03`
- **Mapped USs:** `US-004`, `US-005`

---

## Objectives
1. Implement persistent schedule storage (in-memory mock DB) for parsed student academic schedules.
2. Build RESTful CRUD endpoints for saving schedules, fetching the student's own schedule, manager schedule inspection, and marking manual unavailable slots.
3. Update the frontend IRAS Parser page to save the schedule to the backend upon successful parsing.
4. Build an interactive Weekly Schedule Grid on the Student Profile page with a manual "Mark Unavailable" slot toggle.

---

## Acceptance Criteria
- [ ] `POST /api/v1/schedule/save` stores a list of course items for the authenticated student.
- [ ] `GET /api/v1/schedule/me` returns the current student's saved academic schedule.
- [ ] `GET /api/v1/schedule/student/{id}` returns a student's schedule for managers/faculty.
- [ ] `POST /api/v1/schedule/unavailable` marks specific time slots as "Unavailable".
- [ ] Frontend IRAS Parser provides a "Save Schedule" button that persists data via API.
- [ ] Student Profile page renders a weekly schedule visualizer grid.

---

## Implementation Tasks
- [ ] Backend: Update `back-end/api/models/schedule.py` with `SaveScheduleRequest`, `UnavailableSlotRequest`, and `ScheduleResponse`.
- [ ] Backend: Create `back-end/api/services/schedule_service.py` to handle CRUD operations.
- [ ] Backend: Add route handlers in `back-end/api/routes/schedule.py` with JWT auth dependencies.
- [ ] Frontend: Add `saveSchedule`, `getSchedule`, and `setUnavailableSlot` methods to `front-end/src/services/api.ts`.
- [ ] Frontend: Add "Save Schedule" action to `front-end/src/pages/SchedulePage.tsx`.
- [ ] Frontend: Build Weekly Schedule Grid component in `front-end/src/components/UserProfileCard.tsx` with toggleable unavailable slots.
- [ ] Verification: Test saving schedules and toggling unavailable slots.
