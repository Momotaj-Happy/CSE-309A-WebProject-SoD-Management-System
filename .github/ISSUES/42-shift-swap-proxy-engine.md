# Issue #42: Feature 3 - Shift Swap Proxy Engine & Audit Logging (Happy)

## Description
Implement full-stack REST CRUD endpoints and React UI components for Student on Duty (SoD) shift swap management, allowing students to broadcast shift swap requests, inspect open eligible swaps, accept peer swap requests with schedule conflict checks, withdraw swap requests, and log immutable swap transaction audit trails.

## Developer Assignment
- **Developer:** Happy (`Momotaj-Happy`)
- **Checkpoint:** Checkpoint 2 - Task 2.1
- **Module:** Feature 3 - Shift Swap Proxy Engine & Audit Logging

---

## Technical Specifications & Requirements

### 1. Backend Specifications (`FastAPI`)
- **Pydantic Schemas (`back-end/api/models/swap.py`):**
  - `SwapStatusEnum`: `OPEN`, `ACCEPTED`, `CANCELLED`
  - `SwapRequestCreate`: `task_id`, `reason`
  - `ShiftSwapResponse`: `swap_id`, `task_id`, `requestor_id`, `requestor_name`, `target_role`, `reason`, `status`, `acceptor_id`, `acceptor_name`, `created_at`
  - `AuditLogEntry`: `id`, `event_type`, `swap_id`, `task_id`, `performed_by`, `details`, `timestamp`
- **Swap Proxy Service (`back-end/api/services/swap_service.py`):**
  - Manage open shift swaps, validate that accepting student has no academic schedule or unavailable slot conflict during the task time, transfer task `student_id` upon acceptance, and record immutable audit logs.
- **REST Endpoints (`back-end/api/routes/swaps.py`):**
  - `POST /api/v1/tasks/swaps` (201 Created) - Create shift swap request for an assigned task.
  - `GET /api/v1/tasks/swaps` (200 OK) - Read open swap requests filtered by user eligibility.
  - `GET /api/v1/tasks/swaps/{swap_id}` (200 OK) - Read single swap request details.
  - `POST /api/v1/tasks/swaps/{swap_id}/accept` (200 OK) - Accept swap request (updates task student_id).
  - `DELETE /api/v1/tasks/swaps/{swap_id}` (204 No Content) - Cancel/withdraw open swap request.
  - `GET /api/v1/tasks/swaps/audit-log` (200 OK) - Read immutable audit trail of swap transactions.
- **Automated Unit Tests:** `back-end/tests/test_shift_swap_engine.py`

### 2. Frontend Specifications (`React + TypeScript + Vite`)
- **API Client (`front-end/src/services/api.ts`):** `createSwap()`, `listSwaps()`, `acceptSwap()`, `cancelSwap()`, `getSwapAuditLog()`.
- **Components:**
  - `ShiftSwapFeed.tsx`: Live feed of open shift swaps with 'Accept Shift' and 'Cancel Request' controls.
  - `SwapRequestModal.tsx`: Dialog for creating a new shift swap request with reason input.
  - `SwapAuditTable.tsx`: Audit table rendering immutable shift swap transaction history.
- **Dashboard Integration (`front-end/src/components/Dashboard.tsx`):** Embed swap feed and audit log panels into main dashboard view.
