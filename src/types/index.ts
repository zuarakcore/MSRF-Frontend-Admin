export type UserRole = 'SUPER_ADMIN' | 'COACH';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  createdAt: string;
  coachId?: string; // If role is COACH
}

export type SportsCourse = 
  | 'Swimming Academy' 
  | 'Football Excellence' 
  | 'Badminton Club' 
  | 'Tennis Training' 
  | 'Athletics & Track' 
  | 'Cricket Performance'
  | 'Basketball Squad'
  | 'Martial Arts & Karate';

export interface Student {
  id: string;
  studentId: string; // e.g. MSRF-2026-001
  fullName: string;
  photo: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address: string;
  
  // Admission Info
  admissionNumber: string;
  admissionDate: string;
  course: SportsCourse;
  batch: 'Morning (6:00 AM - 8:00 AM)' | 'Evening (4:00 PM - 6:00 PM)' | 'Weekend Special';
  coachId: string;
  coachName: string;
  status: 'Active' | 'Inactive';
  
  // Parent Details
  parentName: string;
  relationship: 'Father' | 'Mother' | 'Guardian';
  parentPhone: string;
  parentEmail: string;
  parentAddress: string;

  // Emergency Contact
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;

  // Metrics
  attendancePercentage: number;
  totalPresent: number;
  totalAbsent: number;
  feeStatus: 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';
  totalFee: number;
  paidAmount: number;
  pendingAmount: number;
  
  // Documents
  documents: StudentDocument[];
}

export interface StudentDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: 'PDF' | 'IMAGE' | 'DOC';
  fileSize: string;
  uploadedDate: string;
  url: string;
}

export interface Coach {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  photo: string;
  specialization: SportsCourse;
  experienceYears: number;
  assignedStudentsCount: number;
  capacity: number; // e.g. 25 max students
  joinedDate: string;
  status: 'Active' | 'Inactive';
  bio: string;
  monthlyRating: number; // e.g. 4.8 / 5
  attendanceAvg: number; // e.g. 96%
  username?: string;
  tempPassword?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  coachId: string;
  coachName: string;
  course: SportsCourse;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string;
  markedAt: string;
}

export interface FeeStructure {
  id: string;
  course: SportsCourse;
  totalFee: number;
  discountAllowed: number;
  netPayable: number;
  academicYear: string;
}

export interface Installment {
  id: string;
  installmentNo: number;
  title: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'Paid' | 'Pending' | 'Partially Paid' | 'Overdue';
  transactionId?: string;
}

export interface PaymentSubmission {
  id: string;
  submissionNo: string; // SUB-9081
  studentId: string;
  studentName: string;
  parentName: string;
  course: SportsCourse;
  amount: number;
  transactionId: string;
  paymentDate: string;
  submittedDate: string;
  screenshotUrl: string;
  status: 'Pending Verification' | 'Verified' | 'Rejected';
  rejectionReason?: string;
  remarks?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // MSRF-INV-2026-104
  studentId: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  course: SportsCourse;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discount: number;
  taxAmount: number; // GST 18% if applicable or 0
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue' | 'Partially Paid';
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  period: string;
  amount: number;
}

export type RatingStar = 1 | 2 | 3 | 4 | 5;

export interface PerformanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  coachId: string;
  coachName: string;
  monthYear: string; // e.g. "September 2026"
  rating: RatingStar;
  technicalSkills: number; // 1-100
  staminaDiscipline: number; // 1-100
  teamwork: number; // 1-100
  strengths: string;
  areasForImprovement: string;
  coachRemarks: string;
  recordedDate: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'PAYMENT' | 'ADMISSION' | 'ATTENDANCE' | 'FEE_DUE' | 'SYSTEM' | 'ENQUIRY' | 'APPLICATION';
  timestamp: string;
  read: boolean;
  relatedId?: string;
  link?: string;
}

export interface PermissionGroup {
  module: string;
  label: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

export interface RolePermissions {
  role: UserRole;
  roleName: string;
  description: string;
  groups: PermissionGroup[];
}

// CMS Models matching website (https://msrf-roan.vercel.app)
export interface HomeBannerCMS {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  status: 'Active' | 'Inactive';
}

export interface ProgrammeCMS {
  id: string;
  ageGroup: string; // e.g. "6 - 10 YEARS", "11 - 14 YEARS", "15 - 18 YEARS"
  title: string; // e.g. "Grassroots Kids Football"
  description: string;
  status: 'Active' | 'Inactive';
  enquiriesCount: number;
}

export interface TeamCMS {
  id: string;
  name: string; // e.g. "John Doe", "Michael Smith", "Robert Johnson"
  designation: string; // e.g. "CHAIRMAN", "DIRECTOR", "MANAGING DIRECTOR & CEO"
  initials?: string; // e.g. "J", "M", "R"
  photo?: string;
  biography: string; // e.g. "Former Chief Secretary to the Government of Goa"
  status: 'Active' | 'Inactive';
}

export interface PartnerCMS {
  id: string;
  partnerName: string;
  logo: string;
  website: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface TestimonialCMS {
  id: string;
  authorName: string;
  role: string;
  photo: string;
  quote: string;
  rating: number;
  status: 'Active' | 'Inactive';
}

export interface BlogCMS {
  id: string;
  title: string;
  description: string;
  featuredImage: string;
  publishDate: string;
  author: string;
  category: string;
  status: 'Published' | 'Draft';
}

export interface CareerCMS {
  id: string;
  position: string; // e.g. "Academy Head Coach", "Sports Physiotherapist", "Academy Manager", "Youth Scout"
  location: string; // e.g. "KOZHIKODE, KERALA"
  postedDate: string; // e.g. "OCT 1, 2023"
  jobDescription: string;
  experienceRequired: string;
  status: 'Open' | 'Closed';
  applicationsCount: number;
}

export interface CareerApplicationCMS {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  position: string;
  resumeUrl: string;
  appliedDate: string;
  status: 'Under Review' | 'Shortlisted' | 'Rejected';
}

export interface ContactEnquiryCMS {
  id: string;
  name: string;
  email: string;
  phone: string;
  programmeOrSubject: string;
  message: string;
  submittedDate: string;
  status: 'New' | 'Contacted' | 'Resolved';
}

export type GalleryCategory = 'All' | 'Training' | 'Matches' | 'Events' | 'Argentina' | 'Infrastructure';

export interface GalleryItemCMS {
  id: string;
  title: string;
  category: GalleryCategory;
  imageUrl: string;
  uploadedDate: string;
  caption: string;
  status: 'Active' | 'Inactive';
}
