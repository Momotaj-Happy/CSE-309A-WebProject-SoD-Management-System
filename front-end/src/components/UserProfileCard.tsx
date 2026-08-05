import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Course, UnavailableSlot } from '../services/api';
import { Shield, Mail, Hash, Calendar, CheckCircle2, UserCheck, Key, Clock } from 'lucide-react';
import { ScheduleWeeklyGrid } from './ScheduleWeeklyGrid';

export const UserProfileCard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [unavailableSlots, setUnavailableSlots] = useState<UnavailableSlot[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  const fetchSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const res = await api.getSchedule();
      setCourses(res.courses || []);
      setUnavailableSlots(res.unavailable_slots || []);
    } catch (err) {
      console.error('Error loading schedule:', err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSchedule();
    }
  }, [user]);

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await api.deleteUnavailableSlot(slotId);
      fetchSchedule();
    } catch (err: any) {
      alert(err.message || 'Failed to delete slot');
    }
  };

  if (!user) return null;

  const getRoleCapabilities = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return [
          'IRAS Raw Schedule Parser (FR-PARSER-01)',
          'Personal Duty View (FR-TASK-02)',
          'Shift Swap Broadcasting (FR-PROXY-01)',
          'Monthly Duty Bill Submission (FR-BILL-01)'
        ];
      case 'FACULTY':
        return [
          'Assign Student Tasks & Duties (FR-TASK-03)',
          'Verify Student Duty Hours (FR-BILL-02)',
          'Review Task Logs & Notes (FR-TASK-04)'
        ];
      case 'LAB_MGR':
        return [
          'Create & Manage Duty Slots (FR-TASK-01)',
          'Oversee Student Shift Swaps (FR-PROXY-04)',
          'Modify User Roles (FR-AUTH-02)'
        ];
      case 'DEPT_MGR':
        return [
          'Final Financial Approval (FR-BILL-02)',
          'Administrative Role Management (FR-AUTH-03)',
          'Delete User Accounts & Access Controls'
        ];
      default:
        return [];
    }
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'STUDENT': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FACULTY': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'LAB_MGR': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DEPT_MGR': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Card Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{user.full_name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleStyle(user.role)}`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">{user.email}</p>
            <div className="flex items-center gap-2 pt-2 flex-wrap text-xs">
              <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 text-slate-700 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-600" />
                Dept ID: <strong className="font-mono text-indigo-700">{user.dept_id}</strong>
              </span>
              <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 text-slate-600 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Joined: {new Date(user.created_at).toLocaleDateString()}
              </span>
              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-lg flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                JWT Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Student Timetable Grid Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        {loadingSchedule ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading academic schedule...</div>
        ) : (
          <ScheduleWeeklyGrid
            courses={courses}
            unavailableSlots={unavailableSlots}
            onRefresh={fetchSchedule}
            onDeleteSlot={handleDeleteSlot}
          />
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Credentials */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            Account Credentials
          </h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Hash className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Department ID</div>
                <div className="text-xs font-mono font-bold text-slate-900">{user.dept_id}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Email Address</div>
                <div className="text-xs font-semibold text-slate-900">{user.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Authentication Token</div>
                <div className="text-xs font-mono text-slate-700">Bearer JWT (HS256 Standard)</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Role Privilege Level</div>
                <div className="text-xs font-semibold capitalize text-slate-900">{user.role.replace('_', ' ')} Access</div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Capabilities */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
            <Shield className="w-4 h-4 text-emerald-600" />
            Role Privileges & Permissions
          </h3>

          <ul className="space-y-2.5">
            {getRoleCapabilities(user.role).map((cap, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{cap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
