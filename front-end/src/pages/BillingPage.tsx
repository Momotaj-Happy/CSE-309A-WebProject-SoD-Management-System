import React from 'react';
import { StudentBillSummary } from '../components/StudentBillSummary';
import { DollarSign, ArrowLeft } from 'lucide-react';

interface BillingPageProps {
  onBack?: () => void;
}

export const BillingPage: React.FC<BillingPageProps> = ({ onBack }) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold">Monthly Duty Billing & Stipend Portal</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review completed duty task receipts, verify calculated stipend amounts, and submit your monthly bill.
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        )}
      </div>

      {/* Main Student Bill Component */}
      <StudentBillSummary />
    </div>
  );
};
