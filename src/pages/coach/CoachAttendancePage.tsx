import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_STUDENTS, INITIAL_COACHES, INITIAL_CATEGORIES, INITIAL_SESSION_REPORTS } from '../../mock-data/msrf-data';
import { 
  CalendarCheck, 
  CheckCircle2, 
  UserCheck, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Clock, 
  MapPin, 
  FileText, 
  Check, 
  Edit, 
  Search, 
  Filter, 
  Lock, 
  Printer,
  FileDown
} from 'lucide-react';
import { formatDate } from '../../utils/format';
import { useNotifications } from '../../context/NotificationContext';
import { SessionSplit, DailyTrainingSessionReport } from '../../types';
import { PrintPortal } from '../../components/ui/PrintPortal';
import { ReportHeader } from '../../components/ui/ReportHeader';
import logoImg from '../../assets/logo.png';

export const CoachAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const todayStr = new Date().toISOString().slice(0, 10);

  // Active Coach profile based on logged-in user
  const loggedInCoach = INITIAL_COACHES.find(c => c.email === user?.email) || INITIAL_COACHES[0];

  // Helper: Check if session date is within 7 days from today
  const isEditableWithin7Days = (dateStr: string): boolean => {
    const sessionDate = new Date(dateStr);
    const today = new Date();
    sessionDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - sessionDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  // Main Page View State: 'list' | 'form' | 'detail'
  const [pageView, setPageView] = useState<'list' | 'form' | 'detail'>('list');
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [selectedReportDetail, setSelectedReportDetail] = useState<DailyTrainingSessionReport | null>(null);
  const [selectedReportForPrint, setSelectedReportForPrint] = useState<DailyTrainingSessionReport | null>(null);
  const [pdfPrintModalOpen, setPdfPrintModalOpen] = useState(false);
  const [deleteSessionConfirm, setDeleteSessionConfirm] = useState<DailyTrainingSessionReport | null>(null);

  // Reports Store (Session reports list)
  const [reportsList, setReportsList] = useState<DailyTrainingSessionReport[]>(INITIAL_SESSION_REPORTS);

  // List Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');

  // 3-Step Form Tab State: 'setup' | 'session-form' | 'mark-attendance'
  const [activeTab, setActiveTab] = useState<'setup' | 'session-form' | 'mark-attendance'>('setup');

  // FORM STATE: Step 1 Setup
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Youth Football Squad (U-13)']);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const availableCoaches = INITIAL_COACHES.filter(c => c.fullName !== loggedInCoach.fullName && c.email !== user?.email);
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>([availableCoaches[0]?.id || 'coach-2']);

  // Check if session date already exists for logged-in coach (Only 1 attendance permitted per day)
  const isDuplicateDate = reportsList.some(r => r.date === selectedDate && r.id !== editingReportId && (r.loggedByCoachName === loggedInCoach.fullName || r.assignedCoaches?.includes(loggedInCoach.fullName)));

  // FORM STATE: Step 2 Daily Training Session Form
  const [venue, setVenue] = useState<string>('Main Stadium Ground Pitch A');
  const [sessionTime, setSessionTime] = useState<string>('06:00 AM - 08:00 AM');
  const [dailyTopic, setDailyTopic] = useState<string>('Midfield Transition & Defensive Recovery');
  const [explanation, setExplanation] = useState<string>('Focus on organized press in the middle third and rapid transition upon turnover.');

  // Splits Loop State (Dynamic loop of splits)
  const [splits, setSplits] = useState<SessionSplit[]>([
    {
      id: 'sp-1',
      heading: 'Warmup & Dynamic Stretch',
      timeDoneMins: '15',
      explanation: 'Dynamic stretching, joint mobility, 4x50m acceleration sprints with agility ladder.'
    },
    {
      id: 'sp-2',
      heading: 'Rondo 4v2 Overload',
      timeDoneMins: '20',
      explanation: 'One-touch ball retention under high pressure. Goal of 15 consecutive passes.'
    },
    {
      id: 'sp-3',
      heading: 'Tactical Pressing Drill',
      timeDoneMins: '35',
      explanation: 'Half-pitch 7v7 pressing patterns and transition defense.'
    },
    {
      id: 'sp-4',
      heading: 'Cool Down & Core Work',
      timeDoneMins: '15',
      explanation: 'Low-intensity cooldown, static stretching and core plank holds.'
    }
  ]);

  const [fullSessionOverview, setFullSessionOverview] = useState<string>('Excellent energy and discipline. Defensive line maintained compact depth throughout the session.');

  // Trainees filtered by selected categories with smart fallback
  const rawFilteredStudents = INITIAL_STUDENTS.filter(s => {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.some(cat => {
      const cLower = cat.toLowerCase();
      const studentCatLower = (s.category || '').toLowerCase();
      const studentCourseLower = (s.course || '').toLowerCase();
      return (
        studentCatLower.includes(cLower) ||
        cLower.includes(studentCatLower) ||
        studentCourseLower.includes(cLower) ||
        cLower.includes(studentCourseLower) ||
        (cLower.includes('football') && (studentCatLower.includes('football') || studentCourseLower.includes('football')))
      );
    });
  });
  const filteredStudents = rawFilteredStudents.length > 0 ? rawFilteredStudents : INITIAL_STUDENTS;

  // FORM STATE: Step 3 Student Attendance status map
  const [studentAttendance, setStudentAttendance] = useState<Record<string, { status: 'Present' | 'Absent' | 'Informed'; remarks: string }>>(() => {
    const map: Record<string, { status: 'Present' | 'Absent' | 'Informed'; remarks: string }> = {};
    INITIAL_STUDENTS.forEach(s => {
      map[s.id] = { status: 'Present', remarks: '' };
    });
    return map;
  });

  // Selected coaches list + Logged in Coach
  const assignedCoachesList = [
    loggedInCoach,
    ...INITIAL_COACHES.filter(c => selectedCoachIds.includes(c.id))
  ];

  // STEP VALIDATION LOGIC
  const validateStep1 = (): boolean => {
    if (selectedCategories.length === 0) {
      addToast({ type: 'error', title: 'Category Required', message: 'Please select at least 1 Category to proceed.' });
      return false;
    }
    if (!selectedDate) {
      addToast({ type: 'error', title: 'Date Required', message: 'Please select a valid Session Date.' });
      return false;
    }
    if (isDuplicateDate) {
      addToast({
        type: 'error',
        title: 'Duplicate Session Date',
        message: `Attendance for ${formatDate(selectedDate)} has already been created. Only one attendance session can be created per day.`
      });
      return false;
    }
    if (!venue.trim()) {
      addToast({ type: 'error', title: 'Venue Required', message: 'Please enter the Session Venue Location.' });
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!dailyTopic.trim()) {
      addToast({ type: 'error', title: 'Daily Topic Required', message: 'Please enter the Daily Training Topic.' });
      return false;
    }
    if (!explanation.trim()) {
      addToast({ type: 'error', title: 'Explanation Required', message: 'Please enter the Session Explanation.' });
      return false;
    }
    return true;
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) {
      setActiveTab('session-form');
    }
  };

  const handleNextFromStep2 = () => {
    if (validateStep1() && validateStep2()) {
      setActiveTab('mark-attendance');
    }
  };

  const handleTabClick = (targetTab: 'setup' | 'session-form' | 'mark-attendance') => {
    if (targetTab === 'setup') {
      setActiveTab('setup');
    } else if (targetTab === 'session-form') {
      if (validateStep1()) {
        setActiveTab('session-form');
      }
    } else if (targetTab === 'mark-attendance') {
      if (validateStep1() && validateStep2()) {
        setActiveTab('mark-attendance');
      }
    }
  };

  // Quick Action: Mark All Trainees Present
  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: 'Present' | 'Absent' | 'Informed'; remarks: string }> = { ...studentAttendance };
    filteredStudents.forEach(st => {
      updated[st.id] = {
        status: 'Present',
        remarks: updated[st.id]?.remarks || ''
      };
    });
    setStudentAttendance(updated);
    addToast({
      type: 'success',
      title: 'Marked All Trainees Present',
      message: `Set attendance to Present for all ${filteredStudents.length} trainees.`
    });
  };

  // Reset Form for New Session
  const handleAddNewSession = () => {
    setEditingReportId(null);
    setSelectedCategories(['Football Excellence']);
    setSelectedDate(todayStr);
    setSelectedCoachIds([availableCoaches[0]?.id || 'coach-2']);
    setVenue('Main Stadium Ground Pitch A');
    setSessionTime('06:00 AM - 08:00 AM');
    setDailyTopic('Midfield Transition & Tactical Positioning');
    setExplanation('Focus on organized pressing in the middle third and quick transition.');
    setSplits([
      { id: 'sp-1', heading: 'Warmup & Agility', timeDoneMins: '15', explanation: 'Dynamic warmup and agility sprints.' },
      { id: 'sp-2', heading: 'Possession Drill', timeDoneMins: '25', explanation: 'One-touch retention drill.' }
    ]);
    setFullSessionOverview('Good session energy and focus on tactical discipline.');
    
    const initialAtt: Record<string, { status: 'Present' | 'Absent' | 'Informed'; remarks: string }> = {};
    INITIAL_STUDENTS.forEach(s => {
      initialAtt[s.id] = { status: 'Present', remarks: '' };
    });
    setStudentAttendance(initialAtt);

    setActiveTab('setup');
    setPageView('form');
  };

  // Populate Form for Editing Session (Within 7 Days)
  const handleEditSession = (report: DailyTrainingSessionReport) => {
    if (!isEditableWithin7Days(report.date)) {
      addToast({
        type: 'error',
        title: 'Session Locked',
        message: 'This session is older than 7 days and cannot be edited.'
      });
      return;
    }

    setEditingReportId(report.id);
    setSelectedCategories(report.categories.length > 0 ? report.categories : ['Football Excellence']);
    setSelectedDate(report.date);
    setVenue(report.venue);
    setSessionTime(report.time);
    setDailyTopic(report.dailyTopic);
    setExplanation(report.explanation);
    setSplits(report.splits && report.splits.length > 0 ? report.splits : [
      { id: 'sp-1', heading: 'Warmup', timeDoneMins: '15', explanation: 'Dynamic stretch' }
    ]);
    setFullSessionOverview(report.fullSessionOverview || '');
    
    if (report.studentAttendance) {
      const attMap: Record<string, { status: 'Present' | 'Absent' | 'Informed'; remarks: string }> = {};
      Object.keys(report.studentAttendance).forEach(key => {
        attMap[key] = {
          status: report.studentAttendance[key].status,
          remarks: report.studentAttendance[key].remarks || ''
        };
      });
      setStudentAttendance(attMap);
    }

    setActiveTab('setup');
    setPageView('form');
  };

  // Open Detail View by clicking row
  const handleViewReportDetail = (report: DailyTrainingSessionReport) => {
    setSelectedReportDetail(report);
    setPageView('detail');
  };

  // Trigger Direct PDF Print from list row
  const handleDirectPrintPDF = (report: DailyTrainingSessionReport, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedReportForPrint(report);
    setPdfPrintModalOpen(true);
  };

  // Toggle category choice
  const toggleCategory = (catTitle: string) => {
    if (selectedCategories.includes(catTitle)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== catTitle));
      }
    } else {
      setSelectedCategories([...selectedCategories, catTitle]);
    }
  };

  // Toggle coach choice
  const toggleCoach = (coachId: string) => {
    if (selectedCoachIds.includes(coachId)) {
      setSelectedCoachIds(selectedCoachIds.filter(id => id !== coachId));
    } else {
      setSelectedCoachIds([...selectedCoachIds, coachId]);
    }
  };

  const handleConfirmDeleteSession = () => {
    if (!deleteSessionConfirm) return;
    setReportsList(prev => prev.filter(r => r.id !== deleteSessionConfirm.id));
    addToast({
      type: 'success',
      title: 'Session Report Deleted',
      message: `Training session report for ${formatDate(deleteSessionConfirm.date)} deleted successfully.`
    });
    setDeleteSessionConfirm(null);
  };

  // Split Loop Handlers
  const handleAddSplit = () => {
    const newId = `sp-${Date.now()}`;
    const newSplitNum = splits.length + 1;
    setSplits([
      ...splits,
      {
        id: newId,
        heading: `Split ${newSplitNum} Topic`,
        timeDoneMins: '15',
        explanation: 'Detailed tactical drill explanation...'
      }
    ]);
  };

  const handleRemoveSplit = (id: string) => {
    if (splits.length <= 1) {
      addToast({ type: 'warning', title: 'Cannot Delete', message: 'At least 1 split is required.' });
      return;
    }
    setSplits(splits.filter(sp => sp.id !== id));
  };

  const handleUpdateSplit = (id: string, field: keyof SessionSplit, value: string) => {
    setSplits(splits.map(sp => sp.id === id ? { ...sp, [field]: value } : sp));
  };

  // Student Attendance Handlers
  const handleStudentStatusChange = (id: string, status: 'Present' | 'Absent' | 'Informed') => {
    setStudentAttendance(prev => ({
      ...prev,
      [id]: { ...prev[id], status }
    }));
  };

  const handleStudentRemarksChange = (id: string, remarks: string) => {
    setStudentAttendance(prev => ({
      ...prev,
      [id]: { ...prev[id], remarks }
    }));
  };

  // Final Submit / Save Session Report
  const handleSubmitSession = () => {
    if (!validateStep1() || !validateStep2()) {
      return;
    }

    const autoCoachAttendance: Record<string, { status: 'Present' | 'Absent' | 'Informed'; remarks?: string }> = {};
    assignedCoachesList.forEach(c => {
      autoCoachAttendance[c.id] = { status: 'Present', remarks: 'Auto-marked Present' };
    });

    if (editingReportId) {
      // Update existing report
      setReportsList(prev => prev.map(rep => {
        if (rep.id === editingReportId) {
          return {
            ...rep,
            date: selectedDate,
            categories: selectedCategories,
            assignedCoaches: assignedCoachesList.map(c => c.fullName),
            attendanceCount: filteredStudents.length,
            venue,
            time: sessionTime,
            dailyTopic,
            explanation,
            splits,
            fullSessionOverview,
            studentAttendance,
            coachAttendance: autoCoachAttendance
          };
        }
        return rep;
      }));

      addToast({
        type: 'success',
        title: 'Session Report Updated!',
        message: `Changes saved for session date ${formatDate(selectedDate)}.`
      });
    } else {
      // Create new report
      const newReport: DailyTrainingSessionReport = {
        id: `report-${Date.now()}`,
        date: selectedDate,
        categories: selectedCategories,
        loggedByCoachName: loggedInCoach.fullName,
        assignedCoaches: assignedCoachesList.map(c => c.fullName),
        attendanceCount: filteredStudents.length,
        venue,
        time: sessionTime,
        weeklyTopic: '',
        dailyTopic,
        explanation,
        splits,
        fullSessionOverview,
        studentAttendance,
        coachAttendance: autoCoachAttendance,
        createdAt: new Date().toISOString()
      };

      setReportsList(prev => [newReport, ...prev]);

      addToast({
        type: 'success',
        title: 'New Session Report Added!',
        message: `Attendance and session plan logged for ${filteredStudents.length} trainees.`
      });
    }

    setPageView('list');
  };

  // Filtered Reports List for Management Table
  const filteredReportsList = reportsList.filter(r => {
    const matchesSearch = 
      r.dailyTopic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || r.categories.includes(categoryFilter);
    const matchesDate = !dateFilter || r.date === dateFilter;
    return matchesSearch && matchesCategory && matchesDate;
  });

  return (
    <LayoutShell
      title="Daily Attendance & Training Session Management"
      breadcrumb={[{ label: 'Coach' }, { label: 'Attendance' }]}
      actions={
        pageView === 'list' ? (
          <Button size="sm" onClick={handleAddNewSession} icon={<Plus className="w-4 h-4" />}>
            + Add New Attendance / Session
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setPageView('list')} icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Attendance List
          </Button>
        )
      }
    >
      <div className="space-y-6">

        {/* VIEW 1: LISTING & MANAGEMENT TABLE VIEW */}
        {pageView === 'list' && (
          <div className="space-y-6">
            {/* Coach Personal Profile & Attendance Status Banner */}
            <Card className="bg-slate-900 text-white border-slate-800 p-4 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img src={loggedInCoach.photo} alt={loggedInCoach.fullName} className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-white">{loggedInCoach.fullName}</h4>
                      <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        Logged-In Coach
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      Specialization: <span className="font-semibold text-slate-200">{loggedInCoach.specialization || 'Sports Mentor'}</span> • Coach Attendance: <span className="font-bold text-emerald-400">100% Present</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Today Attendance Status</p>
                    <p className="text-xs font-black text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Present (Auto-Logged)
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Metric Overview Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <p className="text-xs uppercase font-extrabold text-blue-700">Total Sessions Logged</p>
                <p className="text-2xl font-black text-blue-900 mt-1">{reportsList.length} Sessions</p>
              </Card>
              <Card className="bg-emerald-50 border-emerald-200">
                <p className="text-xs uppercase font-extrabold text-emerald-700">Participating Trainees</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">{INITIAL_STUDENTS.length} Trainees</p>
              </Card>
              <Card className="bg-amber-50 border-amber-200">
                <p className="text-xs uppercase font-extrabold text-amber-700">7-Day Edit Window</p>
                <p className="text-xs font-bold text-amber-900 mt-1">Sessions editable up to 7 days from logging</p>
              </Card>
            </div>

            {/* Filter & Search Bar - Pixel Perfect Alignment & SaaS Styling */}
            <Card header={<h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2"><Filter className="w-4 h-4 text-blue-600" /> Filter & Search Sessions</h3>}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Search Topic / Venue</label>
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search daily topic, venue..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 h-10 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <Select
                    label="Category Filter"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    options={[
                      { label: 'All Categories', value: 'ALL' },
                      ...INITIAL_CATEGORIES.map(c => ({ label: c.title, value: c.title }))
                    ]}
                    className="bg-slate-50 border-slate-300 rounded-xl h-10 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Filter Date</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={e => setDateFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 h-10 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                  />
                </div>
              </div>
            </Card>

            {/* Attendance & Session Records Table */}
            <Card header={
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                Submitted Attendance & Session Reports ({filteredReportsList.length})
              </h3>
            }>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Session Date</th>
                      <th className="py-3.5 px-4">Categories</th>
                      <th className="py-3.5 px-4">Daily Topic</th>
                      <th className="py-3.5 px-4">Venue & Time</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredReportsList.map(rep => {
                      const canEdit = isEditableWithin7Days(rep.date);
                      return (
                        <tr
                          key={rep.id}
                          onClick={() => handleViewReportDetail(rep)}
                          className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                          title="Click row to view session details"
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {formatDate(rep.date)}
                            <p className="text-[10px] text-slate-400 font-mono font-normal">{rep.id}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {rep.categories.map((c, i) => (
                                <span key={i} className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {rep.dailyTopic}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800">{rep.venue}</p>
                            <p className="text-[11px] text-slate-500">{rep.time}</p>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5" onClick={e => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={(e) => handleDirectPrintPDF(rep, e)}
                                className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                title="Print PDF"
                              >
                                <FileDown className="w-4 h-4 text-emerald-600" />
                              </button>
                              <button
                                type="button"
                                disabled={!canEdit}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (canEdit) handleEditSession(rep);
                                }}
                                className={`p-2 rounded-xl border transition-colors ${
                                  canEdit
                                    ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                                    : 'border-slate-200 bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed'
                                }`}
                                title={canEdit ? "Edit session report" : "Locked (Over 7 days old)"}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteSessionConfirm(rep);
                                  }}
                                  className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                                  title="Delete session report (Within 7 days)"
                                >
                                  <Trash2 className="w-4 h-4 text-rose-600" />
                                </button>
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
        )}

        {/* VIEW 2: ADD / EDIT 3-STEP ATTENDANCE FORM */}
        {pageView === 'form' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {editingReportId ? `Edit Attendance Session (${formatDate(selectedDate)})` : 'Add New Daily Attendance & Session'}
              </h3>
            </div>

            {/* Step Indicator Navigation Tabs */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                onClick={() => handleTabClick('setup')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-xs transition-all ${
                  activeTab === 'setup'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">1</span>
                <span className="truncate">Category & Coach Setup *</span>
              </button>

              <button
                onClick={() => handleTabClick('session-form')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-xs transition-all ${
                  activeTab === 'session-form'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">2</span>
                <span className="truncate">Daily Session Plan Form *</span>
              </button>

              <button
                onClick={() => handleTabClick('mark-attendance')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-xs transition-all ${
                  activeTab === 'mark-attendance'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">3</span>
                <span className="truncate">Mark Trainee Attendance *</span>
              </button>
            </div>

            {/* STEP 1: CATEGORY, DATE & COACH SELECTION */}
            {activeTab === 'setup' && (
              <Card
                header={
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        <CalendarCheck className="w-5 h-5 text-blue-600" /> Step 1: Session Details & Staffing
                      </h3>
                      <p className="text-xs text-slate-500">Select categories, attendance date, and participating coaches</p>
                    </div>
                    <Badge variant="blue">Logged-in Coach: {loggedInCoach.fullName}</Badge>
                  </div>
                }
              >
                <div className="space-y-6">
                  {/* 1. Category Selection (Multi-select) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Select Categories (Required *):
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {INITIAL_CATEGORIES.map(cat => {
                        const isSelected = selectedCategories.includes(cat.title);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.title)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            {cat.title}
                          </button>
                        );
                      })}
                    </div>
                    {selectedCategories.length === 0 && (
                      <p className="text-xs text-rose-500 font-bold mt-1.5">* At least 1 category is required.</p>
                    )}
                  </div>

                  {/* 2. Date Selection (Default Today - Max Today, No Future Dates Allowed!) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Session Date (Required * - Future Dates Disabled):
                      </label>
                      <input
                        type="date"
                        max={todayStr}
                        required
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        Selected: <span className="font-bold text-slate-700">{formatDate(selectedDate)}</span>
                      </p>
                      {isDuplicateDate && (
                        <div className="text-xs text-rose-600 font-extrabold mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-1.5">
                          ⚠️ Attendance for {formatDate(selectedDate)} has already been created. Only 1 attendance report per day is permitted.
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Venue Location (Required *):
                      </label>
                      <input
                        type="text"
                        required
                        value={venue}
                        onChange={e => setVenue(e.target.value)}
                        placeholder="e.g. Main Stadium Ground Pitch A"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* 3. Coaches Selection (Multi-select, EXCLUDES logged-in coach name) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Select Additional Coaches (Dropdown Multi-Select):
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {availableCoaches.map(c => {
                        const isChecked = selectedCoachIds.includes(c.id);
                        return (
                          <div
                            key={c.id}
                            onClick={() => toggleCoach(c.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                              isChecked
                                ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <img src={c.photo} alt={c.fullName} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                            <div className="flex-1 truncate">
                              <p className="font-bold text-xs">{c.fullName}</p>
                              <p className="text-[10px] text-slate-500 truncate">{c.specialization || 'Sports Coach'}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 pointer-events-none"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <Button onClick={handleNextFromStep1} disabled={isDuplicateDate} icon={<ArrowRight className="w-4 h-4" />}>
                      Continue to Daily Session Form
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* STEP 2: DAILY TRAINING SESSION FORM */}
            {activeTab === 'session-form' && (
              <div className="space-y-6">
                <Card
                  header={
                    <div className="flex items-center justify-between w-full">
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-500" /> Step 2: Daily Training Session Plan (Form)
                      </h3>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('setup')} icon={<ArrowLeft className="w-3.5 h-3.5" />}>
                          Back
                        </Button>
                        <Button size="sm" onClick={handleNextFromStep2} icon={<ArrowRight className="w-3.5 h-3.5" />}>
                          Next: Mark Trainee Attendance
                        </Button>
                      </div>
                    </div>
                  }
                >
                  <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 space-y-6">
                    {/* Top Info Cards Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* COACH NAME Box */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-400 flex items-center justify-center text-slate-900 font-extrabold shrink-0 shadow-xs">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">COACH NAME</p>
                          <p className="text-sm font-black text-slate-900 mt-0.5">{loggedInCoach.fullName}</p>
                        </div>
                      </div>

                      {/* ATTENDANCE Box */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-400 flex items-center justify-center text-slate-900 font-extrabold shrink-0 shadow-xs">
                          <CalendarCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">ATTENDANCE</p>
                          <p className="text-sm font-black text-slate-900 mt-0.5">{filteredStudents.length} Trainees Enrolled</p>
                        </div>
                      </div>

                      {/* VENUE & TIME Box */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-400 flex items-center justify-center text-slate-900 font-extrabold shrink-0 shadow-xs">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">VENUE & TIME</p>
                            <div className="grid grid-cols-2 gap-2 mt-0.5">
                              <input
                                type="text"
                                value={venue}
                                onChange={e => setVenue(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-bold text-slate-900"
                                placeholder="Venue"
                              />
                              <input
                                type="text"
                                value={sessionTime}
                                onChange={e => setSessionTime(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs font-bold text-slate-900"
                                placeholder="Time"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DAILY TOPIC & EXPLANATION CARD */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1">
                          DAILY TOPIC (Required *)
                        </label>
                        <input
                          type="text"
                          required
                          value={dailyTopic}
                          onChange={e => setDailyTopic(e.target.value)}
                          placeholder="Enter daily training topic"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1">
                          EXPLANATION (Required *)
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={explanation}
                          onChange={e => setExplanation(e.target.value)}
                          placeholder="Session explanation and drill objectives..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* SPLITS SECTION (DYNAMIC LOOP - COACH CAN ADD MORE IF NEEDED) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500" /> Dynamic Session Splits Loop ({splits.length} Splits)
                        </h4>
                        <Button size="sm" onClick={handleAddSplit} icon={<Plus className="w-3.5 h-3.5" />} className="bg-amber-400 text-slate-900 hover:bg-amber-500 border-none font-extrabold">
                          Add Split
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {splits.map((sp, idx) => (
                          <div key={sp.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 relative">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center shadow-2xs">
                                  {idx + 1}
                                </span>
                                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                                  SPLIT {idx + 1}
                                </span>
                              </div>
                              {splits.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSplit(sp.id)}
                                  className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                                  title="Delete Split"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                              <div className="md:col-span-4">
                                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                                  HEADING
                                </label>
                                <input
                                  type="text"
                                  value={sp.heading}
                                  onChange={e => handleUpdateSplit(sp.id, 'heading', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900"
                                  placeholder="e.g. Warmup & Agility"
                                />
                              </div>

                              <div className="md:col-span-3">
                                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                                  TIME DONE (MINS)
                                </label>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    value={sp.timeDoneMins}
                                    onChange={e => handleUpdateSplit(sp.id, 'timeDoneMins', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900"
                                  />
                                  <span className="text-[11px] font-bold text-slate-400">(mins)</span>
                                </div>
                              </div>

                              <div className="md:col-span-5">
                                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                                  EXPLANATION
                                </label>
                                <input
                                  type="text"
                                  value={sp.explanation}
                                  onChange={e => handleUpdateSplit(sp.id, 'explanation', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900"
                                  placeholder="Drill details..."
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FULL SESSION OVERVIEW */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1">
                        FULL SESSION OVERVIEW
                      </label>
                      <textarea
                        rows={3}
                        value={fullSessionOverview}
                        onChange={e => setFullSessionOverview(e.target.value)}
                        placeholder="Enter overall summary and player tactical observations..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                    <Button variant="outline" onClick={() => setActiveTab('setup')} icon={<ArrowLeft className="w-4 h-4" />}>
                      Back to Setup
                    </Button>
                    <Button onClick={handleNextFromStep2} icon={<ArrowRight className="w-4 h-4" />}>
                      Continue to Mark Attendance
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* STEP 3: MARK STUDENT ATTENDANCE */}
            {activeTab === 'mark-attendance' && (
              <div className="space-y-6">
                <Card
                  header={
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-emerald-600" /> Trainee Attendance List
                        </h3>
                        <p className="text-xs text-slate-500">
                          Category: {selectedCategories.join(', ')} ({filteredStudents.length} Trainees)
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleMarkAllPresent}
                          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-extrabold"
                        >
                          Mark All Present
                        </Button>
                        <Badge variant="blue">Date: {formatDate(selectedDate)}</Badge>
                      </div>
                    </div>
                  }
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider">
                          <th className="py-3 px-3">Trainee Name</th>
                          <th className="py-3 px-3">Student ID</th>
                          <th className="py-3 px-3">Category</th>
                          <th className="py-3 px-3">Attendance Toggle</th>
                          <th className="py-3 px-3">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filteredStudents.map(st => {
                          const rec = studentAttendance[st.id] || { status: 'Present', remarks: '' };
                          return (
                            <tr key={st.id} className="hover:bg-slate-50">
                              <td className="py-3 px-3 font-bold text-slate-900">
                                <div className="flex items-center gap-2.5">
                                  <img src={st.photo} alt={st.fullName} className="w-7 h-7 rounded-full object-cover" />
                                  <span>{st.fullName}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-500">{st.studentId}</td>
                              <td className="py-3 px-3 text-slate-600 font-semibold">{st.category || 'Academy'}</td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleStudentStatusChange(st.id, 'Present')}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                      rec.status === 'Present'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    Present
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStudentStatusChange(st.id, 'Absent')}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                      rec.status === 'Absent'
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    Absent
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStudentStatusChange(st.id, 'Informed')}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                      rec.status === 'Informed'
                                        ? 'bg-amber-500 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    Informed
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <input
                                  type="text"
                                  value={rec.remarks}
                                  onChange={e => handleStudentRemarksChange(st.id, e.target.value)}
                                  placeholder="Optional remarks..."
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                    <Button variant="outline" onClick={() => setActiveTab('session-form')} icon={<ArrowLeft className="w-4 h-4" />}>
                      Back to Session Form
                    </Button>
                    <Button onClick={handleSubmitSession} icon={<CheckCircle2 className="w-4 h-4" />} className="bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold px-6 py-2.5">
                      {editingReportId ? 'Update Session Attendance Report' : 'Submit Attendance & Session Report'}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: SESSION DETAIL PAGE */}
        {pageView === 'detail' && selectedReportDetail && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" /> Session Detail — {formatDate(selectedReportDetail.date)}
                </h3>
                <p className="text-xs text-slate-500">Log ID: {selectedReportDetail.id}</p>
              </div>
              <div className="flex items-center gap-2">
                {isEditableWithin7Days(selectedReportDetail.date) ? (
                  <Button size="sm" onClick={() => handleEditSession(selectedReportDetail)} icon={<Edit className="w-4 h-4" />}>
                    Edit Session
                  </Button>
                ) : (
                  <Badge variant="neutral">Locked (&gt; 7 Days Old)</Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleDirectPrintPDF(selectedReportDetail, e)}
                  icon={<Printer className="w-4 h-4 text-emerald-600" />}
                >
                  Print PDF Report
                </Button>
              </div>
            </div>

            {/* Top Cards Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
              <Card className="bg-slate-50">
                <p className="text-[10px] text-slate-400 font-black uppercase">LOGGED BY COACH</p>
                <p className="text-sm font-black text-slate-900 mt-1 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" /> {selectedReportDetail.loggedByCoachName}
                </p>
              </Card>
              <Card className="bg-slate-50">
                <p className="text-[10px] text-slate-400 font-black uppercase">TRAINEES ENROLLED</p>
                <p className="text-sm font-black text-slate-900 mt-1">{selectedReportDetail.attendanceCount} Trainees</p>
              </Card>
              <Card className="bg-slate-50">
                <p className="text-[10px] text-slate-400 font-black uppercase">VENUE & TIME</p>
                <p className="text-sm font-black text-slate-900 mt-1">{selectedReportDetail.venue} ({selectedReportDetail.time})</p>
              </Card>
            </div>

            {/* Daily Topic & Explanation */}
            <Card header={<h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Training Session Overview</h3>}>
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">DAILY TOPIC</p>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedReportDetail.dailyTopic}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">EXPLANATION</p>
                  <p className="text-slate-700 mt-0.5 font-medium">{selectedReportDetail.explanation}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">FULL SESSION OVERVIEW</p>
                  <p className="text-slate-900 font-bold mt-0.5">{selectedReportDetail.fullSessionOverview}</p>
                </div>
              </div>
            </Card>

            {/* Splits Loop Table */}
            <Card header={<h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Session Splits ({selectedReportDetail.splits.length})</h3>}>
              <div className="space-y-2 text-xs">
                {selectedReportDetail.splits.map((sp, idx) => (
                  <div key={sp.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 uppercase">{sp.heading}</span>
                        <span className="font-mono text-slate-500 font-bold">{sp.timeDoneMins} mins</span>
                      </div>
                      <p className="text-slate-600 font-medium">{sp.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Trainees Attendance Log */}
            <Card header={<h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Trainee Attendance Breakdown</h3>}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-extrabold uppercase">
                      <th className="py-2.5 px-3">Trainee Name</th>
                      <th className="py-2.5 px-3">Student ID</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {INITIAL_STUDENTS.slice(0, selectedReportDetail.attendanceCount || 6).map(st => {
                      const stRec = selectedReportDetail.studentAttendance?.[st.id] || { status: 'Present', remarks: '' };
                      return (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-slate-900">{st.fullName}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-400">{st.studentId}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              stRec.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              stRec.status === 'Absent' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {stRec.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{stRec.remarks || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

      </div>

      {/* COMPLETE PDF PRINT PORTAL WITH FULL SESSION & ATTENDANCE BREAKDOWN */}
      {selectedReportForPrint && pdfPrintModalOpen && (
        <PrintPortal title={`Session_Report_${selectedReportForPrint.date}`} onClose={() => setPdfPrintModalOpen(false)}>
          <div className="bg-white text-slate-900 font-sans space-y-6">
            {/* Header Matching Image 2 */}
            <ReportHeader
              title="DAILY TRAINING SESSION & ATTENDANCE REPORT"
              date={formatDate(selectedReportForPrint.date)}
            />

            {/* Top Info Header Grid */}
            <div className="grid grid-cols-4 gap-3 text-xs font-bold">
              <div className="p-3 border-2 border-slate-200 rounded-lg bg-slate-50">
                <p className="text-[10px] text-slate-500 font-black uppercase">LOGGED BY COACH</p>
                <p className="text-xs font-black text-slate-900 mt-1">{selectedReportForPrint.loggedByCoachName}</p>
              </div>
              <div className="p-3 border-2 border-slate-200 rounded-lg bg-slate-50">
                <p className="text-[10px] text-slate-500 font-black uppercase">ATTENDANCE COUNT</p>
                <p className="text-xs font-black text-slate-900 mt-1">{selectedReportForPrint.attendanceCount} Trainees</p>
              </div>
              <div className="p-3 border-2 border-slate-200 rounded-lg bg-slate-50">
                <p className="text-[10px] text-slate-500 font-black uppercase">CATEGORIES</p>
                <p className="text-xs font-black text-blue-700 mt-1">{selectedReportForPrint.categories.join(', ')}</p>
              </div>
              <div className="p-3 border-2 border-slate-200 rounded-lg bg-slate-50">
                <p className="text-[10px] text-slate-500 font-black uppercase">VENUE & TIME</p>
                <p className="text-xs font-black text-slate-900 mt-1">{selectedReportForPrint.venue} ({selectedReportForPrint.time})</p>
              </div>
            </div>

            {/* Daily Topic & Explanation */}
            <div className="border-2 border-slate-200 rounded-lg p-4 space-y-2 text-xs">
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase">DAILY TOPIC</p>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedReportForPrint.dailyTopic}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase">SESSION EXPLANATION</p>
                <p className="font-medium text-slate-800 mt-0.5">{selectedReportForPrint.explanation}</p>
              </div>
            </div>

            {/* Dynamic Splits Loop */}
            <div className="space-y-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-900">Dynamic Session Splits</h3>
              <div className="space-y-2">
                {selectedReportForPrint.splits.map((sp, idx) => (
                  <div key={sp.id} className="border-2 border-slate-200 rounded-lg p-3 flex items-start gap-3 text-xs">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-900 font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="uppercase text-slate-900">{sp.heading}</span>
                        <span className="font-mono text-slate-600">{sp.timeDoneMins} (mins)</span>
                      </div>
                      <p className="text-slate-700 font-medium">{sp.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Session Overview */}
            <div className="border-2 border-slate-200 rounded-lg p-4 text-xs">
              <p className="text-[10px] text-slate-500 font-black uppercase">FULL SESSION OVERVIEW</p>
              <p className="font-bold text-slate-900 mt-1">{selectedReportForPrint.fullSessionOverview}</p>
            </div>

            {/* COMPLETE TRAINEE ATTENDANCE BREAKDOWN TABLE IN PDF */}
            <div className="space-y-2 pt-2">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 border-b-2 border-slate-200 pb-1">
                Trainee Attendance Log ({selectedReportForPrint.attendanceCount} Trainees)
              </h3>
              <table className="w-full text-left border-collapse text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] border-b border-slate-200">
                    <th className="py-2 px-3">Trainee Name</th>
                    <th className="py-2 px-3">Student ID</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-center">Status</th>
                    <th className="py-2 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-semibold text-slate-800 text-[11px]">
                  {INITIAL_STUDENTS.slice(0, selectedReportForPrint.attendanceCount || 6).map(st => {
                    const stRec = selectedReportForPrint.studentAttendance?.[st.id] || { status: 'Present', remarks: '' };
                    return (
                      <tr key={st.id}>
                        <td className="py-1.5 px-3 font-bold">{st.fullName}</td>
                        <td className="py-1.5 px-3 font-mono text-slate-500">{st.studentId}</td>
                        <td className="py-1.5 px-3 text-slate-600">{st.category || 'Academy'}</td>
                        <td className="py-1.5 px-3 text-center font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            stRec.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                            stRec.status === 'Absent' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {stRec.status}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-slate-500">{stRec.remarks || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Signature & Attendance Marked Coach Footer */}
            <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-xs font-bold">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">ATTENDANCE MARKED BY COACH</p>
                <p className="text-sm font-black text-slate-900 mt-1">{selectedReportForPrint.loggedByCoachName}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Signature: __________________________</p>
              </div>
              <div className="text-right flex flex-col justify-end">
                <p className="text-[11px] font-black uppercase text-amber-600 tracking-widest">
                  DEVELOPING PLAYERS. BUILDING CHAMPIONS.
                </p>
                <p className="text-[10px] text-slate-400 mt-1">MALABAR CHALLENGERS FOOTBALL CLUB OFFICIAL REPORT</p>
              </div>
            </div>
          </div>
        </PrintPortal>
      )}

      {/* DELETE SESSION CONFIRMATION MODAL (SUPER ADMIN STYLE) */}
      {deleteSessionConfirm && (
        <Modal
          isOpen={!!deleteSessionConfirm}
          onClose={() => setDeleteSessionConfirm(null)}
          title="Confirm Delete Session Report"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-700 leading-relaxed font-medium">
              Are you sure you want to permanently delete the training session & attendance report for <b className="text-slate-900">{formatDate(deleteSessionConfirm.date)}</b> ({deleteSessionConfirm.dailyTopic})?
            </p>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-semibold">
              Warning: This action cannot be undone. Attendance logs for {deleteSessionConfirm.attendanceCount} trainees will be deleted.
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setDeleteSessionConfirm(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmDeleteSession}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                icon={<Trash2 className="w-4 h-4" />}
              >
                Delete Session Permanently
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </LayoutShell>
  );
};
