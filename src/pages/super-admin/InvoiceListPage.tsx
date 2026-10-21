import React, { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FilterBar } from '../../components/ui/FilterBar';
import { Pagination } from '../../components/ui/Pagination';
import { QueryState } from '../../components/ui/QueryState';
import { EmptyState } from '../../components/ui/EmptyState';
import { feesApi } from '../../api/endpoints';
import { PAYMENT_MODE, toReceiptInvoice } from '../../api/mappers';
import { errorMessage } from '../../api/client';
import type { PaymentMode, PaymentOut } from '../../api/types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Printer, Receipt } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { PrintPortal } from '../../components/ui/PrintPortal';
import { ReportHeader } from '../../components/ui/ReportHeader';

/** Every fee receipt the backend has issued (GET /payments), with a printable copy of each. */
export const InvoiceListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<PaymentMode | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [printing, setPrinting] = useState<PaymentOut | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { addToast } = useNotifications();

  const listQuery = {
    page,
    pageSize,
    search: search.trim() || undefined,
    mode: modeFilter === 'ALL' ? undefined : modeFilter,
  };
  const payments = useQuery({
    queryKey: ['payments', listQuery],
    queryFn: () => feesApi.payments(listQuery),
    placeholderData: keepPreviousData,
  });
  const rows = payments.data?.items ?? [];

  // Print from the full record so the receipt always matches the server copy.
  const handlePrint = async (id: string) => {
    setLoadingId(id);
    try {
      setPrinting(await feesApi.payment(id));
    } catch (error) {
      addToast({ type: 'error', title: 'Could not load receipt', message: errorMessage(error) });
    } finally {
      setLoadingId(null);
    }
  };

  const receipt = printing ? toReceiptInvoice(printing) : null;

  return (
    <LayoutShell title="Fee Receipts" breadcrumb={[{ label: 'Super Admin' }, { label: 'Receipts' }]}>
      <FilterBar
        searchValue={search}
        onSearchChange={value => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search receipt number, student or parent phone..."
        filters={[
          {
            key: 'mode',
            label: 'Payment Mode',
            value: modeFilter,
            onChange: value => {
              setModeFilter(value as PaymentMode | 'ALL');
              setPage(1);
            },
            options: [
              { label: 'All Modes', value: 'ALL' },
              ...Object.entries(PAYMENT_MODE).map(([value, label]) => ({ label, value })),
            ],
          },
        ]}
      />

      <Card header={<h3 className="font-bold text-slate-900 text-sm">Issued Receipts</h3>}>
        <QueryState isLoading={payments.isLoading} error={payments.error} onRetry={() => payments.refetch()}>
          {rows.length === 0 ? (
            <EmptyState
              icon={<Receipt className="w-7 h-7 text-slate-400" />}
              title="No receipts found"
              description="Receipts appear here when a payment is recorded or a payment submission is verified."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left border-collapse text-xs [&_th]:whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Receipt #</th>
                    <th className="py-3 px-3">Student & Parent</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Paid On</th>
                    <th className="py-3 px-3">Months</th>
                    <th className="py-3 px-3">Mode</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {rows.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">{p.receiptNumber}</td>
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-900">{p.student.fullName}</p>
                        <p className="text-[11px] text-slate-400">
                          {p.student.studentCode} • Parent: {p.student.parentName}
                        </p>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">{p.student.category.name}</td>
                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">{formatDate(p.paidOn)}</td>
                      <td className="py-3.5 px-3 text-slate-500">{p.allocations.map(a => a.label).join(', ')}</td>
                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                        {PAYMENT_MODE[p.mode]}
                        {p.source === 'SUBMISSION' && <span className="block text-[10px] text-slate-400">Parent submission</span>}
                      </td>
                      <td className={`py-3.5 px-3 font-bold whitespace-nowrap ${p.status === 'VOIDED' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge variant={p.status === 'VALID' ? 'paid' : 'rejected'}>{p.status === 'VALID' ? 'Valid' : 'Voided'}</Badge>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handlePrint(p.id)}
                          disabled={loadingId === p.id}
                          className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          title="Print Receipt"
                        >
                          <Printer className="w-4 h-4 text-emerald-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </QueryState>
      </Card>

      {payments.data && payments.data.total > 0 && (
        <Pagination
          currentPage={page}
          totalPages={payments.data.pages || 1}
          totalItems={payments.data.total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={size => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}

      {printing && receipt && (
        <PrintPortal title={`Fee_Receipt_${receipt.invoiceNumber}`} onClose={() => setPrinting(null)}>
          <div className="space-y-6 text-xs text-slate-900 font-sans">
            <ReportHeader title="FEE PAYMENT RECEIPT" date={formatDate(receipt.issueDate)} />

            {printing.status === 'VOIDED' && (
              <div className="p-3 border-2 border-rose-400 text-rose-700 font-black uppercase tracking-wider text-center">
                Voided{printing.voidReason ? `: ${printing.voidReason}` : ''}
              </div>
            )}

            <div className="flex justify-between items-start pt-2 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">RECEIVED FROM:</p>
                <p className="font-black text-slate-900 text-base">{receipt.studentName}</p>
                <p className="text-slate-600 font-mono">{printing.student.studentCode} • {receipt.category}</p>
                {receipt.parentName && <p className="text-slate-700 font-medium">Parent: {receipt.parentName}</p>}
                <p className="text-slate-600 font-mono">Phone: {receipt.parentPhone}</p>
              </div>
              <div className="text-right space-y-1.5">
                <p className="font-bold text-slate-900 text-sm">Receipt: <span className="font-mono">{receipt.invoiceNumber}</span></p>
                <p className="text-slate-600 font-medium">Paid on: {formatDate(receipt.issueDate)}</p>
                <p className="text-slate-600 font-medium">
                  Mode: {PAYMENT_MODE[printing.mode]}
                  {printing.reference ? ` (Ref ${printing.reference})` : ''}
                </p>
              </div>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">DESCRIPTION</th>
                  <th className="py-3 px-4">PERIOD</th>
                  <th className="py-3 px-4 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {receipt.items.map(item => (
                  <tr key={item.id}>
                    <td className="py-3.5 px-4 font-bold text-slate-900">Monthly Fee</td>
                    <td className="py-3.5 px-4 text-slate-700">{item.period}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end pt-2">
              <div className="w-72 flex justify-between items-center py-2 border-t border-slate-200 text-base font-black text-slate-900">
                <span>Total Paid</span>
                <span className="font-mono text-lg">{formatCurrency(receipt.totalAmount)}</span>
              </div>
            </div>

            {printing.remarks && <p className="text-slate-600">Remarks: {printing.remarks}</p>}

            <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <p>Malabar Challengers Football Club • System generated receipt{printing.recordedBy ? ` • Recorded by ${printing.recordedBy}` : ''}</p>
              <p>Printed: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
          </div>
        </PrintPortal>
      )}
    </LayoutShell>
  );
};
