import React, { useState } from 'react';
import { NormalizedStudentRecord } from '../types/student';
import { PieChart, CheckCircle2, Clock, PlayCircle, XCircle } from 'lucide-react';

interface CourseStatusChartProps {
  records: NormalizedStudentRecord[];
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export const CourseStatusChart: React.FC<CourseStatusChartProps> = ({
  records,
  selectedStatus,
  onSelectStatus,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const statusCounts = {
    'In Progress': 0,
    Completed: 0,
    'Not Started': 0,
    'Not Enrolled': 0,
  };

  records.forEach((r) => {
    const cs = (r.courseStatus || '').toLowerCase();
    if (cs.includes('progress')) {
      statusCounts['In Progress']++;
    } else if (cs.includes('completed')) {
      statusCounts['Completed']++;
    } else if (cs.includes('not started')) {
      statusCounts['Not Started']++;
    } else {
      statusCounts['Not Enrolled']++;
    }
  });

  const total = records.length || 1;

  const segments = [
    {
      key: 'In Progress',
      label: 'In Progress',
      count: statusCounts['In Progress'],
      color: '#0284c7', // sky-600
      bgColor: 'bg-sky-500',
      textColor: 'text-sky-700',
      borderColor: 'border-sky-200',
      icon: PlayCircle,
    },
    {
      key: 'Completed',
      label: 'Completed',
      count: statusCounts['Completed'],
      color: '#10b981', // emerald-500
      bgColor: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      icon: CheckCircle2,
    },
    {
      key: 'Not Started',
      label: 'Not Started',
      count: statusCounts['Not Started'],
      color: '#f59e0b', // amber-500
      bgColor: 'bg-amber-500',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      icon: Clock,
    },
    {
      key: 'Not Enrolled',
      label: 'Not Enrolled',
      count: statusCounts['Not Enrolled'],
      color: '#94a3b8', // slate-400
      bgColor: 'bg-slate-400',
      textColor: 'text-slate-600',
      borderColor: 'border-slate-200',
      icon: XCircle,
    },
  ];

  // Calculate SVG donut stroke dash arrays
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const renderedSegments = segments.map((seg) => {
    const percentage = seg.count / total;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += percentage * circumference;
    return { ...seg, strokeDasharray, strokeDashoffset, percentage: (percentage * 100).toFixed(1) };
  });

  const activeSegment = hoveredIdx !== null ? renderedSegments[hoveredIdx] : null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-card flex flex-col justify-between">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center">
          <PieChart className="w-4 h-4 text-brand-800" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 font-sans">
            Course Learning Status
          </h3>
          <p className="text-xs text-slate-500">
            Student participation and completion breakdown
          </p>
        </div>
      </div>

      {/* Donut Chart and Center Metrics */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              className="text-slate-100"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
            />
            {renderedSegments.map((seg, idx) => (
              <circle
                key={seg.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={seg.color}
                strokeWidth={hoveredIdx === idx ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => onSelectStatus(selectedStatus === seg.key ? 'all' : seg.key)}
              />
            ))}
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {activeSegment ? (
              <>
                <span className="text-xl font-black text-slate-900 font-sans">
                  {activeSegment.count}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                  {activeSegment.percentage}%
                </span>
              </>
            ) : (
              <>
                <span className="text-xl font-black text-slate-900 font-sans">
                  {total}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                  Students
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend / Status Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 w-full max-w-[240px]">
          {renderedSegments.map((seg, idx) => {
            const Icon = seg.icon;
            const isSelected = selectedStatus.toLowerCase() === seg.key.toLowerCase();

            return (
              <button
                key={seg.key}
                type="button"
                onClick={() => onSelectStatus(isSelected ? 'all' : seg.key)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                  isSelected
                    ? 'bg-brand-50 border-brand-800 shadow-sm ring-1 ring-brand-800'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg ${seg.bgColor}/10 ${seg.textColor} flex items-center justify-center`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>{seg.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {seg.percentage}% of class
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 font-mono">
                    {seg.count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
