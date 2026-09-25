import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { INITIAL_STUDENTS, INITIAL_PAYMENTS, INITIAL_INVOICES, INITIAL_PERFORMANCE, DEFAULT_15_CATEGORIES } from '../../mock-data/msrf-data';
import { PerformanceRecord, Invoice, PaymentSubmission } from '../../types';
import { PlayerDevelopmentReportPDF } from '../../components/ui/PlayerDevelopmentReportPDF';
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
  Trophy,
  Star
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
  const performances = INITIAL_PERFORMANCE.filter(p => p.studentId === student.id || p.studentName === student.fullName);

  // Dynamically derive complete list of invoices (paid fee receipts & issued invoices) for student
  const invoices: Invoice[] = (() => {
    const directInvoices = INITIAL_INVOICES.filter(
      i => i.studentId === student.id || i.studentName === student.fullName
    );

    const paymentInvoices: Invoice[] = payments.map((p, idx) => ({
      id: `inv-pay-${p.id}`,
      invoiceNumber: `MSRF-INV-PAID-${p.submissionNo || `2026-${String(idx + 100).padStart(3, '0')}`}`,
      studentId: student.id,
      studentName: student.fullName,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      course: p.course || student.category || 'Football Excellence',
      issueDate: p.paymentDate || (p.submittedDate ? p.submittedDate.slice(0, 10) : '2026-09-20'),
      dueDate: p.paymentDate || (p.submittedDate ? p.submittedDate.slice(0, 10) : '2026-09-20'),
      subtotal: p.amount,
      discount: 0,
      taxAmount: 0,
      totalAmount: p.amount,
      paidAmount: p.status === 'Verified' ? p.amount : 0,
      balanceDue: p.status === 'Verified' ? 0 : p.amount,
      paymentStatus: p.status === 'Verified' ? 'Paid' : 'Pending',
      items: [
        {
          id: `item-pay-${p.id}`,
          description: `Fee Payment Receipt (${p.course || student.category || 'Sports Academy'})`,
          period: 'Monthly Fee Payment',
          amount: p.amount
        }
      ]
    }));

    const combined = [...directInvoices];
    paymentInvoices.forEach(pInv => {
      if (!combined.some(c => c.invoiceNumber === pInv.invoiceNumber || c.id === pInv.id)) {
        combined.push(pInv);
      }
    });

    if (combined.length === 0 && student.paidAmount > 0) {
      combined.push({
        id: `inv-auto-paid-${student.id}`,
        invoiceNumber: `MSRF-INV-2026-${student.id.replace(/\D/g, '').padStart(3, '0')}-PAID`,
        studentId: student.id,
        studentName: student.fullName,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        course: student.category || 'Football Excellence',
        issueDate: student.admissionDate || '2026-09-01',
        dueDate: student.admissionDate || '2026-09-01',
        subtotal: student.paidAmount + (student.discountAmount || 0),
        discount: student.discountAmount || 0,
        taxAmount: 0,
        totalAmount: student.paidAmount,
        paidAmount: student.paidAmount,
        balanceDue: 0,
        paymentStatus: 'Paid',
        items: [
          {
            id: `item-auto-1-${student.id}`,
            description: `Official Fee Payment Receipt (${student.category || 'Sports Academy'})`,
            period: 'Academic Session 2026',
            amount: student.paidAmount
          }
        ]
      });
    }

    return combined;
  })();

  // Document upload state
  const [docs, setDocs] = useState(student.documents);
  const [docModal, setDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [pdfModal, setPdfModal] = useState(false);

  // Performance detail view state
  const [selectedPerfRecord, setSelectedPerfRecord] = useState<PerformanceRecord | null>(null);
  const [perfDetailModalOpen, setPerfDetailModalOpen] = useState(false);
  const [pdfPerfPrintRecord, setPdfPerfPrintRecord] = useState<PerformanceRecord | null>(null);

  // Invoice view and print state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [pdfInvoicePrint, setPdfInvoicePrint] = useState<Invoice | null>(null);

  const handleViewMonthInvoice = (monthName: string, amount: number, paidDate: string) => {
    const existingInv = invoices.find(i => i.items.some(item => item.period.includes(monthName)));
    if (existingInv) {
      setSelectedInvoice(existingInv);
    } else {
      const monthInvoice: Invoice = {
        id: `inv-month-${student.id}-${monthName.replace(/\s+/g, '-')}`,
        invoiceNumber: `MSRF-INV-${monthName.slice(0, 3).toUpperCase()}-2026-${student.id.replace(/\D/g, '').padStart(3, '0')}`,
        studentId: student.id,
        studentName: student.fullName,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        course: student.category || 'Sports Academy',
        issueDate: paidDate && paidDate !== '-' ? paidDate : '2026-01-10',
        dueDate: paidDate && paidDate !== '-' ? paidDate : '2026-01-10',
        subtotal: amount,
        discount: 0,
        taxAmount: 0,
        totalAmount: amount,
        paidAmount: amount,
        balanceDue: 0,
        paymentStatus: 'Paid',
        items: [
          {
            id: `item-${monthName}`,
            description: `Monthly Fee Payment (${student.category || 'Academy'})`,
            period: monthName,
            amount: amount
          }
        ]
      };
      setSelectedInvoice(monthInvoice);
    }
    setInvoiceModalOpen(true);
  };

  const handleViewPaymentInvoice = (p: PaymentSubmission) => {
    const existingInv = invoices.find(i => i.id === `inv-pay-${p.id}`);
    if (existingInv) {
      setSelectedInvoice(existingInv);
    } else {
      const payInvoice: Invoice = {
        id: `inv-pay-${p.id}`,
        invoiceNumber: `MSRF-INV-PAID-${p.submissionNo || `2026-${student.id.slice(-3)}`}`,
        studentId: student.id,
        studentName: student.fullName,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        course: p.course || student.category || 'Football Excellence',
        issueDate: p.paymentDate || (p.submittedDate ? p.submittedDate.slice(0, 10) : '2026-09-20'),
        dueDate: p.paymentDate || (p.submittedDate ? p.submittedDate.slice(0, 10) : '2026-09-20'),
        subtotal: p.amount,
        discount: 0,
        taxAmount: 0,
        totalAmount: p.amount,
        paidAmount: p.status === 'Verified' ? p.amount : 0,
        balanceDue: p.status === 'Verified' ? 0 : p.amount,
        paymentStatus: p.status === 'Verified' ? 'Paid' : 'Pending',
        items: [
          {
            id: `item-pay-${p.id}`,
            description: `Fee Payment Receipt (${p.course || student.category || 'Sports Academy'})`,
            period: 'Monthly Fee Payment',
            amount: p.amount
          }
        ]
      };
      setSelectedInvoice(payInvoice);
    }
    setInvoiceModalOpen(true);
  };

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
      {activeTab === 'fees' && (() => {
        const monthlyFee = student.monthlyFee || Math.round((student.totalFee || 24000) / 12) || 2000;
        const totalCourseFee = student.totalFee || (monthlyFee * 12);
        const paidMonthsCount = Math.min(12, Math.floor((student.paidAmount || 0) / monthlyFee));

        const monthsList = [
          { name: 'January 2026', short: 'Jan 2026', code: '2026-01', monthNo: 1 },
          { name: 'February 2026', short: 'Feb 2026', code: '2026-02', monthNo: 2 },
          { name: 'March 2026', short: 'Mar 2026', code: '2026-03', monthNo: 3 },
          { name: 'April 2026', short: 'Apr 2026', code: '2026-04', monthNo: 4 },
          { name: 'May 2026', short: 'May 2026', code: '2026-05', monthNo: 5 },
          { name: 'June 2026', short: 'Jun 2026', code: '2026-06', monthNo: 6 },
          { name: 'July 2026', short: 'Jul 2026', code: '2026-07', monthNo: 7 },
          { name: 'August 2026', short: 'Aug 2026', code: '2026-08', monthNo: 8 },
          { name: 'September 2026', short: 'Sep 2026', code: '2026-09', monthNo: 9 },
          { name: 'October 2026', short: 'Oct 2026', code: '2026-10', monthNo: 10 },
          { name: 'November 2026', short: 'Nov 2026', code: '2026-11', monthNo: 11 },
          { name: 'December 2026', short: 'Dec 2026', code: '2026-12', monthNo: 12 },
        ];

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card>
                <p className="text-xs uppercase font-bold text-slate-400">Total Course Fee</p>
                <p className="text-xl font-black text-slate-900 mt-1">{formatCurrency(totalCourseFee)}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{formatCurrency(monthlyFee)} / month</p>
              </Card>
              <Card>
                <p className="text-xs uppercase font-bold text-slate-400">Total Paid</p>
                <p className="text-xl font-black text-emerald-600 mt-1">{formatCurrency(student.paidAmount)}</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">{paidMonthsCount} of 12 Months Paid</p>
              </Card>
              <Card>
                <p className="text-xs uppercase font-bold text-slate-400">Pending Amount</p>
                <p className="text-xl font-black text-rose-600 mt-1">{formatCurrency(student.pendingAmount)}</p>
                <p className="text-[11px] text-rose-500 font-medium mt-0.5">{12 - paidMonthsCount} Months Remaining</p>
              </Card>
              <Card>
                <p className="text-xs uppercase font-bold text-slate-400">Fee Status</p>
                <div className="mt-2">
                  <Badge variant={student.feeStatus === 'Paid' ? 'paid' : student.feeStatus === 'Overdue' ? 'overdue' : 'pending'}>
                    {student.feeStatus}
                  </Badge>
                </div>
              </Card>
            </div>

            <Card 
              header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Month-wise Payment Schedule</h3>
                    <p className="text-[11px] text-slate-500">Monthly Fee: {formatCurrency(monthlyFee)}/month • Due on 10th of each month</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-lg border border-emerald-200">
                      {paidMonthsCount} / 12 Paid
                    </span>
                  </div>
                </div>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 px-3">Month</th>
                      <th className="pb-3 px-3">Monthly Amount</th>
                      <th className="pb-3 px-3">Due Date</th>
                      <th className="pb-3 px-3">Paid Date</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {monthsList.map((m, idx) => {
                      const isPaid = idx < paidMonthsCount;
                      // September 2026 is month index 8
                      const isPastUnpaid = !isPaid && idx < 8;
                      const status = isPaid ? 'Paid' : isPastUnpaid ? 'Overdue' : 'Pending';
                      const dueDate = `${m.code}-10`;
                      const paidDate = isPaid ? `${m.code}-08` : '-';

                      return (
                        <tr key={m.code} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900">
                            Month {m.monthNo} ({m.name})
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-800">{formatCurrency(monthlyFee)}</td>
                          <td className="py-3 px-3 text-slate-500 font-mono">{dueDate}</td>
                          <td className="py-3 px-3 font-mono text-emerald-700">{paidDate}</td>
                          <td className="py-3 px-3">
                            <Badge variant={isPaid ? 'paid' : isPastUnpaid ? 'overdue' : 'pending'}>
                              {status}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {isPaid ? (
                              <Button
                                size="sm"
                                variant="outline"
                                icon={<FileText className="w-3 h-3 text-blue-600" />}
                                onClick={() => handleViewMonthInvoice(m.name, monthlyFee, paidDate)}
                                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-bold text-[11px] py-1 px-2.5"
                              >
                                Invoice
                              </Button>
                            ) : (
                              <span className="text-slate-300 font-mono text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );
      })()}

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
                  <div className="flex items-center gap-2">
                    <Badge variant={p.status === 'Verified' ? 'verified' : p.status === 'Rejected' ? 'rejected' : 'pending-verification'}>
                      {p.status}
                    </Badge>
                    {(p.status === 'Verified' || student.paidAmount > 0) && (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<FileText className="w-3.5 h-3.5 text-blue-600" />}
                        onClick={() => handleViewPaymentInvoice(p)}
                        className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-bold text-[11px] py-1 px-2.5"
                      >
                        Invoice
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 6: Performance Ratings & Reports */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                      SUBMITTED PLAYER DEVELOPMENT REPORTS ({performances.length})
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">Month-wise 15-skill evaluation reports logged by coaching staff</p>
                  </div>
                </div>
                <Badge variant="active">{performances.length} Reports Logged</Badge>
              </div>
            }
          >
            {performances.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No player performance rating reports logged for this trainee yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider">
                      <th className="py-3.5 px-4">EVALUATION MONTH</th>
                      <th className="py-3.5 px-4">POSITION & FOOT</th>
                      <th className="py-3.5 px-4">EVALUATION DATE</th>
                      <th className="py-3.5 px-4">ASSIGNED COACH</th>
                      <th className="py-3.5 px-4 text-center">OVERALL RATING</th>
                      <th className="py-3.5 px-4 text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {performances.map(rec => (
                      <tr 
                        key={rec.id} 
                        onClick={() => { setSelectedPerfRecord(rec); setPerfDetailModalOpen(true); }}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                        title="Click to view complete 15-skill evaluation report"
                      >
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">
                          {rec.monthYear || rec.reportPeriod || 'Monthly Evaluation'}
                          <p className="text-[10px] text-slate-400 font-mono font-normal">Report ID: {rec.id}</p>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {rec.position || 'Central Midfielder'}
                          <span className="ml-2 text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200 font-extrabold">
                            {rec.strongFoot || 'Right'} Foot
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {formatDate(rec.recordedDate)}
                          <p className="text-[10px] text-slate-400 font-normal">{rec.reportPeriod || rec.monthYear}</p>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{rec.coachName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {rec.overallRating || rec.rating || 5}.0 / 5.0
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => { setSelectedPerfRecord(rec); setPerfDetailModalOpen(true); }}
                              className="p-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1 font-bold text-[11px]"
                              title="View Full Report Details"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                              View Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => setPdfPerfPrintRecord(rec)}
                              className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Print / Export PDF"
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
            )}
          </Card>
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

      {/* PERFORMANCE REPORT DETAIL MODAL */}
      {selectedPerfRecord && perfDetailModalOpen && (
        <Modal
          isOpen={perfDetailModalOpen}
          onClose={() => setPerfDetailModalOpen(false)}
          title={`Player Development Evaluation — ${selectedPerfRecord.studentName}`}
          size="xl"
        >
          <div className="space-y-5 text-xs">
            {/* Top Amber Banner */}
            <div className="bg-amber-400 p-4 rounded-2xl text-slate-900 flex justify-between items-center font-black uppercase shadow-xs">
              <div>
                <h3 className="text-base tracking-tight">{selectedPerfRecord.studentName}</h3>
                <p className="text-[11px] text-slate-900/80 font-bold mt-0.5">
                  Position: {selectedPerfRecord.position || 'Central Midfielder'} ({selectedPerfRecord.strongFoot || 'Right'} Foot) | Coach: {selectedPerfRecord.coachName}
                </p>
                <p className="text-[10px] text-slate-900/70 font-mono mt-0.5">
                  Period: {selectedPerfRecord.reportPeriod || selectedPerfRecord.monthYear} • Date: {formatDate(selectedPerfRecord.recordedDate)}
                </p>
              </div>
              <div className="bg-slate-900 text-amber-400 px-4 py-2 rounded-xl text-sm font-black flex items-center gap-1.5 shadow-md">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {selectedPerfRecord.overallRating || selectedPerfRecord.rating || 5}.0 / 5.0
              </div>
            </div>

            {/* 15-Skill Evaluation Grid Breakdown */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> 15-Skill Performance Evaluation Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {(selectedPerfRecord.skillAssessments && selectedPerfRecord.skillAssessments.length > 0
                  ? selectedPerfRecord.skillAssessments
                  : DEFAULT_15_CATEGORIES.map(cat => ({
                      category: cat,
                      rating: selectedPerfRecord.overallRating || selectedPerfRecord.rating || 4,
                      comments: 'Good execution during training sessions.'
                    }))
                ).map((sa, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[11px] text-slate-900 truncate uppercase">{sa.category}</span>
                      <span className="font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px] flex items-center gap-0.5 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {sa.rating}/5
                      </span>
                    </div>
                    {sa.comments && (
                      <p className="text-[10px] text-slate-600 italic font-medium truncate">{sa.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Areas for Improvement Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-800">
              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
                <p className="font-extrabold text-emerald-900 text-xs uppercase tracking-wider">PLAYER STRENGTHS</p>
                <p className="whitespace-pre-line text-emerald-950 font-medium text-xs leading-relaxed">{selectedPerfRecord.strengths}</p>
              </div>
              <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 space-y-1">
                <p className="font-extrabold text-rose-900 text-xs uppercase tracking-wider">AREAS FOR IMPROVEMENT</p>
                <p className="whitespace-pre-line text-rose-950 font-medium text-xs leading-relaxed">{selectedPerfRecord.areasForImprovement}</p>
              </div>
            </div>

            {/* Development Goals */}
            {selectedPerfRecord.developmentGoals && selectedPerfRecord.developmentGoals.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <p className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">KEY DEVELOPMENT GOALS</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPerfRecord.developmentGoals.map((goal, gIdx) => (
                    <span key={gIdx} className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
                      ✓ {goal}
                    </span>
                  ))}
                </div>
                {selectedPerfRecord.customGoal && (
                  <p className="text-[11px] text-slate-700 font-semibold mt-1">Goal: {selectedPerfRecord.customGoal}</p>
                )}
              </div>
            )}

            {/* Coach Comments Summary Quote Box */}
            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 text-xs">
              <p className="font-extrabold text-blue-900 text-[10px] uppercase tracking-wider mb-1">COACH'S EVALUATION REMARKS</p>
              <p className="italic text-blue-950 font-medium text-xs">"{selectedPerfRecord.coachRemarks}" — <span className="font-bold">{selectedPerfRecord.coachName}</span></p>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="outline" onClick={() => setPerfDetailModalOpen(false)}>Close</Button>
              <Button 
                onClick={() => {
                  setPerfDetailModalOpen(false);
                  setPdfPerfPrintRecord(selectedPerfRecord);
                }} 
                icon={<FileDown className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Print Player Report PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* PDF PRINT PORTAL FOR PLAYER PERFORMANCE REPORT */}
      {pdfPerfPrintRecord && (
        <PlayerDevelopmentReportPDF
          record={pdfPerfPrintRecord}
          onClose={() => setPdfPerfPrintRecord(null)}
        />
      )}

      {/* OFFICIAL INVOICE PREVIEW MODAL */}
      {selectedInvoice && invoiceModalOpen && (
        <Modal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          title={`Official Fee Invoice: ${selectedInvoice.invoiceNumber}`}
          size="lg"
        >
          <div className="space-y-6 text-xs">
            <ReportHeader title="FEE INVOICE RECEIPT" date={formatDate(selectedInvoice.issueDate)} />

            <div className="flex justify-between items-start pt-2 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">BILL TO:</p>
                <p className="font-black text-slate-900 text-base">{selectedInvoice.studentName}</p>
                {selectedInvoice.parentName && <p className="text-slate-700 font-medium">Parent: {selectedInvoice.parentName}</p>}
                <p className="text-slate-600">Kozhikode Main Campus, Kerala</p>
                <p className="text-slate-600 font-mono">Phone: {selectedInvoice.parentPhone}</p>
              </div>
              <div className="text-right space-y-1.5">
                <p className="font-bold text-slate-900 text-sm">Invoice #: <span className="font-mono">{selectedInvoice.invoiceNumber}</span></p>
                <p className="text-slate-600 font-medium">Issued: {formatDate(selectedInvoice.issueDate)}</p>
                <p className="text-slate-600 font-medium">Due Date: {formatDate(selectedInvoice.dueDate)}</p>
                <Badge variant={selectedInvoice.paymentStatus === 'Paid' ? 'paid' : selectedInvoice.paymentStatus === 'Overdue' ? 'overdue' : 'pending'}>
                  {selectedInvoice.paymentStatus}
                </Badge>
              </div>
            </div>

            <div className="pt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">DESCRIPTION</th>
                    <th className="py-3 px-4 text-center">QTY</th>
                    <th className="py-3 px-4 text-right">UNIT PRICE</th>
                    <th className="py-3 px-4 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {selectedInvoice.items.map(item => (
                    <tr key={item.id}>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{item.description}</td>
                      <td className="py-3.5 px-4 text-center text-slate-700">1</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-800">{formatCurrency(item.amount)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4">
              <div className="w-72 space-y-2 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200 text-slate-700">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold font-mono text-slate-900">{formatCurrency(selectedInvoice.subtotal || selectedInvoice.totalAmount)}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-200 text-emerald-700">
                    <span className="font-semibold">Discount Applied</span>
                    <span className="font-bold font-mono">- {formatCurrency(selectedInvoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 text-base font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="font-mono text-lg">{formatCurrency(selectedInvoice.totalAmount)}</span>
                </div>
                {selectedInvoice.balanceDue > 0 && (
                  <div className="flex justify-between items-center py-1 text-rose-600 font-extrabold text-xs">
                    <span>Balance Outstanding</span>
                    <span className="font-mono">{formatCurrency(selectedInvoice.balanceDue)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setInvoiceModalOpen(false)}>Close</Button>
              <Button 
                onClick={() => { 
                  setInvoiceModalOpen(false); 
                  setPdfInvoicePrint(selectedInvoice); 
                }} 
                icon={<Printer className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Print Official Invoice PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* PRINT PORTAL FOR INVOICE PDF EXPORT */}
      {pdfInvoicePrint && (
        <PrintPortal title={`Fee_Invoice_${pdfInvoicePrint.invoiceNumber}`} onClose={() => setPdfInvoicePrint(null)}>
          <div className="space-y-6 text-xs text-slate-900 font-sans">
            <ReportHeader title="FEE INVOICE RECEIPT" date={formatDate(pdfInvoicePrint.issueDate)} />

            <div className="flex justify-between items-start pt-2 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">BILL TO:</p>
                <p className="font-black text-slate-900 text-base">{pdfInvoicePrint.studentName}</p>
                {pdfInvoicePrint.parentName && <p className="text-slate-700 font-medium">Parent: {pdfInvoicePrint.parentName}</p>}
                <p className="text-slate-600">Kozhikode Main Campus, Kerala</p>
                <p className="text-slate-600 font-mono">Phone: {pdfInvoicePrint.parentPhone}</p>
              </div>
              <div className="text-right space-y-1.5">
                <p className="font-bold text-slate-900 text-sm">Invoice #: <span className="font-mono">{pdfInvoicePrint.invoiceNumber}</span></p>
                <p className="text-slate-600 font-medium">Issued Date: {formatDate(pdfInvoicePrint.issueDate)}</p>
                <p className="text-slate-600 font-medium">Due Date: {formatDate(pdfInvoicePrint.dueDate)}</p>
              </div>
            </div>

            <div className="pt-2">
              <table className="w-full text-left border-collapse text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-300">
                    <th className="py-3 px-4 border-r border-slate-300">DESCRIPTION</th>
                    <th className="py-3 px-4 text-center border-r border-slate-300">QTY</th>
                    <th className="py-3 px-4 text-right border-r border-slate-300">UNIT PRICE</th>
                    <th className="py-3 px-4 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-medium">
                  {pdfInvoicePrint.items.map(item => (
                    <tr key={item.id}>
                      <td className="py-3.5 px-4 font-bold text-slate-900 border-r border-slate-300">{item.description}</td>
                      <td className="py-3.5 px-4 text-center text-slate-700 border-r border-slate-300">1</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-800 border-r border-slate-300">{formatCurrency(item.amount)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4">
              <div className="w-72 space-y-2 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-200 text-slate-700">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold font-mono text-slate-900">{formatCurrency(pdfInvoicePrint.subtotal || pdfInvoicePrint.totalAmount)}</span>
                </div>
                {pdfInvoicePrint.discount > 0 && (
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-200 text-emerald-700">
                    <span className="font-semibold">Discount</span>
                    <span className="font-bold font-mono">- {formatCurrency(pdfInvoicePrint.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 text-base font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="font-mono text-lg">{formatCurrency(pdfInvoicePrint.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Signature & Official Stamp Footer */}
            <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-xs font-bold">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase">AUTHORIZED SIGNATURE</p>
                <p className="text-sm font-black text-slate-900 mt-1">MSRF Accounts Department</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Signature: __________________________</p>
              </div>
              <div className="text-right flex flex-col justify-end">
                <p className="text-[11px] font-black uppercase text-blue-600 tracking-widest">
                  MALABAR SPORTS RESEARCH FOUNDATION
                </p>
                <p className="text-[10px] text-slate-400 mt-1">OFFICIAL FEE PAYMENT RECEIPT</p>
              </div>
            </div>
          </div>
        </PrintPortal>
      )}
    </LayoutShell>
  );
};
