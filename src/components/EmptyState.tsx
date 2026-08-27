import React from 'react';
import { FileQuestion, RefreshCw, AlertTriangle, Search } from 'lucide-react';

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
        <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-900 mb-4 shadow-sm">
          <RefreshCw className="w-7 h-7 animate-spin text-brand-900" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 font-sans">
          Loading student database...
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1">
          Loading New Era Senior Secondary School student records.
        </p>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="py-14 bg-white border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 font-sans">
          Unable to load student database
        </h3>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          Please ensure <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-xs">/assets/students.xlsx</code> is present in the project folder.
        </p>
        {errorMessage && (
          <p className="mt-2 text-xs text-slate-400 font-mono max-w-sm mx-auto">
            {errorMessage}
          </p>
        )}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 px-5 py-2.5 bg-brand-900 hover:bg-brand-950 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Retry Loading
          </button>
        )}
      </div>
    );
  }

  if (type === 'no-results') {
    return (
      <div
        id="no-student-found"
        className="py-12 bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto shadow-sm animate-fadeIn"
      >
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mx-auto mb-3.5">
          <FileQuestion className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 font-sans">
          No Student Found
        </h3>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          No student record was found matching &ldquo;<span className="font-semibold text-slate-800">{searchQuery}</span>&rdquo;. Please check the spelling or try searching by Innoventure ID or registered email.
        </p>
      </div>
    );
  }

  // Initial State: Clean school guide
  return (
    <div
      id="initial-state-guide"
      className="py-10 px-4 text-center max-w-lg mx-auto"
    >
      <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-900 mx-auto mb-3.5 shadow-sm">
        <Search className="w-6 h-6 text-brand-900" />
      </div>
      <h3 className="text-base font-bold text-slate-900 font-sans">
        Search New Era Student Credentials
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
        Enter the student's name above to look up their Innoventure ID, login password, and enrollment status.
      </p>

      {/* Clean 3-step simple guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-6 text-left">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="w-6 h-6 rounded-lg bg-brand-100 text-brand-900 flex items-center justify-center text-xs font-bold mb-2">
            1
          </div>
          <div className="text-xs font-bold text-slate-800">Type Student Name</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Supports full or partial name search</div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="w-6 h-6 rounded-lg bg-brand-100 text-brand-900 flex items-center justify-center text-xs font-bold mb-2">
            2
          </div>
          <div className="text-xs font-bold text-slate-800">Select Student</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pick matching record from suggestions</div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="w-6 h-6 rounded-lg bg-brand-100 text-brand-900 flex items-center justify-center text-xs font-bold mb-2">
            3
          </div>
          <div className="text-xs font-bold text-slate-800">Copy Password</div>
          <div className="text-[11px] text-slate-500 mt-0.5">1-click copy ID & login credentials</div>
        </div>
      </div>
    </div>
  );
};
