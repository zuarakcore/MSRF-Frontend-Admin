import React from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_STUDENTS, INITIAL_COACHES, INITIAL_SESSION_REPORTS, INITIAL_PERFORMANCE } from '../../mock-data/msrf-data';
import { Users, CalendarCheck, UserCheck, Award, Plus, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/format';

export const CoachDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  // Find coach assigned to active user or default to Rajesh Varma
  const coach = INITIAL_COACHES.find(c => c.email === user?.email) || INITIAL_COACHES[0];
  const myStudents = INITIAL_STUDENTS.filter(s => s.coachId === coach.id || s.coachName === coach.fullName);
  const myPerformance = INITIAL_PERFORMANCE.filter(p => p.coachId === coach.id || p.coachName === coach.fullName);
  const mySessions = INITIAL_SESSION_REPORTS.filter(r => r.loggedByCoachName === coach.fullName || (r.assignedCoaches && r.assignedCoaches.includes(coach.fullName)));

  // Coach attendance logs derived from sessions or today
  const coachAttendanceLogs = mySessions.length > 0 ? mySessions.map(s => ({
    date: s.date,
    session: `${s.dailyTopic} (${s.time})`,
    status: 'Present',
    markedTime: '06:00 AM'
  })) : [
    { date: today, session: 'Morning Tactical Session (6:00 AM - 8:00 AM)', status: 'Present', markedTime: '05:55 AM' }
  ];

  return (
    <LayoutShell
      title={`Coach Dashboard — ${coach.fullName}`}
      breadcrumb={[{ label: 'Coach' }, { label: 'Dashboard' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => navigate('/coach/attendance')} icon={<CalendarCheck className="w-4 h-4" />}>
            Mark Daily Attendance
          </Button>
          <Button size="sm" onClick={() => navigate('/coach/performance')} icon={<Plus className="w-4 h-4" />} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold">
            New Player Evaluation
          </Button>
        </div>
      }
    >
      <div className="space-y-6">

        {/* Top 3 Stats Matching Coach Modules */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Trainee Attendance Rate"
            value={`${coach.attendanceAvg}%`}
            subtitle="Monthly Average"
            icon={<CalendarCheck className="w-5 h-5 text-emerald-600" />}
            badgeVariant="emerald"
            linkTo="/coach/attendance"
          />
          <StatCard
            title="Player Development Reports"
            value={myPerformance.length}
            subtitle="15-Skill Evaluations"
            icon={<Award className="w-5 h-5 text-amber-500" />}
            badgeVariant="amber"
            linkTo="/coach/performance"
          />
          <StatCard
            title="Coach Today Attendance"
            value="Present"
            subtitle={`Logged: ${formatDate(today)}`}
            icon={<UserCheck className="w-5 h-5 text-indigo-600" />}
            badgeVariant="emerald"
            linkTo="/coach/attendance"
          />
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => navigate('/coach/attendance')}
            className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                <CalendarCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider">1. Daily Attendance & Training Sessions</h3>
                <p className="text-xs text-blue-100 mt-0.5">Select category, date, coaches, and log trainee attendance with session splits.</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>

          <div
            onClick={() => navigate('/coach/performance')}
            className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider">2. Player Performance Rating Reports</h3>
                <p className="text-xs text-slate-300 mt-0.5">Record 15-skill evaluations, strengths, areas for improvement & development goals.</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card header={
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" /> Coach Attendance Log
              </h3>
              <Badge variant="active">Auto-Logged</Badge>
            </div>
          }>
            <div className="space-y-3 text-xs">
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
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                <p className="font-extrabold uppercase text-[10px] text-blue-600">Malabar Challengers FC Policy</p>
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
