/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { Student, StaffMember, Invoice, PayrollRecord, CourseType, GradeItem, HomeworkRecord } from "../types";
import { Users, CreditCard, Shield, Plus, Edit3, Trash2, Check, UserPlus, DollarSign, Calendar, Settings, FileText, CheckCircle, Printer, Search, Receipt, GraduationCap, BookOpen, Award, Sparkles, KeyRound, AlertTriangle, AlertCircle, TrendingUp, Bell } from "lucide-react";
import HorizonLogo from "./HorizonLogo";
import ArivuLogo from "./ArivuLogo";

const getRollPrefix = (course: CourseType): string => {
  switch (course) {
    case CourseType.DAY_CARE: return "DC";
    case CourseType.PRE_NURSERY: return "PN";
    case CourseType.NURSERY: return "NS";
    case CourseType.LKG: return "LK";
    case CourseType.UKG: return "UK";
    default: return "UK";
  }
};

interface AdminDashboardProps {
  students: Student[];
  staff: StaffMember[];
  billing: Invoice[];
  payroll: PayrollRecord[];
  globalWeights: { homeworkWeight: number; examWeight: number };
  grades: GradeItem[];
  homework: HomeworkRecord[];
  onAddStudent: (payload: any) => Promise<void>;
  onUpdateStudent: (id: string, payload: any) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
  onAddStaff: (payload: any) => Promise<void>;
  onUpdateStaff: (id: string, payload: any) => Promise<void>;
  onDeleteStaff: (id: string) => Promise<void>;
  onToggleStaffAttendance: (payload: {
    targetId: string;
    targetType: "student" | "staff";
    date: string;
    status: "Present" | "Absent" | "Late";
    markedBy: string;
  }) => Promise<any>;
  onGenerateBill: (payload: any) => Promise<void>;
  onPayInvoice: (id: string, paymentMethod?: string) => Promise<void>;
  onUpdatePayroll: (id: string, payload: any) => Promise<void>;
  onAddPayroll?: (payload: any) => Promise<void>;
  onDeletePayroll?: (id: string) => Promise<void>;
  onUpdateSettings: (payload: { homeworkWeight: number; examWeight: number }) => Promise<void>;
  onSaveGrade: (payload: any) => Promise<void>;
  onSaveHomework: (payload: any) => Promise<void>;
  onDeleteHomework: (id: string) => Promise<void>;
  attendanceRecords: any[];
  activeTab?: "sis" | "staff" | "billing" | "payroll" | "weights" | "gradebook" | "homework";
  onTabChange?: (tab: "sis" | "staff" | "billing" | "payroll" | "weights" | "gradebook" | "homework") => void;
  userRole?: string;
}

export default function AdminDashboard({
  students,
  staff,
  billing,
  payroll,
  globalWeights,
  grades,
  homework,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onToggleStaffAttendance,
  onGenerateBill,
  onPayInvoice,
  onUpdatePayroll,
  onAddPayroll,
  onDeletePayroll,
  onUpdateSettings,
  onSaveGrade,
  onSaveHomework,
  onDeleteHomework,
  attendanceRecords,
  activeTab: externalActiveTab,
  onTabChange,
  userRole
}: AdminDashboardProps) {
  const currentDateStr = new Date().toISOString().split("T")[0]; // "2026-06-02"
  const [internalTab, setInternalTab] = useState<"sis" | "staff" | "billing" | "payroll" | "weights" | "gradebook" | "homework">("sis");

  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalTab;
  const setActiveTab = onTabChange !== undefined ? onTabChange : setInternalTab;

  // SIS Dialog States
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    course: CourseType.UKG,
    rollNo: "UK-2026-" + Math.floor(100 + Math.random() * 900),
    age: 5,
    gender: "Male",
    fatherName: "",
    motherName: "",
    contactPhone: "+91",
    email: "",
    address: "",
    status: "Active" as const,
    enrollmentDate: currentDateStr,
    avatarSeed: "av_" + Math.floor(Math.random() * 1000),
    parentPassword: "parent123"
  });

  // Staff Recruitment state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    role: "Staff" as const,
    specialization: "",
    email: "",
    phone: "+91",
    salary: 25000,
    joiningDate: currentDateStr,
    status: "Active" as const
  });

  // Staff Editing state
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  // State hooks for inline delete confirmations (immune to iframe alert/confirm sandboxing)
  const [confirmDeleteStaffId, setConfirmDeleteStaffId] = useState<string | null>(null);
  const [confirmDeleteStudentId, setConfirmDeleteStudentId] = useState<string | null>(null);
  const [confirmDeletePayrollId, setConfirmDeletePayrollId] = useState<string | null>(null);
  const [confirmDeleteHomeworkId, setConfirmDeleteHomeworkId] = useState<string | null>(null);

  // Helper to enforce phone number inputs start with "+91", and accept only digits
  const formatPhoneInput = (value: string): string => {
    // If empty or falsy, default to "+91"
    if (!value) return "+91";
    let clean = value;
    if (!clean.startsWith("+")) {
      clean = "+" + clean.replace(/\D/g, "");
    } else {
      clean = "+" + clean.substring(1).replace(/\D/g, "");
    }
    
    // Ensure starts with "+91"
    if (!clean.startsWith("+91")) {
      if (clean.length < 4) {
        return "+91";
      } else {
        return "+91" + clean.replace(/\D/g, "").substring(2);
      }
    }
    return clean;
  };

  // Config weights state
  const [hwWeight, setHwWeight] = useState(globalWeights.homeworkWeight);
  const [exWeight, setExWeight] = useState(globalWeights.examWeight);

  // Billing Engine State
  const [billingStudentId, setBillingStudentId] = useState("");
  const [billingTerm, setBillingTerm] = useState("First Term Fees 2026");
  const [billingItems, setBillingItems] = useState([
    { description: "Term Tuition Fee", amount: 15000 },
    { description: "Smart Lab & Food Kits", amount: 5000 }
  ]);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);
  const [ledgerTab, setLedgerTab] = useState<"students" | "invoices">("students");
  const [studentSearch, setStudentSearch] = useState("");

  // Gradebook State Declarations
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeItem | null>(null);
  const [grStudentId, setGrStudentId] = useState("");
  const [grTerm, setGrTerm] = useState<"Term 1" | "Term 2" | "Final Term">("Term 1");
  const [grSubject, setGrSubject] = useState("Reading & Phonics");
  const [grHwScore, setGrHwScore] = useState(85);
  const [grExScore, setGrExScore] = useState(80);
  const [grRemarks, setGrRemarks] = useState("");
  const [aiGeneratingRemarks, setAiGeneratingRemarks] = useState(false);
  const [selectedReportCardStudentId, setSelectedReportCardStudentId] = useState<string | null>(null);

  // Homework & Daily Activities State Declarations
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [editingHomework, setEditingHomework] = useState<HomeworkRecord | null>(null);
  const [hwCourse, setHwCourse] = useState<CourseType>(CourseType.NURSERY);
  const [hwTitle, setHwTitle] = useState("");
  const [hwDesc, setHwDesc] = useState("");
  const [hwActivities, setHwActivities] = useState("");
  const [selectedHwClassFilter, setSelectedHwClassFilter] = useState<string>("ALL");
  const [hwDate, setHwDate] = useState(currentDateStr);
  const [hwDueDate, setHwDueDate] = useState(currentDateStr);
  const [aiGeneratingHomework, setAiGeneratingHomework] = useState(false);

  // Dynamic Educators & Staff search filters state
  const [selectedStaffRoleFilter, setSelectedStaffRoleFilter] = useState<string>("ALL");
  const [selectedStaffStatusFilter, setSelectedStaffStatusFilter] = useState<string>("ALL");
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>("");

  // Dynamic SIS Student search filters state
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>("");
  const [selectedStudentClassFilter, setSelectedStudentClassFilter] = useState<string>("ALL");
  const [selectedStudentStatusFilter, setSelectedStudentStatusFilter] = useState<string>("ALL");

  // Parents Link Editing State
  const [showEditParentsModal, setShowEditParentsModal] = useState(false);
  const [editingStudentForParents, setEditingStudentForParents] = useState<Student | null>(null);
  const [editParentPhone, setEditParentPhone] = useState("");
  const [editParentPassword, setEditParentPassword] = useState("");
  const [editFatherName, setEditFatherName] = useState("");
  const [editMotherName, setEditMotherName] = useState("");
  const [editParentEmail, setEditParentEmail] = useState("");

  // Print Invoice using standard high-compatibility direct print
  const handlePrintInvoice = () => {
    window.focus();
    window.print();
  };

  // Trigger AI comments on student grade cards
  const handleAIGenerateGradeRemarks = async () => {
    const student = students.find(s => s.id === grStudentId);
    if (!student) {
      alert("Please select a student first.");
      return;
    }
    setAiGeneratingRemarks(true);
    try {
      const response = await fetch("/api/ai/remarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: student.name,
          course: student.course,
          subject: grSubject,
          examScore: grExScore,
          homeworkScore: grHwScore
        })
      });
      if (response.ok) {
        const json = await response.json();
        setGrRemarks(json.remarks || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiGeneratingRemarks(false);
    }
  };

  // Submit new grade to the system
  const handleFormSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === grStudentId);
    if (!student) {
      alert("Please select an active student.");
      return;
    }

    const payload = {
      id: editingGrade?.id,
      studentId: grStudentId,
      course: student.course,
      academicTerm: grTerm,
      subject: grSubject,
      homeworkScore: grHwScore,
      examScore: grExScore,
      remarks: grRemarks,
      markedBy: "Preschool Registrar"
    };

    try {
      if (editingGrade) {
        const response = await fetch(`/api/grades/${editingGrade.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const updated = await response.json();
          // Find and replace in array
          const idx = grades.findIndex(g => g.id === updated.id);
          if (idx !== -1) {
            grades[idx] = updated;
          }
          alert("Academic report grades updated successfully.");
        }
      } else {
        await onSaveGrade(payload);
        alert("Student grade entry registered successfully.");
      }
      setShowGradeModal(false);
      setEditingGrade(null);
      setGrStudentId("");
      setGrRemarks("");
    } catch (err) {
      console.error(err);
    }
  };

  // AI activities generator for homework
  const handleAIGenerateHomeworkActivities = async () => {
    if (!hwTitle) {
      alert("Please specify a topic or keyword in the Title field first.");
      return;
    }
    setAiGeneratingHomework(true);
    try {
      const response = await fetch("/api/ai/lesson-plan", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           topic: hwTitle,
           course: hwCourse
         })
      });
      if (response.ok) {
        const json = await response.json();
        setHwDesc(json.objectives || "");
        setHwActivities(json.activities || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiGeneratingHomework(false);
    }
  };

  // Submit homework record
  const handleFormSaveHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle || !hwDesc) {
      alert("Please enter both a homework Title and Objectives/Description.");
      return;
    }

    const payload = {
      id: editingHomework?.id,
      course: hwCourse,
      title: hwTitle,
      description: hwDesc,
      activities: hwActivities,
      date: hwDate,
      dueDate: hwDueDate,
      postedBy: "System Admin Desk"
    };

    try {
      await onSaveHomework(payload);
      alert("Homework & child activities feed saved successfully!");
      setShowHomeworkModal(false);
      setEditingHomework(null);
      setHwTitle("");
      setHwDesc("");
      setHwActivities("");
    } catch (err) {
      console.error(err);
    }
  };

  // Handle student create
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.fatherName) {
      alert("Please provide the child name and parents info.");
      return;
    }
    try {
      await onAddStudent(newStudent);
      setShowAddStudentModal(false);
      // Reset
      setNewStudent({
        name: "",
        course: CourseType.UKG,
        rollNo: "UK-2026-" + Math.floor(100 + Math.random() * 900),
        age: 5,
        gender: "Male",
        fatherName: "",
        motherName: "",
        contactPhone: "+91",
        email: "",
        address: "",
        status: "Active",
        enrollmentDate: currentDateStr,
        avatarSeed: "av_" + Math.floor(Math.random() * 1000),
        parentPassword: "parent123"
      });
      alert("New student profile created in Centralized SIS Ledger.");
    } catch (err) {
      console.error(err);
    }
  };

  // Staff recruitment submission
  const handleRecruitStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.email) {
      alert("Staff Member email and name required.");
      return;
    }
    try {
      await onAddStaff(newStaff);
      setShowAddStaffModal(false);
      setNewStaff({
        name: "",
        role: "Staff",
        specialization: "",
        email: "",
        phone: "+91",
        salary: 25000,
        joiningDate: currentDateStr,
        status: "Active"
      });
      alert("New staff record enrolled in administration.");
    } catch (err) {
      console.error(err);
    }
  };

  // Staff profile edit submission
  const handleUpdateStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff || !editingStaff.name || !editingStaff.email) {
      alert("Staff Member email and name required.");
      return;
    }
    try {
      await onUpdateStaff(editingStaff.id, editingStaff);
      setShowEditStaffModal(false);
      setEditingStaff(null);
      alert("Staff member profile updated successfully.");
    } catch (err) {
      console.error(err);
    }
  };

  // Update Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hwWeight + exWeight !== 100) {
      alert("The total grade weights sum must add up to exactly 100%. Current sum: " + (hwWeight + exWeight) + "%");
      return;
    }
    try {
      await onUpdateSettings({ homeworkWeight: hwWeight, examWeight: exWeight });
      alert("Global academic report weights configured successfully.");
    } catch (err) {
      console.error(err);
    }
  };

  // Clear Payroll Monthly Salary
  const handleClearSalary = async (payRecord: PayrollRecord) => {
    try {
      await onUpdatePayroll(payRecord.id, {
        status: "Paid",
        paidDate: currentDateStr
      });
      alert(`Salary verified & cleared for ${payRecord.staffName}. Electronic transfer simulated.`);
    } catch (err) {
      console.error(err);
    }
  };

  // --- ADVANCED PAYROLL WORKFLOW SYSTEM STATES & ACTIONS ---
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollRecord | null>(null);
  const [viewingPayslip, setViewingPayslip] = useState<PayrollRecord | null>(null);

  // Form Inputs
  const [payStaffId, setPayStaffId] = useState("");
  const [payMonth, setPayMonth] = useState("June 2026");
  const [payBaseSalary, setPayBaseSalary] = useState(25000);
  const [payAllowanceHra, setPayAllowanceHra] = useState(3000);
  const [payAllowanceSpecial, setPayAllowanceSpecial] = useState(2000);
  const [payAllowanceConveyance, setPayAllowanceConveyance] = useState(1500);
  const [payDeductionPf, setPayDeductionPf] = useState(1800);
  const [payDeductionTds, setPayDeductionTds] = useState(500);
  const [payDeductionLop, setPayDeductionLop] = useState(0);
  const [payStatus, setPayStatus] = useState<"Paid" | "Pending">("Pending");
  const [payPaidDate, setPayPaidDate] = useState("");

  // Filter States
  const [payrollFilterMonth, setPayrollFilterMonth] = useState("All");
  const [payrollFilterStatus, setPayrollFilterStatus] = useState("All");
  const [payrollSearchQuery, setPayrollSearchQuery] = useState("");

  const handlePayrollStaffChange = (staffId: string) => {
    setPayStaffId(staffId);
    const selectedStaff = staff.find(s => s.id === staffId);
    if (selectedStaff) {
      setPayBaseSalary(selectedStaff.salary);
      // Allocate defaults
      setPayAllowanceHra(Math.floor(selectedStaff.salary * 0.12));
      setPayAllowanceSpecial(2000);
      setPayAllowanceConveyance(1500);
      setPayDeductionPf(Math.min(1800, Math.floor(selectedStaff.salary * 0.12)));
      setPayDeductionTds(500);
      setPayDeductionLop(0);
    }
  };

  const openAddPayrollModal = () => {
    setEditingPayroll(null);
    const initialStaffId = staff[0]?.id || "";
    setPayStaffId(initialStaffId);
    const selectedStaff = staff[0];
    if (selectedStaff) {
      setPayBaseSalary(selectedStaff.salary);
      setPayAllowanceHra(Math.floor(selectedStaff.salary * 0.12));
      setPayDeductionPf(Math.min(1800, Math.floor(selectedStaff.salary * 0.12)));
    } else {
      setPayBaseSalary(25000);
      setPayAllowanceHra(3000);
      setPayDeductionPf(1800);
    }
    setPayMonth("June 2026");
    setPayAllowanceSpecial(2000);
    setPayAllowanceConveyance(1500);
    setPayDeductionTds(500);
    setPayDeductionLop(0);
    setPayStatus("Pending");
    setPayPaidDate("");
    setShowPayrollModal(true);
  };

  const openEditPayrollModal = (pay: PayrollRecord) => {
    setEditingPayroll(pay);
    setPayStaffId(pay.staffId);
    setPayMonth(pay.month);
    setPayBaseSalary(pay.baseSalary);
    
    // Allocate parts
    const hra = Math.floor(pay.allowances * 0.5);
    const conv = Math.floor(pay.allowances * 0.2);
    const spec = pay.allowances - hra - conv;
    setPayAllowanceHra(hra);
    setPayAllowanceConveyance(conv);
    setPayAllowanceSpecial(spec);

    const pf = Math.min(pay.deductions, 1800);
    const tds = Math.floor((pay.deductions - pf) * 0.4);
    const lop = pay.deductions - pf - tds;
    setPayDeductionPf(pf);
    setPayDeductionTds(tds);
    setPayDeductionLop(lop);

    setPayStatus(pay.status);
    setPayPaidDate(pay.paidDate || "");
    setShowPayrollModal(true);
  };

  const handleSavePayrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedStaff = staff.find(s => s.id === payStaffId);
    if (!selectedStaff) {
      alert("Invalid staff member selected.");
      return;
    }

    const allowancesSum = (payAllowanceHra || 0) + (payAllowanceSpecial || 0) + (payAllowanceConveyance || 0);
    const deductionsSum = (payDeductionPf || 0) + (payDeductionTds || 0) + (payDeductionLop || 0);
    const net = payBaseSalary + allowancesSum - deductionsSum;

    const payload = {
      staffId: payStaffId,
      staffName: selectedStaff.name,
      role: selectedStaff.role,
      month: payMonth,
      baseSalary: payBaseSalary,
      allowances: allowancesSum,
      deductions: deductionsSum,
      netPayable: net,
      status: payStatus,
      paidDate: payStatus === "Paid" ? (payPaidDate || currentDateStr) : undefined
    };

    try {
      if (editingPayroll) {
        await onUpdatePayroll(editingPayroll.id, payload);
        alert(`Successfully updated payroll ledger for ${selectedStaff.name}`);
      } else {
        if (onAddPayroll) {
          await onAddPayroll(payload);
          alert(`Created new payroll ledger entry for ${selectedStaff.name}`);
        } else {
          alert("Payroll creation is not connected.");
        }
      }
      setShowPayrollModal(false);
    } catch (err) {
      console.error(err);
      alert("Error saving payroll entry.");
    }
  };

  const handleDeletePayrollClick = async (id: string) => {
    if (confirm("Are you sure you want to delete this payroll Ledger Entry?")) {
      try {
        if (onDeletePayroll) {
          await onDeletePayroll(id);
          alert("Ledger entry removed.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to delete ledger entry.");
      }
    }
  };

  // Indian Currency Words translator helper
  const amountInWords = (amount: number): string => {
    const ones = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
      "Seventeen", "Eighteen", "Nineteen"
    ];
    const tens = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    const convertNum = (n: number): string => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
      if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convertNum(n % 100) : "");
      if (n < 100000) return convertNum(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convertNum(n % 1000) : "");
      if (n < 10000000) return convertNum(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + convertNum(n % 100000) : "");
      return convertNum(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + convertNum(n % 10000000) : "");
    };

    const integerPart = Math.floor(amount);
    if (integerPart === 0) return "Zero Rupees Only";
    return convertNum(integerPart) + " Rupees Only";
  };

  // Create Bill Submission
  const handleGenerateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingStudentId) {
      alert("Please select a student target.");
      return;
    }
    const targetStud = students.find((s) => s.id === billingStudentId);
    if (!targetStud) return;

    try {
      await onGenerateBill({
        studentId: billingStudentId,
        course: targetStud.course,
        term: billingTerm,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        items: billingItems,
        status: "Unpaid"
      });
      setBillingStudentId("");
      alert("Official fee invoice generated for " + targetStud.name);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Staff Attendance Helper
  const handleStaffAttendToggle = async (staffId: string, status: "Present" | "Absent" | "Late") => {
    try {
      await onToggleStaffAttendance({
        targetId: staffId,
        targetType: "staff",
        date: currentDateStr,
        status,
        markedBy: "Administrator Principal"
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Student toggle active/inactive status
  const handleStudentStatusToggle = async (stud: Student) => {
    const nextStatus = stud.status === "Active" ? "Inactive" : "Active";
    try {
      await onUpdateStudent(stud.id, { status: nextStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEditParentsModal = (stud: Student) => {
    setEditingStudentForParents(stud);
    setEditParentPhone(formatPhoneInput(stud.contactPhone));
    setEditParentPassword(stud.parentPassword || "parent123");
    setEditFatherName(stud.fatherName || "");
    setEditMotherName(stud.motherName || "");
    setEditParentEmail(stud.email || "");
    setShowEditParentsModal(true);
  };

  const handleSaveParentsLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudentForParents) return;
    try {
      await onUpdateStudent(editingStudentForParents.id, {
        contactPhone: editParentPhone,
        parentPassword: editParentPassword,
        fatherName: editFatherName,
        motherName: editMotherName,
        email: editParentEmail
      });
      setShowEditParentsModal(false);
      setEditingStudentForParents(null);
      alert(`Parents links and credentials updated successfully for ${editingStudentForParents.name}!`);
    } catch (err) {
      console.error(err);
      alert("Failed to update parent link and credential data.");
    }
  };

  return (
    <div className="space-y-6" id="admin-dashboard-root">

      {activeTab === "sis" && (() => {
        // Compute beautiful reactive statistics for student enrollment
        const stats = (() => {
          const total = students.length;
          const active = students.filter((s) => s.status === "Active").length;
          const nurseryNum = students.filter((s) => s.course === CourseType.NURSERY).length;
          const lkgNum = students.filter((s) => s.course === CourseType.LKG).length;
          const ukgNum = students.filter((s) => s.course === CourseType.UKG).length;
          const daycareNum = students.filter((s) => s.course === CourseType.DAY_CARE).length;
          const unlinkedCount = students.filter((s) => !s.parentPassword).length;
          return { total, active, nurseryNum, lkgNum, ukgNum, daycareNum, unlinkedCount };
        })();

        // Vibrant character-based linear gradients for child student avatars
        const getStudentAvatarTheme = (name: string) => {
          const charCode = name.charCodeAt(0) || 65;
          const index = charCode % 5;
          switch (index) {
            case 0:
              return "bg-gradient-to-tr from-rose-400 via-pink-400 to-amber-300 text-white ring-rose-100";
            case 1:
              return "bg-gradient-to-tr from-cyan-400 via-teal-500 to-indigo-500 text-white ring-cyan-150/50";
            case 2:
              return "bg-gradient-to-tr from-emerald-450 via-teal-500 to-amber-200 text-white ring-emerald-100";
            case 3:
              return "bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-300 text-white ring-amber-100";
            default:
              return "bg-gradient-to-tr from-fuchsia-500 via-purple-600 to-pink-400 text-white ring-fuchsia-100";
          }
        };

        // Custom chip styles based on early childhood class stream
        const getStudentClassBadgeStyle = (course: string) => {
          switch (course) {
            case "Nursery":
            case "NURSERY":
              return "bg-teal-50 text-teal-800 border-teal-200";
            case "LKG":
              return "bg-violet-50 text-violet-800 border-violet-200";
            case "UKG":
              return "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200";
            case "Day Care":
            case "DAY_CARE":
              return "bg-amber-50 text-amber-800 border-amber-200";
            case "Pre-Nursery":
              return "bg-indigo-50 text-indigo-800 border-indigo-200";
            default:
              return "bg-slate-100 text-slate-800 border-slate-200";
          }
        };

        // Filter search list outputs in real-time
        const filteredStudents = students.filter((stud) => {
          if (selectedStudentClassFilter !== "ALL" && stud.course !== selectedStudentClassFilter) {
            return false;
          }
          if (selectedStudentStatusFilter !== "ALL" && stud.status !== selectedStudentStatusFilter) {
            return false;
          }
          if (studentSearchQuery.trim() !== "") {
            const query = studentSearchQuery.toLowerCase();
            const father = (stud.fatherName || "").toLowerCase();
            const roll = (stud.rollNo || "").toLowerCase();
            const phone = (stud.contactPhone || "").toLowerCase();
            const name = (stud.name || "").toLowerCase();
            return (
              name.includes(query) ||
              roll.includes(query) ||
              phone.includes(query) ||
              father.includes(query)
            );
          }
          return true;
        });

        return (
          <div className="space-y-8 animate-fadeIn" id="student-sis-workspace">
            
            {/* Colorful creative educational header banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-[#7C3AED] to-[#DB2777] p-6 sm:p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden text-left">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-10 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-white/20 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider select-none">
                    <GraduationCap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                    Student Registry Center
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black font-sans tracking-tight m-0">
                    Student Information System (SIS)
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 max-w-xl font-medium leading-relaxed m-0">
                    Access child profiles, monitor class assignments, generate parent access links, and evaluate account status directly from the school control room.
                  </p>
                </div>

                {userRole !== "Staff" && (
                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(true)}
                    className="px-6 py-3.5 bg-yellow-400 hover:bg-yellow-350 active:scale-98 rounded-2xl font-black text-xs text-zinc-950 cursor-pointer shadow-[0_10px_20px_rgba(234,179,8,0.22)] hover:shadow-[0_12px_24px_rgba(234,179,8,0.30)] transition-all duration-200 flex items-center justify-center gap-2 border-none"
                  >
                    <UserPlus className="w-4 h-4 stroke-[3px]" /> Enroll New Child
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics Statistics Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-3xs flex flex-col justify-between hover:shadow-2xs transition text-left min-w-0 relative overflow-hidden">
                {/* SVG Light Grid background */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.03] select-none pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="admin-grid-1" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#4F46E5" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#admin-grid-1)" />
                </svg>

                <div className="flex justify-between items-center w-full min-w-0 relative z-10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider select-none font-sans truncate">Total Registers</span>
                  <span className="p-1 px-2.5 rounded-full bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-widest leading-none font-sans shrink-0">Roster</span>
                </div>
                <div className="flex items-baseline gap-1 mt-4 min-w-0 overflow-hidden relative z-10">
                  <span className="text-lg sm:text-xl xl:text-2xl font-black text-slate-800 tracking-tight truncate" title={stats.total.toString()}>{stats.total}</span>
                  <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest shrink-0">Pupils</span>
                </div>
                <div className="w-full h-1.5 bg-indigo-50 rounded-full mt-4 overflow-hidden select-none relative z-10">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: "100%" }} />
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-3xs flex flex-col justify-between hover:shadow-2xs transition text-left min-w-0 relative overflow-hidden">
                {/* SVG Subtle Waves background */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.04] select-none pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 40 Q 40 20, 80 40 T 160 40 T 240 40" fill="none" stroke="#10B981" strokeWidth="1.5" />
                  <path d="M0 48 Q 40 28, 80 48 T 160 48 T 240 48" fill="none" stroke="#10B981" strokeWidth="0.75" />
                </svg>

                <div className="flex justify-between items-center w-full min-w-0 relative z-10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider select-none font-sans truncate">Active Status</span>
                  <span className="p-1 px-2.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest leading-none font-sans shrink-0">Live</span>
                </div>
                <div className="flex items-baseline gap-1 mt-4 min-w-0 overflow-hidden relative z-10">
                  <span className="text-lg sm:text-xl xl:text-2xl font-black text-emerald-600 tracking-tight truncate" title={stats.active.toString()}>{stats.active}</span>
                  <span className="text-[10px] text-zinc-400 font-extrabold font-mono shrink-0">({stats.total > 0 ? Math.round((stats.active/stats.total)*100) : 0}%)</span>
                </div>
                <div className="w-full h-1.5 bg-emerald-50 rounded-full mt-4 overflow-hidden select-none relative z-10">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${stats.total > 0 ? (stats.active / stats.total) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-3xs flex flex-col justify-between hover:shadow-2xs transition text-left min-w-0 relative overflow-hidden">
                {/* SVG Concentric rings backdrop */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.03] select-none pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100%" cy="100%" r="60" fill="none" stroke="#7C3AED" strokeWidth="1" />
                  <circle cx="100%" cy="100%" r="40" fill="none" stroke="#7C3AED" strokeWidth="0.75" />
                </svg>

                <div className="flex justify-between items-center w-full min-w-0 relative z-10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans select-none truncate">Early Streams</span>
                  <span className="p-1 px-2.5 rounded-full bg-violet-50 text-violet-700 text-[9px] font-black uppercase tracking-widest leading-none font-sans font-black shrink-0">Toddlers</span>
                </div>
                <div className="flex items-baseline gap-1 mt-4 min-w-0 overflow-hidden relative z-10">
                  <span className="text-lg sm:text-xl xl:text-2xl font-black tracking-tight truncate" style={{ color: "#7C3AED" }} title={(stats.nurseryNum + stats.daycareNum).toString()}>{stats.nurseryNum + stats.daycareNum}</span>
                  <span className="text-[10px] text-violet-400 font-extrabold uppercase tracking-wide shrink-0">Nurs/DC</span>
                </div>
                <div className="w-full h-1.5 bg-violet-100/50 rounded-full mt-4 overflow-hidden select-none relative z-10">
                  <div className="h-full bg-[#7C3AED]" style={{ width: `${stats.total > 0 ? ((stats.nurseryNum + stats.daycareNum) / stats.total) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-3xs flex flex-col justify-between hover:shadow-2xs transition text-left min-w-0 relative overflow-hidden">
                {/* SVG Diagonal Lines backdrop */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.03] select-none pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="admin-lines-1" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#DB2777" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#admin-lines-1)" />
                </svg>

                <div className="flex justify-between items-center w-full min-w-0 relative z-10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans select-none truncate">Grade prep</span>
                  <span className="p-1 px-2.5 rounded-full bg-pink-50 text-pink-700 text-[9px] font-black uppercase tracking-widest leading-none font-sans font-black shrink-0">K-Level</span>
                </div>
                <div className="flex items-baseline gap-1 mt-4 min-w-0 overflow-hidden relative z-10">
                  <span className="text-lg sm:text-xl xl:text-2xl font-black text-pink-600 tracking-tight truncate" title={(stats.lkgNum + stats.ukgNum).toString()}>{stats.lkgNum + stats.ukgNum}</span>
                  <span className="text-[10px] text-pink-400 font-extrabold uppercase tracking-wide shrink-0">LKG/UKG</span>
                </div>
                <div className="w-full h-1.5 bg-pink-100/50 rounded-full mt-4 overflow-hidden select-none relative z-10">
                  <div className="h-full bg-[#DB2777]" style={{ width: `${stats.total > 0 ? ((stats.lkgNum + stats.ukgNum) / stats.total) * 105 : 0}%` }} />
                </div>
              </div>

            </div>

            {/* Smart Search, Section filters & Roster lists card */}
            <div className="bg-white rounded-[32px] border border-slate-100 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
              
              {/* Dynamic Filter Controls Center */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                  <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block animate-pulse" />
                    Enrolled Students Database Registry ({filteredStudents.length})
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10.5px] text-slate-450 font-bold select-none cursor-default">
                    Active Filters Enabled
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Smart Name Search Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search children name, roll, or father..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-xs font-semibold transition-all duration-200 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Course Dropdown Option */}
                  <div>
                    <select
                      value={selectedStudentClassFilter}
                      onChange={(e) => setSelectedStudentClassFilter(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-505/10 focus:border-indigo-500 cursor-pointer text-slate-705 transition-all duration-200 shadow-3xs"
                    >
                      <option value="ALL">All Educational Streams</option>
                      <option value="Nursery">Nursery Class</option>
                      <option value="LKG">LKG Class</option>
                      <option value="UKG">UKG Class</option>
                      <option value="Day Care">Day Care Program</option>
                      <option value="Pre-Nursery">Pre-Nursery Program</option>
                    </select>
                  </div>

                  {/* Status Dropdown Option */}
                  <div>
                    <select
                      value={selectedStudentStatusFilter}
                      onChange={(e) => setSelectedStudentStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-505/10 focus:border-indigo-500 cursor-pointer text-slate-705 transition-all duration-200 shadow-3xs"
                    >
                      <option value="ALL">All Account Statuses</option>
                      <option value="Active">Active Enrolled</option>
                      <option value="Inactive">Inactive/Withdrawn</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Roster Data List Container */}
              {filteredStudents.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/60 border border-dashed border-slate-200 rounded-3xl space-y-3">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-slate-400 mx-auto shadow-3xs border border-slate-100">
                    <GraduationCap className="w-7 h-7 text-indigo-400 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-extrabold text-[#334155] text-sm m-0">No records found matching filters</p>
                    <p className="text-[11px] text-slate-400 m-0">Try clearing search phrases or changing option stream dropdowns.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-[24px] border border-slate-150 shadow-3xs">
                  <table className="w-full text-sm text-left border-collapse m-0">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100 text-[10.5px] font-black text-slate-450 uppercase select-none tracking-wider">
                        <th className="p-4 pl-5 rounded-tl-2xl">Roll Code</th>
                        <th className="p-4">Student Profile Details</th>
                        <th className="p-4">Course Stream</th>
                        <th className="p-4">Guardian Contact</th>
                        <th className="p-4">Account Status</th>
                        <th className="p-4 text-center">Portal Credentials & Status</th>
                        {userRole !== "Staff" && <th className="p-4 rounded-tr-2xl text-right pr-5">Delete Profile</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredStudents.map((stud) => {
                        const avatarClass = getStudentAvatarTheme(stud.name);
                        const classBadge = getStudentClassBadgeStyle(stud.course);
                        const isActive = stud.status === "Active";

                        return (
                          <tr key={stud.id} className="hover:bg-slate-50/40 transition duration-200 group">
                            
                            {/* Roll number field block */}
                            <td className="p-4 pl-5">
                              <span className="font-mono font-black text-[11px] text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg select-all">
                                {stud.rollNo}
                              </span>
                            </td>

                            {/* Student Profile detailed block */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full ring-4 ring-offset-2 shrink-0 flex items-center justify-center font-black text-sm select-none shadow-sm ${avatarClass}`}>
                                  {stud.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                  <span className="font-extrabold text-slate-800 block text-xs group-hover:text-indigo-600 transition leading-tight">
                                    {stud.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 block mt-1 font-medium select-none">
                                    Age: {stud.age} yrs • Joined: {stud.enrollmentDate}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Course / Stream badge element */}
                            <td className="p-4">
                              <span className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl border select-none ${classBadge}`}>
                                {stud.course}
                              </span>
                            </td>

                            {/* Guardian detailed contact block */}
                            <td className="p-4 text-left">
                              <div className="space-y-1">
                                <span className="font-extrabold text-slate-700 block text-xs">
                                  👪 Mr. {stud.fatherName}
                                </span>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] text-slate-450 font-bold font-mono flex items-center gap-1 mt-0.5">
                                    <span>📱 {stud.contactPhone}</span>
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Clear account status switch marker */}
                            <td className="p-4 text-left">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wide select-none ${
                                  isActive 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-400"}`} />
                                {stud.status}
                              </span>
                            </td>

                            {/* Actions controls for student profile */}
                            <td className="p-4 text-center">
                              {userRole !== "Staff" ? (
                                <div className="inline-flex items-center gap-1.5 justify-center w-full">
                                  
                                  {/* Toggle Status action button with opacity options */}
                                  <button
                                    type="button"
                                    onClick={() => handleStudentStatusToggle(stud)}
                                    className={`px-3 py-2 rounded-xl font-black text-[10px] tracking-wide uppercase transition duration-200 border cursor-pointer ${
                                      isActive 
                                        ? "bg-white border-rose-200 hover:bg-rose-50/60 text-rose-600 hover:border-rose-300"
                                        : "bg-white border-emerald-200 hover:bg-emerald-50/60 text-emerald-600 hover:border-emerald-300"
                                    }`}
                                  >
                                    {isActive ? "🚫 Suspend" : "✅ Enroll"}
                                  </button>

                                  {/* Portal setup update option */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditParentsModal(stud)}
                                    className="px-3 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 font-extrabold text-[10px] cursor-pointer transition flex items-center gap-1.5 rounded-xl shadow-3xs"
                                    title="Edit parent custom login password link"
                                  >
                                    <KeyRound className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                    <span>Sync Access</span>
                                  </button>

                                </div>
                              ) : (
                                <span className="text-slate-405 font-bold text-[10.5px]">View Only (Admin managed)</span>
                              )}
                            </td>

                            {/* Delete child registers option */}
                            {userRole !== "Staff" && (
                              <td className="p-4 text-right pr-5">
                                {confirmDeleteStudentId === stud.id ? (
                                  <div className="flex items-center gap-1.5 justify-end animate-fadeIn">
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        await onDeleteStudent(stud.id);
                                        setConfirmDeleteStudentId(null);
                                      }}
                                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg shadow-3xs cursor-pointer transition-all"
                                      title="Confirm delete"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteStudentId(null)}
                                      className="px-2 py-1 bg-slate-200 hover:bg-slate-350 text-slate-700 font-extrabold text-[9px] uppercase tracking-wider rounded-lg cursor-pointer transition-all"
                                      title="Cancel delete"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteStudentId(stud.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-150 transition duration-200 cursor-pointer shadow-3xs hover:scale-105 active:scale-95"
                                    title="Delete Permanent"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            )}

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>
        );
      })()}

      {activeTab === "staff" && (() => {
        const sortedStaffList = [...staff].sort((a, b) => {
          const numA = parseInt(a.id.replace(/\D/g, ""), 10) || 0;
          const numB = parseInt(b.id.replace(/\D/g, ""), 10) || 0;
          return numB - numA;
        });

        const stats = (() => {
          let present = 0;
          let absent = 0;
          let late = 0;
          
          staff.forEach((stf) => {
            const marked = attendanceRecords.find(
              (a) => a.targetId === stf.id && a.date === currentDateStr && a.targetType === "staff"
            );
            const status = marked ? marked.status : "Present";
            if (status === "Present") present++;
            else if (status === "Absent") absent++;
            else if (status === "Late") late++;
          });
          
          const total = staff.length;
          const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
          return { present, absent, late, total, rate };
        })();

        const getAvatarInitials = (name: string) => {
          const clean = name.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s+/i, "");
          const parts = clean.split(" ");
          if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
          }
          return clean.slice(0, 2).toUpperCase();
        };

        const getAvatarColor = (role: string) => {
          switch (role) {
            case "Admin":
              return "bg-gradient-to-tr from-rose-500 to-pink-500 text-white ring-rose-200";
            case "Accountant":
              return "bg-gradient-to-tr from-blue-500 to-indigo-500 text-white ring-blue-200";
            default:
              return "bg-gradient-to-tr from-violet-500 to-purple-600 text-white ring-violet-200";
          }
        };

        const filteredStaff = sortedStaffList.filter((stf) => {
          if (selectedStaffRoleFilter !== "ALL" && stf.role !== selectedStaffRoleFilter) {
            return false;
          }
          
          const marked = attendanceRecords.find(
            (a) => a.targetId === stf.id && a.date === currentDateStr && a.targetType === "staff"
          );
          const status = marked ? marked.status : "Present";
          if (selectedStaffStatusFilter !== "ALL" && status !== selectedStaffStatusFilter) {
            return false;
          }

          if (staffSearchQuery.trim() !== "") {
            const q = staffSearchQuery.toLowerCase();
            return (
              stf.name.toLowerCase().includes(q) ||
              stf.email.toLowerCase().includes(q) ||
              stf.specialization.toLowerCase().includes(q) ||
              stf.role.toLowerCase().includes(q)
            );
          }
          return true;
        });

        return (
          <div className="space-y-8 animate-fadeIn" id="staff-workspace-root">
            {/* Colorful, modern banner with deep gradient */}
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 p-6 sm:p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
              <div className="absolute -top-24 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 border border-white/20 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                    Enrolled Roster Portal
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
                    Educators & Staff Daily Attendance
                  </h2>
                  <p className="text-xs sm:text-sm text-white/90 max-w-xl font-medium leading-relaxed">
                    Review and clock educators' presence logs, manage specializations, and access salaries. Changes synchronize instantly to child caregivers' workspaces.
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    onClick={() => setShowAddStaffModal(true)}
                    className="w-full sm:w-auto px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 active:scale-98 rounded-2xl font-black text-xs text-zinc-950 cursor-pointer shadow-[0_10px_20px_rgba(234,179,8,0.25)] hover:shadow-[0_12px_24px_rgba(234,179,8,0.35)] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 shrink-0 stroke-[3px]" /> Recruit Staff Member
                  </button>
                </div>
              </div>
            </div>

            {/* Quick KPIs stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-3xs flex flex-col justify-between items-start hover:shadow-2xs transition group">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Appointed</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-black text-slate-800">{stats.total}</span>
                  <span className="text-xs text-indigo-500 font-bold">Members</span>
                </div>
                <div className="w-full h-1 bg-indigo-500/20 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-indigo-500 w-full" />
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-3xs flex flex-col justify-between items-start hover:shadow-2xs transition text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Present Staff</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-black text-emerald-600">{stats.present}</span>
                  <span className="text-xs text-emerald-500 font-bold">On Duty</span>
                </div>
                <div className="w-full h-1 bg-emerald-500/20 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${stats.total > 0 ? (stats.present / stats.total) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-3xs flex flex-col justify-between items-start hover:shadow-2xs transition text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Late Arrival</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-black text-amber-600">{stats.late}</span>
                  <span className="text-xs text-amber-500 font-bold">Delayed</span>
                </div>
                <div className="w-full h-1 bg-amber-500/20 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${stats.total > 0 ? (stats.late / stats.total) * 100 : 0}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-3xs flex flex-col justify-between items-start hover:shadow-2xs transition text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Absentees Today</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-black text-rose-600">{stats.absent}</span>
                  <span className="text-xs text-rose-500 font-bold">Away</span>
                </div>
                <div className="w-full h-1 bg-rose-500/20 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-rose-500 animate-pulse" style={{ width: `${stats.total > 0 ? (stats.absent / stats.total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Panel: Staff Attendance logs list (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 shadow-md space-y-6">
                
                {/* Search & Filter Header block */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-sm font-black text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                      CLOCK-IN TIMELINE ({filteredStaff.length})
                    </h3>
                    <div className="text-xs font-bold text-slate-400">
                      Selected Date: <span className="font-extrabold text-indigo-600">{currentDateStr}</span>
                    </div>
                  </div>

                  {/* Search and Dropdown elements in grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search staff..."
                        value={staffSearchQuery}
                        onChange={(e) => setStaffSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-205 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 text-xs font-semibold transition"
                      />
                    </div>

                    {/* Role Filter Selector */}
                    <div>
                      <select
                        value={selectedStaffRoleFilter}
                        onChange={(e) => setSelectedStaffRoleFilter(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-205 bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-150/45 cursor-pointer text-slate-700 transition"
                      >
                        <option value="ALL">All Company Roles</option>
                        <option value="Staff">Teachers & Educators</option>
                        <option value="Accountant">Accountants</option>
                        <option value="Admin">Administrators</option>
                      </select>
                    </div>

                    {/* Status Filter Selector */}
                    <div>
                      <select
                        value={selectedStaffStatusFilter}
                        onChange={(e) => setSelectedStaffStatusFilter(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-205 bg-white text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-150/45 cursor-pointer text-slate-700 transition"
                      >
                        <option value="ALL">All Live Statuses</option>
                        <option value="Present">Present Today</option>
                        <option value="Absent">Absent Today</option>
                        <option value="Late">Late Arrival</option>
                      </select>
                    </div>

                  </div>
                </div>

                {filteredStaff.length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-3xl space-y-2">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 mx-auto shadow-3xs border border-slate-100">
                      <Users className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-705 text-sm">No match found inside register</p>
                      <p className="text-[11px] text-slate-400">Try modifying your filter or clear search queries.</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10.5px] font-black text-slate-450 uppercase select-none">
                          <th className="p-4">Educator / Staff</th>
                          <th className="p-4">Assigned Role</th>
                          <th className="p-4 text-center">Duty Status Toggles</th>
                          <th className="p-4 text-right">Payroll</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/60">
                        {filteredStaff.map((stf) => {
                          const marked = attendanceRecords.find(
                            (a) => a.targetId === stf.id && a.date === currentDateStr && a.targetType === "staff"
                          );
                          const status = marked ? marked.status : "Present";
                          const avColor = getAvatarColor(stf.role);

                          return (
                            <tr key={stf.id} className="hover:bg-indigo-50/15 transition duration-150 group">
                              
                              {/* Staff Info Column */}
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-black text-xs ring-4 ring-offset-2 ${avColor}`}>
                                    {getAvatarInitials(stf.name)}
                                  </div>
                                  <div className="text-left">
                                    <div className="flex items-center gap-1.5 leading-none">
                                      <span className="font-extrabold text-slate-800 block text-xs group-hover:text-indigo-900 transition">{stf.name}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingStaff(stf);
                                          setShowEditStaffModal(true);
                                        }}
                                        className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer hover:scale-110 active:scale-95 animate-fadeIn"
                                        title={`Edit profile details for ${stf.name}`}
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Dept: {stf.specialization}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Role Column */}
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  stf.role === "Admin" 
                                    ? "bg-rose-50 text-rose-700 border border-rose-100" 
                                    : stf.role === "Accountant" 
                                    ? "bg-blue-50 text-blue-700 border border-blue-105" 
                                    : "bg-violet-50 text-violet-700 border border-violet-105"
                                }`}>
                                  {stf.role === "Staff" ? "TEACHER" : stf.role}
                                </span>
                              </td>

                              {/* Status Control Column - Elegant, Colorful Segmented Controls with soft translucent hover feedback */}
                              <td className="p-4 text-center">
                                <div className="inline-flex gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-3xs select-none">
                                  {(["Present", "Absent", "Late"] as const).map((s) => {
                                    const isActive = status === s;
                                    let activeBg = "";
                                    let activeText = "";
                                    let opacityClass = "";
                                    
                                    if (isActive) {
                                      activeText = "text-white opacity-100 scale-100 font-extrabold";
                                      if (s === "Present") activeBg = "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_4px_12px_rgba(16,185,129,0.25)]";
                                      else if (s === "Absent") activeBg = "bg-gradient-to-r from-rose-500 to-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.25)]";
                                      else if (s === "Late") activeBg = "bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_4px_12px_rgba(245,158,11,0.25)]";
                                    } else {
                                      activeBg = "bg-transparent hover:bg-slate-200/50";
                                      activeText = "text-slate-400 hover:text-slate-700";
                                      // Make unselected options lightly visible (translucent) unless hovered for action choice selection
                                      opacityClass = "opacity-[0.22] hover:opacity-100 scale-[0.93] hover:scale-100";
                                    }

                                    return (
                                      <button
                                        key={s}
                                        type="button"
                                        onClick={() => handleStaffAttendToggle(stf.id, s)}
                                        className={`px-3 py-1.5 rounded-lg font-black text-[10px] cursor-pointer tracking-wider uppercase transition-all duration-300 active:scale-95 border-none ${activeBg} ${activeText} ${opacityClass}`}
                                      >
                                        {s}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>

                              {/* Salary Column */}
                              <td className="p-4 text-right font-black text-slate-700 font-mono text-xs">
                                ₹{stf.salary.toLocaleString("en-IN")}
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Right Panel: Staff Directory Register (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-6 shadow-md h-fit space-y-6 text-left">
                
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-805 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    <span>Direct Registry</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Quickly overview or remove staff profiles from the active systems database.
                  </p>
                </div>

                <div className="space-y-3 pr-1 max-h-[460px] overflow-y-auto">
                  {sortedStaffList.map((stf) => {
                    const initials = getAvatarInitials(stf.name);
                    const avColor = getAvatarColor(stf.role);

                    return (
                      <div 
                        key={stf.id} 
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs group hover:bg-white hover:shadow-xs hover:border-indigo-150 transition duration-250"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${avColor}`}>
                            {initials}
                          </div>
                          <div className="truncate text-left">
                            <span className="font-extrabold text-slate-750 block text-xs truncate">{stf.name}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{stf.email}</span>
                          </div>
                        </div>
                        {confirmDeleteStaffId === stf.id ? (
                          <div className="flex items-center gap-1.5 shrink-0 ml-1.5 animate-fadeIn">
                            <button
                              type="button"
                              onClick={async () => {
                                await onDeleteStaff(stf.id);
                                setConfirmDeleteStaffId(null);
                              }}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg shadow-3xs cursor-pointer transition-all"
                              title="Confirm registration removal"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteStaffId(null)}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-350 text-slate-700 font-extrabold text-[9px] uppercase tracking-wider rounded-lg cursor-pointer transition-all"
                              title="Cancel removal"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 shrink-0 ml-1.5 animate-fadeIn">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStaff(stf);
                                setShowEditStaffModal(true);
                              }}
                              className="p-2 text-slate-400 hover:text-indigo-650 bg-white hover:bg-indigo-55/70 border border-slate-150 rounded-xl cursor-pointer shadow-3xs hover:scale-105 active:scale-95 transition duration-150"
                              title={`Edit profile details for ${stf.name}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDeleteStaffId(stf.id);
                              }}
                              className="p-2 text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 border border-slate-150 rounded-xl cursor-pointer shadow-3xs hover:scale-105 active:scale-95 transition-all shrink-0"
                              title="Remove profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Additional system tip */}
                <div className="pt-2 border-t border-slate-100 space-y-2 text-[11px] text-slate-450 leading-relaxed">
                  <p className="font-extrabold text-indigo-950 uppercase tracking-wide text-[10px]/[1px]">Administrative Notice</p>
                  <p>Enrolling a staff member authorizes administrative credentials based on their delegated security access level.</p>
                </div>

              </div>
              
            </div>
          </div>
        );
      })()}

      {activeTab === "billing" && (() => {
        // Calculate billing statistics dynamically
        const billingStats = (() => {
          const totalInvoiced = billing.reduce((sum, b) => sum + b.totalAmount, 0);
          const totalPaid = billing.filter((b) => b.status === "Paid").reduce((sum, b) => sum + b.totalAmount, 0);
          const totalOutstanding = totalInvoiced - totalPaid;
          const paidPercentage = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;
          const unpaidCount = billing.filter((b) => b.status !== "Paid").length;
          return { totalInvoiced, totalPaid, totalOutstanding, paidPercentage, unpaidCount };
        })();

        return (
          <div className="space-y-8 animate-fadeIn text-left" id="billing-workspace">
            
            {/* Colorful interactive top header */}
            <div className="bg-gradient-to-r from-teal-600 via-emerald-600 via-teal-600 to-indigo-600 p-6 sm:p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden text-left">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-12 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider text-yellow-300">
                    <TrendingUp className="w-3.5 h-3.5 text-yellow-300" />
                    Horizon Billing & Ledger Engine
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-white m-0">
                    Receivables & Billing Center
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 max-w-xl font-medium leading-relaxed m-0">
                    Automate school invoices, track ledger payments, record UPI/offline clearings, and monitor overall cashflows instantly.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Statistics Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
              
              <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-3xs flex flex-col justify-between hover:shadow-2xs transition text-left">
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Total Invoiced</span>
                  <span className="p-1 px-2.5 rounded-full bg-slate-50 text-slate-700 text-[9px] font-black uppercase tracking-widest leading-none mb-1 shadow-3xs">Invoices</span>
                </div>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-xl sm:text-2xl font-black text-slate-805 font-mono">₹{billingStats.totalInvoiced.toLocaleString("en-IN")}</span>
                </div>
                <div className="w-full h-1.5 bg-indigo-50/70 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-indigo-505 bg-gradient-to-r from-indigo-500 to-indigo-600" style={{ width: "100%" }} />
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-3xs flex flex-col justify-between hover:shadow-2xs transition text-left">
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Payments Cleared</span>
                  <span className="p-1 px-2.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest leading-none mb-1 shadow-3xs">Cleared</span>
                </div>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">₹{billingStats.totalPaid.toLocaleString("en-IN")}</span>
                  <span className="text-[10.5px] text-emerald-500 font-black ml-1 select-none">({billingStats.paidPercentage}%)</span>
                </div>
                <div className="w-full h-1.5 bg-emerald-50 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-505 from-emerald-500 to-teal-500" style={{ width: `${billingStats.paidPercentage}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-3xs flex flex-col justify-between hover:shadow-2xs transition text-left">
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Pending Receivables</span>
                  <span className="p-1 px-2.5 rounded-full bg-rose-50 text-rose-700 text-[9px] font-black uppercase tracking-widest leading-none mb-1 shadow-3xs">Dues</span>
                </div>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-xl sm:text-2xl font-black text-rose-505 font-mono" style={{ color: "#EF4444" }}>₹{billingStats.totalOutstanding.toLocaleString("en-IN")}</span>
                </div>
                <div className="w-full h-1.5 bg-rose-50 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-red-500" style={{ width: `${100 - billingStats.paidPercentage}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-3xs flex flex-col justify-between hover:shadow-2xs transition text-left">
                <div className="flex justify-between items-center w-full">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 block">Unpaid Invoices</span>
                  <span className="p-1 px-2.5 rounded-full bg-amber-50 text-amber-705 text-[9px] font-black uppercase tracking-widest leading-none mb-1 shadow-3xs">Unpaid</span>
                </div>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="text-xl sm:text-2xl font-black text-amber-600 font-sans">{billingStats.unpaidCount}</span>
                  <span className="text-xs text-amber-500 font-extrabold ml-1">Bills</span>
                </div>
                <div className="w-full h-1.5 bg-amber-50 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400" style={{ width: `${billingStats.unpaidCount > 0 ? 100 : 0}%` }} />
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
              
              {/* Left panel: Bill Generator Form (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-[32px] border border-slate-100 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] h-fit space-y-6 text-left">
                
                <div className="text-left select-none">
                  <div className="inline-flex p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-3.5">
                    <CreditCard className="w-5 h-5 shrink-0" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none m-0">
                    Generate Student Bill
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-xs font-semibold leading-relaxed m-0">
                    Issues real-time outstanding ledger requests live to the client's parent platform.
                  </p>
                </div>

                <form onSubmit={handleGenerateInvoiceSubmit} className="space-y-4 text-xs font-semibold text-left">
                  
                  {/* Select target child */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-slate-450 font-black uppercase tracking-wider text-[9.5px] block">Select Target Enrolled Child</label>
                    <select
                      required
                      value={billingStudentId}
                      onChange={(e) => setBillingStudentId(e.target.value)}
                      className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-slate-705 transition cursor-pointer text-xs shadow-3xs"
                    >
                      <option value="">-- Choose child --</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.course})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Statement period term input */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-slate-450 font-black uppercase tracking-wider text-[9.5px] block">Statement Term Name</label>
                    <input
                      type="text"
                      required
                      value={billingTerm}
                      onChange={(e) => setBillingTerm(e.target.value)}
                      placeholder="e.g. June 2026 Tuition Term"
                      className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold transition text-xs shadow-3xs"
                    />
                  </div>

                  {/* Particulars billing lists */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black text-slate-450 uppercase tracking-widest text-[9px]">Particulars & Amounts:</span>
                      <button
                        type="button"
                        onClick={() => setBillingItems([...billingItems, { description: "", amount: 0 }])}
                        className="text-[10px] font-black tracking-wide text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 cursor-pointer select-none border-none bg-transparent"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3px]" /> Add Item Row
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {billingItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2 text-xs items-center animate-fadeIn text-left">
                          <input
                            type="text"
                            required
                            placeholder="e.g. Tuition Fee"
                            value={item.description}
                            onChange={(e) => {
                              const copy = [...billingItems];
                              copy[idx].description = e.target.value;
                              setBillingItems(copy);
                            }}
                            className="flex-1 p-2.5 rounded-xl border border-slate-205 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-semibold transition text-xs shadow-3xs"
                          />
                          <div className="relative w-28 shrink-0">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input
                              type="number"
                              required
                              placeholder="0"
                              value={item.amount === 0 ? "" : item.amount}
                              onChange={(e) => {
                                const copy = [...billingItems];
                                copy[idx].amount = parseFloat(e.target.value) || 0;
                                setBillingItems(copy);
                              }}
                              className="w-full pl-6 pr-2.5 py-2.5 rounded-xl border border-slate-205 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono font-black transition text-xs shadow-3xs"
                            />
                          </div>

                          {billingItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setBillingItems(billingItems.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition duration-155 cursor-pointer text-sm shrink-0 border-none bg-transparent flex items-center justify-center"
                              title="Delete Item"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Aggregate statement calculation math indicator with elegant gradient wrapper */}
                  <div className="p-4 bg-indigo-50/40 rounded-2xl flex justify-between items-center text-xs border border-indigo-100 shadow-3xs relative overflow-hidden text-left">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full blur-xl pointer-events-none" />
                    <span className="font-extrabold text-indigo-900">Total Billed Amt:</span>
                    <span className="font-mono font-black text-indigo-950 text-base relative z-10">
                      ₹{billingItems.reduce((acc, item) => acc + (parseFloat(item.amount as any) || 0), 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 text-white bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 hover:opacity-95 text-xs font-black uppercase tracking-widest rounded-2xl shadow-md transition duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-3 border-none"
                  >
                    <FileText className="w-4 h-4 stroke-[2.5px]" />
                    Proceed & Publish Bill
                  </button>

                </form>
              </div>

            {/* Right panel: Billing records & student fee ledgers (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-[32px] border border-slate-105 p-6 shadow-md h-full space-y-6 text-left">
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="text-left">
                  <h3 className="text-lg font-black text-slate-805 tracking-tight flex items-center gap-2 m-0">
                    <Receipt className="text-emerald-500 w-5 h-5 shrink-0" />
                    Horizon Receivables & Billing Center
                  </h3>
                  <p className="text-xs text-slate-450 mt-1 max-w-lg font-semibold leading-relaxed m-0">
                    Verify overall outstanding billing records, print ledger receipts, or issue manual payment clearances.
                  </p>
                </div>

                {/* Refined colorful active dual tabs switcher */}
                <div className="flex gap-1.5 p-1 bg-slate-100 border border-slate-205 rounded-2xl self-start sm:self-auto select-none">
                  <button
                    type="button"
                    onClick={() => setLedgerTab("students")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border-none ${
                      ledgerTab === "students"
                        ? "bg-white text-indigo-700 shadow-sm font-black"
                        : "text-slate-500 hover:text-slate-805 bg-transparent"
                    }`}
                  >
                    Summaries
                  </button>
                  <button
                    type="button"
                    onClick={() => setLedgerTab("invoices")}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer border-none ${
                      ledgerTab === "invoices"
                        ? "bg-white text-indigo-700 shadow-sm font-black"
                        : "text-slate-500 hover:text-slate-850 bg-transparent"
                    }`}
                  >
                    Issued Invoices
                  </button>
                </div>
              </div>

              {/* VIEW 1: STUDENT FEE SUMMARIES LEDGER */}
              {ledgerTab === "students" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl max-w-sm text-left focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 focus-within:bg-white transition duration-200">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search children..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="bg-transparent border-none text-xs font-bold focus:outline-none w-full text-slate-700 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="overflow-x-auto rounded-[24px] border border-slate-150 shadow-3xs">
                    <table className="w-full text-sm text-left border-collapse m-0">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 text-[10.5px] font-black text-slate-450 uppercase select-none tracking-wider">
                          <th className="p-4 pl-5">Student Profile</th>
                          <th className="p-4">Stream</th>
                          <th className="p-4 text-right">Total Fees</th>
                          <th className="p-4 text-right text-emerald-700">Paid Amount</th>
                          <th className="p-4 text-right text-rose-600">Pending Dues</th>
                          <th className="p-4 text-center rounded-tr-2xl pr-5">Ledger Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-705 bg-white">
                        {students
                          .filter((s) => s.name.toLowerCase().includes(studentSearch.toLowerCase()))
                          .map((student) => {
                            const studentBills = billing.filter((b) => b.studentId === student.id);
                            const totalFees = studentBills.reduce((sum, b) => sum + b.totalAmount, 0);
                            const paidFees = studentBills
                              .filter((b) => b.status === "Paid")
                              .reduce((sum, b) => sum + b.totalAmount, 0);
                            const unpaidFees = totalFees - paidFees;

                            return (
                              <tr key={student.id} className="hover:bg-slate-50/40 transition duration-155 group">
                                <td className="p-4 pl-5">
                                  <div className="text-left">
                                    <span className="font-extrabold text-slate-800 block text-xs group-hover:text-indigo-600 transition leading-tight">{student.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono font-black block mt-1 select-none">ID: {student.rollNo}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="inline-flex px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider bg-slate-50 border border-slate-205 text-slate-650 select-none">
                                    {student.course}
                                  </span>
                                </td>
                                <td className="p-4 text-right font-black text-slate-700 font-mono text-xs">
                                  ₹{totalFees.toLocaleString("en-IN")}
                                </td>
                                <td className="p-4 text-right font-black text-emerald-600 font-mono text-xs">
                                  ₹{paidFees.toLocaleString("en-IN")}
                                </td>
                                <td className="p-4 text-right font-black text-rose-500 font-mono text-xs">
                                  ₹{unpaidFees.toLocaleString("en-IN")}
                                </td>
                                <td className="p-4 text-center pr-5">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase font-black tracking-wider border select-none ${
                                      totalFees === 0
                                        ? "bg-slate-105 text-slate-500 border-slate-200"
                                        : unpaidFees === 0
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-rose-50 text-rose-750 border-rose-200"
                                    }`}
                                  >
                                    {totalFees === 0 ? (
                                      "Uninvoiced"
                                    ) : unpaidFees === 0 ? (
                                      <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Fully Cleared
                                      </>
                                    ) : (
                                      <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-550 bg-rose-500 animate-ping" />
                                        Overdue
                                      </>
                                    )}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 2: INDIVIDUAL INVOICES LOG */}
              {ledgerTab === "invoices" && (
                <div className="space-y-3.5 overflow-y-auto max-h-[500px] pr-1 animate-fadeIn text-left select-none">
                  {billing.length > 0 ? (
                    billing.slice().reverse().map((inv) => {
                      const customer = students.find((s) => s.id === inv.studentId);
                      const isPaid = inv.status === "Paid";
                      return (
                        <div
                          key={inv.id}
                          className="p-5 bg-slate-50/50 hover:bg-white rounded-[24px] border border-slate-100 hover:border-indigo-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs hover:shadow-[0_4px_20px_rgb(99,102,241,0.04)] transition-all duration-200 animate-fadeIn text-left font-semibold"
                        >
                          <div className="space-y-2 flex-1 text-left min-w-0">
                            <div className="flex items-center flex-wrap gap-2 text-left">
                              <span className="font-black text-indigo-600 font-mono bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-lg text-[10px] select-all">
                                #{inv.id}
                              </span>
                              <span className="text-slate-300 font-extrabold select-none">•</span>
                              <span className="font-black text-slate-800 truncate text-[12px]" title={customer ? customer.name : "Archived Pupil"}>
                                {customer ? customer.name : "Archived Pupil"}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black border tracking-wide select-none ${
                                  isPaid
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                }`}
                              >
                                {inv.status}
                              </span>
                              {inv.stripePaymentIntentId && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-mono rounded-lg border border-slate-200 select-all" title="Stripe Token">
                                  💳 {inv.stripePaymentIntentId}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap text-left">
                              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg select-none">
                                {inv.term}
                              </span>
                              <span className="text-[10px] h-3 w-px bg-slate-200 select-none" />
                              <p className="text-[10.5px] text-slate-400 font-bold m-0 font-sans select-none">
                                Due: <span className="font-extrabold text-slate-600">{inv.dueDate}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto shrink-0 justify-end">
                            <div className="text-left sm:text-right">
                              <span className="text-base font-black text-slate-800 block font-mono leading-none">
                                ₹{inv.totalAmount.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider mt-1.5 select-none">Invoice Total</span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                              {!isPaid ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => onPayInvoice(inv.id, "Cash")}
                                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 hover:opacity-95 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-3xs transition cursor-pointer shrink-0 border-none"
                                  >
                                    Cash
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onPayInvoice(inv.id, "UPI")}
                                    className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-600 hover:opacity-95 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-3xs transition cursor-pointer shrink-0 border-none"
                                  >
                                    UPI
                                  </button>
                                </>
                              ) : (
                                <span className="text-[9.5px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-block font-black uppercase tracking-wider select-none">
                                  Cleared Offline
                                </span>
                              )}

                              {/* Printable preview trigger */}
                              <button
                                type="button"
                                onClick={() => setPrintInvoice(inv)}
                                className="p-2 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl shadow-3xs transition cursor-pointer bg-white"
                                title="Print / PDF Invoice Details"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-16 text-center text-slate-450 text-xs font-bold bg-slate-50/60 border border-dashed border-slate-200 rounded-3xl space-y-2 select-none">
                      <p className="font-extrabold text-[#334155] text-sm m-0">No invoices published inside this ledger term</p>
                      <p className="text-[11px] text-slate-400 m-0">Select a student on the left panel to issue a brand new fee bill.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* VIEW INVOICE A5 PRINT-PREVIEW DISPLAY MODAL */}
          {printInvoice && createPortal(
            <div className="print-portal-wrapper fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto print:p-0 print:bg-white print:absolute print:inset-0">
              <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:w-full print:rounded-none" id="printable-invoice-modal">
                <style>{`
                  @media print {
                    @page {
                      size: A5 portrait;
                      margin: 0.5cm;
                    }
                    #root {
                      display: none !important;
                    }
                    body {
                      background: white !important;
                      margin: 0 !important;
                    }
                    .print-portal-wrapper {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      height: auto !important;
                      margin: 0 !important;
                      padding: 0 !important;
                      background: white !important;
                      z-index: 9999999 !important;
                      display: block !important;
                      overflow: visible !important;
                    }
                    #printable-invoice-modal {
                      width: 100% !important;
                      max-width: 100% !important;
                      height: auto !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      box-sizing: border-box !important;
                      background: white !important;
                      box-shadow: none !important;
                      border: none !important;
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                    }
                    .print\\:hidden {
                      display: none !important;
                    }
                  }
                `}</style>

                {/* Sub-Header: Printer controls (hidden in prints) */}
                <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex flex-col sm:flex-row gap-3 justify-between sm:items-center print:hidden select-none">
                  <div className="space-y-1">
                    <span className="font-extrabold text-xs text-indigo-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <Receipt className="w-4 h-4 text-indigo-600" /> Fee Receipt
                    </span>
                    <p className="text-[10px] text-indigo-600/80 font-bold">
                      💡 Active tab check: If the print window does not open, please click the "Open App" button in the top-right!
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={handlePrintInvoice}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-extrabold hover:bg-indigo-700 shadow-sm transition cursor-pointer flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                    </button>
                    <button
                      onClick={() => setPrintInvoice(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-extrabold hover:bg-gray-300 transition cursor-pointer"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>

                {/* HIGH-FIDELITY PRINTABLE INVOICE WRAPPER */}
                <div id="billing-receipt-print-area" className="p-6 space-y-4 text-[#2D3436] min-h-[210mm] flex flex-col justify-between bg-white">
                  {/* Part 1: Top Branding Header */}
                  <div>
                    <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-3">
                      <div>
                        {/* Dynamic colorful logo header layout with Arivu Foundation integration */}
                        <div className="flex items-center gap-4">
                          <HorizonLogo size="md" />
                          <div className="h-16 w-px bg-slate-300 self-center" />
                          <ArivuLogo 
                            className="h-[64px] object-contain select-[#f8fafc] select-none"
                          />
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[8px] px-2 py-0.5 bg-indigo-50 text-indigo-700 font-black tracking-widest rounded uppercase border border-indigo-100 block w-fit ml-auto mb-1">
                          OFFICIAL RECEIPT
                        </span>
                        <h4 className="text-xs font-extrabold text-gray-800">FEE INVOICE</h4>
                        <p className="font-mono text-gray-500 text-[9.5px] font-bold">Bill ref: #{printInvoice.id}</p>
                        <p className="font-semibold text-gray-500 text-[9px] mt-0.5">Date: {printInvoice.paidDate || printInvoice.dueDate}</p>
                      </div>
                    </div>

                    {/* Part 2: Two-column address meta grid */}
                    <div className="grid grid-cols-2 gap-6 text-[10.5px] pt-3">
                      <div>
                        <span className="text-gray-400 font-bold block mb-1 uppercase tracking-wider text-[8px]">ISSUED BY:</span>
                        <p className="font-extrabold text-indigo-950">Horizon International Tech Play School</p>
                        <p className="text-gray-500 text-[9.5px] leading-relaxed max-w-xs mt-0.5">
                          No 46, 1st Cross, Shri Veeranjaneya Temple Road, near SLR Packagings, Thirumalapura, Bengaluru, Karnataka 560073
                        </p>
                        <p className="text-gray-500 text-[9.5px] mt-1">E-mail: horizoninternational04@gmail.com</p>
                        <p className="text-gray-500 text-[9.5px]">Phone: +91 7353101553</p>
                      </div>

                      <div className="bg-indigo-50/30 border border-indigo-100/50 p-3 rounded-xl">
                        <span className="text-gray-400 font-bold block mb-1 uppercase tracking-wider text-[8px]">BILL TO STUDENT DETAILS:</span>
                        {(() => {
                          const child = students.find((s) => s.id === printInvoice.studentId);
                          return child ? (
                            <div className="space-y-0.5">
                              <p className="font-black text-indigo-900 text-xs">{child.name}</p>
                              <p className="text-gray-600 text-[9.5px]">
                                <span className="font-bold text-gray-400">Class Stream:</span> {child.course}
                              </p>
                              <p className="text-gray-600 text-[9.5px]">
                                <span className="font-bold text-gray-400">Roll/Register Ref:</span> {child.rollNo}
                              </p>
                              <p className="text-gray-600 text-[9.5px]">
                                <span className="font-bold text-gray-400">Primary Contact:</span> {child.fatherName}
                              </p>
                              <p className="text-gray-600 text-[9.5px]">
                                <span className="font-bold text-gray-400">Registered Phone:</span> {child.contactPhone}
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-500 font-extrabold">Archived Student Profile</p>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Part 3: Particulars Items Table */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden mt-4 text-[10.5px] shadow-2xs">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-indigo-600/10 text-indigo-950">
                          <tr className="border-b border-gray-200 font-bold">
                            <th className="p-2 font-black text-[9.5px] uppercase tracking-wide">Particular Description</th>
                            <th className="p-2 font-black text-[9.5px] uppercase tracking-wide text-right">Amount (INR)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {printInvoice.items.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-105 hover:bg-gray-50/50">
                              <td className="p-2 text-gray-700 font-bold">{item.description}</td>
                              <td className="p-2 text-gray-800 font-extrabold text-right font-mono">₹{item.amount.toLocaleString("en-IN")}.00</td>
                            </tr>
                          ))}
                          <tr className="bg-[#FAFAFB] border-t border-gray-200/50">
                            <td className="p-2 text-gray-500 font-bold text-right uppercase tracking-wider text-[9px]">
                              Particulars Invoice Subtotal:
                            </td>
                            <td className="p-2 text-gray-700 font-bold text-right font-mono">
                              ₹{printInvoice.totalAmount.toLocaleString("en-IN")}.00
                            </td>
                          </tr>
                          <tr className="bg-indigo-50 border-t-2 border-indigo-650">
                            <td className="p-2 text-slate-805 font-black text-right uppercase tracking-wider text-[9.5px]">
                              Aggregate Total Billed / Net Payable:
                            </td>
                            <td className="p-2 text-indigo-950 font-black text-right text-sm font-mono">
                              ₹{printInvoice.totalAmount.toLocaleString("en-IN")}.00
                            </td>
                          </tr>
                          <tr className="bg-emerald-50/40 border-t border-emerald-100/30">
                            <td className="p-2 text-emerald-800 font-bold text-right uppercase tracking-wider text-[9px]">
                              Total Fees Cleared / Paid:
                            </td>
                            <td className="p-2 text-emerald-700 font-extrabold text-right font-mono">
                              ₹{(printInvoice.status === "Paid" ? printInvoice.totalAmount : 0).toLocaleString("en-IN")}.00
                            </td>
                          </tr>
                          <tr className="bg-rose-50/40 border-t border-rose-100/30">
                            <td className="p-2 text-rose-800 font-bold text-right uppercase tracking-wider text-[9px]">
                              Unpaid Outstanding Balance:
                            </td>
                            <td className="p-2 text-rose-600 font-black text-right font-mono">
                              ₹{(printInvoice.status === "Paid" ? 0 : printInvoice.totalAmount).toLocaleString("en-IN")}.00
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Part 4: Bottom Colored Footer & Terms / Stamp Area */}
                  <div className="space-y-4 pt-3">
                    {/* Invoice policy notes & authentication seals */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-dashed border-gray-200 pt-3 text-[10.5px]">
                      <div className="space-y-1 flex-1">
                        <span className="text-gray-400 font-bold block uppercase tracking-wider text-[8px]">OFFLINE PAYMENT MODALITY:</span>
                        {printInvoice.status === "Paid" ? (
                          <div className="inline-flex items-center gap-1 text-emerald-750 font-extrabold uppercase bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-[9px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Paid & Settled
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-amber-705 font-extrabold uppercase bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg text-[9px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending Payment Clearance
                          </div>
                        )}
                        <p className="text-[9px] text-gray-500 max-w-sm leading-relaxed mt-1 font-sans">
                          Payment has been cleared via Cash at Reception OR direct UPI scan payment transfer securely.
                          Online payment via integrated Razorpay payment api key systems will be active starting next semester term.
                        </p>
                      </div>

                      {/* Official seal image decoration block */}
                      <div className="text-center shrink-0 min-w-[110px] select-none">
                        <div className="w-24 h-10 bg-gray-50 border border-dashed border-gray-200/80 rounded-lg flex flex-col items-center justify-center font-mono opacity-80 text-gray-400 text-[8px] uppercase tracking-wide mb-1 leading-none">
                          <span className="font-extrabold text-[7.5px] text-indigo-650">[ ARIVU SEAL ]</span>
                          <span className="text-[6.5px] mt-0.5 text-slate-400">Authenticated OK</span>
                        </div>
                        <span className="text-[8.5px] text-gray-400 block font-black uppercase tracking-wider">Authorized Stamp</span>
                      </div>
                    </div>

                    {/* Double-layered horizontal colorful accent lines */}
                    <div className="space-y-1">
                      <div className="h-1 bg-gradient-to-r from-orange-500 to-indigo-600 rounded" />
                      <div className="flex justify-between items-center text-[8.5px] text-[#A0AEC0] font-sans">
                        <span>© 2026 Horizon International Tech Systems. Bangalore. All rights reserved.</span>
                        <span className="text-indigo-600 font-bold block">Issued via vidyasagarpcg@gmail.com</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      );
    })()}

      {activeTab === "payroll" && (
        <div id="payroll-dashboard-container" className="space-y-6">
          {/* Header & Description */}
          <div className="bg-gradient-to-r from-indigo-950 to-[#2D3172] text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black flex items-center gap-2">
                <DollarSign className="w-7 h-7 text-indigo-400 shrink-0" /> Standard & Academic Payroll Panel
              </h3>
              <p className="text-xs text-slate-355 mt-1 max-w-xl">
                Manage full salaries, custom allowances, PF deductions, Loss of Pay adjustments & print crystal-clear A4 Payslips integrated with Horizon Tech & Arivu Education guidelines.
              </p>
            </div>
            <button
              onClick={openAddPayrollModal}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-1.5 self-start md:self-center cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Payroll Ledger
            </button>
          </div>

          {/* KPI Statistics */}
          {(() => {
            const totalRecords = payroll.length;
            const paidRecords = payroll.filter(p => p.status === "Paid");
            const pendingRecords = payroll.filter(p => p.status === "Pending");

            const totalCombined = payroll.reduce((sum, p) => sum + (p.netPayable || 0), 0);
            const totalPaidSum = paidRecords.reduce((sum, p) => sum + (p.netPayable || 0), 0);
            const totalPendingSum = pendingRecords.reduce((sum, p) => sum + (p.netPayable || 0), 0);

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-[#EBFDF5] border border-emerald-100 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="p-3.5 bg-emerald-500 rounded-2xl text-white">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-emerald-800 font-extrabold">Paid Salary Budget</p>
                    <p className="text-xl font-mono font-black text-emerald-950 mt-0.5">₹{totalPaidSum.toLocaleString("en-IN")}</p>
                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{paidRecords.length} staff cleared</p>
                  </div>
                </div>

                <div className="bg-[#FFF9EB] border border-amber-100 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="p-3.5 bg-amber-500 rounded-2xl text-white">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-amber-800 font-extrabold">Unpaid Pending Disbursals</p>
                    <p className="text-xl font-mono font-black text-amber-950 mt-0.5">₹{totalPendingSum.toLocaleString("en-IN")}</p>
                    <p className="text-[10px] text-amber-600 font-bold mt-0.5">{pendingRecords.length} staff pending</p>
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl shadow-sm flex items-center gap-4">
                  <div className="p-3.5 bg-indigo-600 rounded-2xl text-white">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-indigo-800 font-extrabold">Total Combined Ledger</p>
                    <p className="text-xl font-mono font-black text-indigo-950 mt-0.5">₹{totalCombined.toLocaleString("en-IN")}</p>
                    <p className="text-[10px] text-indigo-600 font-bold mt-0.5">{totalRecords} total entries tracked</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Search, Filter Bar */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search staff ledger entries..."
                value={payrollSearchQuery}
                onChange={e => setPayrollSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600/15"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-tight">Month:</span>
                <select
                  value={payrollFilterMonth}
                  onChange={e => setPayrollFilterMonth(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] font-black focus:outline-none"
                >
                  <option value="All">All Months</option>
                  <option value="June 2026">June 2026</option>
                  <option value="May 2026">May 2026</option>
                  <option value="April 2026">April 2026</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-tight">Status:</span>
                <select
                  value={payrollFilterStatus}
                  onChange={e => setPayrollFilterStatus(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] font-black focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid Only</option>
                  <option value="Pending">Pending Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          {(() => {
            const filteredPayroll = payroll.filter(pay => {
              const matchesSearch = pay.staffName.toLowerCase().includes(payrollSearchQuery.toLowerCase());
              const matchesMonth = payrollFilterMonth === "All" || pay.month === payrollFilterMonth;
              const matchesStatus = payrollFilterStatus === "All" || pay.status === payrollFilterStatus;
              return matchesSearch && matchesMonth && matchesStatus;
            });

            if (filteredPayroll.length === 0) {
              return (
                <div className="text-center py-12 bg-[#F8FAFC] border border-dashed border-slate-250 rounded-3xl">
                  <DollarSign className="w-10 h-10 text-slate-350 mx-auto opacity-75" />
                  <p className="font-extrabold text-slate-600 mt-2 text-sm">No payroll records matched the selected query</p>
                  <p className="text-slate-400 text-xs mt-1">Try relaxing filters or add a new entry above.</p>
                </div>
              );
            }

            return (
              <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-white">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F8FAFC] text-slate-800 text-[11.5px] font-extrabold uppercase tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="p-4 rounded-tl-2xl">Ledger ID</th>
                      <th className="p-4">Staff Member & Designation</th>
                      <th className="p-4 text-center">Month</th>
                      <th className="p-4 text-center">Base Salary + Allowances - Deducts</th>
                      <th className="p-4 text-center">Net Disbursed</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 rounded-tr-2xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-slate-700">
                    {filteredPayroll.map(pay => (
                      <tr key={pay.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-mono font-bold text-slate-400">#{pay.id}</td>
                        <td className="p-4">
                          <div className="font-black text-[#2D3172] text-[13px]">{pay.staffName}</div>
                          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight mt-0.5">{pay.role}</div>
                        </td>
                        <td className="p-4 text-center font-bold text-slate-600">{pay.month}</td>
                        <td className="p-4 text-center font-mono font-semibold text-slate-500">
                          ₹{pay.baseSalary} + ₹{pay.allowances} - ₹{pay.deductions}
                        </td>
                        <td className="p-4 text-center">
                          <div className="font-mono font-black text-slate-850 text-sm">
                            ₹{pay.netPayable.toLocaleString("en-IN")}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            pay.status === "Paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-600"
                          }`}>
                            {pay.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Clear Salary shortcut */}
                            {pay.status !== "Paid" && (
                              <button
                                onClick={() => handleClearSalary(pay)}
                                className="px-2.5 py-1.5 bg-emerald-500 text-white font-extrabold text-[10px] rounded-lg shadow-sm hover:bg-emerald-600 hover:scale-105 active:scale-95 transition cursor-pointer"
                                title="Clear payment"
                              >
                                Clear
                              </button>
                            )}

                            {/* Print Payslip button */}
                            <button
                              onClick={() => setViewingPayslip(pay)}
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-100 hover:scale-105 active:scale-95 transition flex items-center justify-center cursor-pointer"
                              title="Print / View A4 Slip"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit button */}
                            <button
                              onClick={() => openEditPayrollModal(pay)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg hover:scale-105 active:scale-95 transition flex items-center justify-center cursor-pointer"
                              title="Edit Payroll Ledger"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete button */}
                            {confirmDeletePayrollId === pay.id ? (
                              <div className="flex items-center gap-1 animate-fadeIn">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (onDeletePayroll) {
                                      await onDeletePayroll(pay.id);
                                    }
                                    setConfirmDeletePayrollId(null);
                                  }}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[8px] uppercase tracking-wider rounded-lg shadow-3xs cursor-pointer transition"
                                  title="Confirm delete ledger"
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeletePayrollId(null)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-extrabold text-[8px] uppercase tracking-wider rounded-lg cursor-pointer transition"
                                  title="Cancel delete"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeletePayrollId(pay.id)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg border border-rose-100 hover:scale-105 active:scale-95 transition flex items-center justify-center cursor-pointer"
                                title="Delete Entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}

          {/* CREATE / EDIT PAYROLL MODAL DIALOG */}
          {showPayrollModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-[32px] shadow-2xl border border-indigo-50 w-full max-w-2xl overflow-hidden transform transition-all p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {editingPayroll ? "Modify Ledger Disbursal" : "Configure Disbursal Dispatch Ledger"}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">Draft dynamic allowances, deductions, and calculate net payout securely</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPayrollModal(false)}
                    className="text-slate-450 hover:text-slate-700 text-base font-bold bg-slate-50 hover:bg-slate-100 h-8 w-8 rounded-full flex items-center justify-center transition cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSavePayrollSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    {/* Staff selection */}
                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-extrabold uppercase tracking-tight text-[10px]">Select Target Staff Member</label>
                      <select
                        value={payStaffId}
                        onChange={e => handlePayrollStaffChange(e.target.value)}
                        disabled={!!editingPayroll}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-850 font-black focus:outline-none"
                      >
                        {staff.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.role} - Active)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Choose Month */}
                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-extrabold uppercase tracking-tight text-[10px]">Salary Month / Cycle</label>
                      <select
                        value={payMonth}
                        onChange={e => setPayMonth(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-850 font-black focus:outline-none"
                      >
                        <option value="June 2026">June 2026</option>
                        <option value="May 2026">May 2026</option>
                        <option value="April 2026">April 2026</option>
                        <option value="March 2026">March 2026</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                    {/* EARNINGS SEGMENT */}
                    <div className="bg-[#F4FBF7] border border-emerald-100 rounded-2xl p-4 space-y-3">
                      <h4 className="font-extrabold text-[11px] text-emerald-800 uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Monthly Earnings Component (Cr)
                      </h4>
                      
                      <div className="space-y-3 font-semibold">
                        <div>
                          <label className="text-slate-500 text-[10px] block mb-1">Base / Basic Monthly Salary</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono">₹</span>
                            <input
                              type="number"
                              required
                              min="0"
                              value={payBaseSalary}
                              onChange={e => setPayBaseSalary(parseFloat(e.target.value) || 0)}
                              className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-mono font-bold focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 text-[10px] block mb-1">House Rent Allowance (HRA)</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono">₹</span>
                            <input
                              type="number"
                              value={payAllowanceHra}
                              onChange={e => setPayAllowanceHra(parseFloat(e.target.value) || 0)}
                              className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-mono font-bold focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 text-[10px] block mb-1">Conveyance / Transport Allowance</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono">₹</span>
                            <input
                              type="number"
                              value={payAllowanceConveyance}
                              onChange={e => setPayAllowanceConveyance(parseFloat(e.target.value) || 0)}
                              className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-mono font-bold focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 text-[10px] block mb-1">Play School Special Teaching Bonus</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono">₹</span>
                            <input
                              type="number"
                              value={payAllowanceSpecial}
                              onChange={e => setPayAllowanceSpecial(parseFloat(e.target.value) || 0)}
                              className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-mono font-bold focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DEDUCTIONS SEGMENT */}
                    <div className="bg-[#FFF8F8] border border-rose-100 rounded-2xl p-4 space-y-3">
                      <h4 className="font-extrabold text-[11px] text-rose-800 uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> Monthly Deductions Component (Dr)
                      </h4>

                      <div className="space-y-3 font-semibold">
                        <div>
                          <label className="text-slate-500 text-[10px] block mb-1">Provident Fund (EPF) Contribution</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono">₹</span>
                            <input
                              type="number"
                              value={payDeductionPf}
                              onChange={e => setPayDeductionPf(parseFloat(e.target.value) || 0)}
                              className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-mono font-bold focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 text-[10px] block mb-1">Professional Tax & TDS Deduction</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono">₹</span>
                            <input
                              type="number"
                              value={payDeductionTds}
                              onChange={e => setPayDeductionTds(parseFloat(e.target.value) || 0)}
                              className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-mono font-bold focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-500 text-[10px] block mb-1">Loss of Pay (LOP) / Unpaid Leaves</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-mono">₹</span>
                            <input
                              type="number"
                              value={payDeductionLop}
                              onChange={e => setPayDeductionLop(parseFloat(e.target.value) || 0)}
                              className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-mono font-bold focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* REALTIME POCKET CALC SHEET */}
                  {(() => {
                    const earningsSum = payBaseSalary + payAllowanceHra + payAllowanceSpecial + payAllowanceConveyance;
                    const deductionsSum = payDeductionPf + payDeductionTds + payDeductionLop;
                    const netPayoutVal = earningsSum - deductionsSum;

                    return (
                      <div className="bg-slate-100 rounded-2xl p-4 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 text-center md:text-left">
                        <div className="pb-3 md:pb-0 md:pr-4 flex-1">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Gross Earnings</span>
                          <span className="text-sm font-mono font-black text-emerald-600">₹{earningsSum.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="py-3 md:py-0 md:px-4 flex-1">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Total Deductions</span>
                          <span className="text-sm font-mono font-black text-rose-600">₹{deductionsSum.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="pt-3 md:pt-0 md:pl-4 flex-1">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Disbursable Net Amount</span>
                          <span className="text-base font-mono font-black text-indigo-950">₹{netPayoutVal.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* STATUS SELECT */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="space-y-1">
                      <label className="text-slate-500 font-extrabold uppercase tracking-tight text-[10px]">Disbursal Status</label>
                      <select
                        value={payStatus}
                        onChange={e => setPayStatus(e.target.value as any)}
                        className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-black focus:outline-none"
                      >
                        <option value="Pending">Pending / Approved</option>
                        <option value="Paid">Disbursed / Paid</option>
                      </select>
                    </div>

                    {payStatus === "Paid" && (
                      <div className="space-y-1">
                        <label className="text-slate-500 font-extrabold uppercase tracking-tight text-[10px]">Payment Settlement Date</label>
                        <input
                          type="date"
                          value={payPaidDate}
                          onChange={e => setPayPaidDate(e.target.value)}
                          className="w-full p-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-mono font-bold focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPayrollModal(false)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
                    >
                      {editingPayroll ? "Commit Ledger Update" : "Approve & Log Ledger Dispatch"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* PRINTABLE A4 PAYSLIP MODAL ADVOCACY PANEL */}
          {viewingPayslip && (
            <div className="print-payslip-overlay fixed inset-0 z-50 bg-[#1D2130]/60 backdrop-blur-md flex items-start justify-center p-4 overflow-y-auto">
              <div className="w-full max-w-4xl space-y-4 my-6 text-left">
                
                {/* Embedded dynamic print media override style sheet */}
                <style dangerouslySetInnerHTML={{__html: `
                  @media print {
                    body {
                      background: white !important;
                      margin: 0 !important;
                    }
                    /* Hide EVERYTHING else on page when print is invoked! */
                    body * {
                      visibility: hidden !important;
                    }
                    /* Buttress the visibility of the overlay and its descendants */
                    .print-payslip-overlay, .print-payslip-overlay * {
                      visibility: visible !important;
                    }
                    .print-payslip-overlay {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      height: auto !important;
                      background: white !important;
                      backdrop-filter: none !important;
                      -webkit-backdrop-filter: none !important;
                      padding: 0 !important;
                      margin: 0 !important;
                      box-shadow: none !important;
                      display: block !important;
                    }
                    /* Show ONLY the payslip sheet container and its descendants */
                    #printable-slip, #printable-slip * {
                      visibility: visible !important;
                    }
                    #printable-slip {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      padding: 1.5rem !important;
                      border: none !important;
                      box-shadow: none !important;
                    }
                    /* Ensure headers/footers do not overlap contents */
                    .no-print {
                      display: none !important;
                    }
                  }
                `}} />

                {/* Top Action Control Rail */}
                <div className="bg-slate-900 text-white p-4 rounded-3xl flex items-center justify-between shadow-2xl no-print">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className="text-xs font-black">Official Pay Slip Dispatch Advice</p>
                      <p className="text-[10px] text-slate-400">Press Print Slip to send to Printer or save as PDF (A4 Ratio Sheet Template)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { window.focus(); window.print(); }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition cursor-pointer"
                    >
                      <Printer className="w-4 h-4" /> Print Slip (A4 Sheet)
                    </button>
                    <button
                      onClick={() => setViewingPayslip(null)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 hover:scale-105 active:scale-95 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Close Advice
                    </button>
                  </div>
                </div>

                {/* The Paper Sheet Body (Styled to render exactly in standard A4 Aspect details) */}
                <div
                  id="printable-slip"
                  className="bg-white text-[#1E1E1E] rounded-3xl p-8 border border-slate-300 shadow-2xl relative w-full overflow-hidden mx-auto"
                  style={{ minHeight: "1050px" }}
                >
                  {/* Subtle Horizon watermark background */}
                  <div className="absolute inset-x-0 top-1/3 bottom-1/3 flex items-center justify-center opacity-4 pointer-events-none select-none">
                    <HorizonLogo size="lg" showText={false} />
                  </div>

                  {/* Header Advice Banner holding both logos side by side */}
                  <div className="border-b-4 border-double border-slate-800 pb-5 flex flex-col md:flex-row items-center md:items-stretch justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Left: Horizon Logo */}
                      <HorizonLogo size="md" showText={false} />
                      <div className="h-16 w-px bg-slate-350 self-center" />
                      {/* Right: Arivu Logo */}
                      <ArivuLogo 
                        className="h-[64px] object-contain select-[#f8fafc] select-none"
                      />
                    </div>
                    {/* Official address particulars */}
                    <div className="text-right flex flex-col justify-between max-w-sm">
                      <div className="text-right">
                        <h2 className="text-[17px] font-extrabold text-slate-905 uppercase tracking-wide leading-tight">
                          Horizon International Tech Play School
                        </h2>
                        <p className="text-[9px] text-[#555] font-black uppercase tracking-wider leading-none mt-1">
                          Under direction of Arivu foundation, Bangalore Karnataka
                        </p>
                        <p className="text-[8px] text-[#777] font-sans mt-1.5 leading-tight">
                          No 46, 1st Cross, Shri Veeranjaneya Temple Road, nearby SLR Packagings, Thirumalapura, Bengaluru - 560073
                        </p>
                      </div>
                      <div className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest mt-2">
                        REGISTERED CHARITABLE AND EDUCATIONAL TRUST
                      </div>
                    </div>
                  </div>

                  {/* Document Title Header block */}
                  <div className="bg-[#FAFBFD] border border-slate-200 rounded-xl my-6 p-4 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold uppercase tracking-widest text-[#2D3172] text-[12.5px] block">
                        SALARY DISBURSAL ADVICE & PAYSLIP
                      </span>
                      <span className="text-[9.5px] text-slate-500 font-semibold block mt-1 uppercase">
                        EPF RECORD & STATUTORY REMITTANCES
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-extrabold text-slate-800">Month: {viewingPayslip.month}</div>
                      <div className="font-mono text-[9px] text-slate-400 font-extrabold uppercase mt-0.5">Ledger Ref: #{viewingPayslip.id}</div>
                    </div>
                  </div>

                  {/* Employee Personnel Information Table */}
                  <div className="mb-6">
                    <h5 className="font-extrabold text-[10.5px] text-indigo-950 uppercase tracking-wider border-b border-slate-350 pb-1 mb-2">
                      EMPLOYEE PERSONNEL REGISTER & SERVICE FILE
                    </h5>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-4 text-[11px] font-semibold">
                      <div>
                        <span className="text-slate-450 uppercase block text-[8.5px] font-extrabold">Employee & ID</span>
                        <span className="text-slate-800 font-black text-xs">{viewingPayslip.staffName}</span>
                      </div>
                      <div>
                        <span className="text-slate-450 uppercase block text-[8.5px] font-extrabold">Designation & Role</span>
                        <span className="text-slate-700 font-black">{viewingPayslip.role}</span>
                      </div>
                      <div>
                        <span className="text-slate-450 uppercase block text-[8.5px] font-extrabold">Remittance System</span>
                        <span className="text-slate-600 font-bold uppercase">Electronic Transfer / Bank</span>
                      </div>
                      <div>
                        <span className="text-slate-450 uppercase block text-[8.5px] font-extrabold">Staff Record Match</span>
                        <span className="text-slate-600 font-bold font-mono uppercase">#{viewingPayslip.staffId || "STAFF_01"}</span>
                      </div>

                      {(() => {
                        const originalStaff = staff.find(s => s.id === viewingPayslip.staffId);
                        return (
                          <>
                            <div>
                              <span className="text-slate-450 uppercase block text-[8.5px] font-extrabold">Joining Date</span>
                              <span className="text-slate-600 font-bold font-mono">{originalStaff?.joiningDate || "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-slate-450 uppercase block text-[8.5px] font-extrabold">Service Status</span>
                              <span className="text-emerald-600 font-bold uppercase">{originalStaff?.status || "Active"}</span>
                            </div>
                            <div>
                              <span className="text-slate-450 uppercase block text-[8.5px] font-extrabold">Email Service Address</span>
                              <span className="text-slate-600 font-mono text-[10px] truncate block">{originalStaff?.email || "EPF_remit@school.org"}</span>
                            </div>
                            <div>
                              <span className="text-slate-450 uppercase block text-[8.5px] font-extrabold">Phone Number</span>
                              <span className="text-slate-600 font-bold font-mono">{originalStaff?.phone || "N/A"}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Financial Components breakdown table */}
                  <div className="border border-slate-350 rounded-2xl overflow-hidden mb-6 text-xs bg-slate-50/20">
                    <div className="grid grid-cols-2 bg-[#2D3172] text-white p-2.5 font-extrabold uppercase tracking-wider text-[10px]">
                      <div>Earning Cr Head component</div>
                      <div>Deduction Dr Head component</div>
                    </div>

                    {(() => {
                      // Distribute HRA, Conveyance, Special based on total allowances
                      const allowances = viewingPayslip.allowances || 0;
                      const hra = Math.floor(allowances * 0.5);
                      const conv = Math.floor(allowances * 0.2);
                      const specAllowance = allowances - hra - conv;

                      const deductions = viewingPayslip.deductions || 0;
                      const epf = Math.min(deductions, 1800);
                      const tdsPT = Math.floor((deductions - epf) * 0.4);
                      const lop = deductions - epf - tdsPT;

                      return (
                        <div className="grid grid-cols-2 divide-x divide-slate-300 font-medium text-[11px] leading-relaxed">
                          {/* Earnings components details Column */}
                          <div className="p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-550 font-bold">1. Basic Fixed Base Salary</span>
                              <span className="font-mono text-slate-850 font-black">₹{viewingPayslip.baseSalary.toLocaleString("en-IN")}.00</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-550 font-bold">2. House Rent Allowance (HRA)</span>
                              <span className="font-mono text-slate-850 font-black">₹{hra.toLocaleString("en-IN")}.00</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-550 font-bold">3. Conveyance Allowance</span>
                              <span className="font-mono text-slate-850 font-black">₹{conv.toLocaleString("en-IN")}.00</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-550 font-bold">4. Special Play School Bonus Incentive</span>
                              <span className="font-mono text-slate-850 font-black">₹{specAllowance.toLocaleString("en-IN")}.00</span>
                            </div>
                            
                            <div className="border-t border-dashed border-slate-250 pt-2 flex justify-between font-extrabold text-[11.5px] text-emerald-800 mt-4 h-8 items-end">
                              <span>Gross Earnings Credit (A)</span>
                              <span className="font-mono">₹{(viewingPayslip.baseSalary + allowances).toLocaleString("en-IN")}.00</span>
                            </div>
                          </div>

                          {/* Deductions components details Column */}
                          <div className="p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-550 font-bold">1. Employees Provident Fund (EPF)</span>
                              <span className="font-mono text-slate-850 font-black">₹{epf.toLocaleString("en-IN")}.00</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-550 font-bold">2. Professional Tax / TDS</span>
                              <span className="font-mono text-slate-850 font-black">₹{tdsPT.toLocaleString("en-IN")}.00</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-550 font-bold">3. Unpaid Leaves / LOP Adjustments</span>
                              <span className="font-mono text-slate-850 font-black">₹{lop.toLocaleString("en-IN")}.00</span>
                            </div>
                            
                            {/* Empty spacing filler to align heights */}
                            <div className="h-4" />

                            <div className="border-t border-dashed border-slate-250 pt-2 flex justify-between font-extrabold text-[11.5px] text-rose-800 mt-4 h-8 items-end">
                              <span>Total Deductions Debit (B)</span>
                              <span className="font-mono">₹{deductions.toLocaleString("en-IN")}.00</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Double line Net Pay Summary bar */}
                  <div className="border-t-4 border-b-4 border-double border-slate-800 py-3 mb-6 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center px-4 font-black">
                    <div className="text-[12px] uppercase text-[#2D3172]">
                      Net Salary Settlement Disbursed (A - B):
                    </div>
                    <div className="text-lg font-mono text-indigo-950 font-black flex items-center gap-1 mt-1 md:mt-0">
                      ₹{viewingPayslip.netPayable.toLocaleString("en-IN")}.00
                    </div>
                  </div>

                  {/* In Words */}
                  <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] font-extrabold text-slate-700">
                    <span className="text-slate-450 uppercase tracking-widest text-[8.5px] block font-extrabold mb-1">
                      Disbursed Amount Spelled in Words:
                    </span>
                    <span className="text-indigo-955 block italic text-sm">
                      {amountInWords(viewingPayslip.netPayable)}
                    </span>
                  </div>

                  {/* Declaration terms and seals */}
                  <div className="text-[9.5px] text-slate-450 leading-relaxed space-y-1.5 mb-12 border-t border-slate-200 pt-3">
                    <p>
                      <strong>Remittance Protocol:</strong> Certified that all appropriate statutory declarations matching this payroll cycle ledger has been registered with appropriate trust accountants in compliance with Horizon International Play School & Arivu Charitable and Educational Trust requirements.
                    </p>
                    <p>
                      This is an authentic, system-signed pay disbursal sheet dispatched directly to the employee register record. Handheld signature constitutes secure, physical acknowledgement of remittance settlement.
                    </p>
                  </div>

                  {/* Two Signatures panel */}
                  <div className="grid grid-cols-2 gap-12 text-[10.5px] font-black text-slate-800 pt-6">
                    <div className="text-center space-y-12">
                      <div className="h-6 flex items-end justify-center">
                        <span className="font-mono text-emerald-705 italic border border-[#6BDCA8] bg-emerald-50 px-2 py-0.5 rounded text-[8.5px] font-extrabold rotate-[-3deg] select-none">
                          remitted electronic
                        </span>
                      </div>
                      <div className="border-t border-slate-450 pt-2 uppercase tracking-wide">
                        Recipient Signature (Employee)
                      </div>
                    </div>

                    <div className="text-center space-y-12 relative flex flex-col items-center">
                      <div className="h-6 flex items-end justify-center absolute -top-8 text-center select-none">
                        <span className="font-mono text-indigo-600 font-extrabold rotate-[2deg] text-[8.5px] uppercase border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 leading-none select-none">
                          <span className="text-[7.5px] text-indigo-650">[ ARIVU SEAL ]</span>
                        </span>
                      </div>
                      <div className="w-full border-t border-slate-450 pt-2 uppercase tracking-wide mt-auto">
                        Authorized Director Accounts (Horizon/Arivu)
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "weights" && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-md max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <Settings className="w-12 h-12 text-[#8E44AD] mx-auto animate-spin-slow" />
            <h3 className="text-lg font-black text-gray-800 mt-3">Global Grade Weighted Matrix</h3>
            <p className="text-xs text-gray-400">Configure report card letter grading tiers</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
            <div className="space-y-2">
              <label className="text-gray-500 font-bold block">Assigned Homework Weight (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={hwWeight}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setHwWeight(val);
                  setExWeight(100 - val);
                }}
                className="w-full p-3.5 rounded-xl border border-gray-250 bg-gray-50 focus:ring-2 focus:ring-[#8E44AD]/25 text-sm font-black font-mono text-indigo-950"
              />
            </div>

            <div className="space-y-2">
              <label className="text-gray-500 font-bold block">Annual / Term Exam Weight (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={exWeight}
                disabled
                className="w-full p-3.5 rounded-xl border border-gray-150 bg-gray-100 cursor-not-allowed font-black font-mono text-gray-400"
              />
              <span className="text-[10px] text-gray-400">Note: The system auto-resolves Exam weight dynamically so aggregate totals equal 100%.</span>
            </div>

            <button
              type="submit"
              className="w-full py-4 text-white font-extrabold bg-gradient-to-r from-[#8E44AD] to-[#3498DB] hover:shadow-lg rounded-2xl transition text-xs"
            >
              Update Global Grading System
            </button>
          </form>
        </div>
      )}

      {/* ACADEMIC GRADEBOOK VIEW PANEL */}
      {activeTab === "gradebook" && (() => {
        const gradedStudentIds = new Set(grades.map((g) => g.studentId));
        const totalGradedCount = gradedStudentIds.size;
        
        const averagePercentage = grades.length > 0
          ? Math.round(
              grades.reduce((acc, g) => {
                const wt = Math.round(
                  (g.homeworkScore * (globalWeights.homeworkWeight || 30) +
                    g.examScore * (globalWeights.examWeight || 70)) /
                    100
                );
                return acc + wt;
              }, 0) / grades.length
            )
          : 0;

        const excellentAchieversCount = grades.filter((g) => {
          const wt = Math.round(
            (g.homeworkScore * (globalWeights.homeworkWeight || 30) +
              g.examScore * (globalWeights.examWeight || 70)) /
              100
          );
          return wt >= 85;
        }).length;

        const subjectCount = new Set(grades.map((g) => g.subject)).size;

        const getStudentAvatarStyle = (name: string) => {
          const charCode = name.charCodeAt(0) || 65;
          const index = charCode % 5;
          switch (index) {
            case 0:
              return "bg-gradient-to-tr from-rose-400 via-pink-400 to-amber-300 text-white ring-2 ring-rose-100";
            case 1:
              return "bg-gradient-to-tr from-cyan-400 via-teal-500 to-indigo-500 text-white ring-2 ring-cyan-100";
            case 2:
              return "bg-gradient-to-tr from-emerald-450 via-teal-500 to-amber-200 text-white ring-2 ring-emerald-100";
            case 3:
              return "bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-300 text-white ring-2 ring-amber-100";
            default:
              return "bg-gradient-to-tr from-fuchsia-500 via-purple-600 to-pink-400 text-white ring-2 ring-fuchsia-100";
          }
        };

        const getClassBadgeColor = (course: string) => {
          const c = course.toLowerCase();
          if (c.includes("nursery")) return "bg-teal-50 text-teal-700 border-teal-150";
          if (c.includes("daycare") || c.includes("day_care") || c.includes("day care")) return "bg-violet-50 text-violet-700 border-violet-150";
          if (c.includes("lkg")) return "bg-orange-50 text-orange-700 border-orange-150";
          if (c.includes("ukg")) return "bg-sky-50 text-sky-700 border-sky-150";
          return "bg-slate-50 text-slate-700 border-slate-200";
        };

        return (
          <div className="space-y-8 animate-fadeIn">
            {/* STUNNING VIBRANT BANNER WITH GEOMETRIC PATTERNS */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-[#1E1B4B] to-slate-900 text-white p-8 rounded-[32px] border border-indigo-950 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Background gradient flares */}
              <div className="absolute inset-0 bg-radial-gradient from-indigo-500/15 to-transparent pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-cyan-400 to-indigo-600 opacity-20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
              
              {/* Geometric visual overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_28px] pointer-events-none select-none" />

              <div className="space-y-2 relative z-10 text-left">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-3 rounded-full bg-indigo-500/20 text-indigo-200 text-[9px] font-black uppercase tracking-widest leading-none border border-indigo-400/30">
                    Scholastic Desk
                  </span>
                  <span className="text-xs text-indigo-300 font-extrabold flex items-center gap-1 leading-none select-none">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Double Metric Weighted
                  </span>
                </div>
                <h2 className="text-3xl font-black font-sans tracking-tight text-white m-0">
                  Academic Gradebook
                </h2>
                <p className="text-sm text-indigo-200/90 max-w-xl leading-relaxed m-0 animate-fadeIn">
                  Empowering play-school staff to define criteria, generate instant AI cognitive evaluations, and publish gorgeous terminal records.
                </p>
              </div>

              <div className="relative z-10 shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => {
                    setEditingGrade(null);
                    setGrStudentId(students[0]?.id || "");
                    setGrRemarks("");
                    setGrHwScore(85);
                    setGrExScore(80);
                    setShowGradeModal(true);
                  }}
                  className="px-6 py-4 bg-gradient-to-r from-teal-400 via-emerald-500 to-indigo-500 text-white hover:brightness-105 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 border-none"
                >
                  <Plus className="w-4 h-4 stroke-[3px]" />
                  Add Student Grade Entry
                </button>
              </div>
            </div>

            {/* HIGH-FIDELITY COLORFUL DASHBOARD METRIC WIDGETS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* CARD 1: TOTAL GRADED */}
              <div className="p-5 bg-white border border-slate-150 rounded-3xl shadow-3xs text-left relative overflow-hidden group hover:border-[#1ABC9C]/40 transition duration-300 min-w-0">
                {/* SVG Light dot grid */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.03] select-none pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grades-dots" width="10" height="10" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1" fill="#1ABC9C" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grades-dots)" />
                </svg>

                <div className="absolute top-0 right-0 w-16 h-16 bg-[#1ABC9C]/5 rounded-bl-[40px] flex items-center justify-center text-[#1ABC9C] shrink-0">
                  <Users className="w-5 h-5 opacity-80" />
                </div>
                <div className="min-w-0 relative z-10">
                  <span className="text-[10px] text-slate-405 uppercase font-black tracking-wider select-none block truncate">Graded Pupils</span>
                  <p className="text-lg sm:text-xl xl:text-2xl font-mono font-black text-slate-800 m-0 mt-2 truncate tracking-tight" title={totalGradedCount.toString()}>{totalGradedCount}</p>
                </div>
                <div className="mt-3 text-[10px] text-slate-400 select-none truncate relative z-10">
                  Active graded profiles
                </div>
              </div>

              {/* CARD 2: CUMULATIVE AVERAGE */}
              <div className="p-5 bg-white border border-slate-150 rounded-3xl shadow-3xs text-left relative overflow-hidden group hover:border-indigo-400/40 transition duration-300 min-w-0">
                {/* SVG Light wave pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.04] select-none pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 45 Q 40 25, 80 45 T 160 45 T 240 45" fill="none" stroke="#4F46E5" strokeWidth="1" />
                </svg>

                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-[40px] flex items-center justify-center text-indigo-500 shrink-0">
                  <TrendingUp className="w-5 h-5 animate-pulse" />
                </div>
                <div className="min-w-0 relative z-10">
                  <span className="text-[10px] text-slate-405 uppercase font-black tracking-wider select-none block truncate">Class Average</span>
                  <p className="text-lg sm:text-xl xl:text-2xl font-mono font-black text-indigo-900 m-0 mt-2 truncate tracking-tight" title={`${averagePercentage}%`}>{averagePercentage}%</p>
                </div>
                <div className="mt-3.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden select-none relative z-10">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${averagePercentage}%` }} />
                </div>
              </div>

              {/* CARD 3: OUTSTANDING PERFORMERS */}
              <div className="p-5 bg-white border border-slate-150 rounded-3xl shadow-3xs text-left relative overflow-hidden group hover:border-amber-400/40 transition duration-300 min-w-0">
                {/* SVG light target concentric rings */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.03] select-none pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="90%" cy="90%" r="50" fill="none" stroke="#D97706" strokeWidth="1" />
                  <circle cx="90%" cy="90%" r="30" fill="none" stroke="#D97706" strokeWidth="0.75" />
                </svg>

                <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-[40px] flex items-center justify-center text-amber-500 shrink-0">
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <div className="min-w-0 relative z-10">
                  <span className="text-[10px] text-slate-405 uppercase font-black tracking-wider select-none block truncate">High Achievers</span>
                  <p className="text-lg sm:text-xl xl:text-2xl font-mono font-black text-slate-800 m-0 mt-2 truncate tracking-tight" title={excellentAchieversCount.toString()}>{excellentAchieversCount}</p>
                </div>
                <div className="mt-3 text-[10px] text-slate-400 select-none truncate relative z-10">
                  Scores marking <span className="font-bold text-amber-600">85%+ weighted</span>
                </div>
              </div>

              {/* CARD 4: TRACKED SUBJECTS */}
              <div className="p-5 bg-white border border-slate-150 rounded-3xl shadow-3xs text-left relative overflow-hidden group hover:border-pink-400/40 transition duration-300 min-w-0">
                {/* SVG light diagonal stripes */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.03] select-none pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grades-stripes" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#DB2777" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grades-stripes)" />
                </svg>

                <div className="absolute top-0 right-0 w-16 h-16 bg-pink-50 rounded-bl-[40px] flex items-center justify-center text-pink-500 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0 relative z-10">
                  <span className="text-[10px] text-slate-405 uppercase font-black tracking-wider select-none block truncate">Evaluated Disciplines</span>
                  <p className="text-lg sm:text-xl xl:text-2xl font-mono font-black text-slate-800 m-0 mt-2 truncate tracking-tight" title={subjectCount.toString()}>{subjectCount}</p>
                </div>
                <div className="mt-3 text-[10px] text-slate-400 select-none truncate relative z-10">
                  Pediatric streams tracked
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Grade Matrix */}
              <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-150 p-6 shadow-3xs space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 select-none">
                  <h3 className="font-black text-slate-800 text-sm tracking-tight flex items-center gap-2 m-0 text-left">
                    <Award className="w-5 h-5 text-teal-500" /> Academic Performance Ledger
                  </h3>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-705 border border-indigo-150 font-mono">
                    {grades.length} Total Records
                  </span>
                </div>

                {grades.length === 0 ? (
                  <div className="text-center py-24 bg-slate-50/50 rounded-3xl border border-dashed border-slate-205 text-xs text-slate-400 space-y-2 select-none">
                    <p className="font-extrabold text-[#334155] text-sm m-0">No academic grades found</p>
                    <p className="text-[11px] text-slate-400 m-0">Click "Add Student Grade Entry" to register the first semester scoring metrics.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-[24px] border border-slate-100 shadow-3xs">
                    <table className="w-full text-left text-xs border-collapse font-sans m-0">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-505 font-extrabold select-none">
                          <th className="p-4 pl-5">Student Name</th>
                          <th className="p-4">Class</th>
                          <th className="p-4">Subject</th>
                          <th className="p-4">Term</th>
                          <th className="p-4 text-center header-homework">HW ({globalWeights.homeworkWeight || 30}%)</th>
                          <th className="p-4 text-center header-exam">Exam ({globalWeights.examWeight || 70}%)</th>
                          <th className="p-4 text-center">Weighted</th>
                          <th className="p-4 text-center">Grade</th>
                          <th className="p-4 text-right pr-5">Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-705 bg-white">
                        {grades.map((gr) => {
                          const sDetails = students.find((s) => s.id === gr.studentId);
                          const studentName = sDetails ? sDetails.name : "Unknown student";
                          const studentRoll = sDetails ? sDetails.rollNo : "N/A";
                          
                          const weighted = Math.round(
                            (gr.homeworkScore * (globalWeights.homeworkWeight || 30) +
                              gr.examScore * (globalWeights.examWeight || 70)) /
                              100
                          );

                          let lGrade = "F";
                          if (weighted >= 90) lGrade = "A+";
                          else if (weighted >= 80) lGrade = "A";
                          else if (weighted >= 70) lGrade = "B";
                          else if (weighted >= 60) lGrade = "C";
                          else if (weighted >= 50) lGrade = "D";

                          return (
                            <tr key={gr.id} className="hover:bg-slate-50/40 transition duration-150 group">
                              <td className="p-4 pl-5">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-[11px] font-sans shrink-0 uppercase select-none ${getStudentAvatarStyle(studentName)}`}>
                                    {studentName.charAt(0)}
                                  </div>
                                  <div className="text-left">
                                    <span className="font-extrabold text-slate-800 block text-xs group-hover:text-indigo-600 transition leading-tight">
                                      {studentName}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono font-black block mt-0.5 select-none">
                                      ID: {studentRoll}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-left">
                                <span className={`inline-flex px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border select-none ${getClassBadgeColor(gr.course)}`}>
                                  {gr.course}
                                </span>
                              </td>
                              <td className="p-4 text-left font-bold text-slate-700 min-w-[120px]">
                                <span className="block truncate max-w-[150px]" title={gr.subject}>
                                  {gr.subject}
                                </span>
                              </td>
                              <td className="p-4 text-left">
                                <span className="inline-flex px-2.5 py-0.5 rounded-lg text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-150 uppercase tracking-wider font-mono select-none">
                                  {gr.academicTerm}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <span className="font-mono font-black text-slate-800 text-xs">{gr.homeworkScore}</span>
                              </td>
                              <td className="p-4 text-center">
                                <span className="font-mono font-black text-slate-800 text-xs">{gr.examScore}</span>
                              </td>
                              <td className="p-4 text-center font-black text-indigo-900 font-mono text-xs">
                                {weighted}%
                              </td>
                              <td className="p-4 text-center">
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-black select-none ${
                                  lGrade.startsWith("A") ? "bg-emerald-50 text-emerald-600 border border-emerald-205" :
                                  lGrade.startsWith("B") ? "bg-indigo-50 text-indigo-600 border border-indigo-205" :
                                  lGrade.startsWith("C") ? "bg-amber-50 text-amber-600 border border-amber-205" :
                                  "bg-rose-50 text-rose-600 border border-rose-205"
                                }`}>
                                  {lGrade}
                                </span>
                              </td>
                              <td className="p-4 text-right pr-5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingGrade(gr);
                                    setGrStudentId(gr.studentId);
                                    setGrTerm(gr.academicTerm as any);
                                    setGrSubject(gr.subject);
                                    setGrHwScore(gr.homeworkScore);
                                    setGrExScore(gr.examScore);
                                    setGrRemarks(gr.remarks || "");
                                    setShowGradeModal(true);
                                  }}
                                  className="p-2 border border-slate-150 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 text-slate-505 rounded-xl transition shadow-3xs cursor-pointer"
                                  title="Edit Term Grades"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Right Column: Weights Metric Board & Report Card */}
              <div className="space-y-6">
                
                {/* WEIGHTS BOARD CARD */}
                <div className="bg-white rounded-[32px] border border-slate-150 p-6 shadow-3xs space-y-4">
                  <h3 className="font-black text-slate-800 text-xs tracking-wider uppercase m-0 leading-none select-none text-left">
                    Grading Metric Config
                  </h3>
                  
                  <div className="text-xs space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="space-y-1.5 text-left">
                      <div className="flex justify-between items-center text-slate-500 font-bold select-none">
                        <span>Homework Criteria Weight:</span>
                        <span className="font-mono text-slate-800 font-black">{globalWeights.homeworkWeight}%</span>
                      </div>
                      <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden select-none">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" style={{ width: `${globalWeights.homeworkWeight}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <div className="flex justify-between items-center text-slate-500 font-bold select-none">
                        <span>Term Exam Criteria Weight:</span>
                        <span className="font-mono text-slate-800 font-black">{globalWeights.examWeight}%</span>
                      </div>
                      <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden select-none">
                        <div className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full" style={{ width: `${globalWeights.examWeight}%` }} />
                      </div>
                    </div>

                    <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between items-center select-none">
                      <span className="text-[10px] text-slate-400 font-bold">Consolidated:</span>
                      <span className="text-[10px] text-emerald-600 font-black flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 100% Balanced Metric
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("weights")}
                    className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black rounded-xl transition cursor-pointer border-none"
                  >
                    Adjust Grading Weights Matrix
                  </button>
                </div>

                {/* TERM REPORT CARD ENGINE */}
                <div className="bg-white rounded-[32px] border border-slate-150 p-6 shadow-3xs space-y-4 text-left">
                  <h3 className="font-black text-slate-800 text-xs tracking-wider uppercase flex items-center gap-1.5 m-0 leading-none select-none">
                    <Printer className="w-4 h-4 text-[#8E44AD]" /> Academic Report Card
                  </h3>
                  <p className="text-[11px] text-slate-400 m-0 leading-relaxed select-none">
                    Select a student profile to compile a beautifully structured, official Play School report card.
                  </p>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-slate-500 font-bold block select-none">Target Student Profile</label>
                      <select
                        value={selectedReportCardStudentId || ""}
                        onChange={(e) => setSelectedReportCardStudentId(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white text-xs text-slate-800 font-black bg-slate-50 focus:outline-none"
                      >
                        <option value="">-- Pick student profile --</option>
                        {students.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} ({st.course})
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedReportCardStudentId && (() => {
                      const student = students.find((s) => s.id === selectedReportCardStudentId);
                      const studentGrades = grades.filter((g) => g.studentId === selectedReportCardStudentId);

                      if (!student) return null;

                      return (
                        <div className="pt-1 animate-fadeIn">
                          {studentGrades.length === 0 ? (
                            <div className="text-center p-5 bg-orange-50 border border-orange-200 text-[10px] text-orange-705 rounded-2xl select-none leading-relaxed">
                              No grade records posted for this child yet. Register academic grades first.
                            </div>
                          ) : (
                            <div className="p-5 border border-dashed border-indigo-200 bg-indigo-50/25 rounded-2xl space-y-4 relative overflow-hidden">
                              
                              <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-400/5 rounded-full blur-xl pointer-events-none" />

                              <div className="text-center border-b border-dashed border-indigo-200 pb-3.5 select-none relative z-10">
                                <h4 className="font-extrabold text-indigo-950 text-xs uppercase m-0 tracking-wide">
                                  Horizon Play School
                                </h4>
                                <p className="text-[9px] text-indigo-505 text-indigo-500 tracking-widest font-black uppercase m-0 mt-1">
                                  Official Term Report
                                </p>
                                <div className="mt-3 text-left space-y-1 text-[10px] text-slate-500 font-bold bg-white/70 p-2.5 rounded-xl border border-indigo-100/50">
                                  <p className="m-0 flex justify-between">Name: <span className="text-indigo-950 font-black">{student.name}</span></p>
                                  <p className="m-0 flex justify-between">Roll ID: <span className="text-indigo-950 font-mono font-bold">{student.rollNo}</span></p>
                                  <p className="m-0 flex justify-between">Stream: <span className="text-indigo-950 font-black">{student.course}</span></p>
                                </div>
                              </div>

                              <div className="space-y-2 text-[10px] max-h-[190px] overflow-y-auto pr-1">
                                {studentGrades.map((sg) => {
                                  const weighted = Math.round(
                                    (sg.homeworkScore * (globalWeights.homeworkWeight || 30) +
                                      sg.examScore * (globalWeights.examWeight || 70)) /
                                      100
                                  );

                                  let lGrade = "F";
                                  if (weighted >= 90) lGrade = "A+";
                                  else if (weighted >= 80) lGrade = "A";
                                  else if (weighted >= 70) lGrade = "B";
                                  else if (weighted >= 60) lGrade = "C";
                                  else if (weighted >= 50) lGrade = "D";

                                  return (
                                    <div
                                      key={sg.id}
                                      className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-start gap-2 shadow-3xs"
                                    >
                                      <div className="space-y-1 text-left flex-1 min-w-0">
                                        <p className="font-extrabold text-slate-800 m-0 truncate" title={sg.subject}>{sg.subject}</p>
                                        <p className="text-[8px] text-slate-400 font-bold m-0 leading-none">
                                          Homework: {sg.homeworkScore} | Exam: {sg.examScore}
                                        </p>
                                        {sg.remarks && (
                                          <p className="text-[8.5px] leading-relaxed italic text-slate-505 text-slate-500 bg-slate-50/70 border border-slate-100 p-1.5 rounded-lg mt-1.5 m-0 select-all">
                                            "{sg.remarks}"
                                          </p>
                                        )}
                                      </div>
                                      <div className="text-right shrink-0">
                                        <span className="font-mono font-black text-indigo-900 block text-xs">{weighted}%</span>
                                        <span className="text-[8.5px] font-black text-emerald-600 uppercase tracking-widest mt-0.5 block">{lGrade}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="pt-2 text-center select-none">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const printWin = window.open("", "_blank");
                                    if (printWin) {
                                      const totalGrades = studentGrades.length;
                                      const avgWeighted = Math.round(
                                        studentGrades.reduce((acc, current) => {
                                          const wt = Math.round(
                                            (current.homeworkScore * (globalWeights.homeworkWeight || 30) +
                                              current.examScore * (globalWeights.examWeight || 70)) /
                                              100
                                          );
                                          return acc + wt;
                                        }, 0) / totalGrades
                                      );

                                      let finalL = "F";
                                      if (avgWeighted >= 90) finalL = "A+";
                                      else if (avgWeighted >= 80) finalL = "A";
                                      else if (avgWeighted >= 70) finalL = "B";
                                      else if (avgWeighted >= 60) finalL = "C";
                                      else if (avgWeighted >= 50) finalL = "D";

                                      printWin.document.write(`
                                        <html>
                                          <head>
                                            <title>Report Card - ${student.name}</title>
                                            <style>
                                              @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@700&display=swap');
                                              @page { size: A5 landscape; margin: 12mm; }
                                              body { font-family: 'Space Grotesk', sans-serif; color: #1E293B; font-size: 11px; padding: 18px; border: 4px double #4F46E5; border-radius: 12px; background: #FAFDFB; }
                                              .header { text-align: center; border-bottom: 2px dashed #4F46E5; margin-bottom: 12px; padding-bottom: 8px; }
                                              h4, h2 { margin: 0; font-size: 18px; color: #1E1B4B; letter-spacing: -0.5px; font-weight: 700; }
                                              .meta { display: flex; justify-content: space-between; margin-bottom: 14px; font-weight: 700; font-size: 10px; color: #475569; text-transform: uppercase; }
                                              table { width: 100%; border-collapse: collapse; margin-bottom: 15px; background: white; }
                                              th, td { border: 1px solid #CBD5E1; padding: 7px; text-align: left; font-size: 10px; }
                                              th { background-color: #F8FAFC; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                                              .footer { display: flex; justify-content: space-between; margin-top: 18px; font-weight: 700; border-top: 2px dashed #CBD5E1; padding-top: 10px; font-size: 10px; }
                                              .stamp { border: 1.5px solid #059669; color: #059669; display: inline-block; padding: 3px 6px; font-size: 8px; margin-top: 6px; border-radius: 6px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }
                                              p.remark { font-style: italic; color: #64748B; margin: 3px 0 0 0; font-size: 8.5px; line-height: 1.3; }
                                              .badge { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #4F46E5; }
                                            </style>
                                          </head>
                                          <body>
                                            <div class="header">
                                              <h2>Horizon International Play School</h2>
                                              <div style="font-size: 9px; font-weight: 700; letter-spacing: 2.5px; color: #EC4899; margin-top: 3px; text-transform: uppercase;">Official Scholastic Certificate of Progress</div>
                                            </div>
                                            <div class="meta">
                                              <div>STUDENT: <span style="color:#1E1B4B">${student.name}</span></div>
                                              <div>ROLL NO: <span class="badge">${student.rollNo}</span></div>
                                              <div>CLASS STREAM: <span style="color:#1E1B4B">${student.course}</span></div>
                                            </div>
                                            <table>
                                              <thead>
                                                <tr>
                                                  <th>Subject Module / Pediatric Domain</th>
                                                  <th>HW (${globalWeights.homeworkWeight || 30}%)</th>
                                                  <th>Exam (${globalWeights.examWeight || 70}%)</th>
                                                  <th>Weighted Result</th>
                                                  <th>Domain Grade</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                ${studentGrades
                                                  .map((sg) => {
                                                    const weighted = Math.round(
                                                      (sg.homeworkScore * (globalWeights.homeworkWeight || 30) +
                                                        sg.examScore * (globalWeights.examWeight || 70)) /
                                                        100
                                                    );
                                                    let sgLetter = "F";
                                                    if (weighted >= 90) sgLetter = "A+";
                                                    else if (weighted >= 80) sgLetter = "A";
                                                    else if (weighted >= 70) sgLetter = "B";
                                                    else if (weighted >= 60) sgLetter = "C";
                                                    else if (weighted >= 50) sgLetter = "D";

                                                    return `
                                                      <tr>
                                                        <td>
                                                          <strong>${sg.subject}</strong>
                                                          ${
                                                            sg.remarks
                                                              ? `<p class="remark">Feedback: "${sg.remarks}"</p>`
                                                              : ""
                                                          }
                                                        </td>
                                                        <td>${sg.homeworkScore}%</td>
                                                        <td>${sg.examScore}%</td>
                                                        <td class="badge">${weighted}%</td>
                                                        <td style="font-weight: 700; color: #10B981;">${sgLetter}</td>
                                                      </tr>
                                                    `;
                                                  })
                                                  .join("")}
                                              </tbody>
                                            </table>
                                            <div class="footer">
                                              <div>
                                                AGGREGATE WEIGHTED SUM: <span class="badge" style="font-size:12px">${avgWeighted}%</span> [ RATING: <span style="color:#EC4899">${finalL}</span> ]
                                                <br />
                                                <span class="stamp">OFFICIAL VERIFIED RECORD</span>
                                              </div>
                                              <div style="text-align: right; margin-top: 10px; font-size: 9px; color: #64748B;">
                                                _______________________________
                                                <br />
                                                Registrar Office signature stamp
                                              </div>
                                            </div>
                                            <script>window.print();</script>
                                          </body>
                                        </html>
                                      `);
                                      printWin.document.close();
                                    }
                                  }}
                                  className="w-full py-3 bg-indigo-600 hover:bg-slate-900 font-extrabold text-[#F0F2F5] text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-3xs transition border-none"
                                >
                                  <Printer className="w-3.5 h-3.5" /> Generate & Print Report Card (A5)
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* HOMEWORK & ACTIVITIES SCHEDULER VIEW PANEL */}
      {activeTab === "homework" && (() => {
        // Internal helper to tag play activities based on keyword attributes
        const getLearningDomains = (title: string, desc: string) => {
          const t = (title + " " + desc).toLowerCase();
          const domains: { label: string; bg: string; border: string }[] = [];
          
          if (t.includes("clay") || t.includes("scissor") || t.includes("cut") || t.includes("glue") || t.includes("trace") || t.includes("draw") || t.includes("color") || t.includes("paint") || t.includes("motor") || t.includes("write") || t.includes("craft")) {
            domains.push({ label: "👐 Fine Motor Skills", bg: "bg-pink-50 text-pink-700", border: "border-pink-250/60" });
          }
          if (t.includes("count") || t.includes("math") || t.includes("number") || t.includes("shape") || t.includes("size") || t.includes("pattern") || t.includes("match") || t.includes("weight")) {
            domains.push({ label: "🧠 Cognitive Science", bg: "bg-amber-50 text-amber-700", border: "border-amber-250/60" });
          }
          if (t.includes("talk") || t.includes("sound") || t.includes("letter") || t.includes("read") || t.includes("word") || t.includes("phonic") || t.includes("story") || t.includes("speech") || t.includes("song")) {
            domains.push({ label: "🗣️ Phonics & Language", bg: "bg-sky-50 text-sky-700", border: "border-sky-250/60" });
          }
          if (t.includes("nature") || t.includes("plant") || t.includes("leaf") || t.includes("stone") || t.includes("water") || t.includes("discover") || t.includes("sand") || t.includes("sensory") || t.includes("feel")) {
            domains.push({ label: "🔍 Sensory Discovery", bg: "bg-teal-50 text-teal-700", border: "border-teal-250/60" });
          }
          if (t.includes("friend") || t.includes("empathy") || t.includes("share") || t.includes("help") || t.includes("family") || t.includes("feel") || t.includes("social") || t.includes("clean")) {
            domains.push({ label: "❤️ Socio-Emotional", bg: "bg-rose-50 text-rose-700", border: "border-rose-250/60" });
          }
          if (domains.length === 0) {
            domains.push({ label: "🌟 Early Childhood Play", bg: "bg-indigo-50 text-indigo-700", border: "border-indigo-250/60" });
          }
          return domains;
        };

        const getClassPalette = (course: string) => {
          switch(course) {
            case CourseType.NURSERY:
              return { bg: "bg-teal-50/40 hover:bg-teal-50/70 border-teal-200", border: "border-teal-200", text: "text-teal-800", rawAccent: "teal", pill: "bg-teal-100 text-teal-800 border-teal-200", badge: "bg-teal-500" };
            case CourseType.LKG:
              return { bg: "bg-violet-50/40 hover:bg-violet-50/70 border-violet-200", border: "border-violet-200", text: "text-violet-800", rawAccent: "violet", pill: "bg-violet-100 text-violet-800 border-violet-200", badge: "bg-violet-500" };
            case CourseType.UKG:
              return { bg: "bg-fuchsia-50/40 hover:bg-fuchsia-50/70 border-fuchsia-200", border: "border-fuchsia-200", text: "text-fuchsia-800", rawAccent: "fuchsia", pill: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200", badge: "bg-fuchsia-500" };
            default:
              return { bg: "bg-slate-50 hover:bg-slate-100 border-slate-200", border: "border-slate-200", text: "text-slate-800", rawAccent: "slate", pill: "bg-slate-100 text-slate-800 border-slate-200", badge: "bg-slate-500" };
          }
        };

        const filteredList = homework.filter(
          (h) => selectedHwClassFilter === "ALL" || h.course === selectedHwClassFilter
        );

        return (
          <div className="space-y-8 animate-fadeIn" id="homework-workspace-root">
            {/* Colorful & Modern Header Jumbotron with flowing multi-gradient */}
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 p-6 sm:p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
              <div className="absolute -top-24 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 border border-white/20 backdrop-blur-md rounded-full text-[11px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                    Homework & Learning Hub
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
                    Homework & Activities Hub
                  </h2>
                  <p className="text-xs sm:text-sm text-white/90 max-w-xl font-medium leading-relaxed">
                    Create sensory-guided early playing curricula & motor skill exercises. Parents receive these live instructions on their companion parent portal screens instantly.
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    onClick={() => {
                      setEditingHomework(null);
                      setHwTitle("");
                      setHwDesc("");
                      setHwActivities("");
                      setHwCourse(CourseType.NURSERY);
                      setShowHomeworkModal(true);
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-yellow-400 hover:bg-yellow-300 active:scale-98 rounded-2xl font-black text-xs text-zinc-950 cursor-pointer shadow-[0_10px_20px_rgba(234,179,8,0.25)] hover:shadow-[0_12px_24px_rgba(234,179,8,0.35)] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 shrink-0 stroke-[3px]" />
                    Create Daily Activities Bulletin
                  </button>
                </div>
              </div>
            </div>

            {/* Micro Dashboard Statistics Widget row with cute designs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-3xs flex flex-col justify-between items-start hover:shadow-2xs transition group">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Published</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-black text-slate-800">{homework.length}</span>
                  <span className="text-xs text-indigo-500 font-bold">Bulletins</span>
                </div>
                <div className="w-full h-1 bg-indigo-500/20 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-indigo-500 w-full" />
                </div>
              </div>
              
              <div className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-3xs flex flex-col justify-between items-start hover:shadow-2xs transition">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Nursery Class</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-black text-slate-800">
                    {homework.filter(h => h.course === CourseType.NURSERY).length}
                  </span>
                  <span className="text-xs text-teal-600 font-bold">Tasks</span>
                </div>
                <div className="w-full h-1 bg-teal-500/20 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-teal-500 w-1/2" />
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-3xs flex flex-col justify-between items-start hover:shadow-2xs transition">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">LKG Class</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-black text-slate-800">
                    {homework.filter(h => h.course === CourseType.LKG).length}
                  </span>
                  <span className="text-xs text-violet-600 font-bold">Tasks</span>
                </div>
                <div className="w-full h-1 bg-violet-500/20 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-violet-500 w-3/4" />
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-slate-100 p-4 shadow-3xs flex flex-col justify-between items-start hover:shadow-2xs transition">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">UKG Class</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-black text-slate-800">
                    {homework.filter(h => h.course === CourseType.UKG).length}
                  </span>
                  <span className="text-xs text-fuchsia-600 font-bold">Tasks</span>
                </div>
                <div className="w-full h-1 bg-fuchsia-500/20 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-fuchsia-500 w-[60%]" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Visual Guide & Instant Filters */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-6 shadow-md space-y-6">
                
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-indigo-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
                    Interactive Class Filter
                  </h3>
                  <p className="text-xs text-slate-450 leading-relaxed font-medium">
                    Filter by a specific grade curriculum to view and manage parents' sensory bulletin board feeds.
                  </p>
                </div>

                {/* Filter buttons selector */}
                <div className="flex flex-col gap-2.5">
                  {["ALL", CourseType.NURSERY, CourseType.LKG, CourseType.UKG].map((cr) => {
                    const isActive = selectedHwClassFilter === cr;
                    const itemsCount = cr === "ALL" ? homework.length : homework.filter(h => h.course === cr).length;
                    
                    let activeStyles = "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-100";
                    if (isActive) {
                      if (cr === "ALL") activeStyles = "bg-gradient-to-r from-slate-850 to-slate-900 text-white shadow-md border-transparent";
                      else if (cr === CourseType.NURSERY) activeStyles = "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-[0_5px_15px_rgba(20,184,166,0.25)] border-transparent";
                      else if (cr === CourseType.LKG) activeStyles = "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-[0_5px_15px_rgba(99,102,241,0.25)] border-transparent";
                      else if (cr === CourseType.UKG) activeStyles = "bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white shadow-[0_5px_15px_rgba(217,70,239,0.25)] border-transparent";
                    }

                    return (
                      <button
                        key={cr}
                        onClick={() => setSelectedHwClassFilter(cr)}
                        className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center text-xs font-extrabold transition-all duration-300 cursor-pointer ${activeStyles}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full ${isActive ? "bg-white" : "bg-indigo-505"}`} />
                          <span>{cr === "ALL" ? "All Class Bulletins" : `${cr} Class Feed`}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black ${
                          isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                        }`}>
                          {itemsCount}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Cognitive domain references list */}
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                    Cognitive Discovery Tips
                  </h4>
                  <div className="space-y-2.5 text-[11px] text-slate-500 font-medium leading-relaxed">
                    <div className="flex gap-2">
                      <span className="text-xs shrink-0">🎨</span>
                      <p>Focus on hand-eye sensory tasks like finger clay play & water colors.</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs shrink-0">🗣️</span>
                      <p>Keep verbal milestones realistic - phonic audio mimicking & rhythmic rhymes.</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs shrink-0">🤝</span>
                      <p>Promote safe cooperative at-home tasks (e.g. kid shares blocks with parents).</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Interactive feed list of bulletins */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 shadow-md space-y-6">
                
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-500" /> 
                    <span>Live Bulletins Active Feed ({filteredList.length})</span>
                  </h3>
                  <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 font-mono">
                    {selectedHwClassFilter === "ALL" ? "Showing All" : `${selectedHwClassFilter}`}
                  </span>
                </div>

                {filteredList.length === 0 ? (
                  <div className="text-center py-24 bg-slate-50 border border-dashed border-slate-200 rounded-3xl space-y-3">
                    <div className="w-14 h-14 bg-white shadow-3xs rounded-full flex items-center justify-center text-slate-400 mx-auto border border-slate-100">
                      <BookOpen className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-700 text-sm">No activity bulletins published</p>
                      <p className="text-[11.5px] text-slate-400 max-w-sm mx-auto font-medium">We couldn't locate any sensory homework entries for class "{selectedHwClassFilter}". Publish a new one to populate cards.</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingHomework(null);
                        setHwTitle("");
                        setHwDesc("");
                        setHwActivities("");
                        setHwCourse(selectedHwClassFilter !== "ALL" ? (selectedHwClassFilter as CourseType) : CourseType.NURSERY);
                        setShowHomeworkModal(true);
                      }}
                      className="inline-flex py-2 px-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-black transition cursor-pointer"
                    >
                      ✨ Author Homework Post
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredList.map((hw) => {
                      const palette = getClassPalette(hw.course);
                      const domains = getLearningDomains(hw.title, hw.description);

                      return (
                        <div 
                          key={hw.id} 
                          className={`group relative p-5 border rounded-[28px] transition-all duration-300 flex flex-col justify-between gap-4 shadow-3xs hover:shadow-sm ${palette.bg} ${palette.border}`}
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start gap-4">
                              {/* Roster course indicator with colored circle */}
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2.5 h-2.5 rounded-full ${palette.badge}`} />
                                <span className="font-black text-[10px] text-slate-800 uppercase tracking-widest">
                                  {hw.course} Bulletin
                                </span>
                              </div>

                              {/* Interactive actions */}
                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => {
                                    setEditingHomework(hw);
                                    setHwTitle(hw.title);
                                    setHwDesc(hw.description);
                                    setHwActivities(hw.activities || "");
                                    setHwCourse(hw.course);
                                    setHwDate(hw.date);
                                    setHwDueDate(hw.dueDate);
                                    setShowHomeworkModal(true);
                                  }}
                                  className="p-1.5 bg-white border border-slate-200 hover:border-indigo-400 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-lg cursor-pointer transition-all"
                                  title="Edit Post"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                {confirmDeleteHomeworkId === hw.id ? (
                                  <div className="flex items-center gap-1 animate-fadeIn">
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        await onDeleteHomework(hw.id);
                                        setConfirmDeleteHomeworkId(null);
                                      }}
                                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[8px] uppercase tracking-wider rounded-lg shadow-3xs cursor-pointer transition"
                                      title="Confirm delete post"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteHomeworkId(null)}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-extrabold text-[8px] uppercase tracking-wider rounded-lg cursor-pointer transition"
                                      title="Cancel delete"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteHomeworkId(hw.id)}
                                    className="p-1.5 bg-white border border-slate-200 hover:border-red-400 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg cursor-pointer transition-all"
                                    title="Delete Post"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Bulletins title */}
                            <h4 className="text-base font-extrabold text-slate-800 tracking-tight leading-snug group-hover:text-indigo-905 transition select-none">
                              {hw.title}
                            </h4>

                            {/* Colorful dynamic Learning Domain Badges */}
                            <div className="flex flex-wrap gap-1.5">
                              {domains.map((dom, idx) => (
                                <span
                                  key={idx}
                                  className={`text-[9px] font-black tracking-wide px-2 py-0.5 rounded-md border ${dom.bg} ${dom.border}`}
                                >
                                  {dom.label}
                                </span>
                              ))}
                            </div>

                            {/* Organized Learning objective block */}
                            <div className="space-y-1.5">
                              <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">
                                Goals & Outcomes
                              </span>
                              <p className="bg-white/80 p-3 rounded-2xl border border-slate-150/45 leading-relaxed text-[11px] font-medium text-slate-600 text-left whitespace-pre-wrap">
                                {hw.description}
                              </p>
                            </div>

                            {/* Sensory action play section */}
                            {hw.activities && (
                              <div className="space-y-1.5">
                                <span className="text-[9.5px] font-black text-amber-600 uppercase tracking-wider block">
                                  👐 Sensory Play Instruction
                                </span>
                                <p className="bg-amber-50/40 p-3 rounded-2xl border border-amber-200/40 leading-relaxed text-[11px] font-semibold text-amber-850 text-left whitespace-pre-wrap">
                                  {hw.activities}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Bulletin card footer metrics */}
                          <div className="pt-3 border-t border-slate-200/40 flex flex-wrap gap-2 justify-between items-center text-[10px] font-bold text-slate-400">
                            <span>Author: <strong className="text-slate-650 font-extrabold">{hw.postedBy}</strong></span>
                            
                            <div className="flex gap-2">
                              <span>Pub: <strong className="text-slate-500 font-mono font-medium">{hw.date}</strong></span>
                              <span className="text-rose-500 font-bold">Due: {hw.dueDate}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

            </div>
          </div>
        );
      })()}

      {/* RECRUIT STAFF MODAL DIALOG */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex justify-between items-center relative">
              <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-yellow-300 stroke-[3px]" /> Recruit Staff Member
                </h4>
                <p className="text-[10px] text-white/80 mt-0.5">Enroll new tutors, administrators, or service leaders.</p>
              </div>
              <button onClick={() => setShowAddStaffModal(false)} className="w-7 h-7 bg-white/10 hover:bg-white/20 active:scale-90 transition rounded-full flex items-center justify-center text-white font-bold cursor-pointer text-xs">✕</button>
            </div>

            <form onSubmit={handleRecruitStaff} className="p-6 space-y-4 text-xs text-slate-800 text-left">
              <div className="space-y-1">
                <label className="text-slate-450 font-black uppercase tracking-wider text-[9.5px] block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mrs. Preeti Sharma"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full p-3.5 rounded-2xl border border-slate-205 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 font-semibold transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-450 font-black uppercase tracking-wider text-[9.5px] block">Administration Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
                  className="w-full p-3.5 rounded-2xl border border-slate-205 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 font-bold text-slate-705 transition cursor-pointer"
                >
                  <option value="Staff">Teacher / Educator</option>
                  <option value="Accountant">Accountant / Bills Lead</option>
                  <option value="Admin">System Admin (Full Access)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-450 font-black uppercase tracking-wider text-[9.5px] block">Specialization / Department</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daycare Coordinator, LKG teacher"
                  value={newStaff.specialization}
                  onChange={(e) => setNewStaff({ ...newStaff, specialization: e.target.value })}
                  className="w-full p-3.5 rounded-2xl border border-slate-205 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 font-semibold transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-450 font-black uppercase tracking-wider text-[9.5px] block">E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="w-full p-3.5 rounded-2xl border border-slate-205 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 font-semibold transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-450 font-black uppercase tracking-wider text-[9.5px] block">Salary (INR/Month)</label>
                  <input
                    type="number"
                    required
                    value={newStaff.salary}
                    onChange={(e) => setNewStaff({ ...newStaff, salary: parseInt(e.target.value) || 0 })}
                    className="w-full p-3.5 rounded-2xl border border-slate-205 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 font-mono font-bold text-slate-800 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-450 font-black uppercase tracking-wider text-[9.5px] block">Primary Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+91 ...."
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: formatPhoneInput(e.target.value) })}
                  className="w-full p-3.5 rounded-2xl border border-slate-205 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 font-semibold transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-505 hover:to-indigo-650 text-xs font-black uppercase tracking-widest rounded-2xl shadow-md shadow-indigo-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition duration-200 cursor-pointer mt-2"
              >
                Confirm Appointment & Register Staff
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF PROFILE MODAL DIALOG */}
      {showEditStaffModal && editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex justify-between items-center relative">
              <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-yellow-300 stroke-[3px]" /> Edit Staff Member Profile
                </h4>
                <p className="text-[10px] text-white/80 mt-0.5">Modify profile, specialized branch, or salary details.</p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowEditStaffModal(false);
                  setEditingStaff(null);
                }} 
                className="w-7 h-7 bg-white/10 hover:bg-white/20 active:scale-90 transition rounded-full flex items-center justify-center text-white font-bold cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStaffSubmit} className="p-6 space-y-4 text-xs text-slate-800 text-left">
              <div className="space-y-1">
                <label className="text-slate-450 font-black uppercase tracking-wider text-[9.5px] block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mrs. Preeti Sharma"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full p-3.5 rounded-2xl border border-slate-205 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 font-semibold transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-450 font-black uppercase tracking-wider text-[9.5px] block">Administration Role</label>
                <select
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value as any })}
                  className="w-full p-3.5 rounded-2xl border border-slate-205 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 font-bold text-slate-705 transition cursor-pointer"
                >
                  <option value="Staff">Teacher / Educator</option>
                  <option value="Accountant">Accountant / Bills Lead</option>
                  <option value="Admin">System Admin (Full Access)</option>
                  <option value="Management">Management Board</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-450 font-black uppercase tracking-wider text-[9.5px] block">Specialization / Department</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daycare Coordinator, LKG teacher"
                  value={editingStaff.specialization}
                  onChange={(e) => setEditingStaff({ ...editingStaff, specialization: e.target.value })}
                  className="w-full p-3.5 rounded-2xl border border-slate-205 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 font-semibold transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-450 font-black uppercase tracking-wider text-[9.5px] block">E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={editingStaff.email}
                    onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                    className="w-full p-3.5 rounded-2xl border border-slate-205 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 font-semibold transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-450 font-black uppercase tracking-wider text-[9.5px] block">Salary (INR/Month)</label>
                  <input
                    type="number"
                    required
                    value={editingStaff.salary}
                    onChange={(e) => setEditingStaff({ ...editingStaff, salary: parseInt(e.target.value) || 0 })}
                    className="w-full p-3.5 rounded-2xl border border-slate-205 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 font-mono font-bold text-slate-800 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-450 font-black uppercase tracking-wider text-[9.5px] block">Primary Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 ...."
                    value={editingStaff.phone}
                    onChange={(e) => setEditingStaff({ ...editingStaff, phone: formatPhoneInput(e.target.value) })}
                    className="w-full p-3.5 rounded-2xl border border-slate-205 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 font-semibold transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-450 font-black uppercase tracking-wider text-[9.5px] block">Status</label>
                  <select
                    value={editingStaff.status}
                    onChange={(e) => setEditingStaff({ ...editingStaff, status: e.target.value as any })}
                    className="w-full p-3.5 rounded-2xl border border-slate-205 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 font-bold text-slate-705 transition cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-450 font-black uppercase tracking-wider text-[9.5px] block">Joining Date</label>
                <input
                  type="date"
                  required
                  value={editingStaff.joiningDate}
                  onChange={(e) => setEditingStaff({ ...editingStaff, joiningDate: e.target.value })}
                  className="w-full p-3.5 rounded-2xl border border-slate-205 bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 font-semibold transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-650 hover:to-violet-505 text-xs font-black uppercase tracking-widest rounded-2xl shadow-md shadow-indigo-200 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition duration-200 cursor-pointer mt-2"
              >
                Save Profile Modifications
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PARENT LINK & CREDENTIALS MODAL */}
      {showEditParentsModal && editingStudentForParents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-orange-100">
            <div className="p-5 bg-gradient-to-r from-orange-400 to-orange-550 text-white flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wide flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-white" /> Edit Parents Link & Portal Access
                </h4>
                <p className="text-[10px] text-orange-100 mt-0.5">
                  Manage contact number and login credentials for child's family
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowEditParentsModal(false);
                  setEditingStudentForParents(null);
                }} 
                className="text-white hover:scale-105 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveParentsLink} className="p-6 space-y-4 text-xs text-gray-800">
              <div className="bg-orange-50/50 p-3 rounded-2xl border border-orange-100 text-xs">
                <span className="text-[10px] uppercase font-bold text-orange-700 block">Connected Child Student Profile</span>
                <p className="font-black text-gray-900 mt-0.5 mt-1 text-sm">{editingStudentForParents.name}</p>
                <div className="flex gap-4 text-[10px] text-gray-500 mt-1 font-mono">
                  <span>Roll No: {editingStudentForParents.rollNo}</span>
                  <span>Class: {editingStudentForParents.course}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-bold block">Father's Name</label>
                <input
                  type="text"
                  required
                  placeholder="Father's full name"
                  value={editFatherName}
                  onChange={(e) => setEditFatherName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400 font-semibold text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-bold block">Mother's Name</label>
                <input
                  type="text"
                  required
                  placeholder="Mother's full name"
                  value={editMotherName}
                  onChange={(e) => setEditMotherName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400 font-semibold text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-orange-700 font-extrabold flex items-center gap-1.5 block">
                  📱 Primary Parent Contact Mobile Number (strictly used for secure login)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 9845012345"
                  value={editParentPhone}
                  onChange={(e) => setEditParentPhone(formatPhoneInput(e.target.value))}
                  className="w-full p-3 rounded-xl border border-orange-200 bg-orange-50/5 focus:outline-none focus:ring-1 focus:ring-orange-400 font-semibold text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-orange-700 font-extrabold flex items-center gap-1.5 block">
                  <KeyRound className="w-3.5 h-3.5 text-orange-500" /> Parent Portal Access Password (strictly created by admin)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. parent123"
                  value={editParentPassword}
                  onChange={(e) => setEditParentPassword(e.target.value)}
                  className="w-full p-3 rounded-xl border border-orange-200 bg-orange-50/5 focus:outline-none focus:ring-1 focus:ring-orange-400 font-semibold text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-bold block">Parent/Guardian Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. parent@gmail.com"
                  value={editParentEmail}
                  onChange={(e) => setEditParentEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-400 font-semibold text-xs"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditParentsModal(false);
                    setEditingStudentForParents(null);
                  }}
                  className="flex-1 py-3 bg-gray-150 text-gray-700 rounded-xl hover:bg-gray-200 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white bg-orange-500 hover:bg-orange-600 text-xs font-extrabold rounded-xl shadow-md transition"
                >
                  Save Parents Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENROLL STUDENT MODAL DIALOG */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white flex justify-between items-center">
              <h4 className="font-extrabold text-sm uppercase">Student Registration Form (SIS)</h4>
              <button onClick={() => setShowAddStudentModal(false)} className="text-white hover:scale-105 text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-4 text-xs text-gray-800">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block">Student Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kabir Sen"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-250 bg-gray-50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block">Course Stream</label>
                  <select
                    value={newStudent.course}
                    onChange={(e) => {
                      const c = e.target.value as CourseType;
                      const prefix = getRollPrefix(c);
                      const currentYear = new Date().getFullYear();
                      const suffix = newStudent.rollNo.includes("-") 
                        ? newStudent.rollNo.substring(newStudent.rollNo.indexOf("-")) 
                        : `-${currentYear}-${Math.floor(100 + Math.random() * 900)}`;
                      setNewStudent({ 
                        ...newStudent, 
                        course: c,
                        rollNo: `${prefix}${suffix}`
                      });
                    }}
                    className="w-full p-3 rounded-xl border border-gray-250 bg-gray-50 focus:outline-none cursor-pointer"
                  >
                    {Object.values(CourseType).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block">Roll Code</label>
                  <input
                    type="text"
                    required
                    value={newStudent.rollNo}
                    onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-250 bg-gray-50 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block">Age (Yrs)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="8"
                    value={newStudent.age}
                    onChange={(e) => setNewStudent({ ...newStudent, age: parseInt(e.target.value) || 0 })}
                    className="w-full p-3 rounded-xl border border-gray-250 bg-gray-50 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block">Gender</label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-250 bg-[#F5F5F5] focus:outline-none cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block">Father's Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Father Name"
                    value={newStudent.fatherName}
                    onChange={(e) => setNewStudent({ ...newStudent, fatherName: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-250 bg-[#F5F5F5] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block">Mother's Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Mother Name"
                    value={newStudent.motherName}
                    onChange={(e) => setNewStudent({ ...newStudent, motherName: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-250 bg-gray-50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block">Guardian Email</label>
                  <input
                    type="email"
                    required
                    placeholder="guardian@gmail.com"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-250 bg-[#F5F5F5] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold block">Guardian Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 ..."
                    value={newStudent.contactPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, contactPhone: formatPhoneInput(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-gray-250 bg-gray-50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-orange-650 font-extrabold flex items-center gap-1.5 block">
                  <KeyRound className="w-3.5 h-3.5 text-orange-500" /> Parent Portal Access Password (strictly created by admin)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. parent123"
                  value={newStudent.parentPassword || ""}
                  onChange={(e) => setNewStudent({ ...newStudent, parentPassword: e.target.value })}
                  className="w-full p-3 rounded-xl border border-orange-200 bg-orange-50/10 focus:outline-none focus:ring-1 focus:ring-orange-400 font-semibold text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-semibold block">Registered Address</label>
                <textarea
                  required
                  placeholder="Street details, Thirumalapura, Bengaluru"
                  value={newStudent.address}
                  rows={2}
                  onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-250 bg-gray-50 focus:outline-none text-xs leading-normal resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 text-white bg-indigo-600 hover:bg-indigo-700 text-xs font-extrabold rounded-2xl shadow-md transition"
              >
                Create Enrollment Details
              </button>
            </form>
          </div>
        </div>
      )}
      {/* GRADE MANAGEMENT DIALOG MODAL */}
      {showGradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-5 bg-gradient-to-r from-[#1E272C] to-indigo-900 text-white flex justify-between items-center">
              <h4 className="font-extrabold text-sm uppercase flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#1ABC9C]" />
                {editingGrade ? "Modify Academic Grade Entry" : "Register Student Grade Entry"}
              </h4>
              <button onClick={() => setShowGradeModal(false)} className="text-white hover:scale-105 text-sm">✕</button>
            </div>

            <form onSubmit={handleFormSaveGrade} className="p-6 space-y-4 text-xs text-gray-800">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold block">Target Student</label>
                  <select
                    required
                    value={grStudentId}
                    onChange={(e) => setGrStudentId(e.target.value)}
                    disabled={!!editingGrade}
                    className="w-full p-2.5 rounded-xl border border-gray-250 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-bold text-indigo-950"
                  >
                    <option value="">-- Pick student --</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>{st.name} ({st.course} Class)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-bold block">Academic Term</label>
                  <select
                    value={grTerm}
                    onChange={(e) => setGrTerm(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-bold"
                  >
                    <option value="Term 1">Term 1 (Mid Term)</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Final Term">Final Term (Year End)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-gray-400 font-bold block">Subject Module / Specialty</label>
                <select
                  value={grSubject}
                  onChange={(e) => setGrSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-250 bg-gray-50 focus:outline-none text-xs font-bold"
                >
                  <option value="Reading & Phonics">Reading & Phonics (Cognitive)</option>
                  <option value="Fine Motor Skills & Writing">Fine Motor Skills & Writing (Physical)</option>
                  <option value="Maths: Counting & Shapes">Maths: Counting & Shapes (Analytical)</option>
                  <option value="Socio-Emotional Sharing">Socio-Emotional & Sensory Play (Affective)</option>
                  <option value="Rhymes & Music Rhythms">Rhymes & Vocal Performance (Arts)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold block">Homework Score (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={grHwScore}
                    onChange={(e) => setGrHwScore(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 bg-gray-50 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-bold block">Exam / Practical (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={grExScore}
                    onChange={(e) => setGrExScore(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-gray-250 bg-gray-50 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="bg-indigo-50/40 p-4 border border-indigo-100/50 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-extrabold text-indigo-950 text-[11px] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#8E44AD]" /> Server-Side Gemini remarks
                    </h5>
                    <p className="text-[9px] text-gray-400">Instantly drafts progress descriptions based on scores.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAIGenerateGradeRemarks}
                    disabled={aiGeneratingRemarks}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-sm text-white font-black text-[10px] rounded-lg transition"
                  >
                    {aiGeneratingRemarks ? "Drafting remark..." : "✨ Run AI Remarks draft"}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 font-bold block">Progress Report Remarks / Notes</label>
                <textarea
                  placeholder="Draft descriptive feedback for parents here..."
                  value={grRemarks}
                  onChange={(e) => setGrRemarks(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-gray-250 bg-gray-50 text-xs text-indigo-950 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 text-white bg-indigo-900 hover:bg-slate-900 text-xs font-extrabold rounded-2xl shadow transition"
              >
                {editingGrade ? "Update Grade Record" : "Register Grade Entry"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HOMEWORK POSTING SYSTEM MODAL */}
      {showHomeworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 transform scale-100 transition-all duration-300">
            <div className="p-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
              <div className="relative z-10">
                <span className="text-[9px] font-black tracking-widest bg-white/20 px-2.5 py-1 rounded-full uppercase block w-max mb-1.5 border border-white/10">
                  {editingHomework ? "Update Roster" : "New Roster Post"}
                </span>
                <h4 className="font-extrabold text-base tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-yellow-300" /> 
                  <span>{editingHomework ? "Edit Activities Bulletin" : "Create Daily Activities Bulletin"}</span>
                </h4>
              </div>
              <button 
                onClick={() => setShowHomeworkModal(false)} 
                className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-white flex items-center justify-center font-extrabold transition text-xs shadow-3xs hover:scale-105"
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSaveHomework} className="p-6 space-y-5 text-xs text-slate-800">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-slate-500 font-extrabold uppercase tracking-wide block text-[10px]">Target Class Level</label>
                  <select
                    value={hwCourse}
                    onChange={(e) => setHwCourse(e.target.value as CourseType)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 focus:outline-none text-xs font-bold transition duration-200"
                  >
                    <option value={CourseType.NURSERY}>Nursery Class</option>
                    <option value={CourseType.LKG}>LKG Class</option>
                    <option value={CourseType.UKG}>UKG Class</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-slate-500 font-extrabold uppercase tracking-wide block text-[10px]">Bulletin Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clay sculpting & color circles"
                    value={hwTitle}
                    onChange={(e) => setHwTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 focus:outline-none text-xs font-semibold transition duration-200"
                  />
                </div>
              </div>

              {/* Gemini Lesson and Sensory Play Generator card */}
              <div className="bg-gradient-to-tr from-amber-50 to-orange-50 p-4 border border-amber-200/50 rounded-2xl space-y-3 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-24 h-24 bg-amber-400/5 rounded-bl-full pointer-events-none group-hover:bg-amber-400/10 transition-colors" />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10">
                  <div className="space-y-0.5">
                    <h5 className="font-extrabold text-amber-955 text-[11px] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" /> 
                      Live Gemini Lesson & Sensory Booster
                    </h5>
                    <p className="text-[10px] text-slate-500 font-medium">Auto-generate fun, fine motor milestones and play instructions.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAIGenerateHomeworkActivities}
                    disabled={aiGeneratingHomework}
                    className="w-full sm:w-auto px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[10px] rounded-xl cursor-pointer hover:shadow-xs transition duration-200 active:scale-98 flex items-center justify-center gap-1 shrink-0"
                  >
                    {aiGeneratingHomework ? "Generating drafts..." : "✨ Run Activities Booster"}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 font-extrabold uppercase tracking-wide block text-[10px]">Learning Objectives for Parents</label>
                <textarea
                  required
                  placeholder="Key motor, analytical, or socioeconomic milestones to observe in children..."
                  value={hwDesc}
                  onChange={(e) => setHwDesc(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 focus:outline-none font-medium leading-relaxed transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-500 font-extrabold uppercase tracking-wide block text-[10px] flex items-center gap-1">
                  <span>Sensory Play Games at Home (Parents' Manual)</span>
                  <span className="text-[10px] font-bold text-slate-400 font-sans tracking-tight">(Optional)</span>
                </label>
                <textarea
                  placeholder="Activities (e.g. trace shapes using standard cereal/beans)..."
                  value={hwActivities}
                  onChange={(e) => setHwActivities(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 focus:outline-none font-medium leading-relaxed transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-500 font-extrabold uppercase tracking-wide block text-[10px]">Distribution Date</label>
                  <input
                    type="date"
                    required
                    value={hwDate}
                    onChange={(e) => setHwDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 focus:outline-none font-mono text-xs font-semibold select-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-500 font-extrabold uppercase tracking-wide block text-[10px]/[1px] text-rose-650">Due Date</label>
                  <input
                    type="date"
                    required
                    value={hwDueDate}
                    onChange={(e) => setHwDueDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-150/45 focus:border-indigo-400 focus:outline-none font-mono text-xs font-semibold select-none transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 text-zinc-950 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-350 hover:to-amber-350 active:scale-98 text-xs font-black rounded-2xl shadow-[0_8px_16px_rgba(234,179,8,0.2)] hover:shadow-[0_10px_20px_rgba(234,179,8,0.3)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-4 h-4 text-zinc-950 stroke-[2.5px]" />
                  <span>{editingHomework ? "Save Homework & Activities Post" : "Publish Bulletin Live to Parents"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
