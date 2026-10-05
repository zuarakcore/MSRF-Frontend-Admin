import React, { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Search } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AllocationPicker, allocationTotal } from './AllocationPicker';
import { studentsApi, submissionsApi } from '../../api/endpoints';
import { errorMessage } from '../../api/client';
import type { Allocation } from '../../api/types';
import { formatCurrency } from '../../utils/format';

type StudentOption = { id: string; label: string; detail: string };

/**
 * Verify a parent's payment submission: choose the student it belongs to and the fee months it
 * pays for. The backend then records a payment and receipt (POST /payment-submissions/{id}/verify).
 */
export const VerifySubmissionModal: React.FC<{
  submissionId: string | null;
  onClose: () => void;
  onVerify: (submissionId: string, studentId: string, allocations: Allocation[]) => Promise<boolean>;
}> = ({ submissionId, onClose, onVerify }) => {
  const [studentId, setStudentId] = useState('');
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const detail = useQuery({
    queryKey: ['payment-submissions', submissionId],
    queryFn: () => submissionsApi.get(submissionId!),
    enabled: Boolean(submissionId),
  });
  const found = useQuery({
    queryKey: ['students', 'search', search],
    queryFn: () => studentsApi.list({ search, pageSize: 10, status: 'ACTIVE' }),
    enabled: search.trim().length >= 2,
  });

  const sub = detail.data;
  const candidates: StudentOption[] = (sub?.candidateStudents ?? []).map(c => ({
    id: c.id,
    label: `${c.fullName} (${c.studentCode})`,
    detail: `${c.category.name} • Parent ${c.parentName}, ${c.parentPhone}`,
  }));
  const searchResults: StudentOption[] = (found.data?.items ?? [])
    .filter(s => !candidates.some(c => c.id === s.id))
    .map(s => ({
      id: s.id,
      label: `${s.fullName} (${s.studentCode})`,
      detail: `${s.category.name} • Parent ${s.parentName}, ${s.parentPhone}`,
    }));

  // Reset when another submission is opened; pre-select a single phone match.
  useEffect(() => {
    setStudentId('');
    setAllocations([]);
    setSearch('');
  }, [submissionId]);
  useEffect(() => {
    if (!studentId && candidates.length === 1) setStudentId(candidates[0].id);
  }, [studentId, candidates]);

  const chooseStudent = (id: string) => {
    setStudentId(id);
    setAllocations([]);
  };
  const handleAllocations = useCallback((next: Allocation[]) => setAllocations(next), []);

  const ready = sub && studentId && allocations.length > 0 && allocationTotal(allocations) === sub.amount;

  const submit = async () => {
    if (!ready || !submissionId) return;
    setSubmitting(true);
    const ok = await onVerify(submissionId, studentId, allocations);
    setSubmitting(false);
    if (ok) onClose();
  };

  const renderOption = (o: StudentOption) => (
    <label
      key={o.id}
      className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
        studentId === o.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'
      }`}
    >
      <input type="radio" name="student" checked={studentId === o.id} onChange={() => chooseStudent(o.id)} className="mt-0.5" />
      <span>
        <span className="block text-xs font-bold text-slate-900">{o.label}</span>
        <span className="block text-[11px] text-slate-500">{o.detail}</span>
      </span>
    </label>
  );

  return (
    <Modal isOpen={Boolean(submissionId)} onClose={onClose} title={`Verify Payment ${sub?.submissionNumber ?? ''}`} size="lg">
      {detail.isLoading ? (
        <p className="text-xs text-slate-500">Loading submission…</p>
      ) : detail.error || !sub ? (
        <p className="text-xs text-rose-600">{errorMessage(detail.error)}</p>
      ) : (
        <div className="space-y-5 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Submitted for</p>
              <p className="font-bold text-slate-900">{sub.studentName}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Parent mobile</p>
              <p className="font-semibold text-slate-900">{sub.parentMobile}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Amount</p>
              <p className="font-bold text-emerald-700">{formatCurrency(sub.amount)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Paid on</p>
              <p className="font-semibold text-slate-900">{sub.paymentDate}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">1. Student</p>
            {candidates.length > 0 ? (
              <>
                <p className="text-[11px] text-slate-500">Students whose parent phone matches this submission:</p>
                <div className="grid gap-2">{candidates.map(renderOption)}</div>
              </>
            ) : (
              <p className="text-[11px] text-amber-700">No student has a parent phone matching {sub.parentMobile}. Search below.</p>
            )}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search another student by name, code or phone…"
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {search.trim().length >= 2 && (
              <div className="grid gap-2">
                {found.isLoading ? (
                  <p className="text-[11px] text-slate-500">Searching…</p>
                ) : searchResults.length === 0 ? (
                  <p className="text-[11px] text-slate-500">No other students match.</p>
                ) : (
                  searchResults.map(renderOption)
                )}
              </div>
            )}
          </div>

          {studentId && (
            <div className="space-y-2">
              <p className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">2. Fee months this payment covers</p>
              <AllocationPicker studentId={studentId} fixedTotal={sub.amount} value={allocations} onChange={handleAllocations} />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="success" disabled={!ready} isLoading={submitting} onClick={submit} icon={<CheckCircle2 className="w-4 h-4" />}>
              Verify & Record Payment
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
