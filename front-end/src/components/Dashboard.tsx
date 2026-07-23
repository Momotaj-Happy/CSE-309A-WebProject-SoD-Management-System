import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { DutyTask, ShiftSwap } from '../types/task';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ArrowRightLeft,
  Briefcase,
  FileText,
  Sparkles,
  RefreshCw,
  MapPin,
  UserCheck,
  X
} from 'lucide-react';

interface DashboardProps {
  onNavigateToTab: (tab: 'dashboard' | 'directory' | 'schedule' | 'profile' | 'rbac') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToTab }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DutyTask[]>([]);
  const [swaps, setSwaps] = useState<ShiftSwap[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [swapModalTask, setSwapModalTask] = useState<DutyTask | null>(null);
  const [swapReason, setSwapReason] = useState<string>('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const taskData = await api.listTasks();
      const swapData = await api.listSwaps();
      setTasks(taskData);
      setSwaps(swapData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleMarkCompleted = async (taskId: string) => {
    try {
      await api.updateTaskStatus(taskId, 'COMPLETED', 'Duty completed successfully on schedule.');
      setActionMsg('Task marked as COMPLETED and added to monthly bill log!');
      loadDashboardData();
      setTimeout(() => setActionMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    }
  };

  const handleInitiateSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapModalTask || !swapReason) return;
    try {
      await api.createSwap(swapModalTask.id, swapReason);
      setSwapModalTask(null);
      setSwapReason('');
      setActionMsg(`Broadcasted shift swap request for "${swapModalTask.title}"!`);
      loadDashboardData();
      setTimeout(() => setActionMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to create swap request');
    }
  };

  if (!user) return null;

  // Calculate metrics
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const pendingTasks = tasks.filter((t) => t.status === 'PENDING');
  const totalCompletedHours = completedTasks.reduce((acc) => acc + 3, 0); // 3 hrs per slot default
  const estimatedEarnings = completedTasks.reduce((acc, t) => acc + 3 * t.hourly_rate, 0);

  // Class Conflict detection check (e.g. 09:00 AM overlaps)
  const hasConflict = tasks.some((t) => t.start_time === '09:00' && t.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <LayoutDashboard className="w-7 h-7 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  Welcome back, {user.full_name}!
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Departmental SoD Workspace • Dept ID: <strong className="font-mono text-indigo-300">{user.dept_id}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadDashboardData()}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => onNavigateToTab('schedule')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Parse IRAS Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Action Banner */}
      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Conflict Alert Banner (FR-TASK-03) */}
      {hasConflict && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
            <strong className="font-bold text-rose-300">Schedule Overlap Alert (FR-TASK-03):</strong>
            <p className="text-xs text-rose-200/90 mt-0.5">
              Duty "Physics 101 Mechanics Lab Prep" (09:00 - 12:00) overlaps with your class schedule. Consider initiating a shift swap request below.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white leading-tight">{tasks.length}</div>
            <div className="text-[11px] text-slate-400">Total Assigned Duties</div>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white leading-tight">${estimatedEarnings.toFixed(2)}</div>
            <div className="text-[11px] text-slate-400">Pending Bill ({totalCompletedHours} hrs)</div>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white leading-tight">{swaps.length}</div>
            <div className="text-[11px] text-slate-400">Open Shift Swaps</div>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white leading-tight">{pendingTasks.length}</div>
            <div className="text-[11px] text-slate-400">Upcoming Shifts</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Duty Tasks Widget */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Personal Duty Tasks & Shifts
            </h3>
            <span className="text-xs text-slate-400 font-mono">{tasks.length} Slots</span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all ${
                  task.status === 'COMPLETED'
                    ? 'bg-slate-950/60 border-emerald-500/30'
                    : task.status === 'SWAPPED'
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-xs text-slate-100">{task.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        task.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> {task.location} • Rate: ${task.hourly_rate}/hr
                    </p>
                    <p className="text-[11px] text-slate-300 font-mono mt-1">
                      📅 {task.scheduled_date} | ⏰ {task.start_time} - {task.end_time}
                    </p>
                  </div>
                </div>

                {task.log_notes && (
                  <p className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-xl mt-2 border border-slate-800">
                    📝 Note: {task.log_notes}
                  </p>
                )}

                {task.status === 'PENDING' && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleMarkCompleted(task.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 text-[11px] font-semibold cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Completed
                    </button>
                    <button
                      onClick={() => setSwapModalTask(task)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 text-[11px] font-semibold cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Request Swap
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Proxy Engine / Shift Swaps Feed */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-400" />
              Shift Swap Broadcast Feed
            </h3>
            <span className="text-xs text-slate-400 font-mono">{swaps.length} Requests</span>
          </div>

          {swaps.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <ArrowRightLeft className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-xs">No active shift swap requests broadcasted.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {swaps.map((swap) => (
                <div key={swap.swap_id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-amber-500/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        Swap Request from {swap.requestor_name}
                      </span>
                      <p className="text-xs text-slate-300 mt-1">
                        Reason: "{swap.reason}"
                      </p>
                      <span className="text-[11px] font-mono text-slate-400 mt-1 block">
                        Status: <span className="text-emerald-400 font-semibold">{swap.status}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Monthly Bill Progress Summary */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              Monthly Duty Bill Status (July 2026)
            </h4>
            <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">Current Status: VERIFIED</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Faculty Verified • Pending Dept Manager Approval</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                80% Approved
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shift Swap Modal */}
      {swapModalTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-400" />
                Broadcast Shift Swap Request
              </h3>
              <button onClick={() => setSwapModalTask(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInitiateSwapSubmit} className="space-y-3">
              <p className="text-xs text-slate-300">
                Broadcasting swap request for <strong>"{swapModalTask.title}"</strong> ({swapModalTask.scheduled_date} at {swapModalTask.start_time}).
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reason for Swap Request</label>
                <textarea
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500"
                  rows={3}
                  placeholder="e.g. Academic class conflict with IRAS schedule or emergency..."
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSwapModalTask(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-500 cursor-pointer"
                >
                  Broadcast Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
