import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { INITIAL_STUDENTS } from '../../mock-data/msrf-data';
import { Student } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';
import { CreditCard, Plus, Edit3, Percent, DollarSign } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const FeeManagementPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [discountModal, setDiscountModal] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(2000);

  const { addToast } = useNotifications();

  const filtered = students.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase()) ||
    s.course.toLowerCase().includes(search.toLowerCase())
  );

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setStudents(prev =>
      prev.map(s => {
        if (s.id === selectedStudent.id) {
          const newPending = Math.max(0, s.pendingAmount - discountAmount);
          return {
            ...s,
            pendingAmount: newPending,
            feeStatus: newPending === 0 ? 'Paid' : 'Partially Paid'
          };
        }
        return s;
      })
    );

    setDiscountModal(false);
    addToast({
      type: 'success',
      title: 'Discount Applied',
      message: `₹${discountAmount} discount applied to ${selectedStudent.fullName}.`
    });
  };

  return (
    <LayoutShell
      title="Fee Management & Installments Control"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Fees' }]}
    >
      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-900 text-white">
          <p className="text-xs uppercase font-bold text-slate-400">Total Expected Fees</p>
          <p className="text-2xl font-black text-white mt-1">₹12,48,000</p>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <p className="text-xs uppercase font-bold text-emerald-700">Total Collected</p>
          <p className="text-2xl font-black text-emerald-900 mt-1">₹10,34,000</p>
        </Card>
        <Card className="bg-rose-50 border-rose-200">
          <p className="text-xs uppercase font-bold text-rose-700">Total Outstanding</p>
          <p className="text-2xl font-black text-rose-900 mt-1">₹2,14,000</p>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <p className="text-xs uppercase font-bold text-amber-700">Overdue Installments</p>
          <p className="text-2xl font-black text-amber-900 mt-1">4 Accounts</p>
        </Card>
      </div>

      <Card
        header={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            <h3 className="font-bold text-slate-900 text-sm">Student Fee Ledgers</h3>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by student or course..."
              className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3">Course</th>
                <th className="py-3 px-3">Total Fee</th>
                <th className="py-3 px-3">Paid Amount</th>
                <th className="py-3 px-3">Pending Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map(st => (
                <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-900">{st.fullName}</p>
                    <p className="text-[11px] text-slate-400">{st.studentId}</p>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{st.course}</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">{formatCurrency(st.totalFee)}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-700">{formatCurrency(st.paidAmount)}</td>
                  <td className="py-3.5 px-3 font-bold text-rose-600">{formatCurrency(st.pendingAmount)}</td>
                  <td className="py-3.5 px-3">
                    <Badge variant={st.feeStatus === 'Paid' ? 'paid' : st.feeStatus === 'Overdue' ? 'overdue' : 'pending'}>
                      {st.feeStatus}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedStudent(st);
                          setDiscountModal(true);
                        }}
                        icon={<Percent className="w-3.5 h-3.5" />}
                      >
                        Apply Discount
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Discount Modal */}
      <Modal
        isOpen={discountModal}
        onClose={() => setDiscountModal(false)}
        title={`Apply Scholarship / Discount: ${selectedStudent?.fullName}`}
        size="sm"
      >
        <form onSubmit={handleApplyDiscount} className="space-y-4">
          <Input
            label="Discount Amount (₹)"
            type="number"
            required
            value={discountAmount}
            onChange={e => setDiscountAmount(Number(e.target.value))}
          />
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Pending:</span>
              <span className="font-bold text-slate-900">{formatCurrency(selectedStudent?.pendingAmount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Net Pending After Discount:</span>
              <span className="font-bold text-emerald-700">
                {formatCurrency(Math.max(0, (selectedStudent?.pendingAmount || 0) - discountAmount))}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setDiscountModal(false)}>Cancel</Button>
            <Button type="submit">Apply Discount</Button>
          </div>
        </form>
      </Modal>
    </LayoutShell>
  );
};
