import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { DutyTask } from '../types/task';
import { Clock, Calendar, MapPin, UserCheck, RefreshCw } from 'lucide-react';

export const StudentDuties: React.FC = () => {
  const { user } = useAuth();
  const [duties, setDuties] = useState<DutyTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStudentDuties = async () => {
    setLoading(true);
    try {
      const data = await api.listTasks();
      setDuties(data);
    } catch (err) {
      console.error('Error fetching student duties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDuties();
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            My Duty Schedule & Timetable
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View your assigned departmental duties, shift timings, and locations
          </p>
        </div>

        <button
          onClick={fetchStudentDuties}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs transition-all cursor-pointer"
          title="Refresh Duties"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Duty List Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <p className="text-xs">Loading duty schedule...</p>
          </div>
        ) : duties.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Clock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-xs">No duty tasks currently assigned.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {duties.map((duty) => (
              <div key={duty.id} className="p-5 hover:bg-slate-50/80 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {duty.task_type} DUTY
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{duty.title}</h3>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Location: <strong className="text-slate-800">{duty.location}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        Supervisor: <strong className="text-slate-800">{duty.assigned_by}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-700 pt-1">
                      <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Date: {duty.scheduled_date}
                      </span>
                      <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Timing: {duty.start_time} - {duty.end_time}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      duty.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {duty.status}
                    </span>
                  </div>
                </div>

                {duty.log_notes && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                    <strong>Instructions:</strong> {duty.log_notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
