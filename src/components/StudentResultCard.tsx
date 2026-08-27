import React, { useState } from 'react';
import { NormalizedStudentRecord } from '../types/student';
import {
  KeyRound,
  Mail,
  Hash,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  BookOpen,
  Phone,
  Home,
  Bus,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

interface StudentResultCardProps {
  student: NormalizedStudentRecord;
  onBackToMultiple?: () => void;
  hasMultipleMatches?: boolean;
}

export const StudentResultCard: React.FC<StudentResultCardProps> = ({
  student,
  onBackToMultiple,
  hasMultipleMatches = false,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const copyAllDetails = () => {
    const textLines = student.allFields
      .filter((f) => f.value)
      .map((f) => `${f.label}: ${f.value}`)
      .join('\n');

    navigator.clipboard.writeText(textLines);
    setAllCopied(true);
    setTimeout(() => {
      setAllCopied(false);
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to pick an intuitive icon for dynamic columns
  const getFieldIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('pass') || l.includes('pwd')) return KeyRound;
    if (l.includes('email') || l.includes('mail')) return Mail;
    if (l.includes('id') || l.includes('number') || l.includes('roll') || l.includes('s.no')) return Hash;
    if (l.includes('class') || l.includes('grade') || l.includes('standard')) return BookOpen;
    if (l.includes('phone') || l.includes('mobile') || l.includes('contact')) return Phone;
    if (l.includes('house')) return Home;
    if (l.includes('bus') || l.includes('route') || l.includes('transport')) return Bus;
    if (l.includes('parent') || l.includes('father') || l.includes('mother') || l.includes('coordinator')) return Users;
    if (l.includes('date') || l.includes('dob')) return Calendar;
    if (l.includes('active') || l.includes('status') || l.includes('verified')) return CheckCircle2;
    return Layers;
  };

  // Split initials for avatar
  const initials = student.name
    ? student.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'ST';

  return (
    <div
      id="student-record-card"
      className="bg-white border border-slate-200/90 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden"
    >
      {/* Top Banner Navigation (if disambiguated from multiple results) */}
      {hasMultipleMatches && onBackToMultiple && (
        <div className="bg-brand-50 border-b border-brand-100 px-6 py-2 flex items-center justify-between text-xs font-semibold text-brand-900">
          <span>Viewing selected student from search matches</span>
          <button
            type="button"
            onClick={onBackToMultiple}
            className="text-brand-800 hover:text-brand-950 underline font-bold"
          >
            ← Back to all search matches
          </button>
        </div>
      )}

      {/* Card Header & Student Identity */}
      <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50/80 to-white border-b border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Student Initials Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-brand-800 text-white flex items-center justify-center text-xl font-bold font-sans shadow-md shadow-brand-900/15 flex-shrink-0">
              {initials}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                  {student.name}
                </h2>
                {student.className && (
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-brand-100 text-brand-800 rounded-full border border-brand-200">
                    Class {student.className}
                    {student.section ? ` - Sec ${student.section}` : ''}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-600">
                <div className="flex items-center gap-1.5 font-mono text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                  <Hash className="w-3.5 h-3.5 text-slate-500" />
                  <span>{student.studentNumber}</span>
                </div>

                {student.email && (
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{student.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Copy All & Print */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={copyAllDetails}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                allCopied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
              }`}
            >
              {allCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied All</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Record</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-xs font-bold transition-all shadow-sm"
              title="Print record"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controlled Environment Notice */}
      <div className="px-6 sm:px-8 py-2.5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-brand-700" />
          <span className="font-semibold text-slate-700">Internal Record View</span>
          <span className="hidden md:inline text-slate-400">
            • Displaying all populated spreadsheet fields
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {student.allFields.length} fields detected
        </span>
      </div>

      {/* Dynamic Key-Value Data Grid */}
      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {student.allFields.map((field, idx) => {
            const isPassword =
              field.key.toLowerCase().includes('pass') ||
              field.key.toLowerCase().includes('pwd');
            const isEmail =
              field.key.toLowerCase().includes('email') ||
              field.key.toLowerCase().includes('mail');
            const isId =
              field.key.toLowerCase().includes('id') ||
              field.key.toLowerCase().includes('student number') ||
              field.key.toLowerCase().includes('student no');

            const isCopied = copiedKey === field.key;
            const Icon = getFieldIcon(field.label);

            return (
              <div
                key={field.key + idx}
                className={`p-4 rounded-xl border transition-all ${
                  isPassword
                    ? 'bg-amber-50/50 border-amber-200 ring-1 ring-amber-300/30'
                    : isId
                    ? 'bg-brand-50/40 border-brand-200/80'
                    : 'bg-slate-50/50 border-slate-200/70 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{field.label}</span>
                  </div>

                  {field.value && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(field.value, field.key)}
                      title={`Copy ${field.label}`}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded transition-colors"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Field Value */}
                <div className="mt-1">
                  {isPassword ? (
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-amber-200">
                      <span className="font-mono text-sm font-bold text-amber-950 tracking-wider">
                        {field.value || '—'}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        Open Pass
                      </span>
                    </div>
                  ) : isEmail && field.value ? (
                    <a
                      href={`mailto:${field.value}`}
                      className="text-sm font-semibold text-brand-800 hover:text-brand-900 hover:underline break-all block"
                    >
                      {field.value}
                    </a>
                  ) : isId ? (
                    <span className="font-mono text-sm font-bold text-brand-900 tracking-wide block">
                      {field.value || '—'}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-slate-800 break-words block">
                      {field.value || <span className="text-slate-400 italic">None</span>}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
