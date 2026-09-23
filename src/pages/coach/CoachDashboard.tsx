import React from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_STUDENTS, INITIAL_COACHES } from '../../mock-data/msrf-data';
import { Users, CalendarCheck, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CoachDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Find coach assigned to active user or default to Rajesh Varma
  const coach = INITIAL_COACHES.find(c => c.email === user?.email) || INITIAL_COACHES[0];
  const myStudents = INITIAL_STUDENTS.filter(s => s.coachId === coach.id || s.coachName === coach.fullName);

  return (
    <LayoutShell
      title={`Coach Dashboard — ${coach.fullName}`}
      breadcrumb={[{ label: 'Coach' }, { label: 'Dashboard' }]}
      actions={
        <Button size="sm" onClick={() => navigate('/coach/attendance')} icon={<CalendarCheck className="w-4 h-4" />}>
          Mark Today's Attendance
        </Button>
      }
    >
      {/* Top 3 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="My Assigned Students"
          value={myStudents.length}
          subtitle={`Capacity: ${coach.capacity}`}
          icon={<Users className="w-5 h-5" />}
          badgeVariant="blue"
          linkTo="/coach/students"
        />
        <StatCard
          title="Attendance Average"
          value={`${coach.attendanceAvg}%`}
          subtitle="This month"
          icon={<CalendarCheck className="w-5 h-5" />}
          badgeVariant="emerald"
          linkTo="/coach/attendance"
        />
        <StatCard
          title="Monthly Trainee Rating"
          value={`★ ${coach.monthlyRating}`}
          subtitle="Out of 5.0"
          icon={<Award className="w-5 h-5" />}
          badgeVariant="amber"
          linkTo="/coach/performance"
        />
      </div>

      {/* Roster & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" header={<h3 className="font-bold text-slate-900 text-sm">My Trainees Overview ({myStudents.length})</h3>}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                  <th className="py-2.5 px-2">Student</th>
                  <th className="py-2.5 px-2">Course</th>
                  <th className="py-2.5 px-2">Attendance %</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {myStudents.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2.5">
                        <img src={st.photo} alt={st.fullName} className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-slate-900">{st.fullName}</p>
                          <p className="text-[10px] text-slate-400">{st.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 font-semibold text-slate-800">{st.course}</td>
                    <td className="py-3 px-2 font-bold text-emerald-600">{st.attendancePercentage}%</td>
                    <td className="py-3 px-2"><Badge variant={st.status === 'Active' ? 'active' : 'inactive'}>{st.status}</Badge></td>
                    <td className="py-3 px-2 text-right">
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/coach/students/${st.id}`)}>
                        Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Coach Specialization Alert & Reminders */}
        <Card header={<h3 className="font-bold text-slate-900 text-sm">Coach Portal Policy</h3>}>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
              <p className="font-bold">Restricted Access Enforced:</p>
              <p className="mt-1 text-[11px]">
                You are currently viewing trainees assigned specifically under <b>{coach.specialization}</b>.
              </p>
            </div>
            <p>✔ Record daily attendance prior to 6:00 PM.</p>
            <p>✔ Submit monthly 5-star performance evaluations.</p>
          </div>
        </Card>
      </div>
    </LayoutShell>
  );
};
