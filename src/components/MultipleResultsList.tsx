import React from 'react';
import { NormalizedStudentRecord } from '../types/student';
import { Users, Hash, Mail, ArrowRight, UserCheck, Phone } from 'lucide-react';

interface MultipleResultsListProps {
  students: NormalizedStudentRecord[];
  query: string;
  onSelect: (student: NormalizedStudentRecord) => void;
}

export const MultipleResultsList: React.FC<MultipleResultsListProps> = ({
  students,
  query,
  onSelect,
}) => {
  return (
    <div
      id="multiple-results-container"
      className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-900 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-sans">
              Multiple Students Found
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Found <span className="font-bold text-slate-800">{students.length} student records</span> matching &ldquo;<span className="text-brand-900 font-semibold">{query}</span>&rdquo;. Select the student below to view their details:
            </p>
          </div>
        </div>
      </div>

      {/* List of Candidates */}
      <div className="divide-y divide-slate-100">
        {students.map((student, idx) => {
          return (
            <div
              key={student.id + idx}
              onClick={() => onSelect(student)}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-50/50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-brand-900 text-gold-200 font-bold flex items-center justify-center text-sm flex-shrink-0 shadow-sm">
                  {student.name
                    ? student.name
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                    : 'ST'}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base text-slate-900 group-hover:text-brand-900 transition-colors">
                      {student.name}
                    </span>
                    {student.className && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-brand-50 text-brand-900 rounded border border-brand-200">
                        Grade {student.className}
                        {student.section ? ` - ${student.section}` : ''}
                      </span>
                    )}
                    {student.courseStatus && (
                      <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 rounded border border-slate-200">
                        {student.courseStatus}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-mono text-brand-900 font-semibold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      <Hash className="w-3 h-3 text-slate-400" />
                      ID: {student.studentNumber}
                    </span>

                    {student.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {student.email}
                      </span>
                    )}

                    {student.phone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {student.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* View Full Record Action */}
              <div className="flex items-center justify-end sm:justify-start">
                <button
                  type="button"
                  id={`select-student-btn-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(student);
                  }}
                  className="px-4 py-2 bg-white group-hover:bg-brand-900 text-slate-700 group-hover:text-white border border-slate-200 group-hover:border-brand-900 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Select Student</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
