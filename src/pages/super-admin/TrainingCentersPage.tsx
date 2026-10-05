import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { FilterBar } from '../../components/ui/FilterBar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { StatusToggle } from '../../components/ui/StatusToggle';
import { EmptyState } from '../../components/ui/EmptyState';
import { QueryState } from '../../components/ui/QueryState';
import { referenceApi } from '../../api/endpoints';
import { toTrainingCenter, toApiStatus } from '../../api/mappers';
import { useApiAction } from '../../api/hooks';
import { TrainingCenterCMS } from '../../types';
import { Plus, Trash2, Pencil, MapPin, Phone, User } from 'lucide-react';

export const TrainingCentersPage: React.FC = () => {
  const query = useQuery({ queryKey: ['training-centers'], queryFn: () => referenceApi.list('training-centers') });
  const centers = (query.data ?? []).map(toTrainingCenter);
  const { run } = useApiAction();
  // Students' filter dropdowns and forms read these lists too.
  const invalidate = [['training-centers'], ['students'], ['filter-options']];
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Active');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // List default!

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<TrainingCenterCMS | null>(null);
  const [deletingCenter, setDeletingCenter] = useState<TrainingCenterCMS | null>(null);

  const [form, setForm] = useState({
    name: '',
    location: '',
    phone: ''
  });


  const filtered = centers.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAdd = () => {
    setEditingCenter(null);
    setForm({ name: '', location: '', phone: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (c: TrainingCenterCMS) => {
    setEditingCenter(c);
    setForm({
      name: c.name,
      location: c.location,
      phone: c.phone || ''
    });
    setModalOpen(true);
  };

  const handleSaveCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const body = { name: form.name.trim(), location: form.location.trim(), phone: form.phone.trim() || null };
    const ok = editingCenter
      ? await run(() => referenceApi.update('training-centers', editingCenter.id, body), {
          success: { title: 'Training Center Updated', message: body.name },
          invalidate,
        })
      : await run(() => referenceApi.create('training-centers', body), {
          success: { title: 'Training Center Added', message: body.name },
          invalidate,
        });
    if (ok) setModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Inactive') => {
    run(() => referenceApi.update('training-centers', id, { status: toApiStatus(newStatus) }), {
      success: { type: 'info', title: 'Status Updated', message: `Training Center status set to ${newStatus}` },
      invalidate,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCenter) return;
    const target = deletingCenter;
    // The backend refuses (409) when students or coaches still use it; deactivate instead.
    await run(() => referenceApi.remove('training-centers', target.id), {
      success: { type: 'info', title: 'Training Center Removed', message: `"${target.name}" removed.` },
      errorTitle: 'Could not delete',
      invalidate,
    });
    setDeletingCenter(null);
  };

  return (
    <LayoutShell
      title="Training Centers Management"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Training Centers' }]}
      actions={
        <Button size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Add Training Center
        </Button>
      }
    >
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search center name, location..."
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
        <EmptyState title="No Training Centers Found" description="No center records match your search." />
      ) : viewMode === 'list' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className="py-3 px-4">Center Name</th>
                  <th className="py-3 px-4">Location / Address</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedData.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{c.location}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{c.phone || '-'}</td>
                    <td className="py-3.5 px-4">
                      <StatusToggle
                        status={c.status || 'Active'}
                        onChange={newStatus => handleStatusChange(c.id, newStatus)}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" icon={<Pencil className="w-3.5 h-3.5 text-blue-600" />} onClick={() => handleOpenEdit(c)} />
                        <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingCenter(c)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedData.map(c => (
            <Card key={c.id} hoverEffect className="space-y-3 bg-white border border-slate-200 text-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">{c.name}</h3>
                </div>
                <StatusToggle
                  status={c.status || 'Active'}
                  onChange={newStatus => handleStatusChange(c.id, newStatus)}
                />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{c.location}</span>
              </p>
              {c.phone && (
                <p className="text-xs text-slate-600 flex items-center gap-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{c.phone}</span>
                </p>
              )}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1 text-xs">
                <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => handleOpenEdit(c)} />
                <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingCenter(c)} />
              </div>
            </Card>
          ))}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingCenter}
        onClose={() => setDeletingCenter(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingCenter?.name}
      />

      {/* Add / Edit Training Center Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCenter ? "Edit Training Center" : "Add Training Center"}>
        <form onSubmit={handleSaveCenter} className="space-y-4">
          <Input
            label="Training Center Name"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Kozhikode Main Campus, Malappuram Sports Hub"
          />
          <Input
            label="Location / Address"
            required
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. MSRF Sports Complex, Kozhikode, Kerala"
          />
          <Input
            label="Contact Phone Number"
            isPhone
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="10-digit mobile"
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingCenter ? "Update Center" : "Save Training Center"}</Button>
          </div>
        </form>
      </Modal>
    </LayoutShell>
  );
};
