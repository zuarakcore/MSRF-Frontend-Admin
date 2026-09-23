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
import { StatusToggle } from '../../../components/ui/StatusToggle';
import { EmptyState } from '../../../components/ui/EmptyState';
import { INITIAL_PROGRAMMES } from '../../../mock-data/msrf-data';
import { ProgrammeCMS } from '../../../types';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext';

export const ProgrammesCMSPage: React.FC = () => {
  const [programmes, setProgrammes] = useState<ProgrammeCMS[]>(INITIAL_PROGRAMMES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // List default!

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<ProgrammeCMS | null>(null);
  const [deletingProg, setDeletingProg] = useState<ProgrammeCMS | null>(null);

  const [form, setForm] = useState({
    ageGroup: '6 - 10 YEARS',
    title: '',
    description: ''
  });

  const { addToast } = useNotifications();

  const filtered = programmes.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.ageGroup.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAdd = () => {
    setEditingProg(null);
    setForm({ ageGroup: '6 - 10 YEARS', title: '', description: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (p: ProgrammeCMS) => {
    setEditingProg(p);
    setForm({ ageGroup: p.ageGroup, title: p.title, description: p.description });
    setModalOpen(true);
  };

  const handleSaveProgramme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;

    if (editingProg) {
      setProgrammes(prev =>
        prev.map(p =>
          p.id === editingProg.id
            ? { ...p, ageGroup: form.ageGroup, title: form.title, description: form.description }
            : p
        )
      );
      addToast({ type: 'success', title: 'Programme Updated', message: form.title });
    } else {
      const newProg: ProgrammeCMS = {
        id: `prog-${Date.now()}`,
        ageGroup: form.ageGroup,
        title: form.title,
        description: form.description || 'Professional sports training program.',
        status: 'Active',
        enquiriesCount: 0
      };
      setProgrammes([newProg, ...programmes]);
      addToast({ type: 'success', title: 'Programme Published', message: newProg.title });
    }

    setModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Inactive') => {
    setProgrammes(prev => prev.map(p => (p.id === id ? { ...p, status: newStatus } : p)));
    addToast({ type: 'info', title: 'Status Updated', message: `Programme set to ${newStatus}` });
  };

  const handleDeleteConfirm = () => {
    if (!deletingProg) return;
    setProgrammes(prev => prev.filter(p => p.id !== deletingProg.id));
    addToast({ type: 'info', title: 'Programme Removed', message: `"${deletingProg.title}" deleted.` });
    setDeletingProg(null);
  };

  return (
    <LayoutShell
      title="Sports Programmes Management"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Website' }, { label: 'Programmes' }]}
      actions={
        <Button size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Add New Programme
        </Button>
      }
    >
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search sports programmes..."
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
        <EmptyState title="No Programmes Found" description="No sports programmes match your search." />
      ) : viewMode === 'list' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className="py-3 px-4">Age Group</th>
                  <th className="py-3 px-4">Programme Title</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Enquiries</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedData.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">{p.ageGroup}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">{p.title}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-md truncate">{p.description}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">{p.enquiriesCount} Enquiries</td>
                    <td className="py-3.5 px-4">
                      <StatusToggle
                        status={p.status || 'Active'}
                        onChange={newStatus => handleStatusChange(p.id, newStatus)}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => handleOpenEdit(p)} />
                        <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingProg(p)} />
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
          {paginatedData.map(p => (
            <Card key={p.id} hoverEffect className="space-y-3 bg-white border border-slate-200 text-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-widest block font-mono">
                  {p.ageGroup}
                </span>
                <StatusToggle
                  status={p.status || 'Active'}
                  onChange={newStatus => handleStatusChange(p.id, newStatus)}
                />
              </div>
              <h3 className="text-lg font-black text-slate-900">{p.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{p.description}</p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-blue-600 font-bold">{p.enquiriesCount} Enquiries</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="text-slate-600 hover:text-slate-900" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => handleOpenEdit(p)} />
                  <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingProg(p)} />
                </div>
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
        isOpen={!!deletingProg}
        onClose={() => setDeletingProg(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingProg?.title}
      />

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProg ? "Edit Sports Programme" : "Add Website Sports Programme"}>
        <form onSubmit={handleSaveProgramme} className="space-y-4">
          <Select
            label="Target Age Group"
            options={[
              { label: '6 - 10 YEARS', value: '6 - 10 YEARS' },
              { label: '11 - 14 YEARS', value: '11 - 14 YEARS' },
              { label: '15 - 18 YEARS', value: '15 - 18 YEARS' },
              { label: '10 - 18 YEARS', value: '10 - 18 YEARS' },
              { label: '8 - 16 YEARS', value: '8 - 16 YEARS' },
              { label: '14 YEARS AND ABOVE', value: '14 YEARS AND ABOVE' }
            ]}
            value={form.ageGroup}
            onChange={e => setForm({ ...form, ageGroup: e.target.value })}
          />
          <Input label="Programme Title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Grassroots Kids Football" />
          
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Programme Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 mt-1"
              placeholder="A fun-first program introducing ball mastery..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingProg ? "Update Programme" : "Publish Programme"}</Button>
          </div>
        </form>
      </Modal>
    </LayoutShell>
  );
};
