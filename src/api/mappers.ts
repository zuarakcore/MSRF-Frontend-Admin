/** Convert backend shapes to the admin UI's existing types (src/types) and back. */
import { avatarFor } from './photos';
import type * as T from './types';
import type {
  CareerApplicationCMS,
  CareerCMS,
  CategoryCMS,
  Coach,
  CoachDocument,
  DailyTrainingSessionReport,
  ContactEnquiryCMS,
  GalleryCategory,
  GalleryItemCMS,
  Invoice,
  PerformanceRecord,
  RatingStar,
  PaymentSubmission,
  ProgrammeCMS,
  ProgramTypeCMS,
  Student,
  TeamCMS,
  TrainingCenterCMS,
} from '../types';

export type UiStatus = 'Active' | 'Inactive';

export const toUiStatus = (status: T.RecordStatus): UiStatus => (status === 'ACTIVE' ? 'Active' : 'Inactive');
export const toApiStatus = (status: string): T.RecordStatus => (status === 'Inactive' ? 'INACTIVE' : 'ACTIVE');
/** For list filters where the UI uses 'all' for no filter. */
export const statusQuery = (status: string): T.RecordStatus | undefined =>
  status === 'Active' ? 'ACTIVE' : status === 'Inactive' ? 'INACTIVE' : undefined;

export const dateOnly = (iso?: string | null) => (iso ? iso.slice(0, 10) : '');
export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const emptyToNull = (value?: string | null) => (value && value.trim() ? value.trim() : null);

export const fileType = (contentType: string): 'PDF' | 'IMAGE' | 'DOC' =>
  contentType.includes('pdf') ? 'PDF' : contentType.startsWith('image/') ? 'IMAGE' : 'DOC';
export const fileSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// --- reference data --------------------------------------------------------------------------

export const toCategory = (r: T.RefOut): CategoryCMS => ({
  id: r.id,
  title: r.name,
  description: r.description ?? '',
  status: toUiStatus(r.status),
  createdAt: dateOnly(r.createdAt),
});

export const toProgramType = (r: T.RefOut): ProgramTypeCMS => ({
  id: r.id,
  title: r.name,
  description: r.description ?? '',
  status: toUiStatus(r.status),
  createdAt: dateOnly(r.createdAt),
});

export const toTrainingCenter = (r: T.RefOut): TrainingCenterCMS => ({
  id: r.id,
  name: r.name,
  location: r.location ?? '',
  phone: r.phone ?? undefined,
  status: toUiStatus(r.status),
  createdAt: dateOnly(r.createdAt),
});

// --- website CMS -----------------------------------------------------------------------------

export const toProgramme = (p: T.ProgrammeOut): ProgrammeCMS => ({
  id: p.id,
  ageGroup: p.ageGroup,
  title: p.title,
  description: p.description,
  status: toUiStatus(p.status),
  enquiriesCount: p.enquiriesCount ?? 0,
});

export const toTeamMember = (m: T.TeamMemberOut): TeamCMS => ({
  id: m.id,
  name: m.name,
  designation: m.designation,
  initials: m.name.charAt(0).toUpperCase(),
  photo: m.photo?.url,
  biography: m.biography ?? '',
  status: toUiStatus(m.status),
});

export const toGalleryItem = (g: T.GalleryItemOut): GalleryItemCMS => ({
  id: g.id,
  title: g.title,
  // Categories are free text on the backend; the UI type lists the common ones.
  category: g.category as GalleryCategory,
  imageUrl: g.image.url,
  uploadedDate: dateOnly(g.createdAt),
  caption: g.caption ?? '',
  status: toUiStatus(g.status),
});

/** "2026-10-31" -> "OCT 31, 2026", the style the careers screens use. */
export const shortDateUpper = (iso?: string | null) =>
  iso
    ? new Date(`${iso.slice(0, 10)}T00:00:00`)
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        .toUpperCase()
    : '';

export const toCareer = (j: T.JobOut): CareerCMS => ({
  id: j.id,
  position: j.title,
  location: j.location,
  postedDate: shortDateUpper(j.postedOn),
  closingDate: j.closingDate ? shortDateUpper(j.closingDate) : undefined,
  jobDescription: j.description,
  experienceRequired: j.experienceRequired ?? '',
  status: j.status === 'OPEN' ? 'Open' : 'Closed',
  applicationsCount: j.applicationsCount ?? 0,
});

const APPLICATION_STATUS: Record<T.ApplicationStatus, CareerApplicationCMS['status']> = {
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  REJECTED: 'Rejected',
};
export const toApiApplicationStatus = (s: CareerApplicationCMS['status']): T.ApplicationStatus =>
  (Object.keys(APPLICATION_STATUS) as T.ApplicationStatus[]).find(k => APPLICATION_STATUS[k] === s) ?? 'UNDER_REVIEW';

export const toApplication = (a: T.ApplicationOut): CareerApplicationCMS => ({
  id: a.id,
  applicantName: a.fullName,
  email: a.email,
  phone: a.phone,
  position: a.position,
  resumeUrl: a.cv.url,
  resumeFileName: a.cv.fileName,
  resumeSize: fileSize(a.cv.sizeBytes),
  appliedDate: dateOnly(a.createdAt),
  status: APPLICATION_STATUS[a.status],
});

const ENQUIRY_STATUS: Record<T.EnquiryStatus, ContactEnquiryCMS['status']> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  RESOLVED: 'Resolved',
};
export const toApiEnquiryStatus = (s: ContactEnquiryCMS['status']): T.EnquiryStatus =>
  (Object.keys(ENQUIRY_STATUS) as T.EnquiryStatus[]).find(k => ENQUIRY_STATUS[k] === s) ?? 'NEW';

export const toEnquiry = (e: T.EnquiryOut): ContactEnquiryCMS => ({
  id: e.id,
  name: e.parentName,
  email: e.email ?? '',
  phone: e.phone,
  programmeOrSubject: e.subject ?? 'General Enquiry',
  // The UI has no player field, so lead the message with it.
  message: e.playerName ? `Player: ${e.playerName}\n${e.message}` : e.message,
  submittedDate: dateOnly(e.createdAt),
  status: ENQUIRY_STATUS[e.status],
});

// --- payment submissions ---------------------------------------------------------------------

const SUBMISSION_STATUS: Record<T.SubmissionStatus, PaymentSubmission['status']> = {
  PENDING: 'Pending Verification',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
};

export const toSubmission = (s: T.SubmissionOut): PaymentSubmission => ({
  id: s.id,
  submissionNo: s.submissionNumber,
  studentId: '',
  studentName: s.studentName,
  // The website form collects the parent's mobile, not their name.
  parentName: s.parentMobile,
  parentPhone: s.parentMobile,
  category: s.paymentMethod === 'UPI' ? 'UPI' : 'Cash',
  amount: s.amount,
  transactionId:
    s.transactionReference ?? (s.handedOverTo ? `Cash handed to ${s.handedOverTo}` : '—'),
  paymentDate: s.paymentDate,
  submittedDate: dateOnly(s.createdAt),
  screenshotUrl: s.screenshot?.url ?? '',
  status: SUBMISSION_STATUS[s.status],
  rejectionReason: s.rejectionReason ?? undefined,
  remarks: s.remarks ?? undefined,
  verifiedBy: s.reviewedBy ?? undefined,
  verifiedAt: s.reviewedAt ? dateOnly(s.reviewedAt) : undefined,
});

// --- people ----------------------------------------------------------------------------------

export const GENDER: Record<T.Gender, 'Male' | 'Female' | 'Other'> = { MALE: 'Male', FEMALE: 'Female', OTHER: 'Other' };
export const toApiGender = (g?: string): T.Gender => (g === 'Female' ? 'FEMALE' : g === 'Other' ? 'OTHER' : 'MALE');
const INVITE: Record<T.InviteStatus, NonNullable<Coach['inviteStatus']>> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  EXPIRED: 'Expired',
};

export const toCoach = (c: T.CoachListItem | T.CoachDetail): Coach => {
  const detail = 'bio' in c ? c : null;
  return {
    id: c.id,
    fullName: c.fullName,
    email: c.email,
    phone: c.phone,
    photo: c.photo?.url ?? avatarFor(c.fullName),
    bloodGroup: detail?.bloodGroup ?? undefined,
    specialization: c.categories.map(cat => cat.name).join(', '),
    experienceYears: c.experienceYears,
    assignedStudentsCount: c.studentCount,
    capacity: 25,
    joinedDate: c.joinedDate,
    status: toUiStatus(c.status),
    bio: detail?.bio ?? '',
    monthlyRating: 0,
    attendanceAvg: c.attendanceRate ?? 0,
    username: c.email,
    tempPassword: c.tempPassword ?? c.defaultPassword ?? c.temporaryPassword ?? undefined,
    gender: detail?.gender ? GENDER[detail.gender] : undefined,
    address: detail?.address ?? undefined,
    inviteStatus: INVITE[c.inviteStatus],
    lastLoginAt: detail?.lastLoginAt ?? undefined,
    categoryIds: c.categories.map(cat => cat.id),
    categoryNames: c.categories.map(cat => cat.name),
  };
};

export const toDocument = (d: T.DocumentOut): CoachDocument => ({
  id: d.id,
  title: d.title,
  fileName: d.file.fileName,
  fileType: fileType(d.file.contentType),
  fileSize: fileSize(d.file.sizeBytes),
  uploadedDate: dateOnly(d.uploadedAt),
  url: d.file.url,
});

// --- students --------------------------------------------------------------------------------

export const BATCH: Record<T.Batch, Student['batch']> = {
  MORNING: 'Morning (6:00 AM - 8:00 AM)',
  EVENING: 'Evening (4:00 PM - 6:00 PM)',
  WEEKEND: 'Weekend Special',
};
export const toApiBatch = (b: string): T.Batch =>
  b.startsWith('Evening') ? 'EVENING' : b.startsWith('Weekend') ? 'WEEKEND' : 'MORNING';

const RELATIONSHIP: Record<T.Relationship, Student['relationship']> = {
  FATHER: 'Father',
  MOTHER: 'Mother',
  GUARDIAN: 'Guardian',
  OTHER: 'Guardian',
};
export const toApiRelationship = (r: string): T.Relationship =>
  r === 'Mother' ? 'MOTHER' : r === 'Guardian' ? 'GUARDIAN' : r === 'Father' ? 'FATHER' : 'OTHER';

export const FEE_STATUS: Record<T.FeeStatus, Student['feeStatus']> = { PAID: 'Paid', PENDING: 'Pending', OVERDUE: 'Overdue' };
export const toApiFeeStatus = (s: string): T.FeeStatus | undefined =>
  s === 'Paid' ? 'PAID' : s === 'Pending' ? 'PENDING' : s === 'Overdue' ? 'OVERDUE' : undefined;

/** A student's photo, or the initials placeholder. */
export const studentPhoto = (s: { fullName: string; photo: T.FileRef | null }) => s.photo?.url ?? avatarFor(s.fullName);
export const isPlaceholderPhoto = (url?: string) => !url || url.startsWith('data:image/svg');

export const toStudent = (s: T.StudentListItem | T.StudentDetail): Student => {
  const d = 'admissionNumber' in s ? s : null;
  const due = d?.totals.feeDueToDate ?? s.feeDueToDate ?? 0;
  const paid = d?.totals.paidToDate ?? s.paidToDate ?? 0;
  const outstanding = d?.totals.outstanding ?? s.outstanding ?? 0;
  return {
    id: s.id,
    studentId: s.studentCode,
    fullName: s.fullName,
    photo: studentPhoto(s),
    dateOfBirth: s.dateOfBirth,
    gender: GENDER[s.gender],
    bloodGroup: d?.bloodGroup ?? undefined,
    phone: s.phone ?? '',
    email: d?.email ?? '',
    address: d?.address ?? '',
    admissionNumber: d?.admissionNumber ?? '',
    admissionDate: d?.admissionDate ?? '',
    category: s.category.name,
    programType: s.programType.name,
    trainingCenter: s.trainingCenter.name,
    batch: BATCH[s.batch],
    status: toUiStatus(s.status),
    remarks: d?.remarks ?? undefined,
    parentName: s.parentName,
    relationship: d ? RELATIONSHIP[d.parentRelationship] : 'Father',
    parentPhone: s.parentPhone,
    parentEmail: d?.parentEmail ?? '',
    parentAddress: d?.parentAddress ?? '',
    emergencyName: d?.emergencyName ?? '',
    emergencyRelationship: d?.emergencyRelationship ?? '',
    emergencyPhone: d?.emergencyPhone ?? '',
    attendancePercentage: s.attendancePercentage ?? 0,
    totalPresent: d?.totals.present ?? 0,
    totalAbsent: d?.totals.absent ?? 0,
    feeStatus: s.currentMonthFeeStatus ? FEE_STATUS[s.currentMonthFeeStatus as T.FeeStatus] ?? 'Pending' : 'Paid',
    monthlyFee: s.monthlyFee,
    totalFee: due,
    paidAmount: paid,
    discountAmount: d?.totals.discountToDate,
    pendingAmount: outstanding,
    documents: [],
  };
};

// --- fees & receipts -------------------------------------------------------------------------

export const PAYMENT_MODE: Record<T.PaymentMode, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  UPI: 'UPI',
  CHEQUE: 'Cheque',
};

/** A backend payment receipt in the shape of the UI's printable invoice. */
export const toReceiptInvoice = (p: T.PaymentOut, category?: string): Invoice => ({
  id: p.id,
  invoiceNumber: p.receiptNumber,
  studentId: p.student.id,
  studentName: p.student.fullName,
  parentName: p.student.parentName,
  parentPhone: p.student.parentPhone,
  category: category ?? p.student.category.name,
  issueDate: p.paidOn,
  dueDate: p.paidOn,
  subtotal: p.amount,
  discount: 0,
  taxAmount: 0,
  totalAmount: p.amount,
  paidAmount: p.status === 'VALID' ? p.amount : 0,
  balanceDue: 0,
  paymentStatus: 'Paid',
  items: p.allocations.map(a => ({
    id: `${p.id}-${a.year}-${a.month}`,
    description: `Monthly Fee — ${PAYMENT_MODE[p.mode]}${p.reference ? ` (Ref ${p.reference})` : ''}`,
    period: a.label,
    amount: a.amount,
  })),
});

// --- performance reports ---------------------------------------------------------------------

const FOOT: Record<T.StrongFoot, 'Right' | 'Left' | 'Both'> = { RIGHT: 'Right', LEFT: 'Left', BOTH: 'Both' };
export const toApiFoot = (f?: string): T.StrongFoot => (f === 'Left' ? 'LEFT' : f === 'Both' ? 'BOTH' : 'RIGHT');
const stars = (n: number) => Math.min(5, Math.max(1, Math.round(n))) as RatingStar;

/** List rows carry only the summary; open a report to load `toPerformanceRecord(detail)`. */
export const toPerformanceSummary = (r: T.PerformanceReportSummary): PerformanceRecord => ({
  id: r.id,
  studentId: r.student.id,
  studentName: r.student.name,
  coachId: r.coach.id,
  coachName: r.coach.name,
  monthYear: r.reportPeriod,
  reportPeriod: r.reportPeriod,
  recordedDate: r.recordedDate,
  position: r.position ?? undefined,
  strengths: '',
  areasForImprovement: '',
  coachRemarks: '',
  overallRating: stars(r.overallRating),
  canEdit: r.canEdit,
});

export const toPerformanceRecord = (r: T.PerformanceReportDetail): PerformanceRecord => ({
  id: r.id,
  studentId: r.student.id,
  studentName: r.student.fullName,
  coachId: r.coach.id,
  coachName: r.coach.name,
  monthYear: r.reportPeriod,
  reportPeriod: r.reportPeriod,
  recordedDate: r.recordedDate,
  position: r.position ?? undefined,
  dob: r.student.dateOfBirth,
  age: String(r.student.age),
  strongFoot: FOOT[r.strongFoot],
  skillAssessments: r.skills.map(s => ({ category: s.label, rating: s.rating, comments: s.comment ?? undefined })),
  strengths: r.strengths,
  areasForImprovement: r.areasForImprovement,
  developmentGoals: r.developmentGoals,
  customGoal: r.customGoal ?? undefined,
  coachRemarks: r.coachRemarks,
  overallRating: stars(r.overallRating),
  canEdit: r.canEdit,
});

// --- training sessions -----------------------------------------------------------------------

export const ATTENDANCE_LABEL: Record<T.AttendanceStatus, 'Present' | 'Absent' | 'Informed'> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  INFORMED: 'Informed',
};
export const toApiAttendance = (s: string): T.AttendanceStatus =>
  s === 'Absent' ? 'ABSENT' : s === 'Informed' ? 'INFORMED' : 'PRESENT';

const hhmm = (t: string | null) => (t ? t.slice(0, 5) : '');

/** A session list item or full detail in the UI's daily-report shape. */
export const toSessionReport = (s: T.SessionListItem | T.SessionDetail): DailyTrainingSessionReport => {
  const d = 'attendance' in s ? s : null;
  const lead = s.coaches.find(c => c.role === 'CREATOR')?.coach ?? s.createdBy;
  const coCoaches = s.coaches.filter(c => c.role !== 'CREATOR').map(c => c.coach);
  const statusOf = (status: T.AttendanceStatus, remarks: string | null) => ({
    status: ATTENDANCE_LABEL[status],
    remarks: remarks ?? undefined,
  });
  return {
    id: s.id,
    date: s.sessionDate,
    categories: s.categories.map(c => c.name),
    loggedByCoachName: lead.name,
    assignedCoaches: coCoaches.map(c => c.name),
    attendanceCount: s.counts.total ?? 0,
    venue: s.venue,
    time: s.startTime ? `${hhmm(s.startTime)}${s.endTime ? ` - ${hhmm(s.endTime)}` : ''}` : '',
    weeklyTopic: d?.weeklyTopic ?? '',
    dailyTopic: s.dailyTopic,
    explanation: d?.explanation ?? '',
    splits: (d?.splits ?? []).map(sp => ({
      id: `${s.id}-${sp.position}`,
      heading: sp.heading,
      timeDoneMins: String(sp.durationMinutes),
      explanation: sp.explanation ?? '',
    })),
    fullSessionOverview: d?.overview ?? '',
    studentAttendance: Object.fromEntries((d?.attendance ?? []).map(a => [a.student.id, statusOf(a.status, a.remarks)])),
    coachAttendance: Object.fromEntries(s.coaches.map(c => [c.coach.id, statusOf(c.status, null)])),
    createdAt: d?.createdAt ?? '',
    attendanceRows: d?.attendance.map(a => ({
      studentId: a.student.id,
      studentCode: a.student.studentCode,
      studentName: a.student.fullName,
      ...statusOf(a.status, a.remarks),
    })),
    coachRefs: [{ id: lead.id, name: lead.name, isLead: true }, ...coCoaches.map(c => ({ id: c.id, name: c.name, isLead: false }))],
    canEdit: s.canEdit,
  };
};

/** A student as seen by a coach (no fee or contact details beyond the parent). */
export const toCoachStudent = (s: T.CoachStudentItem | T.CoachStudentDetail): Student => {
  const d = 'parentName' in s ? s : null;
  return {
    ...toStudent({
      ...s,
      phone: null,
      programType: { id: '', name: '' },
      trainingCenter: { id: '', name: '' },
      parentName: d?.parentName ?? '',
      parentPhone: d?.parentPhone ?? '',
      monthlyFee: 0,
    }),
    course: s.category.name,
    bloodGroup: d?.bloodGroup ?? undefined,
    emergencyName: d?.emergencyName ?? '',
    emergencyPhone: d?.emergencyPhone ?? '',
  };
};
