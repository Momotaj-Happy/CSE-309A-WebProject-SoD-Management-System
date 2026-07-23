import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { User } from '../types/user';
import type { DutyTask, TaskType } from '../types/task';
import { PlusCircle, MapPin, UserCheck, CheckCircle2, Users } from 'lucide-react';

export const FacultyTaskAssignment: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<DutyTask[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('LAB');
  const [location, setLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState('2026-07-25');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [hourlyRate, setHourlyRate] = useState('18.50');

  const loadData = async () => {
    try {
      const userList = await api.listUsers('STUDENT');
      const taskList = await api.listTasks();
      setStudents(userList);
      setAssignedTasks(taskList);
      if (userList.length > 0) {
        setSelectedStudentId(userList[0].id);
      }
    } catch (err) {
      console.error('Error loading faculty assignment data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !selectedStudentId) return;

    try {
      const selectedStudent = students.find((s) => s.id === selectedStudentId);
      await api.createTask({
        title,
        task_type: taskType,
        location,
        scheduled_date: scheduledDate,
        start_time: startTime,
        end_time: endTime,
        hourly_rate: parseFloat(hourlyRate) || 18.50,
        student_id: selectedStudentId,
        assigned_by: user?.full_name || 'Faculty Member'
      });

      setShowAddForm(false);
      setTitle('');
      setLocation('');
      setFeedback(`Task "${title}" assigned to student ${selectedStudent?.full_name || ''} successfully!`);
      loadData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to assign task');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            Assign Student Duty Tasks & Timetables
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review student schedules and assign lab, exam, or research duties
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          Assign New Duty Task
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Task Creation Form Card */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            Create & Assign Duty Task to Student
          </h3>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student</label>
                <select
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600 cursor-pointer"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.dept_id}) - {s.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duty Title</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600"
                  placeholder="e.g. Physics 101 Lab Preparation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duty Type</label>
                <select
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600 cursor-pointer"
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as TaskType)}
                >
                  <option value="LAB">LAB DUTY</option>
                  <option value="EXAM">EXAM INVIGILATION</option>
                  <option value="FACULTY">FACULTY RESEARCH</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600"
                  placeholder="e.g. Science Lab 201"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hourly Rate ($)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600"
                  placeholder="18.50"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600 font-mono"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600 font-mono"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                <input
                  type="time"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-600 font-mono"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer shadow-xs"
              >
                Assign Duty Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student Timetables & Assigned Tasks List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            Assigned Student Duty Timetable ({assignedTasks.length} Assigned Tasks)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="p-4">Duty Task</th>
                <th className="p-4">Assigned Student</th>
                <th className="p-4">Location</th>
                <th className="p-4">Date & Timing</th>
                <th className="p-4">Assigned By</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {assignedTasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-semibold text-slate-900">{t.title}</td>
                  <td className="p-4">
                    <span className="font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                      Momotaj Happy (SOD-2024-001)
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t.location}
                  </td>
                  <td className="p-4 font-mono text-slate-700">
                    <div>Date: {t.scheduled_date}</div>
                    <div className="text-[11px] text-slate-500">Time: {t.start_time} - {t.end_time}</div>
                  </td>
                  <td className="p-4 text-slate-600">{t.assigned_by}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {t.status}
                    </span>
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
