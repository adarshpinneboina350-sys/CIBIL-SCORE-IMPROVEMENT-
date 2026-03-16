import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Info, TrendingUp, Award, ShieldCheck, AlertTriangle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface ScoreAssignmentPageProps {
  onBack: () => void;
  isDarkMode: boolean;
}

const SCORING_RULES = [
  { factor: 'Starting Score', logic: 'Baseline for growth. Lower scores often see faster relative point gains.', impact: 'Neutral' },
  { factor: 'Credit Age', logic: '+1 to +3 points per year of history. Stability is rewarded.', impact: 'High' },
  { factor: 'Utilization Reduction', logic: '+0.5 points for every 1% reduction in overall credit usage.', impact: 'Very High' },
  { factor: 'On-Time Payments', logic: '+2 to +4 points per consecutive on-time payment.', impact: 'Very High' },
  { factor: 'Hard Inquiries', logic: '-5 to -10 points per inquiry. Signals credit hunger.', impact: 'Negative' },
  { factor: 'Overdue Cleared', logic: '+20 to +50 points. Removing defaults is the fastest way to grow.', impact: 'Critical' },
  { factor: 'Settled Status', logic: '-15 to -30 points penalty if account is settled instead of fully cleared.', impact: 'Negative' },
  { factor: 'Loan Type', logic: 'Secured loans (Home/Vehicle) add +10 to +25 points for credit mix.', impact: 'Medium' },
  { factor: 'EMI Behavior', logic: 'Paying MORE than EMI adds +15 points. Paying LESS subtracts -20 points.', impact: 'High' },
];

const LOAN_IMPROVEMENT_DATA = [
  { type: 'Home Loan', improvement: 25, color: '#0ea5e9' },
  { type: 'Vehicle Loan', improvement: 18, color: '#38bdf8' },
  { type: 'Education Loan', improvement: 15, color: '#7dd3fc' },
  { type: 'Business Loan', improvement: 12, color: '#bae6fd' },
  { type: 'Personal Loan', improvement: 8, color: '#e0f2fe' },
];

const ScoreAssignmentPage: React.FC<ScoreAssignmentPageProps> = ({ onBack, isDarkMode }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto p-4 md:p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}`}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight">CIBIL Score Assignment</h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Understanding how your actions translate to points</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scoring Rules Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <Award className="text-blue-500" size={20} />
              <h2 className="font-bold">Point Allocation Logic</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Factor</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Logic & Points</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SCORING_RULES.map((rule, idx) => (
                    <tr key={idx} className={isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50'}>
                      <td className="p-4 font-semibold text-sm">{rule.factor}</td>
                      <td className={`p-4 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{rule.logic}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          rule.impact === 'Critical' ? 'bg-rose-100 text-rose-700' :
                          rule.impact === 'Very High' ? 'bg-blue-100 text-blue-700' :
                          rule.impact === 'High' ? 'bg-teal-100 text-teal-700' :
                          rule.impact === 'Negative' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {rule.impact}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-100'}`}>
            <div className="flex gap-3">
              <ShieldCheck className="text-blue-600 shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Pro Tip: The Credit Mix</h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Having a healthy mix of secured (Home/Vehicle) and unsecured (Credit Card/Personal) loans can boost your score by up to 10%. Secured loans are viewed more favorably by lenders.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Graph Section */}
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-teal-500" size={20} />
              <h2 className="font-bold">Loan Type Impact</h2>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={LOAN_IMPROVEMENT_DATA} layout="vertical" margin={{ left: -20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="type" 
                    type="category" 
                    tick={{ fontSize: 10, fontWeight: 600, fill: isDarkMode ? '#94a3b8' : '#64748b' }} 
                    width={80}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                      color: isDarkMode ? '#f1f5f9' : '#0f172a'
                    }}
                  />
                  <Bar dataKey="improvement" radius={[0, 4, 4, 0]} barSize={20}>
                    {LOAN_IMPROVEMENT_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-500 mt-4 italic text-center">
              Estimated points added to CIBIL score based on loan type (assuming on-time payments).
            </p>
          </div>

          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-amber-900/20 border-amber-800/30' : 'bg-amber-50 border-amber-100'}`}>
            <div className="flex gap-3">
              <AlertTriangle className="text-amber-600 shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-amber-900 mb-1">Payment Behavior</h3>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Paying More</span>
                    <span className="font-bold text-teal-600">+15 Pts</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Correct EMI</span>
                    <span className="font-bold text-blue-600">+5 Pts</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Paying Less</span>
                    <span className="font-bold text-rose-600">-20 Pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScoreAssignmentPage;
