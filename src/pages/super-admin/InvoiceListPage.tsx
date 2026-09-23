import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { INITIAL_INVOICES } from '../../mock-data/msrf-data';
import { Invoice } from '../../types';
import { formatCurrency, formatDate, triggerPrint } from '../../utils/format';
import { FileText, Printer, Download, Trophy, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const InvoiceListPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [selectedInv, setSelectedInv] = useState<Invoice | null>(null);
  const [printModal, setPrintModal] = useState(false);

  const { addToast } = useNotifications();

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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedInv(inv);
                        setPrintModal(true);
                      }}
                      icon={<Printer className="w-3.5 h-3.5" />}
                    >
                      Print Invoice
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Printable Professional Invoice Modal */}
      <Modal
        isOpen={printModal}
        onClose={() => setPrintModal(false)}
        title={`Official Invoice: ${selectedInv?.invoiceNumber}`}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full no-print">
            <Button variant="outline" onClick={() => setPrintModal(false)}>Close</Button>
            <div className="flex gap-2">
              <Button variant="outline" icon={<Download className="w-4 h-4" />} onClick={() => addToast({ type: 'info', title: 'PDF Export', message: 'Downloading invoice PDF...' })}>
                Save PDF
              </Button>
              <Button icon={<Printer className="w-4 h-4" />} onClick={() => triggerPrint()}>
                Print Official Invoice
              </Button>
            </div>
          </div>
        }
      >
        {selectedInv && (
          <div className="p-6 bg-white space-y-6 text-slate-800 font-sans print-only">
            {/* Header MSRF Branding */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">MALABAR SPORTS & RECREATION FOUNDATION</h1>
                  <p className="text-xs text-slate-500 font-semibold">Reg. No: KRL/MSRF/2021/804 • Calicut Campus, Kerala</p>
                  <p className="text-xs text-slate-500">Contact: accounts@msrf.org | +91 495 2720000</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-black text-blue-600 tracking-tight">TAX INVOICE</h2>
                <p className="text-xs font-mono font-bold text-slate-900 mt-1">{selectedInv.invoiceNumber}</p>
                <p className="text-xs text-slate-500 mt-0.5">Date: {formatDate(selectedInv.issueDate)}</p>
                <p className="text-xs text-slate-500">Due Date: {formatDate(selectedInv.dueDate)}</p>
              </div>
            </div>

            {/* Billed To / Student Details */}
            <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Billed To (Trainee):</p>
                <p className="font-black text-slate-900 text-sm mt-0.5">{selectedInv.studentName}</p>
                <p className="text-slate-600">Parent: {selectedInv.parentName}</p>
                <p className="text-slate-600">Phone: {selectedInv.parentPhone}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Academy & Course:</p>
                <p className="font-bold text-blue-600 text-sm mt-0.5">{selectedInv.course}</p>
                <p className="text-slate-600">Status: <span className="font-bold uppercase text-emerald-600">{selectedInv.paymentStatus}</span></p>
              </div>
            </div>

            {/* Fee Items Table */}
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-500 font-bold uppercase">
                  <th className="py-2.5">Item & Description</th>
                  <th className="py-2.5">Coaching Period</th>
                  <th className="py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {selectedInv.items.map(item => (
                  <tr key={item.id}>
                    <td className="py-3 font-bold text-slate-900">{item.description}</td>
                    <td className="py-3 text-slate-600">{item.period}</td>
                    <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations Breakdown */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(selectedInv.subtotal)}</span>
                </div>
                {selectedInv.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Scholarship Discount:</span>
                    <span>-{formatCurrency(selectedInv.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>GST / Tax (0% Exempt):</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-300">
                  <span>Total Payable:</span>
                  <span>{formatCurrency(selectedInv.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(selectedInv.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold text-sm pt-1 border-t border-slate-200">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(selectedInv.balanceDue)}</span>
                </div>
              </div>
            </div>

            {/* Payment Terms & Authorized Stamp */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
              <div>
                <p className="font-bold text-slate-800">Bank Transfer Details:</p>
                <p>Account Name: Malabar Sports and Recreation Foundation</p>
                <p>Bank: HDFC Bank, Calicut Main Branch | IFSC: HDFC0000123</p>
                <p>Account #: 50200088192831</p>
              </div>
              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-1" />
                <p className="font-bold text-slate-800">Authorized Signatory</p>
                <p className="text-[10px] text-slate-400">MSRF Accounts Department</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </LayoutShell>
  );
};
