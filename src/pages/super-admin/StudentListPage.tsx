import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { FilterBar } from '../../components/ui/FilterBar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { ImageLightboxModal } from '../../components/ui/ImageLightboxModal';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { StatusToggle } from '../../components/ui/StatusToggle';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { EmptyState } from '../../components/ui/EmptyState';
import { 
  UserPlus, 
  Eye, 
  Edit3, 
  Trash2, 
  Download
} from 'lucide-react';
import { INITIAL_STUDENTS, INITIAL_COACHES } from '../../mock-data/msrf-data';
import { Student, SportsCourse } from '../../types';
import { formatCurrency, exportToCSV } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

export const StudentListPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [coachFilter, setCoachFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feeStatusFilter, setFeeStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // List default!

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    photo: '',
    gender: 'Male' as 'Male' | 'Female',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    course: 'Swimming Academy' as SportsCourse,
    batch: 'Morning (6:00 AM - 8:00 AM)',
    coachId: INITIAL_COACHES[0].id,
    parentName: '',
    relationship: 'Father',
    parentPhone: '',
    parentEmail: '',
    emergencyName: '',
    emergencyPhone: '',
    totalFee: 24000
  });

  const navigate = useNavigate();
  const { addToast } = useNotifications();

  // Filter logic
  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.parentName.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);
    const matchesCourse = courseFilter === 'ALL' || s.course === courseFilter;
    const matchesCoach = coachFilter === 'ALL' || s.coachId === coachFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesFeeStatus = feeStatusFilter === 'ALL' || s.feeStatus === feeStatusFilter;

    return matchesSearch && matchesCourse && matchesCoach && matchesStatus && matchesFeeStatus;
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      fullName: '',
      photo: '',
      gender: 'Male',
      dateOfBirth: '',
      phone: '',
      email: '',
      address: '',
      course: 'Swimming Academy',
      batch: 'Morning (6:00 AM - 8:00 AM)',
      coachId: INITIAL_COACHES[0].id,
      parentName: '',
      relationship: 'Father',
      parentPhone: '',
      parentEmail: '',
      emergencyName: '',
      emergencyPhone: '',
      totalFee: 24000
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setFormData({
      fullName: s.fullName,
      photo: s.photo,
      gender: s.gender as any,
      dateOfBirth: s.dateOfBirth,
      phone: s.phone,
      email: s.email,
      address: s.address,
      course: s.course,
      batch: s.batch,
      coachId: s.coachId,
      parentName: s.parentName,
      relationship: s.relationship,
      parentPhone: s.parentPhone,
      parentEmail: s.parentEmail,
      emergencyName: s.emergencyName,
      emergencyPhone: s.emergencyPhone,
      totalFee: s.totalFee
    });
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.parentPhone && formData.parentPhone.length < 10) {
      addToast({ type: 'warning', title: 'Invalid Phone Number', message: 'Parent phone number must be 10 digits.' });
      return;
    }

    const coachObj = INITIAL_COACHES.find(c => c.id === formData.coachId) || INITIAL_COACHES[0];
    const defaultPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

    if (editingStudent) {
      setStudents(prev =>
        prev.map(s =>
          s.id === editingStudent.id
            ? {
                ...s,
                fullName: formData.fullName,
                photo: formData.photo || defaultPhoto,
                gender: formData.gender,
                phone: formData.phone,
                email: formData.email,
                course: formData.course,
                coachId: coachObj.id,
                coachName: coachObj.fullName,
                parentName: formData.parentName,
                parentPhone: formData.parentPhone,
                totalFee: formData.totalFee
              }
            : s
        )
      );
      addToast({ type: 'success', title: 'Student Updated', message: `${formData.fullName} record updated.` });
    } else {
      const newIdNum = String(students.length + 1).padStart(3, '0');
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        studentId: `MSRF-2026-${newIdNum}`,
        fullName: formData.fullName,
        photo: formData.photo || defaultPhoto,
        dateOfBirth: formData.dateOfBirth || '2012-05-15',
        gender: formData.gender,
        phone: formData.phone || '9847000000',
        email: formData.email || 'student@msrf.org',
        address: formData.address || 'Calicut, Kerala',
        admissionNumber: `ADM-2026-${newIdNum}`,
        admissionDate: new Date().toISOString().slice(0, 10),
        course: formData.course,
        batch: formData.batch as any,
        coachId: coachObj.id,
        coachName: coachObj.fullName,
        status: 'Active',
        parentName: formData.parentName || 'Parent Name',
        relationship: formData.relationship as any,
        parentPhone: formData.parentPhone || '9447000000',
        parentEmail: formData.parentEmail || 'parent@gmail.com',
        parentAddress: formData.address || 'Calicut, Kerala',
        emergencyName: formData.emergencyName || formData.parentName,
        emergencyRelationship: formData.relationship,
        emergencyPhone: formData.emergencyPhone || formData.parentPhone,
        attendancePercentage: 100,
        totalPresent: 0,
        totalAbsent: 0,
        feeStatus: 'Pending',
        totalFee: formData.totalFee,
        paidAmount: 0,
        pendingAmount: formData.totalFee,
        documents: []
      };

      setStudents([newStudent, ...students]);
      addToast({ type: 'success', title: 'Admission Registered', message: `${newStudent.fullName} added.` });
    }

    setIsAddModalOpen(false);
  };

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Inactive') => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, status: newStatus } : s)));
    addToast({ type: 'info', title: 'Status Updated', message: `Student status set to ${newStatus}` });
  };

  const handleDeleteConfirm = () => {
    if (!deletingStudent) return;
    setStudents(prev => prev.filter(s => s.id !== deletingStudent.id));
    addToast({ type: 'info', title: 'Student Removed', message: `"${deletingStudent.fullName}" deleted.` });
    setDeletingStudent(null);
  };

  const handleExportCSV = () => {
    const exportData = filteredStudents.map(s => ({
      'Student ID': s.studentId,
      'Full Name': s.fullName,
      'Course': s.course,
      'Coach': s.coachName,
      'Parent Name': s.parentName,
      'Phone': s.phone,
      'Attendance %': `${s.attendancePercentage}%`,
      'Total Fee': s.totalFee,
      'Paid': s.paidAmount,
      'Pending': s.pendingAmount,
      'Fee Status': s.feeStatus,
      'Status': s.status
    }));
    exportToCSV('msrf_students_roster', exportData);
  };

  return (
    <LayoutShell
      title="Student Roster & Admission Directory"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Students' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
          <Button
            size="sm"
            onClick={handleOpenAdd}
            icon={<UserPlus className="w-4 h-4" />}
          >
            New Student Admission
          </Button>
        </div>
      }
    >
      {/* Filtering & View Switcher Bar */}
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search student name, ID, phone, parent..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={[
          {
            key: 'course',
            label: 'Course',
            value: courseFilter,
            onChange: setCourseFilter,
            options: [
              { label: 'All Courses', value: 'ALL' },
              { label: 'Swimming Academy', value: 'Swimming Academy' },
              { label: 'Football Excellence', value: 'Football Excellence' },
              { label: 'Badminton Club', value: 'Badminton Club' },
              { label: 'Tennis Training', value: 'Tennis Training' },
              { label: 'Cricket Performance', value: 'Cricket Performance' },
              { label: 'Athletics & Track', value: 'Athletics & Track' }
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
          },
          {
            key: 'feeStatus',
            label: 'Fee Status',
            value: feeStatusFilter,
            onChange: setFeeStatusFilter,
            options: [
              { label: 'All Fee States', value: 'ALL' },
              { label: 'Paid', value: 'Paid' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Overdue', value: 'Overdue' },
              { label: 'Partially Paid', value: 'Partially Paid' }
            ]
          }
        ]}
      />

      {/* Main Table / Grid View */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          title="No Students Found"
          description="No student records match your active search query or filter settings."
        />
      ) : viewMode === 'list' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4">Coach</th>
                  <th className="py-3.5 px-4">Parent Details</th>
                  <th className="py-3.5 px-4">Attendance</th>
                  <th className="py-3.5 px-4">Fee Status</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedStudents.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.photo}
                          alt={st.fullName}
                          onClick={() => setLightboxImg({ url: st.photo, title: `${st.fullName} (${st.studentId})` })}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/super-admin/students/${st.id}`)}>
                            {st.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-normal">{st.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">{st.studentId}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{st.course}</td>
                    <td className="py-3.5 px-4 text-slate-600">{st.coachName}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{st.parentName}</p>
                      <p className="text-[11px] text-slate-400">{st.parentPhone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${st.attendancePercentage >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${st.attendancePercentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 text-[11px]">{st.attendancePercentage}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          st.feeStatus === 'Paid'
                            ? 'paid'
                            : st.feeStatus === 'Overdue'
                            ? 'overdue'
                            : 'pending'
                        }
                      >
                        {st.feeStatus} ({formatCurrency(st.pendingAmount)})
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusToggle
                        status={st.status || 'Active'}
                        onChange={newStatus => handleStatusChange(st.id, newStatus)}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/super-admin/students/${st.id}`)}
                          icon={<Eye className="w-3.5 h-3.5 text-slate-600" />}
                          title="View Full Profile"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(st)}
                          icon={<Edit3 className="w-3.5 h-3.5 text-blue-600" />}
                          title="Edit Student"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingStudent(st)}
                          icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                          title="Delete Student"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedStudents.map(st => (
            <Card
              key={st.id}
              hoverEffect
              className="cursor-pointer"
              onClick={() => navigate(`/super-admin/students/${st.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={st.photo}
                    alt={st.fullName}
                    onClick={(e) => { e.stopPropagation(); setLightboxImg({ url: st.photo, title: st.fullName }); }}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{st.fullName}</h3>
                    <p className="text-xs font-mono text-slate-400">{st.studentId}</p>
                  </div>
                </div>
                <StatusToggle
                  status={st.status || 'Active'}
                  onChange={newStatus => handleStatusChange(st.id, newStatus)}
                />
              </div>

              <div className="mt-4 space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Course:</span>
                  <span className="font-bold text-slate-800">{st.course}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coach:</span>
                  <span className="font-semibold text-slate-700">{st.coachName}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400">Fee Balance:</span>
                  <span className="font-bold text-rose-600">{formatCurrency(st.pendingAmount)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/super-admin/students/${st.id}`); }}>
                  View Profile
                </Button>
                <div className="flex items-center gap-1 text-slate-400" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(st)} icon={<Edit3 className="w-3.5 h-3.5 text-blue-600" />} />
                  <Button variant="ghost" size="sm" onClick={() => setDeletingStudent(st)} icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />} />
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
        totalItems={filteredStudents.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={!!lightboxImg}
        onClose={() => setLightboxImg(null)}
        imageUrl={lightboxImg?.url || ''}
        title={lightboxImg?.title}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingStudent?.fullName}
      />

      {/* Add / Edit Student Modal (First always active - No status dropdown) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingStudent ? `Edit Student: ${editingStudent.fullName}` : "New Student Admission Registration"}
        size="lg"
      >
        <form onSubmit={handleSaveStudent} className="space-y-6">
          {/* Section 1: Personal Info */}
          <div>
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">
              1. Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Adarsh Nair"
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
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
              <Input
                label="Student Phone"
                isPhone
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="10-digit mobile"
              />
            </div>
            
            <div className="mt-4">
              <ImageUpload
                label="Student Profile Photo"
                value={formData.photo}
                onChange={url => setFormData({ ...formData, photo: url })}
              />
            </div>
          </div>

          {/* Section 2: Admission Details */}
          <div>
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">
              2. Admission Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Sports Course"
                options={[
                  { label: 'Swimming Academy', value: 'Swimming Academy' },
                  { label: 'Football Excellence', value: 'Football Excellence' },
                  { label: 'Badminton Club', value: 'Badminton Club' },
                  { label: 'Tennis Training', value: 'Tennis Training' },
                  { label: 'Cricket Performance', value: 'Cricket Performance' },
                  { label: 'Athletics & Track', value: 'Athletics & Track' }
                ]}
                value={formData.course}
                onChange={e => setFormData({ ...formData, course: e.target.value as any })}
              />
              <Select
                label="Assigned Coach"
                options={INITIAL_COACHES.map(c => ({ label: `${c.fullName} (${c.specialization})`, value: c.id }))}
                value={formData.coachId}
                onChange={e => setFormData({ ...formData, coachId: e.target.value })}
              />
              <Input
                label="Annual Course Fee (₹)"
                type="number"
                value={formData.totalFee}
                onChange={e => setFormData({ ...formData, totalFee: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Section 3: Parent & Emergency */}
          <div>
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">
              3. Parent & Emergency Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Parent / Guardian Name"
                required
                value={formData.parentName}
                onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="e.g. Ramesh Nair"
              />
              <Input
                label="Parent Phone Number"
                isPhone
                required
                value={formData.parentPhone}
                onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="10-digit mobile"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingStudent ? "Update Student" : "Complete Admission"}</Button>
          </div>
        </form>
      </Modal>
    </LayoutShell>
  );
};
