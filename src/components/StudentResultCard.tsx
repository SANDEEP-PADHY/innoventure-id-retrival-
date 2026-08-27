import React, { useState } from 'react';
import { NormalizedStudentRecord } from '../types/student';
import {
  KeyRound,
  Mail,
  Hash,
  Copy,
  Check,
  Printer,
  BookOpen,
  Phone,
  Home,
  Bus,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
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

  // Helper to pick icons for dynamic columns
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

  // Find password and ID for featured top cards
  const passwordField = student.allFields.find(
    (f) => f.key.toLowerCase().includes('pass') || f.key.toLowerCase().includes('pwd')
  );
  const idField = student.allFields.find(
    (f) =>
      f.key.toLowerCase().includes('innoventure id') ||
      f.key.toLowerCase().includes('student number') ||
      f.key.toLowerCase().includes('student no') ||
      f.key.toLowerCase().includes('id')
  );

  return (
    <div
      id="student-record-card"
      className="bg-white border border-slate-200 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden"
    >
      {/* Top Disambiguation Navigation */}
      {hasMultipleMatches && onBackToMultiple && (
        <div className="bg-brand-50 border-b border-brand-100 px-6 py-2.5 flex items-center justify-between text-xs font-semibold text-brand-900">
          <span>Viewing selected student record</span>
          <button
            type="button"
            onClick={onBackToMultiple}
            className="text-brand-800 hover:text-brand-950 font-bold hover:underline"
          >
            ← Back to all search matches
          </button>
        </div>
      )}

      {/* Card Header & Student Identity */}
      <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Student Initials Crest */}
            <div className="w-16 h-16 rounded-2xl bg-brand-900 border-2 border-gold-400 text-gold-200 flex items-center justify-center text-xl font-bold font-sans shadow-md flex-shrink-0">
              {initials}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                  {student.name}
                </h2>
                {student.className && (
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-brand-100 text-brand-900 rounded-full border border-brand-200">
                    Grade {student.className}
                    {student.section ? ` - Sec ${student.section}` : ''}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-slate-600">
                <div className="flex items-center gap-1.5 font-mono text-brand-900 font-bold bg-brand-50 px-2 py-0.5 rounded border border-brand-200 text-xs">
                  <Hash className="w-3.5 h-3.5 text-brand-700" />
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
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all ${
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
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-xs font-bold transition-all shadow-sm"
              title="Print record"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Credentials Highlight Box (Innoventure ID + Password) */}
      <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-brand-800" />
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-sans">
            Innoventure Login Credentials
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Innoventure ID */}
          <div className="bg-white p-4 rounded-xl border border-brand-200 shadow-sm flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Innoventure ID
              </div>
              <div className="font-mono text-lg font-bold text-brand-900 mt-0.5 tracking-wide">
                {idField?.value || student.studentNumber}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  idField?.value || student.studentNumber,
                  'primary-id'
                )
              }
              className="p-2 text-slate-400 hover:text-brand-900 hover:bg-brand-50 rounded-lg transition-colors border border-transparent hover:border-brand-200"
              title="Copy ID"
            >
              {copiedKey === 'primary-id' ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Password */}
          <div className="bg-white p-4 rounded-xl border border-amber-300/80 bg-gradient-to-r from-white to-amber-50/30 shadow-sm flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                <span>Login Password</span>
              </div>
              <div className="font-mono text-lg font-bold text-slate-900 mt-0.5 tracking-wider">
                {passwordField?.value || student.password || '—'}
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  passwordField?.value || student.password || '',
                  'primary-password'
                )
              }
              className="p-2 text-slate-400 hover:text-amber-900 hover:bg-amber-100/50 rounded-lg transition-colors border border-transparent hover:border-amber-300"
              title="Copy Password"
            >
              {copiedKey === 'primary-password' ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* All Remaining Spreadsheet Columns Grid */}
      <div className="p-6 sm:p-8">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 font-sans">
          All Student Record Information
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {student.allFields.map((field, idx) => {
            const isEmail =
              field.key.toLowerCase().includes('email') ||
              field.key.toLowerCase().includes('mail');
            const isStatus =
              field.key.toLowerCase().includes('activated') ||
              field.key.toLowerCase().includes('verified');

            const isCopied = copiedKey === field.key;
            const Icon = getFieldIcon(field.label);

            return (
              <div
                key={field.key + idx}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{field.label}</span>
                  </div>

                  {field.value && !isStatus && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(field.value, field.key)}
                      title={`Copy ${field.label}`}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
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
                  {isStatus ? (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        field.value.toLowerCase() === 'yes'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          field.value.toLowerCase() === 'yes'
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      {field.value || 'No'}
                    </span>
                  ) : isEmail && field.value ? (
                    <a
                      href={`mailto:${field.value}`}
                      className="text-sm font-semibold text-brand-800 hover:text-brand-950 hover:underline break-all block"
                    >
                      {field.value}
                    </a>
                  ) : (
                    <span className="text-sm font-semibold text-slate-800 break-words block">
                      {field.value || <span className="text-slate-400 italic font-normal">None</span>}
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
