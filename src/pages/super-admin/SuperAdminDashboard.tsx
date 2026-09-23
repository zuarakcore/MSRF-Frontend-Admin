import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  Users, 
  UserCheck, 
  CalendarCheck, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  Eye,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus
} from 'lucide-react';
import { INITIAL_STUDENTS, INITIAL_COACHES, INITIAL_PAYMENTS, INITIAL_INVOICES, INITIAL_NOTIFICATIONS } from '../../mock-data/msrf-data';
import { formatCurrency, formatDate } from '../../utils/format';
import { useNavigate } from 'react-router-dom';

export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [attendancePeriod, setAttendancePeriod] = useState<'today' | 'week' | 'month'>('today');

  // KPI Calculations
  const totalStudents = INITIAL_STUDENTS.length;
  const activeCoaches = INITIAL_COACHES.filter(c => c.status === 'Active').length;
  const todayAttendancePct = 94.2;
  const pendingFeesTotal = INITIAL_STUDENTS.reduce((acc, s) => acc + s.pendingAmount, 0);
  const monthlyCollectionsTotal = INITIAL_STUDENTS.reduce((acc, s) => acc + s.paidAmount, 0);
  const pendingVerificationsCount = INITIAL_PAYMENTS.filter(p => p.status === 'Pending Verification').length;

  const recentAdmissions = INITIAL_STUDENTS.slice(0, 5);
  const upcomingDuePayments = INITIAL_INVOICES.filter(i => i.paymentStatus !== 'Paid').slice(0, 5);
  const recentSubmissions = INITIAL_PAYMENTS.slice(0, 4);

  return (
    <LayoutShell
      title="Control Center & Executive Overview"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Dashboard' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate('/super-admin/students')} icon={<Plus className="w-4 h-4" />}>
            New Admission
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/super-admin/reports')}>
            Generate Reports
          </Button>
        </div>
      }
    >
      {/* Top KPI Cards Grid — Spacious 3-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Total Students Enrolled"
          value={totalStudents}
          subtitle="Registered across 8 academies"
          icon={<Users className="w-6 h-6" />}
          badgeVariant="blue"
          trend={{ value: '+8% this month', isPositive: true }}
          linkTo="/super-admin/students"
          className="p-6"
        />
        <StatCard
          title="Active Coaches"
          value={activeCoaches}
          subtitle="Certified sports mentors"
          icon={<UserCheck className="w-6 h-6" />}
          badgeVariant="emerald"
          badgeText="100% Active"
          linkTo="/super-admin/coaches"
          className="p-6"
        />
        <StatCard
          title="Today's Attendance Rate"
          value={`${todayAttendancePct}%`}
          subtitle="49 of 52 present today"
          icon={<CalendarCheck className="w-6 h-6" />}
          badgeVariant="emerald"
          trend={{ value: '+2.1% vs avg', isPositive: true }}
          linkTo="/super-admin/attendance"
          className="p-6"
        />
        <StatCard
          title="Pending Fee Outstanding"
          value={formatCurrency(pendingFeesTotal)}
          subtitle="Pending student dues"
          icon={<AlertCircle className="w-6 h-6" />}
          badgeVariant="rose"
          badgeText={`${pendingVerificationsCount} to verify`}
          linkTo="/super-admin/fees"
          className="p-6"
        />
        <StatCard
          title="Monthly Collections"
          value={formatCurrency(monthlyCollectionsTotal)}
          subtitle="Target: ₹12.48L annual"
          icon={<TrendingUp className="w-6 h-6" />}
          badgeVariant="emerald"
          trend={{ value: '+14.5% vs target', isPositive: true }}
          linkTo="/super-admin/payments"
          className="p-6"
        />
        <StatCard
          title="Upcoming Payments Due"
          value={upcomingDuePayments.length}
          subtitle="Due in next 7 days"
          icon={<CreditCard className="w-6 h-6" />}
          badgeVariant="amber"
          badgeText="Action Needed"
          linkTo="/super-admin/invoices"
          className="p-6"
        />
      </div>

      {/* Analytics & Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Overview Chart Card */}
        <Card
          header={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Attendance Overview</h3>
              </div>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setAttendancePeriod('today')}
                  className={`px-3 py-1 rounded-lg transition-all ${attendancePeriod === 'today' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'}`}
                >
                  Today
                </button>
                <button
                  onClick={() => setAttendancePeriod('week')}
                  className={`px-3 py-1 rounded-lg transition-all ${attendancePeriod === 'week' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'}`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setAttendancePeriod('month')}
                  className={`px-3 py-1 rounded-lg transition-all ${attendancePeriod === 'month' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'}`}
                >
                  This Month
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Present</p>
                <p className="text-2xl font-black text-emerald-900 mt-0.5">49</p>
                <p className="text-[11px] text-emerald-700 font-semibold">94.2%</p>
              </div>
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Absent</p>
                <p className="text-2xl font-black text-rose-900 mt-0.5">3</p>
                <p className="text-[11px] text-rose-700 font-semibold">5.8%</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Enrolled</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">52</p>
                <p className="text-[11px] text-slate-500 font-semibold">8 Academies</p>
              </div>
            </div>

            {/* Visual Attendance Bar Breakdown */}
            <div className="space-y-2.5 pt-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Swimming Academy</span>
                <span>14 / 14 Present (100%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500 w-[100%]" />
              </div>

              <div className="flex justify-between text-xs font-semibold text-slate-600 pt-1">
                <span>Football Excellence</span>
                <span>15 / 16 Present (93.7%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500 w-[93.7%]" />
                <div className="h-full bg-rose-500 w-[6.3%]" />
              </div>

              <div className="flex justify-between text-xs font-semibold text-slate-600 pt-1">
                <span>Badminton Club</span>
                <span>11 / 12 Present (91.6%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500 w-[91.6%]" />
                <div className="h-full bg-rose-500 w-[8.4%]" />
              </div>
            </div>
          </div>
        </Card>

        {/* Fee Collection & Revenue Breakdown */}
        <Card
          header={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Monthly Fee Collection</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/super-admin/fees')}>
                Manage Fees <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Collected vs Pending</p>
                <h4 className="text-2xl font-black text-slate-900 mt-0.5">{formatCurrency(monthlyCollectionsTotal)}</h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  Pending: {formatCurrency(pendingFeesTotal)}
                </span>
              </div>
            </div>

            {/* Collection Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200">
                <div className="h-full bg-emerald-500 rounded-full w-[72%]" title="Collected 72%" />
                <div className="h-full bg-rose-400 rounded-full w-[28%] ml-0.5" title="Pending 28%" />
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span className="text-emerald-700">✓ Collected 72%</span>
                <span className="text-rose-600">⚠ Pending Dues 28%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-slate-500 font-semibold">Total Revenue Target</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">₹12,48,000</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-slate-500 font-semibold">Pending Verifications</p>
                <p className="text-base font-bold text-amber-700 mt-0.5">{pendingVerificationsCount} Payments</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Data Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Admissions (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" /> Recent Admissions
                </h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/super-admin/students')}>
                  View All Students <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-2">Student</th>
                    <th className="pb-3 px-2">Course</th>
                    <th className="pb-3 px-2">Coach</th>
                    <th className="pb-3 px-2">Admission Date</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {recentAdmissions.map(st => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-bold text-slate-900">{st.fullName}</div>
                        <div className="text-[11px] text-slate-400">{st.studentId}</div>
                      </td>
                      <td className="py-3 px-2 font-semibold text-slate-800">{st.course}</td>
                      <td className="py-3 px-2">{st.coachName}</td>
                      <td className="py-3 px-2 text-slate-500">{formatDate(st.admissionDate)}</td>
                      <td className="py-3 px-2">
                        <Badge variant={st.status === 'Active' ? 'active' : 'inactive'}>
                          {st.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/super-admin/students/${st.id}`)}
                          icon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-6">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Pending Payment Submissions
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-100 text-amber-800">
                  {pendingVerificationsCount} New
                </span>
              </div>
            }
          >
            <div className="space-y-3">
              {recentSubmissions.map(sub => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{sub.studentName}</p>
                    <p className="text-[11px] text-slate-500">Parent: {sub.parentName}</p>
                    <p className="text-xs font-black text-emerald-700 mt-1">{formatCurrency(sub.amount)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge
                      variant={
                        sub.status === 'Verified'
                          ? 'verified'
                          : sub.status === 'Rejected'
                          ? 'rejected'
                          : 'pending-verification'
                      }
                    >
                      {sub.status}
                    </Badge>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate('/super-admin/payments')}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </LayoutShell>
  );
};
