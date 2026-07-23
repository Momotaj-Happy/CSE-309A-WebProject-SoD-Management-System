import React from 'react';
import { type Course } from '../services/api';

interface Props {
  courses: Course[];
}

export const JsonDisplay: React.FC<Props> = ({ courses }) => {
  if (courses.length === 0) return null;

  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
      <span className="text-xs font-mono text-slate-400 block mb-2">JSON Result:</span>
      <pre className="text-xs font-mono text-emerald-400 overflow-x-auto max-h-60">
        {JSON.stringify(courses, null, 2)}
      </pre>
    </div>
  );
};