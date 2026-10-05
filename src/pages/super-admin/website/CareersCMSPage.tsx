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
import { CareerDetailModal } from '../../../components/ui/CareerDetailModal';
import { StatusToggle } from '../../../components/ui/StatusToggle';
import { EmptyState } from '../../../components/ui/EmptyState';
import { QueryState } from '../../../components/ui/QueryState';
import { cmsApi } from '../../../api/endpoints';
import { emptyToNull, toCareer, todayIso } from '../../../api/mappers';
import { useApiAction } from '../../../api/hooks';
import { CareerCMS } from '../../../types';
import { Plus, Trash2, Pencil } from 'lucide-react';

export const CareersCMSPage: React.FC = () => {
  const query = useQuery({ queryKey: ['jobs'], queryFn: () => cmsApi.jobs() });
  const careers = (query.data ?? []).map(toCareer);
  const { run, pending } = useApiAction();
  const invalidate = [['jobs']];
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Active');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // List default!

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<CareerCMS | null>(null);
  const [deletingJob, setDeletingJob] = useState<CareerCMS | null>(null);
  const [detailJob, setDetailJob] = useState<CareerCMS | null>(null);

  const [form, setForm] = useState({
    position: '',
    location: 'KOZHIKODE, KERALA',
    closingDate: '',
    jobDescription: '',
    experienceRequired: '3+ Years'
  });


  const filtered = careers.filter(c => {
    const matchesStatus = statusFilter === 'all' || (c.status === 'Open' ? 'Active' : 'Inactive') === statusFilter;
    const matchesSearch =
      c.position.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.jobDescription.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAdd = () => {
    setEditingJob(null);
    setForm({ position: '', location: 'KOZHIKODE, KERALA', closingDate: '', jobDescription: '', experienceRequired: '3+ Years' });
    setModalOpen(true);
  };

  const handleOpenEdit = (c: CareerCMS) => {
    setEditingJob(c);
    setForm({
      position: c.position,
      location: c.location,
      // The form edits the ISO date; the list shows it formatted.
      closingDate: query.data?.find(j => j.id === c.id)?.closingDate ?? '',
      jobDescription: c.jobDescription,
      experienceRequired: c.experienceRequired
    });
    setModalOpen(true);
  };

  const handleSaveCareer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.position.trim()) return;
    const body = {
      title: form.position.trim(),
      location: form.location.trim(),
      description: form.jobDescription.trim() || form.position.trim(),
      experienceRequired: emptyToNull(form.experienceRequired),
      closingDate: form.closingDate || null,
    };
    const ok = editingJob
      ? await run(() => cmsApi.updateJob(editingJob.id, body), {
          success: { title: 'Job Opening Updated', message: body.title },
          invalidate,
        })
      : await run(() => cmsApi.createJob({ ...body, postedOn: todayIso() }), {
          success: { title: 'Job Opening Posted', message: body.title },
          invalidate,
        });
    if (ok) setModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Inactive') => {
    const updatedStatus = newStatus === 'Active' ? 'Open' : 'Closed';
    // Keep active detail modal updated if open
    if (detailJob && detailJob.id === id) {
      setDetailJob(prev => (prev ? { ...prev, status: updatedStatus } : null));
    }
    run(() => cmsApi.updateJob(id, { status: newStatus === 'Active' ? 'OPEN' : 'CLOSED' }), {
      success: { type: 'info', title: 'Status Updated', message: `Job opening set to ${updatedStatus}` },
      invalidate,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingJob) return;
    const target = deletingJob;
    // Jobs that already have applications cannot be deleted (409); close them instead.
    await run(() => cmsApi.deleteJob(target.id), {
      success: { type: 'info', title: 'Job Removed', message: `"${target.position}" deleted.` },
      errorTitle: 'Could not delete',
      invalidate,
    });
    setDeletingJob(null);
  };

  return (
    <LayoutShell
      title="Career Openings Management"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Website' }, { label: 'Careers' }]}
      actions={
        <Button size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Post Job Opening
        </Button>
      }
    >
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search job position, location..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
              { label: 'All Status', value: 'all' }
            ]
          }
        ]}
      />

      {query.isLoading || query.error ? (
        <QueryState isLoading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>{null}</QueryState>
      ) : filtered.length === 0 ? (
        <EmptyState title="No Career Postings Found" description="No job openings match your search." />
      ) : viewMode === 'list' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className="py-3 px-4">Position Title</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Posted Date</th>
                  <th className="py-3 px-4">Closing Date</th>
                  <th className="py-3 px-4">Description Snippet</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedData.map(c => {
                  const isActive = c.status === 'Open';
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setDetailJob(c)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm hover:text-blue-600">
                        {c.position}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{c.location}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">{c.postedDate}</td>
                      <td className="py-3.5 px-4 text-rose-600 font-mono font-bold">{c.closingDate || '—'}</td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{c.jobDescription}</td>
                      <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                        <StatusToggle
                          status={isActive ? 'Active' : 'Inactive'}
                          onChange={newStatus => handleStatusChange(c.id, newStatus)}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" icon={<Pencil className="w-3.5 h-3.5 text-blue-600" />} onClick={() => handleOpenEdit(c)} title="Edit Opening" />
                          <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingJob(c)} title="Delete Opening" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {paginatedData.map(c => {
            const isActive = c.status === 'Open';
            return (
              <Card
                key={c.id}
                onClick={() => setDetailJob(c)}
                className="bg-white text-slate-900 border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-black text-slate-900 hover:text-blue-600">{c.position}</h3>
                    <div onClick={e => e.stopPropagation()}>
                      <StatusToggle
                        status={isActive ? 'Active' : 'Inactive'}
                        onChange={newStatus => handleStatusChange(c.id, newStatus)}
                      />
                    </div>
                  </div>
                  <p className="text-xs font-mono text-slate-500">
                    📍 {c.location} • POSTED: {c.postedDate} • <span className="text-rose-600 font-bold">CLOSING: {c.closingDate || 'Open until filled'}</span> • {c.experienceRequired}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 max-w-2xl line-clamp-2">{c.jobDescription}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                  <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => handleOpenEdit(c)} />
                  <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingJob(c)} />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Career Detail View Modal */}
      <CareerDetailModal
        isOpen={!!detailJob}
        onClose={() => setDetailJob(null)}
        career={detailJob}
        onStatusChange={handleStatusChange}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingJob}
        onClose={() => setDeletingJob(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingJob?.position}
      />

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingJob ? "Edit Job Opening" : "Post Career Opening"}>
        <form onSubmit={handleSaveCareer} className="space-y-4">
          <Input label="Job Position Title" required value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} placeholder="e.g. Academy Head Coach" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <Input label="Closing Date" type="date" min={todayIso()} value={form.closingDate} onChange={e => setForm({ ...form, closingDate: e.target.value })} />
          </div>
          <Input label="Experience Required" value={form.experienceRequired} onChange={e => setForm({ ...form, experienceRequired: e.target.value })} placeholder="e.g. 5+ Years (AFC / UEFA License)" />
          
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Job Description</label>
            <textarea
              rows={4}
              value={form.jobDescription}
              onChange={e => setForm({ ...form, jobDescription: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 mt-1"
              placeholder="Lead technical development of youth teams..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={pending}>{editingJob ? "Update Job Opening" : "Post Job Opening"}</Button>
          </div>
        </form>
      </Modal>
    </LayoutShell>
  );
};
