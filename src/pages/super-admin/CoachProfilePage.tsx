import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { CoachCredentialsModal } from '../../components/ui/CoachCredentialsModal';
import { INITIAL_COACHES } from '../../mock-data/msrf-data';
import { CoachDocument } from '../../types';
import { ArrowLeft, Mail, Phone, Calendar, Award, Key, Copy, Check, FileText, Download, Plus, UserCheck, Trash2, FileDown, Printer, Trophy } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { PrintPortal } from '../../components/ui/PrintPortal';
import { ReportHeader } from '../../components/ui/ReportHeader';
import { useNotifications } from '../../context/NotificationContext';

export const CoachProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  const [credentialsModal, setCredentialsModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfModal, setPdfModal] = useState(false);

  const coach = INITIAL_COACHES.find(c => c.id === id) || INITIAL_COACHES[0];

  // Documents state for coach
  const [coachDocs, setCoachDocs] = useState<CoachDocument[]>(coach.documents || [
    {
      id: 'cdoc-1',
      title: 'Employment Agreement 2026',
      fileName: 'coach_employment_contract_2026.pdf',
      fileType: 'PDF',
      fileSize: '1.8 MB',
      uploadedDate: '2026-01-10',
      url: coach.contractUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ]);
  const [docModal, setDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');

  const handleDeleteDoc = (docId: string, title: string) => {
    setCoachDocs(prev => prev.filter(d => d.id !== docId));
    addToast({ type: 'info', title: 'Document Removed', message: `"${title}" deleted from coach profile.` });
  };

  const handleDownloadPDF = () => {
    setPdfModal(true);
  };

  // Month-wise filter for Coach Attendance History
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  // Mock coach attendance history logs
  const coachAttendanceLogs = [
    { date: '2026-09-24', monthYear: 'September 2026', session: 'Morning Session (6:00 AM - 8:00 AM)', status: 'Present', markedTime: '05:55 AM' },
    { date: '2026-09-23', monthYear: 'September 2026', session: 'Evening Session (4:00 PM - 6:00 PM)', status: 'Present', markedTime: '03:50 PM' },
    { date: '2026-09-22', monthYear: 'September 2026', session: 'Morning Session (6:00 AM - 8:00 AM)', status: 'Present', markedTime: '05:58 AM' },
    { date: '2026-09-21', monthYear: 'September 2026', session: 'Morning Session (6:00 AM - 8:00 AM)', status: 'Present', markedTime: '05:52 AM' },
    { date: '2026-08-28', monthYear: 'August 2026', session: 'Evening Session (4:00 PM - 6:00 PM)', status: 'Present', markedTime: '03:55 PM' },
    { date: '2026-08-25', monthYear: 'August 2026', session: 'Morning Session (6:00 AM - 8:00 AM)', status: 'Present', markedTime: '05:50 AM' },
    { date: '2026-07-20', monthYear: 'July 2026', session: 'Morning Session (6:00 AM - 8:00 AM)', status: 'Present', markedTime: '05:54 AM' }
  ];

  const filteredAttendanceLogs = coachAttendanceLogs.filter(log => {
    return selectedMonth === 'ALL' || log.monthYear === selectedMonth;
  });

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

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle) return;

    const newDoc: CoachDocument = {
      id: `cdoc-${Date.now()}`,
      title: newDocTitle,
      fileName: `${newDocTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileType: 'PDF',
      fileSize: '1.5 MB',
      uploadedDate: new Date().toISOString().slice(0, 10),
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    };

    setCoachDocs([newDoc, ...coachDocs]);
    setNewDocTitle('');
    setDocModal(false);
    addToast({ type: 'success', title: 'Document Uploaded', message: `"${newDoc.title}" added to coach profile.` });
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
          <Button
            size="sm"
            onClick={handleDownloadPDF}
            icon={<FileDown className="w-4 h-4 text-blue-600" />}
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
          >
            Download PDF Profile
          </Button>
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
              <p className="text-xs text-slate-300 mt-2 max-w-xl">{coach.bio}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase font-bold text-slate-400">Blood Group</p>
            <p className="text-3xl font-black text-rose-400">{coach.bloodGroup || 'O+'}</p>
            <p className="text-xs text-emerald-400 font-semibold mt-1">Attendance Rate: {coach.attendanceAvg}%</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Contact Info & Credentials Card */}
        <div className="space-y-6">
          <Card header={<h3 className="font-bold text-slate-900 text-sm">Contact & Personal Info</h3>}>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-rose-600">
                <span>Blood Group: {coach.bloodGroup || 'O+'}</span>
              </div>
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

          {/* Contract Document Quick View */}
          <Card header={<h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" /> Contract Document</h3>}>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">Employment Contract</p>
                <p className="text-[10px] text-slate-500">Official Staff Contract PDF</p>
              </div>
              <a
                href={coach.contractUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              >
                <Download className="w-3.5 h-3.5" /> View / Download
              </a>
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

        {/* Right Column: Attendance History & Documents Upload */}
        <div className="md:col-span-2 space-y-6">
          {/* Card 1: Attendance History with Month-wise Filter */}
          <Card
            header={
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" /> Coach Attendance History Logs
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold">Month:</span>
                  <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Months</option>
                    <option value="September 2026">September 2026</option>
                    <option value="August 2026">August 2026</option>
                    <option value="July 2026">July 2026</option>
                  </select>
                </div>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Session</th>
                    <th className="py-2.5 px-3">Marked Time</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredAttendanceLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400">No attendance logs for selected month.</td>
                    </tr>
                  ) : (
                    filteredAttendanceLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{formatDate(log.date)}</td>
                        <td className="py-2.5 px-3 text-slate-600">{log.session}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{log.markedTime}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant="paid">{log.status}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Card 2: Coach Documents Upload Section */}
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" /> Coach Documents & Certifications ({coachDocs.length})
                </h3>
                <Button size="sm" onClick={() => setDocModal(true)} icon={<Plus className="w-3.5 h-3.5" />}>
                  Upload Document
                </Button>
              </div>
            }
          >
            <div className="divide-y divide-slate-100">
              {coachDocs.map(d => (
                <div key={d.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{d.title}</p>
                      <p className="text-[11px] text-slate-400">{d.fileName} • {d.fileSize} • Uploaded {formatDate(d.uploadedDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={d.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" /> Download
                    </a>
                    <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50" icon={<Trash2 className="w-4 h-4" />} onClick={() => handleDeleteDoc(d.id, d.title)} title="Delete Document" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Upload Document Modal */}
      <Modal isOpen={docModal} onClose={() => setDocModal(false)} title="Upload Coach Document / Contract" size="sm">
        <form onSubmit={handleUploadDoc} className="space-y-4">
          <Input
            label="Document Title"
            required
            placeholder="e.g. National Level Coaching Certification 2026"
            value={newDocTitle}
            onChange={e => setNewDocTitle(e.target.value)}
          />
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">Select File (PDF / DOC / Image)</label>
            <input
              type="file"
              required
              className="w-full text-xs text-slate-600 border border-slate-300 rounded-lg p-2 bg-slate-50"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setDocModal(false)}>Cancel</Button>
            <Button type="submit">Upload & Attach to Profile</Button>
          </div>
        </form>
      </Modal>

      <CoachCredentialsModal
        isOpen={credentialsModal}
        onClose={() => setCredentialsModal(false)}
        coach={coach}
      />

      {/* Official Printable Coach Profile PDF Modal */}
      <Modal
        isOpen={pdfModal}
        onClose={() => setPdfModal(false)}
        title={`Official Coach Profile Report: ${coach.fullName}`}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full no-print">
            <Button variant="outline" onClick={() => setPdfModal(false)}>Close</Button>
            <Button icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
              Print / Save PDF Report
            </Button>
          </div>
        }
      >
        <div className="p-6 bg-white space-y-6 text-slate-800 font-sans border border-slate-200 rounded-xl shadow-inner">
          {/* Header MSRF Branding */}
          <ReportHeader title="COACH PROFILE REPORT" date={new Date().toISOString().slice(0, 10)} />

          {/* Coach Overview Card */}
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <img src={coach.photo} alt={coach.fullName} className="w-20 h-20 rounded-xl object-cover border border-slate-300 shrink-0" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs flex-1">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Full Name</p>
                <p className="font-bold text-slate-900 text-sm">{coach.fullName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Blood Group</p>
                <p className="font-bold text-rose-600 text-sm">{coach.bloodGroup || 'O+'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Experience</p>
                <p className="font-bold text-blue-600">{coach.experienceYears} Years</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Attendance Rate</p>
                <p className="font-bold text-emerald-600">{coach.attendanceAvg}%</p>
              </div>
            </div>
          </div>

          {/* Contact Details & Biography */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">Contact Information</p>
              <div className="flex justify-between"><span className="text-slate-500">Email:</span><span className="font-mono">{coach.email}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Phone:</span><span className="font-mono">{coach.phone}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Joined Date:</span><span className="font-semibold">{formatDate(coach.joinedDate)}</span></div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">Biography & Accreditations</p>
              <p className="text-slate-700 italic">{coach.bio || 'Certified Senior Sports Coach at MSRF.'}</p>
            </div>
          </div>

          {/* Auto-generated Timestamp Footer */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <p>Malabar Challengers Football Club • Official System Generated Report</p>
            <p>Printed Date & Time: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
        </div>

        <PrintPortal>
          <div className="space-y-6 text-slate-800 font-sans">
            {/* Header MSRF Branding */}
            <ReportHeader title="COACH PROFILE REPORT" date={new Date().toISOString().slice(0, 10)} />

            {/* Coach Overview Card */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img src={coach.photo} alt={coach.fullName} className="w-20 h-20 rounded-xl object-cover border border-slate-300 shrink-0" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs flex-1">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Full Name</p>
                  <p className="font-bold text-slate-900 text-sm">{coach.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Blood Group</p>
                  <p className="font-bold text-rose-600 text-sm">{coach.bloodGroup || 'O+'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Experience</p>
                  <p className="font-bold text-blue-600">{coach.experienceYears} Years</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Attendance Rate</p>
                  <p className="font-bold text-emerald-600">{coach.attendanceAvg}%</p>
                </div>
              </div>
            </div>

            {/* Contact Details & Biography */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">Contact Information</p>
                <div className="flex justify-between"><span className="text-slate-500">Email:</span><span className="font-mono">{coach.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Phone:</span><span className="font-mono">{coach.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Joined Date:</span><span className="font-semibold">{formatDate(coach.joinedDate)}</span></div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">Biography & Accreditations</p>
                <p className="text-slate-700 italic">{coach.bio || 'Certified Senior Sports Coach at MSRF.'}</p>
              </div>
            </div>

            {/* Auto-generated Timestamp Footer */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <p>Malabar Challengers Football Club • Official System Generated Report</p>
              <p>Printed Date & Time: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
          </div>
        </PrintPortal>
      </Modal>
    </LayoutShell>
  );
};
