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

const ALL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export interface ComputedStudent extends Student {
  currentFee: number;
}

export const FeeManagementPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [search, setSearch] = useState('');

  // Current calendar period calculation
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth(); // 0 to 11
  const currentMonthName = ALL_MONTHS[currentMonthIndex];

  // Separate Year and Month filters (default to current year and month)
  const [yearFilter, setYearFilter] = useState<string>(String(currentYear));
  const [monthFilter, setMonthFilter] = useState<string>(currentMonthName);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Ledger overrides for recorded payments per student and month-year
  const [ledgerOverrides, setLedgerOverrides] = useState<Record<string, {
    paidAmount: number;
    discountAmount: number;
    feeStatus: 'Paid' | 'Pending';
    remarks?: string;
  }>>({});

  const [invoiceModalStudent, setInvoiceModalStudent] = useState<ComputedStudent | null>(null);
  const [reportModal, setReportModal] = useState(false);

  const [payModalStudent, setPayModalStudent] = useState<ComputedStudent | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('Cash');
  const [paymentRemarks, setPaymentRemarks] = useState<string>('');
  const [discountRemarks, setDiscountRemarks] = useState<string>('');

  const { addToast } = useNotifications();

  // Year options: Strictly NO future years (only current year and past 5 years)
  const yearOptions = [
    { label: 'All Years', value: 'ALL' },
    ...Array.from({ length: 6 }, (_, i) => {
      const yr = currentYear - i;
      return { label: String(yr), value: String(yr) };
    })
  ];

  // Month options: Strictly NO future months when current year is selected
  const monthOptions = React.useMemo(() => {
    const list = [{ label: 'All Months', value: 'ALL' }];
    if (yearFilter === String(currentYear)) {
      // If current year: only months up to the current month
      ALL_MONTHS.slice(0, currentMonthIndex + 1).forEach(m => {
        list.push({ label: m, value: m });
      });
    } else {
      // Past years or ALL: all 12 months available
      ALL_MONTHS.forEach(m => {
        list.push({ label: m, value: m });
      });
    }
    return list;
  }, [yearFilter, currentYear, currentMonthIndex]);

  // Ensure monthFilter stays valid if year changes to current year
  React.useEffect(() => {
    if (yearFilter === String(currentYear) && monthFilter !== 'ALL') {
      const mIdx = ALL_MONTHS.indexOf(monthFilter);
      if (mIdx > currentMonthIndex) {
        setMonthFilter(currentMonthName);
      }
    }
  }, [yearFilter, monthFilter, currentYear, currentMonthIndex, currentMonthName]);

  // Category options
  const categoryOptions = [
    { label: 'All Categories', value: 'ALL' },
    ...INITIAL_CATEGORIES.map(c => ({ label: c.title, value: c.title }))
  ];

  // Derive per-student ledger info for the active Year & Month
  const computedStudents = React.useMemo(() => {
    return students.map(s => {
      const isMonthlyView = monthFilter !== 'ALL';
      const targetFee = isMonthlyView ? (s.monthlyFee || Math.round(s.totalFee / 12)) : s.totalFee;

      const recordKey = `${s.id}-${yearFilter}-${monthFilter}`;
      const override = ledgerOverrides[recordKey];

      let effectivePaid: number;
      let effectiveDiscount: number;
      let effectivePending: number;
      let effectiveStatus: 'Paid' | 'Pending' | 'Overdue';
      let effectiveRemarks: string;

      if (override) {
        effectivePaid = override.paidAmount;
        effectiveDiscount = override.discountAmount;
        effectivePending = Math.max(0, targetFee - effectivePaid - effectiveDiscount);
        effectiveStatus = override.feeStatus;
        effectiveRemarks = override.remarks || '';
      } else if (isMonthlyView) {
        if (yearFilter === String(currentYear) && monthFilter === currentMonthName) {
          // Current month default state
          if (s.feeStatus === 'Paid') {
            effectivePaid = targetFee;
            effectiveDiscount = s.discountAmount || 0;
            effectivePending = 0;
            effectiveStatus = 'Paid';
          } else {
            effectivePaid = s.paidAmount > 0 ? Math.min(targetFee, Math.round(targetFee * 0.5)) : 0;
            effectiveDiscount = s.discountAmount || 0;
            effectivePending = Math.max(0, targetFee - effectivePaid - effectiveDiscount);
            effectiveStatus = effectivePending === 0 ? 'Paid' : 'Pending';
          }
        } else {
          // Past months: older months mostly cleared, with periodic pending
          const mIdx = ALL_MONTHS.indexOf(monthFilter);
          const isPending = (s.id.charCodeAt(s.id.length - 1) + mIdx) % 7 === 0;
          if (isPending) {
            effectivePaid = 0;
            effectiveDiscount = 0;
            effectivePending = targetFee;
            effectiveStatus = 'Pending';
          } else {
            effectivePaid = targetFee;
            effectiveDiscount = 0;
            effectivePending = 0;
            effectiveStatus = 'Paid';
          }
        }
        effectiveRemarks = s.remarks || (effectiveStatus === 'Paid' ? `Fee cleared for ${monthFilter} ${yearFilter}` : `Pending installment for ${monthFilter} ${yearFilter}`);
      } else {
        effectivePaid = s.paidAmount;
        effectiveDiscount = s.discountAmount || 0;
        effectivePending = s.pendingAmount;
        effectiveStatus = s.feeStatus;
        effectiveRemarks = s.remarks || '';
      }

      return {
        ...s,
        currentFee: targetFee,
        paidAmount: effectivePaid,
        discountAmount: effectiveDiscount,
        pendingAmount: effectivePending,
        feeStatus: effectiveStatus,
        remarks: effectiveRemarks
      };
    });
  }, [students, yearFilter, monthFilter, ledgerOverrides, currentYear, currentMonthName]);

  const filteredStudents = computedStudents.filter(s => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(search.toLowerCase())) ||
      (s.parentName && s.parentName.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || (s.category || 'Football Academy') === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || s.feeStatus === statusFilter;

    // Check admission date relative to selected year/month
    let matchesPeriod = true;
    if (s.admissionDate && yearFilter !== 'ALL') {
      const admYear = parseInt(s.admissionDate.slice(0, 4), 10);
      const targetYear = parseInt(yearFilter, 10);
      if (admYear > targetYear) {
        matchesPeriod = false;
      } else if (admYear === targetYear && monthFilter !== 'ALL') {
        const admMonth = parseInt(s.admissionDate.slice(5, 7), 10);
        const selMonthIdx = ALL_MONTHS.indexOf(monthFilter) + 1;
        if (admMonth > selMonthIdx) {
          matchesPeriod = false;
        }
      }
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesPeriod;
  });

  // Financial summary metrics
  const totalExpected = filteredStudents.reduce((sum, s) => sum + s.currentFee, 0);
  const totalCollected = filteredStudents.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalOutstanding = filteredStudents.reduce((sum, s) => sum + s.pendingAmount, 0);
  const pendingCount = filteredStudents.filter(s => s.pendingAmount > 0).length;

  const handleMakeFeePaid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalStudent) return;

    const recordKey = `${payModalStudent.id}-${yearFilter}-${monthFilter}`;
    const newDiscount = (payModalStudent.discountAmount || 0) + Number(discountAmount);
    const newPaid = payModalStudent.paidAmount + Number(paymentAmount);
    const targetFee = payModalStudent.monthlyFee || Math.round(payModalStudent.totalFee / 12);
    const newPending = Math.max(0, targetFee - newPaid - newDiscount);
    const newStatus: 'Paid' | 'Pending' = newPending === 0 ? 'Paid' : 'Pending';
    const finalRemarks = paymentRemarks || (discountAmount > 0 ? `Paid ₹${paymentAmount} with ₹${discountAmount} discount (${discountRemarks || 'Discount applied'})` : `Payment of ₹${paymentAmount} recorded via ${paymentMode}`);

    setLedgerOverrides(prev => ({
      ...prev,
      [recordKey]: {
        paidAmount: newPaid,
        discountAmount: newDiscount,
        feeStatus: newStatus,
        remarks: finalRemarks
      }
    }));

    setPayModalStudent(null);
    addToast({
      type: 'success',
      title: 'Payment & Discount Recorded',
      message: `Payment of ₹${paymentAmount}${discountAmount > 0 ? ` with ₹${discountAmount} discount` : ''} recorded for ${payModalStudent.fullName} for ${monthFilter} ${yearFilter}.`
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
          <p className="text-xs uppercase font-bold text-slate-400">
            {monthFilter !== 'ALL' ? `${monthFilter} Expected Fees` : 'Total Expected Fees'}
          </p>
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

      {/* FilterBar with Separate Year and Month Filters */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search student name, ID, parent or category..."
        collapsibleFilters={true}
        filters={[
          {
            key: 'year',
            label: 'Year',
            value: yearFilter,
            onChange: setYearFilter,
            options: yearOptions
          },
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
      <Card header={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">Student Fee Ledgers</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {monthFilter !== 'ALL' ? `${monthFilter} ${yearFilter !== 'ALL' ? yearFilter : ''}` : yearFilter !== 'ALL' ? `Year ${yearFilter}` : 'All Time'}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {filteredStudents.length} Students Shown
          </span>
        </div>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-3">Student Trainee</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">{monthFilter !== 'ALL' ? 'Monthly Fee' : 'Total Fee'}</th>
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
                    <td className="py-3.5 px-3 font-bold text-slate-900">{formatCurrency(st.currentFee)}</td>
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

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
            <span className="text-slate-600 font-semibold">Ledger Period:</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {monthFilter !== 'ALL' ? monthFilter : 'Annual'} {yearFilter !== 'ALL' ? yearFilter : currentYear}
            </span>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>{monthFilter !== 'ALL' ? 'Monthly' : 'Total'} Fee:</span>
              <span className="font-bold text-slate-900">{formatCurrency(payModalStudent?.currentFee || payModalStudent?.totalFee || 0)}</span>
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
            <div className="flex justify-between text-rose-700 font-bold pt-1.5 border-emerald-200 border-t">
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
                  <p className="font-bold text-slate-900 text-sm">Invoice: <span className="font-mono">MSRF-INV-{yearFilter !== 'ALL' ? yearFilter : currentYear}-{invoiceModalStudent.studentId.slice(-3)}</span></p>
                  <p className="text-slate-600 font-medium">Date: {formatDate(new Date().toISOString().slice(0, 10))}</p>
                  <p className="text-blue-600 font-bold text-xs">Period: {monthFilter !== 'ALL' ? monthFilter : 'Annual'} {yearFilter !== 'ALL' ? yearFilter : currentYear}</p>
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
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {monthFilter !== 'ALL' ? `Monthly Coaching Fee - ${monthFilter}` : 'Annual Coaching Fee'} {yearFilter !== 'ALL' ? yearFilter : currentYear}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-700">1</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-800">{formatCurrency(invoiceModalStudent.currentFee)}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(invoiceModalStudent.currentFee)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="flex justify-end pt-4">
                <div className="w-72 space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200 text-slate-700">
                    <span className="font-semibold">Subtotal</span>
                    <span className="font-bold font-mono text-slate-900">{formatCurrency(invoiceModalStudent.currentFee)}</span>
                  </div>
                  {Boolean(invoiceModalStudent.discountAmount) && (
                    <div className="flex justify-between items-center py-1.5 text-amber-700 border-b border-slate-200">
                      <span className="font-semibold">Discount / Concession</span>
                      <span className="font-bold font-mono">-{formatCurrency(invoiceModalStudent.discountAmount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 text-base font-black text-slate-900">
                    <span>Net Amount</span>
                    <span className="font-mono text-lg">{formatCurrency(invoiceModalStudent.currentFee - (invoiceModalStudent.discountAmount || 0))}</span>
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
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {monthFilter !== 'ALL' ? `Monthly Coaching Fee - ${monthFilter}` : 'Annual Coaching Fee'} {yearFilter !== 'ALL' ? yearFilter : currentYear}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-700">1</td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-800">{formatCurrency(invoiceModalStudent.currentFee)}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(invoiceModalStudent.currentFee)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals Breakdown */}
                <div className="flex justify-end pt-4">
                  <div className="w-72 space-y-3 text-xs">
                    <div className="flex justify-between items-center py-2 border-b border-slate-200 text-slate-700">
                      <span className="font-semibold">Subtotal</span>
                      <span className="font-bold font-mono text-slate-900">{formatCurrency(invoiceModalStudent.currentFee)}</span>
                    </div>
                    {Boolean(invoiceModalStudent.discountAmount) && (
                      <div className="flex justify-between items-center py-1.5 text-amber-700 border-b border-slate-200">
                        <span className="font-semibold">Discount / Concession</span>
                        <span className="font-bold font-mono">-{formatCurrency(invoiceModalStudent.discountAmount || 0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 text-base font-black text-slate-900">
                      <span>Net Amount</span>
                      <span className="font-mono text-lg">{formatCurrency(invoiceModalStudent.currentFee - (invoiceModalStudent.discountAmount || 0))}</span>
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
          <div className="flex justify-between items-center text-xs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span>Ledger Filter Period:</span>
            <span className="text-blue-700 font-bold">{monthFilter !== 'ALL' ? monthFilter : 'All Months'} {yearFilter !== 'ALL' ? yearFilter : 'All Years'}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-[10px] text-slate-400 uppercase font-bold">
                {monthFilter !== 'ALL' ? 'Total Monthly Expected' : 'Total Expected Fees'}
              </p>
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
                  <th className="py-2.5 px-3">{monthFilter !== 'ALL' ? 'Monthly Fee' : 'Total Fee'}</th>
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
                    <td className="py-2.5 px-3 font-bold">{formatCurrency(s.currentFee)}</td>
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
