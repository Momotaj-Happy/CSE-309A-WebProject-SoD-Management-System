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
    featureName: 'Stage 2 Final Financial Approval & Sign-off',
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Role-Based Access Control (RBAC) Permissions Matrix
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Comprehensive mapping of system privileges per user role (FR-AUTH-02)
        </p>
      </div>

      {/* Info Banner */}
      <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>
          Permissions are enforced server-side via Bearer JWT tokens and verified dynamically in FastAPI route dependencies.
        </span>
      </div>

      {/* Matrix Table */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">FR ID</th>
                <th className="p-4">System Module</th>
                <th className="p-4">Feature / Capability</th>
                <th className="p-4 text-center">STUDENT</th>
                <th className="p-4 text-center">FACULTY</th>
                <th className="p-4 text-center">LAB_MGR</th>
                <th className="p-4 text-center">DEPT_MGR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {PERMISSIONS.map((perm, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-indigo-400">{perm.frId}</td>
                  <td className="p-4">
                    <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-semibold text-slate-300 text-[11px]">
                      {perm.module}
                    </span>
                  </td>
                  <td className="p-4 text-slate-100 font-medium">{perm.featureName}</td>
                  <td className="p-4 text-center">
                    {perm.student ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-600 inline-flex items-center justify-center">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {perm.faculty ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-600 inline-flex items-center justify-center">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {perm.labMgr ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-600 inline-flex items-center justify-center">
                        <X className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {perm.deptMgr ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-600 inline-flex items-center justify-center">
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
