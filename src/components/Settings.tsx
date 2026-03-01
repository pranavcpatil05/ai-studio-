import React from 'react';
import { User, Moon, Sun, Shield, Bell, Lock, Mail } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsProps {
  user: { id: number; email: string };
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function Settings({ user, theme, onThemeToggle }: SettingsProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400">Manage your profile and application preferences.</p>
      </div>

      {/* Profile Section */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User size={18} className="text-emerald-600" />
            Personal Profile
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-600 shadow-sm overflow-hidden">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                alt="User Avatar" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{user.email.split('@')[0]}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Individual Taxpayer</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Mail size={10} /> Email
              </p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.email}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Shield size={10} /> User ID
              </p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">#TXW-{user.id.toString().padStart(4, '0')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sun size={18} className="text-emerald-600" />
            App Preferences
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                {theme === 'light' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-400" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Appearance</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark mode</p>
              </div>
            </div>
            <button 
              onClick={onThemeToggle}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                <Bell size={18} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Get alerts for tax deadlines</p>
              </div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-600 transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock size={18} className="text-emerald-600" />
            Security & Privacy
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 hover:border-emerald-500 transition-colors">
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Change Password</p>
            </div>
            <Shield size={16} className="text-slate-400" />
          </button>
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
            <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Data Privacy</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              Your tax documents are processed using secure AI models. We do not store your raw documents after analysis unless you explicitly save them.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
