import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { FilterBar } from '../../components/ui/FilterBar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { ImageLightboxModal } from '../../components/ui/ImageLightboxModal';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { CoachCredentialsModal } from '../../components/ui/CoachCredentialsModal';
import { StatusToggle } from '../../components/ui/StatusToggle';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { EmptyState } from '../../components/ui/EmptyState';
import { INITIAL_COACHES } from '../../mock-data/msrf-data';
import { Coach, SportsCourse } from '../../types';
import { Eye, Edit3, Trash2, UserPlus, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

export const CoachListPage: React.FC = () => {
  const [coaches, setCoaches] = useState<Coach[]>(INITIAL_COACHES);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // List default!

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
  const [deletingCoach, setDeletingCoach] = useState<Coach | null>(null);
  const [credentialsCoach, setCredentialsCoach] = useState<Coach | null>(null);
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string } | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: 'Swimming Academy' as SportsCourse,
    experienceYears: 5,
    capacity: 20,
    photo: '',
    bio: ''
  });

  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const filteredCoaches = coaches.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchesSpec = specFilter === 'ALL' || c.specialization === specFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesSpec && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCoaches.length / pageSize) || 1;
  const paginatedCoaches = filteredCoaches.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAdd = () => {
    setEditingCoach(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      specialization: 'Swimming Academy',
      experienceYears: 5,
      capacity: 20,
      photo: '',
      bio: ''
    });
    setAddModal(true);
  };

  const handleOpenEdit = (c: Coach) => {
    setEditingCoach(c);
    setFormData({
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      specialization: c.specialization,
      experienceYears: c.experienceYears,
      capacity: c.capacity,
      photo: c.photo,
      bio: c.bio
    });
    setAddModal(true);
  };

  const handleSaveCoach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName) return;

    if (formData.phone && formData.phone.length < 10) {
      addToast({ type: 'warning', title: 'Invalid Phone Number', message: 'Phone number must be 10 digits.' });
      return;
    }

    if (editingCoach) {
      setCoaches(prev =>
        prev.map(c =>
          c.id === editingCoach.id
            ? {
                ...c,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                specialization: formData.specialization,
                experienceYears: Number(formData.experienceYears),
                capacity: Number(formData.capacity),
                photo: formData.photo || c.photo,
                bio: formData.bio
              }
            : c
        )
      );
      addToast({ type: 'success', title: 'Coach Updated', message: formData.fullName });
    } else {
      const generatedPass = `MSRF#${Math.floor(1000 + Math.random() * 9000)}`;
      const newCoach: Coach = {
        id: `coach-${Date.now()}`,
        fullName: formData.fullName,
        email: formData.email || 'coach@msrf.org',
        phone: formData.phone || '9847000000',
        photo: formData.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        specialization: formData.specialization,
        experienceYears: Number(formData.experienceYears),
        assignedStudentsCount: 0,
        capacity: Number(formData.capacity),
        joinedDate: new Date().toISOString().slice(0, 10),
        status: 'Active',
        bio: formData.bio || 'Certified MSRF Senior Sports Coach.',
        monthlyRating: 4.8,
        attendanceAvg: 95,
        tempPassword: generatedPass
      };

      setCoaches([newCoach, ...coaches]);
      addToast({ type: 'success', title: 'Coach Onboarded & Credentials Mailed', message: `Login details sent to ${newCoach.email}` });
    }

    setAddModal(false);
  };

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Inactive') => {
    setCoaches(prev => prev.map(c => (c.id === id ? { ...c, status: newStatus } : c)));
    addToast({ type: 'info', title: 'Status Updated', message: `Coach status set to ${newStatus}` });
  };

  const handleDeleteConfirm = () => {
    if (!deletingCoach) return;
    setCoaches(prev => prev.filter(c => c.id !== deletingCoach.id));
    addToast({ type: 'info', title: 'Coach Removed', message: `Coach "${deletingCoach.fullName}" removed.` });
    setDeletingCoach(null);
  };

  return (
    <LayoutShell
      title="Coach Directory & Mentorship Staff"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Coaches' }]}
      actions={
        <Button size="sm" onClick={handleOpenAdd} icon={<UserPlus className="w-4 h-4" />}>
          Add New Coach
        </Button>
      }
    >
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search coach name, email, specialization..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={[
          {
            key: 'spec',
            label: 'Specialization',
            value: specFilter,
            onChange: setSpecFilter,
            options: [
              { label: 'All Academies', value: 'ALL' },
              { label: 'Swimming Academy', value: 'Swimming Academy' },
              { label: 'Badminton Club', value: 'Badminton Club' },
              { label: 'Football Excellence', value: 'Football Excellence' },
              { label: 'Athletics & Track', value: 'Athletics & Track' },
              { label: 'Cricket Performance', value: 'Cricket Performance' },
              { label: 'Tennis Training', value: 'Tennis Training' }
            ]
          },
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' }
            ]
          }
        ]}
      />

      {filteredCoaches.length === 0 ? (
        <EmptyState title="No Coaches Found" description="No coach records match your search criteria." />
      ) : viewMode === 'list' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className="py-3 px-4">Coach</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Capacity Utilization</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedCoaches.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.photo}
                          alt={c.fullName}
                          onClick={() => setLightboxImg({ url: c.photo, title: `${c.fullName} (${c.specialization})` })}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{c.fullName}</p>
                          <p className="text-[11px] text-slate-400">{c.experienceYears} Years Exp.</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">{c.specialization}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.email} • {c.phone}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{c.assignedStudentsCount} / {c.capacity} Trainees</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-500">★ {c.monthlyRating}</td>
                    <td className="py-3.5 px-4">
                      <StatusToggle
                        status={c.status || 'Active'}
                        onChange={newStatus => handleStatusChange(c.id, newStatus)}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" icon={<Key className="w-3.5 h-3.5 text-amber-500" />} onClick={() => setCredentialsCoach(c)} title="View & Copy Login Credentials" />
                        <Button size="sm" variant="ghost" icon={<Eye className="w-3.5 h-3.5 text-slate-600" />} onClick={() => navigate(`/super-admin/coaches/${c.id}`)} title="View Coach Profile" />
                        <Button size="sm" variant="ghost" icon={<Edit3 className="w-3.5 h-3.5 text-blue-600" />} onClick={() => handleOpenEdit(c)} title="Edit Coach" />
                        <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingCoach(c)} title="Delete Coach" />
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
          {paginatedCoaches.map(c => (
            <Card key={c.id} hoverEffect className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={c.photo}
                    alt={c.fullName}
                    onClick={() => setLightboxImg({ url: c.photo, title: c.fullName })}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <div>
                    <h3
                      className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer text-base"
                      onClick={() => navigate(`/super-admin/coaches/${c.id}`)}
                    >
                      {c.fullName}
                    </h3>
                    <p className="text-xs font-semibold text-blue-600">{c.specialization}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.experienceYears} Years Exp.</p>
                  </div>
                </div>
                <StatusToggle
                  status={c.status || 'Active'}
                  onChange={newStatus => handleStatusChange(c.id, newStatus)}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate(`/super-admin/coaches/${c.id}`)} icon={<Eye className="w-3.5 h-3.5" />}>
                  Profile
                </Button>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" icon={<Key className="w-3.5 h-3.5 text-amber-500" />} onClick={() => setCredentialsCoach(c)} title="Credentials" />
                  <Button size="sm" variant="ghost" icon={<Edit3 className="w-3.5 h-3.5 text-blue-600" />} onClick={() => handleOpenEdit(c)} />
                  <Button size="sm" variant="ghost" className="text-rose-500 hover:bg-rose-50" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeletingCoach(c)} />
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
        totalItems={filteredCoaches.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Coach Credentials Modal */}
      <CoachCredentialsModal
        isOpen={!!credentialsCoach}
        onClose={() => setCredentialsCoach(null)}
        coach={credentialsCoach}
      />

      {/* Image Lightbox */}
      <ImageLightboxModal
        isOpen={!!lightboxImg}
        onClose={() => setLightboxImg(null)}
        imageUrl={lightboxImg?.url || ''}
        title={lightboxImg?.title}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingCoach}
        onClose={() => setDeletingCoach(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingCoach?.fullName}
      />

      {/* Add / Edit Coach Modal (Without Status field - First always active) */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title={editingCoach ? "Edit Coach Profile" : "Onboard New Head Coach"}>
        <form onSubmit={handleSaveCoach} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={formData.fullName}
            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g. Coach Sandeep Kumar"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address (Login Username)"
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="sandeep@msrf.org"
            />
            <Input
              label="Phone Number"
              isPhone
              required
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="10-digit mobile"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Specialization"
              options={[
                { label: 'Swimming Academy', value: 'Swimming Academy' },
                { label: 'Badminton Club', value: 'Badminton Club' },
                { label: 'Football Excellence', value: 'Football Excellence' },
                { label: 'Athletics & Track', value: 'Athletics & Track' },
                { label: 'Cricket Performance', value: 'Cricket Performance' },
                { label: 'Tennis Training', value: 'Tennis Training' }
              ]}
              value={formData.specialization}
              onChange={e => setFormData({ ...formData, specialization: e.target.value as any })}
            />
            <Input
              label="Max Student Capacity"
              type="number"
              value={formData.capacity}
              onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
            />
          </div>

          <ImageUpload
            label="Coach Photo Image"
            value={formData.photo}
            onChange={url => setFormData({ ...formData, photo: url })}
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Coach Biography & Accreditations</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 mt-1"
              placeholder="Certifications, state gold medals, prior coaching history..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button type="submit">{editingCoach ? "Update Coach" : "Onboard Coach & Send Credentials"}</Button>
          </div>
        </form>
      </Modal>
    </LayoutShell>
  );
};
