/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum CourseType {
  DAY_CARE = "Day-Care",
  PRE_NURSERY = "Pre-Nursery",
  NURSERY = "Nursery",
  LKG = "LKG",
  UKG = "UKG"
}

export interface Student {
  id: string;
  name: string;
  course: CourseType;
  rollNo: string;
  age: number;
  gender: string;
  fatherName: string;
  motherName: string;
  contactPhone: string;
  email: string;
  address: string;
  status: "Active" | "Inactive";
  enrollmentDate: string;
  avatarSeed: string; // for custom avatars
  parentPassword?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: "Admin" | "Staff" | "Accountant" | "Management";
  specialization?: string; // e.g. Day-Care Coordinator, Nursery Teacher
  email: string;
  phone: string;
  salary: number;
  joiningDate: string;
  status: "Active" | "Resigned" | "On Leave";
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  targetId: string; // studentId or staffId
  targetType: "student" | "staff";
  status: "Present" | "Absent" | "Late";
  markedBy: string; // Staff member name
  smsTriggered?: boolean;
}

export interface GradingScale {
  homeworkWeight: number; // e.g. 30
  examWeight: number; // e.g. 70
}

export interface GradeItem {
  id: string;
  studentId: string;
  course: CourseType;
  academicTerm: "Term 1" | "Term 2" | "Final Term";
  subject: string; // e.g., English, Math, Rhymes, Drawing, Social Skills
  homeworkScore: number; // 0 - 100
  examScore: number; // 0 - 100
  weightedTotal: number; // auto-calculated
  letterGrade: string; // auto-calculated (A+, A, B, C, F)
  remarks: string;
  markedBy: string;
}

export interface InvoiceItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  studentId: string;
  course: CourseType;
  term: string;
  dueDate: string;
  paidDate?: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: "Paid" | "Unpaid" | "Pending";
  stripePaymentIntentId?: string;
}

export interface LessonPlan {
  id: string;
  course: CourseType;
  teacherId: string;
  teacherName: string;
  date: string;
  topic: string;
  objectives: string;
  activities: string;
  feedback?: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  month: string; // e.g. "May 2026"
  baseSalary: number;
  allowances: number;
  deductions: number;
  netPayable: number;
  paidDate?: string;
  status: "Paid" | "Pending";
}

export interface HomeworkRecord {
  id: string;
  course: CourseType;
  title: string;
  description: string;
  activities?: string;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  postedBy: string; // teacher or admin
}

export interface Exam {
  id: string;
  title: string;
  course: CourseType;
  subject: string;
  examDate: string; // YYYY-MM-DD
  examTime: string; // HH:MM or AM/PM
  maxMarks: number;
  syllabus: string;
  academicTerm: "Term 1" | "Term 2" | "Final Term";
  status: "Scheduled" | "Completed" | "Cancelled";
}

