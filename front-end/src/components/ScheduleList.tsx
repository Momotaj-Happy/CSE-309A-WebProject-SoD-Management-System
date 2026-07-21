import React from 'react';
import { type Course } from '../services/api';

interface Props {
  courses: Course[];
}

export const ScheduleList: React.FC<Props> = ({ courses }) => {
  if (courses.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
          <tr>
            <th className="p-3">Course ID</th>
            <th className="p-3">Course Name</th>
            <th className="p-3">Sec</th>
            <th className="p-3">Room</th>
            <th className="p-3">Days</th>
            <th className="p-3">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {courses.map((c, i) => (
            <tr key={i} className="hover:bg-slate-50">
              <td className="p-3 font-mono font-bold text-indigo-600">{c.id}</td>
              <td className="p-3 text-slate-800">{c.name}</td>
              <td className="p-3 text-slate-600">{c.section}</td>
              <td className="p-3 font-mono text-slate-600">{c.room}</td>
              <td className="p-3 font-semibold text-slate-700">{c.days}</td>
              <td className="p-3 text-slate-600">{c.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};