import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingDown, TrendingUp, ShieldCheck, Zap, Info, Scale, FileText, CheckCircle2, BookOpen, Bot, HelpCircle, FileUp } from 'lucide-react';
import { TaxSummary, TaxDeduction } from '../types';

interface TaxDashboardProps {
  summary: TaxSummary;
  deductions: TaxDeduction[];
}

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444'];

export default function TaxDashboard({ summary, deductions }: TaxDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'deductions' | 'laws'>('overview');

  const hasData = summary.totalIncome > 0;

  const barData = deductions.map(d => ({
    name: d.category,
    amount: d.amount
  }));

  const regimeData = [
    { name: 'Old Regime', tax: summary.oldRegimeTax },
    { name: 'New Regime', tax: summary.newRegimeTax },
  ];

  const formatCurrency = (value: number) => `₹${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400">
          <FileUp size={40} />
        </div>
        <div className="max-w-xs">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Tax Data Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Complete the tax quiz and upload your documents (Form 16, 16A, or Bank Statements) to see your tax analysis here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <TrendingUp size={18} />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('deductions')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'deductions'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <TrendingDown size={18} />
          Deductions
        </button>
        <button
          onClick={() => setActiveTab('laws')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'laws'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <BookOpen size={18} />
          Tax Laws & AI Guide
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Top Banner: Suggested ITR & Regime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Suggested ITR Form</p>
                <h3 className="text-2xl font-bold">{summary.suggestedITR || 'ITR-1 (Sahaj)'}</h3>
                <p className="text-[10px] text-indigo-100 opacity-80 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Based on your income profile
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FileText size={24} />
              </div>
            </div>

            <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-100 dark:shadow-none flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">Recommended Regime</p>
                <h3 className="text-2xl font-bold capitalize">{summary.suggestedRegime} Regime</h3>
                <p className="text-[10px] text-emerald-100 opacity-80 flex items-center gap-1">
                  <Zap size={12} /> Saves you ₹{(Math.abs(summary.oldRegimeTax - summary.newRegimeTax)).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Scale size={24} />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Taxable Income</span>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <TrendingUp size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{summary.taxableIncome.toLocaleString()}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">After all deductions</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Deductions</span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <TrendingDown size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹{summary.totalDeductions.toLocaleString()}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Identified from documents</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm ring-2 ring-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Potential Savings</span>
                <div className="p-2 bg-emerald-600 text-white rounded-xl animate-pulse">
                  <Zap size={16} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{summary.potentialSavings.toLocaleString()}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">New opportunities found</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Scale size={18} className="text-indigo-600" />
                Regime Comparison (FY 2025-26)
              </h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regimeData} layout="vertical">
                    <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <YAxis dataKey="name" type="category" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(248, 250, 252, 0.1)' }}
                      formatter={(value: number) => [formatCurrency(value), 'Tax Payable']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                    />
                    <Bar dataKey="tax" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingDown size={18} className="text-emerald-600" />
                Deduction Breakdown
              </h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(248, 250, 252, 0.1)' }}
                      formatter={(value: number) => [formatCurrency(value), 'Amount']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                    />
                    <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'deductions' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Eligible Deductions & Schemes</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{deductions.length} Items Found</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {deductions.map((d, i) => (
              <div key={i} className="px-6 py-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded uppercase tracking-wider">
                        {d.section}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{d.category}</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {d.description}
                      </p>
                      
                      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2 flex items-center gap-1">
                          <ShieldCheck size={12} /> AI Justification & Rule
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                          {d.justification || "This deduction was identified based on your uploaded documents and profile. It aligns with the current tax laws for FY 2025-26."}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">+₹{d.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Verified Amount</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'laws' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tax Laws Section */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Financial Year 2025-26 Laws</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Assessment Year 2026-27</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Default Tax Regime</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The New Tax Regime is now the default. It features lower tax rates but fewer deductions. TaxSathi calculates both to ensure you pick the best one.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Standard Deduction</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Increased to ₹75,000 for the New Regime and remains ₹50,000 for the Old Regime. This is automatically applied to your salary income.
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Tax Rebate (u/s 87A)</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  No tax is payable if your total taxable income is up to ₹7 Lakhs in the New Regime (effectively ₹7.75L with standard deduction).
                </p>
              </div>
            </div>
          </div>

          {/* AI Assistant Guide Section */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">How to use AI Assistant</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your personal tax co-pilot</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-2xl transition-colors">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Document Analysis</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Upload Form 16, Bank Statements, or 16A. The AI extracts income and deductions automatically.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-2xl transition-colors">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shrink-0">
                  <HelpCircle size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Ask Tax Queries</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Confused about Section 80C or 80D? Just ask the AI in the chat for simple, jargon-free explanations.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-2xl transition-colors">
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center shrink-0">
                  <Zap size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Savings Optimization</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">The AI identifies missed saving opportunities like ELSS, PPF, or NPS based on your profile.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
              <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
                <strong>Note:</strong> AI suggestions are for guidance only. Always verify with a professional CA or official government portals before final filing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
