import React, { useState, useMemo } from 'react';
import { NormalizedStudentRecord } from '../types/student';
import { GradeDistributionChart } from './GradeDistributionChart';
import { CourseStatusChart } from './CourseStatusChart';
import {
  Users,
  Award,
  CheckCircle2,
  TrendingUp,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  records: NormalizedStudentRecord[];
  onSelectStudent: (student: NormalizedStudentRecord) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  records,
  onSelectStudent,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEmailVerified, setSelectedEmailVerified] = useState<string>('all');
  const [tableSearch, setTableSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const pageSize = 20;

  // Extract distinct grades sorted numerically
  const allGrades = useMemo(() => {
    const gradesSet = new Set<string>();
    records.forEach((r) => {
      if (r.className) gradesSet.add(r.className);
    });
    return Array.from(gradesSet).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [records]);

  // Filter records by selected grade, status, email verification, and search term
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Grade filter
      if (selectedGrade !== 'all' && (r.className || '') !== selectedGrade) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        const cs = (r.courseStatus || '').toLowerCase();
        if (selectedStatus === 'In Progress' && !cs.includes('progress')) return false;
        if (selectedStatus === 'Completed' && !cs.includes('completed')) return false;
        if (selectedStatus === 'Not Started' && !cs.includes('not started')) return false;
        if (selectedStatus === 'Not Enrolled' && (cs.includes('progress') || cs.includes('completed') || cs.includes('not started'))) return false;
      }

      // Email verified filter
      if (selectedEmailVerified !== 'all') {
        const verifiedField = r.allFields.find((f) => f.key.toLowerCase().includes('email verified'));
        const val = (verifiedField?.value || '').toLowerCase();
        if (selectedEmailVerified === 'yes' && val !== 'yes') return false;
        if (selectedEmailVerified === 'no' && val === 'yes') return false;
      }

      // Table search query
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase().trim();
        const nameMatch = r.name.toLowerCase().includes(q);
        const idMatch = r.studentNumber.toLowerCase().includes(q);
        const emailMatch = r.email.toLowerCase().includes(q) || (r.altEmail && r.altEmail.toLowerCase().includes(q));
        const phoneMatch = (r.phone && r.phone.toLowerCase().includes(q)) || (r.altPhone && r.altPhone.toLowerCase().includes(q));
        if (!nameMatch && !idMatch && !emailMatch && !phoneMatch) return false;
      }

      return true;
    });
  }, [records, selectedGrade, selectedStatus, selectedEmailVerified, tableSearch]);

  // Sort filtered records
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (sortField === 'name') {
        valA = a.name;
        valB = b.name;
      } else if (sortField === 'id') {
        valA = a.studentNumber;
        valB = b.studentNumber;
      } else if (sortField === 'grade') {
        valA = parseInt(a.className || '0') || 0;
        valB = parseInt(b.className || '0') || 0;
      } else if (sortField === 'progress') {
        const progA = a.allFields.find((f) => f.key.toLowerCase().includes('progress'))?.value || '0';
        const progB = b.allFields.find((f) => f.key.toLowerCase().includes('progress'))?.value || '0';
        valA = parseFloat(progA) || 0;
        valB = parseFloat(progB) || 0;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredRecords, sortField, sortOrder]);

  // Paginated records
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  // Reset page when filters change
  const handleGradeFilter = (g: string) => {
    setSelectedGrade(g);
    setCurrentPage(1);
  };

  const handleStatusFilter = (s: string) => {
    setSelectedStatus(s);
    setCurrentPage(1);
  };

  // KPI Calculations on currently active Grade scope
  const gradeScopeRecords = useMemo(() => {
    if (selectedGrade === 'all') return records;
    return records.filter((r) => r.className === selectedGrade);
  }, [records, selectedGrade]);

  const kpis = useMemo(() => {
    const total = gradeScopeRecords.length;
    let enrolled = 0;
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    let totalCertificates = 0;
    let verifiedEmail = 0;
    let totalProgressSum = 0;
    let progressCount = 0;

    gradeScopeRecords.forEach((r) => {
      const cs = (r.courseStatus || '').toLowerCase();
      if (cs.includes('completed')) {
        completed++;
        enrolled++;
      } else if (cs.includes('progress')) {
        inProgress++;
        enrolled++;
      } else if (cs.includes('not started')) {
        notStarted++;
        enrolled++;
      }

      const certField = r.allFields.find((f) => f.key.toLowerCase().includes('certificate'));
      if (certField && parseInt(certField.value)) {
        totalCertificates += parseInt(certField.value);
      }

      const verifiedField = r.allFields.find((f) => f.key.toLowerCase().includes('email verified'));
      if (verifiedField && verifiedField.value.toLowerCase() === 'yes') {
        verifiedEmail++;
      }

      const progField = r.allFields.find((f) => f.key.toLowerCase().includes('progress'));
      if (progField) {
        const p = parseFloat(progField.value);
        if (!isNaN(p) && p > 0) {
          totalProgressSum += p;
          progressCount++;
        }
      }
    });

    const completionRate = enrolled > 0 ? ((completed / enrolled) * 100).toFixed(1) : '0';
    const emailVerifiedRate = total > 0 ? ((verifiedEmail / total) * 100).toFixed(1) : '0';
    const avgProgress = progressCount > 0 ? (totalProgressSum / progressCount).toFixed(1) : '0';

    return {
      total,
      enrolled,
      completed,
      inProgress,
      notStarted,
      totalCertificates,
      completionRate,
      emailVerifiedRate,
      avgProgress,
    };
  }, [gradeScopeRecords]);

  // Export filtered data as CSV
  const handleExportCSV = () => {
    if (sortedRecords.length === 0) return;

    // Headers
    const headers = [
      'Sr.',
      'Student Name',
      'Innov ID',
      'Grade',
      'Primary Contact',
      'Primary Email',
      'Course Status',
      'Progress %',
      'Certificates Issued',
      'Email Verified',
    ];

    const rows = sortedRecords.map((r, idx) => {
      const prog = r.allFields.find((f) => f.key.toLowerCase().includes('progress'))?.value || '0';
      const cert = r.allFields.find((f) => f.key.toLowerCase().includes('certificate'))?.value || '0';
      const ev = r.allFields.find((f) => f.key.toLowerCase().includes('email verified'))?.value || 'No';

      return [
        idx + 1,
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.studentNumber}"`,
        `"${r.className || ''}"`,
        `"${r.phone || ''}"`,
        `"${r.email || ''}"`,
        `"${r.courseStatus || ''}"`,
        `"${prog}"`,
        `"${cert}"`,
        `"${ev}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Innoventure_Students_${selectedGrade === 'all' ? 'AllGrades' : `Grade_${selectedGrade}`}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Grade / Class Filter Navigation Bar */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-900 text-gold-300 flex items-center justify-center font-bold text-xs shadow-sm">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-sans">
                Filter by Class / Grade
              </h2>
              <p className="text-xs text-slate-500">
                Select a class to view targeted performance & student credentials
              </p>
            </div>
          </div>

          {/* Quick Clear Filter if active */}
          {selectedGrade !== 'all' && (
            <button
              type="button"
              onClick={() => handleGradeFilter('all')}
              className="text-xs font-bold text-brand-900 hover:text-brand-950 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-lg transition-all"
            >
              Reset to All Classes (801 Students)
            </button>
          )}
        </div>

        {/* Grade Pills Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => handleGradeFilter('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 shadow-sm ${
              selectedGrade === 'all'
                ? 'bg-brand-900 text-white shadow-brand-900/20 ring-2 ring-brand-900 ring-offset-1'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <span>All Grades</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedGrade === 'all'
                  ? 'bg-gold-400 text-brand-950'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              {records.length}
            </span>
          </button>

          {allGrades.map((grade) => {
            const count = records.filter((r) => r.className === grade).length;
            const isSelected = selectedGrade === grade;

            return (
              <button
                key={grade}
                type="button"
                onClick={() => handleGradeFilter(grade)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 shadow-sm ${
                  isSelected
                    ? 'bg-brand-900 text-white shadow-brand-900/20 ring-2 ring-brand-900 ring-offset-1'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <span>Grade {grade}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${
                    isSelected
                      ? 'bg-gold-400 text-brand-950'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* KPI Overview Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {selectedGrade === 'all' ? 'Total Students' : `Grade ${selectedGrade} Students`}
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-900 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-sans tracking-tight">
              {kpis.total}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              100% Active
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {selectedGrade === 'all' ? 'Enrolled across Grade 1 to 9' : `${((kpis.total / records.length) * 100).toFixed(1)}% of total school strength`}
          </div>
        </div>

        {/* Courses Enrolled & In Progress */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Learners
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-sans tracking-tight">
              {kpis.inProgress}
            </span>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
              In Progress
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Avg. Course Progress: <strong className="text-slate-700">{kpis.avgProgress}%</strong>
          </div>
        </div>

        {/* Course Completion Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completions
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-sans tracking-tight">
              {kpis.completed}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {kpis.completionRate}% Rate
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {kpis.completed} out of {kpis.enrolled} enrolled students
          </div>
        </div>

        {/* Certificates Awarded */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Certificates Issued
            </span>
            <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-900 flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-sans tracking-tight">
              {kpis.totalCertificates}
            </span>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
              Innoventure
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Email Verified: <strong className="text-slate-700">{kpis.emailVerifiedRate}%</strong>
          </div>
        </div>
      </section>

      {/* Visual Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GradeDistributionChart
            records={records}
            selectedGrade={selectedGrade}
            onSelectGrade={handleGradeFilter}
          />
        </div>
        <div>
          <CourseStatusChart
            records={gradeScopeRecords}
            selectedStatus={selectedStatus}
            onSelectStatus={handleStatusFilter}
          />
        </div>
      </section>

      {/* Filtered Student Data Explorer */}
      <section className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        {/* Table Controls & Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-900" />
                <h3 className="text-lg font-bold text-slate-900 font-sans">
                  {selectedGrade === 'all'
                    ? 'All Student Records'
                    : `Grade ${selectedGrade} Student Records`}
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-extrabold bg-brand-100 text-brand-900 rounded-full">
                  {sortedRecords.length} Students
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Explore credentials, contact details, course status, and certificates
              </p>
            </div>

            {/* Actions: Search & Export CSV */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search within filtered list */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => {
                    setTableSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search in table..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-brand-900 bg-white"
                />
              </div>

              {/* Status Filter Dropdown */}
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="py-2 px-3 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 font-semibold focus:outline-none focus:border-brand-900"
              >
                <option value="all">All Course Status</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Not Started">Not Started</option>
                <option value="Not Enrolled">Not Enrolled</option>
              </select>

              {/* Email Verification Filter Dropdown */}
              <select
                value={selectedEmailVerified}
                onChange={(e) => {
                  setSelectedEmailVerified(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-2 px-3 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 font-semibold focus:outline-none focus:border-brand-900"
              >
                <option value="all">All Email Status</option>
                <option value="yes">Email Verified: Yes</option>
                <option value="no">Email Verified: No</option>
              </select>

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                title="Export filtered records to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12">#</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-brand-900"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    <span>Student Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-brand-900"
                  onClick={() => toggleSort('id')}
                >
                  <div className="flex items-center gap-1">
                    <span>Innov ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-brand-900"
                  onClick={() => toggleSort('grade')}
                >
                  <div className="flex items-center gap-1">
                    <span>Grade</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Course Status</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-brand-900"
                  onClick={() => toggleSort('progress')}
                >
                  <div className="flex items-center gap-1">
                    <span>Progress</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Certificates</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((student, idx) => {
                  const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                  const progressVal = student.allFields.find((f) =>
                    f.key.toLowerCase().includes('progress')
                  )?.value;
                  const progressNum = parseFloat(progressVal || '0');

                  const certVal = student.allFields.find((f) =>
                    f.key.toLowerCase().includes('certificate')
                  )?.value;

                  const csLower = (student.courseStatus || '').toLowerCase();

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-brand-50/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectStudent(student)}
                    >
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {globalIdx}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-brand-900 transition-colors">
                          {student.name}
                        </div>
                        {student.email && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {student.email}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-brand-900">
                        {student.studentNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-900 border border-brand-200">
                          Grade {student.className || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {student.phone ? (
                          <div className="font-mono">{student.phone}</div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            csLower.includes('completed')
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : csLower.includes('progress')
                              ? 'bg-sky-50 text-sky-800 border border-sky-200'
                              : csLower.includes('not started')
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              csLower.includes('completed')
                                ? 'bg-emerald-500'
                                : csLower.includes('progress')
                                ? 'bg-sky-500'
                                : csLower.includes('not started')
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          {student.courseStatus || 'Not Enrolled'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {!isNaN(progressNum) && progressNum > 0 ? (
                          <div className="w-24">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 mb-0.5">
                              <span>{progressNum}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div
                                className="h-full bg-brand-800 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(0, progressNum))}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">0%</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {certVal && parseInt(certVal) > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[11px]">
                            <Award className="w-3 h-3 text-amber-600" />
                            <span>{certVal}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onSelectStudent(student)}
                          className="px-3 py-1.5 bg-white group-hover:bg-brand-900 text-slate-700 group-hover:text-white border border-slate-200 group-hover:border-brand-900 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 ml-auto"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-500">
                    No student records found matching the active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <div>
              Showing{' '}
              <strong className="text-slate-900">
                {(currentPage - 1) * pageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-900">
                {Math.min(currentPage * pageSize, sortedRecords.length)}
              </strong>{' '}
              of <strong className="text-slate-900">{sortedRecords.length}</strong> students
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
