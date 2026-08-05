import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ShiftSwap } from '../types/task';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface ShiftSwapFeedProps {
  onRefresh?: () => void;
}

export const ShiftSwapFeed: React.FC<ShiftSwapFeedProps> = ({ onRefresh }) => {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState<ShiftSwap[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchSwaps = async () => {
    setLoading(true);
    try {
      const data = await api.listSwaps();
      setSwaps(data);
    } catch (err: any) {
      console.error('Error fetching swaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, []);

  const handleAcceptSwap = async (swapId: string) => {
    try {
      await api.acceptSwap(swapId);
      setActionMessage('Shift swap accepted successfully! Duty assigned to your schedule.');
      setTimeout(() => setActionMessage(null), 4000);
      fetchSwaps();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to accept swap');
    }
  };

  const handleCancelSwap = async (swapId: string) => {
    try {
      await api.cancelSwap(swapId);
      setActionMessage('Shift swap request withdrawn.');
      setTimeout(() => setActionMessage(null), 4000);
      fetchSwaps();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel swap');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
            Open Shift Swap Proxy Feed
          </h3>
          <p className="text-[11px] text-slate-500">
            Browse peer shift swap broadcasts and take over eligible duty assignments
          </p>
        </div>

        <button
          onClick={fetchSwaps}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
        >
          Refresh Feed
        </button>
      </div>

      {/* Feedback Toast */}
      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Swaps List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400 font-medium">Loading shift swaps...</div>
      ) : swaps.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
          No open shift swap requests broadcasted yet.
        </div>
      ) : (
        <div className="space-y-3">
          {swaps.map((swap) => {
            const isMine = user && (swap.requestor_id === user.id || swap.requestor_name === user.full_name);
            const isOpen = swap.status === 'OPEN';

            return (
              <div
                key={swap.swap_id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      {swap.requestor_name.charAt(0)}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{swap.requestor_name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(swap.created_at).toLocaleDateString()} at{' '}
                        {new Date(swap.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      swap.status === 'OPEN'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : swap.status === 'ACCEPTED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {swap.status}
                  </span>
                </div>

                {/* Reason / Notes */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium">
                  "{swap.reason}"
                </div>

                {/* Actions */}
                {isOpen && (
                  <div className="flex justify-end gap-2 pt-1">
                    {isMine ? (
                      <button
                        onClick={() => handleCancelSwap(swap.swap_id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Withdraw Request</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAcceptSwap(swap.swap_id)}
                        className="flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Shift</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
