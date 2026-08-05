import React, { useState } from 'react';
import type { Course, UnavailableSlot } from '../services/api';
import { Calendar, Clock, PlusCircle, Trash2, Ban } from 'lucide-react';
import { UnavailableSlotModal } from './UnavailableSlotModal';

interface ScheduleWeeklyGridProps {
  courses: Course[];
  unavailableSlots: UnavailableSlot[];
  onRefresh: () => void;
  onDeleteSlot?: (slotId: string) => void;
  isReadOnly?: boolean;
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_LABELS: Record<string, string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday'
};

const DAY_CODE_MAP: Record<string, string[]> = {
  MON: ['MON', 'M'],
  TUE: ['TUE', 'T'],
  WED: ['WED', 'W'],
  THU: ['THU', 'R'],
  FRI: ['FRI', 'F'],
  SAT: ['SAT', 'A'],
  SUN: ['SUN', 'S']
};

export const ScheduleWeeklyGrid: React.FC<ScheduleWeeklyGridProps> = ({
  courses,
  unavailableSlots,
  onRefresh,
  onDeleteSlot,
  isReadOnly = false
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Helper to check if course belongs to day
  const getCoursesForDay = (day: string) => {
    const validCodes = DAY_CODE_MAP[day] || [day];
    return courses.filter((c) => {
      const d = c.days.toUpperCase();
      return validCodes.some((code) => d.includes(code));
    });
  };

  // Helper to check if unavailable slot belongs to day
  const getSlotsForDay = (day: string) => {
    return unavailableSlots.filter((s) => s.day.toUpperCase() === day);
  };

  return (
    <div className="space-y-4">
      {/* Grid Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Weekly Academic & Availability Grid
          </h3>
          <p className="text-[11px] text-slate-500">
            View course timetable slots and custom marked unavailable windows
          </p>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Mark Unavailable Slot</span>
          </button>
        )}
      </div>

      {/* 7-Day Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {DAYS.map((day) => {
          const dayCourses = getCoursesForDay(day);
          const daySlots = getSlotsForDay(day);
          const isEmpty = dayCourses.length === 0 && daySlots.length === 0;

          return (
            <div
              key={day}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col min-h-[160px]"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-900">{day}</span>
                <span className="text-[10px] text-slate-500 font-medium">{DAY_LABELS[day]}</span>
              </div>

              {/* Items Container */}
              <div className="space-y-2 flex-1">
                {/* Course Items */}
                {dayCourses.map((c) => (
                  <div
                    key={`${c.id}-${day}`}
                    className="bg-indigo-50/90 border border-indigo-200 rounded-xl p-2 text-xs shadow-2xs"
                  >
                    <div className="font-bold text-indigo-900 text-[11px] leading-tight">{c.id}</div>
                    <div className="text-[10px] font-medium text-indigo-700 truncate">{c.name}</div>
                    <div className="text-[10px] text-indigo-600 font-mono flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-indigo-400" /> {c.time}
                    </div>
                    <div className="text-[9px] text-indigo-500 mt-0.5">Room: {c.room} (Sec {c.section})</div>
                  </div>
                ))}

                {/* Custom Unavailable Slots */}
                {daySlots.map((s) => (
                  <div
                    key={s.id}
                    className="bg-rose-50 border border-rose-200 rounded-xl p-2 text-xs relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900 text-[10px] flex items-center gap-1">
                        <Ban className="w-3 h-3 text-rose-500" /> Unavailable
                      </span>
                      {!isReadOnly && onDeleteSlot && (
                        <button
                          onClick={() => onDeleteSlot(s.id)}
                          className="text-rose-400 hover:text-rose-700 cursor-pointer p-0.5"
                          title="Delete slot"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="text-[10px] text-rose-700 font-mono mt-0.5">
                      {s.start_time} - {s.end_time}
                    </div>
                    {s.note && <div className="text-[9px] text-rose-600 italic mt-0.5">{s.note}</div>}
                  </div>
                ))}

                {isEmpty && (
                  <div className="h-full flex items-center justify-center text-[10px] text-slate-400 font-medium py-4">
                    Free Day
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Unavailable Slot Modal */}
      {showAddModal && (
        <UnavailableSlotModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};
