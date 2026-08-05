# Issue #38: Feature 1 - Academic Schedule Engine & Availability Management

## Technical Overview
- **Issue ID:** #38
- **Assignee:** Happy (`Momotaj-Happy`)
- **Module:** Feature 1 - Academic Schedule Engine & Availability Management
- **Target Branch:** `happy/#38-academic-schedule-engine`

---

## Technical Specifications

### Backend (FastAPI):
- **Schemas (`back-end/api/models/schedule.py`):**
  - `CourseItem`: `id`, `name`, `section`, `room`, `days`, `time`
  - `SaveScheduleRequest`: `courses: List[CourseItem]`
  - `UnavailableSlotCreate`: `day: str`, `start_time: str`, `end_time: str`, `note: Optional[str]`
  - `ScheduleResponse`: `success: bool`, `courses: List[CourseItem]`, `unavailable_slots: List[dict]`
- **REST Endpoints (`back-end/api/routes/schedule.py`):**
  - `POST /api/v1/schedule` - Create/save parsed schedule (JWT Auth required)
  - `GET /api/v1/schedule/me` - Read authenticated student's schedule (JWT Auth required)
  - `GET /api/v1/schedule/student/{student_id}` - Read schedule by student ID (Faculty/Manager restricted)
  - `POST /api/v1/schedule/unavailable` - Create custom unavailable slot
  - `DELETE /api/v1/schedule/unavailable/{slot_id}` - Delete custom unavailable slot
- **Service (`back-end/api/services/schedule_service.py`):**
  - In-memory store: `_SCHEDULES_DB: Dict[str, dict] = {}`

### Frontend (React + TypeScript):
- **Components:**
  - `front-end/src/pages/SchedulePage.tsx`: Add "Save Schedule to Profile" action button calling API
  - `front-end/src/components/ScheduleWeeklyGrid.tsx`: Weekly schedule visualization component
  - `front-end/src/components/UnavailableSlotModal.tsx`: Modal form to create custom unavailable slots
  - `front-end/src/components/UserProfileCard.tsx`: Integrate `ScheduleWeeklyGrid` into profile tab
- **API Client (`front-end/src/services/api.ts`):**
  - `saveSchedule(courses: Course[]): Promise<ScheduleResponse>`
  - `getSchedule(): Promise<ScheduleResponse>`
  - `getStudentSchedule(studentId: string): Promise<ScheduleResponse>`
  - `createUnavailableSlot(payload: UnavailableSlotCreate): Promise<{success: boolean}>`
  - `deleteUnavailableSlot(slotId: string): Promise<{success: boolean}>`

---

## Verification Criteria
- [ ] `POST /api/v1/schedule` returns 201 Created and persists schedule items.
- [ ] `GET /api/v1/schedule/me` returns 200 OK with courses and unavailable slots.
- [ ] `POST /api/v1/schedule/unavailable` adds an unavailable slot to student's record.
- [ ] `DELETE /api/v1/schedule/unavailable/{slot_id}` removes the specified unavailable slot.
- [ ] Frontend IRAS Parser correctly triggers `api.saveSchedule()` and displays confirmation feedback.
- [ ] Student Profile page renders the interactive weekly timetable grid and permits custom slot creation/deletion.
