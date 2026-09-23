import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CoachCredentialsModal } from '../../components/ui/CoachCredentialsModal';
import { INITIAL_COACHES, INITIAL_STUDENTS } from '../../mock-data/msrf-data';
import { ArrowLeft, Mail, Phone, Calendar, Award, Key, Copy, Check } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { useNotifications } from '../../context/NotificationContext';

export const CoachProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  const [credentialsModal, setCredentialsModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const coach = INITIAL_COACHES.find(c => c.id === id) || INITIAL_COACHES[0];
  const assignedStudents = INITIAL_STUDENTS.filter(s => s.coachId === coach.id || s.coachName === coach.fullName);

  const handleCopyCredentials = () => {
    const username = coach.email;
    const password = coach.tempPassword || 'Coach#2026!';
    const textToCopy = `MSRF COACH PORTAL LOGIN CREDENTIALS:\nLogin URL: http://localhost:5173/login\nUsername / Email: ${username}\nPassword: ${password}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    addToast({
      type: 'success',
      title: 'Credentials Copied!',
      message: `Login details for ${coach.fullName} copied to clipboard.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <LayoutShell
      title={`Coach Profile: ${coach.fullName}`}
      breadcrumb={[
        { label: 'Super Admin', path: '/super-admin/dashboard' },
        { label: 'Coaches', path: '/super-admin/coaches' },
        { label: coach.fullName }
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCredentialsModal(true)} icon={<Key className="w-4 h-4 text-amber-500" />}>
            Login Credentials
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/super-admin/coaches')} icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Directory
          </Button>
        </div>
      }
    >
      <Card className="p-6 bg-slate-900 text-white border-0 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img src={coach.photo} alt={coach.fullName} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20" />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black">{coach.fullName}</h2>
                <Badge variant={coach.status === 'Active' ? 'active' : 'inactive'}>{coach.status}</Badge>
              </div>
              <p className="text-xs text-blue-400 font-bold mt-0.5">{coach.specialization}</p>
              <p className="text-xs text-slate-300 mt-2 max-w-xl">{coach.bio}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase font-bold text-slate-400">Monthly Trainee Rating</p>
            <p className="text-3xl font-black text-amber-400">★ {coach.monthlyRating}</p>
            <p className="text-xs text-slate-300 mt-1">{coach.assignedStudentsCount} / {coach.capacity} Trainees</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info & Credentials Card */}
        <div className="space-y-6">
          <Card header={<h3 className="font-bold text-slate-900 text-sm">Contact Information</h3>}>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" /> {coach.email}
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400" /> {coach.phone}
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" /> Joined: {formatDate(coach.joinedDate)}
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Award className="w-4 h-4 text-slate-400" /> Experience: {coach.experienceYears} Years
              </div>
            </div>
          </Card>

          {/* Coach Credentials Panel */}
          <Card header={
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" /> Portal Login Credentials
              </h3>
              <Button size="sm" variant="ghost" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1" onClick={handleCopyCredentials} icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          }>
            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-sans font-semibold">Username / Email</span>
                <span className="font-bold text-slate-900">{coach.email}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-sans font-semibold">Default Password</span>
                <span className="font-bold text-amber-600">{coach.tempPassword || 'Coach#2026!'}</span>
              </div>
            </div>
          </Card>
        </div>

        <Card className="md:col-span-2" header={<h3 className="font-bold text-slate-900 text-sm">Assigned Student Roster ({assignedStudents.length})</h3>}>
          <div className="divide-y divide-slate-100">
            {assignedStudents.map(st => (
              <div key={st.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={st.photo} alt={st.fullName} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-slate-900">{st.fullName}</p>
                    <p className="text-[11px] text-slate-500">{st.studentId} • {st.course}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => navigate(`/super-admin/students/${st.id}`)}>
                  View Profile
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <CoachCredentialsModal
        isOpen={credentialsModal}
        onClose={() => setCredentialsModal(false)}
        coach={coach}
      />
    </LayoutShell>
  );
};
