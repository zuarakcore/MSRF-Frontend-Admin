import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { QueryState } from '../../components/ui/QueryState';
import { studentsApi } from '../../api/endpoints';
import {
  emptyToNull,
  isPlaceholderPhoto,
  statusQuery,
  toApiBatch,
  toApiFeeStatus,
  toApiGender,
  toApiRelationship,
  toApiStatus,
  toStudent,
} from '../../api/mappers';
import { photoField } from '../../api/photos';
import { useApiAction } from '../../api/hooks';
import { ApiError, errorMessage, type FieldError } from '../../api/client';
import type { BloodGroup, RefItem } from '../../api/types';
import { Student } from '../../types';
import { formatCurrency, formatDate, formatPhoneNumber } from '../../utils/format';
import { PrintPortal } from '../../components/ui/PrintPortal';
import { ReportHeader } from '../../components/ui/ReportHeader';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

export const StudentListPage: React.FC = () => {
  const query = useQuery({ queryKey: ['students', 'all'], queryFn: () => studentsApi.listAll() });
  const students = (query.data ?? []).map(toStudent);
  const optionsQuery = useQuery({ queryKey: ['filter-options'], queryFn: studentsApi.filterOptions });
  const { run, pending } = useApiAction();
  const invalidate = [['students'], ['filter-options'], ['dashboard'], ['fees']];
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
  const options = optionsQuery.data;
  const categoriesList = (options?.categories ?? []).map(c => c.name);
  const programTypesList = (options?.programTypes ?? []).map(pt => pt.name);
  const trainingCentersList = (options?.trainingCenters ?? []).map(tc => tc.name);
  const dobYearsList = (options?.birthYears ?? []).map(String);
  // The forms and filters work with names; the API takes ids.
  const idOf = (list: RefItem[] | undefined, name: string) => list?.find(item => item.name === name)?.id;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  // Problems in the last uploaded file, grouped by row so staff can fix the whole file in one go.
  const [importErrors, setImportErrors] = useState<[number, FieldError[]][]>([]);
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
    emergencyRelationship: '',
    emergencyPhone: '',
    monthlyFee: 2000 as number | ''
  });
  // Inline messages under the form fields, keyed by form field name.
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const setField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (formErrors[key]) setFormErrors(prev => ({ ...prev, [key]: '' }));
  };

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
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
      emergencyRelationship: '',
      emergencyPhone: '',
      monthlyFee: 2000
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // The dashboard's "New Admission" button links here with ?new=1 to open the form straight away.
  useEffect(() => {
    if (searchParams.get('new') !== '1' || !optionsQuery.data) return;
    handleOpenAdd();
    setSearchParams(prev => {
      prev.delete('new');
      return prev;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, optionsQuery.data]);

  // The roster omits contact, admission and emergency details; load the full record first.
  const withDetail = async (st: Student, then: (full: Student) => void) => {
    try {
      then(toStudent(await studentsApi.get(st.id)));
    } catch (error) {
      addToast({ type: 'error', title: 'Could not load student', message: errorMessage(error) });
    }
  };

  // The profile page's Edit button links here with ?edit=<slug>; close the form back to that profile.
  const [returnToProfile, setReturnToProfile] = useState<string | null>(null);
  useEffect(() => {
    const key = searchParams.get('edit');
    if (!key || !optionsQuery.data) return;
    setReturnToProfile(key);
    handleOpenEdit({ id: key } as Student);
    setSearchParams(prev => {
      prev.delete('edit');
      return prev;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, optionsQuery.data]);

  const closeStudentForm = (savedSlug?: string) => {
    setIsAddModalOpen(false);
    if (returnToProfile) {
      // A renamed student gets a new slug, so prefer the one from the save response.
      navigate(`/super-admin/students/${savedSlug ?? returnToProfile}`, { replace: true });
      setReturnToProfile(null);
    }
  };

  const handleOpenEdit = (listStudent: Student) => withDetail(listStudent, s => {
    setEditingStudent(s);
    setFormData({
      fullName: s.fullName,
      photo: isPlaceholderPhoto(s.photo) ? '' : s.photo,
      gender: s.gender as any,
      bloodGroup: s.bloodGroup || 'O+',
      dateOfBirth: s.dateOfBirth,
      phone: s.phone,
      email: s.email || '',
      address: s.address || '',
      admissionNumber: s.admissionNumber || '',
      admissionDate: s.admissionDate || todayDateStr,
      category: s.category || categoriesList[0] || '',
      programType: s.programType || programTypesList[0] || '',
      trainingCenter: s.trainingCenter || trainingCentersList[0] || '',
      batch: s.batch || 'Morning (6:00 AM - 8:00 AM)',
      parentName: s.parentName || '',
      relationship: s.relationship || 'Father',
      parentPhone: s.parentPhone || '',
      parentEmail: s.parentEmail || '',
      parentAddress: s.parentAddress || s.address || '',
      emergencyName: s.emergencyName || '',
      emergencyRelationship: s.emergencyRelationship || '',
      emergencyPhone: s.emergencyPhone || '',
      monthlyFee: s.monthlyFee ?? 0
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  });

  // Same rules as the backend (StudentIn), so mistakes show under the field instead of failing on save.
  const validateStudentForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    const nameProblem = (value: string, label: string) => {
      const v = value.trim();
      if (!v) return `${label} is required.`;
      if (v.length < 2) return `${label} must be at least 2 characters.`;
      if (v.length > 120) return `${label} must be at most 120 characters.`;
      if (!/^[\p{L}][\p{L} .'-]*$/u.test(v)) return `${label} can only contain letters, spaces, dots, hyphens and apostrophes.`;
      return '';
    };
    const phoneProblem = (value: string, label: string, required: boolean) => {
      const v = value.trim();
      if (!v) return required ? `${label} is required.` : '';
      if (v.length !== 10) return `${label} must be exactly 10 digits.`;
      if (!/^[6-9]\d{9}$/.test(v)) return `${label} must be a valid Indian mobile number starting with 6, 7, 8 or 9.`;
      return '';
    };
    errors.fullName = nameProblem(formData.fullName, 'Full name');
    errors.parentName = nameProblem(formData.parentName, 'Parent / guardian name');
    errors.phone = phoneProblem(formData.phone, 'Student phone', false);
    errors.parentPhone = phoneProblem(formData.parentPhone, 'Parent phone', true);
    errors.emergencyPhone = phoneProblem(formData.emergencyPhone, 'Emergency phone', false);
    if (!formData.category) errors.category = 'Category is required.';
    if (!formData.trainingCenter) errors.trainingCenter = 'Training center is required.';
    if (formData.emergencyName.trim() && formData.emergencyName.trim().length > 120) {
      errors.emergencyName = 'Emergency contact name must be at most 120 characters.';
    }
    if (formData.emergencyRelationship.trim().length > 40) {
      errors.emergencyRelationship = 'Relationship must be at most 40 characters.';
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required.';
    } else {
      const dob = new Date(`${formData.dateOfBirth}T00:00:00`);
      const ageYears = (Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000);
      if (dob > new Date()) errors.dateOfBirth = 'Date of birth cannot be in the future.';
      else if (ageYears < 3 || ageYears > 25) errors.dateOfBirth = 'Date of birth must give an age between 3 and 25 years.';
      else if (formData.admissionDate && formData.admissionDate < formData.dateOfBirth) {
        errors.admissionDate = 'Admission date cannot be before date of birth.';
      }
    }
    if (formData.monthlyFee === '' || Number(formData.monthlyFee) < 0) {
      errors.monthlyFee = 'Enter the monthly fee (0 or more).';
    }
    return errors;
  };

  // Server-side field errors ("parentPhone", "fullName"...) shown under the matching inputs.
  const showServerFieldErrors = (error: unknown) => {
    if (!(error instanceof ApiError) || !error.fieldErrors.length) return;
    const next: Record<string, string> = {};
    error.fieldErrors.forEach(fe => {
      const key = fe.field === 'parentRelationship' ? 'relationship' : fe.field;
      if (key in formData) next[key] = String(fe.message).replace(/^Value error, /, '');
    });
    setFormErrors(prev => ({ ...prev, ...next }));
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    let savedSlug: string | undefined;

    const errors = validateStudentForm();
    setFormErrors(errors);
    const firstError = Object.values(errors).find(Boolean);
    if (firstError) {
      addToast({ type: 'warning', title: 'Check the form', message: firstError });
      return;
    }

    const categoryId = idOf(options?.categories, formData.category);
    const programTypeId = idOf(options?.programTypes, formData.programType);
    const trainingCenterId = idOf(options?.trainingCenters, formData.trainingCenter);
    if (!categoryId || !programTypeId || !trainingCenterId) {
      addToast({
        type: 'warning',
        title: 'Missing setup data',
        message: 'Choose a category, program type and training center (add them from their pages first).',
      });
      return;
    }

    const target = editingStudent;
    const ok = await run(
      async () => {
        const photo = await photoField(formData.photo, isPlaceholderPhoto(target?.photo) ? undefined : target?.photo, 'STUDENT_PHOTO');
        const body = {
          fullName: formData.fullName.trim(),
          gender: toApiGender(formData.gender),
          bloodGroup: (formData.bloodGroup || null) as BloodGroup | null,
          dateOfBirth: formData.dateOfBirth,
          phone: emptyToNull(formData.phone),
          email: emptyToNull(formData.email),
          address: emptyToNull(formData.address),
          // Left empty, the backend assigns the next admission number.
          admissionNumber: emptyToNull(formData.admissionNumber),
          admissionDate: formData.admissionDate || todayDateStr,
          categoryId,
          programTypeId,
          trainingCenterId,
          batch: toApiBatch(formData.batch),
          monthlyFee: Number(formData.monthlyFee) || 0,
          parentName: formData.parentName.trim(),
          parentRelationship: toApiRelationship(formData.relationship),
          parentPhone: formData.parentPhone.trim(),
          parentEmail: emptyToNull(formData.parentEmail),
          parentAddress: emptyToNull(formData.parentAddress) ?? emptyToNull(formData.address),
          emergencyName: emptyToNull(formData.emergencyName),
          emergencyRelationship: emptyToNull(formData.emergencyRelationship),
          emergencyPhone: emptyToNull(formData.emergencyPhone),
          ...photo,
        };
        try {
          const saved = await (target ? studentsApi.update(target.id, body) : studentsApi.create(body));
          savedSlug = saved.slug;
          return saved;
        } catch (error) {
          showServerFieldErrors(error);
          throw error;
        }
      },
      {
        success: target
          ? { title: 'Student Updated', message: `${formData.fullName} record updated.` }
          : { title: 'Admission Registered', message: `${formData.fullName} added.` },
        errorTitle: target ? 'Could not update student' : 'Could not register admission',
        invalidate,
      }
    );
    if (ok) closeStudentForm(savedSlug);
  };

  const handleStatusChange = (id: string, newStatus: 'Active' | 'Inactive') => {
    run(() => studentsApi.update(id, { status: toApiStatus(newStatus) }), {
      success: { type: 'info', title: 'Status Updated', message: `Student status set to ${newStatus}` },
      invalidate,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingStudent) return;
    const target = deletingStudent;
    // Students with attendance, fees or reports cannot be deleted (409); deactivate instead.
    await run(() => studentsApi.remove(target.id), {
      success: { type: 'info', title: 'Student Removed', message: `"${target.fullName}" deleted.` },
      errorTitle: 'Could not delete',
      invalidate,
    });
    setDeletingStudent(null);
  };

  // Server-side CSV of the full roster with the current filters applied.
  const handleExportCSV = () =>
    run(
      () =>
        studentsApi.exportCsv({
          search: search.trim() || undefined,
          categoryId: categoryFilter === 'ALL' ? undefined : idOf(options?.categories, categoryFilter),
          programTypeId: programTypeFilter === 'ALL' ? undefined : idOf(options?.programTypes, programTypeFilter),
          trainingCenterId: trainingCenterFilter === 'ALL' ? undefined : idOf(options?.trainingCenters, trainingCenterFilter),
          birthYear: dobYearFilter === 'ALL' ? undefined : Number(dobYearFilter),
          status: statusQuery(statusFilter),
          feeStatus: toApiFeeStatus(feeStatusFilter),
        }),
      { errorTitle: 'Export failed' }
    );

  const handleDownloadSampleCSV = () =>
    run(() => studentsApi.importTemplate(), {
      success: { title: 'Template Downloaded', message: 'Fill it in and upload it here.' },
      errorTitle: 'Download failed',
    });

  const handleImportCSVSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) {
      addToast({ type: 'warning', title: 'No File Selected', message: 'Please select a CSV file to upload.' });
      return;
    }
    let created = 0;
    setImportErrors([]);
    // All rows are imported or none; the error lists every problem in every row.
    const ok = await run(
      async () => {
        try {
          created = (await studentsApi.importCsv(importFile)).created;
        } catch (err) {
          const rowErrors = err instanceof ApiError ? err.fieldErrors.filter(e => e.row != null) : [];
          if (!rowErrors.length) throw err;
          const byRow = new Map<number, FieldError[]>();
          rowErrors.forEach(e => byRow.set(e.row!, [...(byRow.get(e.row!) ?? []), e]));
          setImportErrors([...byRow.entries()].sort((a, b) => a[0] - b[0]));
          throw new Error(`${byRow.size} row${byRow.size === 1 ? '' : 's'} need fixing. Nothing was imported; see the list below.`);
        }
      },
      { errorTitle: 'CSV Import Failed', invalidate }
    );
    if (!ok) return;
    setIsImportModalOpen(false);
    setImportFile(null);
    addToast({ type: 'success', title: 'CSV Import Successful', message: `${created} student records imported into the system.` });
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
            onClick={() => { setImportErrors([]); setIsImportModalOpen(true); }}
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
      {query.isLoading || query.error ? (
        <QueryState isLoading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>{null}</QueryState>
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          title="No Students Found"
          description="No student records match your active search query or filter settings."
        />
      ) : viewMode === 'list' ? (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            {/* Columns keep their natural width; the table scrolls sideways on narrow screens. */}
            <table className="w-full min-w-[1180px] text-left border-collapse text-xs [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap [&_td]:align-middle">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 min-w-[220px]">Student</th>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Program Type</th>
                  <th className="py-3.5 px-4">Training Center</th>
                  <th className="py-3.5 px-4">Parent Details</th>
                  <th className="py-3.5 px-4">Fee Status</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right sticky right-0 bg-slate-50 shadow-[-8px_0_8px_-8px_rgba(15,23,42,0.12)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedStudents.map(st => (
                  <tr key={st.id} onClick={() => navigate(`/super-admin/students/${st.slug}`)} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="py-3.5 px-4 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.photo}
                          alt={st.fullName}
                          onClick={() => setLightboxImg({ url: st.photo, title: `${st.fullName} (${st.studentId})` })}
                          className="w-9 h-9 shrink-0 rounded-full object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/super-admin/students/${st.slug}`)}>
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
                    <td
                      className="py-3.5 px-4 text-right sticky right-0 bg-white group-hover:bg-slate-50 transition-colors shadow-[-8px_0_8px_-8px_rgba(15,23,42,0.12)]"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => withDetail(st, setPdfStudentRecord)}
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
              onClick={() => navigate(`/super-admin/students/${st.slug}`)}
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
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/super-admin/students/${st.slug}`); }}>
                  View Profile
                </Button>
                <div className="flex items-center gap-1 text-slate-400" onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={() => withDetail(st, setPdfStudentRecord)} icon={<FileDown className="w-3.5 h-3.5 text-emerald-600" />} title="Student PDF Report" />
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
        title="Delete Student"
        itemName={deletingStudent?.fullName}
        message={`This permanently deletes "${deletingStudent?.fullName ?? 'this student'}" and their documents. It is not a soft delete and cannot be undone. Students with attendance, payments or reports on record cannot be deleted; set them to Inactive instead to keep their history.`}
      />

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => closeStudentForm()}
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
                error={formErrors.fullName || undefined}
                onChange={e => setField('fullName', e.target.value)}
                placeholder="e.g. Adarsh Nair"
              />
              <Select
                label="Gender"
                options={[
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' }
                ]}
                value={formData.gender}
                onChange={e => setField('gender', e.target.value as any)}
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
                onChange={e => setField('bloodGroup', e.target.value)}
              />
              <Input
                label="Date of Birth"
                type="date"
                required
                max={todayDateStr}
                value={formData.dateOfBirth}
                error={formErrors.dateOfBirth || undefined}
                onChange={e => setField('dateOfBirth', e.target.value)}
              />
              <Input
                label="Student Phone"
                isPhone
                value={formData.phone}
                error={formErrors.phone || undefined}
                onChange={e => setField('phone', e.target.value)}
                placeholder="10-digit mobile"
              />
              <Input
                label="Student Email Address"
                type="email"
                value={formData.email}
                error={formErrors.email || undefined}
                onChange={e => setField('email', e.target.value)}
                placeholder="student@gmail.com"
              />
            </div>
            
            <div className="mt-4">
              <Input
                label="Residential Address"
                value={formData.address}
                error={formErrors.address || undefined}
                onChange={e => setField('address', e.target.value)}
                placeholder="Full street address, city, pin code..."
              />
            </div>

            <div className="mt-4">
              <ImageUpload
                label="Student Profile Photo"
                value={formData.photo}
                onChange={url => setField('photo', url)}
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
                error={formErrors.admissionNumber || undefined}
                onChange={e => setField('admissionNumber', e.target.value)}
                placeholder="Auto-generated if left empty (e.g. ADM-2026-101)"
              />
              <Input
                label="Admission Date"
                type="date"
                value={formData.admissionDate}
                error={formErrors.admissionDate || undefined}
                onChange={e => setField('admissionDate', e.target.value)}
              />
              <Select
                label="Category"
                required
                options={categoriesList.map(c => ({ label: c, value: c }))}
                value={formData.category}
                error={formErrors.category || undefined}
                onChange={e => setField('category', e.target.value)}
              />
              <Select
                label="Program Type"
                options={programTypesList.map(pt => ({ label: pt, value: pt }))}
                value={formData.programType}
                onChange={e => setField('programType', e.target.value)}
              />
              <Select
                label="Training Center"
                required
                options={trainingCentersList.map(tc => ({ label: tc, value: tc }))}
                value={formData.trainingCenter}
                error={formErrors.trainingCenter || undefined}
                onChange={e => setField('trainingCenter', e.target.value)}
              />
              <div>
                <Input
                  label="Monthly Fee (₹/month)"
                  type="number"
                  value={formData.monthlyFee}
                  error={formErrors.monthlyFee || undefined}
                  min={0}
                  onChange={e => setField('monthlyFee', e.target.value === '' ? '' : Number(e.target.value))}
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
                error={formErrors.parentName || undefined}
                onChange={e => setField('parentName', e.target.value)}
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
                onChange={e => setField('relationship', e.target.value as any)}
              />
              <Input
                label="Parent Phone Number"
                isPhone
                required
                value={formData.parentPhone}
                error={formErrors.parentPhone || undefined}
                onChange={e => setField('parentPhone', e.target.value)}
                placeholder="10-digit mobile"
              />
              <Input
                label="Parent Email Address"
                type="email"
                value={formData.parentEmail}
                error={formErrors.parentEmail || undefined}
                onChange={e => setField('parentEmail', e.target.value)}
                placeholder="parent@gmail.com"
              />
            </div>
            <div className="mt-4">
              <Input
                label="Parent Address"
                value={formData.parentAddress}
                error={formErrors.parentAddress || undefined}
                onChange={e => setField('parentAddress', e.target.value)}
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
                error={formErrors.emergencyName || undefined}
                onChange={e => setField('emergencyName', e.target.value)}
                placeholder="e.g. Suresh Kumar"
              />
              <Input
                label="Relationship"
                value={formData.emergencyRelationship}
                error={formErrors.emergencyRelationship || undefined}
                onChange={e => setField('emergencyRelationship', e.target.value)}
                placeholder="e.g. Uncle / Aunt / Neighbour"
              />
              <Input
                label="Emergency Phone"
                isPhone
                value={formData.emergencyPhone}
                error={formErrors.emergencyPhone || undefined}
                onChange={e => setField('emergencyPhone', e.target.value)}
                placeholder="10-digit emergency number"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => closeStudentForm()}>
              Cancel
            </Button>
            <Button type="submit" isLoading={pending}>{editingStudent ? "Update Student" : "Complete Admission"}</Button>
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
              <p className="text-[11px] text-slate-500">Category, program type and training center must match existing names. All rows are imported or none.</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleDownloadSampleCSV}
              icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
              className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 shrink-0"
            >
              Download CSV Template
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
                onChange={e => {
                  setImportFile(e.target.files?.[0] || null);
                  setImportErrors([]);
                }}
                className="w-full text-xs text-slate-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-2">Supports UTF-8 formatted CSV files (Max 5MB)</p>
            </div>
          </div>

          {importErrors.length > 0 && (
            <div className="border border-rose-200 bg-rose-50 rounded-xl text-xs max-h-64 overflow-y-auto">
              <p className="px-3 py-2 font-bold text-rose-800 border-b border-rose-200 sticky top-0 bg-rose-50">
                Fix these rows and upload the file again ({importErrors.length} row{importErrors.length === 1 ? '' : 's'})
              </p>
              <ul className="divide-y divide-rose-100">
                {importErrors.map(([row, errs]) => (
                  <li key={row} className="px-3 py-2">
                    <p className="font-bold text-slate-900">Row {row}</p>
                    <ul className="mt-1 space-y-0.5 text-rose-700">
                      {errs.map((e, i) => (
                        <li key={i}>
                          {e.field && <span className="font-semibold">{e.field}: </span>}
                          {String(e.message).replace(/^Value error, /, '')}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
            <Button type="submit" isLoading={pending} className="bg-emerald-600 hover:bg-emerald-700 text-white" icon={<Upload className="w-4 h-4" />}>
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
                  <p className="font-bold text-rose-600 text-sm">{pdfStudentRecord.bloodGroup || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Academy Category</p>
                  <p className="font-bold text-blue-600">{pdfStudentRecord.category || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Program Type</p>
                  <p className="font-semibold text-indigo-700">{pdfStudentRecord.programType || '—'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1">Personal Details</p>
                <div className="flex justify-between"><span className="text-slate-500">Gender:</span><span className="font-semibold">{pdfStudentRecord.gender}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date of Birth:</span><span className="font-semibold">{formatDate(pdfStudentRecord.dateOfBirth)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Phone:</span><span className="font-mono">{pdfStudentRecord.phone}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Center:</span><span className="font-semibold">{pdfStudentRecord.trainingCenter || '—'}</span></div>
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
