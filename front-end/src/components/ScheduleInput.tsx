import React, { useState } from 'react';

interface Props {
  onParse: (text: string) => void;
  loading: boolean;
}

export const ScheduleInput: React.FC<Props> = ({ onParse, loading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onParse(text);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          Paste IRAS Schedule Text
        </label>
        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste raw table directly from IRAS..."
          className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Processing...' : 'Parse Schedule'}
        </button>
      </form>
    </div>
  );
};