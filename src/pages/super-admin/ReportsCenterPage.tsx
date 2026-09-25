import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { PrintPortal } from '../../components/ui/PrintPortal';
import { ReportHeader } from '../../components/ui/ReportHeader';
import { PlayerDevelopmentReportPDF } from '../../components/ui/PlayerDevelopmentReportPDF';
import { INITIAL_COACHES, INITIAL_STUDENTS, INITIAL_SESSION_REPORTS, INITIAL_PERFORMANCE } from '../../mock-data/msrf-data';
import { 
  FileText, 
  UserCheck, 
  FileDown, 
  Award, 
  Filter,
  Star
} from 'lucide-react';
import { formatDate } from '../../utils/format';
import { useNotifications } from '../../context/NotificationContext';
import { DailyTrainingSessionReport, PerformanceRecord } from '../../types';
import logoImg from '../../assets/logo.png';

export const ReportsCenterPage: React.FC = () => {
  const [reportCategory, setReportCategory] = useState<'session' | 'player'>('session');
  const [selectedReport, setSelectedReport] = useState<DailyTrainingSessionReport | null>(INITIAL_SESSION_REPORTS[0]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [pdfPrintModalOpen, setPdfPrintModalOpen] = useState(false);

  // Player Development Report PDF State
  const [selectedPlayerReport, setSelectedPlayerReport] = useState<PerformanceRecord | null>(null);
  const [viewPlayerModalOpen, setViewPlayerModalOpen] = useState(false);
  const [pdfPlayerReportPrint, setPdfPlayerReportPrint] = useState<PerformanceRecord | null>(null);

  // Filters
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [coachFilter, setCoachFilter] = useState('ALL');

  const { addToast } = useNotifications();

  // Filtered session reports
  const filteredReports = INITIAL_SESSION_REPORTS.filter(r => {
    const matchesCoach = coachFilter === 'ALL' || r.loggedByCoachName === coachFilter;
    return matchesCoach;
  });

  // Filtered player development reports
  const filteredPlayerReports = INITIAL_PERFORMANCE.filter(p => {
    const matchesCoach = coachFilter === 'ALL' || p.coachName === coachFilter;
    return matchesCoach;
  });

  const handlePrintPDF = (report: DailyTrainingSessionReport) => {
    setSelectedReport(report);
    setPdfPrintModalOpen(true);
  };

  const handleViewDetails = (report: DailyTrainingSessionReport) => {
    setSelectedReport(report);
    setViewModalOpen(true);
  };

  const getCoachesForReport = (rep: DailyTrainingSessionReport) => {
    const leadCoach = INITIAL_COACHES.find(c => c.fullName === rep.loggedByCoachName) || {
      id: 'lead-fallback',
      fullName: rep.loggedByCoachName,
      phone: '+91 98470 12345',
      specialization: 'Head Football Coach',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
    };

    const coCoaches = (rep.assignedCoaches || []).map(cName => {
      return INITIAL_COACHES.find(c => c.fullName === cName || c.id === cName) || {
        id: `co-fallback-${cName}`,
        fullName: cName,
        phone: '+91 94471 23456',
        specialization: 'Assistant Coach',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
      };
    });

    return { leadCoach, coCoaches, allCoaches: [leadCoach, ...coCoaches] };
  };

  return (
    <LayoutShell
      title="Analytics & Daily Reports Center"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Reports Center' }]}
    >
      <div className="space-y-6">
        {/* Report Category Switcher */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setReportCategory('session')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              reportCategory === 'session'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border-blue-600'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${reportCategory === 'session' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider">1. Daily Training Session Reports</h3>
                <p className={`text-xs mt-0.5 ${reportCategory === 'session' ? 'text-blue-100' : 'text-slate-500'}`}>
                  Session plans, topic splits, coach & trainee attendance logs
                </p>
              </div>
            </div>
            <Badge variant={reportCategory === 'session' ? 'active' : 'neutral'}>
              {INITIAL_SESSION_REPORTS.length} Reports
            </Badge>
          </div>

          <div
            onClick={() => setReportCategory('player')}
            className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              reportCategory === 'player'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border-blue-600'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${reportCategory === 'player' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider">2. Player Development Reports</h3>
                <p className={`text-xs mt-0.5 ${reportCategory === 'player' ? 'text-blue-100' : 'text-slate-500'}`}>
                  15-skill performance assessment, strengths, goals & rating
                </p>
              </div>
            </div>
            <Badge variant={reportCategory === 'player' ? 'active' : 'neutral'}>
              {INITIAL_PERFORMANCE.length} Reports
            </Badge>
          </div>
        </div>

        {/* Filter Controls */}
        <Card header={<h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2"><Filter className="w-4 h-4 text-blue-600" /> Filter Session Reports</h3>}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 h-10 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 h-10 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              />
            </div>
            <div>
              <Select
                label="Logged By Coach"
                value={coachFilter}
                onChange={e => setCoachFilter(e.target.value)}
                options={[
                  { label: 'All Coaches', value: 'ALL' },
                  ...INITIAL_COACHES.map(c => ({ label: c.fullName, value: c.fullName }))
                ]}
                className="bg-slate-50 border-slate-300 rounded-xl h-10 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* SESSION REPORTS TABLE & DOWNLOAD SECTION */}
        {reportCategory === 'session' ? (
          <Card header={<h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Submitted Daily Training Session Reports</h3>}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Session Date</th>
                    <th className="py-3.5 px-4">Categories</th>
                    <th className="py-3.5 px-4">Marked Coach</th>
                    <th className="py-3.5 px-4">Venue Location</th>
                    <th className="py-3.5 px-4">Daily Topic</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredReports.map(rep => (
                    <tr 
                      key={rep.id} 
                      onClick={() => handleViewDetails(rep)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatDate(rep.date)}
                        <p className="text-[10px] text-slate-400 font-mono font-normal">ID: {rep.id}</p>
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
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-extrabold text-slate-900">{rep.loggedByCoachName}</span>
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 shrink-0">
                              Lead
                            </span>
                          </div>
                          {rep.assignedCoaches && rep.assignedCoaches.length > 0 && (
                            <div className="flex flex-wrap gap-1 items-center pt-0.5">
                              {rep.assignedCoaches.map((cName, idx) => (
                                <span key={idx} className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                                  <UserCheck className="w-3 h-3 text-emerald-600" />
                                  {cName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{rep.venue}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {rep.dailyTopic}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handlePrintPDF(rep)}
                            className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Print PDF"
                          >
                            <FileDown className="w-4 h-4 text-emerald-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          /* PLAYER DEVELOPMENT REPORT SECTION */
          <Card header={<h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Player Development Reports (15-Skill Evaluation)</h3>}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Player Name</th>
                    <th className="py-3.5 px-4">Position & Foot</th>
                    <th className="py-3.5 px-4">Assigned Coach</th>
                    <th className="py-3.5 px-4">Evaluation Date</th>
                    <th className="py-3.5 px-4 text-center">Overall Rating</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredPlayerReports.map(rec => (
                    <tr 
                      key={rec.id} 
                      onClick={() => { setSelectedPlayerReport(rec); setViewPlayerModalOpen(true); }}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {rec.studentName}
                        <p className="text-[10px] text-slate-400 font-mono font-normal">ID: {rec.studentId}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {rec.position || 'Forward'}
                        <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                          {rec.strongFoot || 'Right'} Foot
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{rec.coachName}</span>
                        </div>
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
                        <div className="flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedPlayerReport(rec)}
                            className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Print Player Report PDF"
                          >
                            <FileDown className="w-4 h-4 text-emerald-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* PLAYER DEVELOPMENT REPORT PDF PRINT PORTAL */}
      {selectedPlayerReport && !viewPlayerModalOpen && (
        <PlayerDevelopmentReportPDF
          record={selectedPlayerReport}
          onClose={() => setSelectedPlayerReport(null)}
        />
      )}

      {/* PLAYER DEVELOPMENT REPORT PREVIEW MODAL FOR SUPER ADMIN */}
      {selectedPlayerReport && viewPlayerModalOpen && (
        <Modal
          isOpen={viewPlayerModalOpen}
          onClose={() => setViewPlayerModalOpen(false)}
          title={`Player Development Evaluation — ${selectedPlayerReport.studentName}`}
          size="xl"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-amber-400 p-4 rounded-xl text-slate-900 flex justify-between items-center font-black uppercase">
              <div>
                <h3 className="text-base">{selectedPlayerReport.studentName}</h3>
                <p className="text-[10px] text-slate-900/80">
                  Position: {selectedPlayerReport.position || 'Central Midfielder'} | Coach: {selectedPlayerReport.coachName}
                </p>
              </div>
              <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs">
                Rating: {selectedPlayerReport.overallRating || 5} / 5 ★
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-800">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-extrabold text-slate-900 mb-1">PLAYER STRENGTHS</p>
                <p className="whitespace-pre-line text-slate-700">{selectedPlayerReport.strengths}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-extrabold text-slate-900 mb-1">AREAS FOR IMPROVEMENT</p>
                <p className="whitespace-pre-line text-slate-700">{selectedPlayerReport.areasForImprovement}</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
              <p className="font-extrabold text-blue-900 mb-1">COACH'S COMMENTS / SUMMARY</p>
              <p className="italic text-blue-900">"{selectedPlayerReport.coachRemarks}" — {selectedPlayerReport.coachName}</p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setViewPlayerModalOpen(false)}>Close</Button>
              <Button 
                onClick={() => {
                  setViewPlayerModalOpen(false);
                  setPdfPlayerReportPrint(selectedPlayerReport);
                }} 
                icon={<FileDown className="w-4 h-4" />}
              >
                Print Player Report PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* VIEW REPORT MODAL */}
      {selectedReport && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Daily Training Session Report — ${formatDate(selectedReport.date)}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Header Matching ReportHeader Format */}
            <ReportHeader title="DAILY TRAINING SESSION REPORT" date={formatDate(selectedReport.date)} />

            {/* Top Grid Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-black uppercase text-slate-400">COACH NAME</p>
                <p className="font-extrabold text-slate-900 mt-0.5">{selectedReport.loggedByCoachName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-black uppercase text-slate-400">ATTENDANCE</p>
                <p className="font-extrabold text-slate-900 mt-0.5">{selectedReport.attendanceCount} Trainees Enrolled</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-black uppercase text-slate-400">VENUE LOCATION</p>
                <p className="font-extrabold text-slate-900 mt-0.5">{selectedReport.venue}</p>
              </div>
            </div>

            {/* Coaching Staff Present Section */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center justify-between">
                <span>Coaching Staff Present ({getCoachesForReport(selectedReport).allCoaches.length} Coaches)</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Attendance Marked & Verified
                </span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {getCoachesForReport(selectedReport).allCoaches.map((coach, idx) => {
                  const isLead = idx === 0;
                  return (
                    <div 
                      key={coach.id || idx}
                      className={`p-3 rounded-xl border flex items-center gap-3 ${
                        isLead 
                          ? 'bg-blue-50/60 border-blue-200' 
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <img 
                        src={coach.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'} 
                        alt={coach.fullName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-2xs shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="font-extrabold text-slate-900 text-xs truncate">{coach.fullName}</p>
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                            isLead ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isLead ? 'Lead' : 'Co-Coach'}
                          </span>
                        </div>
                        <p className="text-[10px] text-blue-600 font-semibold font-mono">{coach.phone}</p>
                        <p className="text-[10px] text-slate-500 truncate">{coach.specialization || 'Football Coach'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Topic & Explanation */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">DAILY TOPIC</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedReport.dailyTopic}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">EXPLANATION</p>
                <p className="text-slate-700 mt-0.5 font-medium">{selectedReport.explanation}</p>
              </div>
            </div>

            {/* Dynamic Splits Loop */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Session Splits ({selectedReport.splits.length})</h4>
              <div className="space-y-2 text-xs">
                {selectedReport.splits.map((sp, idx) => (
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
            </div>

            {/* Full Session Overview */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <p className="text-[10px] font-black uppercase text-slate-400">FULL SESSION OVERVIEW</p>
              <p className="text-slate-900 font-bold mt-1">{selectedReport.fullSessionOverview}</p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button>
              <Button onClick={() => { setViewModalOpen(false); setPdfPrintModalOpen(true); }} icon={<FileDown className="w-4 h-4" />}>
                Download PDF Report
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* PDF PRINT PORTAL (MATCHING IMAGE 2 FORMAT EXACTLY FOR PDF EXPORT) */}
      {selectedReport && pdfPrintModalOpen && (
        <PrintPortal title={`Session_Report_${selectedReport.date}`} onClose={() => setPdfPrintModalOpen(false)}>
          <div className="bg-white text-slate-900 font-sans space-y-6">
            {/* Header Matching Image 2 */}
            <ReportHeader
              title="DAILY TRAINING SESSION REPORT"
              date={formatDate(selectedReport.date)}
            />

            {/* Top Info Header Grid */}
            <div className="grid grid-cols-3 gap-4 text-xs font-bold">
              <div className="p-3 border-2 border-slate-200 rounded-lg bg-slate-50">
                <p className="text-[10px] text-slate-500 font-black uppercase">LEAD COACH</p>
                <p className="text-sm font-black text-slate-900 mt-1">{selectedReport.loggedByCoachName}</p>
              </div>
              <div className="p-3 border-2 border-slate-200 rounded-lg bg-slate-50">
                <p className="text-[10px] text-slate-500 font-black uppercase">ATTENDANCE</p>
                <p className="text-sm font-black text-slate-900 mt-1">{selectedReport.attendanceCount} Trainees</p>
              </div>
              <div className="p-3 border-2 border-slate-200 rounded-lg bg-slate-50">
                <p className="text-[10px] text-slate-500 font-black uppercase">VENUE LOCATION</p>
                <p className="text-xs font-black text-slate-900 mt-1">{selectedReport.venue}</p>
              </div>
            </div>

            {/* Coaching Staff Present Section in PDF Export */}
            <div className="space-y-2">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-900">
                Coaching Staff Present ({getCoachesForReport(selectedReport).allCoaches.length} Coaches)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {getCoachesForReport(selectedReport).allCoaches.map((coach, idx) => {
                  const isLead = idx === 0;
                  return (
                    <div key={coach.id || idx} className="border-2 border-slate-200 rounded-lg p-2.5 flex items-center gap-3 bg-slate-50 text-xs">
                      <img 
                        src={coach.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'} 
                        alt={coach.fullName} 
                        className="w-9 h-9 rounded-full object-cover border border-slate-300 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-black text-slate-900 text-xs truncate">{coach.fullName}</span>
                          <span className={`text-[8px] font-black uppercase px-1 py-0.5 rounded ${isLead ? 'bg-blue-700 text-white' : 'bg-emerald-700 text-white'}`}>
                            {isLead ? 'Lead' : 'Co-Coach'}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono font-bold text-blue-700">{coach.phone}</p>
                        <p className="text-[9px] text-slate-500 truncate">{coach.specialization || 'Football Coach'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Topic & Explanation */}
            <div className="border-2 border-slate-200 rounded-lg p-4 space-y-3 text-xs">
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase">DAILY TOPIC</p>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">{selectedReport.dailyTopic}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase">EXPLANATION</p>
                <p className="font-medium text-slate-800 mt-0.5">{selectedReport.explanation}</p>
              </div>
            </div>

            {/* Dynamic Splits Loop */}
            <div className="space-y-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-900">Dynamic Session Splits</h3>
              {selectedReport.splits.map((sp, idx) => (
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

            {/* Trainee Attendance Breakdown */}
            <div className="space-y-3 pt-2">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-900">
                Trainee Attendance Breakdown ({INITIAL_STUDENTS.length} Players Registered)
              </h3>
              <div className="border-2 border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-black uppercase text-[10px]">
                      <th className="py-2 px-3 border-b border-slate-200">#</th>
                      <th className="py-2 px-3 border-b border-slate-200">Player Name</th>
                      <th className="py-2 px-3 border-b border-slate-200">ID</th>
                      <th className="py-2 px-3 border-b border-slate-200">Category</th>
                      <th className="py-2 px-3 border-b border-slate-200 text-center">Status</th>
                      <th className="py-2 px-3 border-b border-slate-200">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {INITIAL_STUDENTS.map((st, i) => {
                      const status = i % 4 === 3 ? 'Absent' : i % 5 === 4 ? 'Informed' : 'Present';
                      return (
                        <tr key={st.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="py-2 px-3 font-bold text-slate-500">{i + 1}</td>
                          <td className="py-2 px-3 font-extrabold text-slate-900">{st.fullName}</td>
                          <td className="py-2 px-3 font-mono text-slate-500 text-[10px]">{st.studentId}</td>
                          <td className="py-2 px-3 text-slate-600 font-semibold">{st.category || 'Football Excellence'}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-block ${
                              status === 'Present' 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : status === 'Informed' 
                                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-500 italic text-[11px]">
                            {status === 'Informed' ? 'Informed coach via phone' : status === 'Absent' ? 'Unexcused' : 'Completed session'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Full Session Overview */}
            <div className="border-2 border-slate-200 rounded-lg p-4 text-xs">
              <p className="text-[10px] text-slate-500 font-black uppercase">FULL SESSION OVERVIEW</p>
              <p className="font-bold text-slate-900 mt-1">{selectedReport.fullSessionOverview}</p>
            </div>

            {/* Signature & Attendance Marked Coach Footer */}
            <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-xs font-bold">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">ATTENDANCE MARKED BY COACH</p>
                <p className="text-sm font-black text-slate-900 mt-1">{selectedReport.loggedByCoachName}</p>
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

      {pdfPlayerReportPrint && (
        <PlayerDevelopmentReportPDF
          record={pdfPlayerReportPrint}
          onClose={() => setPdfPlayerReportPrint(null)}
        />
      )}
    </LayoutShell>
  );
};
