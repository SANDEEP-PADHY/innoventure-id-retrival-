import React, { useEffect, useRef } from 'react';
import { SuggestionItem, SearchType } from '../types/student';
import { Hash, Mail, User, ArrowRight, CornerDownLeft } from 'lucide-react';

interface SuggestionsDropdownProps {
  suggestions: SuggestionItem[];
  query: string;
  searchType: SearchType;
  selectedIndex: number;
  isOpen: boolean;
  onSelect: (item: SuggestionItem) => void;
  onClose: () => void;
}

/**
 * Highlights the matched part of the query in the suggestion string
 */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <span>{text}</span>;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-brand-100/90 text-brand-900 font-bold px-0.5 rounded">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export const SuggestionsDropdown: React.FC<SuggestionsDropdownProps> = ({
  suggestions,
  query,
  searchType,
  selectedIndex,
  isOpen,
  onSelect,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (selectedIndex >= 0 && containerRef.current) {
      const activeEl = containerRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen || suggestions.length === 0) {
    return null;
  }

  const getIcon = () => {
    switch (searchType) {
      case 'studentNumber':
        return Hash;
      case 'email':
        return Mail;
      case 'name':
        return User;
    }
  };

  const Icon = getIcon();

  return (
    <div
      ref={containerRef}
      id="autocomplete-dropdown"
      className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-dropdown z-50 overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto"
    >
      <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
        <span>Suggested Matches ({suggestions.length})</span>
        <span className="flex items-center gap-1 font-mono text-[10px] lowercase">
          <CornerDownLeft className="w-3 h-3" /> press enter to select
        </span>
      </div>

      <div className="py-1">
        {suggestions.map((item, index) => {
          const isSelected = index === selectedIndex;

          return (
            <button
              key={item.id + index}
              data-index={index}
              type="button"
              id={`suggestion-item-${index}`}
              onClick={() => onSelect(item)}
              onMouseEnter={() => {}}
              className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                isSelected
                  ? 'bg-brand-50/80 text-brand-900 border-l-4 border-brand-800'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isSelected
                      ? 'bg-brand-100 text-brand-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    <HighlightMatch text={item.fullTitle} query={query} />
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {item.subtitle}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {item.badge && (
                  <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded border border-slate-200">
                    {item.badge}
                  </span>
                )}
                <ArrowRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isSelected
                      ? 'text-brand-800 translate-x-0.5'
                      : 'text-slate-300'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
