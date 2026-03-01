import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileUp, 
  ShieldAlert, 
  Settings, 
  HelpCircle,
  Menu,
  X,
  Calculator,
  LogOut,
  ClipboardCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ChatInterface from './components/ChatInterface';
import DocumentUpload from './components/DocumentUpload';
import TaxDashboard from './components/TaxDashboard';
import Auth from './components/Auth';
import TaxQuiz from './components/TaxQuiz';
import GuidedFiling from './components/GuidedFiling';
import SettingsPage from './components/Settings';
import { TaxSummary, TaxDeduction, ExtractionResult, QuizResponse } from './types';

type Tab = 'dashboard' | 'chat' | 'documents' | 'guide' | 'settings';

interface User {
  id: number;
  email: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const [summary, setSummary] = useState<TaxSummary>({
    totalIncome: 0,
    totalDeductions: 0,
    taxableIncome: 0,
    estimatedTax: 0,
    potentialSavings: 0,
    oldRegimeTax: 0,
    newRegimeTax: 0,
    suggestedRegime: 'new',
    suggestedITR: ''
  });

  const [deductions, setDeductions] = useState<TaxDeduction[]>([]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const calculateTax = (income: number, deductionsTotal: number) => {
    // 2026 New Regime (Simplified)
    const newStdDed = 75000;
    const newTaxable = Math.max(0, income - newStdDed);
    let newTax = 0;
    if (newTaxable > 1500000) newTax += (newTaxable - 1500000) * 0.3 + 150000;
    else if (newTaxable > 1200000) newTax += (newTaxable - 1200000) * 0.2 + 90000;
    else if (newTaxable > 1000000) newTax += (newTaxable - 1000000) * 0.15 + 60000;
    else if (newTaxable > 700000) newTax += (newTaxable - 700000) * 0.1 + 30000;
    else if (newTaxable > 300000) newTax += (newTaxable - 300000) * 0.05;

    // Old Regime
    const oldStdDed = 50000;
    const oldTaxable = Math.max(0, income - oldStdDed - deductionsTotal);
    let oldTax = 0;
    if (oldTaxable > 1000000) oldTax += (oldTaxable - 1000000) * 0.3 + 112500;
    else if (oldTaxable > 500000) oldTax += (oldTaxable - 500000) * 0.2 + 12500;
    else if (oldTaxable > 250000) oldTax += (oldTaxable - 250000) * 0.05;

    return { newTax, oldTax };
  };

  const handleExtraction = (result: ExtractionResult) => {
    const newTotalIncome = result.incomeSources.reduce((acc, curr) => acc + curr.amount, 0);
    const newDeductions = [...result.deductions, ...deductions];
    const newDeductionsTotal = newDeductions.reduce((acc, curr) => acc + curr.amount, 0);
    
    const { newTax, oldTax } = calculateTax(newTotalIncome, newDeductionsTotal);

    setSummary(prev => ({
      ...prev,
      totalIncome: newTotalIncome,
      totalDeductions: newDeductionsTotal,
      taxableIncome: newTotalIncome - newDeductionsTotal,
      oldRegimeTax: oldTax,
      newRegimeTax: newTax,
      estimatedTax: Math.min(newTax, oldTax),
      suggestedRegime: newTax < oldTax ? 'new' : 'old',
      potentialSavings: Math.abs(newTax - oldTax)
    }));

    setDeductions(newDeductions);
    setActiveTab('dashboard');
  };

  const handleQuizComplete = (response: QuizResponse, suggestedITR: string) => {
    setSummary(prev => ({ ...prev, suggestedITR }));
    setHasCompletedQuiz(true);
    setActiveTab('documents');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: FileUp },
    { id: 'guide', label: 'Filing Guide', icon: ClipboardCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!user) {
    return <Auth onAuthSuccess={setUser} />;
  }

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${theme === 'dark' ? 'dark bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Calculator size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">TaxSathi</h1>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Smart Filing</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${activeTab === item.id 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
              `}
            >
              <Settings size={20} />
              Settings
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-slate-50 m-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <ShieldAlert size={14} />
              <span className="text-[10px] font-bold uppercase">Disclaimer</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              TaxSathi is for informational purposes only and does not constitute professional tax or legal advice.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-semibold">{user.email?.split('@')[0]}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Individual Filer • FY 2025-26</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-600 shadow-sm overflow-hidden">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                alt="User Avatar" 
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' && (
                  <TaxDashboard summary={summary} deductions={deductions} />
                )}
                {activeTab === 'chat' && (
                  <div className="h-[calc(100vh-200px)] min-h-[600px]">
                    <ChatInterface />
                  </div>
                )}
                {activeTab === 'documents' && (
                  <div className="max-w-2xl mx-auto">
                    {!hasCompletedQuiz ? (
                      <TaxQuiz onComplete={handleQuizComplete} />
                    ) : (
                      <>
                        <div className="mb-8 flex items-center justify-between">
                          <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Document Center</h2>
                            <p className="text-slate-500 dark:text-slate-400">Upload your tax documents for AI-powered analysis.</p>
                          </div>
                          <button 
                            onClick={() => setHasCompletedQuiz(false)}
                            className="text-xs font-bold text-indigo-600 hover:underline"
                          >
                            Retake Quiz
                          </button>
                        </div>
                        <DocumentUpload 
                          onExtractionComplete={handleExtraction} 
                          suggestedITR={summary.suggestedITR}
                        />
                      </>
                    )}
                  </div>
                )}
                {activeTab === 'guide' && (
                  <GuidedFiling summary={summary} deductions={deductions} />
                )}
                {activeTab === 'settings' && (
                  <SettingsPage 
                    user={user} 
                    theme={theme} 
                    onThemeToggle={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')} 
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
