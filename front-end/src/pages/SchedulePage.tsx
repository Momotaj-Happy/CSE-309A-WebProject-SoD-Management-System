import { useState } from 'react';
import { ScheduleInput } from '../components/ScheduleInput';
import { ScheduleList } from '../components/ScheduleList';
import { JsonDisplay } from '../components/JsonDisplay';
import { useScheduleParser } from '../hooks/useScheduleParser';
import { api } from '../services/api';
import { Save, CheckCircle2 } from 'lucide-react';

export const SchedulePage = () => {
  const { courses, loading, error, parseText } = useScheduleParser();
  const [showJson, setShowJson] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSchedule = async () => {
    if (courses.length === 0) return;
    setSaving(true);
    try {
      await api.saveSchedule(courses);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  // Calculate theory vs. lab course breakdown
  const labCount = courses.filter(
    (c) => c.id.endsWith('L') || c.name.toLowerCase().includes('lab')
  ).length;
  const theoryCount = courses.length - labCount;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              IRAS Parser Engine
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-xs font-medium">SoD Management System</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">IRAS Class Schedule Parser</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Parse raw academic schedule text to extract course timetables and availability.
          </p>
        </div>

        {courses.length > 0 && (
          <div className="flex items-center space-x-3 self-start md:self-auto">
            <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{courses.length} Courses Parsed</span>
            </div>

            <button
              onClick={handleSaveSchedule}
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Schedule to Profile'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Academic schedule saved to your profile successfully! Conflict detection engine active.</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start space-x-2">
          <span className="font-semibold">Parsing Error:</span>
          <span>{error}</span>
        </div>
      )}

      {/* Schedule Input Card */}
      <ScheduleInput onParse={parseText} loading={loading} />

      {/* Analytics / Metric Summary Cards */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{courses.length}</span>
              <span className="text-xs text-slate-500">Course Slots</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Theory Courses</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-indigo-600">{theoryCount}</span>
              <span className="text-xs text-slate-500">Lecture Sections</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Lab Sessions</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-amber-600">{labCount}</span>
              <span className="text-xs text-slate-500">Lab Sections</span>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Schedule Section */}
      {courses.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Extracted Course Timetable</h2>
            
            <button
              onClick={() => setShowJson(!showJson)}
              className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform ${showJson ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>{showJson ? 'Hide Raw JSON' : 'Inspect Raw JSON'}</span>
            </button>
          </div>

          {/* Table List */}
          <ScheduleList courses={courses} />

          {/* Collapsible JSON Output */}
          {showJson && (
            <div className="pt-2">
              <JsonDisplay courses={courses} />
            </div>
          )}
        </div>
      ) : (
        !loading && (
          <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No Schedule Parsed Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Paste your raw schedule text into the input box above and click Parse Schedule to extract your class timetable.
            </p>
          </div>
        )
      )}
    </div>
  );
};