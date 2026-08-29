import React, { useState, useEffect, useCallback } from 'react';
import {
  SearchType,
  NormalizedStudentRecord,
  DatabaseMetadata,
} from './types/student';
import { loadHardcodedExcelDatabase } from './services/excelService';
import { executeSearch } from './utils/searchUtils';
import { Header } from './components/Header';
import { SearchTypeSelector } from './components/SearchTypeSelector';
import { SearchBox } from './components/SearchBox';
import { StudentResultCard } from './components/StudentResultCard';
import { MultipleResultsList } from './components/MultipleResultsList';
import { EmptyState } from './components/EmptyState';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

export const App: React.FC = () => {
  const [records, setRecords] = useState<NormalizedStudentRecord[]>([]);
  const [metadata, setMetadata] = useState<DatabaseMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Active top-level Tab: 'search' | 'analytics'
  const [activeTab, setActiveTab] = useState<'search' | 'analytics'>('search');

  // Search state — Primary search mode is 'name'
  const [searchType, setSearchType] = useState<SearchType>('name');
  const [searchStatus, setSearchStatus] = useState<
    'idle' | 'success' | 'multiple-results' | 'no-results'
  >('idle');
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<NormalizedStudentRecord | null>(null);
  const [multipleResults, setMultipleResults] = useState<NormalizedStudentRecord[]>([]);

  // Load the hardcoded database on mount or refresh
  const loadDatabase = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const result = await loadHardcodedExcelDatabase();
      setRecords(result.records);
      setMetadata(result.metadata);
    } catch (err: any) {
      console.error('Failed to load student database:', err);
      setLoadError(err.message || 'Unable to load student database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDatabase();
  }, [loadDatabase]);

  // Check if current dataset uses alphanumeric IDs (e.g. GJ-006175)
  const isAlphanumericId = Boolean(
    records.length > 0 &&
      records.some((r) => /[a-zA-Z]/.test(r.studentNumber))
  );

  const handleSearch = (query: string, type: SearchType) => {
    setCurrentQuery(query);
    const { matches } = executeSearch(query, type, records, isAlphanumericId);

    if (matches.length === 0) {
      setSearchStatus('no-results');
      setSelectedStudent(null);
      setMultipleResults([]);
    } else if (matches.length === 1 || type === 'studentNumber' || type === 'email') {
      setSearchStatus('success');
      setSelectedStudent(matches[0]);
      setMultipleResults([]);
    } else {
      // Multiple matches (e.g. searching "Aarav" or "Aadhya" by name)
      setSearchStatus('multiple-results');
      setSelectedStudent(null);
      setMultipleResults(matches);
    }
  };

  const handleSelectSuggestion = (student: NormalizedStudentRecord) => {
    setSelectedStudent(student);
    setSearchStatus('success');
    setMultipleResults([]);
  };

  const handleSelectFromMultiple = (student: NormalizedStudentRecord) => {
    setSelectedStudent(student);
    setSearchStatus('success');
  };

  const handleBackToMultiple = () => {
    setSelectedStudent(null);
    setSearchStatus('multiple-results');
  };

  const handleClearSearch = () => {
    setSearchStatus('idle');
    setSelectedStudent(null);
    setMultipleResults([]);
    setCurrentQuery('');
  };

  // Switch from analytics table to student search card directly
  const handleViewStudentFromAnalytics = (student: NormalizedStudentRecord) => {
    setSelectedStudent(student);
    setSearchStatus('success');
    setMultipleResults([]);
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* New Era School Header with Tab Navigation */}
      <Header
        metadata={metadata}
        isLoading={isLoading}
        onRefresh={loadDatabase}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <EmptyState type="loading" />
        ) : loadError ? (
          <EmptyState
            type="error"
            errorMessage={loadError}
            onRetry={loadDatabase}
          />
        ) : activeTab === 'analytics' ? (
          /* Analytics & Dashboard View */
          <AnalyticsDashboard
            records={records}
            onSelectStudent={handleViewStudentFromAnalytics}
          />
        ) : (
          /* Student Credentials Search View */
          <div className="max-w-4xl mx-auto">
            {/* Search Control Card */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card mb-8">
              <div className="space-y-6">
                {/* Search Type Selector (Name Primary) */}
                <div className="border-b border-slate-100 pb-5">
                  <SearchTypeSelector
                    selectedType={searchType}
                    onChange={(t) => {
                      setSearchType(t);
                      handleClearSearch();
                    }}
                  />
                </div>

                {/* Search Input Box with Autocomplete */}
                <SearchBox
                  searchType={searchType}
                  records={records}
                  onSearch={handleSearch}
                  onSelectSuggestion={handleSelectSuggestion}
                  onClear={handleClearSearch}
                  isAlphanumericIdSupported={isAlphanumericId}
                />
              </div>
            </section>

            {/* Results / Feedback Section */}
            <section id="results-display-area" className="transition-all duration-200">
              {searchStatus === 'success' && selectedStudent ? (
                <StudentResultCard
                  student={selectedStudent}
                  hasMultipleMatches={multipleResults.length > 1}
                  onBackToMultiple={
                    multipleResults.length > 1 ? handleBackToMultiple : undefined
                  }
                />
              ) : searchStatus === 'multiple-results' ? (
                <MultipleResultsList
                  students={multipleResults}
                  query={currentQuery}
                  onSelect={handleSelectFromMultiple}
                />
              ) : searchStatus === 'no-results' ? (
                <EmptyState type="no-results" searchQuery={currentQuery} />
              ) : (
                <EmptyState type="initial" />
              )}
            </section>
          </div>
        )}
      </main>

      {/* Official School Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span>© 2026 New Era Senior Secondary School, Vadodara</span>
            <span className="text-slate-300">•</span>
            <span>School Code: GJ-00039</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Innoventure Examination & Student Credentials Portal
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
