import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { INITIAL_STUDENTS, INITIAL_COACHES } from '../../mock-data/msrf-data';
import { Student, Coach } from '../../types';
import { UserCheck, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const StudentAssignmentPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [coaches] = useState<Coach[]>(INITIAL_COACHES);
  const [selectedCoachId, setSelectedCoachId] = useState<string>(INITIAL_COACHES[0].id);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState(false);

  const { addToast } = useNotifications();

  const selectedCoach = coaches.find(c => c.id === selectedCoachId) || coaches[0];
  const assignedToSelected = students.filter(s => s.coachId === selectedCoach.id);

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase()) ||
    (s.category && s.category.toLowerCase().includes(search.toLowerCase())) ||
    (s.course && s.course.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleConfirmReassign = () => {
    setStudents(prev =>
      prev.map(s =>
        selectedStudentIds.includes(s.id)
          ? { ...s, coachId: selectedCoach.id, coachName: selectedCoach.fullName }
          : s
      )
    );
    addToast({
      type: 'success',
      title: 'Trainees Reassigned',
      message: `${selectedStudentIds.length} trainees successfully assigned to ${selectedCoach.fullName}.`
    });
    setSelectedStudentIds([]);
    setConfirmModal(false);
  };

  return (
    <LayoutShell
      title="Student Coach Assignment Hub"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Student Assignments' }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side (Col 7): Student Roster for Selection */}
        <div className="lg:col-span-7 space-y-4">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <h3 className="font-bold text-slate-900 text-sm">Select Trainees to Assign / Reassign</h3>
                <span className="text-xs font-semibold text-blue-600">{selectedStudentIds.length} Selected</span>
              </div>
            }
          >
            <div className="mb-4">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search trainees by name or course..."
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100 pr-1">
              {filteredStudents.map(st => {
                const isSelected = selectedStudentIds.includes(st.id);
                return (
                  <div
                    key={st.id}
                    onClick={() => toggleSelectStudent(st.id)}
                    className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/80 border border-blue-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <img src={st.photo} alt={st.fullName} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{st.fullName}</p>
                        <p className="text-[11px] text-slate-500">{st.studentId} • {st.course}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold text-slate-600">Current Coach:</p>
                      <p className="text-xs font-bold text-blue-600">{st.coachName}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedStudentIds.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Ready to transfer {selectedStudentIds.length} students</span>
                <Button
                  size="sm"
                  onClick={() => setConfirmModal(true)}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Assign to {selectedCoach.fullName.split(' ')[0]}
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Side (Col 5): Selected Coach Workload Matrix */}
        <div className="lg:col-span-5 space-y-6">
          <Card header={<h3 className="font-bold text-slate-900 text-sm">Target Coach Workload Matrix</h3>}>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Select Target Coach</label>
                <select
                  value={selectedCoachId}
                  onChange={e => setSelectedCoachId(e.target.value)}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  {coaches.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} — {c.specialization} ({c.assignedStudentsCount}/{c.capacity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Coach Profile Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <img src={selectedCoach.photo} alt={selectedCoach.fullName} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedCoach.fullName}</h4>
                    <p className="text-xs font-semibold text-blue-600">{selectedCoach.specialization}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Capacity Utilization:</span>
                    <span>{assignedToSelected.length} / {selectedCoach.capacity} Capacity</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600"
                      style={{ width: `${(assignedToSelected.length / selectedCoach.capacity) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <p className="text-[10px] text-slate-400">Rating</p>
                    <p className="font-black text-amber-500">★ {selectedCoach.monthlyRating}</p>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <p className="text-[10px] text-slate-400">Attendance Avg</p>
                    <p className="font-black text-emerald-600">{selectedCoach.attendanceAvg}%</p>
                  </div>
                </div>
              </div>

              {/* Currently Assigned List */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Currently Assigned Trainees ({assignedToSelected.length})</h4>
                <div className="max-h-60 overflow-y-auto space-y-1.5">
                  {assignedToSelected.map(st => (
                    <div key={st.id} className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{st.fullName}</span>
                      <span className="text-[11px] text-slate-400">{st.studentId}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Confirm Trainee Reassignment">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to reassign <b>{selectedStudentIds.length} trainees</b> to <b>{selectedCoach.fullName}</b>?
          </p>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
            This will update the trainee's primary coach record and notify the coach portal instantly.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmModal(false)}>Cancel</Button>
            <Button onClick={handleConfirmReassign}>Confirm Reassignment</Button>
          </div>
        </div>
      </Modal>
    </LayoutShell>
  );
};
