import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export const StudentBillSummary: React.FC = () => {
  const [bill, setBill] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentBill();
  }, []);

  const fetchCurrentBill = async () => {
    try {
      setLoading(true);
      const data = await api.getCurrentBill();
      setBill(data);
    } catch (err: any) {
      setFeedback(err.message || 'Failed to fetch current bill');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const submitted = await api.submitBill('July', 2026, notes);
      setBill(submitted);
      setFeedback('Monthly bill submitted successfully for Faculty Verification!');
    } catch (err: any) {
      setFeedback(err.message || 'Failed to submit bill');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ color: '#94a3b8', padding: '16px' }}>Loading billing summary...</div>;

  return (
    <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', color: '#f8fafc', marginBottom: '24px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#4ade80' }}>
            Monthly Billing & Earnings Summary
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>
            Aggregate completed duty task hours and submit monthly financial statements.
          </p>
        </div>
        {bill && (
          <span style={{ fontSize: '0.875rem', fontWeight: 600, padding: '4px 12px', borderRadius: '16px', background: bill.status === 'APPROVED' ? '#16a34a33' : '#3b82f633', color: bill.status === 'APPROVED' ? '#4ade80' : '#60a5fa' }}>
            Status: {bill.status}
          </span>
        )}
      </div>

      {feedback && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#16a34a1a', border: '1px solid #16a34a', color: '#4ade80', marginBottom: '16px', fontSize: '0.875rem' }}>
          {feedback}
        </div>
      )}

      {bill && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Billing Period</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>{bill.month} {bill.year}</div>
            </div>
            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Logged Hours</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>{bill.total_hours} hrs</div>
            </div>
            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Earnings</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4ade80', marginTop: '4px' }}>${bill.total_amount.toFixed(2)}</div>
            </div>
          </div>

          {bill.items && bill.items.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.9375rem', color: '#cbd5e1' }}>Itemized Completed Duties</h4>
              <div style={{ background: '#0f172a', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
                <table style={{ width: '100%', fontSize: '0.8125rem', color: '#cbd5e1', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left', background: '#1e293b' }}>
                      <th style={{ padding: '8px 12px' }}>Duty Title</th>
                      <th style={{ padding: '8px 12px' }}>Date</th>
                      <th style={{ padding: '8px 12px' }}>Hours</th>
                      <th style={{ padding: '8px 12px' }}>Hourly Rate</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '8px 12px' }}>{item.title}</td>
                        <td style={{ padding: '8px 12px' }}>{item.date}</td>
                        <td style={{ padding: '8px 12px' }}>{item.hours} hrs</td>
                        <td style={{ padding: '8px 12px' }}>${item.hourly_rate}/hr</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#4ade80' }}>${item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {bill.status === 'DRAFT' && (
            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <textarea
                placeholder="Add optional submission notes for faculty verification..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#f8fafc', fontSize: '0.875rem' }}
              />
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', alignSelf: 'flex-start' }}
              >
                {submitting ? 'Submitting...' : 'Submit Monthly Bill for Verification'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
