import React, { useState, useMemo, useEffect } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { FilterBar } from '../../components/ui/FilterBar';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { PrintPortal } from '../../components/ui/PrintPortal';
import { ReportHeader } from '../../components/ui/ReportHeader';
import { INITIAL_STUDENTS, INITIAL_COACHES, INITIAL_CATEGORIES, INITIAL_SESSION_REPORTS } from '../../mock-data/msrf-data';
import { CalendarCheck, Download, UserCheck, Tag, FileDown, Printer, Users, Calendar, Layers, CheckCircle2 } from 'lucide-react';
import { formatDate, formatPhoneNumber, exportToCSV } from '../../utils/format';

interface AttendanceEntry {
  id: string;
  studentId: string;
  studentName: string;
  category: string;
  status: 'Present' | 'Absent' | 'Informed';
  markedByCoach: string;
  markedAtTime: string;
  date: string;
}

interface CoachAttendanceEntry {
  id: string;
  coachId: string;
  coachName: string;
  phone: string;
  category: string;
  trainingCenter: string;
  status: 'Present';
  markedBy: string;
  remarks: string;
  date: string;
}

interface StudentMonthlySummary {
  studentId: string;
  studentName: string;
  category: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  informedCount: number;
  attendanceRate: number;
  status: 'Good' | 'Needs Attention' | 'Critical';
}

const ALL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const AttendanceManagementPage: React.FC = () => {
  // Current calendar calculations
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const todayStr = now.toISOString().slice(0, 10);
  const currentMonthName = ALL_MONTHS[currentMonthIndex];

  const [activeTab, setActiveTab] = useState<'trainees' | 'coaches'>('trainees');
  const [viewMode, setViewMode] = useState<'stream' | 'summary'>('stream');

  // Multi-level Filtration: Year, Month, and Date
  const [yearFilter, setYearFilter] = useState<string>(String(currentYear));
  const [monthFilter, setMonthFilter] = useState<string>(currentMonthName);
  const [dateFilter, setDateFilter] = useState<string>(todayStr); // specific date or 'ALL'
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pdfModal, setPdfModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Year options: strictly no future years (only current year and past 5 years)
  const yearOptions = [
    { label: 'All Years', value: 'ALL' },
    ...Array.from({ length: 6 }, (_, i) => {
      const yr = currentYear - i;
      return { label: String(yr), value: String(yr) };
    })
  ];

  // Month options: strictly no future months when current year is selected
  const monthOptions = useMemo(() => {
    const list = [{ label: 'All Months', value: 'ALL' }];
    if (yearFilter === String(currentYear)) {
      // Current year: only up to current month (no future months)
      ALL_MONTHS.slice(0, currentMonthIndex + 1).forEach(m => {
        list.push({ label: m, value: m });
      });
    } else {
      // Past years or ALL: all 12 months allowed
      ALL_MONTHS.forEach(m => {
        list.push({ label: m, value: m });
      });
    }
    return list;
  }, [yearFilter, currentYear, currentMonthIndex]);

  // If year changes to currentYear and selected month is in the future, reset to currentMonthName
  useEffect(() => {
    if (yearFilter === String(currentYear) && monthFilter !== 'ALL') {
      const mIdx = ALL_MONTHS.indexOf(monthFilter);
      if (mIdx > currentMonthIndex) {
        setMonthFilter(currentMonthName);
      }
    }
  }, [yearFilter, monthFilter, currentYear, currentMonthIndex, currentMonthName]);

  // When year or month filter changes, if a specific date was selected outside this period, switch date to 'ALL'
  useEffect(() => {
    if (dateFilter !== 'ALL') {
      const dateYear = dateFilter.slice(0, 4);
      const dateMonthIdx = parseInt(dateFilter.slice(5, 7), 10) - 1;
      const dateMonthName = ALL_MONTHS[dateMonthIdx];

      const matchesYear = yearFilter === 'ALL' || yearFilter === dateYear;
      const matchesMonth = monthFilter === 'ALL' || monthFilter === dateMonthName;

      if (!matchesYear || !matchesMonth) {
        setDateFilter('ALL');
        setCurrentPage(1);
      }
    }
  }, [yearFilter, monthFilter]);

  // Handle specific date picker change: synchronizes year and month
  const handleSelectSpecificDate = (newDate: string) => {
    if (!newDate) return;
    setDateFilter(newDate);
    const yr = newDate.slice(0, 4);
    const mIdx = parseInt(newDate.slice(5, 7), 10) - 1;
    setYearFilter(yr);
    if (ALL_MONTHS[mIdx]) {
      setMonthFilter(ALL_MONTHS[mIdx]);
    }
    setCurrentPage(1);
  };

  // Resolve session dates for the current filter settings
  const resolvedSessionDates = useMemo(() => {
    if (dateFilter !== 'ALL') {
      return [dateFilter];
    }

    // Date is 'ALL': find all session dates matching Year & Month
    const knownDates = Array.from(new Set(INITIAL_SESSION_REPORTS.map(r => r.date)));
    if (!knownDates.includes(todayStr) && (yearFilter === 'ALL' || todayStr.startsWith(yearFilter))) {
      knownDates.push(todayStr);
    }

    const matched = knownDates.filter(d => {
      if (yearFilter !== 'ALL' && !d.startsWith(yearFilter)) return false;
      if (monthFilter !== 'ALL') {
        const mIdx = parseInt(d.slice(5, 7), 10) - 1;
        if (ALL_MONTHS[mIdx] !== monthFilter) return false;
      }
      return true;
    }).sort((a, b) => b.localeCompare(a));

    if (matched.length > 0) return matched;

    // Deterministic fallback session dates for past/custom months
    if (yearFilter !== 'ALL' && monthFilter !== 'ALL') {
      const mIdx = ALL_MONTHS.indexOf(monthFilter) + 1;
      const mStr = String(mIdx).padStart(2, '0');
      const maxDays = (yearFilter === String(currentYear) && monthFilter === currentMonthName)
        ? Math.min(28, parseInt(todayStr.slice(8, 10), 10))
        : 28;
      const generated: string[] = [];
      [4, 11, 18, 25].forEach(day => {
        if (day <= maxDays) {
          generated.push(`${yearFilter}-${mStr}-${String(day).padStart(2, '0')}`);
        }
      });
      if (generated.length === 0) generated.push(`${yearFilter}-${mStr}-01`);
      return generated.sort((a, b) => b.localeCompare(a));
    }

    return [todayStr];
  }, [dateFilter, yearFilter, monthFilter, todayStr, currentYear, currentMonthName]);

  // Generate Trainee attendance logs for all resolved dates
  const allTraineeLogs = useMemo<AttendanceEntry[]>(() => {
    const list: AttendanceEntry[] = [];
    resolvedSessionDates.forEach(dateStr => {
      const report = INITIAL_SESSION_REPORTS.find(r => r.date === dateStr);
      INITIAL_STUDENTS.forEach((s, idx) => {
        const coachObj = INITIAL_COACHES[idx % INITIAL_COACHES.length];
        const override = report?.studentAttendance?.[s.id] || report?.studentAttendance?.[`st-${idx + 1}`];
        let status: 'Present' | 'Absent' | 'Informed';
        if (override) {
          status = override.status;
        } else {
          const dateNum = parseInt(dateStr.replace(/\D/g, ''), 10) || 1;
          const hash = (s.fullName.length * 7 + dateNum + idx) % 15;
          status = hash === 0 ? 'Absent' : hash === 1 ? 'Informed' : 'Present';
        }

        list.push({
          id: `att-${s.id}-${dateStr}`,
          studentId: s.studentId,
          studentName: s.fullName,
          category: s.category || 'Football Excellence',
          status,
          markedByCoach: report?.loggedByCoachName || (coachObj ? coachObj.fullName : 'Rajesh Varma'),
          markedAtTime: report?.time?.split(' - ')?.[0] || `${String(6 + (idx % 2) * 10).padStart(2, '0')}:${String((idx * 7) % 60).padStart(2, '0')} AM`,
          date: dateStr
        });
      });
    });
    return list;
  }, [resolvedSessionDates]);

  // Generate Coach attendance logs for all resolved dates
  const allCoachLogs = useMemo<CoachAttendanceEntry[]>(() => {
    const list: CoachAttendanceEntry[] = [];
    resolvedSessionDates.forEach(dateStr => {
      const sessionReportsForDate = INITIAL_SESSION_REPORTS.filter(r => r.date === dateStr);
      INITIAL_COACHES.forEach((c) => {
        const loggedReport = sessionReportsForDate.find(r => r.loggedByCoachName === c.fullName);
        const coCoachReport = sessionReportsForDate.find(r => r.assignedCoaches?.includes(c.fullName));
        const activeReport = loggedReport || coCoachReport;

        if (activeReport) {
          const isLead = activeReport.loggedByCoachName === c.fullName;
          list.push({
            id: `coach-att-${c.id}-${dateStr}`,
            coachId: c.id,
            coachName: c.fullName,
            phone: c.phone,
            category: activeReport.categories?.[0] || 'Football Excellence',
            trainingCenter: activeReport.venue || 'Kozhikode Main Campus',
            status: 'Present',
            markedBy: isLead ? `Marked by ${c.fullName} (Lead Coach)` : `Marked by ${activeReport.loggedByCoachName}`,
            remarks: isLead ? `Logged Daily Session (${activeReport.dailyTopic})` : `Daily Training Session (Co-Coach)`,
            date: dateStr
          });
        } else {
          list.push({
            id: `coach-att-${c.id}-${dateStr}`,
            coachId: c.id,
            coachName: c.fullName,
            phone: c.phone,
            category: 'Football Excellence',
            trainingCenter: 'Kozhikode Main Campus',
            status: 'Present',
            markedBy: 'Auto-Logged / Present',
            remarks: 'Daily Training Session Conducted',
            date: dateStr
          });
        }
      });
    });
    return list;
  }, [resolvedSessionDates]);

  // Filtered Trainee Logs
  const filteredTraineeLogs = useMemo(() => {
    return allTraineeLogs.filter(log => {
      const matchesSearch =
        log.studentName.toLowerCase().includes(search.toLowerCase()) ||
        log.studentId.toLowerCase().includes(search.toLowerCase()) ||
        log.markedByCoach.toLowerCase().includes(search.toLowerCase()) ||
        log.date.includes(search);
      const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [allTraineeLogs, search, categoryFilter, statusFilter]);

  // Filtered Coach Logs
  const filteredCoachLogs = useMemo(() => {
    return allCoachLogs.filter(log => {
      const matchesSearch =
        log.coachName.toLowerCase().includes(search.toLowerCase()) ||
        log.phone.toLowerCase().includes(search.toLowerCase()) ||
        log.trainingCenter.toLowerCase().includes(search.toLowerCase()) ||
        log.date.includes(search);
      const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [allCoachLogs, search, categoryFilter, statusFilter]);

  // Aggregated Trainee Monthly Summary
  const traineeMonthlySummaries = useMemo<StudentMonthlySummary[]>(() => {
    const map = new Map<string, StudentMonthlySummary>();

    filteredTraineeLogs.forEach(log => {
      if (!map.has(log.studentId)) {
        map.set(log.studentId, {
          studentId: log.studentId,
          studentName: log.studentName,
          category: log.category,
          totalSessions: 0,
          presentCount: 0,
          absentCount: 0,
          informedCount: 0,
          attendanceRate: 0,
          status: 'Good'
        });
      }
      const item = map.get(log.studentId)!;
      item.totalSessions += 1;
      if (log.status === 'Present') item.presentCount += 1;
      else if (log.status === 'Absent') item.absentCount += 1;
      else if (log.status === 'Informed') item.informedCount += 1;
    });

    return Array.from(map.values()).map(item => {
      const rate = item.totalSessions > 0 ? Math.round((item.presentCount / item.totalSessions) * 100) : 0;
      return {
        ...item,
        attendanceRate: rate,
        status: rate >= 85 ? 'Good' : rate >= 70 ? 'Needs Attention' : 'Critical'
      };
    });
  }, [filteredTraineeLogs]);

  // Active logs & pagination
  const activeLogs = activeTab === 'trainees' ? filteredTraineeLogs : filteredCoachLogs;
  const totalPages = Math.ceil(activeLogs.length / pageSize) || 1;
  const paginatedLogs = activeLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Stats for Trainees
  const traineePresentCount = filteredTraineeLogs.filter(l => l.status === 'Present').length;
  const traineeAbsentCount = filteredTraineeLogs.filter(l => l.status === 'Absent').length;
  const traineeInformedCount = filteredTraineeLogs.filter(l => l.status === 'Informed').length;
  const traineeAttendanceRate = Math.round((traineePresentCount / (filteredTraineeLogs.length || 1)) * 100);

  // Stats for Coaches
  const coachPresentCount = filteredCoachLogs.length;
  const coachAttendanceRate = 100;

  // Active Period display label
  const periodLabel = dateFilter !== 'ALL'
    ? formatDate(dateFilter)
    : `${monthFilter !== 'ALL' ? monthFilter : 'All Months'} ${yearFilter !== 'ALL' ? yearFilter : 'All Years'}`;

  const handleExportCSV = () => {
    if (activeTab === 'trainees') {
      const data = filteredTraineeLogs.map(l => ({
        'Session Date': l.date,
        'Student ID': l.studentId,
        'Student Name': l.studentName,
        Category: l.category,
        Status: l.status,
        'Marked By Coach': l.markedByCoach,
        'Marked Time': l.markedAtTime
      }));
      exportToCSV(`msrf_trainee_attendance_${dateFilter !== 'ALL' ? dateFilter : `${monthFilter}_${yearFilter}`}`, data);
    } else {
      const data = filteredCoachLogs.map(l => ({
        'Session Date': l.date,
        'Coach ID': l.coachId,
        'Coach Name': l.coachName,
        Phone: l.phone,
        'Training Center': l.trainingCenter,
        Status: l.status,
        'Marked By': l.markedBy,
        Remarks: l.remarks
      }));
      exportToCSV(`msrf_coach_attendance_${dateFilter !== 'ALL' ? dateFilter : `${monthFilter}_${yearFilter}`}`, data);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <LayoutShell
      title="Attendance Management & Activity Logs"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Attendance' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setPdfModal(true)}
            icon={<FileDown className="w-4 h-4 text-emerald-600" />}
            className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          >
            Export Attendance PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} icon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
        </div>
      }
    >
      {/* Top Navigation Tabs: Trainees vs Coaches */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold bg-white px-6 pt-4 rounded-t-2xl border">
        <button
          onClick={() => { setActiveTab('trainees'); setCurrentPage(1); }}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'trainees'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-blue-600" />
          <span>Trainee Attendance</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {filteredTraineeLogs.length}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('coaches'); setCurrentPage(1); }}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'coaches'
              ? 'border-emerald-600 text-emerald-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Coach Attendance</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {filteredCoachLogs.length}
          </span>
        </button>
      </div>

      {/* Overview Metric Cards for Active Tab */}
      {activeTab === 'trainees' ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="bg-emerald-50 border-emerald-200">
            <p className="text-xs uppercase font-bold text-emerald-700">Present Trainees</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">{traineePresentCount}</p>
          </Card>
          <Card className="bg-rose-50 border-rose-200">
            <p className="text-xs uppercase font-bold text-rose-700">Absent Trainees</p>
            <p className="text-2xl font-black text-rose-900 mt-1">{traineeAbsentCount}</p>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <p className="text-xs uppercase font-bold text-amber-700">Informed Leave</p>
            <p className="text-2xl font-black text-amber-900 mt-1">{traineeInformedCount}</p>
          </Card>
          <Card className="bg-slate-50 border-slate-200">
            <p className="text-xs uppercase font-bold text-slate-500">Attendance Rate</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{traineeAttendanceRate}%</p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-emerald-50 border-emerald-200">
            <p className="text-xs uppercase font-bold text-emerald-700">Total Coaches</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">{INITIAL_COACHES.length}</p>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <p className="text-xs uppercase font-bold text-blue-700">Session Logs Recorded</p>
            <p className="text-2xl font-black text-blue-900 mt-1">{coachPresentCount}</p>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200">
            <p className="text-xs uppercase font-bold text-emerald-700">Coach Attendance Rate</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">100%</p>
          </Card>
        </div>
      )}

      {/* Date & Period Selection Bar: Supports Month, Year, and Date wise view */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-emerald-600" /> Filter By Date:
          </label>
          <input
            type="date"
            max={todayStr}
            value={dateFilter === 'ALL' ? '' : dateFilter}
            onChange={e => handleSelectSpecificDate(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          />

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSelectSpecificDate(todayStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                dateFilter === todayStr
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Today ({formatDate(todayStr).slice(0, 6)})
            </button>
            <button
              type="button"
              onClick={() => { setDateFilter('ALL'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                dateFilter === 'ALL'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              All Dates in Month
            </button>
          </div>
        </div>

        {/* Informative Period Badge */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className="text-slate-500">Active View:</span>
          <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-200 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {dateFilter !== 'ALL'
                ? `Single Date: ${formatDate(dateFilter)}`
                : `${monthFilter !== 'ALL' ? monthFilter : 'All Months'} ${yearFilter !== 'ALL' ? yearFilter : 'All Years'} (${resolvedSessionDates.length} Session Dates)`}
            </span>
          </span>
        </div>
      </div>

      {/* Main FilterBar with Month, Year, Category, Status */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={activeTab === 'trainees' ? "Search student name, ID, coach, date..." : "Search coach name, phone, campus, date..."}
        collapsibleFilters={true}
        filters={[
          {
            key: 'year',
            label: 'Year',
            value: yearFilter,
            onChange: (val) => { setYearFilter(val); setCurrentPage(1); },
            options: yearOptions
          },
          {
            key: 'month',
            label: 'Month',
            value: monthFilter,
            onChange: (val) => { setMonthFilter(val); setCurrentPage(1); },
            options: monthOptions
          },
          {
            key: 'category',
            label: 'Category',
            value: categoryFilter,
            onChange: (val) => { setCategoryFilter(val); setCurrentPage(1); },
            options: [
              { label: 'All Categories', value: 'ALL' },
              ...INITIAL_CATEGORIES.map(c => ({ label: c.title, value: c.title }))
            ]
          },
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: (val) => { setStatusFilter(val); setCurrentPage(1); },
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Present', value: 'Present' },
              { label: 'Absent', value: 'Absent' },
              { label: 'Informed', value: 'Informed' }
            ]
          }
        ]}
      />

      {/* Attendance Table Card Header with View Switcher */}
      <Card header={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-sm">
              {activeTab === 'trainees' ? 'Trainee Attendance Records' : 'Coach Attendance Records'}
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {activeLogs.length} Total Logs
            </span>
          </div>

          {/* Toggle between Daily Activity Stream and Trainee Monthly Summary */}
          {activeTab === 'trainees' && dateFilter === 'ALL' && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('stream')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'stream'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daily Activity Stream
              </button>
              <button
                type="button"
                onClick={() => setViewMode('summary')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'summary'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Summary
              </button>
            </div>
          )}
        </div>
      }>
        {activeLogs.length === 0 ? (
          <EmptyState title="No Attendance Logs" description="No attendance logs match your search and filter criteria." />
        ) : activeTab === 'trainees' ? (
          viewMode === 'summary' && dateFilter === 'ALL' ? (
            /* Cumulative Trainee Summary Table for Month-wise analysis */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Student Trainee</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3 text-center">Total Sessions</th>
                    <th className="py-3 px-3 text-center">Present</th>
                    <th className="py-3 px-3 text-center">Absent</th>
                    <th className="py-3 px-3 text-center">Informed Leave</th>
                    <th className="py-3 px-3 text-center">Attendance %</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {traineeMonthlySummaries.map(item => (
                    <tr key={item.studentId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-900 text-sm">{item.studentName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{item.studentId}</p>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-blue-600">
                        {item.category}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-900">{item.totalSessions}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-emerald-700">{item.presentCount}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-rose-600">{item.absentCount}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-amber-700">{item.informedCount}</td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`font-black text-xs px-2 py-0.5 rounded-full ${
                          item.attendanceRate >= 85
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.attendanceRate >= 70
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {item.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge variant={item.status === 'Good' ? 'active' : item.status === 'Needs Attention' ? 'pending' : 'suspended'}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Daily Trainee Attendance Records Stream */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Session Date</th>
                    <th className="py-3 px-3">Student Trainee</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Attendance Status</th>
                    <th className="py-3 px-3">Marked By Coach</th>
                    <th className="py-3 px-3">Marked Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {(paginatedLogs as AttendanceEntry[]).map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-[11px] font-mono font-bold border border-slate-200">
                          {formatDate(log.date)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-900 text-sm">{log.studentName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{log.studentId}</p>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-blue-600">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-blue-500" />
                          <span>{log.category}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge
                          variant={
                            log.status === 'Present'
                              ? 'active'
                              : log.status === 'Absent'
                              ? 'suspended'
                              : 'pending'
                          }
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{log.markedByCoach}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 font-mono">{log.markedAtTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Coach Attendance Records */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Session Date</th>
                  <th className="py-3 px-3">Coach Name</th>
                  <th className="py-3 px-3">Phone Number</th>
                  <th className="py-3 px-3">Training Campus</th>
                  <th className="py-3 px-3">Attendance Status</th>
                  <th className="py-3 px-3">Marked By</th>
                  <th className="py-3 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {(paginatedLogs as CoachAttendanceEntry[]).map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-[11px] font-mono font-bold border border-slate-200">
                        {formatDate(log.date)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900 text-sm">{log.coachName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">Coach ID: {log.coachId}</p>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-blue-600">
                      {formatPhoneNumber(log.phone)}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      {log.trainingCenter}
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge variant="active">
                        {log.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-900 w-fit">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{log.markedBy}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {log.remarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="pt-4 border-t border-slate-100">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={activeLogs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>

      {/* Official Attendance PDF Report Modal */}
      <Modal
        isOpen={pdfModal}
        onClose={() => setPdfModal(false)}
        title={`MSRF ${activeTab === 'trainees' ? 'Trainee' : 'Coach'} Attendance Report: ${periodLabel}`}
        size="lg"
        footer={
          <div className="flex justify-between w-full no-print">
            <Button variant="outline" onClick={() => setPdfModal(false)}>Close</Button>
            <Button icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
              Print / Save PDF Report
            </Button>
          </div>
        }
      >
        <div className="p-6 bg-white space-y-6 text-slate-800 text-xs font-sans">
          <ReportHeader
            title={activeTab === 'trainees' ? "TRAINEE ATTENDANCE REPORT" : "COACH ATTENDANCE REPORT"}
            date={dateFilter !== 'ALL' ? formatDate(dateFilter) : `${monthFilter} ${yearFilter}`}
          />

          <div className="flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span>Attendance Filter:</span>
            <span className="text-emerald-700 font-extrabold">{periodLabel}</span>
          </div>

          {activeTab === 'trainees' ? (
            <>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-[10px] text-emerald-700 uppercase font-bold">Present Trainees</p>
                  <p className="text-base font-black text-emerald-900 mt-0.5">{traineePresentCount}</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <p className="text-[10px] text-rose-700 uppercase font-bold">Absent Trainees</p>
                  <p className="text-base font-black text-rose-900 mt-0.5">{traineeAbsentCount}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-[10px] text-amber-700 uppercase font-bold">Informed Absences</p>
                  <p className="text-base font-black text-amber-900 mt-0.5">{traineeInformedCount}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Attendance Rate</p>
                  <p className="text-base font-black text-slate-900 mt-0.5">{traineeAttendanceRate}%</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-600 uppercase">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Student Trainee</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Marked By Coach</th>
                      <th className="py-2.5 px-3">Marked Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredTraineeLogs.slice(0, 50).map(log => (
                      <tr key={log.id}>
                        <td className="py-2.5 px-3 font-mono">{formatDate(log.date)}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{log.studentName}</td>
                        <td className="py-2.5 px-3 text-blue-600 font-semibold">{log.category}</td>
                        <td className="py-2.5 px-3 font-bold">{log.status}</td>
                        <td className="py-2.5 px-3 font-semibold">{log.markedByCoach}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{log.markedAtTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-[10px] text-emerald-700 uppercase font-bold">Total Registered Coaches</p>
                  <p className="text-base font-black text-emerald-900 mt-0.5">{INITIAL_COACHES.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-[10px] text-blue-700 uppercase font-bold">Sessions Logged</p>
                  <p className="text-base font-black text-blue-900 mt-0.5">{coachPresentCount}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-[10px] text-emerald-700 uppercase font-bold">Coach Attendance Rate</p>
                  <p className="text-base font-black text-emerald-900 mt-0.5">100%</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-600 uppercase">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Coach Name</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3">Training Center</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Marked By</th>
                      <th className="py-2.5 px-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredCoachLogs.slice(0, 50).map(log => (
                      <tr key={log.id}>
                        <td className="py-2.5 px-3 font-mono">{formatDate(log.date)}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{log.coachName}</td>
                        <td className="py-2.5 px-3 font-mono text-blue-600 font-bold">{formatPhoneNumber(log.phone)}</td>
                        <td className="py-2.5 px-3 text-slate-700 font-semibold">{log.trainingCenter}</td>
                        <td className="py-2.5 px-3 font-bold">{log.status}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-800">{log.markedBy}</td>
                        <td className="py-2.5 px-3 text-slate-600">{log.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Auto-generated Timestamp Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <p>Malabar Challengers Football Club • Official System Generated Attendance Report</p>
            <p>Printed Date & Time: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
        </div>

        {/* Printable Document Portal */}
        <PrintPortal title={`Attendance_Report_${activeTab}_${dateFilter !== 'ALL' ? dateFilter : `${monthFilter}_${yearFilter}`}`}>
          <div className="space-y-6 text-slate-900 font-sans">
            <ReportHeader
              title={activeTab === 'trainees' ? "TRAINEE ATTENDANCE REPORT" : "COACH ATTENDANCE REPORT"}
              date={dateFilter !== 'ALL' ? formatDate(dateFilter) : `${monthFilter} ${yearFilter}`}
            />

            {activeTab === 'trainees' ? (
              <table className="w-full text-left border-collapse text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Student Trainee</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Marked By Coach</th>
                    <th className="py-2 px-3">Marked Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredTraineeLogs.slice(0, 80).map(log => (
                    <tr key={log.id}>
                      <td className="py-2 px-3 font-mono">{formatDate(log.date)}</td>
                      <td className="py-2 px-3 font-bold">{log.studentName}</td>
                      <td className="py-2 px-3">{log.category}</td>
                      <td className="py-2 px-3 font-bold">{log.status}</td>
                      <td className="py-2 px-3">{log.markedByCoach}</td>
                      <td className="py-2 px-3 font-mono">{log.markedAtTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Coach Name</th>
                    <th className="py-2 px-3">Phone</th>
                    <th className="py-2 px-3">Training Center</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Marked By</th>
                    <th className="py-2 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredCoachLogs.slice(0, 80).map(log => (
                    <tr key={log.id}>
                      <td className="py-2 px-3 font-mono">{formatDate(log.date)}</td>
                      <td className="py-2 px-3 font-bold">{log.coachName}</td>
                      <td className="py-2 px-3 font-mono">{formatPhoneNumber(log.phone)}</td>
                      <td className="py-2 px-3">{log.trainingCenter}</td>
                      <td className="py-2 px-3 font-bold">{log.status}</td>
                      <td className="py-2 px-3 font-bold text-emerald-800">{log.markedBy}</td>
                      <td className="py-2 px-3">{log.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </PrintPortal>
      </Modal>
    </LayoutShell>
  );
};
