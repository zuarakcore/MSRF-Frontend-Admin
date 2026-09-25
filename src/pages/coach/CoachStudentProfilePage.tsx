import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_STUDENTS, INITIAL_COACHES, INITIAL_PERFORMANCE } from '../../mock-data/msrf-data';
import { ArrowLeft, Award, CalendarCheck, Phone } from 'lucide-react';
import { formatDate } from '../../utils/format';

export const CoachStudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const coach = INITIAL_COACHES.find(c => c.email === user?.email) || INITIAL_COACHES[0];
  const student = INITIAL_STUDENTS.find(s => s.id === id);

  // Security Guard: Check if student belongs to this coach
  const isAssignedToCoach = student && (student.coachId === coach.id || student.coachName === coach.fullName);

  if (!student || !isAssignedToCoach) {
    return (
      <LayoutShell title="Access Denied" breadcrumb={[{ label: 'Coach' }, { label: 'Students' }]}>
        <Card className="p-8 text-center space-y-4 max-w-md mx-auto my-12">
          <h3 className="text-lg font-bold text-rose-600">Unauthorized Student Access</h3>
          <p className="text-xs text-slate-500">
            Coaches are restricted from accessing performance & profile records of trainees assigned to other coaches.
          </p>
          <Button onClick={() => navigate('/coach/students')} icon={<ArrowLeft className="w-4 h-4" />}>
            Back to My Trainees
          </Button>
        </Card>
      </LayoutShell>
    );
  }

  const perfLogs = INITIAL_PERFORMANCE.filter(p => p.studentId === student.id);

  return (
    <LayoutShell
      title={`Trainee Profile: ${student.fullName}`}
      breadcrumb={[
        { label: 'Coach', path: '/coach/dashboard' },
        { label: 'My Students', path: '/coach/students' },
        { label: student.studentId }
      ]}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate('/coach/students')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Roster
        </Button>
      }
    >
      <Card className="p-6 bg-slate-900 text-white border-0 shadow-lg">
        <div className="flex items-center gap-5">
          <img src={student.photo} alt={student.fullName} className="w-16 h-16 rounded-xl object-cover border-2 border-white/20" />
          <div>
            <h2 className="text-xl font-black">{student.fullName}</h2>
            <p className="text-xs text-blue-400 font-mono">{student.studentId} • {student.course}</p>
            <p className="text-xs text-rose-300 font-bold mt-0.5">Blood Group: {student.bloodGroup || 'O+'}</p>
            <p className="text-xs text-slate-300 mt-0.5">Parent: {student.parentName} ({student.parentPhone})</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card header={<h3 className="font-bold text-slate-900 text-sm">Attendance Summary</h3>}>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Attendance Percentage:</span>
              <span className="font-bold text-emerald-600 text-sm">{student.attendancePercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Present Sessions:</span>
              <span className="font-bold text-slate-800">{student.totalPresent} Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Absent Sessions:</span>
              <span className="font-bold text-rose-600">{student.totalAbsent} Days</span>
            </div>
          </div>
        </Card>

        <Card header={<h3 className="font-bold text-slate-900 text-sm">Coach Performance Evaluation</h3>}>
          {perfLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No performance rating recorded yet.</p>
          ) : (
            perfLogs.map(p => (
              <div key={p.id} className="space-y-2 text-xs">
                <p className="font-bold text-amber-500">★ {p.rating} / 5 Star Rating ({p.monthYear})</p>
                <p className="text-slate-700"><b>Remarks:</b> {p.coachRemarks}</p>
              </div>
            ))
          )}
        </Card>
      </div>
    </LayoutShell>
  );
};
