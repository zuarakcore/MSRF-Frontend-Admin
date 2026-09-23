import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_STUDENTS, INITIAL_COACHES, INITIAL_PERFORMANCE } from '../../mock-data/msrf-data';
import { PerformanceRecord, RatingStar } from '../../types';
import { Award, Plus, Star } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const CoachPerformancePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const coach = INITIAL_COACHES.find(c => c.email === user?.email) || INITIAL_COACHES[0];
  const myStudents = INITIAL_STUDENTS.filter(s => s.coachId === coach.id || s.coachName === coach.fullName);

  const [records, setRecords] = useState<PerformanceRecord[]>(INITIAL_PERFORMANCE);
  const [modal, setModal] = useState(false);

  const [formData, setFormData] = useState({
    studentId: myStudents[0]?.id || '',
    monthYear: 'September 2026',
    rating: 5 as RatingStar,
    technicalSkills: 90,
    staminaDiscipline: 92,
    teamwork: 88,
    strengths: '',
    areasForImprovement: '',
    remarks: ''
  });

  const handleSavePerf = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = myStudents.find(s => s.id === formData.studentId) || myStudents[0];
    if (!targetStudent) return;

    const newPerf: PerformanceRecord = {
      id: `perf-${Date.now()}`,
      studentId: targetStudent.id,
      studentName: targetStudent.fullName,
      coachId: coach.id,
      coachName: coach.fullName,
      monthYear: formData.monthYear,
      rating: formData.rating,
      technicalSkills: formData.technicalSkills,
      staminaDiscipline: formData.staminaDiscipline,
      teamwork: formData.teamwork,
      strengths: formData.strengths || 'Consistent practice & high focus.',
      areasForImprovement: formData.areasForImprovement || 'Pacing during final lap.',
      coachRemarks: formData.remarks || 'Great progress this month.',
      recordedDate: new Date().toISOString().slice(0, 10)
    };

    setRecords([newPerf, ...records]);
    setModal(false);
    addToast({ type: 'success', title: 'Rating Recorded', message: `Evaluation saved for ${targetStudent.fullName}.` });
  };

  return (
    <LayoutShell
      title="Monthly Performance Ratings & Evaluation"
      breadcrumb={[{ label: 'Coach' }, { label: 'Performance' }]}
      actions={
        <Button size="sm" onClick={() => setModal(true)} icon={<Plus className="w-4 h-4" />}>
          Record New Rating
        </Button>
      }
    >
      <Card header={<h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" /> Trainee Performance Logs</h3>}>
        <div className="space-y-4">
          {records.map(rec => (
            <div key={rec.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{rec.studentName}</h4>
                  <p className="text-[11px] text-slate-500">{rec.monthYear} • Recorded {rec.recordedDate}</p>
                </div>
                <div className="text-amber-500 font-bold text-sm">
                  {'★'.repeat(rec.rating)} <span className="text-slate-700">({rec.rating}/5)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400">Technical Skill</p>
                  <p className="font-bold text-slate-900 text-sm">{rec.technicalSkills}%</p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400">Stamina & Discipline</p>
                  <p className="font-bold text-slate-900 text-sm">{rec.staminaDiscipline}%</p>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-400">Teamwork</p>
                  <p className="font-bold text-slate-900 text-sm">{rec.teamwork}%</p>
                </div>
              </div>

              <p className="text-slate-700"><b>Strengths:</b> {rec.strengths}</p>
              <p className="text-slate-700"><b>Areas for Improvement:</b> {rec.areasForImprovement}</p>
              <p className="p-2.5 bg-blue-50/70 rounded-lg text-blue-900 font-medium italic">"{rec.coachRemarks}" — {rec.coachName}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Record Rating Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Record Monthly Trainee Evaluation">
        <form onSubmit={handleSavePerf} className="space-y-4">
          <Select
            label="Select Trainee"
            options={myStudents.map(s => ({ label: `${s.fullName} (${s.studentId})`, value: s.id }))}
            value={formData.studentId}
            onChange={e => setFormData({ ...formData, studentId: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Star Rating"
              options={[
                { label: '5 Stars (Outstanding)', value: '5' },
                { label: '4 Stars (Above Average)', value: '4' },
                { label: '3 Stars (Average)', value: '3' },
                { label: '2 Stars (Needs Work)', value: '2' },
                { label: '1 Star (Unsatisfactory)', value: '1' }
              ]}
              value={String(formData.rating)}
              onChange={e => setFormData({ ...formData, rating: Number(e.target.value) as any })}
            />
            <Input label="Month & Year" value={formData.monthYear} onChange={e => setFormData({ ...formData, monthYear: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Technical Skill (1-100)" type="number" value={formData.technicalSkills} onChange={e => setFormData({ ...formData, technicalSkills: Number(e.target.value) })} />
            <Input label="Stamina (1-100)" type="number" value={formData.staminaDiscipline} onChange={e => setFormData({ ...formData, staminaDiscipline: Number(e.target.value) })} />
            <Input label="Teamwork (1-100)" type="number" value={formData.teamwork} onChange={e => setFormData({ ...formData, teamwork: Number(e.target.value) })} />
          </div>
          <Input label="Key Strengths" value={formData.strengths} onChange={e => setFormData({ ...formData, strengths: e.target.value })} placeholder="Fast freestyle stroke..." />
          <Input label="Areas for Improvement" value={formData.areasForImprovement} onChange={e => setFormData({ ...formData, areasForImprovement: e.target.value })} placeholder="Breath control..." />
          <div>
            <label className="text-xs font-semibold text-slate-700">Coach Remarks</label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm mt-1"
              placeholder="Overall coach assessment..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">Save Rating</Button>
          </div>
        </form>
      </Modal>
    </LayoutShell>
  );
};
