import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { QueryState } from '../../components/ui/QueryState';
import { coachPortalApi } from '../../api/endpoints';
import { toCoachStudent } from '../../api/mappers';
import { ApiError } from '../../api/client';
import { ArrowLeft, Award, CalendarCheck, Phone } from 'lucide-react';
import { formatDate } from '../../utils/format';

export const CoachStudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const studentQuery = useQuery({ queryKey: ['coach', 'students', id], queryFn: () => coachPortalApi.student(id!), enabled: Boolean(id) });
  const reportsQuery = useQuery({
    queryKey: ['coach', 'students', id, 'reports'],
    queryFn: () => coachPortalApi.studentReports(id!),
    enabled: Boolean(id),
  });
  const student = studentQuery.data ? toCoachStudent(studentQuery.data) : null;

  if (!student && (studentQuery.isLoading || (studentQuery.error && !(studentQuery.error instanceof ApiError && [403, 404].includes(studentQuery.error.status))))) {
    return (
      <LayoutShell title="Trainee Profile" breadcrumb={[{ label: 'Coach' }, { label: 'Students' }]}>
        <QueryState isLoading={studentQuery.isLoading} error={studentQuery.error} onRetry={() => studentQuery.refetch()}>{null}</QueryState>
      </LayoutShell>
    );
  }

  // The backend refuses (403/404) students outside this coach's categories.
  if (!student) {
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

  const perfLogs = reportsQuery.data ?? [];

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
            <p className="text-xs text-rose-300 font-bold mt-0.5">Blood Group: {student.bloodGroup || '—'}</p>
            <p className="text-xs text-slate-300 mt-0.5">Parent: {student.parentName} ({student.parentPhone})</p>
            {student.emergencyPhone && (
              <p className="text-xs text-slate-300 mt-0.5">Emergency: {student.emergencyName} ({student.emergencyPhone})</p>
            )}
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
              <span className="text-slate-400">Category / Batch:</span>
              <span className="font-bold text-slate-800">{student.category} • {student.batch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date of Birth:</span>
              <span className="font-bold text-slate-800">{formatDate(student.dateOfBirth)}</span>
            </div>
          </div>
        </Card>

        <Card header={<h3 className="font-bold text-slate-900 text-sm">Coach Performance Evaluation</h3>}>
          {perfLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No performance rating recorded yet.</p>
          ) : (
            perfLogs.map(p => (
              <div key={p.id} className="space-y-2 text-xs">
                <p className="font-bold text-amber-500">★ {p.overallRating} / 5 Star Rating ({p.reportPeriod})</p>
                <p className="text-slate-700">
                  <b>By:</b> {p.coach.name} on {formatDate(p.recordedDate)}{p.position ? ` • ${p.position}` : ''}
                </p>
              </div>
            ))
          )}
        </Card>
      </div>
    </LayoutShell>
  );
};
