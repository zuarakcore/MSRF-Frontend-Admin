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
import { StatusToggle } from '../../../components/ui/StatusToggle';
import { EmptyState } from '../../../components/ui/EmptyState';
import { QueryState } from '../../../components/ui/QueryState';
import { cmsApi } from '../../../api/endpoints';
import { toApiStatus, toProgramme } from '../../../api/mappers';
import { useApiAction } from '../../../api/hooks';
import { ProgrammeCMS } from '../../../types';
import { Plus, Trash2, Pencil } from 'lucide-react';

export const ProgrammesCMSPage: React.FC = () => {
  const query = useQuery({ queryKey: ['programmes'], queryFn: () => cmsApi.programmes() });
  const programmes = (query.data ?? []).map(toProgramme);
  const { run } = useApiAction();
  const invalidate = [['programmes']];
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Active');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // List default!

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<ProgrammeCMS | null>(null);
  const [deletingProg, setDeletingProg] = useState<ProgrammeCMS | null>(null);
  const [detailProg, setDetailProg] = useState<ProgrammeCMS | null>(null);

  const [form, setForm] = useState({
    ageGroup: '6 - 10 YEARS',
    title: '',
    description: ''
  });


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

  const handleSaveProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const body = {
      ageGroup: form.ageGroup.trim(),
      title: form.title.trim(),
      description: form.description.trim() || 'Professional sports training program.',
    };
    const ok = editingProg
      ? await run(() => cmsApi.updateProgramme(editingProg.id, body), {
          success: { title: 'Programme Updated', message: body.title },
          invalidate,
        })
      : await run(() => cmsApi.createProgramme(body), {
          success: { title: 'Programme Published', message: body.title },
          invalidate,
        });
    if (ok) setModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Inactive') => {
    run(() => cmsApi.updateProgramme(id, { status: toApiStatus(newStatus) }), {
      success: { type: 'info', title: 'Status Updated', message: `Programme set to ${newStatus}` },
      invalidate,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProg) return;
    const target = deletingProg;
    await run(() => cmsApi.deleteProgramme(target.id), {
      success: { type: 'info', title: 'Programme Removed', message: `"${target.title}" deleted.` },
      errorTitle: 'Could not delete',
      invalidate,
    });
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

      {query.isLoading || query.error ? (
        <QueryState isLoading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>{null}</QueryState>
      ) : filtered.length === 0 ? (
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
                  <tr key={p.id} onClick={() => setDetailProg(p)} className="hover:bg-slate-50 cursor-pointer">
                    <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">{p.ageGroup}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 hover:text-blue-600">{p.title}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-md truncate">{p.description}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">{p.enquiriesCount} Enquiries</td>
                    <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                      <StatusToggle
                        status={p.status || 'Active'}
                        onChange={newStatus => handleStatusChange(p.id, newStatus)}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" icon={<Pencil className="w-3.5 h-3.5 text-blue-600" />} onClick={() => handleOpenEdit(p)} />
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
            <Card key={p.id} onClick={() => setDetailProg(p)} hoverEffect className="space-y-3 bg-white border border-slate-200 text-slate-900 cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-widest block font-mono">
                  {p.ageGroup}
                </span>
                <div onClick={e => e.stopPropagation()}>
                  <StatusToggle
                    status={p.status || 'Active'}
                    onChange={newStatus => handleStatusChange(p.id, newStatus)}
                  />
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-900 hover:text-blue-600">{p.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{p.description}</p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-blue-600 font-bold">{p.enquiriesCount} Enquiries</span>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => handleOpenEdit(p)} />
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

      {/* Programme Detailed View Modal */}
      {detailProg && (
        <Modal
          isOpen={!!detailProg}
          onClose={() => setDetailProg(null)}
          title={`Programme Detail: ${detailProg.title}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-700 text-white font-mono font-extrabold text-[10px] tracking-wider uppercase inline-block">
                AGE GROUP: {detailProg.ageGroup}
              </span>
              <h3 className="text-xl font-black text-slate-900">{detailProg.title}</h3>
              <p className="text-xs text-emerald-800 font-semibold">Total Student Enquiries Received: <b>{detailProg.enquiriesCount}</b></p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Programme Overview & Description</p>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{detailProg.description}</p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setDetailProg(null)}>Close</Button>
              <Button onClick={() => { const prog = detailProg; setDetailProg(null); handleOpenEdit(prog); }}>
                Edit Programme
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingProg ? "Edit Sports Programme" : "Add Website Sports Programme"}>
        <form onSubmit={handleSaveProgramme} className="space-y-4">
          <Input
            label="Target Age Group"
            required
            value={form.ageGroup}
            onChange={e => setForm({ ...form, ageGroup: e.target.value })}
            placeholder="e.g. 6 - 10 YEARS or U-14"
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
