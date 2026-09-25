import { 
  Student, 
  Coach, 
  AttendanceRecord, 
  PaymentSubmission, 
  Invoice, 
  PerformanceRecord, 
  SystemNotification, 
  UserProfile, 
  RolePermissions,
  HomeBannerCMS,
  ProgrammeCMS,
  TeamCMS,
  PartnerCMS,
  TestimonialCMS,
  BlogCMS,
  CareerCMS,
  CareerApplicationCMS,
  ContactEnquiryCMS,
  GalleryItemCMS,
  CategoryCMS,
  ProgramTypeCMS,
  TrainingCenterCMS,
  DailyTrainingSessionReport,
  PlayerDevelopmentReport
} from '../types';

export const INITIAL_COACHES: Coach[] = [
  {
    id: 'coach-1',
    fullName: 'Rajesh Varma',
    email: 'rajesh.varma@msrf.org',
    phone: '+91 98470 12345',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    bloodGroup: 'O+',
    specialization: 'Head Football Coach (Tactics & Strategy)',
    experienceYears: 12,
    assignedStudentsCount: 14,
    capacity: 20,
    joinedDate: '2021-03-15',
    status: 'Active',
    bio: 'AFC Pro License Holder. Former National Team Player & Senior Football Coach with 12+ years of professional football coaching experience.',
    monthlyRating: 4.9,
    attendanceAvg: 97,
    contractUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    documents: [
      {
        id: 'cdoc-1',
        title: 'Employment Agreement 2026',
        fileName: 'rajesh_varma_contract_2026.pdf',
        fileType: 'PDF',
        fileSize: '1.8 MB',
        uploadedDate: '2026-01-10',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      },
      {
        id: 'cdoc-2',
        title: 'AFC Pro License Certification',
        fileName: 'afc_pro_coaching_license.pdf',
        fileType: 'PDF',
        fileSize: '2.4 MB',
        uploadedDate: '2026-02-15',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      }
    ]
  },
  {
    id: 'coach-2',
    fullName: 'Priya Nambiar',
    email: 'priya.nambiar@msrf.org',
    phone: '+91 94471 23456',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    bloodGroup: 'A+',
    specialization: 'Youth Football & Physical Conditioning',
    experienceYears: 8,
    assignedStudentsCount: 12,
    capacity: 18,
    joinedDate: '2022-01-10',
    status: 'Active',
    bio: 'AFC Level 2 Accredited Football Coach. Specialized in youth tactical movement, pressing, and speed agility conditioning.',
    monthlyRating: 4.8,
    attendanceAvg: 95,
    contractUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    documents: [
      {
        id: 'cdoc-3',
        title: 'AFC Level 2 License',
        fileName: 'priya_afc_license.pdf',
        fileType: 'PDF',
        fileSize: '1.2 MB',
        uploadedDate: '2026-01-15',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      }
    ]
  },
  {
    id: 'coach-3',
    fullName: 'Alex D\'Souza',
    email: 'alex.dsouza@msrf.org',
    phone: '+91 98952 34567',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    bloodGroup: 'B+',
    specialization: 'Attacking & Finishing Specialist',
    experienceYears: 10,
    assignedStudentsCount: 16,
    capacity: 25,
    joinedDate: '2020-08-01',
    status: 'Active',
    bio: 'AFC \'A\' License Holder. Former I-League Striker focused on attacking transitions, 1v1 finishing, and wing overloads.',
    monthlyRating: 4.7,
    attendanceAvg: 94,
    contractUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    documents: [
      {
        id: 'cdoc-4',
        title: 'AFC A License Certificate',
        fileName: 'alex_dsouza_afc_license.pdf',
        fileType: 'PDF',
        fileSize: '3.1 MB',
        uploadedDate: '2026-02-01',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      }
    ]
  },
  {
    id: 'coach-4',
    fullName: 'Sunil Chacko',
    email: 'sunil.chacko@msrf.org',
    phone: '+91 97453 45678',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    bloodGroup: 'AB+',
    specialization: 'Goalkeeping & Reflex Specialist',
    experienceYears: 15,
    assignedStudentsCount: 10,
    capacity: 20,
    joinedDate: '2019-11-20',
    status: 'Active',
    bio: 'AIFF Certified Goalkeeping Coach. Specialized in shot stopping, high cross interception, and distribution skills.',
    monthlyRating: 4.9,
    attendanceAvg: 98,
    contractUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    documents: []
  },
  {
    id: 'coach-5',
    fullName: 'Sandeep Kumar',
    email: 'sandeep.kumar@msrf.org',
    phone: '+91 98464 56789',
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=300',
    bloodGroup: 'O-',
    specialization: 'Grassroots Football Coach (U-10)',
    experienceYears: 9,
    assignedStudentsCount: 15,
    capacity: 22,
    joinedDate: '2022-06-15',
    status: 'Active',
    bio: 'AIFF Level 2 Youth Coach. Focus on fundamental ball control, passing accuracy, and junior player enjoyment.',
    monthlyRating: 4.6,
    attendanceAvg: 93,
    contractUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    documents: []
  },
  {
    id: 'coach-6',
    fullName: 'Anitha Raj',
    email: 'anitha.raj@msrf.org',
    phone: '+91 94465 67890',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    bloodGroup: 'A-',
    specialization: 'Tactical Analysis & Set Piece Specialist',
    experienceYears: 7,
    assignedStudentsCount: 8,
    capacity: 15,
    joinedDate: '2023-02-01',
    status: 'Active',
    bio: 'UEFA \'B\' License Certified. Video match analyst and set-piece strategy specialist.',
    monthlyRating: 4.8,
    attendanceAvg: 96,
    contractUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    documents: []
  }
];

const COURSES: string[] = [
  'Football Excellence U-13',
  'Grassroots Football U-10',
  'Elite Football Squad U-15',
  'Pro Football Division U-18',
  'Goalkeeping Academy',
  'Tactical & Fitness Conditioning'
];

const NAMES = [
  { name: 'Adarsh Nair', gender: 'Male', parent: 'Ramesh Nair' },
  { name: 'Ananya Ramesh', gender: 'Female', parent: 'K. Ramesh' },
  { name: 'Rohan Kulkarni', gender: 'Male', parent: 'Sanjay Kulkarni' },
  { name: 'Devika Menon', gender: 'Female', parent: 'Vijay Menon' },
  { name: 'Mohammed Shahid', gender: 'Male', parent: 'Abdul Shahid' },
  { name: 'Sania Kurien', gender: 'Female', parent: 'Mathew Kurien' },
  { name: 'Siddharth Varma', gender: 'Male', parent: 'Gopalan Varma' },
  { name: 'Kavya Pillai', gender: 'Female', parent: 'Sudhakaran Pillai' },
  { name: 'Aarav Sharma', gender: 'Male', parent: 'Rajeev Sharma' },
  { name: 'Diya Krishnan', gender: 'Female', parent: 'Unnikrishnan' },
  { name: 'Gautam Nambiar', gender: 'Male', parent: 'Vinod Nambiar' },
  { name: 'Isha Patel', gender: 'Female', parent: 'Manish Patel' },
  { name: 'Karthik Raja', gender: 'Male', parent: 'Shanmuga Raja' },
  { name: 'Meera Thomas', gender: 'Female', parent: 'Thomas Kurian' },
  { name: 'Nikhil Prabhu', gender: 'Male', parent: 'Ganesh Prabhu' },
  { name: 'Pooja Hegde', gender: 'Female', parent: 'Subhash Hegde' },
  { name: 'Rahul V. S.', gender: 'Male', parent: 'Sivadasan V.' },
  { name: 'Ritu Sen', gender: 'Female', parent: 'Amit Sen' },
  { name: 'Sneha Chacko', gender: 'Female', parent: 'Chacko Joseph' },
  { name: 'Tarun Reddy', gender: 'Male', parent: 'Pratap Reddy' },
  { name: 'Varun Nair', gender: 'Male', parent: 'Biju Nair' },
  { name: 'Arya S. Kumar', gender: 'Female', parent: 'Suresh Kumar' },
  { name: 'Faizal Khan', gender: 'Male', parent: 'Imtiaz Khan' },
  { name: 'Gauri Shankar', gender: 'Female', parent: 'Shankar Iyer' },
  { name: 'Harish R.', gender: 'Male', parent: 'Ramachandran' },
  { name: 'Indu Lekha', gender: 'Female', parent: 'Janardhanan' },
  { name: 'Jitendra Shah', gender: 'Male', parent: 'Kiran Shah' },
  { name: 'Keerthi Suresh', gender: 'Female', parent: 'Suresh Kumar' },
  { name: 'Leo Francis', gender: 'Male', parent: 'Francis Xavier' },
  { name: 'Madhavan Unni', gender: 'Male', parent: 'Unnikrishnan P.' }
];

export const INITIAL_CATEGORIES: CategoryCMS[] = [
  {
    id: 'cat-1',
    title: 'Grassroots Football (U-10)',
    description: 'Junior grassroots ball control & fundamental football skills',
    status: 'Active',
    createdAt: '2026-01-10'
  },
  {
    id: 'cat-2',
    title: 'Youth Football Squad (U-13)',
    description: 'Youth tactical awareness, passing accuracy & speed conditioning',
    status: 'Active',
    createdAt: '2026-01-12'
  },
  {
    id: 'cat-3',
    title: 'Junior Football Academy (U-15)',
    description: 'Competitive 11v11 squad preparation & positional play',
    status: 'Active',
    createdAt: '2026-02-01'
  },
  {
    id: 'cat-4',
    title: 'Senior Pro Division (U-18)',
    description: 'Advanced match tactics, physical power & state championship squad',
    status: 'Active',
    createdAt: '2026-02-15'
  }
];

export const INITIAL_PROGRAM_TYPES: ProgramTypeCMS[] = [
  {
    id: 'pt-1',
    title: 'Day Scholar Program',
    description: 'Daily morning or evening non-residential coaching sessions',
    status: 'Active',
    createdAt: '2026-01-05'
  },
  {
    id: 'pt-2',
    title: 'Residential Program',
    description: 'Full boarding & intensive sports performance program',
    status: 'Active',
    createdAt: '2026-01-05'
  },
  {
    id: 'pt-3',
    title: 'Weekend Program',
    description: 'Saturday & Sunday specialized coaching for school students',
    status: 'Active',
    createdAt: '2026-01-10'
  }
];

export const INITIAL_TRAINING_CENTERS: TrainingCenterCMS[] = [
  {
    id: 'tc-1',
    name: 'Kozhikode Main Campus',
    location: 'MSRF Sports Complex, Kozhikode, Kerala',
    phone: '+91 98470 55443',
    status: 'Active',
    createdAt: '2026-01-01'
  },
  {
    id: 'tc-2',
    name: 'Malappuram Sports Hub',
    location: 'Stadium Road, Malappuram, Kerala',
    phone: '+91 94471 22334',
    status: 'Active',
    createdAt: '2026-01-15'
  },
  {
    id: 'tc-3',
    name: 'Calicut Stadium Annex',
    location: 'Medical College Ground, Kozhikode',
    phone: '+91 98952 77889',
    status: 'Active',
    createdAt: '2026-02-01'
  }
];

const CATEGORY_NAMES = ['Grassroots Football (U-10)', 'Youth Football Squad (U-13)', 'Junior Football Academy (U-15)', 'Senior Pro Division (U-18)'];
const PROGRAM_TYPE_NAMES = ['Day Scholar Program', 'Residential Program', 'Weekend Program'];
const TRAINING_CENTER_NAMES = ['Kozhikode Main Campus', 'Malappuram Sports Hub', 'Calicut Stadium Annex'];
const BLOOD_GROUPS = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB+'];

export const INITIAL_STUDENTS: Student[] = NAMES.map((item, idx) => {
  const category = CATEGORY_NAMES[idx % CATEGORY_NAMES.length];
  const programType = PROGRAM_TYPE_NAMES[idx % PROGRAM_TYPE_NAMES.length];
  const trainingCenter = TRAINING_CENTER_NAMES[idx % TRAINING_CENTER_NAMES.length];
  const bloodGroup = BLOOD_GROUPS[idx % BLOOD_GROUPS.length];
  const course = COURSES[idx % COURSES.length];
  const coachObj = INITIAL_COACHES.find(c => c.specialization === course) || INITIAL_COACHES[0];
  const idNum = String(idx + 1).padStart(3, '0');
  const totalFee = (idx % 3 === 0) ? 2000 : (idx % 3 === 1) ? 2500 : 3000;
  const paidRatio = (idx % 4 === 0) ? 1 : (idx % 4 === 1) ? 0.5 : (idx % 4 === 2) ? 0 : 1;
  const paidAmount = Math.round(totalFee * paidRatio);
  const pendingAmount = totalFee - paidAmount;
  const feeStatus: Student['feeStatus'] = pendingAmount === 0 ? 'Paid' : (idx % 5 === 0) ? 'Overdue' : 'Pending';
  const attendancePercentage = 80 + (idx % 20);

  return {
    id: `student-${idx + 1}`,
    studentId: `MSRF-2026-${idNum}`,
    fullName: item.name,
    photo: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
    dateOfBirth: `2012-0${(idx % 8) + 1}-15`,
    gender: item.gender as any,
    bloodGroup,
    phone: `+91 984${String(100000 + idx * 8765).slice(0, 7)}`,
    email: `${item.name.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
    address: `${idx + 101}, Sports Enclave, Malabar Region, Kerala - 673001`,
    
    admissionNumber: `ADM-2026-${idNum}`,
    admissionDate: `2026-01-${String((idx % 25) + 1).padStart(2, '0')}`,
    category,
    programType,
    trainingCenter,
    course,
    batch: idx % 2 === 0 ? 'Morning (6:00 AM - 8:00 AM)' : 'Evening (4:00 PM - 6:00 PM)',
    coachId: coachObj.id,
    coachName: coachObj.fullName,
    status: (idx === 12 || idx === 25) ? 'Inactive' : 'Active',

    parentName: item.parent,
    relationship: 'Father',
    parentPhone: `+91 944${String(200000 + idx * 4321).slice(0, 7)}`,
    parentEmail: `${item.parent.toLowerCase().replace(/[^a-z]/g, '')}@yahoo.com`,
    parentAddress: `${idx + 101}, Sports Enclave, Malabar Region, Kerala - 673001`,

    emergencyName: item.parent,
    emergencyRelationship: 'Father',
    emergencyPhone: `+91 944${String(200000 + idx * 4321).slice(0, 7)}`,

    attendancePercentage,
    totalPresent: Math.round(attendancePercentage * 0.4),
    totalAbsent: 40 - Math.round(attendancePercentage * 0.4),
    feeStatus,
    totalFee,
    paidAmount,
    pendingAmount,

    documents: [
      {
        id: `doc-${idx}-1`,
        title: 'Birth Certificate',
        fileName: `birth_cert_${idNum}.pdf`,
        fileType: 'PDF',
        fileSize: '1.2 MB',
        uploadedDate: '2026-01-15',
        url: '#'
      }
    ]
  };
});

export const INITIAL_PAYMENTS: PaymentSubmission[] = [
  {
    id: 'pay-101',
    submissionNo: 'SUB-2026-801',
    studentId: 'student-1',
    studentName: 'Adarsh Nair',
    parentName: 'Ramesh Nair',
    parentPhone: '+91 9442000000',
    course: 'Swimming Academy',
    amount: 12000,
    transactionId: 'UPI/60293182739/PAY',
    paymentDate: '2026-09-21',
    submittedDate: '2026-09-22 09:30 AM',
    screenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
    status: 'Pending Verification',
    remarks: 'Paid Q3 installment via GooglePay UPI'
  },
  {
    id: 'pay-102',
    submissionNo: 'SUB-2026-802',
    studentId: 'student-3',
    studentName: 'Rohan Kulkarni',
    parentName: 'Sanjay Kulkarni',
    parentPhone: '+91 9442086420',
    course: 'Badminton Club',
    amount: 6000,
    transactionId: 'IMPS/NEFT/88129038',
    paymentDate: '2026-09-20',
    submittedDate: '2026-09-21 04:15 PM',
    screenshotUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=600',
    status: 'Verified',
    verifiedBy: 'Super Admin',
    verifiedAt: '2026-09-21 05:00 PM',
    remarks: 'Verified against SBI Bank statement'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'MSRF-INV-2026-001',
    studentId: 'student-1',
    studentName: 'Adarsh Nair',
    parentName: 'Ramesh Nair',
    parentPhone: '+91 94470 12345',
    course: 'Swimming Academy',
    issueDate: '2026-09-01',
    dueDate: '2026-09-30',
    subtotal: 24000,
    discount: 2000,
    taxAmount: 0,
    totalAmount: 22000,
    paidAmount: 11000,
    balanceDue: 11000,
    paymentStatus: 'Pending',
    items: [
      { id: 'item-1', description: 'Annual Swimming Coaching Fee (2026)', period: 'Jan 2026 - Dec 2026', amount: 20000 },
      { id: 'item-2', description: 'MSRF Official Swim Kit', period: 'One Time', amount: 4000 }
    ]
  }
];

export const DEFAULT_15_CATEGORIES = [
  'TECHNICAL ABILITY',
  'TACTICAL UNDERSTANDING',
  'BALL CONTROL / FIRST TOUCH',
  'PASSING',
  'DRIBBLING',
  'SHOOTING / FINISHING',
  'DEFENDING',
  'DECISION MAKING',
  'INDIVIDUAL SKILLS',
  'TEAMWORK',
  'COMMUNICATION',
  'HARD WORK',
  'DISCIPLINE',
  'CHARACTER & ATTITUDE',
  'FITNESS'
];

export const INITIAL_PERFORMANCE: PerformanceRecord[] = [
  {
    id: 'perf-1',
    studentId: 'student-1',
    studentName: 'Adarsh Nair',
    coachId: 'coach-1',
    coachName: 'Rajesh Varma',
    monthYear: 'September 2026',
    recordedDate: '2026-09-20',
    position: 'Central Midfielder',
    dob: '2012-05-14',
    age: '14',
    strongFoot: 'Right',
    reportPeriod: 'Monthly Evaluation - Sep 2026',
    overallRating: 5,
    rating: 5,
    technicalSkills: 92,
    staminaDiscipline: 95,
    teamwork: 88,
    skillAssessments: [
      { category: 'TECHNICAL ABILITY', rating: 5, comments: 'Exceptional stroke technique & body alignment' },
      { category: 'TACTICAL UNDERSTANDING', rating: 4, comments: 'Understands pace management during sets' },
      { category: 'BALL CONTROL / FIRST TOUCH', rating: 5, comments: 'Quick off-the-wall turn transition' },
      { category: 'PASSING', rating: 4, comments: 'Good rhythm during relay exchanges' },
      { category: 'DRIBBLING', rating: 4, comments: 'Agile lateral movement' },
      { category: 'SHOOTING / FINISHING', rating: 5, comments: 'Strong sprint finish in final 25m' },
      { category: 'DEFENDING', rating: 4, comments: 'Maintains lane discipline under pressure' },
      { category: 'DECISION MAKING', rating: 5, comments: 'Smart energy expenditure' },
      { category: 'INDIVIDUAL SKILLS', rating: 5, comments: 'Mastery over underwater streamline kick' },
      { category: 'TEAMWORK', rating: 4, comments: 'Encouraging squad teammate during hard sets' },
      { category: 'COMMUNICATION', rating: 4, comments: 'Proactive feedback to coaching staff' },
      { category: 'HARD WORK', rating: 5, comments: 'Never skips main set intervals' },
      { category: 'DISCIPLINE', rating: 5, comments: 'Always on deck 15 mins prior to warm up' },
      { category: 'CHARACTER & ATTITUDE', rating: 5, comments: 'Exemplary leadership attitude' },
      { category: 'FITNESS', rating: 5, comments: 'Top tier VO2 max and core endurance' }
    ],
    strengths: '1. Outstanding freestyle stroke efficiency & underwater kick.\n2. Exceptional focus during high intensity interval sets.\n3. High discipline & punctuality.',
    areasForImprovement: '1. Fine-tune breath control during butterfly transition.\n2. Explosive start block reaction time.',
    developmentGoals: ['Improve weak foot', 'Improve first touch', 'Improve tactical awareness', 'Improve fitness'],
    customGoal: 'Achieve sub-58s performance in 100m freestyle at State Trials.',
    coachRemarks: 'Adarsh is preparing exceptionally well for the upcoming State Championship. Consistent leadership on and off the pool deck.'
  },
  {
    id: 'perf-2',
    studentId: 'student-2',
    studentName: 'Fathima Raniya',
    coachId: 'coach-2',
    coachName: 'Anil Kumar',
    monthYear: 'September 2026',
    recordedDate: '2026-09-22',
    position: 'Winger / Attacking Mid',
    dob: '2013-08-19',
    age: '13',
    strongFoot: 'Both',
    reportPeriod: 'Monthly Evaluation - Sep 2026',
    overallRating: 4,
    rating: 4,
    technicalSkills: 86,
    staminaDiscipline: 89,
    teamwork: 92,
    skillAssessments: [
      { category: 'TECHNICAL ABILITY', rating: 4, comments: 'Clean ball striker with both feet' },
      { category: 'TACTICAL UNDERSTANDING', rating: 4, comments: 'Creates dangerous wide space' },
      { category: 'BALL CONTROL / FIRST TOUCH', rating: 5, comments: 'Cushions aerial balls effortlessly' },
      { category: 'PASSING', rating: 4, comments: 'Accurate diagonal crosses' },
      { category: 'DRIBBLING', rating: 5, comments: 'Dynamic 1v1 trickery and burst speed' },
      { category: 'SHOOTING / FINISHING', rating: 4, comments: 'Composed inside 18-yard box' },
      { category: 'DEFENDING', rating: 3, comments: 'Needs to track back faster on counter-attacks' },
      { category: 'DECISION MAKING', rating: 4, comments: 'Good awareness when to release ball' },
      { category: 'INDIVIDUAL SKILLS', rating: 5, comments: 'Creative feints and stepovers' },
      { category: 'TEAMWORK', rating: 5, comments: 'Generous in setting up teammate goals' },
      { category: 'COMMUNICATION', rating: 4, comments: 'Calls clearly for wing overlaps' },
      { category: 'HARD WORK', rating: 4, comments: 'High work rate during possession drills' },
      { category: 'DISCIPLINE', rating: 5, comments: 'Respectful and focused at all times' },
      { category: 'CHARACTER & ATTITUDE', rating: 5, comments: 'Highly receptive to tactical corrections' },
      { category: 'FITNESS', rating: 4, comments: 'Agile stamina with fast acceleration' }
    ],
    strengths: '1. Equal comfort with both left and right foot.\n2. Exceptional 1v1 dribbling skills.\n3. Great team player.',
    areasForImprovement: '1. Track back defensively when team loses possession.\n2. Aerial heading timing.',
    developmentGoals: ['Improve passing accuracy', 'Improve tactical awareness', 'Improve fitness'],
    customGoal: 'Master defensive press triggers when winger drops deep.',
    coachRemarks: 'Fathima shows incredible promise as a dual-foot attacking winger. She is one of our most creative youth academy players.'
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'New Payment Submitted',
    message: 'Parent Ramesh Nair submitted ₹12,000 for Adarsh Nair (UPI/60293182739/PAY).',
    type: 'PAYMENT',
    timestamp: '10 mins ago',
    read: false,
    link: '/super-admin/payments'
  },
  {
    id: 'notif-2',
    title: 'New Website Programme Enquiry',
    message: 'Enquiry for Grassroots Kids Football received from Rahul Menon.',
    type: 'ENQUIRY',
    timestamp: '25 mins ago',
    read: false,
    link: '/super-admin/website-content'
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'MSRF Director (Super Admin)',
    email: 'admin@msrf.org',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    lastLogin: 'Today, 11:45 AM',
    createdAt: '2025-01-01'
  },
  {
    id: 'usr-2',
    name: 'Rajesh Varma (Coach)',
    email: 'rajesh.varma@msrf.org',
    role: 'COACH',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    lastLogin: 'Today, 09:15 AM',
    createdAt: '2025-03-15',
    coachId: 'coach-1'
  }
];

export const INITIAL_PERMISSIONS: RolePermissions[] = [
  {
    role: 'SUPER_ADMIN',
    roleName: 'Super Admin',
    description: 'Full administrative access across all coaching modules, website CMS, and financial ledgers.',
    groups: [
      { module: 'students', label: 'Student Management', view: true, create: true, edit: true, delete: true, export: true },
      { module: 'coaches', label: 'Coach Management', view: true, create: true, edit: true, delete: true, export: true },
      { module: 'attendance', label: 'Attendance Management', view: true, create: true, edit: true, delete: true, export: true },
      { module: 'fees', label: 'Fee Management', view: true, create: true, edit: true, delete: true, export: true },
      { module: 'payments', label: 'Payment Verification', view: true, create: true, edit: true, delete: true, export: true },
      { module: 'reports', label: 'Reports Center', view: true, create: true, edit: true, delete: true, export: true },
      { module: 'website', label: 'Website CMS & Programmes', view: true, create: true, edit: true, delete: true, export: true },
      { module: 'users', label: 'Users & Permissions', view: true, create: true, edit: true, delete: true, export: true }
    ]
  },
  {
    role: 'COACH',
    roleName: 'Coach',
    description: 'Restricted portal access for assigned sports trainees, attendance marking, and monthly performance ratings.',
    groups: [
      { module: 'students', label: 'Assigned Students', view: true, create: false, edit: false, delete: false, export: true },
      { module: 'attendance', label: 'Attendance Marking', view: true, create: true, edit: true, delete: false, export: false },
      { module: 'performance', label: 'Performance Ratings', view: true, create: true, edit: true, delete: false, export: false },
      { module: 'fees', label: 'Fee Management', view: false, create: false, edit: false, delete: false, export: false },
      { module: 'website', label: 'Website CMS', view: false, create: false, edit: false, delete: false, export: false }
    ]
  }
];

// Website CMS Mock Data matching https://msrf-roan.vercel.app screenshots
export const INITIAL_PROGRAMMES: ProgrammeCMS[] = [
  {
    id: 'prog-1',
    ageGroup: '6 - 10 YEARS',
    title: 'Grassroots Kids Football',
    description: 'A fun-first program introducing ball mastery and football fundamentals.',
    status: 'Active',
    enquiriesCount: 24
  },
  {
    id: 'prog-2',
    ageGroup: '11 - 14 YEARS',
    title: 'Youth Development Programme',
    description: 'Position-specific training with regular match exposure and video analysis.',
    status: 'Active',
    enquiriesCount: 18
  },
  {
    id: 'prog-3',
    ageGroup: '15 - 18 YEARS',
    title: 'Elite Residential Training',
    description: 'Intensive training with double sessions, strength conditioning, and professional trial pathways.',
    status: 'Active',
    enquiriesCount: 31
  },
  {
    id: 'prog-4',
    ageGroup: '10 - 18 YEARS',
    title: 'Goalkeeper Academy',
    description: 'Specialized training focusing on shot-stopping, distribution, and reaction drills.',
    status: 'Active',
    enquiriesCount: 12
  },
  {
    id: 'prog-5',
    ageGroup: '8 - 16 YEARS',
    title: 'Weekend Batch',
    description: 'Weekend specialized coaching for students balancing school academics.',
    status: 'Active',
    enquiriesCount: 15
  },
  {
    id: 'prog-6',
    ageGroup: '14 YEARS AND ABOVE',
    title: 'Performance & Fitness',
    description: 'Advanced athletic conditioning, speed & agility protocols for competitive athletes.',
    status: 'Active',
    enquiriesCount: 19
  }
];

export const INITIAL_TEAM_CMS: TeamCMS[] = [
  {
    id: 'team-1',
    name: 'John Doe',
    designation: 'CHAIRMAN',
    initials: 'J',
    biography: 'Former Chief Secretary to the Government of Goa',
    status: 'Active'
  },
  {
    id: 'team-2',
    name: 'Michael Smith',
    designation: 'DIRECTOR',
    initials: 'M',
    biography: 'Former Additional Chief Secretary to the Government of Tamil Nadu',
    status: 'Active'
  },
  {
    id: 'team-3',
    name: 'Robert Johnson',
    designation: 'DIRECTOR',
    initials: 'R',
    biography: 'Former Chief Secretary to the Government of Kerala; currently Chairman, KSIDC',
    status: 'Active'
  },
  {
    id: 'team-4',
    name: 'William Brown',
    designation: 'MANAGING DIRECTOR & CEO',
    initials: 'W',
    biography: 'Former Superintendent of Police, National Sports Administrator',
    status: 'Active'
  },
  {
    id: 'team-5',
    name: 'James Wilson',
    designation: 'DIRECTOR',
    initials: 'J',
    biography: 'Former Commissioner of Income Tax',
    status: 'Active'
  },
  {
    id: 'team-6',
    name: 'Padma Shri Bhramanand S. K. S.',
    designation: 'DIRECTOR',
    initials: 'P',
    biography: 'Padma Shri & Arjuna awardee; former India football captain',
    status: 'Active'
  }
];

export const INITIAL_CAREERS: CareerCMS[] = [
  {
    id: 'job-1',
    position: 'Academy Head Coach',
    location: 'KOZHIKODE, KERALA',
    postedDate: 'OCT 1, 2023',
    jobDescription: 'Lead the technical development of our youth teams, implement the Argentinos Juniors methodology, and mentor junior coaching staff.',
    experienceRequired: '5+ Years (AFC / UEFA License)',
    status: 'Open',
    applicationsCount: 12
  },
  {
    id: 'job-2',
    position: 'Sports Physiotherapist',
    location: 'KOZHIKODE, KERALA',
    postedDate: 'OCT 15, 2023',
    jobDescription: 'Manage player health, injury prevention protocols, and rehabilitation programs for the entire academy.',
    experienceRequired: '3+ Years',
    status: 'Open',
    applicationsCount: 8
  },
  {
    id: 'job-3',
    position: 'Academy Manager',
    location: 'KOZHIKODE, KERALA',
    postedDate: 'AUG 20, 2023',
    jobDescription: 'Oversee daily operations, logistics, and parent communications for the academy.',
    experienceRequired: '4+ Years',
    status: 'Closed',
    applicationsCount: 19
  },
  {
    id: 'job-4',
    position: 'Youth Scout',
    location: 'KOZHIKODE, KERALA',
    postedDate: 'NOV 5, 2023',
    jobDescription: 'Identify talent across district and state level school tournaments.',
    experienceRequired: '2+ Years',
    status: 'Open',
    applicationsCount: 6
  }
];

export const INITIAL_GALLERY: GalleryItemCMS[] = [
  {
    id: 'gal-1',
    title: 'Argentinos Juniors delegation visit',
    category: 'Argentina',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800',
    uploadedDate: '2026-08-10',
    caption: 'Official delegation visit and tactical exchange.',
    status: 'Active'
  },
  {
    id: 'gal-2',
    title: 'Argentina Football Youth Training',
    category: 'Argentina',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800',
    uploadedDate: '2026-08-12',
    caption: 'Junior trainees learning South American ball mastery.',
    status: 'Active'
  },
  {
    id: 'gal-3',
    title: 'State Championship Gold Match',
    category: 'Matches',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&q=80&w=800',
    uploadedDate: '2026-09-02',
    caption: 'MSRF U-15 team winning the gold medal match.',
    status: 'Active'
  },
  {
    id: 'gal-4',
    title: 'Tactical Drills & Conditioning',
    category: 'Training',
    imageUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&q=80&w=800',
    uploadedDate: '2026-07-15',
    caption: 'High-intensity agility and passing drills.',
    status: 'Active'
  },
  {
    id: 'gal-5',
    title: 'Annual Sports Convocation & Awards',
    category: 'Events',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
    uploadedDate: '2026-06-20',
    caption: 'Felicitating national medal winners and parents.',
    status: 'Active'
  }
];

export const INITIAL_APPLICATIONS: CareerApplicationCMS[] = [
  {
    id: 'app-1',
    applicantName: 'Vikram Sethi',
    email: 'vikram.sethi@gmail.com',
    phone: '+91 98450 99887',
    position: 'Academy Head Coach',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    resumeFileName: 'vikram_sethi_head_coach_cv.pdf',
    appliedDate: '2026-09-20',
    status: 'Under Review'
  },
  {
    id: 'app-2',
    applicantName: 'Dr. Sneha Roy',
    email: 'sneha.roy@physio.org',
    phone: '+91 94471 88776',
    position: 'Sports Physiotherapist',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    resumeFileName: 'dr_sneha_roy_physio_resume.pdf',
    appliedDate: '2026-09-21',
    status: 'Shortlisted'
  },
  {
    id: 'app-3',
    applicantName: 'Rahul Verma',
    email: 'rahul.verma@sports.in',
    phone: '+91 98950 44332',
    position: 'Youth Scout',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    resumeFileName: 'rahul_verma_scout_cv.pdf',
    appliedDate: '2026-09-22',
    status: 'Under Review'
  }
];

export const INITIAL_ENQUIRIES: ContactEnquiryCMS[] = [
  {
    id: 'enq-1',
    name: 'Rahul Menon',
    email: 'rahul.menon@gmail.com',
    phone: '+91 98950 11223',
    programmeOrSubject: 'Grassroots Kids Football (6 - 10 YEARS)',
    message: 'Interested in enrolling my 8-year-old son for the upcoming batch.',
    submittedDate: '2026-09-22 10:15 AM',
    status: 'New'
  },
  {
    id: 'enq-2',
    name: 'Anjali Nair',
    email: 'anjali.nair@yahoo.com',
    phone: '+91 94460 33445',
    programmeOrSubject: 'Elite Residential Training (15 - 18 YEARS)',
    message: 'Looking for trial dates and hostel facility details.',
    submittedDate: '2026-09-21 03:40 PM',
    status: 'Contacted'
  }
];

export const INITIAL_HOME_BANNERS: HomeBannerCMS[] = [
  {
    id: 'banner-1',
    title: 'Transforming Grassroots Sports in Malabar',
    subtitle: 'State-of-the-art coaching facilities, Olympic-grade pools, and certified professional mentors.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&q=80&w=1200',
    ctaText: 'Explore Sports Academies',
    status: 'Active'
  }
];

export const INITIAL_PARTNERS: PartnerCMS[] = [
  {
    id: 'partner-1',
    partnerName: 'Argentinos Juniors',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
    website: 'https://argentinosjuniors.com.ar',
    description: 'International technical partnership and youth trial pathways.',
    status: 'Active'
  }
];

export const INITIAL_TESTIMONIALS: TestimonialCMS[] = [
  {
    id: 'test-1',
    authorName: 'Ramesh Nair',
    role: 'Parent of Adarsh Nair',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    quote: 'MSRF has completely transformed my son\'s training career.',
    rating: 5,
    status: 'Active'
  }
];

export const INITIAL_BLOGS: BlogCMS[] = [
  {
    id: 'blog-1',
    title: 'Grassroots Football Fundamentals',
    description: 'Insights from MSRF Senior Head Coach on youth ball mastery.',
    featuredImage: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&q=80&w=800',
    publishDate: '2026-09-15',
    author: 'Coach Alex D\'Souza',
    category: 'Football',
    status: 'Published'
  }
];

export const INITIAL_WEEKLY_TOPICS: string[] = [
  'Tactical High-Pressing & Counter Attacks',
  'Possession Retention & Quick One-Touch Passing',
  'Defensive Structure & Zonal Positioning',
  'Speed, Agility & Plyometric Fitness',
  'Finishing & 1v1 Attacking Scenarios',
  'Set Piece Strategies & Corner Kick Routines'
];

export const INITIAL_SESSION_REPORTS: DailyTrainingSessionReport[] = [
  {
    id: 'report-2026-001',
    date: '2026-09-25',
    categories: ['Football Excellence', 'Swimming Academy'],
    loggedByCoachName: 'Rajesh Varma',
    assignedCoaches: ['Priya Nambiar', 'Alex D\'Souza'],
    attendanceCount: 48,
    venue: 'Main Stadium Ground Pitch A',
    time: '06:00 AM - 08:00 AM',
    weeklyTopic: 'Tactical High-Pressing & Counter Attacks',
    dailyTopic: 'Midfield Transition & Defensive Recovery',
    explanation: 'Focus on organized press in the middle third and rapid transition upon turnover.',
    splits: [
      {
        id: 'sp-1',
        heading: 'Warmup & Agility Drills',
        timeDoneMins: '15',
        explanation: 'Dynamic stretching, joint mobility, 4x50m acceleration sprints with agility ladder.'
      },
      {
        id: 'sp-2',
        heading: 'Rondo 4v2 Overload',
        timeDoneMins: '20',
        explanation: 'One-touch ball retention under high pressure. Goal of 15 consecutive passes.'
      },
      {
        id: 'sp-3',
        heading: '7v7 Half-Pitch Pressing Game',
        timeDoneMins: '35',
        explanation: 'Simulated match conditions focusing on trigger calls and compact shape.'
      },
      {
        id: 'sp-4',
        heading: 'Cool Down & Post-Session Debrief',
        timeDoneMins: '15',
        explanation: 'Static stretching, hydration check, and individual tactical feedback.'
      }
    ],
    fullSessionOverview: 'Excellent energy and discipline. Defensive line maintained compact depth throughout the 7v7 game.',
    studentAttendance: {
      'st-1': { status: 'Present', remarks: 'Good pressing energy' },
      'st-2': { status: 'Present', remarks: 'Solid positioning' },
      'st-3': { status: 'Informed', remarks: 'Medical leave approved' }
    },
    coachAttendance: {
      'coach-1': { status: 'Present' },
      'coach-2': { status: 'Present' },
      'coach-3': { status: 'Informed', remarks: 'State tournament duty' }
    },
    createdAt: '2026-09-25T08:00:00Z'
  },
  {
    id: 'report-2026-002',
    date: '2026-09-24',
    categories: ['Youth Football Squad (U-13)', 'Grassroots Football (U-10)'],
    loggedByCoachName: 'Priya Nambiar',
    assignedCoaches: ['Rajesh Varma'],
    attendanceCount: 36,
    venue: 'Pitch B Synthetic Turf',
    time: '04:00 PM - 06:00 PM',
    weeklyTopic: 'Finishing & 1v1 Attacking Scenarios',
    dailyTopic: 'Overlapping Runs & Wing Cross Finishing',
    explanation: 'High intensity wing overlap patterns and 1v1 finishing against goalkeeper.',
    splits: [
      {
        id: 'sp-1',
        heading: 'Dynamic Ball Master Warmup',
        timeDoneMins: '20',
        explanation: 'Passing triangles and quick one-touch ball control.'
      },
      {
        id: 'sp-2',
        heading: '2v1 Wing Overload Drills',
        timeDoneMins: '30',
        explanation: 'Fullbacks overlapping winger to deliver low crosses into penalty area.'
      }
    ],
    fullSessionOverview: 'Trainees showed great improvements in crossing accuracy and box movement.',
    studentAttendance: {
      'st-1': { status: 'Present' },
      'st-2': { status: 'Absent', remarks: 'Unexcused' }
    },
    coachAttendance: {
      'coach-2': { status: 'Present' },
      'coach-1': { status: 'Present' }
    },
    createdAt: '2026-09-24T18:00:00Z'
  }
];
