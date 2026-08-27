import React from 'react';
import { SearchType } from '../types/student';
import { User, Hash, Mail } from 'lucide-react';

interface SearchTypeSelectorProps {
  selectedType: SearchType;
  onChange: (type: SearchType) => void;
}

const SEARCH_OPTIONS: {
  type: SearchType;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    type: 'name',
    label: 'Student Name',
    shortLabel: 'Name (Primary)',
    icon: User,
    description: 'Search by first or last name of the student',
  },
  {
    type: 'studentNumber',
    label: 'Innoventure ID',
    shortLabel: 'Innoventure ID',
    icon: Hash,
    description: 'Search by unique student ID (e.g. GJ-006175)',
  },
  {
    type: 'email',
    label: 'Registered Email',
    shortLabel: 'Email',
    icon: Mail,
    description: 'Search by registered parent or student email',
  },
];

export const SearchTypeSelector: React.FC<SearchTypeSelectorProps> = ({
  selectedType,
  onChange,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-sans">
          Search Mode
        </label>
        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          {SEARCH_OPTIONS.find((o) => o.type === selectedType)?.description}
        </span>
      </div>

      {/* Segmented Selector with Name First */}
      <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80">
        {SEARCH_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = selectedType === opt.type;

          return (
            <button
              key={opt.type}
              type="button"
              id={`search-type-${opt.type}`}
              onClick={() => onChange(opt.type)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-white text-brand-900 shadow-sm border border-slate-200/80 font-bold ring-1 ring-brand-900/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-brand-900' : 'text-slate-400'
                }`}
              />
              <span className="hidden sm:inline">{opt.label}</span>
              <span className="sm:hidden">{opt.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
