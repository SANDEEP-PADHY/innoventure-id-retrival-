import React from 'react';
import { GraduationCap, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { DatabaseMetadata } from '../types/student';

interface HeaderProps {
  metadata: DatabaseMetadata | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({ metadata, isLoading, onRefresh }) => {
  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-11 h-11 rounded-xl bg-brand-800 text-white flex items-center justify-center shadow-md shadow-brand-900/10 flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                STUDENT DATA LOOKUP
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200 rounded-md">
                Institutional Portal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Search and retrieve student records in controlled database
            </p>
          </div>
        </div>

        {/* Database Status Badge */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-700" />
              <span>Loading database...</span>
            </div>
          ) : metadata ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold">{metadata.rowCount.toLocaleString()}</span>
                <span className="text-emerald-700">records loaded</span>
              </div>
              <button
                onClick={onRefresh}
                title="Reload Excel Database"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-transparent hover:border-slate-200 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-medium text-amber-800">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Offline Database</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
