import React from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
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
import { QueryState } from '../../components/ui/QueryState';
import { attendanceApi, dashboardApi, feesApi, studentsApi } from '../../api/endpoints';
import { toStudent, toSubmission } from '../../api/mappers';
import { formatCurrency, formatDate } from '../../utils/format';
import { useNavigate } from 'react-router-dom';

export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const summaryQuery = useQuery({ queryKey: ['dashboard', 'summary'], queryFn: dashboardApi.summary });
  const data = summaryQuery.data;
  const now = new Date();

  // The summary's overdue list also counts inactive students; show only active ones.
  const activeIdsQuery = useQuery({
    queryKey: ['students', 'active-ids'],
    queryFn: async () => new Set((await studentsApi.listAll({ status: 'ACTIVE' })).map(st => st.id)),
  });
  const overdueQuery = useQuery({
    queryKey: ['fees', 'ledger', 'overdue', now.getFullYear(), now.getMonth() + 1],
    queryFn: () => feesApi.ledgerAll({ year: now.getFullYear(), month: now.getMonth() + 1, status: 'OVERDUE' }),
  });
  const activeOverdue =
    activeIdsQuery.data && overdueQuery.data
      ? overdueQuery.data.filter(row => activeIdsQuery.data.has(row.student.id)).sort((a, b) => b.outstanding - a.outstanding)
      : null;

  // Attendance rate for each of the last six months: present records / all records.
  const trendMonths = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).replace(' ', " '") };
  });
  const trendQueries = useQueries({
    queries: trendMonths.map(m => ({
      queryKey: ['dashboard', 'attendance-trend', m.year, m.month],
      queryFn: async () => {
        const [all, present] = await Promise.all([
          attendanceApi.students({ year: m.year, month: m.month, pageSize: 1 }),
          attendanceApi.students({ year: m.year, month: m.month, status: 'PRESENT', pageSize: 1 }),
        ]);
        return { total: all.total, present: present.total };
      },
    })),
  });
  const attendanceTrend = trendMonths.map((m, i) => {
    const counts = trendQueries[i].data;
    const rate = counts && counts.total > 0 ? Math.round((counts.present / counts.total) * 1000) / 10 : 0;
    return { month: m.label, rate, present: counts?.present ?? 0, total: counts?.total ?? 0, active: i === trendMonths.length - 1 };
  });
  const monthsWithData = attendanceTrend.filter(t => t.total > 0);
  const trendPresent = monthsWithData.reduce((s, t) => s + t.present, 0);
  const trendTotal = monthsWithData.reduce((s, t) => s + t.total, 0);
  const averageRate = trendTotal ? Math.round((trendPresent / trendTotal) * 1000) / 10 : 0;
  const bestMonth = monthsWithData.reduce<(typeof attendanceTrend)[number] | null>((best, t) => (!best || t.rate > best.rate ? t : best), null);

  // KPI values
  const totalStudents = data?.students.total ?? 0;
  const activeStudents = data?.students.active ?? 0;
  const activeCoaches = data?.activeCoaches ?? 0;
  const pendingFeesTotal = data?.fees.outstanding ?? 0;
  const monthlyCollectionsTotal = data?.fees.collectedThisMonth ?? 0;
  const annualCollectionTotal = data?.fees.collectedThisYear ?? 0;
  const pendingVerificationsCount = data?.pendingVerifications ?? 0;
  const collectedShare = annualCollectionTotal + pendingFeesTotal > 0
    ? Math.round((annualCollectionTotal / (annualCollectionTotal + pendingFeesTotal)) * 100)
    : 0;

  const overdueStudentsCount = activeOverdue ? activeOverdue.length : data?.fees.overdueStudents ?? 0;
  const topOverdue = activeOverdue ?? (data?.topOverdue ?? []);

  const recentAdmissions = (data?.recentAdmissions ?? []).map(toStudent);
  // The card is a to-do list: reviewed (verified/rejected) submissions live on the Payments page.
  const recentSubmissions = (data?.recentSubmissions ?? []).filter(s => s.status === 'PENDING').map(toSubmission);

  if (!data) {
    return (
      <LayoutShell title="Control Center & Executive Overview" breadcrumb={[{ label: 'Super Admin' }, { label: 'Dashboard' }]}>
        <QueryState isLoading={summaryQuery.isLoading} error={summaryQuery.error} onRetry={() => summaryQuery.refetch()}>
          {null}
        </QueryState>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell
      title="Control Center & Executive Overview"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Dashboard' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate('/super-admin/students?new=1')} icon={<Plus className="w-4 h-4" />}>
            New Admission
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/super-admin/reports')}>
            Generate Reports
          </Button>
        </div>
      }
    >
      {/* Top KPI Cards — equal height, values aligned */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle={`${activeStudents} active`}
          icon={<Users className="w-5 h-5" />}
          badgeVariant="blue"
          linkTo="/super-admin/students"
        />
        <StatCard
          title="Active Coaches"
          value={activeCoaches}
          subtitle="Coaching staff"
          icon={<UserCheck className="w-5 h-5" />}
          badgeVariant="emerald"
          linkTo="/super-admin/coaches"
        />
        <StatCard
          title="Fees Outstanding"
          value={formatCurrency(pendingFeesTotal)}
          subtitle={`${overdueStudentsCount} overdue`}
          icon={<AlertCircle className="w-5 h-5" />}
          badgeVariant="rose"
          badgeText={`${pendingVerificationsCount} to verify`}
          linkTo="/super-admin/fees"
        />
        <StatCard
          title="Collected This Month"
          value={formatCurrency(monthlyCollectionsTotal)}
          subtitle={now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          icon={<TrendingUp className="w-5 h-5" />}
          badgeVariant="emerald"
          linkTo="/super-admin/fees"
        />
        <StatCard
          title="Collected This Year"
          value={formatCurrency(annualCollectionTotal)}
          subtitle={`Jan – ${now.toLocaleDateString('en-IN', { month: 'short' })} ${now.getFullYear()}`}
          icon={<CreditCard className="w-5 h-5" />}
          badgeVariant="emerald"
          linkTo="/super-admin/fees"
        />
      </div>

      {/* Analytics & Overview Row — both cards share the row height */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Attendance trend (last 6 months) */}
        <Card
          className="h-full flex flex-col [&>div:last-child]:flex-1"
          header={
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">Attendance Trend</h3>
                  <p className="text-[11px] text-slate-400 font-medium truncate">Last 6 months · class days only</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="whitespace-nowrap shrink-0" onClick={() => navigate('/super-admin/attendance')}>
                View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Average</p>
                <p className="text-xl font-black text-emerald-900 mt-1">{averageRate}%</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Best Month</p>
                <p className="text-xl font-black text-blue-900 mt-1">{bestMonth ? `${bestMonth.rate}%` : '—'}</p>
                <p className="text-[10px] text-blue-700 font-semibold">{bestMonth?.month ?? 'No sessions yet'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Marks</p>
                <p className="text-xl font-black text-slate-900 mt-1">{trendTotal.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Bar chart: y-axis labels in their own column, grid lines behind the bars */}
            <div className="flex gap-3">
              <div className="flex flex-col justify-between h-44 text-[10px] font-medium text-slate-400 text-right w-9 shrink-0 -mt-1.5">
                {[100, 75, 50, 25, 0].map(v => (
                  <span key={v}>{v}%</span>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <div className="relative h-44">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className={`border-t ${i === 4 ? 'border-slate-300' : 'border-dashed border-slate-200'}`} />
                    ))}
                  </div>
                  <div className="relative h-full flex items-end justify-around gap-2">
                    {attendanceTrend.map(item => (
                      <div key={item.month} className="group relative h-full flex-1 max-w-[44px] flex items-end">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-bold py-1 px-2 rounded-md whitespace-nowrap pointer-events-none shadow-lg z-10">
                          {item.total ? `${item.rate}% (${item.present}/${item.total})` : 'No sessions'}
                        </div>
                        <div
                          style={{ height: `${Math.max(item.rate, item.total ? 2 : 0)}%` }}
                          className={`w-full rounded-t-md transition-all duration-500 ${
                            item.active ? 'bg-brand' : 'bg-emerald-300 group-hover:bg-emerald-400'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-around gap-2 mt-2">
                  {attendanceTrend.map(item => (
                    <span
                      key={item.month}
                      className={`flex-1 max-w-[44px] text-center text-[11px] whitespace-nowrap ${item.active ? 'text-brand font-bold' : 'text-slate-500 font-medium'}`}
                    >
                      {item.month}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Fee collection */}
        <Card
          className="h-full flex flex-col [&>div:last-child]:flex-1"
          header={
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">Fee Collection</h3>
                  <p className="text-[11px] text-slate-400 font-medium truncate">{now.getFullYear()} so far</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="whitespace-nowrap shrink-0" onClick={() => navigate('/super-admin/fees')}>
                Manage Fees <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          }
        >
          <div className="space-y-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Collected</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5 whitespace-nowrap">{formatCurrency(annualCollectionTotal)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Outstanding</p>
                <p className="text-2xl font-black text-rose-600 mt-0.5 whitespace-nowrap">{formatCurrency(pendingFeesTotal)}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${collectedShare}%` }} />
              </div>
              <div className="flex justify-between text-[11px] font-semibold">
                <span className="text-emerald-700">{collectedShare}% collected</span>
                <span className="text-rose-600">{100 - collectedShare}% outstanding</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">This Month</p>
                <p className="text-base font-black text-slate-900 mt-1 whitespace-nowrap">{formatCurrency(monthlyCollectionsTotal)}</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Overdue</p>
                <p className="text-base font-black text-rose-700 mt-1">{overdueStudentsCount}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">To Verify</p>
                <p className="text-base font-black text-amber-700 mt-1">{pendingVerificationsCount}</p>
              </div>
            </div>

            {/* Largest outstanding balances */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Top Overdue</p>
              {topOverdue.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">No overdue fees. 🎉</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {topOverdue.slice(0, 4).map(row => (
                    <button
                      key={row.student.id}
                      type="button"
                      onClick={() => navigate(`/super-admin/students/${row.student.id}`)}
                      className="w-full flex items-center justify-between gap-3 py-2 text-left hover:bg-slate-50 rounded-lg px-1 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{row.student.fullName}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {row.student.category.name} · {row.months} month{row.months === 1 ? '' : 's'}
                        </p>
                      </div>
                      <span className="text-xs font-black text-rose-600 whitespace-nowrap">{formatCurrency(row.outstanding)}</span>
                    </button>
                  ))}
                </div>
              )}
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
            <p className="text-xl font-black text-slate-900">{data.cms.categories}</p>
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
            <p className="text-xl font-black text-slate-900">{data.cms.programmes}</p>
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
            <p className="text-xl font-black text-slate-900">{data.cms.team}</p>
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
            <p className="text-xl font-black text-slate-900">{data.cms.gallery}</p>
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
            <p className="text-xl font-black text-slate-900">{data.cms.openJobs}</p>
            <p className="text-[10px] text-emerald-600 font-bold">Openings Active</p>
          </div>

          <div
            onClick={() => navigate('/super-admin/website/job-applications')}
            className="p-3.5 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between text-slate-500 group-hover:text-blue-600 font-bold">
              <span>Job Applications</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-xl font-black text-blue-700">{data.cms.applicationsUnderReview}</p>
            <p className="text-[10px] text-slate-400">Awaiting review</p>
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
                    <th className="pb-3 px-2">Category</th>
                    <th className="pb-3 px-2">Program</th>
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
                      <td className="py-3 px-2 font-semibold text-slate-800">{st.category}</td>
                      <td className="py-3 px-2">{st.programType}</td>
                      <td className="py-3 px-2 text-slate-500">{st.admissionDate ? formatDate(st.admissionDate) : '—'}</td>
                      <td className="py-3 px-2">
                        <Badge variant={st.status === 'Active' ? 'active' : 'inactive'}>
                          {st.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/super-admin/students/${st.slug}`)}
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
              {recentSubmissions.length === 0 && (
                <p className="text-xs text-slate-500 py-2">No payment submissions are waiting for review.</p>
              )}
              {recentSubmissions.map(sub => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{sub.studentName}</p>
                    <p className="text-[11px] text-slate-500">Parent mobile: {sub.parentPhone}</p>
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
                        onClick={() => navigate(`/super-admin/payments?review=${sub.id}`)}
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
