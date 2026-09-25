import React, { useState } from 'react';
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
import { INITIAL_PROGRAM_TYPES } from '../../mock-data/msrf-data';
import { ProgramTypeCMS } from '../../types';
import { Plus, Trash2, Pencil, Layers } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const ProgramTypesCMSPage: React.FC = () => {
  const [programTypes, setProgramTypes] = useState<ProgramTypeCMS[]>(INITIAL_PROGRAM_TYPES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Active');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // List default!

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<ProgramTypeCMS | null>(null);
  const [deletingType, setDeletingType] = useState<ProgramTypeCMS | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: ''
  });

  const { addToast } = useNotifications();

  const filtered = programTypes.filter(pt => {
    const matchesStatus = statusFilter === 'all' || pt.status === statusFilter;
    const matchesSearch =
      pt.title.toLowerCase().includes(search.toLowerCase()) ||
      pt.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAdd = () => {
    setEditingType(null);
    setForm({ title: '', description: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (pt: ProgramTypeCMS) => {
    setEditingType(pt);
    setForm({ title: pt.title, description: pt.description });
    setModalOpen(true);
  };

  const handleSaveProgramType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (editingType) {
      setProgramTypes(prev =>
        prev.map(pt =>
          pt.id === editingType.id
            ? { ...pt, title: form.title, description: form.description }
            : pt
        )
      );
      addToast({ type: 'success', title: 'Program Type Updated', message: form.title });
    } else {
      const newType: ProgramTypeCMS = {
        id: `pt-${Date.now()}`,
        title: form.title,
        description: form.description || 'Dynamic student enrollment program type.',
        status: 'Active',
        createdAt: new Date().toISOString().slice(0, 10)
      };
      setProgramTypes([newType, ...programTypes]);
      addToast({ type: 'success', title: 'Program Type Added', message: newType.title });
    }

    setModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Inactive') => {
    setProgramTypes(prev => prev.map(pt => (pt.id === id ? { ...pt, status: newStatus } : pt)));
    addToast({ type: 'info', title: 'Status Updated', message: `Program type status set to ${newStatus}` });
  };

  const handleDeleteConfirm = () => {
    if (!deletingType) return;
    setProgramTypes(prev => prev.filter(pt => pt.id !== deletingType.id));
    addToast({ type: 'info', title: 'Program Type Removed', message: `"${deletingType.title}" removed.` });
    setDeletingType(null);
  };

  return (
    <LayoutShell
      title="Enrollment Program Types"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Program Types' }]}
      actions={
        <Button size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Add Program Type
        </Button>
      }
    >
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search program types (Day Scholar, Residential, Weekend...)"
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

      {filtered.length === 0 ? (
        <EmptyState title="No Program Types Found" description="No enrollment program types match your search." />
      ) : viewMode === 'list' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className="py-3 px-4">Program Type Title</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedData.map(pt => (
                  <tr key={pt.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-600" />
                        <span>{pt.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-md truncate">{pt.description}</td>
                    <td className="py-3.5 px-4">
                      <StatusToggle
                        status={pt.status || 'Active'}
                        onChange={newStatus => handleStatusChange(pt.id, newStatus)}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" icon={<Pencil className="w-3.5 h-3.5 text-blue-600" />} onClick={() => handleOpenEdit(pt)} />
                        <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingType(pt)} />
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
          {paginatedData.map(pt => (
            <Card key={pt.id} hoverEffect className="space-y-3 bg-white border border-slate-200 text-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">{pt.title}</h3>
                </div>
                <StatusToggle
                  status={pt.status || 'Active'}
                  onChange={newStatus => handleStatusChange(pt.id, newStatus)}
                />
              </div>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{pt.description}</p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1 text-xs">
                <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => handleOpenEdit(pt)} />
                <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingType(pt)} />
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
        isOpen={!!deletingType}
        onClose={() => setDeletingType(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingType?.title}
      />

      {/* Add / Edit Program Type Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingType ? "Edit Program Type" : "Add Program Type"}>
        <form onSubmit={handleSaveProgramType} className="space-y-4">
          <Input
            label="Program Type Title"
            required
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Day Scholar Program, Residential Program, Weekend Program"
          />
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Program Type Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 mt-1"
              placeholder="e.g. Daily morning or evening non-residential coaching sessions"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingType ? "Update Program Type" : "Save Program Type"}</Button>
          </div>
        </form>
      </Modal>
    </LayoutShell>
  );
};
