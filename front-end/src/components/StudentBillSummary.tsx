import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Clock, CheckCircle2, FileText, Send, ShieldCheck } from 'lucide-react';

export const StudentBillSummary: React.FC = () => {
  const { user } = useAuth();
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchCurrentBill = async () => {
    setLoading(true);
    try {
      const data = await api.getCurrentBill('2026-07');
      setBill(data);
    } catch (err: any) {
      console.error('Error fetching current bill:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentBill();
  }, []);

  const handleSubmitBill = async () => {
    if (!bill) return;
    setSubmitting(true);
    try {
      const updated = await api.submitBill('2026-07');
      setBill(updated);
      setActionMsg('Monthly duty bill submitted successfully! Sent to Faculty for verification.');
      setTimeout(() => setActionMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit monthly bill');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Student Monthly Duty Billing & Stipend Statement
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            July 2026 Monthly Statement • Student ID: <strong className="font-mono text-indigo-600">{user.dept_id}</strong>
          </p>
        </div>

        {bill && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              bill.status === 'DRAFT'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : bill.status === 'SUBMITTED'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : bill.status === 'VERIFIED'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            Bill Status: {bill.status}
          </span>
        )}
      </div>

      {/* Action Toast */}
      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400 font-medium">Loading monthly billing statement...</div>
      ) : !bill ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
          No active billing statement found.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">${bill.total_amount.toFixed(2)}</div>
                <div className="text-[11px] text-slate-500">Total Calculated Stipend</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-700" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">{bill.total_hours} Hours</div>
                <div className="text-[11px] text-slate-500">Billable Completed Duties</div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">{bill.items.length} Shifts</div>
                <div className="text-[11px] text-slate-500">Completed Duty Items</div>
              </div>
            </div>
          </div>

          {/* Itemized Duty Receipts Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Itemized Completed Duty Receipts
            </h4>

            {bill.items.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
                No completed duties recorded for this month yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">Duty Task Title</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Hours</th>
                      <th className="py-2.5 px-3">Hourly Rate</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {bill.items.map((item: any) => (
                      <tr key={item.task_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{item.title}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{item.scheduled_date}</td>
                        <td className="py-2.5 px-3 text-slate-700">{item.hours} hrs</td>
                        <td className="py-2.5 px-3 text-slate-700">${item.hourly_rate}/hr</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          ${item.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Submission Action & Timeline */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Multi-Tier Financial Pipeline: Student Submit → Faculty Verification → Dept Manager Approval
              </div>
              {bill.submitted_at && (
                <div className="text-[11px] text-slate-500 font-mono">
                  Submitted on: {new Date(bill.submitted_at).toLocaleString()}
                </div>
              )}
            </div>

            {bill.status === 'DRAFT' && (
              <button
                onClick={handleSubmitBill}
                disabled={submitting || bill.items.length === 0}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Monthly Duty Bill'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
