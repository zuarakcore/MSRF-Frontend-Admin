/** Typed wrappers for every backend endpoint the admin and coach portals use. */
import { buildUrl, downloadFile, http, request, tokenStore } from './client';
import type * as T from './types';

type Paging = { page?: number; pageSize?: number };
type Q = Record<string, string | number | boolean | null | undefined>;

/** Lists the UI filters/sorts client-side; fetch everything the backend allows in one page. */
export const ALL = { page: 1, pageSize: 100 } as const;

/** Fetch every page of a paginated endpoint (for screens that filter and paginate locally). */
export async function fetchAllPages<I>(path: string, query: Q = {}, maxPages = 50): Promise<I[]> {
  const first = await http.get<T.Page<I>>(path, { ...query, ...ALL });
  const items = [...first.items];
  for (let page = 2; page <= Math.min(first.pages, maxPages); page++) {
    const next = await http.get<T.Page<I>>(path, { ...query, page, pageSize: ALL.pageSize });
    items.push(...next.items);
  }
  return items;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<T.TokenOut>('POST', '/auth/login', { json: { email, password }, auth: false }),
  logout: () => request<void>('POST', '/auth/logout', { auth: false }),
  me: () => http.get<T.ApiUser>('/auth/me'),
  forgotPassword: (email: string) =>
    request<{ detail: string }>('POST', '/auth/forgot-password', { json: { email }, auth: false }),
  changePassword: (currentPassword: string, newPassword: string) =>
    http.post<T.TokenOut>('/auth/change-password', { currentPassword, newPassword }),
};

export const filesApi = {
  /** Two-step upload for photos: upload, then send the id as photoFileId. */
  upload: (file: File, purpose: 'STUDENT_PHOTO' | 'COACH_PHOTO' | 'TEAM_PHOTO') => {
    const form = new FormData();
    form.append('file', file);
    form.append('purpose', purpose);
    return http.postForm<T.FileRef>('/uploads', form);
  },
};

type RefKind = 'categories' | 'program-types' | 'training-centers';
export const referenceApi = {
  list: (kind: RefKind, query: { search?: string; status?: T.RecordStatus } = {}) =>
    http.get<T.RefOut[]>(`/${kind}`, query),
  create: (kind: RefKind, body: T.RefIn) => http.post<T.RefOut>(`/${kind}`, body),
  update: (kind: RefKind, id: string, body: T.RefIn) => http.patch<T.RefOut>(`/${kind}/${id}`, body),
  remove: (kind: RefKind, id: string) => http.delete(`/${kind}/${id}`),
};

export type StudentQuery = Paging & {
  search?: string;
  categoryId?: string;
  programTypeId?: string;
  trainingCenterId?: string;
  birthYear?: number;
  status?: T.RecordStatus;
  feeStatus?: string;
  sort?: string;
};

export const studentsApi = {
  list: (query: StudentQuery = {}) => http.get<T.Page<T.StudentListItem>>('/students', query),
  listAll: (query: Omit<StudentQuery, 'page' | 'pageSize'> = {}) =>
    fetchAllPages<T.StudentListItem>('/students', query),
  filterOptions: () => http.get<T.FilterOptions>('/students/filter-options'),
  get: (id: string) => http.get<T.StudentDetail>(`/students/${id}`),
  create: (body: T.StudentIn) => http.post<T.StudentDetail>('/students', body),
  update: (id: string, body: T.StudentPatch) => http.patch<T.StudentDetail>(`/students/${id}`, body),
  remove: (id: string) => http.delete(`/students/${id}`),
  exportCsv: (query: Omit<StudentQuery, 'page' | 'pageSize'> = {}) =>
    downloadFile('/students/export', query, 'students.csv'),
  importTemplate: () => downloadFile('/students/import-template', {}, 'students-import-template.csv'),
  importCsv: (file: File, dryRun = false) => {
    const form = new FormData();
    form.append('file', file);
    return http.postForm<{ created: number; dryRun: boolean }>('/students/import', form, { dryRun });
  },
  documents: (id: string) => http.get<T.DocumentOut[]>(`/students/${id}/documents`),
  addDocument: (id: string, title: string, file: File) => {
    const form = new FormData();
    form.append('title', title);
    form.append('file', file);
    return http.postForm<T.DocumentOut>(`/students/${id}/documents`, form);
  },
  removeDocument: (id: string, documentId: string) => http.delete(`/students/${id}/documents/${documentId}`),
  attendance: (id: string, query: { year?: number; month?: number } = {}) =>
    http.get<T.StudentAttendanceOut>(`/students/${id}/attendance`, query),
  performanceReports: (id: string) =>
    http.get<T.PerformanceReportSummary[]>(`/students/${id}/performance-reports`),
  fees: (id: string, year?: number) => http.get<T.StudentFees>(`/students/${id}/fees`, { year }),
  payments: (id: string) => http.get<T.PaymentOut[]>(`/students/${id}/payments`),
};

export const coachesApi = {
  list: (query: Paging & { search?: string; status?: T.RecordStatus; categoryId?: string } = {}) =>
    http.get<T.Page<T.CoachListItem>>('/coaches', query),
  listAll: (query: { search?: string; status?: T.RecordStatus; categoryId?: string } = {}) =>
    fetchAllPages<T.CoachListItem>('/coaches', query),
  get: (id: string) => http.get<T.CoachDetail>(`/coaches/${id}`),
  create: (body: T.CoachIn) => http.post<T.CoachDetail>('/coaches', body),
  update: (id: string, body: T.CoachPatch) => http.patch<T.CoachDetail>(`/coaches/${id}`, body),
  remove: (id: string) => http.delete(`/coaches/${id}`),
  resendInvite: (id: string) => http.post<{ detail: string }>(`/coaches/${id}/resend-invite`),
  attendance: (id: string, query: { year?: number; month?: number } = {}) =>
    http.get<T.CoachAttendanceOut>(`/coaches/${id}/attendance`, query),
  documents: (id: string) => http.get<T.DocumentOut[]>(`/coaches/${id}/documents`),
  addDocument: (id: string, title: string, file: File, kind: 'CONTRACT' | 'GENERAL' = 'GENERAL') => {
    const form = new FormData();
    form.append('title', title);
    form.append('file', file);
    form.append('kind', kind);
    return http.postForm<T.DocumentOut>(`/coaches/${id}/documents`, form);
  },
  removeDocument: (id: string, documentId: string) => http.delete(`/coaches/${id}/documents/${documentId}`),
};

type AttendanceQuery = { year?: number; month?: number; date?: string; categoryId?: string; search?: string };

export const sessionsApi = {
  list: (query: Paging & { coachId?: string; categoryId?: string; dateFrom?: string; dateTo?: string; search?: string } = {}) =>
    http.get<T.Page<T.SessionListItem>>('/sessions', query),
  listAll: (query: { coachId?: string; categoryId?: string; dateFrom?: string; dateTo?: string; search?: string } = {}) =>
    fetchAllPages<T.SessionListItem>('/sessions', query),
  get: (id: string) => http.get<T.SessionDetail>(`/sessions/${id}`),
};

export const attendanceApi = {
  students: (query: Paging & AttendanceQuery & { status?: T.AttendanceStatus } = {}) =>
    http.get<T.Page<T.AttendanceStreamItem>>('/attendance/students', query),
  studentsAll: (query: AttendanceQuery & { status?: T.AttendanceStatus } = {}) =>
    fetchAllPages<T.AttendanceStreamItem>('/attendance/students', query),
  summary: (query: Paging & Omit<AttendanceQuery, 'date'> = {}) =>
    http.get<T.Page<T.AttendanceSummaryItem>>('/attendance/students/summary', query),
  summaryAll: (query: Omit<AttendanceQuery, 'date'> = {}) =>
    fetchAllPages<T.AttendanceSummaryItem>('/attendance/students/summary', query),
  coaches: (query: Paging & Omit<AttendanceQuery, 'categoryId'> = {}) =>
    http.get<T.Page<T.CoachAttendanceStreamItem>>('/attendance/coaches', query),
  coachesAll: (query: Omit<AttendanceQuery, 'categoryId'> = {}) =>
    fetchAllPages<T.CoachAttendanceStreamItem>('/attendance/coaches', query),
  exportStudents: (query: AttendanceQuery & { status?: T.AttendanceStatus } = {}) =>
    downloadFile('/attendance/students/export', query, 'student-attendance.csv'),
  exportCoaches: (query: Omit<AttendanceQuery, 'categoryId'> = {}) =>
    downloadFile('/attendance/coaches/export', query, 'coach-attendance.csv'),
};

export const performanceApi = {
  config: () => http.get<T.PerformanceConfig>('/performance-reports/config'),
  list: (query: Paging & { coachId?: string; studentId?: string; dateFrom?: string; dateTo?: string; search?: string } = {}) =>
    http.get<T.Page<T.PerformanceReportSummary>>('/performance-reports', query),
  listAll: (query: { coachId?: string; studentId?: string; dateFrom?: string; dateTo?: string; search?: string } = {}) =>
    fetchAllPages<T.PerformanceReportSummary>('/performance-reports', query),
  get: (id: string) => http.get<T.PerformanceReportDetail>(`/performance-reports/${id}`),
};

type LedgerQuery = { year: number; month?: number; categoryId?: string; status?: string; search?: string };

export const feesApi = {
  ledger: (query: Paging & LedgerQuery) => http.get<T.Page<T.LedgerRow>>('/fees/ledger', query),
  ledgerAll: (query: LedgerQuery) => fetchAllPages<T.LedgerRow>('/fees/ledger', query),
  summary: (query: LedgerQuery) => http.get<T.LedgerSummary>('/fees/summary', query),
  recordPayment: (body: T.PaymentIn) => http.post<T.PaymentOut>('/fees/payments', body),
  payments: (query: Paging & { studentId?: string; mode?: T.PaymentMode; dateFrom?: string; dateTo?: string; search?: string } = {}) =>
    http.get<T.Page<T.PaymentOut>>('/payments', query),
  paymentsAll: (query: { studentId?: string; mode?: T.PaymentMode; dateFrom?: string; dateTo?: string; search?: string } = {}) =>
    fetchAllPages<T.PaymentOut>('/payments', query),
  payment: (id: string) => http.get<T.PaymentOut>(`/payments/${id}`),
  voidPayment: (id: string, reason: string) => http.post<T.PaymentOut>(`/payments/${id}/void`, { reason }),
};

export const submissionsApi = {
  list: (query: Paging & { status?: T.SubmissionStatus | ''; search?: string } = {}) =>
    // status '' means all; the backend defaults to PENDING when the param is absent.
    http.get<T.Page<T.SubmissionOut>>('/payment-submissions', query),
  /** Every submission regardless of status (the backend defaults to PENDING, so ask per status). */
  listAll: async () => {
    const statuses: T.SubmissionStatus[] = ['PENDING', 'VERIFIED', 'REJECTED'];
    const lists = await Promise.all(statuses.map(status => fetchAllPages<T.SubmissionOut>('/payment-submissions', { status })));
    return lists.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  get: (id: string) => http.get<T.SubmissionOut>(`/payment-submissions/${id}`),
  update: (id: string, body: { studentName?: string; remarks?: string | null }) =>
    http.patch<T.SubmissionOut>(`/payment-submissions/${id}`, body),
  verify: (id: string, body: { studentId: string; allocations: T.Allocation[]; discount?: T.DiscountIn | null }) =>
    http.post<T.SubmissionOut>(`/payment-submissions/${id}/verify`, body),
  reject: (id: string, reason: string) => http.post<T.SubmissionOut>(`/payment-submissions/${id}/reject`, { reason }),
};

export const cmsApi = {
  programmes: (query: { status?: T.RecordStatus; search?: string } = {}) => http.get<T.ProgrammeOut[]>('/programmes', query),
  createProgramme: (body: T.ProgrammeIn) => http.post<T.ProgrammeOut>('/programmes', body),
  updateProgramme: (id: string, body: Partial<T.ProgrammeIn>) => http.patch<T.ProgrammeOut>(`/programmes/${id}`, body),
  deleteProgramme: (id: string) => http.delete(`/programmes/${id}`),
  orderProgrammes: (ids: string[]) => http.put<void>('/programmes/order', { ids }),

  team: (query: { status?: T.RecordStatus; search?: string } = {}) => http.get<T.TeamMemberOut[]>('/team-members', query),
  designations: () => http.get<string[]>('/team-members/designations'),
  createMember: (body: T.TeamMemberIn) => http.post<T.TeamMemberOut>('/team-members', body),
  updateMember: (id: string, body: Partial<T.TeamMemberIn>) => http.patch<T.TeamMemberOut>(`/team-members/${id}`, body),
  deleteMember: (id: string) => http.delete(`/team-members/${id}`),
  orderTeam: (ids: string[]) => http.put<void>('/team-members/order', { ids }),

  galleryAll: (query: { category?: string; status?: T.RecordStatus; search?: string } = {}) =>
    fetchAllPages<T.GalleryItemOut>('/gallery-items', query),
  galleryCategories: () => http.get<string[]>('/gallery-items/categories'),
  createGalleryItem: (data: { title: string; category: string; caption?: string; isWide?: boolean; image: File }) => {
    const form = new FormData();
    form.append('title', data.title);
    form.append('category', data.category);
    if (data.caption) form.append('caption', data.caption);
    form.append('isWide', String(Boolean(data.isWide)));
    form.append('image', data.image);
    return http.postForm<T.GalleryItemOut>('/gallery-items', form);
  },
  updateGalleryItem: (id: string, body: T.GalleryPatch) => http.patch<T.GalleryItemOut>(`/gallery-items/${id}`, body),
  replaceGalleryImage: (id: string, image: File) => {
    const form = new FormData();
    form.append('image', image);
    return http.patchForm<T.GalleryItemOut>(`/gallery-items/${id}/image`, form);
  },
  deleteGalleryItem: (id: string) => http.delete(`/gallery-items/${id}`),

  jobs: (query: { status?: T.JobStatus; search?: string } = {}) => http.get<T.JobOut[]>('/jobs', query),
  createJob: (body: T.JobIn) => http.post<T.JobOut>('/jobs', body),
  updateJob: (id: string, body: Partial<T.JobIn>) => http.patch<T.JobOut>(`/jobs/${id}`, body),
  deleteJob: (id: string) => http.delete(`/jobs/${id}`),

  applicationsAll: (query: { jobId?: string; status?: T.ApplicationStatus; search?: string } = {}) =>
    fetchAllPages<T.ApplicationOut>('/job-applications', query),
  application: (id: string) => http.get<T.ApplicationOut>(`/job-applications/${id}`),
  updateApplication: (id: string, body: { status?: T.ApplicationStatus; fullName?: string; email?: string; phone?: string }) =>
    http.patch<T.ApplicationOut>(`/job-applications/${id}`, body),
  deleteApplication: (id: string) => http.delete(`/job-applications/${id}`),

  enquiriesAll: (query: { status?: T.EnquiryStatus; programmeId?: string; search?: string } = {}) =>
    fetchAllPages<T.EnquiryOut>('/enquiries', query),
  updateEnquiry: (id: string, body: { status?: T.EnquiryStatus; parentName?: string; email?: string | null; phone?: string }) =>
    http.patch<T.EnquiryOut>(`/enquiries/${id}`, body),
  deleteEnquiry: (id: string) => http.delete(`/enquiries/${id}`),
};

export const dashboardApi = {
  summary: () => http.get<T.DashboardSummary>('/dashboard/summary'),
  search: (q: string) => http.get<T.SearchResults>('/search', { q }),
};

export const notificationsApi = {
  list: (query: Paging & { unreadOnly?: boolean } = {}) => http.get<T.Page<T.NotificationOut>>('/notifications', query),
  unreadCount: () => http.get<{ count: number }>('/notifications/unread-count'),
  markRead: (id: string) => http.post<void>(`/notifications/${id}/read`),
  markAllRead: () => http.post<void>('/notifications/read-all'),
};

export const coachPortalApi = {
  dashboard: () => http.get<T.CoachDashboard>('/coach/dashboard'),
  studentsAll: (query: { search?: string; categoryId?: string; status?: T.RecordStatus } = {}) =>
    fetchAllPages<T.CoachStudentItem>('/coach/students', query),
  student: (id: string) => http.get<T.CoachStudentDetail>(`/coach/students/${id}`),
  studentReports: (id: string) => http.get<T.PerformanceReportSummary[]>(`/coach/students/${id}/performance-reports`),
  roster: (categoryIds: string[]) => http.get<{ students: T.RosterStudent[] }>('/coach/session-roster', { categoryIds }),
  sessionsAll: (query: { search?: string; categoryId?: string; year?: number; month?: number; date?: string } = {}) =>
    fetchAllPages<T.SessionListItem>('/coach/sessions', query),
  session: (id: string) => http.get<T.SessionDetail>(`/coach/sessions/${id}`),
  createSession: (body: T.SessionIn) => http.post<T.SessionDetail>('/coach/sessions', body),
  updateSession: (id: string, body: T.SessionIn) => http.put<T.SessionDetail>(`/coach/sessions/${id}`, body),
  deleteSession: (id: string) => http.delete(`/coach/sessions/${id}`),
  reportsAll: (query: { search?: string; studentId?: string } = {}) =>
    fetchAllPages<T.PerformanceReportSummary>('/coach/performance-reports', query),
  report: (id: string) => http.get<T.PerformanceReportDetail>(`/coach/performance-reports/${id}`),
  createReport: (body: T.PerformanceReportIn) => http.post<T.PerformanceReportDetail>('/coach/performance-reports', body),
  updateReport: (id: string, body: T.PerformanceReportIn) =>
    http.put<T.PerformanceReportDetail>(`/coach/performance-reports/${id}`, body),
  deleteReport: (id: string) => http.delete(`/coach/performance-reports/${id}`),
  /** Reference lists any signed-in user may read. */
  categories: () => http.get<T.RefOut[]>('/categories', { status: 'ACTIVE' }),
};

/** For plain <a href> links to files the backend already signed (FileRef.url). */
export const isAuthenticated = () => Boolean(tokenStore.get());
export { buildUrl };

/**
 * Open a coach's contract (their latest CONTRACT document) in a new tab. The tab is opened
 * synchronously so popup blockers allow it, then pointed at the signed file URL.
 */
export async function openCoachContract(coachId: string): Promise<boolean> {
  const tab = window.open('', '_blank');
  try {
    const docs = await coachesApi.documents(coachId);
    const contract = docs.find(d => d.kind === 'CONTRACT');
    if (!contract) {
      tab?.close();
      return false;
    }
    if (tab) tab.location.href = contract.file.url;
    return true;
  } catch (error) {
    tab?.close();
    throw error;
  }
}
