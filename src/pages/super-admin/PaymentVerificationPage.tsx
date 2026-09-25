import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { FilterBar } from '../../components/ui/FilterBar';
import { INITIAL_PAYMENTS, INITIAL_STUDENTS } from '../../mock-data/msrf-data';
import { PaymentSubmission } from '../../types';
import { formatCurrency } from '../../utils/format';
import { CheckCircle2, XCircle, Eye, Image as ImageIcon, AlertTriangle, Pencil, Save } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const PaymentVerificationPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentSubmission[]>(INITIAL_PAYMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Pending Verification');
  
  // Selected detail modal
  const [detailModal, setDetailModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState<PaymentSubmission | null>(null);

  // Edit student name state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editedStudentName, setEditedStudentName] = useState('');

  // Rejection modal
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { addToast } = useNotifications();

  const filteredPayments = payments.filter(p => {
    // Hide verified payments from payment verification module
    if (statusFilter !== 'Verified' && p.status === 'Verified') {
      return false;
    }
    const matchesSearch =
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.parentName.toLowerCase().includes(search.toLowerCase()) ||
      p.submissionNo.toLowerCase().includes(search.toLowerCase()) ||
      p.transactionId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleVerify = (id: string) => {
    const sub = payments.find(p => p.id === id);
    setPayments(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'Verified', verifiedBy: 'Super Admin', verifiedAt: 'Just now' } : p))
    );

    if (sub) {
      // Backend phone number matching simulation
      const matchedStudent = INITIAL_STUDENTS.find(s => {
        const pPhone = sub.parentPhone || '';
        const sPhone = s.parentPhone || s.phone || '';
        const cleanSubPhone = pPhone.replace(/\D/g, '');
        const cleanStudentPhone = sPhone.replace(/\D/g, '');

        if (cleanSubPhone && cleanStudentPhone && (cleanStudentPhone.includes(cleanSubPhone) || cleanSubPhone.includes(cleanStudentPhone))) {
          return true;
        }
        return s.studentId === sub.studentId || s.fullName.toLowerCase() === sub.studentName.toLowerCase();
      });

      if (matchedStudent) {
        matchedStudent.paidAmount += sub.amount;
        matchedStudent.pendingAmount = Math.max(0, matchedStudent.totalFee - matchedStudent.paidAmount);
        matchedStudent.feeStatus = matchedStudent.pendingAmount === 0 ? 'Paid' : 'Pending';
        matchedStudent.remarks = `Auto Verified payment ${sub.submissionNo} (₹${sub.amount})`;
        
        addToast({
          type: 'success',
          title: 'Payment Verified & Marked Fee Paid',
          message: `Phone number matched (${matchedStudent.parentPhone}). Fee ledger for ${matchedStudent.fullName} automatically updated.`
        });
      } else {
        addToast({
          type: 'success',
          title: 'Payment Verified',
          message: `Submission ${sub.submissionNo} verified.`
        });
      }
    }
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !rejectionReason.trim()) return;

    setPayments(prev =>
      prev.map(p =>
        p.id === selectedSub.id
          ? { ...p, status: 'Rejected', rejectionReason }
          : p
      )
    );

    setRejectModal(false);
    setDetailModal(false);
    setRejectionReason('');
    addToast({ type: 'warning', title: 'Payment Submission Rejected', message: 'Rejection notice issued to parent.' });
  };

  // Inline edit student name from list view or detail modal
  const handleStartEditName = (p: PaymentSubmission) => {
    setEditingStudentId(p.id);
    setEditedStudentName(p.studentName);
  };

  const handleSaveStudentName = (id: string) => {
    if (!editedStudentName.trim()) return;
    setPayments(prev =>
      prev.map(p => (p.id === id ? { ...p, studentName: editedStudentName.trim() } : p))
    );
    if (selectedSub && selectedSub.id === id) {
      setSelectedSub(prev => prev ? { ...prev, studentName: editedStudentName.trim() } : null);
    }
    setEditingStudentId(null);
    addToast({ type: 'success', title: 'Student Name Updated', message: `Updated to "${editedStudentName.trim()}"` });
  };

  return (
    <LayoutShell
      title="Parent Payment Verification Workflow"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Payments' }]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-amber-50 border-amber-200">
          <p className="text-xs uppercase font-bold text-amber-700">Pending Verification</p>
          <p className="text-2xl font-black text-amber-900 mt-1">
            {payments.filter(p => p.status === 'Pending Verification').length} Submissions
          </p>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <p className="text-xs uppercase font-bold text-emerald-700">Verified Payments</p>
          <p className="text-2xl font-black text-emerald-900 mt-1">
            {payments.filter(p => p.status === 'Verified').length} Cleared
          </p>
        </Card>
        <Card className="bg-rose-50 border-rose-200">
          <p className="text-xs uppercase font-bold text-rose-700">Rejected Submissions</p>
          <p className="text-2xl font-black text-rose-900 mt-1">
            {payments.filter(p => p.status === 'Rejected').length} Flagged
          </p>
        </Card>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by student, parent, submission no, or txn ID..."
        filters={[
          {
            key: 'status',
            label: 'Verification Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Submissions', value: 'all' },
              { label: 'Pending Verification', value: 'Pending Verification' },
              { label: 'Verified', value: 'Verified' },
              { label: 'Rejected', value: 'Rejected' }
            ]
          }
        ]}
      />

      <Card header={<h3 className="font-bold text-slate-900 text-sm">Payment Verification Queue</h3>}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-3">Sub #</th>
                <th className="py-3 px-3">Student Name</th>
                <th className="py-3 px-3">Parent Name</th>
                <th className="py-3 px-3">Course</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Txn ID / Ref</th>
                <th className="py-3 px-3">Submitted</th>
                <th className="py-3 px-3">Receipt</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredPayments.map(p => (
                <tr
                  key={p.id}
                  onClick={() => {
                    setSelectedSub(p);
                    setDetailModal(true);
                  }}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{p.submissionNo}</td>
                  
                  {/* Student Name with Edit in List View */}
                  <td className="py-3.5 px-3" onClick={e => e.stopPropagation()}>
                    {editingStudentId === p.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editedStudentName}
                          onChange={e => setEditedStudentName(e.target.value)}
                          className="px-2 py-1 border border-blue-400 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 w-36 font-semibold"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveStudentName(p.id)}
                          className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                          title="Save Student Name"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group">
                        <span className="font-bold text-slate-900 hover:text-blue-600">{p.studentName}</span>
                        <button
                          onClick={() => handleStartEditName(p)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-blue-600 transition"
                          title="Edit Student Name"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-slate-600 font-medium">{p.parentName}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{p.course}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-700">{formatCurrency(p.amount)}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-700">{p.transactionId}</td>
                  <td className="py-3.5 px-3 text-slate-500">{p.submittedDate}</td>
                  <td className="py-3.5 px-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setSelectedSub(p);
                        setDetailModal(true);
                      }}
                      className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> Receipt
                    </button>
                  </td>
                  <td className="py-3.5 px-3">
                    <Badge
                      variant={
                        p.status === 'Verified'
                          ? 'verified'
                          : p.status === 'Rejected'
                          ? 'rejected'
                          : 'pending-verification'
                      }
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {p.status === 'Pending Verification' ? (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleVerify(p.id)}
                            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              setSelectedSub(p);
                              setRejectModal(true);
                            }}
                            icon={<XCircle className="w-3.5 h-3.5" />}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-semibold">Processed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment Submission Detail Modal (Includes editing student name) */}
      <Modal
        isOpen={detailModal}
        onClose={() => {
          setDetailModal(false);
          setEditingStudentId(null);
        }}
        title={`Payment Detail: ${selectedSub?.submissionNo}`}
        size="md"
      >
        {selectedSub && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Student Details</span>
                <Badge
                  variant={
                    selectedSub.status === 'Verified'
                      ? 'verified'
                      : selectedSub.status === 'Rejected'
                      ? 'rejected'
                      : 'pending-verification'
                  }
                >
                  {selectedSub.status}
                </Badge>
              </div>

              {/* Editable Student Name in Detail Modal */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Student Name</label>
                {editingStudentId === selectedSub.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedStudentName}
                      onChange={e => setEditedStudentName(e.target.value)}
                      placeholder="Student full name"
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleSaveStudentName(selectedSub.id)}
                      icon={<Save className="w-3.5 h-3.5" />}
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-900 text-sm">{selectedSub.studentName}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartEditName(selectedSub)}
                      icon={<Pencil className="w-3 h-3" />}
                    >
                      Edit Name
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-slate-700">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Parent Name</p>
                  <p className="font-semibold text-slate-900">{selectedSub.parentName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Course Enrolled</p>
                  <p className="font-semibold text-slate-900">{selectedSub.course}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Payment Amount</p>
                  <p className="font-bold text-emerald-700 text-sm">{formatCurrency(selectedSub.amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Transaction Ref / ID</p>
                  <p className="font-mono text-slate-900 font-bold">{selectedSub.transactionId}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">Payment Receipt / Screenshot</p>
              <div className="rounded-xl overflow-hidden border border-slate-300 bg-slate-900">
                <img
                  src={selectedSub.screenshotUrl}
                  alt="Payment Screenshot"
                  className="w-full h-auto max-h-72 object-contain mx-auto"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {selectedSub.status === 'Pending Verification' ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => {
                      handleVerify(selectedSub.id);
                      setDetailModal(false);
                    }}
                    icon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Approve & Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setRejectModal(true);
                    }}
                    icon={<XCircle className="w-4 h-4" />}
                  >
                    Reject Submission
                  </Button>
                </div>
              ) : (
                <span className="text-xs text-slate-500 italic">Status: {selectedSub.status}</span>
              )}
              <Button variant="outline" onClick={() => setDetailModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal with Reason */}
      <Modal
        isOpen={rejectModal}
        onClose={() => setRejectModal(false)}
        title="Reject Payment Submission"
        size="sm"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>Please state the exact reason for rejecting this payment submission.</span>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700">Rejection Reason <span className="text-rose-500">*</span></label>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Invalid bank transaction reference or screenshot illegible..."
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-500 mt-1"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setRejectModal(false)}>Cancel</Button>
            <Button type="submit" variant="danger">Confirm Rejection</Button>
          </div>
        </form>
      </Modal>
    </LayoutShell>
  );
};

