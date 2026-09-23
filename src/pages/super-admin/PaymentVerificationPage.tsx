import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { INITIAL_PAYMENTS } from '../../mock-data/msrf-data';
import { PaymentSubmission } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { CheckCircle2, XCircle, Eye, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const PaymentVerificationPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentSubmission[]>(INITIAL_PAYMENTS);
  const [selectedSub, setSelectedSub] = useState<PaymentSubmission | null>(null);

  // Modal states
  const [screenshotModal, setScreenshotModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { addToast } = useNotifications();

  const handleVerify = (id: string) => {
    setPayments(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'Verified', verifiedBy: 'Super Admin', verifiedAt: 'Just now' } : p))
    );
    addToast({ type: 'success', title: 'Payment Verified', message: 'Payment successfully credited to student ledger.' });
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
    setRejectionReason('');
    addToast({ type: 'warning', title: 'Payment Submission Rejected', message: 'Rejection notice issued to parent.' });
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

      <Card header={<h3 className="font-bold text-slate-900 text-sm">Payment Verification Queue</h3>}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Sub #</th>
                <th className="py-3 px-3">Student & Parent</th>
                <th className="py-3 px-3">Course</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Txn ID / Ref</th>
                <th className="py-3 px-3">Submitted</th>
                <th className="py-3 px-3">Screenshot</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{p.submissionNo}</td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-900">{p.studentName}</p>
                    <p className="text-[11px] text-slate-400">Parent: {p.parentName}</p>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{p.course}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-700">{formatCurrency(p.amount)}</td>
                  <td className="py-3.5 px-3 font-mono text-slate-700">{p.transactionId}</td>
                  <td className="py-3.5 px-3 text-slate-500">{p.submittedDate}</td>
                  <td className="py-3.5 px-3">
                    <button
                      onClick={() => {
                        setSelectedSub(p);
                        setScreenshotModal(true);
                      }}
                      className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                    >
                      <ImageIcon className="w-3.5 h-3.5" /> View
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
                  <td className="py-3.5 px-3 text-right">
                    {p.status === 'Pending Verification' ? (
                      <div className="flex items-center justify-end gap-1">
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
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-semibold">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Screenshot Preview Modal */}
      <Modal
        isOpen={screenshotModal}
        onClose={() => setScreenshotModal(false)}
        title={`Payment Receipt: ${selectedSub?.submissionNo}`}
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p><b>Student:</b> {selectedSub?.studentName}</p>
            <p><b>Transaction ID:</b> {selectedSub?.transactionId}</p>
            <p><b>Amount:</b> {formatCurrency(selectedSub?.amount || 0)}</p>
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-300">
            <img
              src={selectedSub?.screenshotUrl}
              alt="Payment Screenshot"
              className="w-full h-auto max-h-96 object-contain bg-slate-900"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setScreenshotModal(false)}>Close</Button>
          </div>
        </div>
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
