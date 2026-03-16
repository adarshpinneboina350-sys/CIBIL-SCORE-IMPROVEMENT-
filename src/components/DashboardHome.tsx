import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BarChart3, ShieldCheck, Award } from 'lucide-react';

interface DashboardHomeProps {
  userEmail: string;
  onNavigate: (page: 'ANALYZER' | 'LOAN_DECISION' | 'SCORE_ASSIGNMENT') => void;
  isDarkMode: boolean;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ userEmail, onNavigate, isDarkMode }) => {
  return (
    <div className={`min-h-screen p-4 md:p-12 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-4">Welcome Back!</h1>
          <p className="text-xl font-medium text-teal-500">{userEmail}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => onNavigate('ANALYZER')}
            className={`p-10 rounded-3xl border cursor-pointer group ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
          >
            <BarChart3 className="text-blue-500 mb-6" size={48} />
            <h2 className="text-2xl font-bold mb-3">Credit Growth Analyzer</h2>
            <p className={`text-sm opacity-70 mb-6 leading-relaxed`}>
              Analyze your past credit performance and understand the key drivers behind your score changes.
            </p>
            <div className="flex items-center gap-2 font-bold text-blue-500">
              Start Analysis <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => onNavigate('LOAN_DECISION')}
            className={`p-10 rounded-3xl border cursor-pointer group ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
          >
            <ShieldCheck className="text-emerald-500 mb-6" size={48} />
            <h2 className="text-2xl font-bold mb-3">Loan Decision Engine</h2>
            <p className={`text-sm opacity-70 mb-6 leading-relaxed`}>
              Check your loan eligibility based on our AI-powered underwriting and risk assessment models.
            </p>
            <div className="flex items-center gap-2 font-bold text-emerald-500">
              Check Eligibility <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => onNavigate('SCORE_ASSIGNMENT')}
            className={`p-10 rounded-3xl border cursor-pointer group ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
          >
            <Award className="text-amber-500 mb-6" size={48} />
            <h2 className="text-2xl font-bold mb-3">Score Assignment</h2>
            <p className={`text-sm opacity-70 mb-6 leading-relaxed`}>
              Learn how points are assigned for each action and see how different loan types impact your score.
            </p>
            <div className="flex items-center gap-2 font-bold text-amber-500">
              View Assignment <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHome;
