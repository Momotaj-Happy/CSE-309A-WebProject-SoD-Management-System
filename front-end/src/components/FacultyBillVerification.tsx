import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const FacultyBillVerification: React.FC = () => {
  const [pendingBills, setPendingBills] = useState<any[]>([]);
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
      setPendingBills(data);
    } catch (err: any) {
      setFeedback(err.message || 'Failed to fetch pending bills');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (billId: string) => {
    try {
      const notes = actionNotes[billId] || 'Verified duty hours';
      await api.verifyBill(billId, notes);
      setFeedback(`Bill #${billId.slice(0, 8)} successfully verified!`);
      fetchPending();
    } catch (err: any) {
      setFeedback(err.message || 'Verification failed');
    }
  };

  const handleReject = async (billId: string) => {
    try {
      const notes = actionNotes[billId] || 'Returned for revision';
      await api.rejectBill(billId, notes);
      setFeedback(`Bill #${billId.slice(0, 8)} returned to student.`);
      fetchPending();
    } catch (err: any) {
      setFeedback(err.message || 'Rejection failed');
    }
  };

  return (
    <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', color: '#f8fafc', marginBottom: '24px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#38bdf8' }}>
            Faculty Bill Verification Pipeline
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
            Review student duty hours and verify monthly bill submissions before department manager payout.
          </p>
        </div>
        <button
          onClick={fetchPending}
          style={{ padding: '8px 16px', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}
        >
          Refresh Pending
        </button>
      </div>

      {feedback && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#0284c71a', border: '1px solid #0284c7', color: '#38bdf8', marginBottom: '16px', fontSize: '0.875rem' }}>
          {feedback}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading pending bill submissions...</p>
      ) : pendingBills.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', background: '#0f172a', borderRadius: '8px', color: '#94a3b8' }}>
          No pending student bills awaiting faculty verification.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pendingBills.map((bill) => (
            <div key={bill.bill_id} style={{ background: '#0f172a', borderRadius: '8px', padding: '16px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#f1f5f9' }}>{bill.student_name}</h4>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Month: {bill.month} {bill.year} | ID: {bill.student_id}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#4ade80' }}>${bill.total_amount.toFixed(2)}</div>
                  <span style={{ fontSize: '0.75rem', background: '#3b82f633', color: '#60a5fa', padding: '2px 8px', borderRadius: '12px' }}>{bill.status}</span>
                </div>
              </div>

              {bill.items && bill.items.length > 0 && (
                <table style={{ width: '100%', fontSize: '0.8125rem', color: '#cbd5e1', marginBottom: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left' }}>
                      <th style={{ padding: '6px' }}>Duty Title</th>
                      <th style={{ padding: '6px' }}>Date</th>
                      <th style={{ padding: '6px' }}>Hours</th>
                      <th style={{ padding: '6px' }}>Rate</th>
                      <th style={{ padding: '6px', textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '6px' }}>{item.title}</td>
                        <td style={{ padding: '6px' }}>{item.date}</td>
                        <td style={{ padding: '6px' }}>{item.hours} hrs</td>
                        <td style={{ padding: '6px' }}>${item.hourly_rate}/hr</td>
                        <td style={{ padding: '6px', textAlign: 'right', color: '#4ade80' }}>${item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Verification notes / feedback..."
                  value={actionNotes[bill.bill_id] || ''}
                  onChange={(e) => setActionNotes({ ...actionNotes, [bill.bill_id]: e.target.value })}
                  style={{ flex: 1, padding: '8px 12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', fontSize: '0.875rem' }}
                />
                <button
                  onClick={() => handleVerify(bill.bill_id)}
                  style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  Verify Bill
                </button>
                <button
                  onClick={() => handleReject(bill.bill_id)}
                  style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  Return / Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
