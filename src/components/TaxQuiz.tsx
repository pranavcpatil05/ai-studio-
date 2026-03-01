import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, ChevronRight, CheckCircle2, Info } from 'lucide-react';
import { QuizResponse } from '../types';

interface TaxQuizProps {
  onComplete: (response: QuizResponse, suggestedITR: string) => void;
}

export default function TaxQuiz({ onComplete }: TaxQuizProps) {
  const [step, setStep] = useState(1);
  const [responses, setResponses] = useState<Partial<QuizResponse>>({
    incomeSources: [],
    specialDisclosures: []
  });

  const questions = [
    {
      id: 'category',
      text: 'Taxpayer Category',
      options: [
        { value: 'individual', label: 'Individual' },
        { value: 'huf', label: 'HUF' },
      ],
    },
    {
      id: 'residency',
      text: 'Residential Status',
      options: [
        { value: 'resident', label: 'Resident' },
        { value: 'nri', label: 'NRI' },
        { value: 'rnor', label: 'Resident but Not Ordinarily Resident (RNOR)' },
      ],
    },
    {
      id: 'incomeRange',
      text: 'Total Annual Income',
      options: [
        { value: 'up_to_50l', label: 'Up to ₹50 Lakhs' },
        { value: '50l_to_75l', label: '₹50 Lakhs to ₹75 Lakhs' },
        { value: 'above_75l', label: 'Above ₹75 Lakhs' },
      ],
    },
    {
      id: 'incomeSources',
      text: 'Income Sources (Select all that apply)',
      multi: true,
      options: [
        { value: 'salary', label: 'Salary/Pension' },
        { value: 'business', label: 'Business/Profession' },
        { value: 'capital_gains', label: 'Capital Gains (Stocks/Property)' },
        { value: 'none', label: 'None' },
      ],
    },
    {
      id: 'housePropertyCount',
      text: 'House Property Count',
      options: [
        { value: 'zero', label: 'Zero' },
        { value: 'one', label: 'One House' },
        { value: 'more_than_one', label: 'More than One House' },
      ],
    },
    {
      id: 'agriIncome',
      text: 'Agricultural Income',
      options: [
        { value: 'none', label: 'None' },
        { value: 'up_to_5k', label: 'Up to ₹5,000' },
        { value: 'more_than_5k', label: 'More than ₹5,000' },
      ],
    },
    {
      id: 'specialDisclosures',
      text: 'Special Disclosures (Select all that apply)',
      multi: true,
      options: [
        { value: 'director', label: 'Director in Company' },
        { value: 'unlisted_shares', label: 'Holds Unlisted Shares' },
        { value: 'foreign_assets', label: 'Foreign Assets' },
        { value: 'none', label: 'None' },
      ],
    },
  ];

  const handleSelect = (value: string) => {
    const currentQuestion = questions[step - 1];
    
    if (currentQuestion.multi) {
      const currentList = (responses[currentQuestion.id as keyof QuizResponse] as string[]) || [];
      const newList = currentList.includes(value)
        ? currentList.filter(v => v !== value)
        : [...currentList, value];
      
      // If 'none' is selected, clear others. If others are selected, clear 'none'.
      let finalValue = newList;
      if (value === 'none') {
        finalValue = ['none'];
      } else if (newList.includes('none')) {
        finalValue = newList.filter(v => v !== 'none');
      }

      setResponses(prev => ({
        ...prev,
        [currentQuestion.id]: finalValue
      }));
    } else {
      setResponses(prev => ({ ...prev, [currentQuestion.id]: value }));
      if (step < questions.length) {
        setStep(step + 1);
      }
    }
  };

  const calculateITR = () => {
    const { 
      category, 
      residency, 
      incomeRange, 
      incomeSources = [], 
      housePropertyCount, 
      agriIncome, 
      specialDisclosures = [] 
    } = responses;
    
    // ITR-1 (Sahaj) Conditions:
    // - Resident (not RNOR)
    // - Income up to 50L
    // - Sources: Salary/Pension, One House Property, Other Sources (implied if none of the others)
    // - Agri income up to 5k
    // - No special disclosures (Director, Unlisted Shares, Foreign Assets)
    // - No Capital Gains, No Business Income
    const isITR1Eligible = 
      residency === 'resident' &&
      incomeRange === 'up_to_50l' &&
      !incomeSources.includes('business') &&
      !incomeSources.includes('capital_gains') &&
      (housePropertyCount === 'zero' || housePropertyCount === 'one') &&
      (agriIncome === 'none' || agriIncome === 'up_to_5k') &&
      (specialDisclosures.length === 0 || specialDisclosures.includes('none'));

    if (isITR1Eligible) {
      return 'ITR-1 (Sahaj)';
    }

    // ITR-4 (Sugam) Conditions:
    // - Resident
    // - Income up to 50L
    // - Business/Profession income (Presumptive)
    // - Same house property and agri limits as ITR-1
    const isITR4Eligible = 
      residency === 'resident' &&
      incomeRange === 'up_to_50l' &&
      incomeSources.includes('business') &&
      !incomeSources.includes('capital_gains') &&
      (housePropertyCount === 'zero' || housePropertyCount === 'one') &&
      (agriIncome === 'none' || agriIncome === 'up_to_5k') &&
      (specialDisclosures.length === 0 || specialDisclosures.includes('none'));

    if (isITR4Eligible) {
      return 'ITR-4 (Sugam)';
    }

    // ITR-2 Conditions:
    // - Individuals/HUF
    // - No Business/Profession income
    // - Can have Capital Gains, Foreign Assets, multiple house properties, NRI status, etc.
    if (!incomeSources.includes('business')) {
      return 'ITR-2';
    }

    // ITR-3:
    // - Individuals/HUF
    // - Having Business/Profession income
    return 'ITR-3';
  };

  const handleFinish = () => {
    const suggestedITR = calculateITR();
    onComplete(responses as QuizResponse, suggestedITR);
  };

  const currentQuestion = questions[step - 1];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">ITR Selection Quiz</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Step {step} of {questions.length}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i + 1 <= step ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-700'}`} />
          ))}
        </div>
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <h4 className="text-xl font-medium text-slate-800 dark:text-slate-200 leading-tight">
          {currentQuestion.text}
        </h4>

        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = currentQuestion.multi 
              ? (responses[currentQuestion.id as keyof QuizResponse] as string[])?.includes(opt.value)
              : responses[currentQuestion.id as keyof QuizResponse] === opt.value;

            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`
                  flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left
                  ${isSelected
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-300'
                    : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-600'}
                `}
              >
                <span className="font-medium">{opt.label}</span>
                {isSelected ? (
                  <CheckCircle2 size={20} className="text-indigo-600" />
                ) : (
                  <ChevronRight size={20} className="text-slate-300 dark:text-slate-600" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Back
            </button>
          )}
          {currentQuestion.multi ? (
            <button
              onClick={() => step < questions.length ? setStep(step + 1) : handleFinish()}
              className="flex-1 py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              {step === questions.length ? 'Finish Quiz' : 'Continue'} <ChevronRight size={20} />
            </button>
          ) : step === questions.length ? (
            <button
              onClick={handleFinish}
              className="flex-1 py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              Finish Quiz <ChevronRight size={20} />
            </button>
          ) : null}
        </div>
      </motion.div>

      <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex gap-3 items-start border border-slate-100 dark:border-slate-700">
        <Info size={18} className="text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          This quiz helps determine the correct ITR form based on Indian Income Tax rules for FY 2025-26. Choosing the wrong form can lead to defective return notices.
        </p>
      </div>
    </div>
  );
}
