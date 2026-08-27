import React from 'react';
import { SearchType } from '../types/student';
import { Hash, Mail, User } from 'lucide-react';

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
    type: 'studentNumber',
    label: 'Student Number',
    shortLabel: 'Student No.',
    icon: Hash,
    description: 'Exact 10-digit numeric student identifier',
  },
  {
    type: 'email',
    label: 'Email ID',
    shortLabel: 'Email',
    icon: Mail,
    description: 'Institutional or registered student email',
  },
  {
    type: 'name',
    label: 'Name',
    shortLabel: 'Student Name',
    icon: User,
    description: 'Full or partial student name search',
  },
];

export const SearchTypeSelector: React.FC<SearchTypeSelectorProps> = ({
  selectedType,
  onChange,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
          Search By
        </label>
        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          {SEARCH_OPTIONS.find((o) => o.type === selectedType)?.description}
        </span>
      </div>

      {/* Segmented Selector for Desktop & Mobile */}
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
                  ? 'bg-white text-brand-900 shadow-sm border border-slate-200/60 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-brand-800' : 'text-slate-400'
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
