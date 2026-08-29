import React, { useState } from 'react';
import { NormalizedStudentRecord } from '../types/student';
import { BarChart3 } from 'lucide-react';

interface GradeDistributionChartProps {
  records: NormalizedStudentRecord[];
  selectedGrade: string; // 'all' or '1', '2', etc.
  onSelectGrade: (grade: string) => void;
}

export const GradeDistributionChart: React.FC<GradeDistributionChartProps> = ({
  records,
  selectedGrade,
  onSelectGrade,
}) => {
  const [hoveredGrade, setHoveredGrade] = useState<string | null>(null);

  // Group all records by Grade
  const gradeMap: Record<string, { total: number; inProgress: number; completed: number; notEnrolled: number }> = {};

  // Standard grade sorting 1 to 12
  const allGrades = Array.from(
    new Set(records.map((r) => r.className || 'Unknown'))
  ).sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  allGrades.forEach((g) => {
    gradeMap[g] = { total: 0, inProgress: 0, completed: 0, notEnrolled: 0 };
  });

  records.forEach((r) => {
    const g = r.className || 'Unknown';
    if (!gradeMap[g]) {
      gradeMap[g] = { total: 0, inProgress: 0, completed: 0, notEnrolled: 0 };
    }
    gradeMap[g].total++;

    const cs = (r.courseStatus || '').toLowerCase();
    if (cs.includes('completed')) {
      gradeMap[g].completed++;
    } else if (cs.includes('progress')) {
      gradeMap[g].inProgress++;
    } else if (cs.includes('not enrolled')) {
      gradeMap[g].notEnrolled++;
    }
  });

  const maxCount = Math.max(...Object.values(gradeMap).map((d) => d.total), 1);
  const chartHeight = 180;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-brand-800" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-sans">
              Grade-Wise Student Distribution
            </h3>
            <p className="text-xs text-slate-500">
              Click any bar to filter records by class
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand-900" />
            <span>Total Enrolled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>Completed</span>
          </div>
        </div>
      </div>

      {/* Responsive Bar Chart Area */}
      <div className="relative pt-6">
        <div className="grid grid-cols-9 gap-2 sm:gap-3 items-end h-[180px] border-b border-slate-200 pb-2">
          {allGrades.map((grade) => {
            const data = gradeMap[grade] || { total: 0, inProgress: 0, completed: 0, notEnrolled: 0 };
            const isSelected = selectedGrade === grade;
            const isHovered = hoveredGrade === grade;
            const totalHeight = Math.max(12, Math.round((data.total / maxCount) * chartHeight));
            const completedHeight = Math.round((data.completed / maxCount) * chartHeight);

            return (
              <div
                key={grade}
                className="flex flex-col items-center justify-end h-full relative group cursor-pointer"
                onMouseEnter={() => setHoveredGrade(grade)}
                onMouseLeave={() => setHoveredGrade(null)}
                onClick={() => onSelectGrade(isSelected ? 'all' : grade)}
              >
                {/* Floating Tooltip */}
                {(isHovered || isSelected) && (
                  <div className="absolute -top-14 z-20 bg-slate-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-xl pointer-events-none whitespace-nowrap animate-fadeIn flex flex-col items-center">
                    <span className="font-bold text-gold-300">Grade {grade}: {data.total} Students</span>
                    <span className="text-[10px] text-slate-300">
                      {data.completed} Completed • {data.inProgress} In Progress
                    </span>
                    <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1" />
                  </div>
                )}

                {/* Count Badge on Top */}
                <span className={`text-[11px] font-bold mb-1 transition-colors ${
                  isSelected ? 'text-brand-900 font-extrabold scale-110' : 'text-slate-500 group-hover:text-slate-900'
                }`}>
                  {data.total}
                </span>

                {/* Bar Container */}
                <div
                  className={`w-full max-w-[36px] rounded-t-lg relative transition-all duration-200 overflow-hidden flex flex-col justify-end ${
                    isSelected
                      ? 'ring-2 ring-brand-800 ring-offset-1 shadow-md'
                      : 'hover:opacity-90'
                  }`}
                  style={{ height: `${totalHeight}px` }}
                >
                  {/* Total Bar Background */}
                  <div className={`w-full h-full ${
                    isSelected
                      ? 'bg-gradient-to-t from-brand-950 to-brand-800'
                      : 'bg-gradient-to-t from-brand-900/90 to-brand-700/80 group-hover:from-brand-900 group-hover:to-brand-800'
                  }`}>
                    {/* Completed Portion on bottom */}
                    {completedHeight > 0 && (
                      <div
                        className="w-full bg-emerald-500 transition-all duration-300"
                        style={{ height: `${completedHeight}px` }}
                      />
                    )}
                  </div>
                </div>

                {/* X-Axis Label */}
                <div className="mt-2 text-center">
                  <span
                    className={`block text-xs font-bold transition-all px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-brand-900 text-white font-extrabold shadow-sm'
                        : 'text-slate-700 group-hover:text-brand-900'
                    }`}
                  >
                    Gr {grade}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
