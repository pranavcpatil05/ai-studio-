import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2, Info, Plus } from 'lucide-react';
import { extractTaxInfo } from '../services/geminiService';
import { ExtractionResult, UserDocument } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface DocumentUploadProps {
  onExtractionComplete: (result: ExtractionResult) => void;
  suggestedITR: string;
}

export default function DocumentUpload({ onExtractionComplete, suggestedITR }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRequiredDocs = (itr: string) => {
    const common = ['Form 16 (Salary Certificate)', 'Bank Statements (All accounts)'];
    if (itr.includes('ITR-2')) return [...common, 'Capital Gains Statement', 'Foreign Asset Disclosure', 'Aadhaar/PAN Card'];
    if (itr.includes('ITR-3')) return [...common, 'Profit & Loss Statement', 'Balance Sheet', 'Audit Report (if applicable)'];
    if (itr.includes('ITR-4')) return [...common, 'Business Income Proof', 'Presumptive Income Details'];
    return common;
  };

  const requiredDocs = getRequiredDocs(suggestedITR);

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
      setError('Please upload an image or PDF document.');
      return;
    }

    const newDoc: UserDocument = {
      id: Math.random().toString(36).substr(2, 9),
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size,
      status: 'processing'
    };

    setDocuments(prev => [...prev, newDoc]);
    setError(null);
    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await extractTaxInfo(base64, selectedFile.type);
        onExtractionComplete(result);
        
        setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'completed' } : d));
        setIsProcessing(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      console.error('Extraction error:', err);
      setError('Failed to process document. Please try again.');
      setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'error' } : d));
      setIsProcessing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const removeDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Required Documents Checklist */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
            <Info size={18} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Required for {suggestedITR}</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Ensure you upload all mandatory documents</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {requiredDocs.map((doc, idx) => {
            const isUploaded = documents.some(d => d.name.toLowerCase().includes(doc.split(' ')[0].toLowerCase()));
            return (
              <div key={idx} className="flex items-center gap-2 text-xs">
                {isUploaded ? (
                  <CheckCircle2 size={14} className="text-emerald-500" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                )}
                <span className={isUploaded ? 'text-emerald-600 font-medium' : 'text-slate-600 dark:text-slate-400'}>
                  {doc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText size={18} className="text-emerald-600" />
            Document Upload
          </h3>
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Multi-File Support</span>
        </div>

        <div className="space-y-4">
          {/* Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer
              flex flex-col items-center justify-center gap-3
              ${isDragging ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50'}
            `}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/*,application/pdf"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400">
              <Plus size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Add a document</p>
              <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG (Max 10MB)</p>
            </div>
          </div>

          {/* Document List */}
          <AnimatePresence>
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-white dark:bg-slate-800 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-emerald-600">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                  <p className="text-xs text-slate-500">{(doc.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                
                <div className="flex items-center gap-3">
                  {doc.status === 'processing' ? (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-[10px] font-bold uppercase">Analyzing</span>
                    </div>
                  ) : doc.status === 'error' ? (
                    <div className="flex items-center gap-2 text-red-500">
                      <AlertCircle size={16} />
                      <span className="text-[10px] font-bold uppercase">Error</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 size={16} />
                      <span className="text-[10px] font-bold uppercase">Ready</span>
                    </div>
                  )}

                  <button 
                    onClick={() => removeDoc(doc.id)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {error && (
          <p className="mt-4 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle size={14} />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
