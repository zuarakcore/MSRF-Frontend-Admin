import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { INITIAL_STUDENTS, INITIAL_COACHES } from '../../mock-data/msrf-data';
import { Student } from '../../types';
import { CalendarCheck, Download, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDate, exportToCSV } from '../../utils/format';
import { useNotifications } from '../../context/NotificationContext';

export const AttendanceManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [coachFilter, setCoachFilter] = useState('ALL');

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const { addToast } = useNotifications();

  // Daily attendance state mapping (studentId -> Present/Absent)
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>(() => {
    const map: Record<string, 'Present' | 'Absent' | 'Late'> = {};
    INITIAL_STUDENTS.forEach((s, i) => {
      map[s.id] = i % 15 === 0 ? 'Absent' : i % 22 === 0 ? 'Late' : 'Present';
    });
    return map;
  });

  const filteredStudents = students.filter(s => {
    const matchesCourse = courseFilter === 'ALL' || s.course === courseFilter;
    const matchesCoach = coachFilter === 'ALL' || s.coachId === coachFilter;
    return matchesCourse && matchesCoach;
  });

  const handleMarkStatus = (id: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendanceMap(prev => ({ ...prev, [id]: status }));
    addToast({ type: 'info', title: 'Attendance Marked', message: `Marked ${status} for student.` });
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const data = filteredStudents.map(s => ({
      Date: selectedDate,
      'Student ID': s.studentId,
      'Student Name': s.fullName,
      Course: s.course,
      Coach: s.coachName,
      Status: attendanceMap[s.id] || 'Present'
    }));
    exportToCSV(`msrf_attendance_${selectedDate}`, data);
  };

  return (
    <LayoutShell
      title="Attendance Management & Monitoring"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Attendance' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} icon={<Download className="w-4 h-4" />}>
            Export Excel (CSV)
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportPDF} icon={<Download className="w-4 h-4" />}>
            Export PDF Report
          </Button>
        </div>
      }
    >
      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-emerald-50 border-emerald-200">
          <p className="text-xs uppercase font-bold text-emerald-700">Today Present</p>
          <p className="text-2xl font-black text-emerald-900 mt-1">
            {Object.values(attendanceMap).filter(v => v === 'Present').length} Trainees
          </p>
        </Card>
        <Card className="bg-rose-50 border-rose-200">
          <p className="text-xs uppercase font-bold text-rose-700">Today Absent</p>
          <p className="text-2xl font-black text-rose-900 mt-1">
            {Object.values(attendanceMap).filter(v => v === 'Absent').length} Trainees
          </p>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <p className="text-xs uppercase font-bold text-amber-700">Late Arrivals</p>
          <p className="text-2xl font-black text-amber-900 mt-1">
            {Object.values(attendanceMap).filter(v => v === 'Late').length} Trainees
          </p>
        </Card>
        <Card className="bg-slate-50 border-slate-200">
          <p className="text-xs uppercase font-bold text-slate-500">Overall Rate</p>
          <p className="text-2xl font-black text-slate-900 mt-1">94.2%</p>
        </Card>
      </div>

      <Tabs
        tabs={[
          { id: 'daily', label: 'Daily Attendance Checklist' },
          { id: 'monthly', label: 'Monthly Summary' },
          { id: 'coach-report', label: 'Coach-wise Report' },
          { id: 'student-report', label: 'Student-wise History' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Daily Checklist */}
      {activeTab === 'daily' && (
        <Card
          header={
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                />
                <span className="text-xs text-slate-500 font-semibold">{formatDate(selectedDate)}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={courseFilter}
                  onChange={e => setCourseFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold"
                >
                  <option value="ALL">All Courses</option>
                  <option value="Swimming Academy">Swimming Academy</option>
                  <option value="Badminton Club">Badminton Club</option>
                  <option value="Football Excellence">Football Excellence</option>
                </select>

                <select
                  value={coachFilter}
                  onChange={e => setCoachFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold"
                >
                  <option value="ALL">All Coaches</option>
                  {INITIAL_COACHES.map(c => (
                    <option key={c.id} value={c.id}>{c.fullName}</option>
                  ))}
                </select>
              </div>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Course</th>
                  <th className="py-3 px-3">Assigned Coach</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStudents.map(st => {
                  const currentStatus = attendanceMap[st.id] || 'Present';
                  return (
                    <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{st.fullName}</div>
                        <div className="text-[11px] text-slate-400">{st.studentId}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{st.course}</td>
                      <td className="py-3 px-3">{st.coachName}</td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            currentStatus === 'Present'
                              ? 'active'
                              : currentStatus === 'Absent'
                              ? 'suspended'
                              : 'pending'
                          }
                        >
                          {currentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant={currentStatus === 'Present' ? 'success' : 'outline'}
                            onClick={() => handleMarkStatus(st.id, 'Present')}
                          >
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant={currentStatus === 'Absent' ? 'danger' : 'outline'}
                            onClick={() => handleMarkStatus(st.id, 'Absent')}
                          >
                            Absent
                          </Button>
                          <Button
                            size="sm"
                            variant={currentStatus === 'Late' ? 'secondary' : 'ghost'}
                            onClick={() => handleMarkStatus(st.id, 'Late')}
                          >
                            Late
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2, 3, 4: Reports Placeholders */}
      {activeTab !== 'daily' && (
        <Card header={<h3 className="font-bold text-slate-900 text-sm">{activeTab.toUpperCase()} Attendance Analysis</h3>}>
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">Generated breakdown for {activeTab} across MSRF sports academies.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {INITIAL_COACHES.map(c => (
                <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-900">{c.fullName}</p>
                  <p className="text-[11px] text-slate-500">{c.specialization}</p>
                  <div className="mt-3 flex justify-between font-bold">
                    <span className="text-slate-500">Attendance Avg:</span>
                    <span className="text-emerald-600">{c.attendanceAvg}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </LayoutShell>
  );
};
