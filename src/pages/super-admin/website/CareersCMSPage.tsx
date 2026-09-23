import React, { useState } from 'react';
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
import { INITIAL_CAREERS } from '../../../mock-data/msrf-data';
import { CareerCMS } from '../../../types';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext';

export const CareersCMSPage: React.FC = () => {
  const [careers, setCareers] = useState<CareerCMS[]>(INITIAL_CAREERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
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
    jobDescription: '',
    experienceRequired: '3+ Years'
  });

  const { addToast } = useNotifications();

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
    setForm({ position: '', location: 'KOZHIKODE, KERALA', jobDescription: '', experienceRequired: '3+ Years' });
    setModalOpen(true);
  };

  const handleOpenEdit = (c: CareerCMS) => {
    setEditingJob(c);
    setForm({
      position: c.position,
      location: c.location,
      jobDescription: c.jobDescription,
      experienceRequired: c.experienceRequired
    });
    setModalOpen(true);
  };

  const handleSaveCareer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.position) return;

    if (editingJob) {
      setCareers(prev =>
        prev.map(c =>
          c.id === editingJob.id
            ? { ...c, position: form.position, location: form.location, jobDescription: form.jobDescription, experienceRequired: form.experienceRequired }
            : c
        )
      );
      addToast({ type: 'success', title: 'Job Opening Updated', message: form.position });
    } else {
      const newJob: CareerCMS = {
        id: `job-${Date.now()}`,
        position: form.position,
        location: form.location,
        postedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
        jobDescription: form.jobDescription,
        experienceRequired: form.experienceRequired,
        status: 'Open',
        applicationsCount: 0
      };
      setCareers([newJob, ...careers]);
      addToast({ type: 'success', title: 'Job Opening Posted', message: newJob.position });
    }

    setModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Inactive') => {
    const updatedStatus = newStatus === 'Active' ? 'Open' : 'Closed';
    setCareers(prev => prev.map(c => (c.id === id ? { ...c, status: updatedStatus } : c)));

    // Keep active detail modal updated if open
    if (detailJob && detailJob.id === id) {
      setDetailJob(prev => prev ? { ...prev, status: updatedStatus } : null);
    }
    addToast({ type: 'info', title: 'Status Updated', message: `Job opening set to ${newStatus}` });
  };

  const handleDeleteConfirm = () => {
    if (!deletingJob) return;
    setCareers(prev => prev.filter(c => c.id !== deletingJob.id));
    addToast({ type: 'info', title: 'Job Removed', message: `"${deletingJob.position}" deleted.` });
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
              { label: 'All Status', value: 'all' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' }
            ]
          }
        ]}
      />

      {filtered.length === 0 ? (
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
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{c.jobDescription}</td>
                      <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                        <StatusToggle
                          status={isActive ? 'Active' : 'Inactive'}
                          onChange={newStatus => handleStatusChange(c.id, newStatus)}
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" icon={<Edit3 className="w-3.5 h-3.5 text-blue-600" />} onClick={() => handleOpenEdit(c)} title="Edit Opening" />
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
                    📍 {c.location} • POSTED: {c.postedDate} • {c.experienceRequired}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 max-w-2xl line-clamp-2">{c.jobDescription}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                  <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => handleOpenEdit(c)} />
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
          <Input label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
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
            <Button type="submit">{editingJob ? "Update Job Opening" : "Post Job Opening"}</Button>
          </div>
        </form>
      </Modal>
    </LayoutShell>
  );
};
