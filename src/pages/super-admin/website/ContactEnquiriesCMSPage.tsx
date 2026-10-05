import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutShell } from '../../../components/layout/LayoutShell';
import { FilterBar } from '../../../components/ui/FilterBar';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { QueryState } from '../../../components/ui/QueryState';
import { cmsApi } from '../../../api/endpoints';
import { toApiEnquiryStatus, toEnquiry } from '../../../api/mappers';
import { useApiAction } from '../../../api/hooks';
import { ContactEnquiryCMS } from '../../../types';
import { Pencil, Trash2, Mail, Phone, Calendar, MessageSquare, Tag } from 'lucide-react';

export const ContactEnquiriesCMSPage: React.FC = () => {
  const query = useQuery({ queryKey: ['enquiries'], queryFn: () => cmsApi.enquiriesAll() });
  const enquiries = (query.data ?? []).map(toEnquiry);
  const { run } = useApiAction();
  // Enquiry counts on the programmes page change with these too.
  const invalidate = [['enquiries'], ['programmes']];
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEnq, setEditingEnq] = useState<ContactEnquiryCMS | null>(null);
  const [deletingEnq, setDeletingEnq] = useState<ContactEnquiryCMS | null>(null);
  const [detailEnq, setDetailEnq] = useState<ContactEnquiryCMS | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    programmeOrSubject: '',
    message: '',
    status: 'New' as 'New' | 'Contacted' | 'Resolved'
  });


  const filtered = enquiries.filter(e => {
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.programmeOrSubject.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.phone.includes(search);
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenEdit = (enq: ContactEnquiryCMS) => {
    setEditingEnq(enq);
    setForm({
      name: enq.name,
      email: enq.email,
      phone: enq.phone,
      programmeOrSubject: enq.programmeOrSubject,
      message: enq.message,
      status: enq.status
    });
    setModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnq) return;
    const target = editingEnq;
    // Only contact details and status are editable; the message is what the parent sent.
    const ok = await run(
      () =>
        cmsApi.updateEnquiry(target.id, {
          parentName: form.name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim(),
          status: toApiEnquiryStatus(form.status),
        }),
      { success: { title: 'Enquiry Record Updated', message: form.name }, invalidate }
    );
    if (!ok) return;
    setModalOpen(false);
    if (detailEnq && detailEnq.id === target.id) {
      setDetailEnq(prev => (prev ? { ...prev, ...form } : null));
    }
  };

  const handleStatusChange = (id: string, newStatus: 'New' | 'Contacted' | 'Resolved') => {
    if (detailEnq && detailEnq.id === id) {
      setDetailEnq(prev => (prev ? { ...prev, status: newStatus } : null));
    }
    run(() => cmsApi.updateEnquiry(id, { status: toApiEnquiryStatus(newStatus) }), {
      success: { type: 'info', title: 'Status Updated', message: `Enquiry status set to ${newStatus}` },
      invalidate,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEnq) return;
    const target = deletingEnq;
    const ok = await run(() => cmsApi.deleteEnquiry(target.id), {
      success: { type: 'info', title: 'Enquiry Removed', message: `Enquiry from ${target.name} deleted.` },
      errorTitle: 'Could not delete',
      invalidate,
    });
    setDeletingEnq(null);
    if (ok && detailEnq && detailEnq.id === target.id) setDetailEnq(null);
  };

  return (
    <LayoutShell
      title="Contact Form & Programme Enquiries"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Website' }, { label: 'Enquiries' }]}
    >
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search enquiry by name, email, programme..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Status', value: 'all' },
              { label: 'New', value: 'New' },
              { label: 'Contacted', value: 'Contacted' },
              { label: 'Resolved', value: 'Resolved' }
            ]
          }
        ]}
      />

      {query.isLoading || query.error ? (
        <QueryState isLoading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>{null}</QueryState>
      ) : filtered.length === 0 ? (
        <EmptyState title="No Enquiries Found" description="No contact form submissions match your search query." />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className="py-3 px-4">Contact Name</th>
                  <th className="py-3 px-4">Programme / Subject</th>
                  <th className="py-3 px-4">Message / Query</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedData.map(enq => (
                  <tr key={enq.id} onClick={() => setDetailEnq(enq)} className="hover:bg-slate-50 cursor-pointer">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="hover:text-blue-600">{enq.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{enq.email} • {enq.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">{enq.programmeOrSubject}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">"{enq.message}"</td>
                    <td className="py-3.5 px-4 text-slate-500">{enq.submittedDate}</td>
                    <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                      <select
                        value={enq.status}
                        onChange={e => handleStatusChange(enq.id, e.target.value as any)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border cursor-pointer focus:outline-none transition-colors ${
                          enq.status === 'Resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : enq.status === 'Contacted'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingEnq(enq)} title="Delete Enquiry" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingEnq}
        onClose={() => setDeletingEnq(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingEnq?.name}
      />

      {/* Detailed View Modal */}
      {detailEnq && (
        <Modal
          isOpen={!!detailEnq}
          onClose={() => setDetailEnq(null)}
          title={`Enquiry Detail: ${detailEnq.name}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase tracking-widest block">WEBSITE CONTACT ENQUIRY</span>
                <h3 className="text-xl font-black text-white">{detailEnq.name}</h3>
                <p className="text-xs text-slate-300 font-bold mt-0.5">{detailEnq.programmeOrSubject}</p>
              </div>

              <select
                value={detailEnq.status}
                onChange={e => handleStatusChange(detailEnq.id, e.target.value as any)}
                className={`text-xs font-bold rounded-lg px-3 py-1.5 border cursor-pointer focus:outline-none ${
                  detailEnq.status === 'Resolved'
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : detailEnq.status === 'Contacted'
                    ? 'bg-blue-500 text-white border-blue-400'
                    : 'bg-amber-500 text-white border-amber-400'
                }`}
              >
                <option value="New" className="bg-slate-900 text-white">New</option>
                <option value="Contacted" className="bg-slate-900 text-white">Contacted</option>
                <option value="Resolved" className="bg-slate-900 text-white">Resolved</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Email Address</span>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>{detailEnq.email}</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone Number</span>
                <p className="font-bold text-slate-900 flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{detailEnq.phone}</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Submitted Date</span>
                <p className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{detailEnq.submittedDate}</span>
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Message / Detailed Query
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">
                "{detailEnq.message}"
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setDetailEnq(null)}>Close</Button>
              <Button onClick={() => setDetailEnq(null)}>Done</Button>
            </div>
          </div>
        </Modal>
      )}
    </LayoutShell>
  );
};
