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
  Download,
  Tag,
  Layers,
  MapPin
} from 'lucide-react';
import { INITIAL_STUDENTS, INITIAL_CATEGORIES, INITIAL_PROGRAM_TYPES, INITIAL_TRAINING_CENTERS } from '../../mock-data/msrf-data';
import { Student } from '../../types';
import { formatCurrency, exportToCSV } from '../../utils/format';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

export const StudentListPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [search, setSearch] = useState('');
  
  // Filters (Category, Program Type, Training Center, DOB Year, Status, Fee Status)
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [programTypeFilter, setProgramTypeFilter] = useState('ALL');
  const [trainingCenterFilter, setTrainingCenterFilter] = useState('ALL');
  const [dobYearFilter, setDobYearFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [feeStatusFilter, setFeeStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // List default!

  // Dynamic lists from modules
  const categoriesList = INITIAL_CATEGORIES.map(c => c.title);
  const programTypesList = INITIAL_PROGRAM_TYPES.map(pt => pt.title);
  const trainingCentersList = INITIAL_TRAINING_CENTERS.map(tc => tc.name);
  const dobYearsList = Array.from(new Set(students.map(s => (s.dateOfBirth ? s.dateOfBirth.slice(0, 4) : '2012')))).sort().reverse();

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
    category: categoriesList[0] || 'Football Academy',
    programType: programTypesList[0] || 'Day Scholar Program',
    trainingCenter: trainingCentersList[0] || 'Kozhikode Main Campus',
    batch: 'Morning (6:00 AM - 8:00 AM)',
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
  const todayDateStr = new Date().toISOString().split('T')[0];

  // Filter logic
  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.parentName.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);
    const matchesCategory = categoryFilter === 'ALL' || s.category === categoryFilter;
    const matchesProgramType = programTypeFilter === 'ALL' || s.programType === programTypeFilter;
    const matchesTrainingCenter = trainingCenterFilter === 'ALL' || s.trainingCenter === trainingCenterFilter;
    const matchesDobYear = dobYearFilter === 'ALL' || (s.dateOfBirth && s.dateOfBirth.startsWith(dobYearFilter));
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesFeeStatus = feeStatusFilter === 'ALL' || s.feeStatus === feeStatusFilter;

    return matchesSearch && matchesCategory && matchesProgramType && matchesTrainingCenter && matchesDobYear && matchesStatus && matchesFeeStatus;
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
      category: categoriesList[0] || 'Football Academy',
      programType: programTypesList[0] || 'Day Scholar Program',
      trainingCenter: trainingCentersList[0] || 'Kozhikode Main Campus',
      batch: 'Morning (6:00 AM - 8:00 AM)',
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
      category: s.category || categoriesList[0],
      programType: s.programType || programTypesList[0],
      trainingCenter: s.trainingCenter || trainingCentersList[0],
      batch: s.batch,
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

    // DOB Validation (Required & No Future Dates)
    if (!formData.dateOfBirth) {
      addToast({ type: 'warning', title: 'Missing Date of Birth', message: 'Date of Birth is required.' });
      return;
    }
    if (new Date(formData.dateOfBirth) > new Date()) {
      addToast({ type: 'warning', title: 'Invalid Date of Birth', message: 'Date of Birth cannot be in future dates.' });
      return;
    }

    if (formData.parentPhone && formData.parentPhone.length < 10) {
      addToast({ type: 'warning', title: 'Invalid Phone Number', message: 'Parent phone number must be 10 digits.' });
      return;
    }

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
                dateOfBirth: formData.dateOfBirth,
                phone: formData.phone,
                email: formData.email,
                category: formData.category,
                programType: formData.programType,
                trainingCenter: formData.trainingCenter,
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
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone || '9847000000',
        email: formData.email || 'student@msrf.org',
        address: formData.address || 'Calicut, Kerala',
        admissionNumber: `ADM-2026-${newIdNum}`,
        admissionDate: new Date().toISOString().slice(0, 10),
        category: formData.category,
        programType: formData.programType,
        trainingCenter: formData.trainingCenter,
        batch: formData.batch as any,
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
      'Category': s.category,
      'Program Type': s.programType,
      'Training Center': s.trainingCenter,
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
            key: 'category',
            label: 'Category',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: 'All Categories', value: 'ALL' },
              ...categoriesList.map(c => ({ label: c, value: c }))
            ]
          },
          {
            key: 'programType',
            label: 'Program Type',
            value: programTypeFilter,
            onChange: setProgramTypeFilter,
            options: [
              { label: 'All Program Types', value: 'ALL' },
              ...programTypesList.map(pt => ({ label: pt, value: pt }))
            ]
          },
          {
            key: 'trainingCenter',
            label: 'Training Center',
            value: trainingCenterFilter,
            onChange: setTrainingCenterFilter,
            options: [
              { label: 'All Training Centers', value: 'ALL' },
              ...trainingCentersList.map(tc => ({ label: tc, value: tc }))
            ]
          },
          {
            key: 'dobYear',
            label: 'DOB Year',
            value: dobYearFilter,
            onChange: setDobYearFilter,
            options: [
              { label: 'All DOB Years', value: 'ALL' },
              ...dobYearsList.map(y => ({ label: `Year ${y}`, value: y }))
            ]
          },
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
              { label: 'Overdue', value: 'Overdue' }
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
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Program Type</th>
                  <th className="py-3.5 px-4">Training Center</th>
                  <th className="py-3.5 px-4">Parent Details</th>
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
                    <td className="py-3.5 px-4 font-bold text-blue-600">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{st.category}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-700">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{st.programType}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{st.trainingCenter}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{st.parentName}</p>
                      <p className="text-[11px] text-slate-400">{st.parentPhone}</p>
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
              className="cursor-pointer space-y-3"
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

              <div className="mt-3 space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1"><Tag className="w-3 h-3 text-blue-500" /> Category:</span>
                  <span className="font-bold text-blue-600">{st.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1"><Layers className="w-3 h-3 text-indigo-500" /> Program Type:</span>
                  <span className="font-semibold text-indigo-700">{st.programType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3 text-rose-500" /> Training Center:</span>
                  <span className="font-semibold text-slate-800">{st.trainingCenter}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400">Fee Balance:</span>
                  <span className="font-bold text-rose-600">{formatCurrency(st.pendingAmount)}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
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

      {/* Add / Edit Student Modal */}
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
                required
                max={todayDateStr}
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

          {/* Section 2: Admission & Enrollment Details */}
          <div>
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">
              2. Admission & Enrollment Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                options={categoriesList.map(c => ({ label: c, value: c }))}
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              />
              <Select
                label="Program Type"
                options={programTypesList.map(pt => ({ label: pt, value: pt }))}
                value={formData.programType}
                onChange={e => setFormData({ ...formData, programType: e.target.value })}
              />
              <Select
                label="Training Center"
                options={trainingCentersList.map(tc => ({ label: tc, value: tc }))}
                value={formData.trainingCenter}
                onChange={e => setFormData({ ...formData, trainingCenter: e.target.value })}
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
