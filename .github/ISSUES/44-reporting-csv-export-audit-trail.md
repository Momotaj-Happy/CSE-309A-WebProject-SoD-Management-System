# Issue #44: Feature 5 - Reporting, CSV Export & Swap Audit Trail Utility (Zaid)

## Description
Implement full-stack REST API endpoints and React UI components for departmental financial reporting, downloadable payroll CSV report generation, and immutable shift swap transaction audit log viewing.

## Developer Assignment
- **Developer:** Zaid (`zaid-fahad`)
- **Checkpoint:** Checkpoint 2 - Task 2.2
- **Module:** Feature 5 - Reporting, CSV Export & Swap Audit Trail

---

## Technical Specifications & Requirements

### 1. Backend Specifications (`FastAPI`)
- **Reporting & Export Routes (`back-end/api/routes/export.py`):**
  - `GET /api/v1/export/report/csv` (200 OK) - Generates and streams downloadable CSV spreadsheet of monthly duty billings and student earnings (`Content-Disposition: attachment; filename=sod_payroll_report.csv`).
  - `GET /api/v1/tasks/swaps/audit-log` (200 OK) - Retrieves structured immutable audit trail of shift swap transfers.
- **Automated Unit Tests:** `back-end/tests/test_reporting_export.py`

### 2. Frontend Specifications (`React + TypeScript + Vite`)
- **API Client (`front-end/src/services/api.ts`):** `downloadPayrollCsv()`, `getSwapAuditLog()`.
- **Components:**
  - `ExportToolbar.tsx`: Download controls and export filter bar.
  - `SwapAuditTable.tsx`: Full audit table displaying shift swap history with search and event type filtering.
