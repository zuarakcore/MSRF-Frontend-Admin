import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { QueryState } from '../../components/ui/QueryState';
import { coachPortalApi } from '../../api/endpoints';
import { ATTENDANCE_LABEL, todayIso } from '../../api/mappers';
import { Users, CalendarCheck, UserCheck, Award, Plus, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/format';

export const CoachDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = todayIso();
  const dashboardQuery = useQuery({ queryKey: ['coach', 'dashboard'], queryFn: coachPortalApi.dashboard });
  const data = dashboardQuery.data;

  if (!data) {
    return (
      <LayoutShell title="Coach Dashboard" breadcrumb={[{ label: 'Coach' }, { label: 'Dashboard' }]}>
        <QueryState isLoading={dashboardQuery.isLoading} error={dashboardQuery.error} onRetry={() => dashboardQuery.refetch()}>
          {null}
        </QueryState>
      </LayoutShell>
    );
  }

  const coach = {
    fullName: data.fullName || user?.name || 'Coach',
    specialization: data.categories.map(c => c.name).join(', ') || 'No categories assigned yet',
  };
  // This coach's own status on their recent sessions (lead or co-coach).
  const coachAttendanceLogs = data.recentSessions.map(s => {
    const me = s.coaches.find(c => c.coach.id === user?.coachId);
    return {
      date: s.sessionDate,
      session: `${s.dailyTopic} • ${s.categories.map(c => c.name).join(', ')}`,
      status: me ? ATTENDANCE_LABEL[me.status] : 'Present',
      markedTime: s.createdBy.id === user?.coachId ? 'Logged by you' : `Logged by ${s.createdBy.name}`,
    };
  });

  return (
    <LayoutShell
      title={`Coach Dashboard — ${coach.fullName}`}
      breadcrumb={[{ label: 'Coach' }, { label: 'Dashboard' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate('/coach/attendance')} icon={<CalendarCheck className="w-4 h-4" />}>
            Mark Daily Attendance
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/coach/performance')} icon={<Plus className="w-4 h-4" />}>
            New Player Evaluation
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* Top 3 Stats Matching Coach Modules */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Attendance Rate"
            value={data.attendanceRateThisMonth === null ? '—' : `${data.attendanceRateThisMonth}%`}
            subtitle={`This month • ${data.studentCount} trainees`}
            icon={<CalendarCheck className="w-5 h-5" />}
            badgeVariant="emerald"
            linkTo="/coach/attendance"
          />
          <StatCard
            title="Player Reports"
            value={data.reportsCount}
            subtitle="15-skill evaluations"
            icon={<Award className="w-5 h-5" />}
            badgeVariant="emerald"
            linkTo="/coach/performance"
          />
          <StatCard
            title="Today's Session"
            value={data.today.hasSession ? 'Logged' : 'Not logged'}
            subtitle={formatDate(today)}
            icon={<UserCheck className="w-5 h-5" />}
            badgeVariant={data.today.hasSession ? 'emerald' : 'amber'}
            linkTo="/coach/attendance"
          />
        </div>

        {/* Quick actions — website theme: brand green and near-black */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => navigate('/coach/attendance')}
            className="group text-left p-5 rounded-2xl bg-brand text-white shadow-sm hover:bg-brand-hover hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm">Daily Attendance & Training Sessions</h3>
              <p className="text-xs text-white/80 mt-0.5">Log a session, its splits and each trainee's attendance.</p>
            </div>
            <ArrowRight className="w-5 h-5 shrink-0 text-white/80 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/coach/performance')}
            className="group text-left p-5 rounded-2xl bg-[var(--brand-bg)] text-white shadow-sm hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--brand-accent)] text-[var(--brand-accent-foreground)] flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm">Player Development Reports</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Rate the 15 skills and set strengths, improvements and goals.</p>
            </div>
            <ArrowRight className="w-5 h-5 shrink-0 text-[var(--brand-accent)] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card header={
            <div className="flex items-center justify-between gap-3 w-full">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-brand" /> My Recent Sessions
              </h3>
              <Badge variant="active">Recent Sessions</Badge>
            </div>
          }>
            <div className="space-y-3 text-xs">
              {coachAttendanceLogs.length === 0 && (
                <p className="text-center text-slate-400 py-4">No sessions logged yet. Use Daily Attendance to log today's session.</p>
              )}
              {coachAttendanceLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{formatDate(log.date)}</p>
                    <p className="text-[11px] text-slate-500">{log.session}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {log.status}
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{log.markedTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card header={<h3 className="font-bold text-slate-900 text-sm">Club & Coach Policy</h3>}>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-brand-soft border border-emerald-200 rounded-xl text-emerald-950">
                <p className="font-bold uppercase tracking-wider text-[10px] text-brand">Malabar Challengers FC</p>
                <p className="mt-1 text-xs font-semibold">
                  Logged in as <b>{coach.fullName}</b> ({coach.specialization}).
                </p>
              </div>
              <p className="flex items-start gap-1.5 font-medium text-slate-700">
                <span className="text-emerald-600 font-bold">✔</span> Submit daily training session reports before 6:00 PM.
              </p>
              <p className="flex items-start gap-1.5 font-medium text-slate-700">
                <span className="text-emerald-600 font-bold">✔</span> Update monthly 15-skill player development evaluations.
              </p>
              <p className="flex items-start gap-1.5 font-medium text-slate-700">
                <span className="text-emerald-600 font-bold">✔</span> Sessions are editable within 7 days of logging.
              </p>
            </div>
          </Card>
        </div>

      </div>
    </LayoutShell>
  );
};
