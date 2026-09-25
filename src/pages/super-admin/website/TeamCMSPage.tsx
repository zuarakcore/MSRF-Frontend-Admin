import React, { useState } from 'react';
import { LayoutShell } from '../../../components/layout/LayoutShell';
import { FilterBar } from '../../../components/ui/FilterBar';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
import { ImageLightboxModal } from '../../../components/ui/ImageLightboxModal';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import { StatusToggle } from '../../../components/ui/StatusToggle';
import { ImageUpload } from '../../../components/ui/ImageUpload';
import { EmptyState } from '../../../components/ui/EmptyState';
import { INITIAL_TEAM_CMS } from '../../../mock-data/msrf-data';
import { TeamCMS } from '../../../types';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext';

export const TeamCMSPage: React.FC = () => {
  const [team, setTeam] = useState<TeamCMS[]>(INITIAL_TEAM_CMS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // List default!

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamCMS | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamCMS | null>(null);
  const [detailMember, setDetailMember] = useState<TeamCMS | null>(null);
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string } | null>(null);

  const DEFAULT_DESIGNATIONS = [
    'CHAIRMAN', 
    'DIRECTOR', 
    'MANAGING DIRECTOR & CEO', 
    'GENERAL SECRETARY',
    'TREASURER',
    'HEAD COACH',
    'ACADEMY MANAGER'
  ];

  const [designationsList, setDesignationsList] = useState<string[]>(DEFAULT_DESIGNATIONS);
  const [isCustomDesignation, setIsCustomDesignation] = useState(false);
  const [customDesignationText, setCustomDesignationText] = useState('');

  const [form, setForm] = useState({
    name: '',
    designation: 'DIRECTOR',
    biography: '',
    photo: ''
  });

  const { addToast } = useNotifications();

  const filtered = team.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.designation.toLowerCase().includes(search.toLowerCase()) ||
      t.biography.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAdd = () => {
    setEditingMember(null);
    setIsCustomDesignation(false);
    setCustomDesignationText('');
    setForm({ name: '', designation: designationsList[0] || 'DIRECTOR', biography: '', photo: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (t: TeamCMS) => {
    setEditingMember(t);
    const isExisting = designationsList.includes(t.designation);
    if (!isExisting) {
      setDesignationsList(prev => [...prev, t.designation]);
    }
    setIsCustomDesignation(false);
    setCustomDesignationText('');
    setForm({
      name: t.name,
      designation: t.designation,
      biography: t.biography,
      photo: t.photo || ''
    });
    setModalOpen(true);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    const finalDesignation = isCustomDesignation
      ? customDesignationText.trim().toUpperCase() || 'MEMBER'
      : form.designation;

    if (isCustomDesignation && customDesignationText.trim()) {
      const formatted = customDesignationText.trim().toUpperCase();
      if (!designationsList.includes(formatted)) {
        setDesignationsList(prev => [...prev, formatted]);
      }
    }

    if (editingMember) {
      setTeam(prev =>
        prev.map(t =>
          t.id === editingMember.id
            ? { ...t, name: form.name, designation: finalDesignation, biography: form.biography, photo: form.photo, initials: form.name[0] }
            : t
        )
      );
      addToast({ type: 'success', title: 'Board Member Updated', message: form.name });
    } else {
      const newTeam: TeamCMS = {
        id: `team-${Date.now()}`,
        name: form.name,
        designation: finalDesignation,
        initials: form.name[0],
        biography: form.biography,
        photo: form.photo || undefined,
        status: 'Active'
      };
      setTeam([...team, newTeam]);
      addToast({ type: 'success', title: 'Board Member Added', message: newTeam.name });
    }

    setModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Inactive') => {
    setTeam(prev => prev.map(t => (t.id === id ? { ...t, status: newStatus } : t)));
    addToast({ type: 'info', title: 'Status Updated', message: `Team member set to ${newStatus}` });
  };

  const handleDeleteConfirm = () => {
    if (!deletingMember) return;
    setTeam(prev => prev.filter(t => t.id !== deletingMember.id));
    addToast({ type: 'info', title: 'Member Removed', message: `"${deletingMember.name}" removed.` });
    setDeletingMember(null);
  };

  return (
    <LayoutShell
      title="Executive Leadership & Board Members"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Website' }, { label: 'Team' }]}
      actions={
        <Button size="sm" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Add Board Member
        </Button>
      }
    >
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search leadership name, designation..."
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
        <EmptyState title="No Board Members Found" description="No leadership records match your search query." />
      ) : viewMode === 'list' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className="py-3 px-4">Photo / Avatar</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Biography / Subtitle</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedData.map(t => (
                  <tr key={t.id} onClick={() => setDetailMember(t)} className="hover:bg-slate-50 cursor-pointer">
                    <td className="py-3.5 px-4">
                      {t.photo ? (
                        <img
                          src={t.photo}
                          alt={t.name}
                          onClick={(e) => { e.stopPropagation(); setLightboxImg({ url: t.photo!, title: `${t.name} — ${t.designation}` }); }}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm flex items-center justify-center border border-slate-700">
                          {t.initials || t.name[0]}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm hover:text-blue-600">{t.name}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 uppercase tracking-wider text-[11px]">{t.designation}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-md truncate">{t.biography}</td>
                    <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                      <StatusToggle
                        status={t.status || 'Active'}
                        onChange={newStatus => handleStatusChange(t.id, newStatus)}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" icon={<Pencil className="w-3.5 h-3.5 text-blue-600" />} onClick={() => handleOpenEdit(t)} />
                        <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingMember(t)} />
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
          {paginatedData.map(t => (
            <Card key={t.id} onClick={() => setDetailMember(t)} hoverEffect className="space-y-4 bg-white border border-slate-200 text-slate-900 cursor-pointer">
              {t.photo ? (
                <img
                  src={t.photo}
                  alt={t.name}
                  onClick={(e) => { e.stopPropagation(); setLightboxImg({ url: t.photo!, title: `${t.name} — ${t.designation}` }); }}
                  className="w-24 h-24 rounded-2xl object-cover border border-slate-200 mx-auto cursor-pointer hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-4xl font-mono font-black text-slate-500 mx-auto">
                  {t.initials || t.name[0]}
                </div>
              )}
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">
                    {t.designation}
                  </span>
                  <StatusToggle
                    status={t.status || 'Active'}
                    onChange={newStatus => handleStatusChange(t.id, newStatus)}
                  />
                </div>
                <h3 className="text-base font-black text-slate-900 hover:text-blue-600">{t.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{t.biography}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700" icon={<Pencil className="w-3.5 h-3.5" />} onClick={() => handleOpenEdit(t)} />
                <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingMember(t)} />
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

      {/* Image Lightbox Preview */}
      <ImageLightboxModal
        isOpen={!!lightboxImg}
        onClose={() => setLightboxImg(null)}
        imageUrl={lightboxImg?.url || ''}
        title={lightboxImg?.title}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingMember?.name}
      />

      {/* Add / Edit Board Member Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingMember ? "Edit Board Member" : "Add Board / Leadership Member"}>
        <form onSubmit={handleSaveTeam} className="space-y-4">
          <Input label="Full Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Doe" />
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Designation</label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomDesignation(!isCustomDesignation);
                  setCustomDesignationText('');
                }}
                className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                {isCustomDesignation ? "← Choose from existing" : "+ Add New Designation"}
              </button>
            </div>

            {isCustomDesignation ? (
              <Input
                placeholder="Enter new designation (e.g. TREASURER, HEAD COACH)"
                value={customDesignationText}
                onChange={e => setCustomDesignationText(e.target.value)}
                required
              />
            ) : (
              <Select
                options={[
                  ...designationsList.map(d => ({ label: d, value: d })),
                  { label: '+ Add New Designation', value: '__NEW__' }
                ]}
                value={form.designation}
                onChange={e => {
                  if (e.target.value === '__NEW__') {
                    setIsCustomDesignation(true);
                  } else {
                    setForm({ ...form, designation: e.target.value });
                  }
                }}
              />
            )}
          </div>

          <ImageUpload
            label="Member Photo Image"
            value={form.photo}
            onChange={url => setForm({ ...form, photo: url })}
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Biography / Title Subtext</label>
            <textarea
              rows={2}
              value={form.biography}
              onChange={e => setForm({ ...form, biography: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 mt-1"
              placeholder="e.g. Former Chief Secretary to the Government of Goa"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingMember ? "Update Member" : "Save Board Member"}</Button>
          </div>
        </form>
      </Modal>

      {/* Team Member Detailed Modal */}
      {detailMember && (
        <Modal
          isOpen={!!detailMember}
          onClose={() => setDetailMember(null)}
          title={`Team Member: ${detailMember.name}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              {detailMember.photo ? (
                <img
                  src={detailMember.photo}
                  alt={detailMember.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-300 shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white font-mono font-black text-2xl flex items-center justify-center border border-slate-700 shrink-0">
                  {detailMember.initials || detailMember.name[0]}
                </div>
              )}
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider inline-block">
                  {detailMember.designation}
                </span>
                <h3 className="text-lg font-black text-slate-900">{detailMember.name}</h3>
                <p className="text-xs text-slate-500 font-medium">Status: <b className="text-slate-800">{detailMember.status || 'Active'}</b></p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Biography / Executive Bio</p>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{detailMember.biography || 'No additional bio recorded.'}</p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setDetailMember(null)}>Close</Button>
              <Button onClick={() => { const member = detailMember; setDetailMember(null); handleOpenEdit(member); }}>
                Edit Member
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </LayoutShell>
  );
};
