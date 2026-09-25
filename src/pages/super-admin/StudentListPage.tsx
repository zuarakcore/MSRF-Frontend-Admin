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
  Pencil, 
  Trash2, 
  Download,
  Upload,
  FileSpreadsheet,
  FileUp,
  Tag,
  Layers,
  MapPin,
  FileDown,
  Phone
} from 'lucide-react';
import { INITIAL_STUDENTS, INITIAL_CATEGORIES, INITIAL_PROGRAM_TYPES, INITIAL_TRAINING_CENTERS } from '../../mock-data/msrf-data';
import { Student } from '../../types';
import { formatCurrency, formatDate, formatPhoneNumber, exportToCSV } from '../../utils/format';
import { PrintPortal } from '../../components/ui/PrintPortal';
import { ReportHeader } from '../../components/ui/ReportHeader';
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
  const [pdfStudentRecord, setPdfStudentRecord] = useState<Student | null>(null);

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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    photo: '',
    gender: 'Male' as 'Male' | 'Female',
    bloodGroup: 'O+',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    admissionNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    category: categoriesList[0] || 'Football Academy',
    programType: programTypesList[0] || 'Day Scholar Program',
    trainingCenter: trainingCentersList[0] || 'Kozhikode Main Campus',
    batch: 'Morning (6:00 AM - 8:00 AM)',
    parentName: '',
    relationship: 'Father' as 'Father' | 'Mother' | 'Guardian',
    parentPhone: '',
    parentEmail: '',
    parentAddress: '',
    emergencyName: '',
    emergencyRelationship: 'Father',
    emergencyPhone: '',
    monthlyFee: 2000
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
      bloodGroup: 'O+',
      dateOfBirth: '',
      phone: '',
      email: '',
      address: '',
      admissionNumber: '',
      admissionDate: todayDateStr,
      category: categoriesList[0] || 'Football Academy',
      programType: programTypesList[0] || 'Day Scholar Program',
      trainingCenter: trainingCentersList[0] || 'Kozhikode Main Campus',
      batch: 'Morning (6:00 AM - 8:00 AM)',
      parentName: '',
      relationship: 'Father',
      parentPhone: '',
      parentEmail: '',
      parentAddress: '',
      emergencyName: '',
      emergencyRelationship: 'Father',
      emergencyPhone: '',
      monthlyFee: 2000
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setFormData({
      fullName: s.fullName,
      photo: s.photo,
      gender: s.gender as any,
      bloodGroup: s.bloodGroup || 'O+',
      dateOfBirth: s.dateOfBirth,
      phone: s.phone,
      email: s.email || '',
      address: s.address || '',
      admissionNumber: s.admissionNumber || '',
      admissionDate: s.admissionDate || todayDateStr,
      category: s.category || categoriesList[0],
      programType: s.programType || programTypesList[0],
      trainingCenter: s.trainingCenter || trainingCentersList[0],
      batch: s.batch || 'Morning (6:00 AM - 8:00 AM)',
      parentName: s.parentName || '',
      relationship: s.relationship || 'Father',
      parentPhone: s.parentPhone || '',
      parentEmail: s.parentEmail || '',
      parentAddress: s.parentAddress || s.address || '',
      emergencyName: s.emergencyName || '',
      emergencyRelationship: s.emergencyRelationship || 'Father',
      emergencyPhone: s.emergencyPhone || '',
      monthlyFee: s.monthlyFee || (s.totalFee ? Math.round(s.totalFee / 12) : 2000)
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
    const computedMonthlyFee = Number(formData.monthlyFee) || 2000;
    const computedTotalFee = computedMonthlyFee * 12;

    if (editingStudent) {
      setStudents(prev =>
        prev.map(s =>
          s.id === editingStudent.id
            ? {
                ...s,
                fullName: formData.fullName,
                photo: formData.photo || defaultPhoto,
                gender: formData.gender,
                bloodGroup: formData.bloodGroup,
                dateOfBirth: formData.dateOfBirth,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                admissionNumber: formData.admissionNumber || s.admissionNumber,
                admissionDate: formData.admissionDate,
                category: formData.category,
                programType: formData.programType,
                trainingCenter: formData.trainingCenter,
                batch: formData.batch as any,
                parentName: formData.parentName,
                relationship: formData.relationship as any,
                parentPhone: formData.parentPhone,
                parentEmail: formData.parentEmail,
                parentAddress: formData.parentAddress || formData.address,
                emergencyName: formData.emergencyName,
                emergencyRelationship: formData.emergencyRelationship,
                emergencyPhone: formData.emergencyPhone,
                monthlyFee: computedMonthlyFee,
                totalFee: computedTotalFee,
                pendingAmount: Math.max(0, computedTotalFee - (s.paidAmount || 0))
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
        bloodGroup: formData.bloodGroup,
        phone: formData.phone || '9847000000',
        email: formData.email || 'student@msrf.org',
        address: formData.address || 'Calicut, Kerala',
        admissionNumber: formData.admissionNumber || `ADM-2026-${newIdNum}`,
        admissionDate: formData.admissionDate || todayDateStr,
        category: formData.category,
        programType: formData.programType,
        trainingCenter: formData.trainingCenter,
        batch: formData.batch as any,
        status: 'Active',
        parentName: formData.parentName || 'Parent Name',
        relationship: formData.relationship as any,
        parentPhone: formData.parentPhone || '9447000000',
        parentEmail: formData.parentEmail || 'parent@gmail.com',
        parentAddress: formData.parentAddress || formData.address || 'Calicut, Kerala',
        emergencyName: formData.emergencyName || formData.parentName,
        emergencyRelationship: formData.emergencyRelationship || formData.relationship,
        emergencyPhone: formData.emergencyPhone || formData.parentPhone,
        attendancePercentage: 100,
        totalPresent: 0,
        totalAbsent: 0,
        feeStatus: 'Pending',
        monthlyFee: computedMonthlyFee,
        totalFee: computedTotalFee,
        paidAmount: 0,
        pendingAmount: computedTotalFee,
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

  const handleDownloadSampleCSV = () => {
    const sampleData = [
      {
        'Full Name': 'Arjun K',
        'Gender': 'Male',
        'Blood Group': 'O+',
        'Date of Birth': '2012-05-14',
        'Phone': '9847112233',
        'Email': 'arjun@gmail.com',
        'Address': 'Calicut, Kerala',
        'Category': 'Football Academy',
        'Program Type': 'Day Scholar Program',
        'Training Center': 'Kozhikode Main Campus',
        'Parent Name': 'Krishnan K',
        'Parent Phone': '9447112233',
        'Parent Email': 'krishnan@gmail.com',
        'Emergency Phone': '9447112233'
      },
      {
        'Full Name': 'Ananya Nair',
        'Gender': 'Female',
        'Blood Group': 'A+',
        'Date of Birth': '2014-08-20',
        'Phone': '9847223344',
        'Email': 'ananya@gmail.com',
        'Address': 'Wayanad, Kerala',
        'Category': 'Swimming High Performance',
        'Program Type': 'Residential Program',
        'Training Center': 'Wayanad Training Center',
        'Parent Name': 'Ramesh Nair',
        'Parent Phone': '9447223344',
        'Parent Email': 'ramesh@gmail.com',
        'Emergency Phone': '9447223344'
      }
    ];
    exportToCSV('msrf_student_import_sample_template', sampleData);
    addToast({ type: 'success', title: 'Sample CSV Downloaded', message: 'Template saved to downloads.' });
  };

  const handleImportCSVSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      addToast({ type: 'warning', title: 'No File Selected', message: 'Please select a CSV file to upload.' });
      return;
    }

    const mockNewStudents: Student[] = [
      {
        id: `student-imp-${Date.now()}-1`,
        studentId: `MSRF-2026-${String(students.length + 1).padStart(3, '0')}`,
        fullName: 'Rahul Varma',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
        dateOfBirth: '2012-04-10',
        gender: 'Male',
        bloodGroup: 'B+',
        phone: '9847556677',
        email: 'rahul@gmail.com',
        address: 'Kozhikode, Kerala',
        admissionNumber: `ADM-2026-${String(students.length + 1).padStart(3, '0')}`,
        admissionDate: new Date().toISOString().slice(0, 10),
        category: categoriesList[0] || 'Football Academy',
        programType: programTypesList[0] || 'Day Scholar Program',
        trainingCenter: trainingCentersList[0] || 'Kozhikode Main Campus',
        batch: 'Morning (6:00 AM - 8:00 AM)',
        status: 'Active',
        parentName: 'Vikram Varma',
        relationship: 'Father',
        parentPhone: '9447556677',
        parentEmail: 'vikram@gmail.com',
        parentAddress: 'Kozhikode, Kerala',
        emergencyName: 'Vikram Varma',
        emergencyRelationship: 'Father',
        emergencyPhone: '9447556677',
        attendancePercentage: 100,
        totalPresent: 0,
        totalAbsent: 0,
        feeStatus: 'Pending',
        totalFee: 24000,
        paidAmount: 0,
        pendingAmount: 24000,
        documents: []
      },
      {
        id: `student-imp-${Date.now()}-2`,
        studentId: `MSRF-2026-${String(students.length + 2).padStart(3, '0')}`,
        fullName: 'Meera Suresh',
        photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
        dateOfBirth: '2013-09-15',
        gender: 'Female',
        bloodGroup: 'O+',
        phone: '9847667788',
        email: 'meera@gmail.com',
        address: 'Malappuram, Kerala',
        admissionNumber: `ADM-2026-${String(students.length + 2).padStart(3, '0')}`,
        admissionDate: new Date().toISOString().slice(0, 10),
        category: categoriesList[1] || 'Athletics & Track',
        programType: programTypesList[1] || 'Weekend Program',
        trainingCenter: trainingCentersList[0] || 'Kozhikode Main Campus',
        batch: 'Evening (4:00 PM - 6:00 PM)',
        status: 'Active',
        parentName: 'Suresh Kumar',
        relationship: 'Father',
        parentPhone: '9447667788',
        parentEmail: 'suresh@gmail.com',
        parentAddress: 'Malappuram, Kerala',
        emergencyName: 'Suresh Kumar',
        emergencyRelationship: 'Father',
        emergencyPhone: '9447667788',
        attendancePercentage: 100,
        totalPresent: 0,
        totalAbsent: 0,
        feeStatus: 'Pending',
        totalFee: 24000,
        paidAmount: 0,
        pendingAmount: 24000,
        documents: []
      }
    ];

    setStudents([...mockNewStudents, ...students]);
    setIsImportModalOpen(false);
    setImportFile(null);
    addToast({
      type: 'success',
      title: 'CSV Import Successful',
      message: `${mockNewStudents.length} student records imported into the system.`
    });
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
            onClick={() => setIsImportModalOpen(true)}
            icon={<FileUp className="w-4 h-4 text-emerald-600" />}
            className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          >
            Import CSV
          </Button>
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
                  <tr key={st.id} onClick={() => navigate(`/super-admin/students/${st.id}`)} className="hover:bg-slate-50/80 transition-colors cursor-pointer">
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
                          <p className="text-[11px] font-mono text-blue-600 font-semibold mt-0.5 whitespace-nowrap">
                            {formatPhoneNumber(st.phone)}
                          </p>
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
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-bold text-slate-800">{st.parentName}</p>
                      <p className="text-[11px] font-mono text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{formatPhoneNumber(st.parentPhone)}</span>
                      </p>
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
                    <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                      <StatusToggle
                        status={st.status || 'Active'}
                        onChange={newStatus => handleStatusChange(st.id, newStatus)}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPdfStudentRecord(st)}
                          icon={<FileDown className="w-3.5 h-3.5 text-emerald-600" />}
                          title="View & Print Student PDF Report"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(st)}
                          icon={<Pencil className="w-3.5 h-3.5 text-blue-600" />}
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
                    <p className="text-[11px] font-mono text-blue-600 font-semibold">{formatPhoneNumber(st.phone)}</p>
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
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> Parent Details:</span>
                  <span className="font-bold text-slate-800">{st.parentName} ({formatPhoneNumber(st.parentPhone)})</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/super-admin/students/${st.id}`); }}>
                  View Profile
                </Button>
                <div className="flex items-center gap-1 text-slate-400" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={() => setPdfStudentRecord(st)} icon={<FileDown className="w-3.5 h-3.5 text-emerald-600" />} title="Student PDF Report" />
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(st)} icon={<Pencil className="w-3.5 h-3.5 text-blue-600" />} />
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
              <Input
                label="Student Email Address"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@gmail.com"
              />
            </div>
            
            <div className="mt-4">
              <Input
                label="Residential Address"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full street address, city, pin code..."
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
              <Input
                label="Admission Number"
                value={formData.admissionNumber}
                onChange={e => setFormData({ ...formData, admissionNumber: e.target.value })}
                placeholder="Auto-generated if left empty (e.g. ADM-2026-101)"
              />
              <Input
                label="Admission Date"
                type="date"
                value={formData.admissionDate}
                onChange={e => setFormData({ ...formData, admissionDate: e.target.value })}
              />
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
              <div>
                <Input
                  label="Monthly Fee (₹/month)"
                  type="number"
                  value={formData.monthlyFee}
                  onChange={e => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                  placeholder="e.g. 2000"
                />
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  Yearly Fee: <span className="font-bold text-slate-800">₹{(Number(formData.monthlyFee || 0) * 12).toLocaleString('en-IN')}</span> (12 months)
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Parent & Guardian Details */}
          <div>
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">
              3. Parent & Guardian Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Parent / Guardian Name"
                required
                value={formData.parentName}
                onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                placeholder="e.g. Ramesh Nair"
              />
              <Select
                label="Relationship to Trainee"
                options={[
                  { label: 'Father', value: 'Father' },
                  { label: 'Mother', value: 'Mother' },
                  { label: 'Guardian', value: 'Guardian' }
                ]}
                value={formData.relationship}
                onChange={e => setFormData({ ...formData, relationship: e.target.value as any })}
              />
              <Input
                label="Parent Phone Number"
                isPhone
                required
                value={formData.parentPhone}
                onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                placeholder="10-digit mobile"
              />
              <Input
                label="Parent Email Address"
                type="email"
                value={formData.parentEmail}
                onChange={e => setFormData({ ...formData, parentEmail: e.target.value })}
                placeholder="parent@gmail.com"
              />
            </div>
            <div className="mt-4">
              <Input
                label="Parent Address"
                value={formData.parentAddress}
                onChange={e => setFormData({ ...formData, parentAddress: e.target.value })}
                placeholder="Parent residential address..."
              />
            </div>
          </div>

          {/* Section 4: Emergency Contact */}
          <div>
            <h4 className="text-xs font-bold text-rose-600 uppercase tracking-widest border-b border-slate-200 pb-1 mb-3">
              4. Emergency Contact Info
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Emergency Contact Name"
                value={formData.emergencyName}
                onChange={e => setFormData({ ...formData, emergencyName: e.target.value })}
                placeholder="e.g. Suresh Kumar"
              />
              <Input
                label="Relationship"
                value={formData.emergencyRelationship}
                onChange={e => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                placeholder="e.g. Uncle / Parent"
              />
              <Input
                label="Emergency Phone"
                isPhone
                value={formData.emergencyPhone}
                onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })}
                placeholder="10-digit emergency number"
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

      {/* Import Students CSV Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Students Batch via CSV File"
        size="md"
      >
        <form onSubmit={handleImportCSVSubmit} className="space-y-5">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-900">Need the CSV Template Format?</p>
              <p className="text-[11px] text-slate-500">Download the official pre-formatted CSV template with sample data.</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDownloadSampleCSV}
              icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
              className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 shrink-0"
            >
              Download Sample CSV
            </Button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
              Select CSV File to Upload
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center bg-slate-50 hover:bg-emerald-50/20 transition cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={e => setImportFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-2">Supports UTF-8 formatted CSV files (Max 5MB)</p>
            </div>
          </div>

          {importFile && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between text-emerald-900 font-medium">
              <span>Selected File: <b>{importFile.name}</b></span>
              <span className="text-[11px] text-emerald-700">Ready to Import</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" icon={<Upload className="w-4 h-4" />}>
              Import Students Batch
            </Button>
          </div>
        </form>
      </Modal>

      {/* STUDENT PROFILE PDF REPORT PORTAL */}
      {pdfStudentRecord && (
        <PrintPortal
          title={`Student_Report_${pdfStudentRecord.fullName}`}
          onClose={() => setPdfStudentRecord(null)}
        >
          <div className="space-y-6 text-slate-800 font-sans">
            <ReportHeader title="STUDENT TRAINEE PROFILE REPORT" date={new Date().toISOString().slice(0, 10)} />
            
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img src={pdfStudentRecord.photo} alt={pdfStudentRecord.fullName} className="w-20 h-20 rounded-xl object-cover border border-slate-300 shrink-0" />
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs flex-1">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Full Name</p>
                  <p className="font-bold text-slate-900 text-sm">{pdfStudentRecord.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Blood Group</p>
                  <p className="font-bold text-rose-600 text-sm">{pdfStudentRecord.bloodGroup || 'O+'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Academy Category</p>
                  <p className="font-bold text-blue-600">{pdfStudentRecord.category || 'Football Academy'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Program Type</p>
                  <p className="font-semibold text-indigo-700">{pdfStudentRecord.programType || 'Day Scholar Program'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">Personal Details</p>
                <div className="flex justify-between"><span className="text-slate-500">Gender:</span><span className="font-semibold">{pdfStudentRecord.gender}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date of Birth:</span><span className="font-semibold">{formatDate(pdfStudentRecord.dateOfBirth)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Phone:</span><span className="font-mono">{pdfStudentRecord.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Center:</span><span className="font-semibold">{pdfStudentRecord.trainingCenter || 'Kozhikode Main Campus'}</span></div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">Parent & Emergency Contact</p>
                <div className="flex justify-between"><span className="text-slate-500">Parent Name:</span><span className="font-semibold">{pdfStudentRecord.parentName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Parent Phone:</span><span className="font-mono">{pdfStudentRecord.parentPhone}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Emergency Contact:</span><span className="font-semibold">{pdfStudentRecord.emergencyName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Emergency Phone:</span><span className="font-mono font-bold text-rose-600">{pdfStudentRecord.emergencyPhone}</span></div>
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
