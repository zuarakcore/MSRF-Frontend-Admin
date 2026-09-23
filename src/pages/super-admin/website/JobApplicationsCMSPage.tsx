import React, { useState } from 'react';
import { LayoutShell } from '../../../components/layout/LayoutShell';
import { FilterBar } from '../../../components/ui/FilterBar';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { INITIAL_APPLICATIONS } from '../../../mock-data/msrf-data';
import { CareerApplicationCMS } from '../../../types';
import { Edit3, Trash2 } from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext';

export const JobApplicationsCMSPage: React.FC = () => {
  const [applications, setApplications] = useState<CareerApplicationCMS[]>(INITIAL_APPLICATIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Edit / Delete Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<CareerApplicationCMS | null>(null);
  const [deletingApp, setDeletingApp] = useState<CareerApplicationCMS | null>(null);

  const [form, setForm] = useState({
    applicantName: '',
    email: '',
    phone: '',
    position: '',
    status: 'Under Review' as 'Under Review' | 'Shortlisted' | 'Rejected'
  });

  const { addToast } = useNotifications();

  const filtered = applications.filter(a => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch =
      a.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      a.position.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search);
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenEdit = (app: CareerApplicationCMS) => {
    setEditingApp(app);
    setForm({
      applicantName: app.applicantName,
      email: app.email,
      phone: app.phone,
      position: app.position,
      status: app.status
    });
    setModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    setApplications(prev =>
      prev.map(a =>
        a.id === editingApp.id
          ? { ...a, applicantName: form.applicantName, email: form.email, phone: form.phone, position: form.position, status: form.status }
          : a
      )
    );

    setModalOpen(false);
    addToast({ type: 'success', title: 'Application Updated', message: form.applicantName });
  };

  const handleStatusChange = (id: string, newStatus: 'Under Review' | 'Shortlisted' | 'Rejected') => {
    setApplications(prev => prev.map(a => (a.id === id ? { ...a, status: newStatus } : a)));
    addToast({ type: 'info', title: 'Status Updated', message: `Application status set to ${newStatus}` });
  };

  const handleDeleteConfirm = () => {
    if (!deletingApp) return;
    setApplications(prev => prev.filter(a => a.id !== deletingApp.id));
    addToast({ type: 'info', title: 'Application Deleted', message: `Application for ${deletingApp.applicantName} removed.` });
    setDeletingApp(null);
  };

  return (
    <LayoutShell
      title="Job Application Submissions"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Website' }, { label: 'Job Applications' }]}
    >
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search applicant name, email, position..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Status', value: 'all' },
              { label: 'Under Review', value: 'Under Review' },
              { label: 'Shortlisted', value: 'Shortlisted' },
              { label: 'Rejected', value: 'Rejected' }
            ]
          }
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState title="No Applications Found" description="No job applications match your search query." />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className="py-3 px-4">Applicant Name</th>
                  <th className="py-3 px-4">Applied Position</th>
                  <th className="py-3 px-4">Email & Phone</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedData.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{app.applicantName}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">{app.position}</td>
                    <td className="py-3.5 px-4 text-slate-600">{app.email} • {app.phone}</td>
                    <td className="py-3.5 px-4 text-slate-500">{app.appliedDate}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={app.status}
                        onChange={e => handleStatusChange(app.id, e.target.value as any)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border cursor-pointer focus:outline-none transition-colors ${
                          app.status === 'Shortlisted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : app.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => handleOpenEdit(app)} />
                        <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingApp(app)} />
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
        isOpen={!!deletingApp}
        onClose={() => setDeletingApp(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingApp?.applicantName}
      />

      {/* Edit Application Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit Job Application">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input label="Applicant Name" required value={form.applicantName} onChange={e => setForm({ ...form, applicantName: e.target.value })} />
          <Input label="Email Address" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <Input label="Applied Position" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
          <Select
            label="Application Status"
            options={[
              { label: 'Under Review', value: 'Under Review' },
              { label: 'Shortlisted', value: 'Shortlisted' },
              { label: 'Rejected', value: 'Rejected' }
            ]}
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value as any })}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Update Application</Button>
          </div>
        </form>
      </Modal>
    </LayoutShell>
  );
};
