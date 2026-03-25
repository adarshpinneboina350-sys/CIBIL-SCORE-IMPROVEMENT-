import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft,
  FileText,
  ShieldAlert,
  UserCheck,
  RefreshCcw,
  Download
} from 'lucide-react';
import { LoanDecision, GrowthAnalysisResult, CreditGrowthProfile } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { getFirebaseDb, getFirebaseAuth, handleFirestoreError, OperationType } from '../firebase';

interface LoanDecisionViewProps {
  decision: LoanDecision;
  analysis: GrowthAnalysisResult;
  profile: CreditGrowthProfile;
  onBack: () => void;
  onAnalyzeAgain: () => void;
  isDarkMode: boolean;
}

const LoanDecisionView: React.FC<LoanDecisionViewProps> = ({ decision, analysis, profile, onBack, onAnalyzeAgain, isDarkMode }) => {
  const isGranted = decision.status === 'GRANTED';
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const referenceNumber = useMemo(() => `#LN-2026-${Math.floor(Math.random() * 9000) + 1000}`, []);

  const handleSaveToProfile = async () => {
    const auth = getFirebaseAuth();
    if (!auth.currentUser) {
      alert('You must be logged in to save your analysis.');
      return;
    }

    setIsSaving(true);
    setSaveStatus('IDLE');

    try {
      const db = getFirebaseDb();
      await addDoc(collection(db, 'credit_profiles'), {
        uid: auth.currentUser.uid,
        cibilScore: profile.startingScore,
        monthlyIncome: 50000, // Placeholder or add to profile
        totalDebts: profile.overdueCleared ? 0 : 10000, // Placeholder
        loanAmount: 500000, // Placeholder
        loanTenure: 36, // Placeholder
        finalScore: analysis.finalScore,
        decision: isGranted ? 'Approved' : 'Rejected',
        analysis: analysis.interpretation,
        createdAt: serverTimestamp()
      });
      setSaveStatus('SUCCESS');
      setTimeout(() => setSaveStatus('IDLE'), 3000);
    } catch (error) {
      setSaveStatus('ERROR');
      handleFirestoreError(error, OperationType.WRITE, 'credit_profiles');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById('pdf-template');
    if (!element) return;

    try {
      // Temporarily make it visible but off-screen for html2canvas
      element.style.display = 'block';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        onclone: (clonedDoc) => {
          const styles = clonedDoc.querySelectorAll('style');
          styles.forEach(style => {
            if (style.innerHTML.includes('oklch') || style.innerHTML.includes('color-mix')) {
              style.innerHTML = style.innerHTML
                .replace(/oklch\([^)]+\)/g, 'transparent')
                .replace(/color-mix\([^)]+\)/g, 'transparent');
            }
          });
        }
      });
      
      element.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Loan_Decision_${decision.status}_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto p-4 md:p-8"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 mb-8 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Analyzer
      </button>

      <div id="decision-card" className={`rounded-3xl shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        {/* Status Header */}
        <div className={`p-10 text-center ${
          isGranted 
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
            : 'bg-gradient-to-br from-rose-500 to-red-600'
        } text-white`}>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="inline-block p-4 bg-white/20 rounded-full backdrop-blur-md mb-6"
          >
            {isGranted ? <CheckCircle size={64} /> : <XCircle size={64} />}
          </motion.div>
          <h2 className="text-4xl font-black mb-2 tracking-tight">
            Application {isGranted ? 'Approved' : 'Rejected'}
          </h2>
          <p className="text-white/80 font-medium">Loan Reference: {referenceNumber}</p>
        </div>

        {/* Decision Details */}
        <div className="p-8 md:p-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Final Score</p>
              <p className="text-3xl font-black text-blue-600">{analysis.finalScore}</p>
            </div>
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Score Growth</p>
              <p className={`text-3xl font-black ${analysis.totalIncrement > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>
                +{analysis.totalIncrement}
              </p>
            </div>
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Risk Level</p>
              <div className="flex items-center gap-2">
                <p className={`text-3xl font-black ${
                  decision.riskLevel === 'LOW' ? 'text-emerald-500' : 
                  decision.riskLevel === 'MEDIUM' ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {decision.riskLevel}
                </p>
                {decision.riskLevel === 'HIGH' && <ShieldAlert size={24} className="text-rose-500" />}
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-2xl border-l-4 ${
            isGranted 
              ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
              : 'bg-rose-50 border-rose-500 text-rose-900'
          } ${isDarkMode ? 'opacity-90' : ''}`}>
            <div className="flex items-start gap-4">
              {isGranted ? <UserCheck size={28} className="shrink-0" /> : <AlertTriangle size={28} className="shrink-0" />}
              <div>
                <h4 className="font-bold text-lg mb-2">Decision Rationale</h4>
                <p className="text-sm leading-relaxed opacity-90">{decision.reason}</p>
              </div>
            </div>
          </div>

          {!isGranted && analysis.totalIncrement > 40 && (
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-amber-900/20 border-amber-800/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
              <div className="flex gap-3">
                <ShieldAlert size={20} className="shrink-0" />
                <div>
                  <p className="text-sm font-bold mb-1">Audit Required</p>
                  <p className="text-xs opacity-80">
                    Our system flagged this application due to "Hyper-Growth" in the CIBIL score. Rapid improvements exceeding 40 points in a short window are often associated with artificial credit repair services which violate our lending policy.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <button 
              onClick={handleSaveToProfile}
              disabled={isSaving || saveStatus === 'SUCCESS'}
              className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                saveStatus === 'SUCCESS' 
                  ? 'bg-emerald-500 text-white' 
                  : isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-900 text-white hover:bg-black'
              } disabled:opacity-70`}
            >
              {isSaving ? <RefreshCcw className="animate-spin" size={20} /> : <FileText size={20} />}
              {saveStatus === 'SUCCESS' ? 'Saved Successfully!' : 'Save to Profile'}
            </button>
            <button 
              onClick={handleDownload}
              className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200`}>
              <Download size={20} /> Download Decision Letter
            </button>
          </div>

          <button 
            onClick={onAnalyzeAgain}
            className={`w-full mt-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isDarkMode 
                ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <RefreshCcw size={18} /> Start New Analysis
          </button>
        </div>
      </div>

      <p className={`mt-8 text-center text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        This decision was generated by the automated underwriting system. For appeals, contact the credit department.
      </p>

      {/* Hidden PDF Template */}
      <div 
        id="pdf-template" 
        className="fixed top-0 left-[-9999px] bg-white text-black p-12 w-[800px] z-[-1]"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif', display: 'none' }}
      >
        <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">CIBIL Analyzer</h1>
            <p className="text-slate-500 mt-1">Automated Underwriting Department</p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Ref:</strong> {referenceNumber}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">
          Subject: Notice of Loan Application {isGranted ? 'Approval' : 'Rejection'}
        </h2>

        <p className="mb-6 leading-relaxed">Dear Applicant,</p>
        
        <p className="mb-6 leading-relaxed">
          Thank you for your recent loan application. We have completed a comprehensive review of your credit profile and growth trajectory using our automated underwriting system.
        </p>

        <p className="mb-8 leading-relaxed">
          Based on our analysis, we are writing to inform you that your application has been <strong className={isGranted ? 'text-emerald-600' : 'text-rose-600'}>{isGranted ? 'APPROVED' : 'REJECTED'}</strong>.
        </p>

        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8">
          <h3 className="text-lg font-bold mb-4 border-b border-slate-200 pb-2">Credit Analysis Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase">Final CIBIL Score</p>
              <p className="text-xl font-black text-slate-900">{analysis.finalScore}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase">Score Growth</p>
              <p className="text-xl font-black text-slate-900">+{analysis.totalIncrement} Points</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase">Assessed Risk Level</p>
              <p className="text-xl font-black text-slate-900">{decision.riskLevel}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase">Decision Status</p>
              <p className={`text-xl font-black ${isGranted ? 'text-emerald-600' : 'text-rose-600'}`}>
                {decision.status}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold mb-2">Decision Rationale</h3>
          <p className="leading-relaxed text-slate-700 bg-slate-50 p-4 rounded border border-slate-200">
            {decision.reason}
          </p>
        </div>

        {!isGranted && analysis.totalIncrement > 40 && (
          <div className="mb-8 bg-rose-50 p-4 rounded border border-rose-200 text-rose-900">
            <h3 className="text-md font-bold mb-1">Audit Flag: Hyper-Growth Detected</h3>
            <p className="text-sm">
              Our system flagged this application due to rapid improvements exceeding 40 points in a short window. Such patterns are often associated with artificial credit repair services, which violate our lending policy.
            </p>
          </div>
        )}

        <p className="mb-12 leading-relaxed">
          If you have any questions regarding this decision or wish to appeal, please contact our credit department referencing your application number.
        </p>

        <div className="mt-16 pt-8 border-t border-slate-200 text-sm text-slate-500 text-center">
          <p>This is an automatically generated document from the CIBIL Analyzer platform.</p>
          <p>Confidential & Privileged Information</p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoanDecisionView;
