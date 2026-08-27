import React, { useState, useEffect, useRef } from 'react';
import { SearchType, SuggestionItem, NormalizedStudentRecord } from '../types/student';
import {
  validateSearchInput,
  filterInputCharacters,
  getLiveSuggestions,
} from '../utils/searchUtils';
import { SuggestionsDropdown } from './SuggestionsDropdown';
import { Search, X, AlertCircle, ArrowRight } from 'lucide-react';

interface SearchBoxProps {
  searchType: SearchType;
  records: NormalizedStudentRecord[];
  onSearch: (query: string, searchType: SearchType) => void;
  onSelectSuggestion: (student: NormalizedStudentRecord) => void;
  onClear: () => void;
  isAlphanumericIdSupported?: boolean;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  searchType,
  records,
  onSearch,
  onSelectSuggestion,
  onClear,
  isAlphanumericIdSupported = false,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Clear query and suggestions when switching search type
  useEffect(() => {
    setQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
    setIsDropdownOpen(false);
    setHasInteracted(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchType]);

  // Compute live suggestions & validation
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setSelectedIndex(-1);
      setIsDropdownOpen(false);
      return;
    }

    const live = getLiveSuggestions(query, searchType, records, 7);
    setSuggestions(live);
    setSelectedIndex(-1);
    setIsDropdownOpen(live.length > 0);
  }, [query, searchType, records]);

  const validation = validateSearchInput(query, searchType, isAlphanumericIdSupported);
  const isSearchValid = validation.isValid;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const sanitized = filterInputCharacters(rawVal, searchType, isAlphanumericIdSupported);
    setQuery(sanitized);
    setHasInteracted(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isDropdownOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsDropdownOpen(false);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex]);
          return;
        }
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (isSearchValid) {
        setIsDropdownOpen(false);
        onSearch(query, searchType);
      }
    }
  };

  const handleSelectSuggestion = (item: SuggestionItem) => {
    setQuery(item.matchedText);
    setIsDropdownOpen(false);
    onSelectSuggestion(item.record);
  };

  const handleSearchClick = () => {
    if (isSearchValid) {
      setIsDropdownOpen(false);
      onSearch(query, searchType);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
    setIsDropdownOpen(false);
    setHasInteracted(false);
    onClear();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case 'studentNumber':
        return isAlphanumericIdSupported
          ? 'Enter Student ID (e.g. GJ-006175 or 006175)'
          : 'Enter 10-digit student number (e.g. 1000123456)';
      case 'email':
        return 'Enter email address (e.g. student@example.com)';
      case 'name':
        return 'Enter student name (e.g. Rahul Sharma)';
    }
  };

  return (
    <div className="w-full">
      <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
        {/* Search Input Container */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5 text-slate-400" />
          </div>

          <input
            ref={inputRef}
            id="student-search-input"
            type={searchType === 'email' ? 'email' : 'text'}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setIsDropdownOpen(true);
            }}
            placeholder={getPlaceholder()}
            autoComplete="off"
            spellCheck="false"
            className={`w-full pl-11 pr-20 py-3.5 bg-white border rounded-xl text-base text-slate-900 placeholder:text-slate-400 placeholder:text-sm font-sans focus:outline-none transition-all shadow-sm ${
              searchType === 'studentNumber' ? 'font-mono tracking-wider' : ''
            } ${
              hasInteracted && query && !isSearchValid
                ? 'border-amber-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'
                : 'border-slate-300 focus:border-brand-800 focus:ring-4 focus:ring-brand-800/10'
            }`}
          />

          {/* Right input badges (Length Counter / Clear button) */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
            {searchType === 'studentNumber' && !isAlphanumericIdSupported && query.length > 0 && (
              <span
                className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                  query.length === 10
                    ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {query.length}/10
              </span>
            )}

            {query.length > 0 && (
              <button
                type="button"
                id="clear-search-btn"
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          <SuggestionsDropdown
            suggestions={suggestions}
            query={query}
            searchType={searchType}
            selectedIndex={selectedIndex}
            isOpen={isDropdownOpen}
            onSelect={handleSelectSuggestion}
            onClose={() => setIsDropdownOpen(false)}
          />
        </div>

        {/* Primary Search Button */}
        <button
          type="button"
          id="search-submit-button"
          onClick={handleSearchClick}
          disabled={!isSearchValid}
          className={`px-7 py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
            isSearchValid
              ? 'bg-brand-800 hover:bg-brand-900 text-white shadow-brand-900/20 cursor-pointer'
              : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Search</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Real-time Validation Message Banner */}
      {hasInteracted && query && !isSearchValid && validation.message && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 font-medium px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-lg animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>{validation.message}</span>
        </div>
      )}
    </div>
  );
};
