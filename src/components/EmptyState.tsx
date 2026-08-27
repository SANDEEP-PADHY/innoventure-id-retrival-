import React from 'react';
import { FileQuestion, RefreshCw, AlertTriangle, BookOpen } from 'lucide-react';

interface EmptyStateProps {
  type: 'initial' | 'no-results' | 'loading' | 'error';
  searchQuery?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  searchQuery = '',
  errorMessage,
  onRetry,
}) => {
  if (type === 'loading') {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-800 mb-4 shadow-sm">
          <RefreshCw className="w-7 h-7 animate-spin text-brand-700" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 font-sans">
          Loading student database...
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1">
          Parsing spreadsheet records and indexing searchable fields for instant retrieval.
        </p>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="py-14 bg-white border border-rose-200/80 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 font-sans">
          Unable to load student database
        </h3>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          Please check that the Excel file exists in the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-xs">/assets/</code> folder.
        </p>
        {errorMessage && (
          <p className="mt-2 text-xs text-slate-400 font-mono max-w-sm mx-auto">
            Details: {errorMessage}
          </p>
        )}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  if (type === 'no-results') {
    return (
      <div
        id="no-student-found"
        className="py-12 bg-white border border-slate-200/90 rounded-2xl p-8 text-center max-w-md mx-auto shadow-sm animate-fadeIn"
      >
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mx-auto mb-3.5">
          <FileQuestion className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 font-sans">
          No student found
        </h3>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          No matching student record was found for &ldquo;<span className="font-semibold text-slate-700">{searchQuery}</span>&rdquo;. Check your search and try again.
        </p>
      </div>
    );
  }

  // Initial State
  return (
    <div
      id="initial-state-guide"
      className="py-12 px-4 text-center max-w-lg mx-auto"
    >
      <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-800 mx-auto mb-3.5 shadow-sm">
        <BookOpen className="w-6 h-6 text-brand-800" />
      </div>
      <h3 className="text-base font-bold text-slate-800 font-sans">
        Enter a student number, email or name to search
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
        Select your search criteria above and start typing. Live suggestions will appear automatically from the loaded database.
      </p>

      {/* Feature tags */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        <span className="px-2.5 py-1 text-[11px] font-semibold bg-white text-slate-600 border border-slate-200 rounded-lg shadow-sm">
          ⚡ 10-Digit ID Search
        </span>
        <span className="px-2.5 py-1 text-[11px] font-semibold bg-white text-slate-600 border border-slate-200 rounded-lg shadow-sm">
          🔍 Live Autocomplete
        </span>
        <span className="px-2.5 py-1 text-[11px] font-semibold bg-white text-slate-600 border border-slate-200 rounded-lg shadow-sm">
          📋 Dynamic Excel Columns
        </span>
      </div>
    </div>
  );
};
