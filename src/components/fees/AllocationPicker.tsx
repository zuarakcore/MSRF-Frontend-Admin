import React, { useEffect, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { studentsApi } from '../../api/endpoints';
import { errorMessage } from '../../api/client';
import type { Allocation, LedgerMonth } from '../../api/types';
import { formatCurrency } from '../../utils/format';

/** Months up to the current one that still owe money, oldest first. */
function payableMonths(months: LedgerMonth[]): LedgerMonth[] {
  const now = new Date();
  const current = now.getFullYear() * 12 + now.getMonth() + 1;
  return months
    .filter(m => m.year * 12 + m.month <= current && m.outstanding > 0)
    .sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month));
}

/** Spread `total` over months oldest-first, never more than each month owes. */
export function autoAllocate(months: LedgerMonth[], total: number): Allocation[] {
  let remaining = Math.round(total * 100) / 100;
  const result: Allocation[] = [];
  for (const m of months) {
    if (remaining <= 0) break;
    const amount = Math.min(m.outstanding, remaining);
    result.push({ year: m.year, month: m.month, amount });
    remaining = Math.round((remaining - amount) * 100) / 100;
  }
  return result;
}

const sum = (allocations: Allocation[]) => Math.round(allocations.reduce((t, a) => t + a.amount, 0) * 100) / 100;

/**
 * Pick which fee months a payment covers. With `fixedTotal` (verifying a parent's submission)
 * the months must add up to exactly that amount; without it the payment amount is their sum.
 */
export const AllocationPicker: React.FC<{
  studentId: string;
  fixedTotal?: number;
  value: Allocation[];
  onChange: (allocations: Allocation[]) => void;
}> = ({ studentId, fixedTotal, value, onChange }) => {
  const year = new Date().getFullYear();
  // Arrears can run over from last year.
  const ledgers = useQueries({
    queries: [year - 1, year].map(y => ({
      queryKey: ['students', studentId, 'fees', y],
      queryFn: () => studentsApi.fees(studentId, y),
    })),
  });
  const isLoading = ledgers.some(l => l.isLoading);
  const error = ledgers.find(l => l.error)?.error;
  const months = useMemo(
    () => payableMonths(ledgers.flatMap(l => l.data?.months ?? [])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ledgers[0].data, ledgers[1].data]
  );
  const [initialised, setInitialised] = useState<string | null>(null);

  // Pre-fill once per student: the fixed amount oldest-first, or the oldest month in full.
  useEffect(() => {
    if (isLoading || error || initialised === studentId) return;
    setInitialised(studentId);
    onChange(fixedTotal !== undefined ? autoAllocate(months, fixedTotal) : months.slice(0, 1).map(m => ({ year: m.year, month: m.month, amount: m.outstanding })));
  }, [isLoading, error, studentId, initialised, months, fixedTotal, onChange]);

  if (isLoading) return <p className="text-xs text-slate-500 py-3">Loading fee ledger…</p>;
  if (error) return <p className="text-xs text-rose-600 py-3">{errorMessage(error)}</p>;
  if (months.length === 0)
    return (
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
        This student has no outstanding fees up to this month.
      </p>
    );

  const amountFor = (m: LedgerMonth) => value.find(a => a.year === m.year && a.month === m.month)?.amount ?? 0;
  const setAmount = (m: LedgerMonth, raw: string) => {
    const amount = Math.max(0, Math.min(m.outstanding, Number(raw) || 0));
    const others = value.filter(a => !(a.year === m.year && a.month === m.month));
    onChange(amount > 0 ? [...others, { year: m.year, month: m.month, amount }] : others);
  };

  const allocated = sum(value);
  const totalOutstanding = months.reduce((t, m) => t + m.outstanding, 0);
  const difference = fixedTotal !== undefined ? Math.round((fixedTotal - allocated) * 100) / 100 : 0;

  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
            <tr>
              <th className="py-2 px-3 text-left">Month</th>
              <th className="py-2 px-3 text-right">Outstanding</th>
              <th className="py-2 px-3 text-right">Apply</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {months.map(m => (
              <tr key={`${m.year}-${m.month}`}>
                <td className="py-1.5 px-3 font-semibold text-slate-800">
                  {m.label}
                  {m.status === 'OVERDUE' && <span className="ml-1.5 text-[10px] font-bold text-rose-600">OVERDUE</span>}
                </td>
                <td className="py-1.5 px-3 text-right text-slate-600">{formatCurrency(m.outstanding)}</td>
                <td className="py-1.5 px-3 text-right">
                  <input
                    type="number"
                    min={0}
                    max={m.outstanding}
                    step="0.01"
                    value={amountFor(m) || ''}
                    onChange={e => setAmount(m, e.target.value)}
                    placeholder="0"
                    className="w-24 text-right border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">
          Allocated <b className="text-slate-900">{formatCurrency(allocated)}</b>
          {fixedTotal !== undefined && <> of {formatCurrency(fixedTotal)}</>}
        </span>
        {fixedTotal !== undefined && difference !== 0 && (
          <span className="font-semibold text-rose-600">
            {difference > 0 ? `${formatCurrency(difference)} still to allocate` : `${formatCurrency(-difference)} over`}
          </span>
        )}
      </div>
      {fixedTotal !== undefined && fixedTotal > totalOutstanding && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
          The submitted amount is more than this student owes ({formatCurrency(totalOutstanding)}). Check the student, or reject the
          submission.
        </p>
      )}
    </div>
  );
};

export const allocationTotal = sum;
