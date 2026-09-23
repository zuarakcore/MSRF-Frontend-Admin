import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { INITIAL_COACHES, INITIAL_STUDENTS } from '../../mock-data/msrf-data';
import { 
  BarChart3, 
  Download, 
  CalendarCheck, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Award, 
  FileText,
  Filter
} from 'lucide-react';
import { exportToCSV, triggerPrint } from '../../utils/format';
import { useNotifications } from '../../context/NotificationContext';

export const ReportsCenterPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [coachFilter, setCoachFilter] = useState('ALL');

  const { addToast } = useNotifications();

  const reportTypes = [
    { id: 'attendance', title: '1. Attendance Report', icon: CalendarCheck, desc: 'Daily/monthly presentee & absenteeism analysis' },
    { id: 'progress', title: '2. Student Progress Report', icon: Award, desc: 'Technical skills, stamina & coach evaluation logs' },
    { id: 'collection', title: '3. Fee Collection Report', icon: CreditCard, desc: 'Revenue collected by course, payment method & batch' },
    { id: 'pending', title: '4. Pending Fee Report', icon: TrendingUp, desc: 'Overdue installments and defaulter list' },
    { id: 'coach-perf', title: '5. Coach Performance Report', icon: Users, desc: 'Rating averages, student retention & attendance rates' },
    { id: 'revenue', title: '6. Monthly Revenue Report', icon: FileText, desc: 'Financial audit breakdown and GST tax summaries' },
    { id: 'strength', title: '7. Student Strength Report', icon: BarChart3, desc: 'Enrolment growth per academy & capacity limits' }
  ];

  const handleGenerate = () => {
    addToast({ type: 'success', title: 'Report Generated', message: `Report data compiled for period ${startDate} to ${endDate}.` });
  };

  const handleExportCSV = () => {
    const reportData = INITIAL_STUDENTS.map(s => ({
      Report: selectedReport.toUpperCase(),
      'Student Name': s.fullName,
      'Student ID': s.studentId,
      Course: s.course,
      Coach: s.coachName,
      'Attendance %': `${s.attendancePercentage}%`,
      'Total Fee': s.totalFee,
      'Paid Amount': s.paidAmount,
      'Pending Amount': s.pendingAmount,
      Status: s.status
    }));
    exportToCSV(`msrf_report_${selectedReport}`, reportData);
  };

  return (
    <LayoutShell
      title="Analytics & Reports Center"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Reports' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} icon={<Download className="w-4 h-4" />}>
            Export Excel (CSV)
          </Button>
          <Button variant="primary" size="sm" onClick={() => triggerPrint()} icon={<Download className="w-4 h-4" />}>
            Print / PDF Report
          </Button>
        </div>
      }
    >
      {/* Report Cards Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map(r => {
          const Icon = r.icon;
          const isSelected = selectedReport === r.id;
          return (
            <div
              key={r.id}
              onClick={() => setSelectedReport(r.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md border-blue-600 scale-[1.02]'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                <h4 className="font-bold text-xs">{r.title}</h4>
              </div>
              <p className={`text-[11px] mt-1.5 line-clamp-2 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                {r.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filter Control Bar for Report */}
      <Card header={<h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Filter className="w-4 h-4 text-blue-600" /> Custom Filter Parameters</h3>}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end text-xs">
          <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <Select
            label="Sports Course"
            options={[
              { label: 'All Academies', value: 'ALL' },
              { label: 'Swimming Academy', value: 'Swimming Academy' },
              { label: 'Football Excellence', value: 'Football Excellence' },
              { label: 'Badminton Club', value: 'Badminton Club' }
            ]}
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
          />
          <Select
            label="Assigned Coach"
            options={[
              { label: 'All Coaches', value: 'ALL' },
              ...INITIAL_COACHES.map(c => ({ label: c.fullName, value: c.id }))
            ]}
            value={coachFilter}
            onChange={e => setCoachFilter(e.target.value)}
          />
          <Button onClick={handleGenerate} className="w-full">
            Generate Report
          </Button>
        </div>
      </Card>

      {/* Report Data Preview Table */}
      <Card header={<h3 className="font-bold text-slate-900 text-sm">Report Results: {selectedReport.toUpperCase()}</h3>}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Course</th>
                <th className="py-3 px-3">Coach</th>
                <th className="py-3 px-3">Attendance</th>
                <th className="py-3 px-3">Total Fee</th>
                <th className="py-3 px-3">Paid Amount</th>
                <th className="py-3 px-3">Pending</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {INITIAL_STUDENTS.slice(0, 10).map(st => (
                <tr key={st.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-900">{st.fullName}</td>
                  <td className="py-3 px-3">{st.course}</td>
                  <td className="py-3 px-3">{st.coachName}</td>
                  <td className="py-3 px-3 font-bold text-emerald-600">{st.attendancePercentage}%</td>
                  <td className="py-3 px-3">₹{st.totalFee.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 font-bold text-emerald-700">₹{st.paidAmount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 font-bold text-rose-600">₹{st.pendingAmount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3"><Badge variant={st.status === 'Active' ? 'active' : 'inactive'}>{st.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </LayoutShell>
  );
};
