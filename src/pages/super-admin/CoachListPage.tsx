import React, { useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
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
import { FileUpload } from '../../components/ui/FileUpload';
import { EmptyState } from '../../components/ui/EmptyState';
import { QueryState } from '../../components/ui/QueryState';
import { coachesApi, openCoachContract, referenceApi } from '../../api/endpoints';
import { emptyToNull, toApiGender, toApiStatus, toCoach } from '../../api/mappers';
import { dataUrlToFile, photoField } from '../../api/photos';
import { useApiAction } from '../../api/hooks';
import { errorMessage } from '../../api/client';
import type { BloodGroup } from '../../api/types';
import { Coach } from '../../types';
import { Eye, Pencil, Trash2, UserPlus, Key, FileText, FileDown, Phone } from 'lucide-react';
import { formatDate, formatPhoneNumber } from '../../utils/format';
import { PrintPortal } from '../../components/ui/PrintPortal';
import { ReportHeader } from '../../components/ui/ReportHeader';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

export const CoachListPage: React.FC = () => {
  const query = useQuery({ queryKey: ['coaches'], queryFn: () => coachesApi.listAll() });
  const coaches = (query.data ?? []).map(toCoach);
  const categoriesQuery = useQuery({
    queryKey: ['categories', 'active'],
    queryFn: () => referenceApi.list('categories', { status: 'ACTIVE' }),
  });
  const { run, pending } = useApiAction();
  const invalidate = [['coaches'], ['dashboard']];
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // List default!
  const [pdfCoachRecord, setPdfCoachRecord] = useState<Coach | null>(null);

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
    gender: 'Male' as 'Male' | 'Female',
    bloodGroup: 'O+',
    experienceYears: 5 as number | '',
    joinedDate: new Date().toISOString().slice(0, 10),
    address: '',
    photo: '',
    contractUrl: '',
    contractFileName: '',
    bio: '',
    categoryIds: [] as string[]
  });
  // Inline messages under the form fields, keyed by form field name.
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const setField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (formErrors[key]) setFormErrors(prev => ({ ...prev, [key]: '' }));
  };

  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const filteredCoaches = coaches.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCoaches.length / pageSize) || 1;
  const paginatedCoaches = filteredCoaches.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Whether each coach on this page has a contract, so the Contract button only shows when there is one.
  const docsQueries = useQueries({
    queries: paginatedCoaches.map(c => ({
      queryKey: ['coaches', c.id, 'documents'],
      queryFn: () => coachesApi.documents(c.id),
    })),
  });
  const hasContract = (coachId: string) => {
    const i = paginatedCoaches.findIndex(c => c.id === coachId);
    return Boolean(docsQueries[i]?.data?.some(d => d.kind === 'CONTRACT'));
  };

  const handleOpenAdd = () => {
    setEditingCoach(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      gender: 'Male',
      bloodGroup: 'O+',
      experienceYears: 5,
      joinedDate: new Date().toISOString().slice(0, 10),
      address: '',
      photo: '',
      contractUrl: '',
      contractFileName: '',
      bio: '',
      categoryIds: []
    });
    setFormErrors({});
    setAddModal(true);
  };

  // The list omits bio, gender, blood group and address; load the full profile first.
  const withDetail = async (c: Coach, then: (full: Coach) => void) => {
    try {
      then(toCoach(await coachesApi.get(c.id)));
    } catch (error) {
      addToast({ type: 'error', title: 'Could not load coach', message: errorMessage(error) });
    }
  };

  const handleOpenContract = async (c: Coach) => {
    try {
      if (!(await openCoachContract(c.id))) {
        addToast({ type: 'info', title: 'No contract uploaded', message: `Upload one from ${c.fullName}'s profile or edit form.` });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Could not open contract', message: errorMessage(error) });
    }
  };

  const handleOpenEdit = (listCoach: Coach) =>
    withDetail(listCoach, c => {
      setEditingCoach(c);
      setFormData({
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        gender: c.gender === 'Female' ? 'Female' : 'Male',
        bloodGroup: c.bloodGroup || 'O+',
        experienceYears: c.experienceYears,
        joinedDate: c.joinedDate || new Date().toISOString().slice(0, 10),
        address: c.address || '',
        // Keep the URL only for a real photo, not the initials placeholder.
        photo: c.photo.startsWith('data:image/svg') ? '' : c.photo,
        contractUrl: '',
        contractFileName: '',
        bio: c.bio,
        categoryIds: c.categoryIds ?? []
      });
      setFormErrors({});
      setAddModal(true);
    });

  // Two coaches cannot share an email (it is the login) or a phone number.
  const validateCoachForm = (target: Coach | null): Record<string, string> => {
    const errors: Record<string, string> = {};
    const name = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();
    const others = coaches.filter(c => c.id !== target?.id);

    if (!name) errors.fullName = 'Full name is required.';
    else if (name.length < 2) errors.fullName = 'Full name must be at least 2 characters.';

    if (!email) errors.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
    else {
      const clash = others.find(c => c.email.trim().toLowerCase() === email);
      if (clash) errors.email = `This email is already used by coach ${clash.fullName}.`;
    }

    if (!phone) errors.phone = 'Phone number is required.';
    else if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = 'Enter a valid 10-digit Indian mobile number (starts with 6, 7, 8 or 9).';
    else {
      const clash = others.find(c => (c.phone ?? '').replace(/\D/g, '').slice(-10) === phone);
      if (clash) errors.phone = `This phone number is already used by coach ${clash.fullName}.`;
    }

    const years = formData.experienceYears;
    if (years === '' || !Number.isInteger(Number(years)) || Number(years) < 0 || Number(years) > 60) {
      errors.experienceYears = 'Experience must be a whole number from 0 to 60.';
    }
    if (!formData.joinedDate) errors.joinedDate = 'Joining date is required.';
    else if (formData.joinedDate > new Date().toISOString().slice(0, 10)) errors.joinedDate = 'Joining date cannot be in the future.';
    return errors;
  };

  const handleSaveCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = editingCoach;

    const errors = validateCoachForm(target);
    setFormErrors(errors);
    const firstError = Object.values(errors).find(Boolean);
    if (firstError) {
      addToast({ type: 'warning', title: 'Check the form', message: firstError });
      return;
    }

    const previousPhoto = target && !target.photo.startsWith('data:image/svg') ? target.photo : undefined;
    const ok = await run(
      async () => {
        const photo = await photoField(formData.photo, previousPhoto, 'COACH_PHOTO');
        const body = {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          gender: toApiGender(formData.gender),
          bloodGroup: formData.bloodGroup as BloodGroup,
          experienceYears: Number(formData.experienceYears) || 0,
          joinedDate: formData.joinedDate,
          address: emptyToNull(formData.address),
          bio: emptyToNull(formData.bio),
          categoryIds: formData.categoryIds,
          ...photo,
        };
        const saved = target ? await coachesApi.update(target.id, body) : await coachesApi.create(body);
        // A newly picked contract file is stored as the coach's CONTRACT document.
        if (formData.contractUrl.startsWith('data:')) {
          const file = dataUrlToFile(formData.contractUrl, 'contract', formData.contractFileName || undefined);
          await coachesApi.addDocument(saved.id, 'Employment Contract', file, 'CONTRACT');
        }
      },
      {
        success: target
          ? { title: 'Coach Updated', message: formData.fullName }
          : { title: 'Coach Onboarded & Credentials Mailed', message: `Login details sent to ${formData.email}` },
        errorTitle: target ? 'Could not update coach' : 'Could not add coach',
        invalidate,
      }
    );
    if (ok) setAddModal(false);
  };

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Inactive') => {
    // Deactivating signs the coach out everywhere immediately.
    run(() => coachesApi.update(id, { status: toApiStatus(newStatus) }), {
      success: { type: 'info', title: 'Status Updated', message: `Coach status set to ${newStatus}` },
      invalidate,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCoach) return;
    const target = deletingCoach;
    // Coaches with sessions or reports cannot be deleted (409); deactivate them instead.
    await run(() => coachesApi.remove(target.id), {
      success: { type: 'info', title: 'Coach Removed', message: `Coach "${target.fullName}" removed.` },
      errorTitle: 'Could not delete',
      invalidate,
    });
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
        searchPlaceholder="Search coach name, email, phone..."
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
              { label: 'All Statuses', value: 'ALL' }
            ]
          }
        ]}
      />

      {query.isLoading || query.error ? (
        <QueryState isLoading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>{null}</QueryState>
      ) : filteredCoaches.length === 0 ? (
        <EmptyState title="No Coaches Found" description="No coach records match your search criteria." />
      ) : viewMode === 'list' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase">
                  <th className="py-3 px-4">Coach</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Contract Document</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedCoaches.map(c => (
                  <tr key={c.id} onClick={() => navigate(`/super-admin/coaches/${c.id}`)} className="hover:bg-slate-50 cursor-pointer">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.photo}
                          alt={c.fullName}
                          onClick={(e) => { e.stopPropagation(); setLightboxImg({ url: c.photo, title: c.fullName }); }}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm hover:text-blue-600 font-semibold">{c.fullName}</p>
                          <p className="text-[11px] text-slate-400">{c.experienceYears} Years Exp.</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-medium text-slate-800 text-xs">{c.email}</p>
                      <p className="text-[11px] font-mono text-blue-600 font-semibold mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-blue-500 shrink-0" />
                        <span>{formatPhoneNumber(c.phone)}</span>
                      </p>
                    </td>
                    <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                      {hasContract(c.id) ? (
                        <button
                          type="button"
                          onClick={() => handleOpenContract(c)}
                          className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline bg-blue-50 px-2.5 py-1 rounded border border-blue-200"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" /> Contract PDF
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Not uploaded</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                      <StatusToggle
                        status={c.status || 'Active'}
                        onChange={newStatus => handleStatusChange(c.id, newStatus)}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" icon={<FileDown className="w-3.5 h-3.5 text-emerald-600" />} onClick={() => withDetail(c, setPdfCoachRecord)} title="View & Print Coach PDF Report" />
                        <Button size="sm" variant="ghost" icon={<Key className="w-3.5 h-3.5 text-amber-500" />} onClick={() => setCredentialsCoach(c)} title="Login & Password Reset" />
                        <Button size="sm" variant="ghost" icon={<Pencil className="w-3.5 h-3.5 text-blue-600" />} onClick={() => handleOpenEdit(c)} title="Edit Coach" />
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
                    <p className="text-[11px] text-slate-400 mt-0.5">{c.experienceYears} Years Exp.</p>
                  </div>
                </div>
                <StatusToggle
                  status={c.status || 'Active'}
                  onChange={newStatus => handleStatusChange(c.id, newStatus)}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5">
                <p className="font-medium text-slate-800">{c.email}</p>
                <p className="font-mono text-blue-600 font-semibold flex items-center gap-1 text-[11px]">
                  <Phone className="w-3 h-3 text-blue-500" /> {formatPhoneNumber(c.phone)}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate(`/super-admin/coaches/${c.id}`)} icon={<Eye className="w-3.5 h-3.5" />}>
                  Profile
                </Button>
                {hasContract(c.id) && (
                  <button
                    type="button"
                    onClick={() => handleOpenContract(c)}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:underline bg-blue-50 px-2 py-1 rounded"
                  >
                    <FileText className="w-3 h-3 text-blue-600" /> Contract
                  </button>
                )}
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" icon={<FileDown className="w-3.5 h-3.5 text-emerald-600" />} onClick={() => withDetail(c, setPdfCoachRecord)} title="Coach PDF Report" />
                  <Button size="sm" variant="ghost" icon={<Key className="w-3.5 h-3.5 text-amber-500" />} onClick={() => setCredentialsCoach(c)} title="Login & Password Reset" />
                  <Button size="sm" variant="ghost" icon={<Pencil className="w-3.5 h-3.5 text-blue-600" />} onClick={() => handleOpenEdit(c)} />
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
        title="Delete Coach"
        itemName={deletingCoach?.fullName}
        message={`This permanently deletes coach "${deletingCoach?.fullName ?? ''}" and their login. It cannot be undone. Coaches with sessions or reports on record cannot be deleted; set them to Inactive instead.`}
      />

      {/* Add / Edit Coach Modal (Without Status field - First always active) */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title={editingCoach ? "Edit Coach Profile" : "Onboard New Head Coach"}>
        <form onSubmit={handleSaveCoach} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <Input
              label="Full Name"
              required
              value={formData.fullName}
              error={formErrors.fullName || undefined}
              onChange={e => setField('fullName', e.target.value)}
              placeholder="e.g. Sandeep Kumar"
            />
            <Select
              label="Gender"
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' }
              ]}
              value={formData.gender}
              onChange={e => setField('gender', e.target.value as 'Male' | 'Female')}
            />
            <Input
              label="Email (Login Username)"
              type="email"
              required
              value={formData.email}
              error={formErrors.email || undefined}
              onChange={e => setField('email', e.target.value)}
              placeholder="sandeep@msrf.org"
            />
            <Input
              label="Phone Number"
              isPhone
              required
              value={formData.phone}
              error={formErrors.phone || undefined}
              onChange={e => setField('phone', e.target.value)}
              placeholder="10-digit mobile"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <Select
              label="Blood Group"
              options={[
                { label: 'O+', value: 'O+' },
                { label: 'A+', value: 'A+' },
                { label: 'B+', value: 'B+' },
                { label: 'AB+', value: 'AB+' },
                { label: 'O-', value: 'O-' },
                { label: 'A-', value: 'A-' },
                { label: 'B-', value: 'B-' },
                { label: 'AB-', value: 'AB-' }
              ]}
              value={formData.bloodGroup}
              onChange={e => setField('bloodGroup', e.target.value)}
            />
            <Input
              label="Experience (Years)"
              type="number"
              min={0}
              max={60}
              step={1}
              value={formData.experienceYears}
              error={formErrors.experienceYears || undefined}
              onChange={e => setField('experienceYears', e.target.value === '' ? '' : Math.trunc(Number(e.target.value)))}
              placeholder="0 - 60"
            />
            <Input
              label="Date Joined MSRF"
              type="date"
              required
              max={new Date().toISOString().slice(0, 10)}
              value={formData.joinedDate}
              error={formErrors.joinedDate || undefined}
              onChange={e => setField('joinedDate', e.target.value)}
            />
          </div>

          <Input
            label="Residential / Office Address"
            value={formData.address}
            onChange={e => setField('address', e.target.value)}
            placeholder="Full street address, Kozhikode, Kerala..."
          />

          <FileUpload
            label="Coach Contract Document File"
            value={formData.contractUrl}
            onChange={(url, fileName) => setFormData({ ...formData, contractUrl: url, contractFileName: fileName || '' })}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            placeholder="Click to upload coach contract file (PDF, Word, or Image)"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Assigned Categories</label>
            <p className="text-[11px] text-slate-500 mb-1.5">The coach sees and takes attendance for students in these categories.</p>
            <div className="flex flex-wrap gap-2">
              {(categoriesQuery.data ?? []).map(cat => {
                const checked = formData.categoryIds.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                      checked ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          categoryIds: checked
                            ? formData.categoryIds.filter(id => id !== cat.id)
                            : [...formData.categoryIds, cat.id]
                        })
                      }
                    />
                    {cat.name}
                  </label>
                );
              })}
              {categoriesQuery.data?.length === 0 && (
                <span className="text-[11px] text-slate-400">No active categories. Add them under Website → Categories.</span>
              )}
            </div>
          </div>

          <ImageUpload
            label="Coach Profile Photograph"
            value={formData.photo}
            onChange={url => setFormData({ ...formData, photo: url })}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Coach Biography & Accreditations</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={e => setField('bio', e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
              placeholder="Certifications, state gold medals, prior coaching history..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={pending}>{editingCoach ? "Update Coach" : "Onboard Coach & Send Credentials"}</Button>
          </div>
        </form>
      </Modal>

      {/* COACH PROFILE PDF REPORT PORTAL */}
      {pdfCoachRecord && (
        <PrintPortal
          title={`Coach_Report_${pdfCoachRecord.fullName}`}
          onClose={() => setPdfCoachRecord(null)}
        >
          <div className="space-y-6 text-slate-800 font-sans">
            <ReportHeader title="COACH PROFILE REPORT" date={new Date().toISOString().slice(0, 10)} />

            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img src={pdfCoachRecord.photo} alt={pdfCoachRecord.fullName} className="w-20 h-20 rounded-xl object-cover border border-slate-300 shrink-0" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs flex-1">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Full Name</p>
                  <p className="font-bold text-slate-900 text-sm">{pdfCoachRecord.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Blood Group</p>
                  <p className="font-bold text-rose-600 text-sm">{pdfCoachRecord.bloodGroup || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Experience</p>
                  <p className="font-bold text-blue-600">{pdfCoachRecord.experienceYears} Years</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Attendance Rate</p>
                  <p className="font-bold text-emerald-600">{pdfCoachRecord.attendanceAvg}%</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">Contact Information</p>
                <div className="flex justify-between"><span className="text-slate-500">Email:</span><span className="font-mono">{pdfCoachRecord.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Phone:</span><span className="font-mono">{pdfCoachRecord.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Joined Date:</span><span className="font-semibold">{formatDate(pdfCoachRecord.joinedDate)}</span></div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">Biography & Accreditations</p>
                <p className="text-slate-700 italic">{pdfCoachRecord.bio || 'Certified Senior Sports Coach at MSRF.'}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <p>Malabar Challengers Football Club • Official System Generated Report</p>
              <p>Printed Date & Time: {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
          </div>
        </PrintPortal>
      )}
    </LayoutShell>
  );
};
