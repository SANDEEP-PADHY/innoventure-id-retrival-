import React from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Search, BarChart3 } from 'lucide-react';
import { DatabaseMetadata } from '../types/student';

interface HeaderProps {
  metadata: DatabaseMetadata | null;
  isLoading: boolean;
  onRefresh: () => void;
  activeTab: 'search' | 'analytics';
  onTabChange: (tab: 'search' | 'analytics') => void;
}

export const Header: React.FC<HeaderProps> = ({
  metadata,
  isLoading,
  onRefresh,
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-30">
      {/* Top School Bar */}
      <div className="bg-brand-900 text-white text-[11px] font-semibold py-1.5 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gold-300 font-bold uppercase tracking-wider">
              New Era Senior Secondary School
            </span>
            <span className="text-brand-300 hidden sm:inline">•</span>
            <span className="text-brand-200 hidden sm:inline">Vadodara, Gujarat</span>
          </div>
          <div className="flex items-center gap-3 text-brand-200 text-[10px]">
            <span>
              School Code: <strong className="text-white">GJ-00039</strong>
            </span>
            <span className="text-brand-400">•</span>
            <span>Innoventure 2026</span>
          </div>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Crest */}
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          {/* New Era School Crest Emblem */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-900 to-brand-800 border-2 border-gold-400/80 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <div className="text-center leading-none">
              <span className="block font-serif font-black text-xs tracking-tighter text-gold-300">
                NES
              </span>
              <span className="block text-[7px] font-mono font-bold tracking-widest text-white/80">
                1990
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-sans">
                Student ID & Credentials Portal
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Innoventure Student Examination & Analytics
            </p>
          </div>
        </div>

        {/* Center Primary Tab Navigation */}
        <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
          <button
            type="button"
            id="tab-student-search"
            onClick={() => onTabChange('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
              activeTab === 'search'
                ? 'bg-white text-brand-900 shadow-sm border border-slate-200/80 ring-1 ring-brand-900/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Search className={`w-3.5 h-3.5 ${activeTab === 'search' ? 'text-brand-900' : 'text-slate-400'}`} />
            <span>Student Search</span>
          </button>

          <button
            type="button"
            id="tab-analytics-dashboard"
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 relative ${
              activeTab === 'analytics'
                ? 'bg-white text-brand-900 shadow-sm border border-slate-200/80 ring-1 ring-brand-900/10'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 className={`w-3.5 h-3.5 ${activeTab === 'analytics' ? 'text-brand-900' : 'text-slate-400'}`} />
            <span>Analytics & Dashboard</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </nav>

        {/* Database Status Badge */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-700" />
              <span>Loading records...</span>
            </div>
          ) : metadata ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold">{metadata.rowCount.toLocaleString()}</span>
                <span className="text-emerald-700 hidden sm:inline">Students Active</span>
              </div>
              <button
                onClick={onRefresh}
                title="Reload Excel Database"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-800">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Database Offline</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
