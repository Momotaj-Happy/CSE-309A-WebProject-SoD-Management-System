import { ScheduleInput } from '../components/ScheduleInput';
import { ScheduleList } from '../components/ScheduleList';
import { JsonDisplay } from '../components/JsonDisplay';
import { useScheduleParser } from '../hooks/useScheduleParser';

export const SchedulePage = () => {
  const { courses, loading, error, parseText } = useScheduleParser();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Schedule Parser</h1>
      
      <ScheduleInput onParse={parseText} loading={loading} />

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
          {error}
        </div>
      )}

      <ScheduleList courses={courses} />
      <JsonDisplay courses={courses} />
    </div>
  );
};