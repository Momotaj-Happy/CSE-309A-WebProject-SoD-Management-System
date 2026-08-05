# Issue #42: Feature 4A - Student Monthly Billing & Bill Submission (Happy)

## Description
Implement full-stack REST CRUD endpoints and React UI components for Student on Duty (SoD) monthly financial billing. Enables students to calculate total completed duty hours and earnings, review monthly bill breakdowns, generate draft bill statements, and submit monthly bills to faculty for multi-stage approval.

## Developer Assignment
- **Developer:** Happy (`Momotaj-Happy`)
- **Checkpoint:** Checkpoint 3 - Task 3.1
- **Module:** Feature 4A - Student Monthly Billing & Submission

---

## Technical Specifications & Requirements

### 1. Backend Specifications (`FastAPI`)
- **Pydantic Schemas (`back-end/api/models/billing.py`):**
  - `BillStatusEnum`: `DRAFT`, `SUBMITTED`, `VERIFIED`, `APPROVED`, `REJECTED`
  - `BillItem`: `task_id`, `title`, `date`, `hours`, `hourly_rate`, `subtotal`
  - `MonthlyBillResponse`: `bill_id`, `student_id`, `student_name`, `month`, `year`, `total_hours`, `total_amount`, `status`, `items`, `submitted_at`, `verified_at`, `approved_at`, `notes`
  - `BillSubmitPayload`: `month`, `year`, `notes`
- **Billing Service (`back-end/api/services/billing_service.py`):**
  - Compute total billable hours and financial amounts for `COMPLETED` duty tasks within the given month/year.
  - Manage draft state and submit bill (`DRAFT` -> `SUBMITTED`).
- **REST Endpoints (`back-end/api/routes/billing.py`):**
  - `GET /api/v1/bills/my-current` (200 OK) - Read authenticated student's current month draft/submitted bill.
  - `POST /api/v1/bills/submit` (201 Created) - Submit monthly bill for faculty verification.
  - `GET /api/v1/bills/student/{student_id}` (200 OK) - Read student's billing history.
- **Automated Unit Tests:** `back-end/tests/test_student_billing_engine.py`

### 2. Frontend Specifications (`React + TypeScript + Vite`)
- **API Client (`front-end/src/services/api.ts`):** `getCurrentBill()`, `submitBill()`, `getStudentBillHistory()`.
- **Components:**
  - `StudentBillSummary.tsx`: Monthly earnings card displaying total duty hours, hourly rate breakdown, and submission CTA.
  - `BillingPage.tsx`: Dedicated billing tab containing duty itemized receipts and submission history.
