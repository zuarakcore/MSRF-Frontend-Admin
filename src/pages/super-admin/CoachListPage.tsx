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
import { FileUpload } from '../../components/ui/FileUpload';
import { EmptyState } from '../../components/ui/EmptyState';
import { INITIAL_COACHES } from '../../mock-data/msrf-data';
import { Coach, SportsCourse } from '../../types';
import { Eye, Pencil, Trash2, UserPlus, Key, FileText, FileDown, Phone } from 'lucide-react';
import { formatDate, formatPhoneNumber } from '../../utils/format';
import { PrintPortal } from '../../components/ui/PrintPortal';
import { ReportHeader } from '../../components/ui/ReportHeader';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

export const CoachListPage: React.FC = () => {
  const [coaches, setCoaches] = useState<Coach[]>(INITIAL_COACHES);
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
    experienceYears: 5,
    joinedDate: new Date().toISOString().slice(0, 10),
    address: '',
    photo: '',
    contractUrl: '',
    bio: ''
  });

  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const filteredCoaches = coaches.filter(c => {
    const matchesSearch = c.fullName.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCoaches.length / pageSize) || 1;
  const paginatedCoaches = filteredCoaches.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
      gender: (c as any).gender || 'Male',
      bloodGroup: c.bloodGroup || 'O+',
      experienceYears: c.experienceYears,
      joinedDate: c.joinedDate || new Date().toISOString().slice(0, 10),
      address: (c as any).address || '',
      photo: c.photo,
      contractUrl: c.contractUrl || '',
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

    const defaultContract = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    if (editingCoach) {
      setCoaches(prev =>
        prev.map(c =>
          c.id === editingCoach.id
            ? {
                ...c,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                gender: formData.gender as any,
                bloodGroup: formData.bloodGroup,
                experienceYears: Number(formData.experienceYears),
                joinedDate: formData.joinedDate,
                address: formData.address as any,
                photo: formData.photo || c.photo,
                contractUrl: formData.contractUrl || c.contractUrl || defaultContract,
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
        bloodGroup: formData.bloodGroup,
        experienceYears: Number(formData.experienceYears),
        assignedStudentsCount: 0,
        capacity: 25,
        joinedDate: formData.joinedDate || new Date().toISOString().slice(0, 10),
        status: 'Active',
        bio: formData.bio || 'Certified MSRF Senior Sports Coach.',
        monthlyRating: 4.8,
        attendanceAvg: 95,
        tempPassword: generatedPass,
        contractUrl: formData.contractUrl || defaultContract,
        documents: []
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

      {filteredCoaches.length === 0 ? (
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
                      <a
                        href={c.contractUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline bg-blue-50 px-2.5 py-1 rounded border border-blue-200"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-600" /> Contract PDF
                      </a>
                    </td>
                    <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                      <StatusToggle
                        status={c.status || 'Active'}
                        onChange={newStatus => handleStatusChange(c.id, newStatus)}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" icon={<FileDown className="w-3.5 h-3.5 text-emerald-600" />} onClick={() => setPdfCoachRecord(c)} title="View & Print Coach PDF Report" />
                        <Button size="sm" variant="ghost" icon={<Key className="w-3.5 h-3.5 text-amber-500" />} onClick={() => setCredentialsCoach(c)} title="View & Copy Login Credentials" />
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
                <a
                  href={c.contractUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:underline bg-blue-50 px-2 py-1 rounded"
                >
                  <FileText className="w-3 h-3 text-blue-600" /> Contract
                </a>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" icon={<FileDown className="w-3.5 h-3.5 text-emerald-600" />} onClick={() => setPdfCoachRecord(c)} title="Coach PDF Report" />
                  <Button size="sm" variant="ghost" icon={<Key className="w-3.5 h-3.5 text-amber-500" />} onClick={() => setCredentialsCoach(c)} title="Credentials" />
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
        itemName={deletingCoach?.fullName}
      />

      {/* Add / Edit Coach Modal (Without Status field - First always active) */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title={editingCoach ? "Edit Coach Profile" : "Onboard New Head Coach"}>
        <form onSubmit={handleSaveCoach} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Coach Sandeep Kumar"
            />
            <Select
              label="Gender"
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' }
              ]}
              value={formData.gender}
              onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
            />
          </div>
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
          <div className="grid grid-cols-3 gap-4">
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
              onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
            />
            <Input
              label="Experience (Years)"
              type="number"
              value={formData.experienceYears}
              onChange={e => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
            />
            <Input
              label="Date Joined MSRF"
              type="date"
              value={formData.joinedDate}
              onChange={e => setFormData({ ...formData, joinedDate: e.target.value })}
            />
          </div>

          <Input
            label="Residential / Office Address"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            placeholder="Full street address, Kozhikode, Kerala..."
          />

          <FileUpload
            label="Coach Contract Document File"
            value={formData.contractUrl}
            onChange={(url) => setFormData({ ...formData, contractUrl: url })}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            placeholder="Click to upload coach contract file (PDF, Word, or Image)"
          />

          <ImageUpload
            label="Coach Profile Photograph"
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
                  <p className="font-bold text-rose-600 text-sm">{pdfCoachRecord.bloodGroup || 'O+'}</p>
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
