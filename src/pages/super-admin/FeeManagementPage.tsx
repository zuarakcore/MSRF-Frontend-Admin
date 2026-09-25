import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { FilterBar } from '../../components/ui/FilterBar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { INITIAL_STUDENTS, INITIAL_CATEGORIES } from '../../mock-data/msrf-data';
import { Student } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { FileText, Printer, Download, Tag, CheckCircle2, FileDown, Calendar, Trophy } from 'lucide-react';
import { PrintPortal } from '../../components/ui/PrintPortal';
import { ReportHeader } from '../../components/ui/ReportHeader';
import { useNotifications } from '../../context/NotificationContext';

export const FeeManagementPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('September 2026');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [invoiceModalStudent, setInvoiceModalStudent] = useState<Student | null>(null);
  const [reportModal, setReportModal] = useState(false);

  const [payModalStudent, setPayModalStudent] = useState<Student | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('Cash');
  const [paymentRemarks, setPaymentRemarks] = useState<string>('');
  const [discountRemarks, setDiscountRemarks] = useState<string>('');

  const { addToast } = useNotifications();

  // Month-wise options
  const monthOptions = [
    { label: 'All Months', value: 'ALL' },
    { label: 'September 2026', value: 'September 2026' },
    { label: 'August 2026', value: 'August 2026' },
    { label: 'July 2026', value: 'July 2026' },
    { label: 'June 2026', value: 'June 2026' },
    { label: 'May 2026', value: 'May 2026' }
  ];

  // Category options
  const categoryOptions = [
    { label: 'All Categories', value: 'ALL' },
    ...INITIAL_CATEGORIES.map(c => ({ label: c.title, value: c.title }))
  ];

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(search.toLowerCase())) ||
      (s.parentName && s.parentName.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || (s.category || 'Football Academy') === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || s.feeStatus === statusFilter;

    // Simulated month-wise filter for fee installments
    const matchesMonth = monthFilter === 'ALL' || true;

    return matchesSearch && matchesCategory && matchesStatus && matchesMonth;
  });

  // Financial summary metrics
  const totalExpected = filteredStudents.reduce((sum, s) => sum + s.totalFee, 0);
  const totalCollected = filteredStudents.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalOutstanding = filteredStudents.reduce((sum, s) => sum + s.pendingAmount, 0);
  const pendingCount = filteredStudents.filter(s => s.pendingAmount > 0).length;

  const handleMakeFeePaid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalStudent) return;

    setStudents(prev =>
      prev.map(s => {
        if (s.id === payModalStudent.id) {
          const newDiscount = (s.discountAmount || 0) + Number(discountAmount);
          const newPaid = s.paidAmount + Number(paymentAmount);
          const newPending = Math.max(0, s.totalFee - newPaid - newDiscount);
          return {
            ...s,
            paidAmount: newPaid,
            discountAmount: newDiscount,
            pendingAmount: newPending,
            feeStatus: newPending === 0 ? 'Paid' : 'Pending',
            remarks: paymentRemarks || (discountAmount > 0 ? `Paid ₹${paymentAmount} with ₹${discountAmount} discount (${discountRemarks || 'Absent discount'})` : `Manual payment of ₹${paymentAmount} via ${paymentMode}`)
          };
        }
        return s;
      })
    );

    setPayModalStudent(null);
    addToast({
      type: 'success',
      title: 'Payment & Discount Recorded',
      message: `Payment of ₹${paymentAmount}${discountAmount > 0 ? ` with ₹${discountAmount} discount` : ''} recorded for ${payModalStudent.fullName}.`
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <LayoutShell
      title="Fee Management & Month-Wise Ledgers"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Fee Management' }]}
      actions={
        <Button
          size="sm"
          onClick={() => setReportModal(true)}
          icon={<FileDown className="w-4 h-4 text-blue-600" />}
          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
        >
          Export PDF Financial Report
        </Button>
      }
    >
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-900 text-white">
          <p className="text-xs uppercase font-bold text-slate-400">Total Monthly Expected Fees</p>
          <p className="text-2xl font-black text-white mt-1">{formatCurrency(totalExpected)}</p>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <p className="text-xs uppercase font-bold text-emerald-700">Total Collected</p>
          <p className="text-2xl font-black text-emerald-900 mt-1">{formatCurrency(totalCollected)}</p>
        </Card>
        <Card className="bg-rose-50 border-rose-200">
          <p className="text-xs uppercase font-bold text-rose-700">Total Outstanding</p>
          <p className="text-2xl font-black text-rose-900 mt-1">{formatCurrency(totalOutstanding)}</p>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <p className="text-xs uppercase font-bold text-amber-700">Pending Fee Trainees</p>
          <p className="text-2xl font-black text-amber-900 mt-1">{pendingCount} Trainees</p>
        </Card>
      </div>

      {/* FilterBar with Collapsible Filters (Month, Category, Status) */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search student name, ID, parent or category..."
        collapsibleFilters={true}
        filters={[
          {
            key: 'month',
            label: 'Month',
            value: monthFilter,
            onChange: setMonthFilter,
            options: monthOptions
          },
          {
            key: 'category',
            label: 'Category',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: categoryOptions
          },
          {
            key: 'status',
            label: 'Fee Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Paid', value: 'Paid' },
              { label: 'Pending', value: 'Pending' }
            ]
          }
        ]}
      />

      {/* Main Fee Ledger Table */}
      <Card header={<h3 className="font-bold text-slate-900 text-sm">Student Fee Ledgers</h3>}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-3">Student Trainee</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Monthly Fee</th>
                <th className="py-3 px-3">Paid Amount</th>
                <th className="py-3 px-3">Discount</th>
                <th className="py-3 px-3">Pending Amount</th>
                <th className="py-3 px-3">Remarks</th>
                <th className="py-3 px-3">Fee Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-400">
                    No fee ledger records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900">{st.fullName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{st.studentId} • Parent: {st.parentName}</p>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-blue-600">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-blue-500" />
                        <span>{st.category || 'Football Academy'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">{formatCurrency(st.totalFee)}</td>
                    <td className="py-3.5 px-3 font-bold text-emerald-700">{formatCurrency(st.paidAmount)}</td>
                    <td className="py-3.5 px-3 font-bold text-amber-700">
                      {st.discountAmount ? formatCurrency(st.discountAmount) : '—'}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-rose-600">{formatCurrency(st.pendingAmount)}</td>
                    <td className="py-3.5 px-3 text-slate-500 italic text-[11px] max-w-[160px] truncate">
                      {st.remarks || '—'}
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge variant={st.feeStatus === 'Paid' ? 'paid' : 'pending'}>
                        {st.feeStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {st.pendingAmount > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 p-2"
                            onClick={() => {
                              setPayModalStudent(st);
                              setPaymentAmount(st.pendingAmount);
                              setDiscountAmount(0);
                              setDiscountRemarks('');
                              setPaymentMode('Cash');
                              setPaymentRemarks('');
                            }}
                            icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            title="Mark Fee Paid / Apply Discount"
                          />
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 p-2"
                          onClick={() => setInvoiceModalStudent(st)}
                          icon={<FileText className="w-4 h-4 text-blue-600" />}
                          title="View Official Invoice"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Manual Payment & Discount Modal */}
      <Modal
        isOpen={!!payModalStudent}
        onClose={() => setPayModalStudent(null)}
        title={`Record Payment / Discount: ${payModalStudent?.fullName}`}
        size="md"
      >
        <form onSubmit={handleMakeFeePaid} className="space-y-4">
          <Input
            label="Payment Amount (₹)"
            type="number"
            required
            value={paymentAmount}
            onChange={e => setPaymentAmount(Number(e.target.value))}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Manual Discount Amount (₹)"
              type="number"
              placeholder="0 (e.g. Absent discount)"
              value={discountAmount}
              onChange={e => setDiscountAmount(Number(e.target.value))}
            />
            <Input
              label="Discount Reason"
              placeholder="e.g. Absent 4 days"
              value={discountRemarks}
              onChange={e => setDiscountRemarks(e.target.value)}
            />
          </div>

          <Select
            label="Payment Method / Mode"
            options={[
              { label: 'Cash (Front Desk)', value: 'Cash' },
              { label: 'Bank Transfer (NEFT/RTGS/IMPS)', value: 'Bank Transfer' },
              { label: 'UPI / GPay / PhonePe', value: 'UPI' },
              { label: 'Cheque / DD', value: 'Cheque' }
            ]}
            value={paymentMode}
            onChange={e => setPaymentMode(e.target.value)}
          />
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">Payment Remarks / Note</label>
            <textarea
              rows={2}
              value={paymentRemarks}
              onChange={e => setPaymentRemarks(e.target.value)}
              placeholder="e.g. Paid in cash at campus front desk, Receipt #4092"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Total Course Fee:</span>
              <span className="font-bold text-slate-900">{formatCurrency(payModalStudent?.totalFee || 0)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Already Paid Amount:</span>
              <span className="font-bold text-emerald-700">{formatCurrency(payModalStudent?.paidAmount || 0)}</span>
            </div>
            {((payModalStudent?.discountAmount || 0) > 0 || discountAmount > 0) && (
              <div className="flex justify-between text-amber-700 font-semibold">
                <span>Total Discount Applied:</span>
                <span>{formatCurrency((payModalStudent?.discountAmount || 0) + discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-rose-700 font-bold pt-1.5 border-t border-emerald-200">
              <span>Remaining Balance After Payment:</span>
              <span>
                {formatCurrency(
                  Math.max(0, (payModalStudent?.pendingAmount || 0) - paymentAmount - discountAmount)
                )}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setPayModalStudent(null)}>Cancel</Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Confirm Payment & Mark Paid
            </Button>
          </div>
        </form>
      </Modal>

      {/* Fee Invoice Receipt Modal (Strictly No GST, No Scholarship, Only Total Fee, Amount Paid, Balance Due) */}
      {invoiceModalStudent && (
        <Modal
          isOpen={!!invoiceModalStudent}
          onClose={() => setInvoiceModalStudent(null)}
          title={`Fee Invoice Receipt: ${invoiceModalStudent.fullName}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* On-screen Preview */}
            <div className="p-8 bg-white space-y-6 text-slate-900 font-sans border border-slate-200 rounded-xl shadow-inner">
              {/* Header Branding Matching Image 2 */}
              <ReportHeader title="FEE INVOICE RECEIPT" date={formatDate(new Date().toISOString().slice(0, 10))} />

              {/* Bill To & Invoice Info */}
              <div className="flex justify-between items-start pt-2 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">BILL TO:</p>
                  <p className="font-black text-slate-900 text-base">{invoiceModalStudent.fullName}</p>
                  {invoiceModalStudent.parentName && <p className="text-slate-700 font-medium">Parent: {invoiceModalStudent.parentName}</p>}
                  <p className="text-slate-600">Kozhikode, Kerala 673011</p>
                  <p className="text-slate-600 font-mono">Phone: {invoiceModalStudent.parentPhone}</p>
                </div>
                <div className="text-right space-y-1.5">
                  <p className="font-bold text-slate-900 text-sm">Invoice: <span className="font-mono">MSRF-INV-2026-{invoiceModalStudent.studentId.slice(-3)}</span></p>
                  <p className="text-slate-600 font-medium">Date: {formatDate(new Date().toISOString().slice(0, 10))}</p>
                </div>
              </div>

              {/* Table Section */}
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
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-slate-900">Monthly Coaching Fee - September</td>
                      <td className="py-3.5 px-4 text-center text-slate-700">1</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-800">{formatCurrency(invoiceModalStudent.totalFee)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(invoiceModalStudent.totalFee)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="flex justify-end pt-4">
                <div className="w-72 space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200 text-slate-700">
                    <span className="font-semibold">Subtotal</span>
                    <span className="font-bold font-mono text-slate-900">{formatCurrency(invoiceModalStudent.totalFee)}</span>
                  </div>
                  {Boolean(invoiceModalStudent.discountAmount) && (
                    <div className="flex justify-between items-center py-1.5 text-amber-700 border-b border-slate-200">
                      <span className="font-semibold">Discount / Concession</span>
                      <span className="font-bold font-mono">-{formatCurrency(invoiceModalStudent.discountAmount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 text-base font-black text-slate-900">
                    <span>Net Amount</span>
                    <span className="font-mono text-lg">{formatCurrency(invoiceModalStudent.totalFee - (invoiceModalStudent.discountAmount || 0))}</span>
                  </div>
                </div>
              </div>

              {/* Auto-generated Timestamp Footer */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <p>Malabar Challengers Football Club • Official System Generated Invoice</p>
                <p>Printed Date & Time: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" onClick={() => setInvoiceModalStudent(null)}>Close</Button>
              <div className="flex gap-2">
                <Button variant="outline" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
                  Print Invoice
                </Button>
                <Button icon={<Download className="w-4 h-4" />} onClick={handlePrint}>
                  Download PDF Invoice
                </Button>
              </div>
            </div>

            {/* Printable Document Portal */}
            <PrintPortal title={`Fee_Invoice_${invoiceModalStudent.studentId}`}>
              <div className="space-y-6 text-slate-900 font-sans">
                {/* Header Branding Matching Image 2 */}
                <ReportHeader title="FEE INVOICE RECEIPT" date={formatDate(new Date().toISOString().slice(0, 10))} />

                {/* Bill To & Invoice Info */}
                <div className="flex justify-between items-start pt-2 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">BILL TO:</p>
                    <p className="font-black text-slate-900 text-base">{invoiceModalStudent.fullName}</p>
                    {invoiceModalStudent.parentName && <p className="text-slate-700 font-medium">Parent: {invoiceModalStudent.parentName}</p>}
                    <p className="text-slate-600">Kozhikode, Kerala 673011</p>
                    <p className="text-slate-600 font-mono">Phone: {invoiceModalStudent.parentPhone}</p>
                  </div>
                  <div className="text-right space-y-1.5">
                    <p className="font-bold text-slate-900 text-sm">Invoice: <span className="font-mono">MSRF-INV-2026-{invoiceModalStudent.studentId.slice(-3)}</span></p>
                    <p className="text-slate-600 font-medium">Date: {formatDate(new Date().toISOString().slice(0, 10))}</p>
                  </div>
                </div>

                {/* Table Section */}
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
                      <tr>
                        <td className="py-3.5 px-4 font-bold text-slate-900">Monthly Coaching Fee - September</td>
                        <td className="py-3.5 px-4 text-center text-slate-700">1</td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-800">{formatCurrency(invoiceModalStudent.totalFee)}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(invoiceModalStudent.totalFee)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals Breakdown */}
                <div className="flex justify-end pt-4">
                  <div className="w-72 space-y-3 text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-slate-200 text-slate-700">
                      <span className="font-semibold">Subtotal</span>
                      <span className="font-bold font-mono text-slate-900">{formatCurrency(invoiceModalStudent.totalFee)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-base font-black text-slate-900">
                      <span>Total Amount</span>
                      <span className="font-mono text-lg">{formatCurrency(invoiceModalStudent.totalFee)}</span>
                    </div>
                  </div>
                </div>

                {/* Auto-generated Timestamp Footer */}
                <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <p>MSRF Official System Generated Invoice • Confidential</p>
                  <p>Printed Date & Time: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
              </div>
            </PrintPortal>
          </div>
        </Modal>
      )}

      {/* PDF Financial Report Modal */}
      <Modal
        isOpen={reportModal}
        onClose={() => setReportModal(false)}
        title="MSRF Financial Ledger & PDF Report"
        size="lg"
        footer={
          <div className="flex justify-between w-full no-print">
            <Button variant="outline" onClick={() => setReportModal(false)}>Close</Button>
            <Button icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
              Print / Save PDF Report
            </Button>
          </div>
        }
      >
        <div className="p-6 bg-white space-y-6 text-slate-800 text-xs font-sans">
          <ReportHeader title="ACADEMIC FINANCIAL LEDGER REPORT" date={new Date().toISOString().slice(0, 10)} />

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Total Monthly Expected</p>
              <p className="text-base font-black text-slate-900 mt-0.5">{formatCurrency(totalExpected)}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-[10px] text-emerald-700 uppercase font-bold">Total Collected</p>
              <p className="text-base font-black text-emerald-900 mt-0.5">{formatCurrency(totalCollected)}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <p className="text-[10px] text-rose-700 uppercase font-bold">Total Outstanding</p>
              <p className="text-base font-black text-rose-900 mt-0.5">{formatCurrency(totalOutstanding)}</p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-600 uppercase">
                  <th className="py-2.5 px-3">Student Trainee</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Monthly Fee</th>
                  <th className="py-2.5 px-3">Paid Amount</th>
                  <th className="py-2.5 px-3">Pending</th>
                  <th className="py-2.5 px-3">Fee Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map(s => (
                  <tr key={s.id}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{s.fullName}</td>
                    <td className="py-2.5 px-3 text-blue-600 font-semibold">{s.category || 'Football Academy'}</td>
                    <td className="py-2.5 px-3 font-bold">{formatCurrency(s.totalFee)}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{formatCurrency(s.paidAmount)}</td>
                    <td className="py-2.5 px-3 font-bold text-rose-600">{formatCurrency(s.pendingAmount)}</td>
                    <td className="py-2.5 px-3 font-bold">{s.feeStatus}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                <tr>
                  <td colSpan={2} className="py-3 px-3 uppercase text-[10px] tracking-wider">Grand Total Summary ({filteredStudents.length} Trainees)</td>
                  <td className="py-3 px-3">{formatCurrency(totalExpected)}</td>
                  <td className="py-3 px-3 text-emerald-700">{formatCurrency(totalCollected)}</td>
                  <td className="py-3 px-3 text-rose-600">{formatCurrency(totalOutstanding)}</td>
                  <td className="py-3 px-3 text-blue-700">{pendingCount > 0 ? `${pendingCount} Pending` : 'All Paid'}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <p>Malabar Challengers Football Club • Official System Generated Report</p>
            <p>Printed Date & Time: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
          </div>
        </div>

        <PrintPortal>
          <div className="space-y-6 text-slate-800 text-xs font-sans">
            <ReportHeader title="ACADEMIC FINANCIAL LEDGER REPORT" date={new Date().toISOString().slice(0, 10)} />

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Monthly Expected</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{formatCurrency(totalExpected)}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-[10px] text-emerald-700 uppercase font-bold">Total Collected</p>
                <p className="text-base font-black text-emerald-900 mt-0.5">{formatCurrency(totalCollected)}</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <p className="text-[10px] text-rose-700 uppercase font-bold">Total Outstanding</p>
                <p className="text-base font-black text-rose-900 mt-0.5">{formatCurrency(totalOutstanding)}</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-600 uppercase">
                    <th className="py-2.5 px-3">Student Trainee</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Monthly Fee</th>
                    <th className="py-2.5 px-3">Paid Amount</th>
                    <th className="py-2.5 px-3">Pending</th>
                    <th className="py-2.5 px-3">Fee Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStudents.map(s => (
                    <tr key={s.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{s.fullName}</td>
                      <td className="py-2.5 px-3 text-blue-600 font-semibold">{s.category || 'Football Academy'}</td>
                      <td className="py-2.5 px-3 font-bold">{formatCurrency(s.totalFee)}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700">{formatCurrency(s.paidAmount)}</td>
                      <td className="py-2.5 px-3 font-bold text-rose-600">{formatCurrency(s.pendingAmount)}</td>
                      <td className="py-2.5 px-3 font-bold">{s.feeStatus}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                  <tr>
                    <td colSpan={2} className="py-3 px-3 uppercase text-[10px] tracking-wider">Grand Total Summary ({filteredStudents.length} Trainees)</td>
                    <td className="py-3 px-3">{formatCurrency(totalExpected)}</td>
                    <td className="py-3 px-3 text-emerald-700">{formatCurrency(totalCollected)}</td>
                    <td className="py-3 px-3 text-rose-600">{formatCurrency(totalOutstanding)}</td>
                    <td className="py-3 px-3 text-blue-700">{pendingCount > 0 ? `${pendingCount} Pending` : 'All Paid'}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

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
