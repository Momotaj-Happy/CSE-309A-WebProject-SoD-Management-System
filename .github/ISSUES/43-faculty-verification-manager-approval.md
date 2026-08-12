# Issue #43: Feature 4B - Faculty Verification & Manager Financial Approval Pipeline (Zaid)

## Description
Implement full-stack REST CRUD endpoints and React UI components for the multi-stage financial approval pipeline of Student on Duty (SoD) monthly bills. Enables Faculty members to review and verify student bill submissions (`SUBMITTED` -> `VERIFIED`) and Department Managers to perform final financial sign-off (`VERIFIED` -> `APPROVED`) or reject invalid submissions (`REJECTED`).

## Developer Assignment
- **Developer:** Zaid (`zaid-fahad`)
- **Checkpoint:** Checkpoint 3 - Task 3.2
- **Module:** Feature 4B - Faculty Verification & Manager Approval Pipeline

---

## Technical Specifications & Requirements

### 1. Backend Specifications (`FastAPI`)
- **Pydantic Schemas (`back-end/api/models/billing.py`):**
  - `BillActionPayload`: `action` (`VERIFY`, `APPROVE`, `REJECT`), `notes`
- **Approval Pipeline Service (`back-end/api/services/billing_service.py`):**
  - Enforce RBAC permission checks (Faculty verification vs. Dept Manager approval).
  - Update status transitions: `SUBMITTED` -> `VERIFIED` -> `APPROVED` (or `REJECTED`).
- **REST Endpoints (`back-end/api/routes/billing.py`):**
  - `GET /api/v1/bills/pending` (200 OK) - Read pending bills awaiting verification/approval based on caller role.
  - `PATCH /api/v1/bills/{bill_id}/verify` (200 OK) - Faculty verification action (`SUBMITTED` -> `VERIFIED`).
  - `PATCH /api/v1/bills/{bill_id}/approve` (200 OK) - Department Manager final approval (`VERIFIED` -> `APPROVED`).
  - `DELETE /api/v1/bills/{bill_id}` (200 OK / 204 No Content) - Reject/delete bill submission with feedback notes.
- **Automated Unit Tests:** `back-end/tests/test_billing_approval_pipeline.py`

### 2. Frontend Specifications (`React + TypeScript + Vite`)
- **API Client (`front-end/src/services/api.ts`):** `getPendingBills()`, `verifyBill()`, `approveBill()`, `rejectBill()`.
- **Components:**
  - `FacultyBillVerification.tsx`: Verification list card for faculty to review student logged hours and sign off.
  - `ManagerFinancialApproval.tsx`: Final budget approval console for department manager to issue payouts.
