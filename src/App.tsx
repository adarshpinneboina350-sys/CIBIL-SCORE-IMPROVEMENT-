import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  AlertCircle, 
  Download, 
  Moon, 
  Sun, 
  CheckCircle2,
  Info,
  History,
  CreditCard,
  LogOut,
  User,
  ArrowLeft
} from 'lucide-react';
import { CreditGrowthProfile } from './types';
import { analyzeCreditGrowth, decideLoanEligibility } from './services/predictionModel';
import GaugeChart from './components/GaugeChart';
import FeatureImportanceChart from './components/FeatureImportanceChart';
import InputSection from './components/InputSection';
import LoanDecisionView from './components/LoanDecisionView';
import LandingPage from './components/LandingPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import LoginPage from './components/LoginPage';
import VerifyEmailPage from './components/VerifyEmailPage';
import DashboardHome from './components/DashboardHome';
import ScoreAssignmentPage from './components/ScoreAssignmentPage';
import FeatureDetailPage, { FeatureId } from './components/FeatureDetailPage';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { isFirebaseConfigured, getFirebaseAuth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const DEFAULT_PROFILE: CreditGrowthProfile = {
  startingScore: 650,
  utilizationReduction: 40,
  overdueCleared: true,
  onTimePaymentsInPeriod: 6,
  inquiriesInPeriod: 1,
  creditAgeYears: 5,
  hasSecuredLoan: true,
  loanType: 'HOME',
  emiPaymentBehavior: 'CORRECT',
  accountSettledNotCleared: false,
  creditLimitIncreased: false,
  appliedForLoanInLast4Months: false
};

const EXAMPLE_PROFILE: CreditGrowthProfile = {
  startingScore: 580,
  utilizationReduction: 60,
  overdueCleared: true,
  onTimePaymentsInPeriod: 12,
  inquiriesInPeriod: 0,
  creditAgeYears: 8,
  hasSecuredLoan: true,
  loanType: 'PERSONAL',
  emiPaymentBehavior: 'MORE',
  accountSettledNotCleared: false,
  creditLimitIncreased: true,
  appliedForLoanInLast4Months: false
};

type ViewMode = 'LANDING' | 'ABOUT' | 'CONTACT' | 'LOGIN' | 'VERIFY_EMAIL' | 'DASHBOARD_HOME' | 'ANALYZER' | 'LOAN_DECISION' | 'FEATURE_DETAIL' | 'SCORE_ASSIGNMENT';

export default function App() {
  const [profile, setProfile] = useState<CreditGrowthProfile>(DEFAULT_PROFILE);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [historyStack, setHistoryStack] = useState<ViewMode[]>(['LANDING']);
  const [selectedFeatureId, setSelectedFeatureId] = useState<FeatureId>('ai-attribution');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setIsAuthLoading(false);
      return;
    }

    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsLoggedIn(true);
          setUserEmail(user.email || 'User');
          
          const needsVerification = !user.emailVerified && user.providerData.some(p => p.providerId === 'password');

          setHistoryStack(prev => {
            const current = prev[prev.length - 1];
            if (needsVerification) {
              if (current !== 'VERIFY_EMAIL') return ['VERIFY_EMAIL'];
              return prev;
            } else {
              if (current === 'LOGIN' || current === 'LANDING' || current === 'VERIFY_EMAIL') {
                return ['DASHBOARD_HOME'];
              }
              return prev;
            }
          });
        } else {
          setIsLoggedIn(false);
          setUserEmail('');
        }
        setIsAuthLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to initialize Firebase Auth:', error);
      setIsAuthLoading(false);
    }
  }, []);

  const viewMode = historyStack[historyStack.length - 1];

  const analysis = useMemo(() => analyzeCreditGrowth(profile), [profile]);
  const loanDecision = useMemo(() => decideLoanEligibility(analysis), [analysis]);

  const navigate = (page: ViewMode) => {
    setHistoryStack(prev => [...prev, page]);
  };

  const handleBack = () => {
    if (historyStack.length > 1) {
      setHistoryStack(prev => prev.slice(0, -1));
    }
  };

  const handleLogin = (email: string) => {
    // State is handled by onAuthStateChanged
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        if (isFirebaseConfigured()) {
          const auth = getFirebaseAuth();
          await signOut(auth);
        }
        setIsLoggedIn(false);
        setUserEmail('');
        setHistoryStack(['LANDING']);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const handleSilentLogout = async () => {
    try {
      if (isFirebaseConfigured()) {
        const auth = getFirebaseAuth();
        await signOut(auth);
      }
      setIsLoggedIn(false);
      setUserEmail('');
      setHistoryStack(['LANDING']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resetAnalysis = () => {
    setProfile(DEFAULT_PROFILE);
    setHistoryStack(['ANALYZER']);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('report-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
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
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CIBIL_Growth_Analysis_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFeatureClick = (id: FeatureId) => {
    setSelectedFeatureId(id);
    navigate('FEATURE_DETAIL');
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'ABOUT':
        return <AboutPage onBack={handleBack} isDarkMode={isDarkMode} />;
      case 'CONTACT':
        return <ContactPage onBack={handleBack} isDarkMode={isDarkMode} />;
      case 'LOGIN':
        return <LoginPage onLogin={handleLogin} onBack={handleBack} isDarkMode={isDarkMode} />;
      case 'VERIFY_EMAIL':
        if (!isLoggedIn) {
          handleBack();
          return null;
        }
        return (
          <VerifyEmailPage 
            userEmail={userEmail} 
            isDarkMode={isDarkMode} 
            onLogout={handleSilentLogout} 
            onVerified={() => setHistoryStack(['DASHBOARD_HOME'])} 
          />
        );
      case 'DASHBOARD_HOME':
        if (!isLoggedIn) { // Protected route
          handleBack();
          return null;
        }
        return <DashboardHome userEmail={userEmail} onNavigate={navigate} isDarkMode={isDarkMode} />;
      case 'SCORE_ASSIGNMENT':
        return <ScoreAssignmentPage onBack={handleBack} isDarkMode={isDarkMode} />;
      case 'LOAN_DECISION':
        return <LoanDecisionView decision={loanDecision} analysis={analysis} onBack={handleBack} onAnalyzeAgain={resetAnalysis} isDarkMode={isDarkMode} />;
      case 'FEATURE_DETAIL':
        return <FeatureDetailPage featureId={selectedFeatureId} onBack={handleBack} isDarkMode={isDarkMode} />;
      case 'ANALYZER':
        if (!isLoggedIn) { // Protected route
          handleBack(); // Go back if not logged in
          return null;
        }
        return (
          <motion.main 
            key="analyzer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            id="report-content" 
            className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: Inputs */}
            <div className="lg:col-span-5 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-6 rounded-2xl shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
              >
                <InputSection 
                  profile={profile} 
                  setProfile={setProfile} 
                  onReset={() => setProfile(DEFAULT_PROFILE)}
                  onLoadExample={() => setProfile(EXAMPLE_PROFILE)}
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`p-6 rounded-2xl shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="text-teal-500" size={20} />
                  <h3 className="font-semibold">Key Growth Drivers</h3>
                </div>
                <ul className="space-y-3">
                  {analysis.keyDrivers.map((driver, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <div className="bg-teal-100 text-teal-700 p-1 rounded-full shrink-0">
                        <TrendingUp size={12} />
                      </div>
                      <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>{driver}</span>
                    </li>
                  ))}
                  {analysis.keyDrivers.length === 0 && (
                    <li className="text-sm text-slate-500 italic">No significant growth drivers identified for this period.</li>
                  )}
                </ul>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('LOAN_DECISION')}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transition-all hover:shadow-blue-300"
              >
                <CreditCard size={24} />
                Check Loan Eligibility
              </motion.button>
            </div>

            {/* Right Column: Results & Analytics */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main Analysis Card */}
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-8 rounded-2xl shadow-xl border relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
              >
                <div className="absolute top-0 right-0 p-4">
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                    <Info size={14} />
                    {(analysis.confidence * 100).toFixed(0)}% Analysis Confidence
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Growth Attribution</h2>
                    <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Estimated impact of past actions</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-extrabold tracking-tight text-blue-600">+{analysis.totalIncrement}</span>
                        <span className="text-lg font-bold text-slate-400">Points</span>
                      </div>
                      
                      <div className={`p-4 rounded-xl text-sm leading-relaxed ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <span className="font-semibold text-blue-600">Summary:</span> {analysis.interpretation}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <GaugeChart 
                      currentScore={profile.startingScore} 
                      predictedScore={analysis.finalScore} 
                    />
                  </div>
                </div>
              </motion.div>

              {/* Attribution Chart Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`p-6 rounded-2xl shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-500" />
                    Factor Contribution Breakdown
                  </h3>
                  <span className="text-xs text-slate-500 italic">Points Attributed to Each Action</span>
                </div>
                <FeatureImportanceChart 
                  data={analysis.attribution.map(a => ({ feature: a.factor, impact: a.impact }))} 
                />
              </motion.div>

              {/* Educational Note */}
              <div className={`p-4 rounded-xl border flex gap-3 ${isDarkMode ? 'bg-amber-950/20 border-amber-900/30 text-amber-200' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed opacity-90">
                  <strong>Note:</strong> This analyzer attributes your score growth to specific actions based on standard credit scoring models. Actual CIBIL algorithms are proprietary and may weigh factors differently.
                </p>
              </div>
            </div>
          </motion.main>
        );
      case 'LANDING':
      default:
        return <LandingPage onLogin={() => navigate('LOGIN')} onNavigate={navigate} onFeatureClick={handleFeatureClick} isDarkMode={isDarkMode} />;
    }
  };

  if (isAuthLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Navigation Bar */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-lg ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            onClick={() => setHistoryStack(isLoggedIn ? ['DASHBOARD_HOME'] : ['LANDING'])}
            className="flex items-center gap-2 cursor-pointer"
          >
            <History className="text-teal-500" size={24} />
            <span className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>CIBIL Analyzer</span>
          </div>
          
          <div className="flex items-center gap-6">
            {historyStack.length > 1 && viewMode !== 'LANDING' && (
              <button onClick={handleBack} className="flex items-center gap-1 text-sm font-medium hover:text-teal-500 transition-colors">
                <ArrowLeft size={16} /> Back
              </button>
            )}

            <div className="hidden md:flex gap-6">
              <button onClick={() => navigate('ABOUT')} className="text-sm font-medium hover:text-teal-500 transition-colors">About</button>
              <button onClick={() => navigate('CONTACT')} className="text-sm font-medium hover:text-teal-500 transition-colors">Contact</button>
            </div>
            
            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
            
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                  <User size={14} /> {userEmail.split('@')[0]}
                </div>
                <button 
                  onClick={handleLogout}
                  className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-rose-400 hover:bg-rose-900/50' : 'text-rose-500 hover:bg-rose-50'}`}
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('LOGIN')}
                className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
}
