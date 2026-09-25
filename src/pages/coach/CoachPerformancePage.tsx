import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_STUDENTS, INITIAL_COACHES, INITIAL_PERFORMANCE, DEFAULT_15_CATEGORIES } from '../../mock-data/msrf-data';
import { PerformanceRecord, RatingStar } from '../../types';
import { Award, Plus, FileDown, Edit, Search, UserCheck, Star, ArrowLeft, Check, CheckCircle2, Trash2, Lock } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { PlayerDevelopmentReportPDF } from '../../components/ui/PlayerDevelopmentReportPDF';
import { formatDate } from '../../utils/format';

export const CoachPerformancePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const coach = INITIAL_COACHES.find(c => c.email === user?.email) || INITIAL_COACHES[0];
  const myStudents = INITIAL_STUDENTS.filter(s => s.coachId === coach.id || s.coachName === coach.fullName);

  const [records, setRecords] = useState<PerformanceRecord[]>(INITIAL_PERFORMANCE);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [pdfPrintRecord, setPdfPrintRecord] = useState<PerformanceRecord | null>(null);
  const [viewDetailRecord, setViewDetailRecord] = useState<PerformanceRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 7-Day Edit & Delete Restriction Helper
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<PerformanceRecord | null>(null);

  // 7-Day Edit & Delete Restriction Helper
  const isEditableWithin7Days = (recordedDate?: string): boolean => {
    if (!recordedDate) return true;
    const recDate = new Date(recordedDate);
    const today = new Date();
    recDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - recDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  const handleConfirmDeleteRecord = () => {
    if (!deleteConfirmRecord) return;
    setRecords(prev => prev.filter(r => r.id !== deleteConfirmRecord.id));
    addToast({
      type: 'success',
      title: 'Report Deleted',
      message: `Performance rating report for ${deleteConfirmRecord.studentName} deleted successfully.`
    });
    setDeleteConfirmRecord(null);
  };

  // Spacious Form State matching Image 2
  const [formData, setFormData] = useState({
    studentId: myStudents[0]?.id || INITIAL_STUDENTS[0].id,
    reportPeriod: 'Monthly Evaluation - Sep 2026',
    recordedDate: new Date().toISOString().slice(0, 10),
    position: 'Central Midfielder',
    dob: '2012-05-14',
    age: '14',
    strongFoot: 'Right' as 'Right' | 'Left' | 'Both',
    strengths: '1. Outstanding ball control & first touch.\n2. Excellent tactical positioning and field vision.\n3. High work rate during high-press situations.',
    areasForImprovement: '1. Fine-tune weak-foot passing under pressure.\n2. Explosive sprint acceleration in final third.',
    developmentGoals: ['Improve weak foot', 'Improve first touch', 'Improve tactical awareness'],
    customGoal: 'Achieve sub-58s 100m sprint and high pass completion rate in match play.',
    coachRemarks: 'Demonstrates great dedication, high tactical discipline, and strong team leadership during match play.',
    overallRating: 5 as RatingStar,
    skillAssessments: DEFAULT_15_CATEGORIES.map(cat => ({
      category: cat,
      rating: 4,
      comments: 'Consistently high technical execution'
    }))
  });

  const handleOpenCreatePage = () => {
    setEditingRecordId(null);
    const targetStudent = myStudents[0] || INITIAL_STUDENTS[0];
    setFormData({
      studentId: targetStudent.id,
      reportPeriod: 'Monthly Evaluation - Sep 2026',
      recordedDate: new Date().toISOString().slice(0, 10),
      position: 'Central Midfielder',
      dob: '2012-05-14',
      age: '14',
      strongFoot: 'Right',
      strengths: '1. Great work ethic.\n2. High tactical discipline.',
      areasForImprovement: '1. Weak foot precision.',
      developmentGoals: ['Improve weak foot', 'Improve first touch'],
      customGoal: '',
      coachRemarks: 'Showing continuous tactical improvement in match play.',
      overallRating: 5,
      skillAssessments: DEFAULT_15_CATEGORIES.map(cat => ({
        category: cat,
        rating: 4,
        comments: 'Consistently solid execution'
      }))
    });
    setViewMode('create');
  };

  const handleOpenEditPage = (rec: PerformanceRecord) => {
    setEditingRecordId(rec.id);
    setFormData({
      studentId: rec.studentId,
      reportPeriod: rec.reportPeriod || rec.monthYear || 'Monthly Evaluation - Sep 2026',
      recordedDate: rec.recordedDate,
      position: rec.position || 'Central Midfielder',
      dob: rec.dob || '2012-05-14',
      age: rec.age || '14',
      strongFoot: rec.strongFoot || 'Right',
      strengths: rec.strengths,
      areasForImprovement: rec.areasForImprovement,
      developmentGoals: rec.developmentGoals || ['Improve weak foot', 'Improve first touch'],
      customGoal: rec.customGoal || '',
      coachRemarks: rec.coachRemarks,
      overallRating: rec.overallRating || rec.rating || 4,
      skillAssessments: rec.skillAssessments && rec.skillAssessments.length > 0
        ? rec.skillAssessments.map(sa => ({ category: sa.category, rating: sa.rating, comments: sa.comments || '' }))
        : DEFAULT_15_CATEGORIES.map(cat => ({
            category: cat,
            rating: rec.overallRating || rec.rating || 4,
            comments: 'Good progress'
          }))
    });
    setViewMode('edit');
  };

  const handleCategoryRatingChange = (idx: number, rating: number) => {
    const updated = [...formData.skillAssessments];
    updated[idx] = { ...updated[idx], rating };
    setFormData({ ...formData, skillAssessments: updated });
  };

  const handleCategoryCommentChange = (idx: number, comments: string) => {
    const updated = [...formData.skillAssessments];
    updated[idx] = { ...updated[idx], comments };
    setFormData({ ...formData, skillAssessments: updated });
  };

  const handleGoalToggle = (goal: string) => {
    if (formData.developmentGoals.includes(goal)) {
      setFormData({
        ...formData,
        developmentGoals: formData.developmentGoals.filter(g => g !== goal)
      });
    } else {
      setFormData({
        ...formData,
        developmentGoals: [...formData.developmentGoals, goal]
      });
    }
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = INITIAL_STUDENTS.find(s => s.id === formData.studentId) || myStudents[0] || INITIAL_STUDENTS[0];

    if (editingRecordId) {
      setRecords(prev => prev.map(r => {
        if (r.id === editingRecordId) {
          return {
            ...r,
            studentId: targetStudent.id,
            studentName: targetStudent.fullName,
            reportPeriod: formData.reportPeriod,
            recordedDate: formData.recordedDate,
            position: formData.position,
            dob: formData.dob,
            age: formData.age,
            strongFoot: formData.strongFoot,
            strengths: formData.strengths,
            areasForImprovement: formData.areasForImprovement,
            developmentGoals: formData.developmentGoals,
            customGoal: formData.customGoal,
            coachRemarks: formData.coachRemarks,
            overallRating: formData.overallRating,
            rating: formData.overallRating,
            skillAssessments: formData.skillAssessments
          };
        }
        return r;
      }));

      addToast({
        type: 'success',
        title: 'Player Development Report Updated',
        message: `Evaluation report saved for ${targetStudent.fullName}.`
      });
    } else {
      const newRecord: PerformanceRecord = {
        id: `perf-${Date.now()}`,
        studentId: targetStudent.id,
        studentName: targetStudent.fullName,
        coachId: coach.id,
        coachName: coach.fullName,
        monthYear: formData.reportPeriod,
        reportPeriod: formData.reportPeriod,
        recordedDate: formData.recordedDate,
        position: formData.position,
        dob: formData.dob,
        age: formData.age,
        strongFoot: formData.strongFoot,
        strengths: formData.strengths,
        areasForImprovement: formData.areasForImprovement,
        developmentGoals: formData.developmentGoals,
        customGoal: formData.customGoal,
        coachRemarks: formData.coachRemarks,
        overallRating: formData.overallRating,
        rating: formData.overallRating,
        skillAssessments: formData.skillAssessments
      };

      setRecords([newRecord, ...records]);
      addToast({
        type: 'success',
        title: 'Player Development Report Created',
        message: `Evaluation report logged for ${targetStudent.fullName}.`
      });
    }

    setViewMode('list');
  };

  const myRecords = records.filter(r => r.coachId === coach.id || r.coachName === coach.fullName);
  const filteredRecords = myRecords.filter(r =>
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.position && r.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const standardGoalsList = [
    'Improve weak foot',
    'Improve first touch',
    'Improve passing accuracy',
    'Improve tactical awareness',
    'Improve finishing',
    'Improve fitness',
    'Improve communication'
  ];

  // ==========================================
  // RENDER DEDICATED CREATE / EDIT FORM PAGE
  // ==========================================
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <LayoutShell
        title={viewMode === 'create' ? "New Player Development Report (15-Skill Evaluation)" : "Edit Player Development Report"}
        breadcrumb={[{ label: 'Coach' }, { label: 'Performance' }, { label: viewMode === 'create' ? 'New Report' : 'Edit Report' }]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setViewMode('list')} icon={<ArrowLeft className="w-4 h-4" />}>
              Back to Reports
            </Button>
            <Button size="sm" onClick={handleSaveReport} className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold">
              Save Player Development Report
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveReport} className="space-y-6 max-w-5xl mx-auto pb-12 text-xs">
          
          {/* Section 1: Player Information */}
          <Card header={<h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2"><Award className="w-4 h-4 text-blue-600" /> 1. Player & Report Information</h3>}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Select
                label="Select Player"
                options={INITIAL_STUDENTS.map(s => ({ label: `${s.fullName} (${s.studentId})`, value: s.id }))}
                value={formData.studentId}
                onChange={e => {
                  const targetStudent = INITIAL_STUDENTS.find(s => s.id === e.target.value);
                  const dob = targetStudent?.dateOfBirth || '2012-05-14';
                  const birthYear = new Date(dob).getFullYear();
                  const age = (new Date().getFullYear() - birthYear).toString();
                  setFormData({ ...formData, studentId: e.target.value, dob, age });
                }}
              />
              <Input
                label="Report Period"
                value={formData.reportPeriod}
                onChange={e => setFormData({ ...formData, reportPeriod: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                placeholder="Monthly Evaluation - Sep 2026"
              />
              <Input
                label="Evaluation Date"
                type="date"
                value={formData.recordedDate}
                onChange={e => setFormData({ ...formData, recordedDate: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
              <Input
                label="Player Position"
                value={formData.position}
                onChange={e => setFormData({ ...formData, position: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                placeholder="Central Midfielder..."
              />
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Date of Birth (Read Only)</label>
                <input
                  type="text"
                  value={formData.dob}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Age (Read Only)</label>
                <input
                  type="text"
                  value={`${formData.age} Years`}
                  readOnly
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Strong Foot Cards */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Strong Foot</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Right Foot', value: 'Right' },
                  { label: 'Left Foot', value: 'Left' },
                  { label: 'Both Feet', value: 'Both' }
                ].map((footOption) => (
                  <button
                    key={footOption.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, strongFoot: footOption.value as any })}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-between transition-all ${
                      formData.strongFoot === footOption.value
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>{footOption.label}</span>
                    {formData.strongFoot === footOption.value && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Section 2: 15-Skill Performance Assessment */}
          <Card header={<h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">2. 15-Skill Performance Assessment (Rating 1 - 5 & Observations)</h3>}>
            <div className="space-y-3">
              {formData.skillAssessments.map((sa, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center hover:border-slate-300 transition-colors">
                  <div className="lg:col-span-4">
                    <span className="text-[10px] font-black text-blue-600 font-mono">0{idx + 1}.</span>
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wide inline-block ml-1">
                      {sa.category}
                    </h4>
                  </div>

                  {/* Big clear 1-5 rating buttons (numbers only, no star text) */}
                  <div className="lg:col-span-4 flex items-center justify-start lg:justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(star => {
                      const isActive = sa.rating === star;
                      const activeColors = [
                        '', 
                        'bg-rose-500 text-white border-rose-600',
                        'bg-amber-500 text-white border-amber-600',
                        'bg-yellow-500 text-slate-900 border-yellow-600',
                        'bg-blue-600 text-white border-blue-700',
                        'bg-emerald-600 text-white border-emerald-700'
                      ];
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleCategoryRatingChange(idx, star)}
                          className={`w-9 h-9 rounded-xl font-black text-xs transition-all flex items-center justify-center ${
                            isActive
                              ? `${activeColors[star]} shadow-md scale-105 ring-2 ring-offset-1 ring-blue-500`
                              : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {star}
                        </button>
                      );
                    })}
                  </div>

                  {/* Wide Clear Input Field */}
                  <div className="lg:col-span-4">
                    <input
                      type="text"
                      value={sa.comments || ''}
                      onChange={e => handleCategoryCommentChange(idx, e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                      placeholder="Add specific skill observation..."
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Section 3: Strengths, Areas for Improvement & Development Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card header={<h3 className="font-extrabold text-slate-900 text-sm">3. Player Strengths</h3>}>
              <textarea
                rows={5}
                value={formData.strengths}
                onChange={e => setFormData({ ...formData, strengths: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs font-medium text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1. Outstanding ball control & first touch..."
              />
            </Card>

            <Card header={<h3 className="font-extrabold text-slate-900 text-sm">4. Areas For Improvement</h3>}>
              <textarea
                rows={5}
                value={formData.areasForImprovement}
                onChange={e => setFormData({ ...formData, areasForImprovement: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs font-medium text-slate-900 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1. Weak foot passing under pressure..."
              />
            </Card>
          </div>

          {/* Section 4: Development Goals Checkbox Cards */}
          <Card header={<h3 className="font-extrabold text-slate-900 text-sm">5. Target Development Goals</h3>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              {Array.from(new Set([...standardGoalsList, ...formData.developmentGoals])).map((goal, i) => {
                const isSelected = formData.developmentGoals.includes(goal);
                return (
                  <div
                    key={i}
                    onClick={() => handleGoalToggle(goal)}
                    className={`p-3 rounded-xl border cursor-pointer font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{goal}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded accent-blue-600 shrink-0"
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Add Additional Custom Goal</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.customGoal}
                  onChange={e => setFormData({ ...formData, customGoal: e.target.value })}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (formData.customGoal.trim() && !formData.developmentGoals.includes(formData.customGoal.trim())) {
                        setFormData({
                          ...formData,
                          developmentGoals: [...formData.developmentGoals, formData.customGoal.trim()],
                          customGoal: ''
                        });
                      }
                    }
                  }}
                  placeholder="Enter custom player development goal and press Add Goal..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (formData.customGoal.trim() && !formData.developmentGoals.includes(formData.customGoal.trim())) {
                      setFormData({
                        ...formData,
                        developmentGoals: [...formData.developmentGoals, formData.customGoal.trim()],
                        customGoal: ''
                      });
                    }
                  }}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Goal
                </Button>
              </div>
            </div>
          </Card>

          {/* Section 5: Coach Remarks & Overall Rating */}
          <Card header={<h3 className="font-extrabold text-slate-900 text-sm">6. Overall Coach Assessment</h3>}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Coach's Comments / Summary
                </label>
                <textarea
                  rows={3}
                  value={formData.coachRemarks}
                  onChange={e => setFormData({ ...formData, coachRemarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Overall player performance summary..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Overall Rating (1 - 5 Stars)
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, overallRating: rating as RatingStar })}
                      className={`px-5 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-1.5 ${
                        formData.overallRating === rating
                          ? 'bg-amber-400 text-slate-900 shadow-md ring-2 ring-amber-500 scale-105'
                          : 'bg-slate-50 border border-slate-300 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${formData.overallRating === rating ? 'fill-slate-900' : 'text-slate-400'}`} />
                      <span>{rating}.0</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Bottom Fixed Action Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setViewMode('list')} icon={<ArrowLeft className="w-4 h-4" />}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 h-11 text-xs">
              {viewMode === 'edit' ? "Update Player Development Report" : "Submit Player Development Report"}
            </Button>
          </div>

        </form>
      </LayoutShell>
    );
  }

  // ==========================================
  // RENDER TABLE LISTING VIEW
  // ==========================================
  return (
    <LayoutShell
      title="Player Development & Performance Rating Reports"
      breadcrumb={[{ label: 'Coach' }, { label: 'Performance Reports' }]}
      actions={
        <Button size="sm" onClick={handleOpenCreatePage} icon={<Plus className="w-4 h-4" />}>
          Create Player Development Report
        </Button>
      }
    >
      <div className="space-y-6">

        {/* Filter Bar */}
        <Card header={<h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" /> Search Player Evaluation Reports</h3>}>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by player name or position..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 h-10 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Card>

        {/* Reports Table List */}
        <Card header={
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
            Submitted Player Development Reports ({filteredRecords.length})
          </h3>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Player Name</th>
                  <th className="py-3.5 px-4">Position & Foot</th>
                  <th className="py-3.5 px-4">Evaluation Date</th>
                  <th className="py-3.5 px-4 text-center">Overall Rating</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredRecords.map(rec => {
                  const isEditable = isEditableWithin7Days(rec.recordedDate);
                  return (
                    <tr
                      key={rec.id}
                      onClick={() => setViewDetailRecord(rec)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {rec.studentName}
                        <p className="text-[10px] text-slate-400 font-mono font-normal">ID: {rec.studentId}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {rec.position || 'Attacking Mid'}
                        <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                          {rec.strongFoot || 'Right'} Foot
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatDate(rec.recordedDate)}
                        <p className="text-[10px] text-slate-400 font-normal">{rec.reportPeriod || rec.monthYear}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {rec.overallRating || rec.rating || 4}.0 / 5.0
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPdfPrintRecord(rec);
                            }}
                            className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Print PDF Report"
                          >
                            <FileDown className="w-4 h-4 text-emerald-600" />
                          </button>

                          {isEditable ? (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditPage(rec);
                                }}
                                className="p-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                title="Edit Player Report (Within 7 Days)"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmRecord(rec);
                                }}
                                className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                                title="Delete Player Report (Within 7 Days)"
                              >
                                <Trash2 className="w-4 h-4 text-rose-600" />
                              </button>
                            </>
                          ) : (
                            <span 
                              className="p-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed inline-flex items-center gap-1"
                              title="Locked - Evaluation reports older than 7 days cannot be edited or deleted"
                            >
                              <Lock className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* PRINT PORTAL FOR PLAYER DEVELOPMENT REPORT */}
      {pdfPrintRecord && (
        <PlayerDevelopmentReportPDF
          record={pdfPrintRecord}
          onClose={() => setPdfPrintRecord(null)}
        />
      )}

      {/* VIEW PREVIEW MODAL */}
      {viewDetailRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-4 text-xs shadow-2xl">
            <div className="bg-amber-400 p-4 rounded-xl text-slate-900 flex justify-between items-center font-black uppercase">
              <div>
                <h3 className="text-base">{viewDetailRecord.studentName}</h3>
                <p className="text-[10px] text-slate-900/80">Position: {viewDetailRecord.position || 'Forward'} | Strong Foot: {viewDetailRecord.strongFoot || 'Right'}</p>
              </div>
              <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs">
                Rating: {viewDetailRecord.overallRating || 5} / 5 ★
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-800">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-extrabold text-slate-900 mb-1">PLAYER STRENGTHS</p>
                <p className="whitespace-pre-line text-slate-700">{viewDetailRecord.strengths}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-extrabold text-slate-900 mb-1">AREAS FOR IMPROVEMENT</p>
                <p className="whitespace-pre-line text-slate-700">{viewDetailRecord.areasForImprovement}</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
              <p className="font-extrabold text-blue-900 mb-1">COACH'S COMMENTS / SUMMARY</p>
              <p className="italic text-blue-900">"{viewDetailRecord.coachRemarks}" — {viewDetailRecord.coachName}</p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setViewDetailRecord(null)}>Close</Button>
              <Button onClick={() => { setPdfPrintRecord(viewDetailRecord); setViewDetailRecord(null); }} icon={<FileDown className="w-4 h-4" />}>
                Print PDF Report
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL (SUPER ADMIN STYLE) */}
      {deleteConfirmRecord && (
        <Modal
          isOpen={!!deleteConfirmRecord}
          onClose={() => setDeleteConfirmRecord(null)}
          title="Confirm Delete Evaluation Report"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-700 leading-relaxed font-medium">
              Are you sure you want to permanently delete the player performance evaluation report for <b className="text-slate-900">{deleteConfirmRecord.studentName}</b> (Logged on {formatDate(deleteConfirmRecord.recordedDate)})?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-semibold">
              Warning: This action cannot be undone. The evaluation data will be removed.
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirmRecord(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmDeleteRecord}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                icon={<Trash2 className="w-4 h-4" />}
              >
                Delete Report Permanently
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </LayoutShell>
  );
};
