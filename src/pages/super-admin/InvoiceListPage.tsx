import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { INITIAL_INVOICES } from '../../mock-data/msrf-data';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { Printer, Download } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { PrintPortal } from '../../components/ui/PrintPortal';
import { ReportHeader } from '../../components/ui/ReportHeader';

export const InvoiceListPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [selectedInv, setSelectedInv] = useState<Invoice | null>(null);
  const [viewModal, setViewModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const { addToast } = useNotifications();

  const handleTriggerPrint = (inv: Invoice) => {
    setSelectedInv(inv);
    setIsPrinting(true);
  };

  return (
    <LayoutShell
      title="Billing Ledger & Printable Invoices"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Invoices' }]}
    >
      <Card header={<h3 className="font-bold text-slate-900 text-sm">Issued Official Invoices</h3>}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3">Student & Parent</th>
                <th className="py-3 px-3">Course</th>
                <th className="py-3 px-3">Issue Date</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Balance Due</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-900">{inv.studentName}</p>
                    <p className="text-[11px] text-slate-400">Parent: {inv.parentName}</p>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{inv.course}</td>
                  <td className="py-3.5 px-3 text-slate-500">{formatDate(inv.issueDate)}</td>
                  <td className="py-3.5 px-3 text-slate-500">{formatDate(inv.dueDate)}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">{formatCurrency(inv.totalAmount)}</td>
                  <td className="py-3.5 px-3 font-bold text-rose-600">{formatCurrency(inv.balanceDue)}</td>
                  <td className="py-3.5 px-3">
                    <Badge variant={inv.paymentStatus === 'Paid' ? 'paid' : inv.paymentStatus === 'Overdue' ? 'overdue' : 'pending'}>
                      {inv.paymentStatus}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleTriggerPrint(inv)}
                        className="p-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        title="Print Invoice in New Tab"
                      >
                        <Printer className="w-4 h-4 text-emerald-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Modal */}
      {selectedInv && viewModal && (
        <Modal
          isOpen={viewModal}
          onClose={() => setViewModal(false)}
          title={`Official Fee Invoice: ${selectedInv.invoiceNumber}`}
          size="lg"
        >
          <div className="space-y-6 text-xs">
            <ReportHeader title="FEE INVOICE RECEIPT" date={formatDate(selectedInv.issueDate)} />

            <div className="flex justify-between items-start pt-2 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">BILL TO:</p>
                <p className="font-black text-slate-900 text-base">{selectedInv.studentName}</p>
                {selectedInv.parentName && <p className="text-slate-700 font-medium">Parent: {selectedInv.parentName}</p>}
                <p className="text-slate-600">Kozhikode, Kerala 673011</p>
                <p className="text-slate-600 font-mono">Phone: {selectedInv.parentPhone}</p>
              </div>
              <div className="text-right space-y-1.5">
                <p className="font-bold text-slate-900 text-sm">Invoice: <span className="font-mono">{selectedInv.invoiceNumber}</span></p>
                <p className="text-slate-600 font-medium">Date: {formatDate(selectedInv.issueDate)}</p>
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
                  {selectedInv.items.map(item => (
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
              <div className="w-72 space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-200 text-slate-700">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold font-mono text-slate-900">{formatCurrency(selectedInv.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-base font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="font-mono text-lg">{formatCurrency(selectedInv.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setViewModal(false)}>Close</Button>
              <Button onClick={() => { setViewModal(false); setIsPrinting(true); }} icon={<Printer className="w-4 h-4" />}>
                Print Invoice in New Tab
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* NEW TAB PRINT PORTAL FOR INVOICE (NO CLOSE BUTTON INSIDE DOCUMENT) */}
      {selectedInv && isPrinting && (
        <PrintPortal title={`Fee_Invoice_${selectedInv.invoiceNumber}`} onClose={() => setIsPrinting(false)}>
          <div className="space-y-6 text-xs text-slate-900 font-sans">
            <ReportHeader title="FEE INVOICE RECEIPT" date={formatDate(selectedInv.issueDate)} />

            <div className="flex justify-between items-start pt-2 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">BILL TO:</p>
                <p className="font-black text-slate-900 text-base">{selectedInv.studentName}</p>
                {selectedInv.parentName && <p className="text-slate-700 font-medium">Parent: {selectedInv.parentName}</p>}
                <p className="text-slate-600">Kozhikode, Kerala 673011</p>
                <p className="text-slate-600 font-mono">Phone: {selectedInv.parentPhone}</p>
              </div>
              <div className="text-right space-y-1.5">
                <p className="font-bold text-slate-900 text-sm">Invoice: <span className="font-mono">{selectedInv.invoiceNumber}</span></p>
                <p className="text-slate-600 font-medium">Date: {formatDate(selectedInv.issueDate)}</p>
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
                  {selectedInv.items.map(item => (
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
              <div className="w-72 space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-200 text-slate-700">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold font-mono text-slate-900">{formatCurrency(selectedInv.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-base font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="font-mono text-lg">{formatCurrency(selectedInv.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <p>Malabar Challengers Football Club • Official System Generated Invoice</p>
              <p>Printed Date & Time: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
          </div>
        </PrintPortal>
      )}
    </LayoutShell>
  );
};
