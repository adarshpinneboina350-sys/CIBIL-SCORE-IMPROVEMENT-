import React from 'react';
import { CreditGrowthProfile } from '../types';
import { RefreshCcw, User, Info } from 'lucide-react';

interface InputSectionProps {
  profile: CreditGrowthProfile;
  setProfile: (profile: CreditGrowthProfile) => void;
  onReset: () => void;
  onLoadExample: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({ profile, setProfile, onReset, onLoadExample }) => {
  const handleChange = (field: keyof CreditGrowthProfile, value: any) => {
    setProfile({ ...profile, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-slate-800">Detailed Credit Actions</h2>
        <div className="flex gap-2">
          <button 
            onClick={onLoadExample}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <User size={14} /> Example Case
          </button>
          <button 
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            <RefreshCcw size={14} /> Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Starting Score */}
        <div className="space-y-2 md:col-span-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-slate-600">Starting CIBIL Score</label>
            <span className="text-sm font-bold text-blue-700">{profile.startingScore}</span>
          </div>
          <input 
            type="range" 
            min="300" 
            max="900" 
            value={profile.startingScore}
            onChange={(e) => handleChange('startingScore', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Credit Age */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-slate-600">Credit History Age (Years)</label>
            <span className="text-sm font-bold text-blue-700">{profile.creditAgeYears}y</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="30" 
            value={profile.creditAgeYears}
            onChange={(e) => handleChange('creditAgeYears', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Utilization Reduction */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-slate-600">Utilization Reduction (%)</label>
            <span className="text-sm font-bold text-blue-700">{profile.utilizationReduction}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={profile.utilizationReduction}
            onChange={(e) => handleChange('utilizationReduction', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* On-Time Payments */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-slate-600">On-Time Payments Made</label>
            <span className="text-sm font-bold text-blue-700">{profile.onTimePaymentsInPeriod}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="24" 
            value={profile.onTimePaymentsInPeriod}
            onChange={(e) => handleChange('onTimePaymentsInPeriod', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Inquiries */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-slate-600">Hard Inquiries in Period</label>
            <span className="text-sm font-bold text-blue-700">{profile.inquiriesInPeriod}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="10" 
            value={profile.inquiriesInPeriod}
            onChange={(e) => handleChange('inquiriesInPeriod', parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Toggles Group 1 */}
        <div className="space-y-4 md:col-span-2 border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Applied for Loan in last 4 months?</label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => handleChange('appliedForLoanInLast4Months', true)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${profile.appliedForLoanInLast4Months ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
              >
                YES
              </button>
              <button
                onClick={() => handleChange('appliedForLoanInLast4Months', false)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!profile.appliedForLoanInLast4Months ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-500'}`}
              >
                NO
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Cleared Overdue Payments?</label>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => handleChange('overdueCleared', true)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${profile.overdueCleared ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                YES
              </button>
              <button
                onClick={() => handleChange('overdueCleared', false)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!profile.overdueCleared ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-500'}`}
              >
                NO
              </button>
            </div>
          </div>

          {profile.overdueCleared && (
            <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Was it "Settled" (not fully cleared)?</label>
                <div className="group relative">
                  <Info size={14} className="text-slate-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    "Settled" means you paid less than the full amount. This is a negative remark on CIBIL.
                  </div>
                </div>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => handleChange('accountSettledNotCleared', true)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${profile.accountSettledNotCleared ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'}`}
                >
                  SETTLED
                </button>
                <button
                  onClick={() => handleChange('accountSettledNotCleared', false)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!profile.accountSettledNotCleared ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}
                >
                  FULL CLEAR
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Do you have an Active Loan?</label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => handleChange('hasSecuredLoan', true)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${profile.hasSecuredLoan ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                YES
              </button>
              <button
                onClick={() => {
                  setProfile({ ...profile, hasSecuredLoan: false, loanType: 'NONE', emiPaymentBehavior: 'NONE' });
                }}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!profile.hasSecuredLoan ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-500'}`}
              >
                NO
              </button>
            </div>
          </div>

          {profile.hasSecuredLoan && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">What type of loan?</label>
                <select 
                  value={profile.loanType}
                  onChange={(e) => handleChange('loanType', e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NONE">Select Type</option>
                  <option value="HOME">Home Loan</option>
                  <option value="PERSONAL">Personal Loan</option>
                  <option value="BUSINESS">Business Loan</option>
                  <option value="VEHICLE">Vehicle Loan</option>
                  <option value="EDUCATION">Education Loan</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">EMI Payment Behavior</label>
                <select 
                  value={profile.emiPaymentBehavior}
                  onChange={(e) => handleChange('emiPaymentBehavior', e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NONE">Select Behavior</option>
                  <option value="CORRECT">Correct EMI (On Time)</option>
                  <option value="MORE">Paying More than EMI</option>
                  <option value="LESS">Paying Less than EMI</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Was your Credit Limit increased?</label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => handleChange('creditLimitIncreased', true)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${profile.creditLimitIncreased ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
              >
                YES
              </button>
              <button
                onClick={() => handleChange('creditLimitIncreased', false)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!profile.creditLimitIncreased ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-500'}`}
              >
                NO
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputSection;
