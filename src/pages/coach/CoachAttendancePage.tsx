import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_STUDENTS, INITIAL_COACHES } from '../../mock-data/msrf-data';
import { CalendarCheck, Save, CheckCircle2, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { useNotifications } from '../../context/NotificationContext';

export const CoachAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const today = new Date().toISOString().slice(0, 10);

  const coach = INITIAL_COACHES.find(c => c.email === user?.email) || INITIAL_COACHES[0];
  const myStudents = INITIAL_STUDENTS.filter(s => s.coachId === coach.id || s.coachName === coach.fullName);

  const [attendance, setAttendance] = useState<Record<string, { status: 'Present' | 'Absent' | 'Late'; remarks: string }>>(() => {
    const map: Record<string, { status: 'Present' | 'Absent' | 'Late'; remarks: string }> = {};
    myStudents.forEach(s => {
      map[s.id] = { status: 'Present', remarks: '' };
    });
    return map;
  });

  const handleStatusChange = (id: string, status: 'Present' | 'Absent' | 'Late') => {
    setAttendance(prev => ({
      ...prev,
      [id]: { ...prev[id], status }
    }));
  };

  const handleRemarksChange = (id: string, remarks: string) => {
    setAttendance(prev => ({
      ...prev,
      [id]: { ...prev[id], remarks }
    }));
  };

  const handleSaveAttendance = () => {
    addToast({
      type: 'success',
      title: "Today's Attendance Saved",
      message: `Attendance submitted for ${myStudents.length} trainees.`
    });
  };

  return (
    <LayoutShell
      title="Take Daily Trainee Attendance"
      breadcrumb={[{ label: 'Coach' }, { label: 'Attendance' }]}
      actions={
        <Button size="sm" onClick={handleSaveAttendance} icon={<Save className="w-4 h-4" />}>
          Save Today's Attendance
        </Button>
      }
    >
      <Card
        header={
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-600" /> Attendance Session: {formatDate(today)}
              </h3>
              <p className="text-xs text-slate-500">Only assigned trainees under {coach.specialization}</p>
            </div>
            <Badge variant="blue">{myStudents.length} Enrolled</Badge>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Trainee Name</th>
                <th className="py-3 px-3">Student ID</th>
                <th className="py-3 px-3">Attendance Toggle</th>
                <th className="py-3 px-3">Coach Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {myStudents.map(st => {
                const rec = attendance[st.id] || { status: 'Present', remarks: '' };
                return (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img src={st.photo} alt={st.fullName} className="w-7 h-7 rounded-full object-cover" />
                        <span className="font-bold text-slate-900">{st.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{st.studentId}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant={rec.status === 'Present' ? 'success' : 'outline'}
                          onClick={() => handleStatusChange(st.id, 'Present')}
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={rec.status === 'Absent' ? 'danger' : 'outline'}
                          onClick={() => handleStatusChange(st.id, 'Absent')}
                        >
                          Absent
                        </Button>
                        <Button
                          size="sm"
                          variant={rec.status === 'Late' ? 'secondary' : 'ghost'}
                          onClick={() => handleStatusChange(st.id, 'Late')}
                        >
                          Late
                        </Button>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={rec.remarks}
                        onChange={e => handleRemarksChange(st.id, e.target.value)}
                        placeholder="Session remarks e.g. 50m lap time..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </LayoutShell>
  );
};
