import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Info, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { chatWithAI } from '../services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I'm **TaxSathi**, your personal tax co-pilot for **FY 2025-26**. \n\nI can help you with:\n1. **Document Analysis**: Upload Form 16 or Bank Statements, and I'll extract deductions.\n2. **Tax Queries**: Ask about Section 80C, 80D, HRA, or Capital Gains.\n3. **Savings Advice**: I can suggest schemes like NPS, PPF, or ELSS to lower your tax.\n4. **Regime Comparison**: I'll help you decide between the Old and New Tax Regimes.\n\nHow can I assist you today?",
      timestamp: new Date(),
    },
  ]);

  const suggestedQuestions = [
    "What is the standard deduction for 2026?",
    "How can I save tax under Section 80D?",
    "Should I choose the New Tax Regime?",
    "Explain Section 80C deductions."
  ];
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await chatWithAI([...messages, userMessage]);
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: "I'm sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">TaxSathi Assistant</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AI-Powered Tax Expert
            </p>
          </div>
        </div>
        <div className="group relative">
          <ShieldAlert size={18} className="text-amber-500 cursor-help" />
          <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-xl border border-slate-700">
            <p className="font-bold mb-1">AI Disclaimer</p>
            This assistant provides informational guidance based on current tax laws. Always verify with a certified professional for legal filing.
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-50/30 dark:bg-slate-900/10"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                m.role === 'user' ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-700 text-emerald-600 border border-slate-100 dark:border-slate-600"
              )}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                m.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-tl-none"
              )}>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
                <span className={cn(
                  "text-[10px] mt-2 block opacity-50",
                  m.role === 'user' ? "text-right" : "text-left"
                )}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 mr-auto"
          >
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 text-emerald-600 flex items-center justify-center border border-slate-100 dark:border-slate-600">
              <Bot size={16} />
            </div>
            <div className="bg-white dark:bg-slate-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 border border-slate-100 dark:border-slate-600 shadow-sm">
              <Loader2 size={16} className="animate-spin text-emerald-600" />
              <span className="text-xs text-slate-500 dark:text-slate-400 italic">Analyzing tax rules...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Persistent Disclaimer */}
      <div className="px-6 py-2 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/20 flex items-center gap-2">
        <ShieldAlert size={12} className="text-amber-600 shrink-0" />
        <p className="text-[10px] text-amber-700 dark:text-amber-500 font-medium">
          AI generated guidance. Not a substitute for professional tax advice.
        </p>
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => setInput(q)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about tax savings, deductions, or filing..."
            className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm dark:text-white"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
