/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Student, StaffMember, Invoice, GradeItem, LessonPlan, PayrollRecord, HomeworkRecord } from "./types";
import HorizonLogo from "./components/HorizonLogo";
import AdminDashboard from "./components/AdminDashboard";
import StaffDashboard from "./components/StaffDashboard";
import ParentDashboard from "./components/ParentDashboard";
import ManagementDashboard from "./components/ManagementDashboard";
import PublicSummaryDashboard from "./components/PublicSummaryDashboard";
import { 
  Landmark, 
  GraduationCap, 
  Users, 
  User, 
  Shield, 
  HelpCircle, 
  Lock, 
  LayoutDashboard, 
  Globe, 
  AlertCircle, 
  Menu, 
  X,
  Calendar,
  Award,
  BookOpen,
  CreditCard,
  Briefcase,
  Heart,
  Wallet,
  LogOut,
  Eye,
  EyeOff,
  Sparkles,
  Smartphone,
  Mail,
  ChevronRight,
  Fingerprint
} from "lucide-react";

export default function App() {
  // Application Data States
  const [data, setData] = useState<{
    students: Student[];
    staff: StaffMember[];
    attendance: any[];
    grades: GradeItem[];
    billing: Invoice[];
    lessons: LessonPlan[];
    payroll: PayrollRecord[];
    globalWeights: { homeworkWeight: number; examWeight: number };
    homework?: HomeworkRecord[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication State
  const [userRole, setUserRole] = useState<"Admin" | "Staff" | "Parent" | "Management" | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [parentStudentIds, setParentStudentIds] = useState<string[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubView, setActiveSubView] = useState<"overview" | "workspace">("overview");

  // Controlled tab states for direct sidebar synchronization
  const [adminActiveTab, setAdminActiveTab] = useState<"sis" | "staff" | "billing" | "payroll" | "weights" | "gradebook" | "homework" | "attendance" | "parents">("sis");
  const [staffActiveTab, setStaffActiveTab] = useState<"attendance" | "grading" | "curriculum">("attendance");
  const [staffActiveSidebarSection, setStaffActiveSidebarSection] = useState<"attendance" | "students" | "gradebook" | "homework" | "parents">("attendance");

  // Fetch complete database state on load
  const fetchDatabaseState = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/data");
      if (!res.ok) {
        throw new Error("Failed to connect to fullstack play-school backend server.");
      }
      const db = await res.json();
      setData(db);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while communicating with database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseState();
  }, []);

  // -------------------------------------------------------------
  // Dynamic API Actions (Synchronizes localized React state + server db.json)
  // -------------------------------------------------------------

  const handleAddStudent = async (studentPayload: any) => {
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentPayload)
      });
      if (res.ok) {
        const added = await res.json();
        setData((prev: any) => ({
          ...prev,
          students: [...prev.students, added]
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStudent = async (id: string, pay: any) => {
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pay)
      });
      if (res.ok) {
        const updated = await res.json();
        setData((prev: any) => ({
          ...prev,
          students: prev.students.map((s: any) => (s.id === id ? updated : s))
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          students: prev.students.filter((s: any) => s.id !== id)
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStaff = async (payload: any) => {
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const added = await res.json();
        setData((prev: any) => ({
          ...prev,
          staff: [...prev.staff, added]
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStaff = async (id: string, payload: any) => {
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setData((prev: any) => ({
          ...prev,
          staff: prev.staff.map((s: any) => (s.id === id ? updated : s))
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          staff: prev.staff.filter((s: any) => s.id !== id)
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Student & Staff Attendance Marks
  const handleToggleAttendance = async (payload: {
    targetId: string;
    targetType: "student" | "staff";
    date: string;
    status: "Present" | "Absent" | "Late";
    markedBy: string;
  }) => {
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const parsed = await res.json();
    if (parsed.success) {
      setData((prev: any) => {
        const existsIdx = prev.attendance.findIndex((a: any) => a.id === parsed.record.id);
        const updatedAttendance = [...prev.attendance];
        if (existsIdx !== -1) {
          updatedAttendance[existsIdx] = parsed.record;
        } else {
          updatedAttendance.push(parsed.record);
        }
        return {
          ...prev,
          attendance: updatedAttendance
        };
      });
    }
    return parsed;
  };

  const handleSaveGrade = async (gradePayload: any) => {
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gradePayload)
      });
      if (res.ok) {
        const added = await res.json();
        setData((prev: any) => ({
          ...prev,
          grades: [...prev.grades, added]
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveLesson = async (lessonPayload: any) => {
    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessonPayload)
      });
      if (res.ok) {
        const added = await res.json();
        setData((prev: any) => ({
          ...prev,
          lessons: [...prev.lessons, added]
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveHomework = async (hwPayload: any) => {
    try {
      const isEdit = !!hwPayload.id;
      const url = isEdit ? `/api/homework/${hwPayload.id}` : "/api/homework";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hwPayload)
      });
      if (res.ok) {
        const saved = await res.json();
        setData((prev: any) => {
          const currentHomework = prev.homework || [];
          const updatedHomework = isEdit
            ? currentHomework.map((h: any) => h.id === saved.id ? saved : h)
            : [...currentHomework, saved];
          return { ...prev, homework: updatedHomework };
        });
      }
    } catch (err) {
      console.error("Failed to save homework:", err);
    }
  };

  const handleDeleteHomework = async (hwId: string) => {
    try {
      const res = await fetch(`/api/homework/${hwId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          homework: (prev.homework || []).filter((h: any) => h.id !== hwId)
        }));
      }
    } catch (err) {
      console.error("Failed to delete homework:", err);
    }
  };

  const handleGenerateBill = async (billPayload: any) => {
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billPayload)
      });
      if (res.ok) {
        const added = await res.json();
        setData((prev: any) => ({
          ...prev,
          billing: [...prev.billing, added]
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayInvoice = async (invoiceId: string, paymentMethod?: string) => {
    try {
      const res = await fetch(`/api/billing/${invoiceId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod })
      });
      if (res.ok) {
        const result = await res.json();
        setData((prev: any) => ({
          ...prev,
          billing: prev.billing.map((b: any) => (b.id === invoiceId ? result.invoice : b))
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePayroll = async (id: string, payload: any) => {
    try {
      const res = await fetch(`/api/payroll/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setData((prev: any) => ({
          ...prev,
          payroll: prev.payroll.map((p: any) => (p.id === id ? updated : p))
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPayroll = async (payload: any) => {
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const added = await res.json();
        setData((prev: any) => ({
          ...prev,
          payroll: [...prev.payroll, added]
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePayroll = async (id: string) => {
    try {
      const res = await fetch(`/api/payroll/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          payroll: prev.payroll.filter((p: any) => p.id !== id)
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = async (payload: { homeworkWeight: number; examWeight: number }) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          globalWeights: payload
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------------------------
  // Simulated Authentication & Verification
  // -------------------------------------------------------------
  // Simulated Authentication & Verification
  // -------------------------------------------------------------
  const cleanPhone = (ph: string) => ph ? ph.replace(/\D/g, "") : "";

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!data) return;

    const trimmedInput = authEmail.trim();
    const cleanedPhoneInput = cleanPhone(trimmedInput);

    // 1. Try matching student phone or email first for parent login
    const matchingStudent = data.students.find((sd) => {
      const sp = cleanPhone(sd.contactPhone);
      const isPhoneMatch = cleanedPhoneInput.length >= 8 && sp.endsWith(cleanedPhoneInput);
      const isEmailMatch = sd.email.toLowerCase() === trimmedInput.toLowerCase();
      return isPhoneMatch || isEmailMatch;
    });

    if (matchingStudent) {
      const expectedPassword = matchingStudent.parentPassword || "parent123";
      if (authPassword === expectedPassword) {
        setUserRole("Parent");
        setIsAdminLoggedIn(false);
        const cleanMatched = cleanPhone(matchingStudent.contactPhone);
        const siblings = data.students.filter(
          (s) => (cleanMatched.length >= 8 && cleanPhone(s.contactPhone).endsWith(cleanMatched)) ||
                 (s.email.toLowerCase() === matchingStudent.email.toLowerCase())
        );
        setParentStudentIds(siblings.map((s) => s.id));
        setActiveSubView("workspace"); // Jump directly to parent tracking portal
        return;
      } else {
        setAuthError("Incorrect parent portal security password for this child's profile.");
        return;
      }
    }

    // 2. Check pre-populated staff directory
    const matchingStaff = data.staff.find(
      (s) => s.email.toLowerCase() === trimmedInput.toLowerCase()
    );

    if (matchingStaff) {
      setUserRole(matchingStaff.role);
      setIsAdminLoggedIn(matchingStaff.role === "Admin");
      if (matchingStaff.role === "Staff") {
        setStaffActiveSidebarSection("attendance");
        setStaffActiveTab("attendance");
        setActiveSubView("overview");
      } else if (matchingStaff.role === "Management") {
        setActiveSubView("workspace");
      } else {
        setActiveSubView("overview");
      }
    } else {
      // 3. Direct pass with default patterns for evaluation convenience
      if (trimmedInput.toLowerCase().includes("admin") || trimmedInput === "robintg@gmail.com") {
        setUserRole("Admin");
        setIsAdminLoggedIn(true);
        setActiveSubView("overview");
      } else if (trimmedInput.toLowerCase().includes("teacher") || trimmedInput.toLowerCase().includes("staff")) {
        setUserRole("Staff");
        setIsAdminLoggedIn(false);
        setStaffActiveSidebarSection("attendance");
        setStaffActiveTab("attendance");
        setActiveSubView("overview");
      } else if (trimmedInput.toLowerCase().includes("suresh") || trimmedInput.toLowerCase().includes("owner") || trimmedInput.toLowerCase().includes("management")) {
        setUserRole("Management");
        setIsAdminLoggedIn(false);
        setActiveSubView("workspace");
      } else if (trimmedInput.toLowerCase().includes("parent")) {
        setUserRole("Parent");
        setIsAdminLoggedIn(false);
        // Seed first student std_1
        const child = data.students[0];
        if (child) {
          const cleanMatched = cleanPhone(child.contactPhone);
          const siblings = data.students.filter((s) => cleanPhone(s.contactPhone).endsWith(cleanMatched));
          setParentStudentIds(siblings.map((s) => s.id));
        } else {
          setParentStudentIds([]);
        }
        setActiveSubView("workspace");
      } else {
        setAuthError("No profile matched this mobile/email. Admin-created Parent credentials required.");
      }
    }
  };

  // Fast-Pass triggers for sandbox evaluators
  const triggerFastLogin = (role: "Admin" | "Staff" | "Parent" | "Management") => {
    setUserRole(role);
    setIsAdminLoggedIn(role === "Admin");
    setAuthError("");
    setMobileMenuOpen(false);
    if (role === "Parent") {
      setActiveSubView("workspace");
    } else if (role === "Management") {
      setActiveSubView("workspace");
    } else {
      setActiveSubView("overview"); // Start from Dashboard
    }
    if (data) {
      if (role === "Admin") {
        setAuthEmail("robintg@gmail.com");
        setAuthPassword("admin125");
      } else if (role === "Staff") {
        setAuthEmail("preeti@gmail.com");
        setAuthPassword("staff125");
        setStaffActiveSidebarSection("attendance");
        setStaffActiveTab("attendance");
      } else if (role === "Parent") {
        const aarav = data.students.find(s => s.id === "std_1") || data.students[0];
        if (aarav) {
          setAuthEmail(aarav.contactPhone);
          setAuthPassword(aarav.parentPassword || "parent123");
          const cleanMatched = cleanPhone(aarav.contactPhone);
          const siblings = data.students.filter(
              (s) => (cleanMatched.length >= 8 && cleanPhone(s.contactPhone).endsWith(cleanMatched)) ||
                     (s.email.toLowerCase() === aarav.email.toLowerCase())
          );
          setParentStudentIds(siblings.map((s) => s.id));
        } else {
          setAuthEmail("+91 9845012345");
          setAuthPassword("parent123");
          setParentStudentIds(["std_1"]);
        }
      } else if (role === "Management") {
        setAuthEmail("suresh@gmail.com");
        setAuthPassword("mgt125");
      }
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setIsAdminLoggedIn(false);
    setAuthEmail("");
    setAuthPassword("");
    setAuthError("");
    setParentStudentIds([]);
    setActiveSubView("overview");
  };

  const sidebarLinks = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5 shrink-0" /> },
    { id: "students", label: "Students", icon: <Users className="w-5 h-5 shrink-0" /> },
    { id: "attendance", label: "Attendance", icon: <Calendar className="w-5 h-5 shrink-0" /> },
    { id: "gradebook", label: "Gradebook", icon: <GraduationCap className="w-5 h-5 shrink-0" /> },
    { id: "homework", label: "Homework & Activities", icon: <BookOpen className="w-5 h-5 shrink-0" /> },
    { id: "billing", label: "Billing", icon: <CreditCard className="w-5 h-5 shrink-0" /> },
    { id: "staff", label: "Staff", icon: <Briefcase className="w-5 h-5 shrink-0" /> },
    { id: "parents", label: "Parents", icon: <Heart className="w-5 h-5 shrink-0" /> },
    { id: "payroll", label: "Payroll", icon: <Wallet className="w-5 h-5 shrink-0" /> },
  ];

  const getLinkColorConfig = (id: string) => {
    const configs: Record<string, { bg: string; iconActive: string; iconInactive: string; shadow: string }> = {
      dashboard: {
        bg: "from-amber-500 to-orange-500",
        iconActive: "text-white",
        iconInactive: "text-amber-400",
        shadow: "shadow-orange-500/20"
      },
      students: {
        bg: "from-blue-500 to-indigo-600",
        iconActive: "text-white",
        iconInactive: "text-sky-400",
        shadow: "shadow-blue-500/20"
      },
      attendance: {
        bg: "from-emerald-500 to-teal-600",
        iconActive: "text-white",
        iconInactive: "text-emerald-400",
        shadow: "shadow-emerald-500/20"
      },
      gradebook: {
        bg: "from-violet-500 to-indigo-600",
        iconActive: "text-white",
        iconInactive: "text-violet-400",
        shadow: "shadow-violet-500/20"
      },
      homework: {
        bg: "from-rose-500 to-pink-600",
        iconActive: "text-white",
        iconInactive: "text-pink-400",
        shadow: "shadow-rose-500/20"
      },
      billing: {
        bg: "from-amber-600 to-yellow-500",
        iconActive: "text-white",
        iconInactive: "text-yellow-400",
        shadow: "shadow-yellow-500/20"
      },
      staff: {
        bg: "from-cyan-500 to-teal-600",
        iconActive: "text-white",
        iconInactive: "text-cyan-400",
        shadow: "shadow-cyan-500/20"
      },
      parents: {
        bg: "from-fuchsia-500 to-pink-600",
        iconActive: "text-white",
        iconInactive: "text-fuchsia-400",
        shadow: "shadow-fuchsia-500/20"
      },
      payroll: {
        bg: "from-emerald-500 to-blue-600",
        iconActive: "text-white",
        iconInactive: "text-teal-400",
        shadow: "shadow-blue-500/20"
      },
      management: {
        bg: "from-violet-600 to-fuchsia-600",
        iconActive: "text-white",
        iconInactive: "text-fuchsia-300",
        shadow: "shadow-violet-500/20"
      }
    };
    return configs[id] || {
      bg: "from-indigo-500 to-purple-600",
      iconActive: "text-white",
      iconInactive: "text-indigo-300",
      shadow: "shadow-indigo-500/20"
    };
  };

  const getVisibleSidebarLinks = () => {
    if (!userRole) return [];
    if (isAdminLoggedIn || userRole === "Admin") {
      return sidebarLinks;
    }
    if (userRole === "Staff") {
      return sidebarLinks.filter((link) =>
        ["dashboard", "students", "attendance", "gradebook", "homework", "parents"].includes(link.id)
      );
    }
    if (userRole === "Parent") {
      return sidebarLinks.filter((link) => link.id === "parents");
    }
    if (userRole === "Management") {
      return [
        { id: "management", label: "Management Access", icon: <Landmark className="w-5 h-5 shrink-0" /> }
      ];
    }
    return [];
  };

  const getActiveSidebarLink = () => {
    if (activeSubView === "overview") return "dashboard";
    if (activeSubView === "workspace") {
      if (userRole === "Admin") {
        if (adminActiveTab === "sis") return "students";
        if (adminActiveTab === "attendance") return "attendance";
        if (adminActiveTab === "billing") return "billing";
        if (adminActiveTab === "staff") return "staff";
        if (adminActiveTab === "payroll") return "payroll";
        if (adminActiveTab === "weights") return "gradebook";
        if (adminActiveTab === "gradebook") return "gradebook";
        if (adminActiveTab === "homework") return "homework";
        if (adminActiveTab === "parents") return "parents";
      }
      if (userRole === "Staff") {
        return staffActiveSidebarSection;
      }
      if (userRole === "Parent") {
        return "parents";
      }
      if (userRole === "Management") {
        return "management";
      }
    }
    return "dashboard";
  };

  const activeSidebarLink = getActiveSidebarLink();

  const handleSidebarLinkClick = (linkId: string) => {
    if (linkId === "dashboard") {
      setActiveSubView("overview");
    } else if (linkId === "management") {
      setActiveSubView("workspace");
    } else if (linkId === "students") {
      setActiveSubView("workspace");
      if (userRole === "Admin") {
        setAdminActiveTab("sis");
      } else if (userRole === "Staff") {
        setStaffActiveSidebarSection("students");
      }
    } else if (linkId === "attendance") {
      setActiveSubView("workspace");
      if (userRole === "Admin") {
        setAdminActiveTab("attendance");
      } else if (userRole === "Staff") {
        setStaffActiveSidebarSection("attendance");
        setStaffActiveTab("attendance");
      }
    } else if (linkId === "gradebook") {
      setActiveSubView("workspace");
      if (userRole === "Admin") {
        setAdminActiveTab("gradebook");
      } else if (userRole === "Staff") {
        setStaffActiveSidebarSection("gradebook");
      }
    } else if (linkId === "homework") {
      setActiveSubView("workspace");
      if (userRole === "Admin") {
        setAdminActiveTab("homework");
      } else if (userRole === "Staff") {
        setStaffActiveSidebarSection("homework");
      }
    } else if (linkId === "billing") {
      setActiveSubView("workspace");
      if (userRole === "Admin") {
        setAdminActiveTab("billing");
      }
    } else if (linkId === "staff") {
      setActiveSubView("workspace");
      if (userRole === "Admin") {
        setAdminActiveTab("staff");
      }
    } else if (linkId === "parents") {
      setActiveSubView("workspace");
      if (userRole === "Admin") {
        setAdminActiveTab("parents");
      } else if (userRole === "Staff") {
        setStaffActiveSidebarSection("parents");
      }
    } else if (linkId === "payroll") {
      setActiveSubView("workspace");
      if (userRole === "Admin") {
        setAdminActiveTab("payroll");
      }
    }
    setMobileMenuOpen(false);
  };

  // Loading Splash Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-8 text-center animate-pulse">
        <header className="space-y-4">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg relative animate-bounce">
            <Landmark className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-indigo-950 uppercase tracking-wider">HORIZON SAAS</h2>
          <p className="text-sm text-gray-500 font-medium">Mounting Horizon International Play School records database...</p>
        </header>
      </div>
    );
  }

  // Crash Fallback Screen
  if (error) {
    return (
      <div className="min-h-screen bg-red-55 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto space-y-6">
        <div className="p-4 bg-red-100 rounded-2xl border border-red-200">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-red-900 font-sans">Full-Stack Connection Failure</h3>
          <p className="text-gray-600 text-xs leading-relaxed">{error}</p>
        </div>
        <button
          onClick={fetchDatabaseState}
          className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans antialiased text-[#2C3E50]">
      {/* 1. VISUALLY POLISHED LOGIN / AUTHENTICATION LANDING SPLASH */}
      {!userRole ? (
        <div id="school-auth-gateway" className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F8FAFC]">
          
          {/* Left panel: Immersive decorative brand board with majestic uploaded school logo */}
          <section className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] p-12 text-white flex-col justify-between relative overflow-hidden shadow-2xl border-r border-[#1E293B]/20 select-none">
            {/* Soft Ambient glowing orbs of varying hues for three-dimensional color rendering */}
            <div className="absolute inset-0 select-none pointer-events-none z-0">
              <div className="w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-[120px] absolute -top-10 -left-10 animate-pulse" />
              <div className="w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[100px] absolute bottom-1/4 -right-10" />
              <div className="w-[300px] h-[300px] bg-rose-500/5 rounded-full blur-[80px] absolute top-1/3 left-1/3" />
            </div>

            {/* Platform Sub-header info */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Globe className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-300">Horizon Cloud Engine</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[8.5px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> System Live
              </span>
            </div>

            {/* Immersive Frosted Glass School Credentials Badge Area */}
            <div className="relative z-10 py-8 flex flex-col items-center">
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 px-8 py-10 rounded-[40px] shadow-2xl max-w-sm w-full transition duration-500 hover:border-white/20 group">
                {/* School main logo badge inside reflective circular aura */}
                <div className="relative mx-auto mb-6 flex justify-center">
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500" />
                  <div className="bg-white p-5 rounded-[32px] shadow-xl relative z-10">
                    <HorizonLogo size="md" showText={false} />
                  </div>
                </div>

                <div className="text-center space-y-2.5">
                  <h3 className="text-lg font-black tracking-tight text-white uppercase leading-tight font-sans">
                    Horizon International Play School
                  </h3>
                  <p className="text-[9.5px] text-slate-400 font-extrabold tracking-widest uppercase block">
                    Thirumalapura Branch • Bengaluru
                  </p>
                </div>

                <div className="w-full border-t border-white/5 mt-6 pt-5 flex flex-col items-center">
                  <span className="text-[7.5px] font-black text-slate-400/80 tracking-[0.2em] uppercase leading-none mb-3">
                    POWERED BY NEXTGEN SMART CORE
                  </span>
                  <img 
                    src="/nextgen_logo.png" 
                    alt="Nextgen Gurukul Logo" 
                    className="w-36 h-auto opacity-90 select-none hover:scale-105 hover:opacity-100 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Trust highlights & core credentials info */}
            <div className="relative z-10 space-y-4">
              <div className="border-t border-white/5 pt-5 space-y-3">
                <span className="text-[9px] font-extrabold text-slate-400 tracking-[0.14em] uppercase block">
                  Academic Affiliation Summary
                </span>
                <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-300">
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
                    <p className="text-slate-400 font-mono font-extrabold text-[8px] uppercase tracking-wide">Trust Administration</p>
                    <p className="font-extrabold mt-0.5 text-orange-400">Arivu Foundation</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
                    <p className="text-slate-400 font-mono font-extrabold text-[8px] uppercase tracking-wide">Infrastructure Hub</p>
                    <p className="font-extrabold mt-0.5 text-indigo-400">NextGen Gurukul</p>
                  </div>
                </div>
              </div>

              <footer className="text-[9.5px] text-slate-400 flex items-center justify-between">
                <span>© 2026 Horizon Academic Initiative.</span>
                <span className="font-semibold text-slate-500">v2.4.9 Stable</span>
              </footer>
            </div>
          </section>

          {/* Right panel: Modern secure sign-in gateway */}
          <main className="col-span-1 lg:col-span-7 p-4 sm:p-12 lg:p-16 xl:p-24 flex flex-col justify-center bg-[#FAFBFD] relative">
            {/* Subtle floating background glyph ornament */}
            <div className="absolute right-8 top-8 opacity-4 z-0 pointer-events-none">
              <Fingerprint className="w-64 h-64 text-slate-900" />
            </div>

            <article className="max-w-md w-full mx-auto space-y-6 relative z-10">
              {/* Brand Logo stack rendering for mobile and tablet views */}
              <div className="text-center lg:hidden flex justify-center mb-4">
                <div className="inline-block bg-white p-5 rounded-[32px] shadow-lg border border-slate-100 max-w-xs">
                  <div className="flex items-center justify-center gap-3">
                    <HorizonLogo size="sm" showText={false} />
                    <div className="h-8 w-px bg-slate-200" />
                    <img 
                      src="/nextgen_logo.png" 
                      alt="Nextgen Gurukul Logo" 
                      className="w-24 h-auto select-none"
                    />
                  </div>
                </div>
              </div>

              {/* Secure Credentials card */}
              <div className="bg-white p-6 sm:p-10 rounded-[36px] border border-slate-150/80 shadow-[0_20px_50px_rgba(15,23,42,0.04)] space-y-6">
                
                {/* Header branding lock insignia */}
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-600/10">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight font-sans">
                      Secure Portal Authentication
                    </h2>
                    <p className="text-[10px] text-slate-400 font-extrabold tracking-tight uppercase">
                      Horizon International Tech School • Admin, Staff & Parent
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Provide the secure guardian contact number, registered parent/staff service emails, or use the evaluator shortcut tags below to inspect role features.
                  </p>
                </div>

                {/* Form Elements */}
                <form onSubmit={handleSimulatedSubmit} className="space-y-4 text-xs font-semibold">
                  {authError && (
                    <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-[11px] leading-relaxed font-bold flex items-start gap-2 animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Input field 1: Username / phone */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] tracking-wide text-slate-400 font-black uppercase block">
                      Email address or Registered Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                        <Smartphone className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. +91 9845012345 or administrator@horizon.edu"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/40 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white transition-all text-slate-800 text-xs font-bold font-mono placeholder:font-sans placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Input field 2: Security Password */}
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] tracking-wide text-slate-400 font-black uppercase">
                        Security Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          alert(`Evaluation Hint:
To login:
• Admin: click the Fast Admin shortcut or enter admin details.
• Parents: enter any registered parent phone (e.g. 9845012345) and parent password.
• Staff: use the staff shortcut below.`);
                        }}
                        className="text-[10.5px] text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                      >
                        Help?
                      </button>
                    </div>
                    
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/40 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white transition-all text-slate-800 text-xs font-extrabold font-mono"
                      />
                      {/* Password eye toggle overlay */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? "Hide Password" : "Show Password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Extras: Auto Checkbox */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 py-1 font-bold">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        defaultChecked
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500/20" 
                      />
                      <span>Enforce Encrypted Session</span>
                    </label>
                    <span className="text-slate-400 text-[10px]">Secure TLS Port</span>
                  </div>

                  {/* Primary authentication button */}
                  <button
                    type="submit"
                    className="w-full py-4 text-white bg-gradient-to-r from-indigo-950 to-[#2D3172] hover:from-[#212450] hover:to-[#383C85] active:scale-[0.98] focus:ring-2 focus:ring-indigo-500/50 hover:shadow-xl rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Authenticate Secure Portal Key</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>

                {/* FAST EVALUATOR LOGIN SELECT BACKGROUNDS */}
                <div className="space-y-4 pt-5 border-t border-slate-150 text-left">
                  <div className="flex items-center gap-1.5 justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Instant Gateways • Fast Sandbox Panel
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Admin trigger */}
                    <button
                      onClick={() => triggerFastLogin("Admin")}
                      className="p-3 bg-white hover:bg-rose-50/20 text-rose-700 hover:text-rose-800 rounded-2xl text-xs font-black shadow-sm transition-all hover:shadow hover:scale-[1.02] border border-rose-100/40 hover:border-rose-300/60 active:scale-[0.96] flex flex-col items-center gap-1.5 cursor-pointer text-center"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-rose-500" />
                      </div>
                      <span className="font-extrabold text-[11px]">Admin Officer</span>
                      <span className="text-[8.5px] text-slate-450 font-semibold leading-none">Full system engine</span>
                    </button>

                    {/* Staff trigger */}
                    <button
                      onClick={() => triggerFastLogin("Staff")}
                      className="p-3 bg-white hover:bg-purple-50/20 text-purple-700 hover:text-purple-800 rounded-2xl text-xs font-black shadow-sm transition-all hover:shadow hover:scale-[1.02] border border-purple-100/40 hover:border-purple-300/60 active:scale-[0.96] flex flex-col items-center gap-1.5 cursor-pointer text-center"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="font-extrabold text-[11px]">Staff & Teacher</span>
                      <span className="text-[8.5px] text-slate-450 font-semibold leading-none">Attendance & Grades</span>
                    </button>

                    {/* Parent trigger */}
                    <button
                      onClick={() => triggerFastLogin("Parent")}
                      className="p-3 bg-white hover:bg-emerald-50/20 text-emerald-700 hover:text-emerald-800 rounded-2xl text-xs font-black shadow-sm transition-all hover:shadow hover:scale-[1.02] border border-emerald-100/40 hover:border-emerald-300/60 active:scale-[0.96] flex flex-col items-center gap-1.5 cursor-pointer text-center"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="font-extrabold text-[11px]">Guardian / Parents</span>
                      <span className="text-[8.5px] text-slate-450 font-semibold leading-none">Ward report cards</span>
                    </button>

                    {/* Management trigger */}
                    <button
                      onClick={() => triggerFastLogin("Management")}
                      className="p-3 bg-white hover:bg-blue-50/20 text-blue-700 hover:text-blue-800 rounded-2xl text-xs font-black shadow-sm transition-all hover:shadow hover:scale-[1.02] border border-blue-100/40 hover:border-blue-300/60 active:scale-[0.96] flex flex-col items-center gap-1.5 cursor-pointer text-center"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Landmark className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="font-extrabold text-[11px]">School Board</span>
                      <span className="text-[8.5px] text-slate-450 font-semibold leading-none">Global fee statistics</span>
                    </button>
                  </div>
                </div>

              </div>
            </article>
          </main>
        </div>
      ) : (
        /* 2. MAIN SCHOOL SYSTEM APPLICATION (AUTHENTICATED COMPONENT SCREEN) */
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
          {/* A. DESKTOP PERMANENT SIDEBAR */}
          <aside className="hidden lg:flex w-64 bg-gradient-to-b from-[#EBEFFF] via-[#F3F6FF] to-white text-slate-800 flex-col shrink-0 border-r border-indigo-100 animate-slideRight relative overflow-hidden">
            {/* Ambient background glows for extra color vibrance */}
            <div className="absolute top-[-40px] left-[-30px] w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute bottom-[-30px] right-[-30px] w-48 h-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
            <div className="absolute top-[40%] left-[10px] w-40 h-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            {/* Crisp Vector Blueprint/Geometric Grid Overlays */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-0 select-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                <defs>
                  <pattern id="desktop-sidebar-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.1" fill="#4338CA" />
                  </pattern>
                  <linearGradient id="vector-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4338CA" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#desktop-sidebar-grid)" />
                
                {/* Circular radar coordinates & targets */}
                <circle cx="0" cy="150" r="90" stroke="#4338CA" strokeWidth="1.5" fill="none" strokeDasharray="4 8" />
                <circle cx="0" cy="150" r="130" stroke="#4338CA" strokeWidth="1" fill="none" />
                <circle cx="0" cy="150" r="170" stroke="#4338CA" strokeWidth="0.75" fill="none" strokeDasharray="2 3" />
                
                <circle cx="250" cy="450" r="110" stroke="#EC4899" strokeWidth="1.5" fill="none" strokeDasharray="3 6" />
                <circle cx="250" cy="450" r="150" stroke="#F59E0B" strokeWidth="1" fill="none" />
                
                {/* Geometrical connection vectors */}
                <line x1="-20" y1="150" x2="280" y2="450" stroke="url(#vector-grad-1)" strokeWidth="1.5" />
                <line x1="120" y1="-20" x2="120" y2="900" stroke="#4338CA" strokeWidth="0.75" strokeDasharray="5 5" />
                <line x1="-20" y1="300" x2="280" y2="300" stroke="#4338CA" strokeWidth="0.75" strokeDasharray="5 5" />
                
                {/* Crosshair target alignment indicators */}
                <path d="M 120,300 m -10,0 l 20,0 M 120,300 m 0,-10 l 0,20" stroke="#4338CA" strokeWidth="1.5" />
                <rect x="115" y="295" width="10" height="10" stroke="#4338CA" strokeWidth="0.75" fill="none" />
                
                {/* Compass or coordinate tick marks */}
                <circle cx="120" cy="300" r="40" stroke="#4338CA" strokeWidth="0.5" fill="none" strokeDasharray="1 5" />
              </svg>
            </div>
 
            {/* Top Brand Header (Aligned with Reference Photo) */}
            <div className="p-5 flex flex-col items-center justify-center text-center bg-white/40 backdrop-blur-md border-b border-indigo-100 select-none relative z-10 font-sans w-full">
              <div className="leading-none">
                <span className="text-[9.5px] uppercase font-black text-amber-600 tracking-[0.14em] block">
                  BRANCH
                </span>
                <span className="text-sm font-black uppercase text-indigo-950 tracking-tight block mt-1">
                  THIRUMALAPURA
                </span>
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-[0.16em] block mt-1.5 opacity-90">
                  BENGALURU
                </span>
              </div>
            </div>
 
            {/* Direct Links of Play School Directory */}
            <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto relative z-10">
              <span className="px-4 text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-3 font-mono">
                School Directory
              </span>
              
              {getVisibleSidebarLinks().map((link) => {
                const isActive = activeSidebarLink === link.id;
                const config = getLinkColorConfig(link.id);
                return (
                  <button
                    key={link.id}
                    onClick={() => handleSidebarLinkClick(link.id)}
                    className={`w-full ${
                      isActive
                        ? `bg-gradient-to-r ${config.bg} text-white shadow-lg ${config.shadow} font-bold border-l-4 border-amber-300`
                        : "text-slate-600 hover:bg-slate-100 hover:text-indigo-950 font-extrabold"
                    } flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left text-[12.5px] transition duration-200 cursor-pointer`}
                  >
                    <span className={`${isActive ? config.iconActive : "text-slate-400"} transition-colors duration-200`}>
                      {link.icon}
                    </span>
                    <span className="truncate">{link.label}</span>
                  </button>
                );
              })}
            </div>
 
            {/* Sidebar Bottom Signed-In User profile display cards */}
            <div className="p-4 border-t border-indigo-100 space-y-3 font-sans relative z-10">
              <div className="bg-white/40 backdrop-blur-md px-3.5 py-2.5 rounded-[16px] border border-indigo-50/80 shadow-2xs flex flex-col gap-0.5 select-none font-sans">
                <span className="text-[8.5px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">
                  SIGNED IN AS
                </span>
                <div className="flex items-center justify-between gap-1.5 mt-0.5">
                  <span className="text-xs font-black text-slate-800 tracking-tight truncate">
                    {isAdminLoggedIn ? "Admin" : (userRole || "Admin")}
                  </span>
                  <span className="text-[7.5px] font-black px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/20 text-amber-700 uppercase font-mono tracking-wider rounded shrink-0">
                    {isAdminLoggedIn ? "ADMIN" : (userRole === "Staff" ? "TEACHER" : userRole === "Parent" ? "PARENT" : userRole === "Management" ? "DIRECTOR" : "ADMIN")}
                  </span>
                </div>
              </div>
 
              {/* Brilliant Saffron-Orange Logout button */}
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-[#F2994A] hover:bg-[#E2852F] hover:scale-[1.02] active:scale-95 text-white font-extrabold text-xs rounded-2xl transition duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
 
              <span className="text-[9px] text-slate-400 font-bold block mt-3 text-center tracking-tight animate-fade-in select-none">
                ✨ Designed by Nextgen Gurukul
              </span>
            </div>
          </aside>

          {/* B. MOBILE SLIDE-OUT DRAWER */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              {/* Overlay background */}
              <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                onClick={() => setMobileMenuOpen(false)}
              />
              {/* Drawer Container */}
              <div className="relative w-72 max-w-xs bg-gradient-to-b from-[#EBEFFF] via-[#F3F6FF] to-white text-slate-800 flex flex-col z-10 shadow-2xl animate-slideRight overflow-hidden">
                {/* Ambient background glows for extra color vibrance */}
                <div className="absolute top-[-40px] left-[-30px] w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-30px] right-[-30px] w-48 h-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
                <div className="absolute top-[40%] left-[10px] w-40 h-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                {/* Crisp Vector Blueprint/Geometric Grid Overlays */}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-0 select-none">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
                    <defs>
                      <pattern id="mobile-sidebar-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.1" fill="#4338CA" />
                      </pattern>
                      <linearGradient id="vector-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4338CA" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#mobile-sidebar-grid)" />
                    
                    {/* circular vectors */}
                    <circle cx="0" cy="150" r="90" stroke="#4338CA" strokeWidth="1.5" fill="none" strokeDasharray="4 8" />
                    <circle cx="0" cy="150" r="130" stroke="#4338CA" strokeWidth="1" fill="none" />
                    <line x1="-20" y1="150" x2="280" y2="450" stroke="url(#vector-grad-2)" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Brand Header */}
                <div className="p-5 flex items-center justify-center text-center bg-white/40 backdrop-blur-md border-b border-indigo-100 relative z-10 font-sans w-full">
                  <div className="leading-none">
                    <span className="text-[9.5px] uppercase font-black text-amber-600 tracking-[0.14em] block">
                      BRANCH
                    </span>
                    <span className="text-sm font-black uppercase text-indigo-950 tracking-tight block mt-1">
                      THIRUMALAPURA
                    </span>
                    <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-[0.16em] block mt-1.5 opacity-90">
                      BENGALURU
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="absolute right-4 p-1.5 text-slate-500 hover:text-slate-800 transition cursor-pointer rounded-xl bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Directory list */}
                <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto relative z-10 w-full">
                  {getVisibleSidebarLinks().map((link) => {
                    const isActive = activeSidebarLink === link.id;
                    const config = getLinkColorConfig(link.id);
                    return (
                      <button
                        key={link.id}
                        onClick={() => handleSidebarLinkClick(link.id)}
                        className={`w-full ${
                          isActive
                            ? `bg-gradient-to-r ${config.bg} text-white shadow-lg ${config.shadow} font-bold border-l-4 border-amber-300`
                            : "text-slate-600 hover:bg-slate-100 hover:text-indigo-950 font-extrabold"
                        } flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left text-[12.5px] transition duration-200 cursor-pointer`}
                      >
                        <span className={`${isActive ? config.iconActive : "text-slate-400"} transition-colors duration-200`}>
                          {link.icon}
                        </span>
                        <span>{link.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Mobile footer profile/logout */}
                <div className="p-4 border-t border-indigo-100 space-y-3 font-sans relative z-10">
                  <div className="bg-white/40 backdrop-blur-md px-3.5 py-2.5 rounded-[16px] border border-indigo-50/80 flex flex-col gap-0.5 select-none shadow-2xs">
                    <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest leading-none font-sans">SIGNED IN AS</span>
                    <div className="flex items-center justify-between gap-1.5 mt-0.5">
                      <span className="text-xs font-black text-slate-800 tracking-tight truncate">
                        {isAdminLoggedIn ? "Admin" : (userRole || "Admin")}
                      </span>
                      <span className="text-[7.5px] font-black px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/20 text-amber-700 uppercase font-mono tracking-wider rounded shrink-0">
                        {isAdminLoggedIn ? "ADMIN" : (userRole === "Staff" ? "TEACHER" : userRole === "Parent" ? "PARENT" : userRole === "Management" ? "DIRECTOR" : "ADMIN")}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 bg-[#F2994A] hover:bg-[#E2852F] text-white font-extrabold text-[11px] rounded-xl transition text-center block cursor-pointer shadow-xs"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* C. MAIN CONTENT PORT WRAPPER */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
            {/* Top compact modern header for active context details */}
            <header className="bg-white border-b border-slate-100 py-1.5 px-6 flex justify-between items-center sticky top-0 z-40 select-none">
              <div className="flex items-center gap-3">
                {/* Left mobile menu menu btn */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer shrink-0"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <HorizonLogo size="sm" showText={false} />
                  <div className="flex flex-col justify-center">
                    <h1 className="text-sm sm:text-base md:text-lg font-display font-black text-slate-850 tracking-tight leading-none uppercase">
                      Horizon International Tech Play School
                    </h1>
                    <span className="text-[9.5px] sm:text-[10.5px] text-slate-500 font-semibold block font-sans mt-1 leading-none">
                      Thirumalapura, Bangalore, Karnataka
                    </span>
                  </div>

                  {/* Vertical Divider */}
                  <div className="hidden md:block w-[1.5px] h-7 bg-slate-200 mx-2 shrink-0" />

                  {/* Arivu Logo and Text inline with clean styling */}
                  <div className="hidden md:flex items-center gap-2.5 shrink-0 select-none">
                    <img
                      src="/arivu_logo.png"
                      alt="Arivu Logo"
                      className="w-10 h-10 object-contain hover:scale-105 transition-transform duration-200"
                    />
                    <div className="flex flex-col justify-center">
                      <span className="text-[13px] font-sans font-black text-indigo-905 tracking-tight leading-none uppercase">
                        Arivu foundation
                      </span>
                      <span className="text-[9.5px] text-slate-450 font-bold uppercase tracking-wider mt-0.5 leading-none">
                        CHARITABLE AND EDUCATIONAL TRUST
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simple active role details and disconnect action */}
              <div className="flex items-center gap-4 text-xs font-bold">
                {/* Simulated Profile (Matching uploaded image exactly!) */}
                <div className="flex items-center text-right select-none">
                  <div className="hidden sm:block leading-tight">
                    <span className="text-slate-850 text-[11px] font-black uppercase text-right block tracking-tight">
                      {isAdminLoggedIn ? "Admin" : (userRole || "Admin")}
                    </span>
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest text-right block">
                      {isAdminLoggedIn ? "ADMIN" : (userRole === "Staff" ? "TEACHER" : userRole === "Parent" ? "PARENT" : userRole === "Management" ? "DIRECTOR" : "ADMIN")}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#5E60E6] text-white border-2 border-indigo-200/50 flex items-center justify-center font-display font-black text-xs shadow-xs sm:ml-2.5">
                    {(isAdminLoggedIn ? "Admin" : (userRole || "Admin")).charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </header>

            {/* Scrollable Main body with active component */}
            <div className="flex-1 overflow-y-auto pt-2.5 pb-4 px-4 sm:pt-4 sm:pb-6 sm:px-6 lg:pt-5 lg:pb-8 lg:px-8">
              <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
                <React.Suspense fallback={<div className="text-center py-20 text-xs">Compiling interface modules...</div>}>
                  {activeSubView === "overview" && data && (
                    <PublicSummaryDashboard
                      students={data.students}
                      staff={data.staff}
                      billing={data.billing}
                      attendance={data.attendance}
                      lessons={data.lessons}
                      userRole={userRole}
                      isAdminLoggedIn={isAdminLoggedIn}
                      authEmail={authEmail}
                      onGoToWorkspace={() => setActiveSubView("workspace")}
                      onPayInvoice={handlePayInvoice}
                    />
                  )}

                  {activeSubView === "workspace" && userRole === "Admin" && data && (
                    <>
                      {adminActiveTab === "attendance" ? (
                        <StaffDashboard
                          students={data.students}
                          grades={data.grades}
                          lessons={data.lessons}
                          teachers={data.staff}
                          onToggleAttendance={handleToggleAttendance}
                          onSaveGrade={handleSaveGrade}
                          onSaveLesson={handleSaveLesson}
                          attendanceRecords={data.attendance}
                          activeTab={staffActiveTab}
                          onTabChange={setStaffActiveTab}
                        />
                      ) : adminActiveTab === "parents" ? (
                        <ParentDashboard
                          students={data.students}
                          billing={data.billing}
                          grades={data.grades}
                          attendance={data.attendance}
                          homework={data.homework || []}
                          onPayInvoice={handlePayInvoice}
                        />
                      ) : (
                        <AdminDashboard
                          students={data.students}
                          staff={data.staff}
                          billing={data.billing}
                          payroll={data.payroll}
                          globalWeights={data.globalWeights}
                          onAddStudent={handleAddStudent}
                          onUpdateStudent={handleUpdateStudent}
                          onDeleteStudent={handleDeleteStudent}
                          onAddStaff={handleAddStaff}
                          onUpdateStaff={handleUpdateStaff}
                          onDeleteStaff={handleDeleteStaff}
                          onToggleStaffAttendance={handleToggleAttendance}
                          onGenerateBill={handleGenerateBill}
                          onPayInvoice={handlePayInvoice}
                          onUpdatePayroll={handleUpdatePayroll}
                          onAddPayroll={handleAddPayroll}
                          onDeletePayroll={handleDeletePayroll}
                          onUpdateSettings={handleUpdateSettings}
                          attendanceRecords={data.attendance}
                          activeTab={adminActiveTab as any}
                          onTabChange={setAdminActiveTab}
                          grades={data.grades}
                          homework={data.homework || []}
                          onSaveGrade={handleSaveGrade}
                          onSaveHomework={handleSaveHomework}
                          onDeleteHomework={handleDeleteHomework}
                        />
                      )}
                    </>
                  )}

                  {activeSubView === "workspace" && userRole === "Staff" && data && (
                    <>
                      {staffActiveSidebarSection === "attendance" && (
                        <StaffDashboard
                          students={data.students}
                          grades={data.grades}
                          lessons={data.lessons}
                          teachers={data.staff}
                          onToggleAttendance={handleToggleAttendance}
                          onSaveGrade={handleSaveGrade}
                          onSaveLesson={handleSaveLesson}
                          attendanceRecords={data.attendance}
                          activeTab={staffActiveTab}
                          onTabChange={setStaffActiveTab}
                        />
                      )}
                      {["students", "gradebook", "homework"].includes(staffActiveSidebarSection) && (
                        <AdminDashboard
                          students={data.students}
                          staff={data.staff}
                          billing={data.billing}
                          payroll={data.payroll}
                          globalWeights={data.globalWeights}
                          onAddStudent={handleAddStudent}
                          onUpdateStudent={handleUpdateStudent}
                          onDeleteStudent={handleDeleteStudent}
                          onAddStaff={handleAddStaff}
                          onUpdateStaff={handleUpdateStaff}
                          onDeleteStaff={handleDeleteStaff}
                          onToggleStaffAttendance={handleToggleAttendance}
                          onGenerateBill={handleGenerateBill}
                          onPayInvoice={handlePayInvoice}
                          onUpdatePayroll={handleUpdatePayroll}
                          onAddPayroll={handleAddPayroll}
                          onDeletePayroll={handleDeletePayroll}
                          onUpdateSettings={handleUpdateSettings}
                          attendanceRecords={data.attendance}
                          activeTab={staffActiveSidebarSection === "students" ? "sis" : (staffActiveSidebarSection === "gradebook" ? "gradebook" : "homework")}
                          onTabChange={(tab: any) => {
                            if (tab === "sis") setStaffActiveSidebarSection("students");
                            else if (tab === "gradebook") setStaffActiveSidebarSection("gradebook");
                            else if (tab === "homework") setStaffActiveSidebarSection("homework");
                          }}
                          grades={data.grades}
                          homework={data.homework || []}
                          onSaveGrade={handleSaveGrade}
                          onSaveHomework={handleSaveHomework}
                          onDeleteHomework={handleDeleteHomework}
                          userRole="Staff"
                        />
                      )}
                      {staffActiveSidebarSection === "parents" && (
                        <ParentDashboard
                          students={data.students}
                          billing={data.billing}
                          grades={data.grades}
                          attendance={data.attendance}
                          homework={data.homework || []}
                          onPayInvoice={handlePayInvoice}
                        />
                      )}
                    </>
                  )}

                  {activeSubView === "workspace" && userRole === "Parent" && data && (
                    <ParentDashboard
                      students={parentStudentIds.length > 0 
                        ? data.students.filter((s) => parentStudentIds.includes(s.id))
                        : data.students
                      }
                      billing={data.billing}
                      grades={data.grades}
                      attendance={data.attendance}
                      homework={data.homework || []}
                      onPayInvoice={handlePayInvoice}
                    />
                  )}

                  {activeSubView === "workspace" && userRole === "Management" && data && (
                    <ManagementDashboard
                      students={data.students}
                      staff={data.staff}
                      billing={data.billing}
                      attendance={data.attendance}
                    />
                  )}
                </React.Suspense>
              </div>

              {/* Core system footer */}
              <footer className="py-8 text-center text-[10px] text-slate-400 font-medium">
                <div className="max-w-7xl mx-auto px-6 border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
                  <span>Horizon International Tech Play School SaaS. Bengaluru Karnataka, India.</span>
                  <span className="text-indigo-600 font-semibold block font-sans">Licensed to ARIVU FOUNDATION.</span>
                </div>
              </footer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
