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
import { INITIAL_STUDENTS, INITIAL_COACHES, INITIAL_CATEGORIES } from '../../mock-data/msrf-data';
import { CalendarCheck, Download, UserCheck, Tag, FileDown, Printer, Trophy } from 'lucide-react';
import { formatDate, exportToCSV } from '../../utils/format';

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

export const AttendanceManagementPage: React.FC = () => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pdfModal, setPdfModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Generate view-only attendance records for the super admin
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

  const filteredLogs = attendanceLogs.filter(log => {
    const matchesSearch =
      log.studentName.toLowerCase().includes(search.toLowerCase()) ||
      log.studentId.toLowerCase().includes(search.toLowerCase()) ||
      log.markedByCoach.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const presentCount = attendanceLogs.filter(l => l.status === 'Present').length;
  const absentCount = attendanceLogs.filter(l => l.status === 'Absent').length;
  const informedCount = attendanceLogs.filter(l => l.status === 'Informed').length;
  const attendanceRate = Math.round((presentCount / (attendanceLogs.length || 1)) * 100);

  const handleExportCSV = () => {
    const data = filteredLogs.map(l => ({
      Date: l.date,
      'Student ID': l.studentId,
      'Student Name': l.studentName,
      Category: l.category,
      Status: l.status,
      'Marked By Coach': l.markedByCoach,
      'Marked Time': l.markedAtTime
    }));
    exportToCSV(`msrf_attendance_log_${selectedDate}`, data);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <LayoutShell
      title="Attendance Records & Coach Activity Logs"
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
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-emerald-50 border-emerald-200">
          <p className="text-xs uppercase font-bold text-emerald-700">Present Trainees</p>
          <p className="text-2xl font-black text-emerald-900 mt-1">{presentCount}</p>
        </Card>
        <Card className="bg-rose-50 border-rose-200">
          <p className="text-xs uppercase font-bold text-rose-700">Absent Trainees</p>
          <p className="text-2xl font-black text-rose-900 mt-1">{absentCount}</p>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <p className="text-xs uppercase font-bold text-amber-700">Informed Leave</p>
          <p className="text-2xl font-black text-amber-900 mt-1">{informedCount}</p>
        </Card>
        <Card className="bg-slate-50 border-slate-200">
          <p className="text-xs uppercase font-bold text-slate-500">Attendance Rate</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{attendanceRate}%</p>
        </Card>
      </div>

      {/* Clean Calendar Date Picker (Future dates disabled with max attribute) */}
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
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search student name, ID, coach..."
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
      {filteredLogs.length === 0 ? (
        <EmptyState title="No Attendance Logs" description="No student attendance logs match your search criteria." />
      ) : (
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
                {paginatedLogs.map(log => (
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
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredLogs.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Official Attendance PDF Report Modal */}
      <Modal
        isOpen={pdfModal}
        onClose={() => setPdfModal(false)}
        title={`MSRF Attendance PDF Report: ${formatDate(selectedDate)}`}
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
          <ReportHeader title="DAILY ATTENDANCE REPORT" date={formatDate(selectedDate)} />

          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-[10px] text-emerald-700 uppercase font-bold">Present Trainees</p>
              <p className="text-base font-black text-emerald-900 mt-0.5">{presentCount}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <p className="text-[10px] text-rose-700 uppercase font-bold">Absent Trainees</p>
              <p className="text-base font-black text-rose-900 mt-0.5">{absentCount}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-[10px] text-amber-700 uppercase font-bold">Informed Absences</p>
              <p className="text-base font-black text-amber-900 mt-0.5">{informedCount}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Attendance Rate</p>
              <p className="text-base font-black text-slate-900 mt-0.5">{attendanceRate}%</p>
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
                {filteredLogs.map(log => (
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

          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <p>Malabar Challengers Football Club • Official System Generated Report</p>
            <p>Printed Date & Time: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
        </div>

        {/* PrintPortal attaches clean printable content directly to body outside #root */}
        <PrintPortal>
          <div className="space-y-6 text-slate-800 text-xs font-sans">
            <ReportHeader title="DAILY ATTENDANCE REPORT" date={formatDate(selectedDate)} />

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-[10px] text-emerald-700 uppercase font-bold">Present Trainees</p>
                <p className="text-base font-black text-emerald-900 mt-0.5">{presentCount}</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <p className="text-[10px] text-rose-700 uppercase font-bold">Absent Trainees</p>
                <p className="text-base font-black text-rose-900 mt-0.5">{absentCount}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-[10px] text-amber-700 uppercase font-bold">Informed Absences</p>
                <p className="text-base font-black text-amber-900 mt-0.5">{informedCount}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Attendance Rate</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{attendanceRate}%</p>
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
                  {filteredLogs.map(log => (
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

            <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <p>Malabar Challengers Football Club • Official System Generated Report</p>
              <p>Printed Date & Time: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
          </div>
        </PrintPortal>
      </Modal>
    </LayoutShell>
  );
};
