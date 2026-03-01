import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, HelpCircle, FileText } from 'lucide-react';
import { TaxSummary, TaxDeduction } from '../types';

interface GuidedFilingProps {
  summary: TaxSummary;
  deductions: TaxDeduction[];
}

export default function GuidedFiling({ summary, deductions }: GuidedFilingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'General Information',
      questions: [
        { q: 'What is your PAN?', a: 'Extracted from document: ABCDE1234F', hint: 'Verify this matches your physical card.' },
        { q: 'What is your residential status?', a: 'Resident', hint: 'Based on your profile settings.' },
      ]
    },
    {
      title: 'Gross Total Income',
      questions: [
        { q: 'Income from Salary', a: `₹${summary.totalIncome.toLocaleString()}`, hint: 'Calculated from your uploaded Form 16.' },
        { q: 'Income from Other Sources', a: '₹0', hint: 'No other sources detected in documents.' },
      ]
    },
    {
      title: 'Deductions (Chapter VI-A)',
      questions: deductions.map(d => ({
        q: `${d.category} (${d.section})`,
        a: `₹${d.amount.toLocaleString()}`,
        hint: d.description
      }))
    },
    {
      title: 'Tax Computation',
      questions: [
        { q: 'Total Taxable Income', a: `₹${summary.taxableIncome.toLocaleString()}`, hint: 'Gross Income minus Deductions.' },
        { q: 'Tax Payable', a: `₹${summary.estimatedTax.toLocaleString()}`, hint: `Calculated using ${summary.suggestedRegime} regime rates.` },
      ]
    }
  ];

  const handleDownloadJSON = () => {
    const filingData = {
      assessmentYear: '2026-27',
      financialYear: '2025-26',
      itrForm: summary.suggestedITR,
      regime: summary.suggestedRegime,
      income: {
        total: summary.totalIncome,
        taxable: summary.taxableIncome
      },
      deductions: deductions.map(d => ({
        section: d.section,
        amount: d.amount,
        category: d.category
      })),
      taxLiability: {
        estimated: summary.estimatedTax,
        oldRegime: summary.oldRegimeTax,
        newRegime: summary.newRegimeTax
      },
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(filingData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taxwise_filing_${summary.suggestedITR.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Stepper Sidebar */}
      <div className="w-full lg:w-64 shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sticky top-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Filing Progress</h3>
          <div className="space-y-1">
            {steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all
                  ${currentStep === idx ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-50'}
                `}
              >
                {idx < currentStep ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : idx === currentStep ? (
                  <Circle size={18} className="text-indigo-600 fill-indigo-600/20" />
                ) : (
                  <Circle size={18} className="text-slate-300" />
                )}
                {step.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{steps[currentStep].title}</h2>
                  <p className="text-xs text-slate-500 mt-1">Guided pre-filling based on your data</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                  <FileText size={20} />
                </div>
              </div>

              <div className="p-6 space-y-8">
                {steps[currentStep].questions.map((item, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0 mt-1 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {idx + 1}
                      </div>
                      <div className="space-y-2 flex-1">
                        <h4 className="text-sm font-semibold text-slate-700">{item.q}</h4>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group-hover:border-indigo-200 transition-colors">
                          <span className="text-lg font-bold text-slate-900">{item.a}</span>
                          <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider hover:underline">Edit</button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <HelpCircle size={14} />
                          {item.hint}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30"
                >
                  <ChevronLeft size={18} /> Previous
                </button>
                <button
                  disabled={currentStep === steps.length - 1}
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                  Next Step <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {currentStep === steps.length - 1 && (
              <div className="p-6 bg-emerald-600 rounded-3xl text-white flex items-center justify-between shadow-xl shadow-emerald-100">
                <div>
                  <h3 className="text-lg font-bold">Ready to File!</h3>
                  <p className="text-emerald-100 text-sm">All sections are pre-filled. You can now download the ITR JSON or proceed to the portal.</p>
                </div>
                <button 
                  onClick={handleDownloadJSON}
                  className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-colors"
                >
                  Generate ITR JSON
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
