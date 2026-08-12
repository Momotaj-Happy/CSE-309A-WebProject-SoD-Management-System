import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldCheck, Search } from 'lucide-react';

export const SwapAuditTable: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const logs = await api.getSwapAuditLog();
      setAuditLogs(logs);
    } catch (err) {
      console.error('Error loading audit log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.performed_by.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.event_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Immutable Shift Swap Audit Trail
          </h3>
          <p className="text-[11px] text-slate-500">
            System log recording all shift swap creations, transfers, and cancellations
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400 font-medium">Loading audit logs...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
          No audit log entries matched your filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Performed By</th>
                <th className="py-2.5 px-3">Details & Notes</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        log.event_type === 'SWAP_CREATED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : log.event_type === 'SWAP_ACCEPTED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {log.event_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 font-semibold">{log.performed_by}</td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-md truncate">{log.details}</td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[10px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
