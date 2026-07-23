import React from 'react';
import { ShieldCheck, Check, X, Info } from 'lucide-react';

interface FeaturePermission {
  frId: string;
  module: string;
  featureName: string;
  student: boolean;
  faculty: boolean;
  labMgr: boolean;
  deptMgr: boolean;
}

const PERMISSIONS: FeaturePermission[] = [
  {
    frId: 'FR-AUTH-01',
    module: 'Auth & Security',
    featureName: 'Register Account with Dept ID & Email',
    student: true,
    faculty: true,
    labMgr: true,
    deptMgr: true
  },
  {
    frId: 'FR-AUTH-02',
    module: 'Auth & Security',
    featureName: 'Role-Based Access Control (RBAC)',
    student: true,
    faculty: true,
    labMgr: true,
    deptMgr: true
  },
  {
    frId: 'FR-AUTH-03',
    module: 'Auth & Security',
    featureName: 'Modify User Roles & Administrative Access',
    student: false,
    faculty: false,
    labMgr: true,
    deptMgr: true
  },
  {
    frId: 'FR-PARSER-01',
    module: 'Schedule Engine',
    featureName: 'Parse Raw IRAS Text & Generate Availability Grid',
    student: true,
    faculty: false,
    labMgr: false,
    deptMgr: false
  },
  {
    frId: 'FR-PARSER-03',
    module: 'Schedule Engine',
    featureName: 'Manually Override Unavailable Slots',
    student: true,
    faculty: false,
    labMgr: false,
    deptMgr: false
  },
  {
    frId: 'FR-TASK-01',
    module: 'Task & Duty',
    featureName: 'Create & Edit Duty Slot Templates',
    student: false,
    faculty: true,
    labMgr: true,
    deptMgr: true
  },
  {
    frId: 'FR-TASK-03',
    module: 'Task & Duty',
    featureName: 'Duty Overlap & Class Conflict Detection Alerts',
    student: true,
    faculty: true,
    labMgr: true,
    deptMgr: true
  },
  {
    frId: 'FR-PROXY-01',
    module: 'Proxy Engine',
    featureName: 'Initiate Shift Swap Broadcast Request',
    student: true,
    faculty: false,
    labMgr: false,
    deptMgr: false
  },
  {
    frId: 'FR-PROXY-03',
    module: 'Proxy Engine',
    featureName: 'Accept Shift Swap Request',
    student: true,
    faculty: false,
    labMgr: false,
    deptMgr: false
  },
  {
    frId: 'FR-BILL-01',
    module: 'Financial Pipeline',
    featureName: 'Aggregate Completed Duties into Monthly Bill',
    student: true,
    faculty: false,
    labMgr: false,
    deptMgr: false
  },
  {
    frId: 'FR-BILL-02',
    module: 'Financial Pipeline',
    featureName: 'Stage 1 Verification of Duty Hours',
    student: false,
    faculty: true,
    labMgr: true,
    deptMgr: false
  },
  {
    frId: 'FR-BILL-02B',
    module: 'Financial Pipeline',
    featureName: 'Stage 2 Final Financial Approval & Payroll Sign-off',
    student: false,
    faculty: false,
    labMgr: false,
    deptMgr: true
  },
  {
    frId: 'FR-EXPORT-01',
    module: 'Utility & Export',
    featureName: 'Export Weekly Schedule Image (PNG)',
    student: true,
    faculty: true,
    labMgr: true,
    deptMgr: true
  },
  {
    frId: 'FR-EXPORT-02',
    module: 'Utility & Export',
    featureName: 'Export Departmental Payroll & Duty Report (CSV)',
    student: false,
    faculty: false,
    labMgr: true,
    deptMgr: true
  }
];

export const RBACMatrix: React.FC = () => {
  return (
    <div className="rbac-container">
      {/* Header */}
      <div className="directory-header mb-6">
        <div>
          <h2 className="directory-title">
            <ShieldCheck className="w-6 h-6 text-emerald-400 inline-block mr-2" />
            Role-Based Access Control (RBAC) Permissions Matrix
          </h2>
          <p className="directory-subtitle">
            Comprehensive mapping of system privileges per user role (FR-AUTH-02)
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="alert alert-info mb-6">
        <Info className="w-5 h-5 mr-2 flex-shrink-0" />
        <span>
          Permissions are enforced server-side via Bearer JWT tokens and verified dynamically in FastAPI route dependencies.
        </span>
      </div>

      {/* Permissions Table */}
      <div className="glass-card table-card">
        <div className="table-responsive">
          <table className="user-table rbac-table">
            <thead>
              <tr>
                <th>FR ID</th>
                <th>System Module</th>
                <th>Feature / Capability</th>
                <th className="text-center">STUDENT</th>
                <th className="text-center">FACULTY</th>
                <th className="text-center">LAB_MGR</th>
                <th className="text-center">DEPT_MGR</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((perm, idx) => (
                <tr key={idx}>
                  <td>
                    <span className="font-mono text-xs font-semibold text-indigo-300">{perm.frId}</span>
                  </td>
                  <td>
                    <span className="text-xs font-semibold text-slate-300 bg-slate-800/60 px-2 py-1 rounded">
                      {perm.module}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-slate-100">{perm.featureName}</span>
                  </td>
                  <td className="text-center">
                    {perm.student ? (
                      <span className="badge-perm perm-allow">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="badge-perm perm-deny">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    {perm.faculty ? (
                      <span className="badge-perm perm-allow">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="badge-perm perm-deny">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    {perm.labMgr ? (
                      <span className="badge-perm perm-allow">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="badge-perm perm-deny">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="text-center">
                    {perm.deptMgr ? (
                      <span className="badge-perm perm-allow">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="badge-perm perm-deny">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
