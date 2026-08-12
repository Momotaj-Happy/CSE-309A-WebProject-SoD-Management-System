import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const ManagerFinancialApproval: React.FC = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionNotes, setActionNotes] = useState<{ [key: string]: string }>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingBills();
      setBills(data);
    } catch (err: any) {
      setFeedback(err.message || 'Failed to fetch bills for manager signoff');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (billId: string) => {
    try {
      const notes = actionNotes[billId] || 'Financial payout approved';
      await api.approveBill(billId, notes);
      setFeedback(`Bill #${billId.slice(0, 8)} granted final financial approval!`);
      fetchPending();
    } catch (err: any) {
      setFeedback(err.message || 'Approval failed');
    }
  };

  return (
    <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', color: '#f8fafc', marginBottom: '24px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#a855f7' }}>
            Department Manager Financial Approval Console
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
            Final departmental budget signoff and payout authorization for verified student bills.
          </p>
        </div>
        <button
          onClick={fetchPending}
          style={{ padding: '8px 16px', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          Refresh Console
        </button>
      </div>

      {feedback && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#a855f71a', border: '1px solid #a855f7', color: '#c084fc', marginBottom: '16px', fontSize: '0.875rem' }}>
          {feedback}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading verified bills...</p>
      ) : bills.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', background: '#0f172a', borderRadius: '8px', color: '#94a3b8' }}>
          No verified student bills pending final manager financial approval.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bills.map((bill) => (
            <div key={bill.bill_id} style={{ background: '#0f172a', borderRadius: '8px', padding: '16px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#f1f5f9' }}>{bill.student_name}</h4>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Month: {bill.month} {bill.year} | Total Hours: {bill.total_hours} hrs</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4ade80' }}>${bill.total_amount.toFixed(2)}</div>
                  <span style={{ fontSize: '0.75rem', background: '#a855f733', color: '#c084fc', padding: '2px 8px', borderRadius: '12px' }}>{bill.status}</span>
                </div>
              </div>

              {bill.notes && (
                <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', background: '#1e293b', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px' }}>
                  <strong>Faculty / Verification Notes:</strong> {bill.notes}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Manager signoff notes / payout authorization code..."
                  value={actionNotes[bill.bill_id] || ''}
                  onChange={(e) => setActionNotes({ ...actionNotes, [bill.bill_id]: e.target.value })}
                  style={{ flex: 1, padding: '8px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', fontSize: '0.875rem' }}
                />
                <button
                  onClick={() => handleApprove(bill.bill_id)}
                  style={{ padding: '8px 20px', background: '#9333ea', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  Authorize Payout
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
