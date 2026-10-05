/**
 * Backend (FastAPI) request/response shapes, camelCase as sent over the wire.
 * Mirrors the backend's Pydantic schemas; see /api/docs on the running backend.
 */

export type UUID = string;
export type ISODate = string; // YYYY-MM-DD
export type ISODateTime = string;

export type RecordStatus = 'ACTIVE' | 'INACTIVE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Batch = 'MORNING' | 'EVENING' | 'WEEKEND';
export type Relationship = 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'OTHER';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'INFORMED';
export type FeeStatus = 'PAID' | 'PENDING' | 'OVERDUE';
export type PaymentMode = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE';
export type SubmissionStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED';
export type StrongFoot = 'RIGHT' | 'LEFT' | 'BOTH';
export type JobStatus = 'OPEN' | 'CLOSED';
export type ApplicationStatus = 'UNDER_REVIEW' | 'SHORTLISTED' | 'REJECTED';
export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'RESOLVED';
export type NotificationType = 'PAYMENT' | 'ADMISSION' | 'FEE_DUE' | 'ENQUIRY' | 'APPLICATION' | 'SYSTEM';
export type FilePurpose =
  | 'STUDENT_PHOTO'
  | 'STUDENT_DOCUMENT'
  | 'COACH_PHOTO'
  | 'COACH_DOCUMENT'
  | 'TEAM_PHOTO'
  | 'GALLERY_IMAGE'
  | 'GALLERY_THUMBNAIL'
  | 'PAYMENT_SCREENSHOT'
  | 'RESUME';

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface RefItem {
  id: UUID;
  name: string;
}

export interface FileRef {
  id: UUID;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  url: string;
}

// --- auth ------------------------------------------------------------------------------------

export interface ApiUser {
  id: UUID;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'COACH';
  isActive: boolean;
  coachId?: UUID | null;
  lastLoginAt: ISODateTime | null;
}

export interface TokenOut {
  accessToken: string;
  tokenType?: string;
  expiresIn: number;
  user: ApiUser;
}

// --- reference data --------------------------------------------------------------------------

export interface RefOut {
  id: UUID;
  name: string;
  description?: string | null;
  location?: string | null;
  phone?: string | null;
  status: RecordStatus;
  sortOrder: number;
  studentCount?: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface RefIn {
  name?: string;
  description?: string | null;
  location?: string;
  phone?: string | null;
  status?: RecordStatus;
  sortOrder?: number;
}

// --- students --------------------------------------------------------------------------------

export interface StudentListItem {
  id: UUID;
  studentCode: string;
  fullName: string;
  photo: FileRef | null;
  dateOfBirth: ISODate;
  gender: Gender;
  phone: string | null;
  category: RefItem;
  programType: RefItem;
  trainingCenter: RefItem;
  batch: Batch;
  parentName: string;
  parentPhone: string;
  status: RecordStatus;
  monthlyFee: number;
  attendancePercentage?: number | null;
  currentMonthFeeStatus?: string | null;
  feeDueToDate?: number;
  paidToDate?: number;
  outstanding?: number;
}

export interface StudentTotals {
  present: number;
  absent: number;
  informed: number;
  feeDueToDate: number;
  paidToDate: number;
  discountToDate: number;
  outstanding: number;
}

export interface StudentDetail extends StudentListItem {
  bloodGroup: BloodGroup | null;
  email: string | null;
  address: string | null;
  admissionNumber: string;
  admissionDate: ISODate;
  remarks: string | null;
  parentRelationship: Relationship;
  parentEmail: string | null;
  parentAddress: string | null;
  emergencyName: string | null;
  emergencyRelationship: string | null;
  emergencyPhone: string | null;
  totals: StudentTotals;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface StudentIn {
  fullName: string;
  gender: Gender;
  bloodGroup?: BloodGroup | null;
  dateOfBirth: ISODate;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  photoFileId?: UUID | null;
  admissionNumber?: string | null;
  admissionDate: ISODate;
  categoryId: UUID;
  programTypeId: UUID;
  trainingCenterId: UUID;
  batch: Batch;
  monthlyFee: number;
  remarks?: string | null;
  parentName: string;
  parentRelationship: Relationship;
  parentPhone: string;
  parentEmail?: string | null;
  parentAddress?: string | null;
  emergencyName?: string | null;
  emergencyRelationship?: string | null;
  emergencyPhone?: string | null;
}

export type StudentPatch = Partial<StudentIn> & { status?: RecordStatus };

export interface FilterOptions {
  birthYears: number[];
  categories: RefItem[];
  programTypes: RefItem[];
  trainingCenters: RefItem[];
}

export interface DocumentOut {
  id: UUID;
  title: string;
  kind?: 'CONTRACT' | 'GENERAL';
  file: FileRef;
  uploadedAt: ISODateTime;
  uploadedBy: string | null;
}

// --- coaches ---------------------------------------------------------------------------------

export interface CoachListItem {
  id: UUID;
  userId: UUID;
  fullName: string;
  email: string;
  phone: string;
  photo: FileRef | null;
  experienceYears: number;
  joinedDate: ISODate;
  status: RecordStatus;
  inviteStatus: InviteStatus;
  categories: RefItem[];
  studentCount: number;
  attendanceRate: number | null;
  /**
   * The auto-generated login password the admin shares with the coach.
   * Requires the backend change in docs/COACH_CREDENTIALS.md.
   */
  temporaryPassword?: string | null;
  /** Names the backend actually sends (same value). */
  tempPassword?: string | null;
  defaultPassword?: string | null;
}

export interface CoachDetail extends CoachListItem {
  gender: Gender | null;
  bloodGroup: BloodGroup | null;
  address: string | null;
  bio: string | null;
  lastLoginAt: ISODateTime | null;
  createdAt: ISODateTime;
}

export interface CoachIn {
  fullName: string;
  email: string;
  phone: string;
  gender?: Gender | null;
  bloodGroup?: BloodGroup | null;
  experienceYears?: number;
  joinedDate: ISODate;
  address?: string | null;
  bio?: string | null;
  photoFileId?: UUID | null;
  categoryIds?: UUID[];
}

export type CoachPatch = Partial<CoachIn> & { status?: RecordStatus };

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  informed: number;
  rate: number | null;
}

export interface CoachAttendanceOut {
  items: {
    sessionId: UUID;
    date: ISODate;
    venue: string;
    dailyTopic: string;
    role: string;
    status: AttendanceStatus;
    remarks: string | null;
  }[];
  summary: AttendanceSummary;
}

// --- sessions & attendance -------------------------------------------------------------------

export interface AttendanceCounts {
  present?: number;
  absent?: number;
  informed?: number;
  total?: number;
}

export interface SessionCoachOut {
  coach: RefItem;
  role: string;
  status: AttendanceStatus;
}

export interface SessionListItem {
  id: UUID;
  sessionDate: ISODate;
  venue: string;
  startTime: string | null;
  endTime: string | null;
  dailyTopic: string;
  categories: RefItem[];
  createdBy: RefItem;
  coaches: SessionCoachOut[];
  counts: AttendanceCounts;
  canEdit?: boolean;
}

export interface AttendanceStudent {
  id: UUID;
  studentCode: string;
  fullName: string;
  photo: FileRef | null;
}

export interface SessionDetail extends SessionListItem {
  weeklyTopic: string | null;
  explanation: string;
  overview: string | null;
  splits: { position: number; heading: string; durationMinutes: number; explanation: string | null }[];
  attendance: { student: AttendanceStudent; status: AttendanceStatus; remarks: string | null }[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface SessionIn {
  sessionDate: ISODate;
  categoryIds: UUID[];
  coCoachIds?: UUID[];
  venue: string;
  startTime?: string | null;
  endTime?: string | null;
  weeklyTopic?: string | null;
  dailyTopic: string;
  explanation: string;
  overview?: string | null;
  splits: { heading: string; durationMinutes: number; explanation?: string | null }[];
  attendance?: { studentId: UUID; status: AttendanceStatus; remarks?: string | null }[];
}

export interface AttendanceStreamItem {
  id: UUID;
  date: ISODate;
  sessionId: UUID;
  student: AttendanceStudent;
  category: RefItem;
  status: AttendanceStatus;
  remarks: string | null;
  markedBy: RefItem;
}

export interface AttendanceSummaryItem {
  student: AttendanceStudent;
  category: RefItem;
  totalSessions: number;
  present: number;
  absent: number;
  informed: number;
  rate: number | null;
  band: string;
}

export interface CoachAttendanceStreamItem {
  date: ISODate;
  sessionId: UUID;
  coach: RefItem;
  phone: string;
  venue: string;
  categories: string[];
  role: string;
  status: AttendanceStatus;
  remarks: string | null;
}

export interface StudentAttendanceOut {
  items: {
    sessionId: UUID;
    date: ISODate;
    status: AttendanceStatus;
    remarks: string | null;
    categories: string[];
    coachName: string;
  }[];
  summary: AttendanceSummary;
}

export interface RosterStudent {
  id: UUID;
  studentCode: string;
  fullName: string;
  photo: FileRef | null;
  category: RefItem;
  batch: string;
}

// --- performance -----------------------------------------------------------------------------

export type Skill =
  | 'TECHNICAL_ABILITY'
  | 'TACTICAL_UNDERSTANDING'
  | 'BALL_CONTROL_FIRST_TOUCH'
  | 'PASSING'
  | 'DRIBBLING'
  | 'SHOOTING_FINISHING'
  | 'DEFENDING'
  | 'DECISION_MAKING'
  | 'INDIVIDUAL_SKILLS'
  | 'TEAMWORK'
  | 'COMMUNICATION'
  | 'HARD_WORK'
  | 'DISCIPLINE'
  | 'CHARACTER_ATTITUDE'
  | 'FITNESS';

export interface PerformanceConfig {
  skills: { key: Skill; label: string }[];
  standardGoals: string[];
  positions: string[];
}

export interface PerformanceReportSummary {
  id: UUID;
  student: RefItem;
  coach: RefItem;
  reportPeriod: string;
  recordedDate: ISODate;
  position: string | null;
  overallRating: number;
  canEdit?: boolean;
}

export interface PerformanceReportDetail {
  id: UUID;
  student: { id: UUID; studentCode: string; fullName: string; dateOfBirth: ISODate; age: number };
  coach: RefItem;
  reportPeriod: string;
  recordedDate: ISODate;
  position: string | null;
  strongFoot: StrongFoot;
  skills: { skill: Skill; label: string; rating: number; comment: string | null }[];
  strengths: string;
  areasForImprovement: string;
  developmentGoals: string[];
  customGoal: string | null;
  coachRemarks: string;
  overallRating: number;
  canEdit: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface PerformanceReportIn {
  studentId: UUID;
  reportPeriod: string;
  recordedDate: ISODate;
  position?: string | null;
  strongFoot: StrongFoot;
  skills: { skill: Skill; rating: number; comment?: string | null }[];
  strengths: string;
  areasForImprovement: string;
  developmentGoals?: string[];
  customGoal?: string | null;
  coachRemarks: string;
  overallRating: number;
}

// --- fees ------------------------------------------------------------------------------------

export interface LedgerStudent {
  id: UUID;
  studentCode: string;
  fullName: string;
  parentName: string;
  parentPhone: string;
  category: RefItem;
}

export interface LedgerRow {
  student: LedgerStudent;
  amountDue: number;
  discount: number;
  amountPaid: number;
  outstanding: number;
  status: FeeStatus;
  months: number;
  lastPaymentOn: ISODate | null;
}

export interface LedgerSummary {
  expected: number;
  collected: number;
  discount: number;
  outstanding: number;
  studentCount: number;
  pendingCount: number;
  overdueCount: number;
}

export interface LedgerMonth {
  ledgerEntryId: UUID;
  year: number;
  month: number;
  label: string;
  amountDue: number;
  discount: number;
  discountReason: string | null;
  amountPaid: number;
  outstanding: number;
  dueDate: ISODate;
  status: FeeStatus;
  payments: { paymentId: UUID; receiptNumber: string; amount: number; paidOn: ISODate }[];
}

export interface StudentFees {
  year: number;
  monthlyFee: number;
  months: LedgerMonth[];
}

export interface Allocation {
  year: number;
  month: number;
  amount: number;
}

export interface DiscountIn extends Allocation {
  reason: string;
}

export interface PaymentIn {
  studentId: UUID;
  paidOn: ISODate;
  mode: PaymentMode;
  reference?: string | null;
  remarks?: string | null;
  allocations: Allocation[];
  discount?: DiscountIn | null;
}

export interface PaymentOut {
  id: UUID;
  receiptNumber: string;
  student: LedgerStudent;
  amount: number;
  mode: PaymentMode;
  paidOn: ISODate;
  reference: string | null;
  remarks: string | null;
  source: 'MANUAL' | 'SUBMISSION';
  submissionId: UUID | null;
  allocations: (Allocation & { label: string })[];
  status: 'VALID' | 'VOIDED';
  voidReason: string | null;
  voidedAt: ISODateTime | null;
  recordedBy: string | null;
  createdAt: ISODateTime;
}

// --- payment submissions ---------------------------------------------------------------------

export interface CandidateStudent {
  id: UUID;
  studentCode: string;
  fullName: string;
  parentName: string;
  parentPhone: string;
  category: RefItem;
}

export interface SubmissionOut {
  id: UUID;
  submissionNumber: string;
  studentName: string;
  parentMobile: string;
  amount: number;
  paymentDate: ISODate;
  paymentMethod: 'UPI' | 'CASH';
  transactionReference: string | null;
  handedOverTo: string | null;
  screenshot: FileRef | null;
  status: SubmissionStatus;
  rejectionReason: string | null;
  remarks: string | null;
  reviewedBy: string | null;
  reviewedAt: ISODateTime | null;
  paymentId: UUID | null;
  createdAt: ISODateTime;
  candidateStudents?: CandidateStudent[] | null;
}

// --- website CMS -----------------------------------------------------------------------------

export interface ProgrammeOut {
  id: UUID;
  slug: string;
  title: string;
  ageGroup: string;
  description: string;
  duration: string | null;
  trainingDays: string | null;
  coachLabel: string | null;
  benefits: string[];
  status: RecordStatus;
  sortOrder: number;
  enquiriesCount?: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface ProgrammeIn {
  title: string;
  ageGroup: string;
  description: string;
  duration?: string | null;
  trainingDays?: string | null;
  coachLabel?: string | null;
  benefits?: string[];
  status?: RecordStatus;
  sortOrder?: number;
}

export interface TeamMemberOut {
  id: UUID;
  name: string;
  designation: string;
  biography: string | null;
  photo: FileRef | null;
  status: RecordStatus;
  sortOrder: number;
  createdAt: ISODateTime;
}

export interface TeamMemberIn {
  name: string;
  designation: string;
  biography?: string | null;
  photoFileId?: UUID | null;
  status?: RecordStatus;
  sortOrder?: number;
}

export interface GalleryItemOut {
  id: UUID;
  title: string;
  caption: string | null;
  category: string;
  isWide: boolean;
  image: FileRef;
  thumbnail: FileRef | null;
  status: RecordStatus;
  sortOrder: number;
  createdAt: ISODateTime;
}

export interface GalleryPatch {
  title?: string;
  caption?: string | null;
  category?: string;
  isWide?: boolean;
  status?: RecordStatus;
  sortOrder?: number;
}

export interface JobOut {
  id: UUID;
  title: string;
  location: string;
  description: string;
  experienceRequired: string | null;
  postedOn: ISODate;
  closingDate: ISODate | null;
  status: JobStatus;
  applicationsCount?: number;
  createdAt: ISODateTime;
}

export interface JobIn {
  title: string;
  location: string;
  description: string;
  experienceRequired?: string | null;
  postedOn: ISODate;
  closingDate?: ISODate | null;
  status?: JobStatus;
}

export interface ApplicationOut {
  id: UUID;
  jobId: UUID;
  position: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  cv: FileRef;
  status: ApplicationStatus;
  createdAt: ISODateTime;
}

export interface EnquiryOut {
  id: UUID;
  parentName: string;
  playerName: string | null;
  phone: string;
  email: string | null;
  programmeId: UUID | null;
  subject: string | null;
  message: string;
  status: EnquiryStatus;
  createdAt: ISODateTime;
}

// --- dashboard, notifications, search -------------------------------------------------------

export interface DashboardSummary {
  students: { total: number; active: number };
  activeCoaches: number;
  fees: { outstanding: number; collectedThisMonth: number; collectedThisYear: number; overdueStudents: number };
  pendingVerifications: number;
  cms: {
    categories: number;
    programmes: number;
    team: number;
    gallery: number;
    openJobs: number;
    applicationsUnderReview: number;
    newEnquiries: number;
  };
  recentAdmissions: StudentListItem[];
  recentSubmissions: SubmissionOut[];
  topOverdue: LedgerRow[];
}

export interface NotificationOut {
  id: UUID;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  readAt: ISODateTime | null;
  createdAt: ISODateTime;
}

export interface SearchHit {
  id: UUID;
  title: string;
  subtitle: string;
  link: string;
}

export interface SearchResults {
  students: SearchHit[];
  coaches: SearchHit[];
  paymentSubmissions: SearchHit[];
  payments: SearchHit[];
}

// --- coach portal ----------------------------------------------------------------------------

export interface CoachDashboard {
  fullName: string;
  categories: RefItem[];
  studentCount: number;
  attendanceRateThisMonth: number | null;
  reportsCount: number;
  today: { hasSession: boolean; sessionId: UUID | null };
  recentSessions: SessionListItem[];
}

export interface CoachStudentItem {
  id: UUID;
  studentCode: string;
  fullName: string;
  photo: FileRef | null;
  dateOfBirth: ISODate;
  gender: Gender;
  category: RefItem;
  batch: Batch;
  status: RecordStatus;
  attendancePercentage?: number | null;
}

export interface CoachStudentDetail extends CoachStudentItem {
  bloodGroup: BloodGroup | null;
  parentName: string;
  parentPhone: string;
  emergencyName: string | null;
  emergencyPhone: string | null;
}
