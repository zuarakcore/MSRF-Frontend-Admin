import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_STUDENTS, INITIAL_COACHES } from '../../mock-data/msrf-data';
import { Eye, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CoachStudentListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const coach = INITIAL_COACHES.find(c => c.email === user?.email) || INITIAL_COACHES[0];
  const myStudents = INITIAL_STUDENTS.filter(s => s.coachId === coach.id || s.coachName === coach.fullName);

  const filtered = myStudents.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <LayoutShell
      title={`My Assigned Trainees (${myStudents.length})`}
      breadcrumb={[{ label: 'Coach' }, { label: 'My Students' }]}
    >
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search assigned student by name or ID..."
          className="w-full max-w-md bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="py-16 text-center space-y-3 bg-slate-50/50 border border-dashed border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">No Assigned Trainees</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coach <b>{coach.fullName}</b> currently has 0 assigned trainees in the system.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(st => (
            <Card key={st.id} hoverEffect className="space-y-3">
              <div className="flex items-center gap-3">
                <img src={st.photo} alt={st.fullName} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{st.fullName}</h4>
                  <p className="text-xs font-mono text-slate-400">{st.studentId}</p>
                </div>
              </div>
              <div className="text-xs space-y-1 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Academy:</span>
                  <span className="font-bold text-slate-800">{st.course}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Blood Group:</span>
                  <span className="font-bold text-rose-600">{st.bloodGroup || 'O+'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Attendance %:</span>
                  <span className="font-bold text-emerald-600">{st.attendancePercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Parent Phone:</span>
                  <span className="font-mono text-slate-700">{st.parentPhone}</span>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => navigate(`/coach/students/${st.id}`)} icon={<Eye className="w-3.5 h-3.5" />}>
                  View Trainee Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </LayoutShell>
  );
};
