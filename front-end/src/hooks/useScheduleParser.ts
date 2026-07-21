import { useState } from 'react';
import { type Course, parseScheduleApi } from '../services/api';

export function useScheduleParser() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const parseText = async (rawText: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await parseScheduleApi(rawText);
      setCourses(res.courses);
    } catch (err: any) {
      setError(err.message || 'Error processing raw text');
    } finally {
      setLoading(false);
    }
  };

  return { courses, loading, error, parseText };
}