import React, { useState } from 'react';
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
import { CalendarCheck, Download, UserCheck, Tag, FileDown, Printer, Users, Clock } from 'lucide-react';
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

export const AttendanceManagementPage: React.FC = () => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [activeTab, setActiveTab] = useState<'trainees' | 'coaches'>('trainees');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pdfModal, setPdfModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Generate view-only trainee attendance records for the super admin
  const attendanceLogs: AttendanceEntry[] = INITIAL_STUDENTS.map((s, idx) => {
    const coachObj = INITIAL_COACHES[idx % INITIAL_COACHES.length];
    const status: 'Present' | 'Absent' | 'Informed' = idx % 9 === 0 ? 'Absent' : idx % 14 === 0 ? 'Informed' : 'Present';
    return {
      id: `att-log-${idx + 1}`,
      studentId: s.studentId,
      studentName: s.fullName,
      category: s.category || 'Football Excellence',
      status,
      markedByCoach: coachObj ? coachObj.fullName : 'Rajesh Varma',
      markedAtTime: `${String(6 + (idx % 2) * 10).padStart(2, '0')}:${String((idx * 7) % 60).padStart(2, '0')} AM`,
      date: selectedDate
    };
  });

  // Dynamically generate coach attendance records based on submitted session reports for selectedDate
  const sessionReportsForDate = INITIAL_SESSION_REPORTS.filter(r => r.date === selectedDate);

  const coachAttendanceLogs: CoachAttendanceEntry[] = INITIAL_COACHES.map((c) => {
    // Find if coach logged a session or was selected as co-coach
    const loggedReport = sessionReportsForDate.find(r => r.loggedByCoachName === c.fullName);
    const coCoachReport = sessionReportsForDate.find(r => r.assignedCoaches?.includes(c.fullName));
    const activeReport = loggedReport || coCoachReport;

    if (activeReport) {
      const isLead = activeReport.loggedByCoachName === c.fullName;
      return {
        id: `coach-att-${c.id}-${selectedDate}`,
        coachId: c.id,
        coachName: c.fullName,
        phone: c.phone,
        category: activeReport.categories?.[0] || 'Football Excellence',
        trainingCenter: activeReport.venue || 'Kozhikode Main Campus',
        status: 'Present',
        markedBy: isLead ? `Marked by ${c.fullName} (Lead Coach)` : `Marked by ${activeReport.loggedByCoachName}`,
        remarks: isLead ? `Logged Daily Session (${activeReport.dailyTopic})` : `Daily Training Session (Co-Coach)`,
        date: selectedDate
      };
    }

    return {
      id: `coach-att-${c.id}-${selectedDate}`,
      coachId: c.id,
      coachName: c.fullName,
      phone: c.phone,
      category: 'Football Excellence',
      trainingCenter: 'Kozhikode Main Campus',
      status: 'Present',
      markedBy: 'Auto-Logged / Present',
      remarks: 'Daily Training Session Conducted',
      date: selectedDate
    };
  });

  const filteredTraineeLogs = attendanceLogs.filter(log => {
    const matchesSearch =
      log.studentName.toLowerCase().includes(search.toLowerCase()) ||
      log.studentId.toLowerCase().includes(search.toLowerCase()) ||
      log.markedByCoach.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredCoachLogs = coachAttendanceLogs.filter(log => {
    const matchesSearch =
      log.coachName.toLowerCase().includes(search.toLowerCase()) ||
      log.phone.toLowerCase().includes(search.toLowerCase()) ||
      log.trainingCenter.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeLogs = activeTab === 'trainees' ? filteredTraineeLogs : filteredCoachLogs;
  const totalPages = Math.ceil(activeLogs.length / pageSize) || 1;
  const paginatedLogs = activeLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Stats for Trainees
  const traineePresentCount = attendanceLogs.filter(l => l.status === 'Present').length;
  const traineeAbsentCount = attendanceLogs.filter(l => l.status === 'Absent').length;
  const traineeInformedCount = attendanceLogs.filter(l => l.status === 'Informed').length;
  const traineeAttendanceRate = Math.round((traineePresentCount / (attendanceLogs.length || 1)) * 100);

  // Stats for Coaches
  const coachPresentCount = coachAttendanceLogs.length;
  const coachAttendanceRate = 100;

  const handleExportCSV = () => {
    if (activeTab === 'trainees') {
      const data = filteredTraineeLogs.map(l => ({
        Date: l.date,
        'Student ID': l.studentId,
        'Student Name': l.studentName,
        Category: l.category,
        Status: l.status,
        'Marked By Coach': l.markedByCoach,
        'Marked Time': l.markedAtTime
      }));
      exportToCSV(`msrf_trainee_attendance_${selectedDate}`, data);
    } else {
      const data = filteredCoachLogs.map(l => ({
        Date: l.date,
        'Coach ID': l.coachId,
        'Coach Name': l.coachName,
        Phone: l.phone,
        'Training Center': l.trainingCenter,
        Status: l.status,
        Remarks: l.remarks
      }));
      exportToCSV(`msrf_coach_attendance_${selectedDate}`, data);
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
            {attendanceLogs.length}
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
            {coachAttendanceLogs.length}
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
            <p className="text-xs uppercase font-bold text-slate-500">Trainee Attendance Rate</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{traineeAttendanceRate}%</p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-emerald-50 border-emerald-200">
            <p className="text-xs uppercase font-bold text-emerald-700">Total Registered Coaches</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">{coachAttendanceLogs.length}</p>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <p className="text-xs uppercase font-bold text-blue-700">Present Coaches</p>
            <p className="text-2xl font-black text-blue-900 mt-1">{coachPresentCount}</p>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200">
            <p className="text-xs uppercase font-bold text-emerald-700">Coach Attendance Rate</p>
            <p className="text-2xl font-black text-emerald-900 mt-1">100%</p>
          </Card>
        </div>
      )}

      {/* Date Picker Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-emerald-600" /> Select Attendance Date:
          </label>
          <input
            type="date"
            max={todayStr}
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Showing logs for <span className="font-bold text-slate-900">{formatDate(selectedDate)}</span>
        </div>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={activeTab === 'trainees' ? "Search student name, ID, coach..." : "Search coach name, phone, campus..."}
        filters={[
          {
            key: 'category',
            label: 'Category',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: 'All Categories', value: 'ALL' },
              ...INITIAL_CATEGORIES.map(c => ({ label: c.title, value: c.title }))
            ]
          },
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Present', value: 'Present' },
              { label: 'Absent', value: 'Absent' },
              { label: 'Informed', value: 'Informed' }
            ]
          }
        ]}
      />

      {/* Attendance Logs Table */}
      {activeLogs.length === 0 ? (
        <EmptyState title="No Attendance Logs" description="No attendance logs match your search criteria." />
      ) : activeTab === 'trainees' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student Trainee</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Attendance Status</th>
                  <th className="py-3.5 px-4">Marked By Coach</th>
                  <th className="py-3.5 px-4">Marked Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {(paginatedLogs as AttendanceEntry[]).map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 text-sm">{log.studentName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{log.studentId}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-blue-500" />
                        <span>{log.category}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{log.markedByCoach}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">{log.markedAtTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Coach Name</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Training Center / Campus</th>
                  <th className="py-3.5 px-4">Attendance Status</th>
                  <th className="py-3.5 px-4">Marked By (Who Marked)</th>
                  <th className="py-3.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {(paginatedLogs as CoachAttendanceEntry[]).map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 text-sm">{log.coachName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">Coach ID: {log.coachId}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {formatPhoneNumber(log.phone)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {log.trainingCenter}
                    </td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-emerald-900 w-fit">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{log.markedBy}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {log.remarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={activeLogs.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Official Attendance PDF Report Modal */}
      <Modal
        isOpen={pdfModal}
        onClose={() => setPdfModal(false)}
        title={`MSRF ${activeTab === 'trainees' ? 'Trainee' : 'Coach'} Attendance PDF Report: ${formatDate(selectedDate)}`}
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
          <ReportHeader title={activeTab === 'trainees' ? "DAILY TRAINEE ATTENDANCE REPORT" : "DAILY COACH ATTENDANCE REPORT"} date={formatDate(selectedDate)} />

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
                      <th className="py-2.5 px-3">Student Trainee</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Marked By Coach</th>
                      <th className="py-2.5 px-3">Marked Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredTraineeLogs.map(log => (
                      <tr key={log.id}>
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
                  <p className="text-base font-black text-emerald-900 mt-0.5">{coachAttendanceLogs.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-[10px] text-blue-700 uppercase font-bold">Present Coaches</p>
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
                      <th className="py-2.5 px-3">Coach Name</th>
                      <th className="py-2.5 px-3">Phone</th>
                      <th className="py-2.5 px-3">Training Center</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Marked By</th>
                      <th className="py-2.5 px-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredCoachLogs.map(log => (
                      <tr key={log.id}>
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
        <PrintPortal title={`Attendance_Report_${activeTab}_${selectedDate}`}>
          <div className="space-y-6 text-slate-900 font-sans">
            <ReportHeader title={activeTab === 'trainees' ? "DAILY TRAINEE ATTENDANCE REPORT" : "DAILY COACH ATTENDANCE REPORT"} date={formatDate(selectedDate)} />

            {activeTab === 'trainees' ? (
              <table className="w-full text-left border-collapse text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase">
                    <th className="py-2 px-3">Student Trainee</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Marked By Coach</th>
                    <th className="py-2 px-3">Marked Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredTraineeLogs.map(log => (
                    <tr key={log.id}>
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
                    <th className="py-2 px-3">Coach Name</th>
                    <th className="py-2 px-3">Phone</th>
                    <th className="py-2 px-3">Training Center</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Marked By</th>
                    <th className="py-2 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredCoachLogs.map(log => (
                    <tr key={log.id}>
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
