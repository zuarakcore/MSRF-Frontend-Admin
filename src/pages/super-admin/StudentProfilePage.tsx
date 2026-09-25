import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { INITIAL_STUDENTS, INITIAL_PAYMENTS, INITIAL_INVOICES, INITIAL_PERFORMANCE } from '../../mock-data/msrf-data';
import { formatCurrency, formatDate } from '../../utils/format';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  UserCheck, 
  CreditCard, 
  FileText, 
  Award, 
  FileCheck,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Trash2,
  FileDown,
  Printer,
  Trophy
} from 'lucide-react';
import { PrintPortal } from '../../components/ui/PrintPortal';
import { ReportHeader } from '../../components/ui/ReportHeader';
import { useNotifications } from '../../context/NotificationContext';

export const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('overview');

  const student = INITIAL_STUDENTS.find(s => s.id === id) || INITIAL_STUDENTS[0];
  const payments = INITIAL_PAYMENTS.filter(p => p.studentId === student.id || p.studentName === student.fullName);
  const invoices = INITIAL_INVOICES.filter(i => i.studentId === student.id || i.studentName === student.fullName);
  const performances = INITIAL_PERFORMANCE.filter(p => p.studentId === student.id || p.studentName === student.fullName);

  // Document upload state
  const [docs, setDocs] = useState(student.documents);
  const [docModal, setDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [pdfModal, setPdfModal] = useState(false);

  const handleDeleteDoc = (docId: string, title: string) => {
    setDocs(prev => prev.filter(d => d.id !== docId));
    addToast({ type: 'info', title: 'Document Removed', message: `"${title}" has been deleted.` });
  };

  const handleDownloadPDF = () => {
    setPdfModal(true);
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle) return;
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: newDocTitle,
      fileName: `${newDocTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileType: 'PDF' as const,
      fileSize: '1.4 MB',
      uploadedDate: new Date().toISOString().slice(0, 10),
      url: '#'
    };
    setDocs([...docs, newDoc]);
    setNewDocTitle('');
    setDocModal(false);
    addToast({ type: 'success', title: 'Document Uploaded', message: `${newDoc.title} added to profile.` });
  };

  return (
    <LayoutShell
      title={`Student Profile: ${student.fullName}`}
      breadcrumb={[
        { label: 'Super Admin', path: '/super-admin/dashboard' },
        { label: 'Students', path: '/super-admin/students' },
        { label: student.studentId }
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/super-admin/students')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Roster
          </Button>
        </div>
      }
    >
      {/* Student Profile Header Banner */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white border-0 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={student.photo}
              alt={student.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-white tracking-tight">{student.fullName}</h2>
                <Badge variant={student.status === 'Active' ? 'active' : 'inactive'}>
                  {student.status}
                </Badge>
              </div>
              <p className="text-xs text-blue-300 font-mono mt-0.5">{student.studentId} • Admission #: {student.admissionNumber}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-rose-300">
                  Blood Group: {student.bloodGroup || 'O+'}
                </span>
                <span className="flex items-center gap-1 font-semibold text-blue-300">
                  Category: {student.category || 'Football Academy'}
                </span>
                <span className="flex items-center gap-1 font-semibold text-indigo-300">
                  Program: {student.programType || 'Day Scholar Program'}
                </span>
                <span className="flex items-center gap-1 font-semibold text-emerald-300">
                  Center: {student.trainingCenter || 'Kozhikode Main Campus'}
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Phone className="w-4 h-4 text-slate-400" /> {student.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Attendance Rate</p>
              <p className="text-2xl font-black text-emerald-400">{student.attendancePercentage}%</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'attendance', label: 'Attendance', badge: `${student.attendancePercentage}%` },
          { id: 'fees', label: 'Fees & Installments' },
          { id: 'payments', label: 'Payments', badge: payments.length },
          { id: 'invoices', label: 'Invoices', badge: invoices.length },
          { id: 'performance', label: 'Performance' },
          { id: 'documents', label: 'Documents', badge: docs.length }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card header={<h3 className="font-bold text-slate-900 text-sm">Personal Information</h3>}>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Full Name:</span>
                <span className="font-bold text-slate-900">{student.fullName}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Blood Group:</span>
                <span className="font-bold text-rose-600">{student.bloodGroup || 'O+'}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Gender:</span>
                <span className="font-medium text-slate-800">{student.gender}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Date of Birth:</span>
                <span className="font-medium text-slate-800">{formatDate(student.dateOfBirth)}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Phone Number:</span>
                <span className="font-mono text-slate-800">{student.phone}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Email Address:</span>
                <span className="font-medium text-slate-800">{student.email}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Residential Address:</span>
                <span className="font-medium text-slate-800">{student.address}</span>
              </div>
            </div>
          </Card>

          <Card header={<h3 className="font-bold text-slate-900 text-sm">Admission & Batch Info</h3>}>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Admission Number:</span>
                <span className="font-bold font-mono text-slate-900">{student.admissionNumber}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Admission Date:</span>
                <span className="font-medium text-slate-800">{formatDate(student.admissionDate)}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Category:</span>
                <span className="font-bold text-blue-600">{student.category || 'Football Academy'}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Program Type:</span>
                <span className="font-semibold text-indigo-700">{student.programType || 'Day Scholar Program'}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Training Center:</span>
                <span className="font-bold text-slate-900">{student.trainingCenter || 'Kozhikode Main Campus'}</span>
              </div>
            </div>
          </Card>

          <Card header={<h3 className="font-bold text-slate-900 text-sm">Parent & Guardian Details</h3>}>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Parent Name:</span>
                <span className="font-bold text-slate-900">{student.parentName}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Relationship:</span>
                <span className="font-medium text-slate-800">{student.relationship}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Parent Phone:</span>
                <span className="font-mono text-slate-800">{student.parentPhone}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Parent Email:</span>
                <span className="font-medium text-slate-800">{student.parentEmail}</span>
              </div>
            </div>
          </Card>

          <Card header={<h3 className="font-bold text-slate-900 text-sm">Emergency Contact</h3>}>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Emergency Contact:</span>
                <span className="font-bold text-slate-900">{student.emergencyName}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Relationship:</span>
                <span className="font-medium text-slate-800">{student.emergencyRelationship}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-400">Emergency Phone:</span>
                <span className="font-mono text-rose-600 font-bold">{student.emergencyPhone}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Attendance */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-emerald-50 border-emerald-200 text-emerald-900">
              <p className="text-xs uppercase font-bold text-emerald-700">Attendance Rating</p>
              <p className="text-3xl font-black mt-1">{student.attendancePercentage}%</p>
              <p className="text-xs text-emerald-700 mt-1">Excellent performance record</p>
            </Card>
            <Card className="bg-blue-50 border-blue-200 text-blue-900">
              <p className="text-xs uppercase font-bold text-blue-700">Days Present</p>
              <p className="text-3xl font-black mt-1">{student.totalPresent} Sessions</p>
            </Card>
            <Card className="bg-rose-50 border-rose-200 text-rose-900">
              <p className="text-xs uppercase font-bold text-rose-700">Days Absent</p>
              <p className="text-3xl font-black mt-1">{student.totalAbsent} Sessions</p>
            </Card>
          </div>

          <Card header={<h3 className="font-bold text-slate-900 text-sm">Recent Attendance History</h3>}>
            <div className="space-y-2">
              {[
                { date: '2026-09-22', status: 'Present', remarks: 'On time. Completed 20x50m freestyle laps.' },
                { date: '2026-09-20', status: 'Present', remarks: 'Good stamina.' },
                { date: '2026-09-18', status: 'Present', remarks: 'Participated in tactical drill.' },
                { date: '2026-09-15', status: 'Absent', remarks: 'Prior permission requested for medical rest.' },
                { date: '2026-09-13', status: 'Present', remarks: 'Full session completed.' }
              ].map((rec, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{formatDate(rec.date)}</span>
                    <p className="text-slate-500 mt-0.5">{rec.remarks}</p>
                  </div>
                  <Badge variant={rec.status === 'Present' ? 'active' : 'suspended'}>
                    {rec.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Fees */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <p className="text-xs uppercase font-bold text-slate-400">Total Course Fee</p>
              <p className="text-xl font-black text-slate-900 mt-1">{formatCurrency(student.totalFee)}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase font-bold text-slate-400">Total Paid</p>
              <p className="text-xl font-black text-emerald-600 mt-1">{formatCurrency(student.paidAmount)}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase font-bold text-slate-400">Pending Amount</p>
              <p className="text-xl font-black text-rose-600 mt-1">{formatCurrency(student.pendingAmount)}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase font-bold text-slate-400">Fee Status</p>
              <div className="mt-2">
                <Badge variant={student.feeStatus === 'Paid' ? 'paid' : 'pending'}>
                  {student.feeStatus}
                </Badge>
              </div>
            </Card>
          </div>

          <Card header={<h3 className="font-bold text-slate-900 text-sm">Installment Schedule</h3>}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-2">Installment</th>
                    <th className="pb-3 px-2">Amount</th>
                    <th className="pb-3 px-2">Due Date</th>
                    <th className="pb-3 px-2">Paid Date</th>
                    <th className="pb-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-2 font-bold text-slate-900">Installment 1 (Q1)</td>
                    <td className="py-3 px-2 font-bold">₹12,000</td>
                    <td className="py-3 px-2 text-slate-500">2026-01-15</td>
                    <td className="py-3 px-2 text-emerald-700">2026-01-10</td>
                    <td className="py-3 px-2"><Badge variant="paid">Paid</Badge></td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-2 font-bold text-slate-900">Installment 2 (Q2)</td>
                    <td className="py-3 px-2 font-bold">₹12,000</td>
                    <td className="py-3 px-2 text-slate-500">2026-09-30</td>
                    <td className="py-3 px-2 text-slate-400">-</td>
                    <td className="py-3 px-2"><Badge variant={student.pendingAmount > 0 ? 'pending' : 'paid'}>Pending</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: Payments */}
      {activeTab === 'payments' && (
        <Card header={<h3 className="font-bold text-slate-900 text-sm">Submitted Payments</h3>}>
          {payments.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No online payment submissions recorded for this student.</p>
          ) : (
            <div className="space-y-3">
              {payments.map(p => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{p.submissionNo} • {formatCurrency(p.amount)}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Transaction ID: {p.transactionId}</p>
                    <p className="text-[10px] text-slate-400 mt-1">Submitted: {p.submittedDate}</p>
                  </div>
                  <Badge variant={p.status === 'Verified' ? 'verified' : p.status === 'Rejected' ? 'rejected' : 'pending-verification'}>
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 5: Invoices */}
      {activeTab === 'invoices' && (
        <Card header={<h3 className="font-bold text-slate-900 text-sm">Generated Invoices</h3>}>
          {invoices.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No invoices issued yet.</p>
          ) : (
            <div className="space-y-3">
              {invoices.map(inv => (
                <div key={inv.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{inv.invoiceNumber}</p>
                    <p className="text-[11px] text-slate-500">Issued: {formatDate(inv.issueDate)} • Due: {formatDate(inv.dueDate)}</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">Total: {formatCurrency(inv.totalAmount)}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={inv.paymentStatus === 'Paid' ? 'paid' : 'pending'}>
                      {inv.paymentStatus}
                    </Badge>
                    <div className="mt-2">
                      <Button size="sm" variant="outline" onClick={() => navigate('/super-admin/invoices')}>
                        View Invoice
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 6: Performance */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {performances.length === 0 ? (
            <Card><p className="text-xs text-slate-500 text-center py-6">No performance rating logs submitted yet.</p></Card>
          ) : (
            performances.map(perf => (
              <Card key={perf.id} header={<h3 className="font-bold text-slate-900 text-sm">{perf.monthYear} Evaluation</h3>}>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Coach Rating:</span>
                    <span className="text-amber-500 font-bold text-sm">{'★'.repeat(perf.rating || perf.overallRating || 5)} ({perf.rating || perf.overallRating || 5}/5)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase">Technical Skill</p>
                      <p className="font-bold text-slate-900 text-sm">{perf.technicalSkills}%</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase">Stamina & Discipline</p>
                      <p className="font-bold text-slate-900 text-sm">{perf.staminaDiscipline}%</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <p className="text-[10px] text-slate-400 uppercase">Teamwork</p>
                      <p className="font-bold text-slate-900 text-sm">{perf.teamwork}%</p>
                    </div>
                  </div>
                  <p className="text-slate-700"><b>Strengths:</b> {perf.strengths}</p>
                  <p className="text-slate-700"><b>Areas for Improvement:</b> {perf.areasForImprovement}</p>
                  <p className="p-3 bg-blue-50/60 rounded-xl text-blue-900 font-medium italic">"{perf.coachRemarks}" — {perf.coachName}</p>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 7: Documents */}
      {activeTab === 'documents' && (
        <Card
          header={
            <div className="flex items-center justify-between w-full">
              <h3 className="font-bold text-slate-900 text-sm">Student Document Library</h3>
              <Button size="sm" onClick={() => setDocModal(true)} icon={<Plus className="w-4 h-4" />}>
                Upload Document
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            {docs.map(doc => (
              <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 font-bold text-xs uppercase">
                    {doc.fileType}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{doc.title}</p>
                    <p className="text-[11px] text-slate-400">{doc.fileName} • {doc.fileSize} • Uploaded {doc.uploadedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4 text-blue-600" />} onClick={() => addToast({ type: 'info', title: 'Download Triggered', message: `Downloading ${doc.fileName}` })}>
                    Download
                  </Button>
                  <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50" icon={<Trash2 className="w-4 h-4" />} onClick={() => handleDeleteDoc(doc.id, doc.title)} title="Delete Document" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upload Document Modal */}
      <Modal isOpen={docModal} onClose={() => setDocModal(false)} title="Upload Student Document">
        <form onSubmit={handleUploadDoc} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Document Title</label>
            <input
              type="text"
              required
              value={newDocTitle}
              onChange={e => setNewDocTitle(e.target.value)}
              placeholder="e.g. Aadhaar Card / Medical Report"
              className="w-full border border-slate-300 rounded-lg p-2 text-sm"
            />
          </div>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center text-xs text-slate-500">
            Click or drag PDF / Image file here to simulate upload
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDocModal(false)}>Cancel</Button>
            <Button type="submit">Save Document</Button>
          </div>
        </form>
      </Modal>

      {/* Official Printable Student Profile PDF Modal */}
      <Modal
        isOpen={pdfModal}
        onClose={() => setPdfModal(false)}
        title={`Official Student Profile Report: ${student.fullName}`}
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
          <ReportHeader title="STUDENT TRAINEE PROFILE REPORT" date={new Date().toISOString().slice(0, 10)} />

          {/* Student Profile Card Overview */}
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <img src={student.photo} alt={student.fullName} className="w-20 h-20 rounded-xl object-cover border border-slate-300 shrink-0" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs flex-1">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Full Name</p>
                <p className="font-bold text-slate-900 text-sm">{student.fullName}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Blood Group</p>
                <p className="font-bold text-rose-600 text-sm">{student.bloodGroup || 'O+'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Academy Category</p>
                <p className="font-bold text-blue-600">{student.category || 'Football Academy'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Program Type</p>
                <p className="font-semibold text-indigo-700">{student.programType || 'Day Scholar Program'}</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">Personal Details</p>
              <div className="flex justify-between"><span className="text-slate-500">Gender:</span><span className="font-semibold">{student.gender}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date of Birth:</span><span className="font-semibold">{formatDate(student.dateOfBirth)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Phone:</span><span className="font-mono">{student.phone}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Center:</span><span className="font-semibold">{student.trainingCenter || 'Kozhikode Main Campus'}</span></div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">Parent & Emergency Contact</p>
              <div className="flex justify-between"><span className="text-slate-500">Parent Name:</span><span className="font-semibold">{student.parentName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Parent Phone:</span><span className="font-mono">{student.parentPhone}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Emergency Contact:</span><span className="font-semibold">{student.emergencyName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Emergency Phone:</span><span className="font-mono font-bold text-rose-600">{student.emergencyPhone}</span></div>
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
            <ReportHeader title="STUDENT TRAINEE PROFILE REPORT" date={new Date().toISOString().slice(0, 10)} />

            {/* Student Profile Card Overview */}
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img src={student.photo} alt={student.fullName} className="w-20 h-20 rounded-xl object-cover border border-slate-300 shrink-0" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs flex-1">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Full Name</p>
                  <p className="font-bold text-slate-900 text-sm">{student.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Blood Group</p>
                  <p className="font-bold text-rose-600 text-sm">{student.bloodGroup || 'O+'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Academy Category</p>
                  <p className="font-bold text-blue-600">{student.category || 'Football Academy'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Program Type</p>
                  <p className="font-semibold text-indigo-700">{student.programType || 'Day Scholar Program'}</p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">Personal Details</p>
                <div className="flex justify-between"><span className="text-slate-500">Gender:</span><span className="font-semibold">{student.gender}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date of Birth:</span><span className="font-semibold">{formatDate(student.dateOfBirth)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Phone:</span><span className="font-mono">{student.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Center:</span><span className="font-semibold">{student.trainingCenter || 'Kozhikode Main Campus'}</span></div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">Parent & Emergency Contact</p>
                <div className="flex justify-between"><span className="text-slate-500">Parent Name:</span><span className="font-semibold">{student.parentName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Parent Phone:</span><span className="font-mono">{student.parentPhone}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Emergency Contact:</span><span className="font-semibold">{student.emergencyName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Emergency Phone:</span><span className="font-mono font-bold text-rose-600">{student.emergencyPhone}</span></div>
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
