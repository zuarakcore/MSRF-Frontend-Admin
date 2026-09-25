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
  Plus,
  Globe,
  ChevronRight
} from 'lucide-react';
import { 
  INITIAL_STUDENTS, 
  INITIAL_COACHES, 
  INITIAL_PAYMENTS, 
  INITIAL_INVOICES, 
  INITIAL_CATEGORIES,
  INITIAL_PROGRAMMES,
  INITIAL_TEAM_CMS,
  INITIAL_GALLERY,
  INITIAL_CAREERS,
  INITIAL_APPLICATIONS
} from '../../mock-data/msrf-data';
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
  const annualCollectionTotal = monthlyCollectionsTotal * 12;
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
      {/* Top KPI Cards Grid — Balanced 5-Column Desktop Layout (No Blank Space) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
          title="Pending Fee Outstanding"
          value={formatCurrency(pendingFeesTotal)}
          subtitle="Click to view student list"
          icon={<AlertCircle className="w-6 h-6" />}
          badgeVariant="rose"
          badgeText={`${pendingVerificationsCount} to verify`}
          linkTo="/super-admin/students"
          className="p-6 cursor-pointer"
        />
        <StatCard
          title="Monthly Collections"
          value={formatCurrency(monthlyCollectionsTotal)}
          subtitle="This month collection"
          icon={<TrendingUp className="w-6 h-6" />}
          badgeVariant="emerald"
          trend={{ value: '+14.5% vs target', isPositive: true }}
          linkTo="/super-admin/payments"
          className="p-6"
        />
        <StatCard
          title="Annual Collection"
          value={formatCurrency(annualCollectionTotal)}
          subtitle="Annual 2026 projected total"
          icon={<CreditCard className="w-6 h-6" />}
          badgeVariant="emerald"
          badgeText="2026 Total"
          linkTo="/super-admin/payments"
          className="p-6"
        />
      </div>

      {/* Analytics & Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Month-Wise Attendance Trend Graph Card (Overall Trend Across Class Days) */}
        <Card
          header={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">ATTENDANCE TREND (MONTH-WISE)</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Overall attendance rate calculated across conducted class days</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Avg 92.8%
                </span>
                <Button variant="ghost" size="sm" onClick={() => navigate('/super-admin/attendance')}>
                  View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-6 pt-2">
            {/* Overall Attendance Summary Badges */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Overall Average</p>
                <p className="text-xl font-black text-emerald-900 mt-0.5">92.8%</p>
                <p className="text-[11px] text-emerald-700 font-bold">Month-Wise Trend</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Highest Month</p>
                <p className="text-xl font-black text-blue-900 mt-0.5">96.0%</p>
                <p className="text-[11px] text-blue-700 font-bold">Aug 2026</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Class Days Basis</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">Active Days</p>
                <p className="text-[11px] text-slate-500 font-bold">Class Days Only</p>
              </div>
            </div>

            {/* Month-Wise Bar Chart Matching Screenshot Layout */}
            <div className="relative pt-6 pb-2 px-2 sm:px-6">
              {/* Dashed Horizontal Grid Lines & Y-Axis Scale */}
              <div className="absolute inset-x-2 sm:inset-x-6 top-6 bottom-8 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-mono">
                <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-1"><span>100%</span></div>
                <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-1"><span>75%</span></div>
                <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-1"><span>50%</span></div>
                <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-1"><span>25%</span></div>
                <div className="flex justify-between items-center border-b border-dashed border-slate-200 pb-1"><span>0%</span></div>
              </div>

              {/* Monthly Bar Visuals */}
              <div className="relative h-48 flex items-end justify-between gap-3 sm:gap-6 z-10 pt-4">
                {[
                  { month: 'Apr 26', rate: 88, present: 45, total: 51 },
                  { month: 'May 26', rate: 91, present: 47, total: 51 },
                  { month: 'Jun 26', rate: 85, present: 44, total: 52 },
                  { month: 'Jul 26', rate: 94, present: 49, total: 52 },
                  { month: 'Aug 26', rate: 96, present: 50, total: 52 },
                  { month: 'Sep 26', rate: 94.2, present: 49, total: 52, active: true }
                ].map((item, idx) => (
                  <div key={idx} className="relative group flex flex-col items-center flex-1">
                    {/* Tooltip Popup on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute -top-10 bg-slate-900 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg whitespace-nowrap pointer-events-none shadow-lg z-30">
                      {item.month}: {item.rate}% ({item.present}/{item.total})
                    </div>

                    {/* Bar Container */}
                    <div className="w-full max-w-[44px] bg-slate-100/80 rounded-t-xl overflow-hidden flex items-end h-40 border border-slate-200/50">
                      <div
                        style={{ height: `${item.rate}%` }}
                        className={`w-full transition-all duration-500 rounded-t-lg ${
                          item.active
                            ? 'bg-gradient-to-t from-blue-600 via-indigo-500 to-indigo-600 shadow-md'
                            : 'bg-gradient-to-t from-emerald-500 to-teal-400 group-hover:from-emerald-600 group-hover:to-teal-500'
                        }`}
                      />
                    </div>

                    {/* Month X-Axis Label */}
                    <span className={`text-xs font-bold mt-2.5 ${item.active ? 'text-blue-600 font-black' : 'text-slate-500'}`}>
                      {item.month}
                    </span>
                  </div>
                ))}
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
                <span
                  onClick={() => navigate('/super-admin/students')}
                  className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 cursor-pointer hover:bg-rose-100 transition-colors"
                  title="Click to view student list for pending dues"
                >
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

      {/* Website Dynamic Content Overview Section */}
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">WEBSITE DYNAMIC CONTENT OVERVIEW</h3>
                <p className="text-[11px] text-slate-400 font-medium">Real-time CMS status & website content management</p>
              </div>
            </div>
            <Badge variant="blue">CMS Active</Badge>
          </div>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div
            onClick={() => navigate('/super-admin/website/categories')}
            className="p-3.5 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-slate-500 group-hover:text-blue-600 font-bold">
              <span>Categories</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-black text-slate-900">{INITIAL_CATEGORIES.length}</p>
            <p className="text-[10px] text-slate-400">Sports academies</p>
          </div>

          <div
            onClick={() => navigate('/super-admin/website/programmes')}
            className="p-3.5 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-slate-500 group-hover:text-blue-600 font-bold">
              <span>Programmes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-black text-slate-900">{INITIAL_PROGRAMMES.length}</p>
            <p className="text-[10px] text-slate-400">Training tracks</p>
          </div>

          <div
            onClick={() => navigate('/super-admin/website/team')}
            className="p-3.5 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-slate-500 group-hover:text-blue-600 font-bold">
              <span>Team & Board</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-black text-slate-900">{INITIAL_TEAM_CMS.length}</p>
            <p className="text-[10px] text-slate-400">Mentors & Directors</p>
          </div>

          <div
            onClick={() => navigate('/super-admin/website/gallery')}
            className="p-3.5 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-slate-500 group-hover:text-blue-600 font-bold">
              <span>Media Gallery</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-black text-slate-900">{INITIAL_GALLERY.length}</p>
            <p className="text-[10px] text-slate-400">Photos & Videos</p>
          </div>

          <div
            onClick={() => navigate('/super-admin/website/careers')}
            className="p-3.5 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-slate-500 group-hover:text-blue-600 font-bold">
              <span>Careers</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-black text-slate-900">{INITIAL_CAREERS.length}</p>
            <p className="text-[10px] text-emerald-600 font-bold">
              {INITIAL_CAREERS.filter(c => c.status === 'Open').length} Openings Active
            </p>
          </div>

          <div
            onClick={() => navigate('/super-admin/website/applications')}
            className="p-3.5 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-slate-500 group-hover:text-blue-600 font-bold">
              <span>Job Applications</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-black text-blue-700">{INITIAL_APPLICATIONS.length}</p>
            <p className="text-[10px] text-slate-400">Resumes received</p>
          </div>
        </div>
      </Card>

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
