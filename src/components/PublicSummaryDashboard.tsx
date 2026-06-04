import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import HorizonLogo from "./HorizonLogo";
import { Student, StaffMember, Invoice, AttendanceRecord, LessonPlan, CourseType } from "../types";
import { 
  Users, 
  Calendar, 
  Coins, 
  Wallet, 
  CheckCircle, 
  TrendingUp, 
  Briefcase, 
  Clock,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  BarChart3,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
  AlertTriangle,
  Bell,
  AlertCircle
} from "lucide-react";

interface PublicSummaryDashboardProps {
  students: Student[];
  staff: StaffMember[];
  billing: Invoice[];
  attendance: AttendanceRecord[];
  lessons: LessonPlan[];
  userRole?: string | null;
  isAdminLoggedIn?: boolean;
  authEmail?: string;
  onGoToWorkspace?: () => void;
  onPayInvoice?: (invoiceId: string, paymentMethod?: string) => Promise<void>;
}

export default function PublicSummaryDashboard({
  students,
  staff,
  billing,
  attendance,
  lessons,
  userRole = null,
  isAdminLoggedIn = false,
  authEmail = "",
  onGoToWorkspace,
  onPayInvoice
}: PublicSummaryDashboardProps) {
  // Live ticking clock state
  const [currentTimeState, setCurrentTimeState] = useState<Date>(new Date());
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [sentSmsAlertIds, setSentSmsAlertIds] = useState<string[]>([]);
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeState(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time: "01:14:07 pm"
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'pm' : 'am';
    
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    
    return `${formattedHours < 10 ? '0' + formattedHours : formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
  };

  // Format date: "Tuesday, 02 June 2026"
  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    
    const formattedDay = day < 10 ? `0${day}` : day;
    
    return `${dayName}, ${formattedDay} ${monthName} ${year}`;
  };

  // Data Math & Aggregate values
  const activeStudents = students.filter(s => s.status === "Active");
  const totalStudentsCount = activeStudents.length;

  // Today's attendance percentage calculation
  const todayStr = "2026-06-02"; // Simulated current date in system
  const todayRecords = attendance.filter(a => a.date === todayStr && a.targetType === "student");
  const presentToday = todayRecords.filter(r => r.status === "Present" || r.status === "Late").length;
  const todayAttendancePercent = todayRecords.length > 0 
    ? Math.round((presentToday / todayRecords.length) * 100) 
    : 0; // matching "0%" as in the sample reference image

  // Billing math
  const totalInvoiced = billing.reduce((sum, b) => sum + b.totalAmount, 0);
  const paidFees = billing.filter(b => b.status === "Paid").reduce((sum, b) => sum + b.totalAmount, 0);
  const balanceFees = billing.filter(b => b.status === "Unpaid" || b.status === "Pending").reduce((sum, b) => sum + b.totalAmount, 0);

  // Total active staff count
  const activeStaffCount = staff.filter(s => s.status === "Active").length;

  // Let's gather course (class stream) distribution of students
  const classroomEnrolment = {
    [CourseType.DAY_CARE]: activeStudents.filter(s => s.course === CourseType.DAY_CARE).length,
    [CourseType.PRE_NURSERY]: activeStudents.filter(s => s.course === CourseType.PRE_NURSERY).length,
    [CourseType.NURSERY]: activeStudents.filter(s => s.course === CourseType.NURSERY).length,
    [CourseType.LKG]: activeStudents.filter(s => s.course === CourseType.LKG).length,
    [CourseType.UKG]: activeStudents.filter(s => s.course === CourseType.UKG).length,
  };

  // Generate 7 days attendance trend array for line graph
  const trendDays = [
    { date: "2026-05-27", rate: 92 },
    { date: "2026-05-28", rate: 88 },
    { date: "2026-05-29", rate: 95 },
    { date: "2026-05-30", rate: 0 }, // Saturday, weekend 0%
    { date: "2026-05-31", rate: 0 }, // Sunday, weekend 0%
    { date: "2026-06-01", rate: 90 },
    { date: "2026-06-02", rate: todayAttendancePercent }
  ];

  // Map simulated attendance records into real graph points if there is live data, overriding fallback
  const datesOfTrend = trendDays.map(d => d.date);
  const calculatedTrend = datesOfTrend.map(d => {
    const logs = attendance.filter(a => a.date === d && a.targetType === "student");
    if (logs.length > 0) {
      const presCount = logs.filter(l => l.status === "Present" || l.status === "Late").length;
      return { date: d, rate: Math.round((presCount / logs.length) * 100) };
    }
    // Fallback to beautiful realistic dataset matching play school routine
    const originalFallback = trendDays.find(fd => fd.date === d)?.rate ?? 90;
    return { date: d, rate: originalFallback };
  });

  // Determine role or name for greeting
  let displayGreetingName = "Guest";
  const activeRole = isAdminLoggedIn ? "Admin" : (userRole || "Guest");
  
  if (activeRole === "Admin") {
    displayGreetingName = "Admin";
  } else if (activeRole === "Staff") {
    displayGreetingName = "Staff";
  } else if (activeRole === "Parent") {
    displayGreetingName = "Parent";
  } else if (activeRole === "Management") {
    displayGreetingName = "Management";
  }

  if (authEmail && activeRole !== "Guest") {
    const matchingStaff = staff.find(
      (s) => s.email.toLowerCase() === authEmail.toLowerCase()
    );
    if (matchingStaff) {
      displayGreetingName = matchingStaff.name;
    } else {
      const matchingStudent = students.find(
        (st) => st.email.toLowerCase() === authEmail.toLowerCase() || st.contactPhone === authEmail
      );
      if (matchingStudent) {
        displayGreetingName = matchingStudent.fatherName || matchingStudent.motherName || "Parent";
      }
    }
  }

  // Analyze and compile alerts based on actual data states
  const computedAlerts: { 
    id: string;
    type: "attendance" | "invoice"; 
    message: string; 
    severity: "high" | "medium"; 
    studentId: string; 
    details: string; 
    studentName: string;
    contactPhone?: string;
    invoiceId?: string;
  }[] = [];

  students.forEach((student) => {
    const studentRecords = attendance.filter(
      (r) => r.targetId === student.id && r.targetType === "student"
    );
    const total = studentRecords.length;
    if (total > 0) {
      const absentCount = studentRecords.filter((r) => r.status === "Absent").length;
      const rate = ((total - absentCount) / total) * 100;
      if (rate < 85) {
        computedAlerts.push({
          id: `alert-att-${student.id}`,
          type: "attendance",
          message: `${student.name}'s attendance is critically low (${Math.round(rate)}%)`,
          severity: absentCount > 1 ? "high" : "medium",
          studentId: student.id,
          studentName: student.name,
          contactPhone: student.contactPhone,
          details: `${absentCount} absentees recorded out of ${total} days of observation. Needs direct attention.`
        });
      }
    }
  });

  billing.forEach((inv) => {
    if (inv.status === "Unpaid") {
      const student = students.find((s) => s.id === inv.studentId);
      const studName = student ? student.name : "Unknown Student";
      const isOverdue = new Date(inv.dueDate) < new Date();
      computedAlerts.push({
        id: `alert-inv-${inv.id}`,
        type: "invoice",
        message: `Outstanding ₹${inv.totalAmount.toLocaleString("en-IN")} invoice for ${studName}`,
        severity: isOverdue ? "high" : "medium",
        studentId: inv.studentId,
        studentName: studName,
        contactPhone: student?.contactPhone,
        invoiceId: inv.id,
        details: `Invoice for ${inv.term} was due on ${inv.dueDate}. Pending manual accounting reconciliation.`
      });
    }
  });

  const activeAlerts = computedAlerts.filter(alert => !acknowledgedAlertIds.includes(alert.id));

  return (
    <div className="space-y-6 select-none animate-fadeIn" id="operations-summary-dashboard">
      
      {/* 1. WELCOME BANNER WITH DYNAMIC LIVE IST CLOCK */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50/70 to-rose-50 border border-cyan-150/80 p-6 rounded-[28px] flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 relative overflow-hidden shadow-xs hover:shadow-sm transition-all duration-300">
        {/* Subtle decorative vector graphic background elements with vibrant color play */}
        <div className="absolute top-[-30px] right-[-20px] w-64 h-64 rounded-full bg-blue-200/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-30px] left-[-20px] w-64 h-64 rounded-full bg-rose-200/40 blur-3xl pointer-events-none" />
        <div className="absolute top-[20%] left-[35%] w-48 h-48 rounded-full bg-yellow-100/40 blur-2xl pointer-events-none" />
        <div className="absolute bottom-[-20px] right-[25%] w-44 h-44 rounded-full bg-emerald-100/30 blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <span className="inline-block px-3 py-1 text-[9.5px] font-black tracking-widest uppercase bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 rounded-full border border-indigo-100/40 shadow-3xs animate-pulse">
            ✨ Welcome Back
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display leading-none">
            Namasakara, <span className="bg-gradient-to-r from-indigo-600 via-rose-500 to-amber-500 bg-clip-text text-transparent font-black">{displayGreetingName}</span>
          </h2>
          <p className="text-slate-500 text-xs font-semibold">
            Here's how <strong className="text-indigo-600 font-extrabold font-sans">Horizon International</strong> is doing today.
          </p>
        </div>

        {/* Right side group containing clock, vertical divider and powered logo */}
        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full xl:w-auto shrink-0 select-none">
          {/* Dynamic IST Clock widget */}
          <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-100/80 shadow-md flex items-center gap-2.5 w-full sm:w-auto relative z-10 min-w-[150px] sm:min-w-[185px]">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 border border-slate-100 shrink-0">
              <Clock className="w-4 h-4 shrink-0" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[8px] uppercase font-black tracking-widest text-slate-455 font-mono">
                  LIVE ∙ IST
                </span>
              </div>
              <span className="block text-base font-mono font-extrabold text-slate-800 leading-none mt-0.5">
                {formatTime(currentTimeState)}
              </span>
              <span className="block text-[9px] text-slate-400 font-bold mt-0.5 font-sans">
                {formatDate(currentTimeState)}
              </span>
            </div>
          </div>

          {/* Vertical Divider (hidden on mobile, visible from sm up) */}
          <div className="hidden sm:block w-[1.5px] self-stretch bg-slate-200/80 my-1.5 mx-1 shrink-0" />

          {/* NextGen Gurukul Powered By Logo Widget */}
          <div className="flex flex-col items-center sm:items-start shrink-0 space-y-1 w-full sm:w-auto">
            <span className="text-[7.5px] font-black text-indigo-500/80 tracking-[0.2em] uppercase leading-none self-center sm:self-start pl-0.5">
              POWERED BY
            </span>
            
            {/* Playful Real PNG NextGen Gurukul Logo matching the uploaded design */}
            <div className="flex flex-col items-center justify-center shrink-0 w-[155px] sm:w-[170px] pt-0.5">
              <img 
                src="/nextgen_logo.png" 
                alt="Nextgen Gurukul Logo" 
                className="w-full h-auto select-none hover:scale-[1.03] transition-transform duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. SIX COLOURFUL CARDS GRID (PREMIUM GRADIENTS & FLOATING ANIMATED ICONS) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        
        {/* Card 1: ACTIVE STUDENTS (Indigo-Blue Theme) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ 
            y: -6, 
            scale: 1.02, 
            boxShadow: "0 20px 25px -5px rgba(99, 102, 241, 0.22), 0 8px 10px -6px rgba(99, 102, 241, 0.22)" 
          }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="bg-gradient-to-br from-[#EEF2FF] to-[#DBEAFE] border border-indigo-200/80 p-4 sm:p-5 rounded-[24px] shadow-md flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
          {/* Subtle colored card glow ornament */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-400/10 rounded-full blur-xl pointer-events-none transition-transform duration-500 group-hover:scale-150" />
          
          <div>
            <div className="flex items-center justify-between">
              <motion.div 
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#4F46E5] border border-indigo-100 shadow-sm shrink-0"
              >
                <Users className="w-5 h-5" />
              </motion.div>
              <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/10 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full shrink-0">
                SIS Hub
              </span>
            </div>
            
            <h4 className="text-indigo-700 font-black text-[9.5px] tracking-widest uppercase mt-4 leading-none">
              Active Students
            </h4>
          </div>
          <span className="text-3xl font-black text-indigo-950 font-sans mt-3.5 block leading-none">
            {totalStudentsCount}
          </span>
        </motion.div>
 
        {/* Card 2: TODAY'S ATTENDANCE (Emerald-Teal Theme) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ 
            y: -6, 
            scale: 1.02, 
            boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.22), 0 8px 10px -6px rgba(16, 185, 129, 0.22)" 
          }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] border border-emerald-200/80 p-4 sm:p-5 rounded-[24px] shadow-md flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
          {/* Subtle colored card glow ornament */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-400/10 rounded-full blur-xl pointer-events-none transition-transform duration-500 group-hover:scale-150" />

          <div>
            <div className="flex items-center justify-between">
              <motion.div 
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#059669] border border-emerald-100 shadow-sm shrink-0"
              >
                <Calendar className="w-5 h-5" />
              </motion.div>
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/10 text-[#059669] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                Daily
              </span>
            </div>

            <h4 className="text-[#059669] font-black text-[9.5px] tracking-widest uppercase mt-4 leading-none">
              Today's Attendance
            </h4>
          </div>
          <span className="text-3xl font-black text-emerald-950 font-sans mt-3.5 block leading-none">
            {todayAttendancePercent}%
          </span>
        </motion.div>
 
        {/* Card 3: TOTAL FEES (Violet-Lavender Theme) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ 
            y: -6, 
            scale: 1.02, 
            boxShadow: "0 20px 25px -5px rgba(139, 92, 246, 0.22), 0 8px 10px -6px rgba(139, 92, 246, 0.22)" 
          }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] border border-violet-200/80 p-4 sm:p-5 rounded-[24px] shadow-md flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
          {/* Subtle colored card glow ornament */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-violet-400/10 rounded-full blur-xl pointer-events-none transition-transform duration-500 group-hover:scale-150" />

          <div>
            <div className="flex items-center justify-between">
              <motion.div 
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#7C3AED] border border-violet-105 shadow-sm shrink-0"
              >
                <Coins className="w-5 h-5" />
              </motion.div>
              <span className="text-[10px] bg-violet-500/10 border border-violet-500/10 text-[#7C3AED] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                Invoiced
              </span>
            </div>

            <h4 className="text-[#7C3AED] font-black text-[9.5px] tracking-widest uppercase mt-4 leading-none">
              Total Fees
            </h4>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-violet-950 font-sans mt-3.5 block tracking-tight leading-none">
            ₹{totalInvoiced.toLocaleString("en-IN")}
          </span>
        </motion.div>
 
        {/* Card 4: PAID (Cyan-Teal Theme) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ 
            y: -6, 
            scale: 1.02, 
            boxShadow: "0 20px 25px -5px rgba(6, 182, 212, 0.22), 0 8px 10px -6px rgba(6, 182, 212, 0.22)" 
          }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="bg-gradient-to-br from-[#ECFEFF] to-[#CFFAFE] border border-cyan-200/80 p-4 sm:p-5 rounded-[24px] shadow-md flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
          {/* Subtle colored card glow ornament */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-400/10 rounded-full blur-xl pointer-events-none transition-transform duration-500 group-hover:scale-150" />

          <div>
            <div className="flex items-center justify-between">
              <motion.div 
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#0891B2] border border-cyan-100 shadow-sm shrink-0"
              >
                <Wallet className="w-5 h-5" />
              </motion.div>
              <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/10 text-[#0891B2] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                Cleared
              </span>
            </div>

            <h4 className="text-[#0891B2] font-black text-[9.5px] tracking-widest uppercase mt-4 leading-none">
              Paid
            </h4>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-cyan-950 font-sans mt-3.5 block tracking-tight leading-none">
            ₹{paidFees.toLocaleString("en-IN")}
          </span>
        </motion.div>
 
        {/* Card 5: BALANCE (Amber-Yellow Theme) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ 
            y: -6, 
            scale: 1.02, 
            boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.22), 0 8px 10px -6px rgba(245, 158, 11, 0.22)" 
          }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] border border-amber-200/80 p-4 sm:p-5 rounded-[24px] shadow-md flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
          {/* Subtle colored card glow ornament */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 rounded-full blur-xl pointer-events-none transition-transform duration-500 group-hover:scale-150" />

          <div>
            <div className="flex items-center justify-between">
              <motion.div 
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 2.9, ease: "easeInOut" }}
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#D97706] border border-amber-100 shadow-sm shrink-0 font-extrabold text-[16px]"
              >
                ₹
              </motion.div>
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/10 text-[#D97706] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                Pending
              </span>
            </div>

            <h4 className="text-[#D97706] font-black text-[9.5px] tracking-widest uppercase mt-4 leading-none">
              Balance
            </h4>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-950 font-sans mt-3.5 block tracking-tight leading-none font-sans">
            ₹{balanceFees.toLocaleString("en-IN")}
          </span>
        </motion.div>
 
        {/* Card 6: TOTAL STAFF (Rose-Red Theme) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ 
            y: -6, 
            scale: 1.02, 
            boxShadow: "0 20px 25px -5px rgba(239, 68, 68, 0.22), 0 8px 10px -6px rgba(239, 68, 68, 0.22)" 
          }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="bg-gradient-to-br from-[#FFF5F5] to-[#FEE2E2] border border-rose-200/80 p-4 sm:p-5 rounded-[24px] shadow-md flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
          {/* Subtle colored card glow ornament */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-400/10 rounded-full blur-xl pointer-events-none transition-transform duration-500 group-hover:scale-150" />

          <div>
            <div className="flex items-center justify-between">
              <motion.div 
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 3.4, ease: "easeInOut" }}
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#DC2626] border border-rose-100 shadow-sm shrink-0"
              >
                <Briefcase className="w-5 h-5" />
              </motion.div>
              <span className="text-[10px] bg-rose-500/10 border border-rose-500/10 text-[#DC2626] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                Staff
              </span>
            </div>

            <h4 className="text-[#DC2626] font-black text-[9.5px] tracking-widest uppercase mt-4 leading-none">
              Total Staff
            </h4>
          </div>
          <span className="text-3xl font-black text-rose-950 font-sans mt-3.5 block leading-none">
            {activeStaffCount}
          </span>
        </motion.div>
 
      </motion.div>

      {/* 3. TWO GRAPHS SECTION - ATTENDANCE TREND & STUDENTS BY CLASS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Attendance Trend Line Chart (8/12 space) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-[32px] border border-slate-150 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#EFF2FE] flex items-center justify-center text-[#3F51B5]">
                <TrendingUp className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 font-display leading-tight">
                  Attendance Trend
                </h3>
                <span className="text-[11px] text-[#4E54C8]/80 font-bold block">
                  Last 7 days · daily present rate
                </span>
              </div>
            </div>

            {/* Pulsing Live badge */}
            <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-emerald-100/60 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>

          {/* Fully custom, high-fidelity SVG Line Graph */}
          <div className="relative pt-2 h-[220px] w-full" id="attendance-line-graph-svg-container">
            <svg 
              className="w-full h-full overflow-visible" 
              viewBox="0 0 700 200" 
              preserveAspectRatio="none"
            >
              {/* Grid Lines */}
              <line x1="50" y1="20" x2="680" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="50" y1="60" x2="680" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="50" y1="100" x2="680" y2="100" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="50" y1="140" x2="680" y2="140" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="50" y1="180" x2="680" y2="180" stroke="#E2E8F0" strokeWidth="1.5" />

              {/* Y Axis Numeric Ticks */}
              <text x="35" y="24" className="text-[10px] font-mono font-bold text-slate-400 fill-current text-right" textAnchor="end">100</text>
              <text x="35" y="64" className="text-[10px] font-mono font-bold text-slate-400 fill-current text-right" textAnchor="end">75</text>
              <text x="35" y="104" className="text-[10px] font-mono font-bold text-slate-400 fill-current text-right" textAnchor="end">50</text>
              <text x="35" y="144" className="text-[10px] font-mono font-bold text-slate-400 fill-current text-right" textAnchor="end">25</text>
              <text x="35" y="184" className="text-[10px] font-mono font-bold text-slate-400 fill-current text-right" textAnchor="end">0</text>

              {/* Chart Line path calculation */}
              {/* x goes from 80 to 650 */}
              {/* y goes from 180 (value 0) to 20 (value 100) -> 180 - (rate * 1.6) */}
              {(() => {
                const getX = (index: number) => 80 + index * 95;
                const getY = (rate: number) => 180 - (rate * 1.6);
                
                // Construct path points
                const points = calculatedTrend.map((d, i) => `${getX(i)},${getY(d.rate)}`).join(" ");
                const areaPoints = [
                  `80,180`,
                  ...calculatedTrend.map((d, i) => `${getX(i)},${getY(d.rate)}`),
                  `${getX(calculatedTrend.length - 1)},180`
                ].join(" ");

                return (
                  <>
                    {/* Glowing Area Fill Under Graph */}
                    <defs>
                      <linearGradient id="attendanceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4E54C8" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#4E54C8" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>
                    <motion.polygon 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.8 }}
                      points={areaPoints} 
                      fill="url(#attendanceAreaGrad)" 
                    />

                    {/* Connecting Stroke Line */}
                    <motion.polyline
                      fill="none"
                      stroke="#4E54C8"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points}
                      className="drop-shadow-[0_2px_4px_rgba(78,84,200,0.25)]"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                    />

                    {/* Circular point nodes */}
                    {calculatedTrend.map((d, i) => {
                      const cx = getX(i);
                      const cy = getY(d.rate);
                      const isTarget = d.date === todayStr || d.rate > 0;
                      return (
                        <motion.g 
                          key={i} 
                          className="group/node cursor-pointer"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 1.0 + i * 0.08, type: "spring", stiffness: 150, damping: 11 }}
                        >
                          {/* Outer pulse hover ring */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r="11"
                            fill="#4E54C8"
                            fillOpacity="0.08"
                            className="transition-all duration-300 transform scale-50 group-hover/node:scale-100 opacity-0 group-hover/node:opacity-100"
                          />
                          {/* Outer solid rim */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r="6"
                            fill="#FFFFFF"
                            stroke="#4E54C8"
                            strokeWidth="3.5"
                            className="transition-all hover:scale-110"
                          />
                          {/* Inner glowing dot */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r="2"
                            fill="#4E54C8"
                          />

                          {/* Hover tooltip label */}
                          <foreignObject 
                            x={cx - 30} 
                            y={cy - 35} 
                            width="60" 
                            height="30"
                            className="opacity-0 group-hover/node:opacity-100 transition-opacity duration-205 pointer-events-none"
                          >
                            <div className="bg-slate-800 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded-md text-center shadow-md border border-slate-700">
                              {d.rate}%
                            </div>
                          </foreignObject>
                        </motion.g>
                      );
                    })}

                    {/* X Axis dates */}
                    {calculatedTrend.map((d, i) => (
                      <text
                        key={i}
                        x={getX(i)}
                        y="198"
                        className="text-[9.5px] font-mono font-bold text-slate-400 fill-current text-center"
                        textAnchor="middle"
                      >
                        {d.date}
                      </text>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Right: Students by Class Bar Chart (4/12 space) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[32px] border border-slate-150 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-[#7E57C2]">
              <BarChart3 className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 font-display leading-tight">
                Students by Class
              </h3>
              <span className="text-[11px] text-slate-400 font-bold block">
                Active enrollment
              </span>
            </div>
          </div>

          {/* Fully custom, responsive vertical column bar chart */}
          <div className="relative pt-4 h-[210px] w-full" id="class-distribution-bar-chart">
            {/* Find max count to normalize ratios */}
            {(() => {
              const values = Object.values(classroomEnrolment);
              const maxVal = Math.max(...values, 1, 4); // default axis maximum of 4 matching sample image

              const classesArr = [
                { key: CourseType.DAY_CARE, label: "Day-Care", val: classroomEnrolment[CourseType.DAY_CARE], color: "from-[#FF6B6B] to-[#FF8E53]" },
                { key: CourseType.PRE_NURSERY, label: "Pre-Nursery", val: classroomEnrolment[CourseType.PRE_NURSERY], color: "from-[#EC4899] to-[#F472B6]" },
                { key: CourseType.NURSERY, label: "Nursery", val: classroomEnrolment[CourseType.NURSERY], color: "from-[#4E54C8] to-[#8F94FB]" },
                { key: CourseType.LKG, label: "LKG", val: classroomEnrolment[CourseType.LKG], color: "from-[#11998E] to-[#38EF7D]" },
                { key: CourseType.UKG, label: "UKG", val: classroomEnrolment[CourseType.UKG], color: "from-[#F2994A] to-[#F2C94C]" }
              ];

              return (
                <div className="h-full flex flex-col justify-between">
                  
                  {/* Grid canvas / Bars layout */}
                  <div className="flex-1 flex items-end justify-around relative px-2 border-b border-slate-200 pb-1">
                    
                    {/* horizontal line markers */}
                    <div className="absolute inset-x-0 top-0 border-t border-slate-100/60 pointer-events-none" />
                    <div className="absolute inset-x-0 top-[25%] border-t stroke-dasharray border-slate-100/60 pointer-events-none" />
                    <div className="absolute inset-x-0 top-[50%] border-t stroke-dasharray border-slate-100/60 pointer-events-none" />
                    <div className="absolute inset-x-0 top-[75%] border-t stroke-dasharray border-slate-100/60 pointer-events-none" />

                    {classesArr.map((item, idx) => {
                      const percentHeight = Math.max((item.val / maxVal) * 100, 1.5);
                      return (
                        <div key={idx} className="flex flex-col items-center group relative z-10 w-1/5 max-w-[40px]">
                          
                          {/* Value counter display over column */}
                          <motion.span 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 0.8, scale: 1 }}
                            transition={{ delay: 0.4 + idx * 0.1, duration: 0.3 }}
                            className="text-[10px] font-mono font-black text-slate-700 mb-1.5 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200"
                          >
                            {item.val}
                          </motion.span>

                          {/* Column Bar graphic */}
                          <div className="w-full relative rounded-t-xl overflow-hidden shadow-xs">
                            <motion.div 
                              className={`w-full bg-gradient-to-t ${item.color} rounded-t-lg origin-bottom`}
                              initial={{ height: 0 }}
                              animate={{ height: `${(percentHeight * 110) / 100}px` }}
                              transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                            >
                              <div className="absolute inset-0 bg-transparent group-hover:bg-white/10 transition-colors duration-200" />
                            </motion.div>
                          </div>

                          {/* Popup helper */}
                          <div className="absolute top-[-35px] bg-slate-800 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-30 duration-200 whitespace-nowrap">
                            {item.label}: {item.val} kids
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Horizontal Labels */}
                  <div className="flex justify-around mt-2.5 text-[9.5px] font-bold text-slate-450 uppercase tracking-tight text-center">
                    {classesArr.map((item, idx) => (
                      <span key={idx} className="w-1/5 truncate" title={item.label}>
                        {item.label === "Day-Care" ? "D-Care" : item.label === "Pre-Nursery" ? "Pre-N" : item.label}
                      </span>
                    ))}
                  </div>

                </div>
              );
            })()}
          </div>
        </div>

      </div>

      {/* 3.5 INTERACTIVE PENDING ALERTS ADMINISTRATIVE KPI METRICS (CENTRAL SIS) */}
      {(userRole === "Admin" || isAdminLoggedIn || userRole === "Management" || userRole === "Staff") && (
        <div className="bg-white border border-slate-150 p-6 rounded-[28px] shadow-sm space-y-4" id="pending-alerts-kpi-block">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#991B1B] bg-red-50 border border-red-200/50 px-2.5 py-1 rounded-full w-fit block">
                  ⚙️ System Alert Dispatcher
                </span>
                {activeAlerts.length > 0 && (
                  <span className="px-2 py-0.5 bg-rose-600 text-white rounded-full text-[8.5px] font-black uppercase tracking-wider animate-pulse">
                    Action Required
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-800 font-display leading-tight">
                Interactive 'Pending Alerts' Administrative KPI Metrics (Central SIS)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Live monitoring of low pupil attendance flags and unpaid invoice ledger reconciliation.
              </p>
            </div>

            <button
              onClick={() => { if (activeAlerts.length > 0) setShowAlertsModal(true); }}
              disabled={activeAlerts.length === 0}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs shadow-xs transition duration-200 shrink-0 cursor-pointer ${
                activeAlerts.length > 0
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 hover:shadow-md"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Bell className="w-4 h-4 shrink-0 animate-pulse" />
              <span>Launch Resolution Hub ({activeAlerts.length})</span>
            </button>
          </div>

          {/* Quick inline stats inside the card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50/85 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                ⚠
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Low Attendance Flag</span>
                <span className="text-sm font-black text-slate-700">
                  {activeAlerts.filter(a => a.type === "attendance").length} Urgent warnings
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50/85 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                ₹
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Overdue Invoices</span>
                <span className="text-sm font-black text-slate-700">
                  {activeAlerts.filter(a => a.type === "invoice").length} Pending collections
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50/85 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                ✓
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Operations Status</span>
                <span className="text-sm font-black text-slate-700">
                  {activeAlerts.length === 0 ? "Ledger fully balanced" : "Resolutions pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALERTS DRAWER MODAL OVERLAY */}
      {showAlertsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-red-500 to-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight leading-none flex items-center gap-2">
                    Pending Administrative Alerts
                  </h3>
                  <p className="text-[11px] text-rose-100 mt-1 font-semibold">
                    Direct low attendance and outstanding ledger warnings needing manual follow-up
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAlertsModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* List area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeAlerts.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="font-extrabold text-slate-800">All alerts successfully manual actioned!</p>
                  <p className="text-xs mt-1">Excellent work, dashboard reports show clear balances.</p>
                </div>
              ) : (
                activeAlerts.map((alertItem) => {
                  const hasSentSms = sentSmsAlertIds.includes(alertItem.id);
                  return (
                    <div 
                      key={alertItem.id} 
                      className={`p-4 rounded-2xl border flex flex-col md:flex-row justify-between md:items-center gap-4 transition-all duration-200 ${
                        alertItem.severity === "high" 
                          ? "bg-red-50/40 border-red-100/80" 
                          : "bg-amber-50/40 border-amber-100/85"
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 select-text">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            alertItem.type === "attendance" 
                              ? "bg-amber-100 text-amber-800 border border-amber-200/50" 
                              : "bg-red-100 text-[#991B1B] border border-red-200/50"
                          }`}>
                            {alertItem.type}
                          </span>
                          {alertItem.severity === "high" && (
                            <span className="px-2 py-0.5 bg-red-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-xs">
                              High Priority
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-slate-800 leading-tight">
                          {alertItem.message}
                        </h4>
                        <p className="text-xs text-slate-550 font-semibold leading-relaxed">
                          {alertItem.details}
                        </p>
                        {alertItem.contactPhone && (
                          <p className="text-[10.5px] font-mono text-slate-400 font-bold">
                            Guardian Contact: {alertItem.contactPhone}
                          </p>
                        )}
                      </div>

                      {/* Manual Action buttons for alerts */}
                      <div className="flex items-center gap-2 shrink-0 md:self-center">
                        {alertItem.type === "attendance" && (
                          <button
                            onClick={() => {
                              setSentSmsAlertIds(prev => [...prev, alertItem.id]);
                              window.alert(`Direct SMS/Push warning simulation dispatched to Guardian of ${alertItem.studentName} (${alertItem.contactPhone}) detailing critical low attendance!`);
                            }}
                            disabled={hasSentSms}
                            className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition duration-200 shadow-xs cursor-pointer ${
                              hasSentSms 
                                ? "bg-emerald-100 text-emerald-800 cursor-not-allowed border border-emerald-200" 
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                          >
                            {hasSentSms ? "✓ SMS Alert Sent" : "Ping Guardian (SMS)"}
                          </button>
                        )}

                        {alertItem.type === "invoice" && onPayInvoice && (
                          <button
                            onClick={async () => {
                              if (alertItem.invoiceId) {
                                try {
                                  await onPayInvoice(alertItem.invoiceId, "Cash/Manual");
                                  window.alert(`Invoice paid & cleared successfully for ${alertItem.studentName}. Central SIS ledger balance recalculated!`);
                                } catch (e) {
                                  console.error(e);
                                }
                              }
                            }}
                            className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-extrabold text-[11px] transition shadow-xs cursor-pointer"
                          >
                            Collect Cash
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setAcknowledgedAlertIds(prev => [...prev, alertItem.id]);
                          }}
                          className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-[11px] transition cursor-pointer"
                          title="Acknowledge & dismiss alert for this session"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-semibold rounded-b-3xl">
              <span>Resolving outstanding items keeps SIS Ledger in full balance</span>
              <button 
                onClick={() => setShowAlertsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition cursor-pointer text-xs"
              >
                Close Panel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 4. ADDRESS / CONTACT FOOTER ATTACHMENT */}
      <div className="bg-slate-50 border border-slate-150 p-6 rounded-[28px] focus-within:ring-1 focus-within:ring-indigo-100 transition duration-300">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[9px] uppercase font-black tracking-widest text-[#6162CA] bg-indigo-50 border border-[#6162CA]/15 px-2.5 py-1 rounded-full w-fit block">
              🏫 Parent Information Portal
            </span>
            <p className="text-xs text-slate-550 max-w-4xl leading-relaxed font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 inline-block align-text-bottom mr-1" />
              <strong>Horizon International Tech Play School:</strong> No 46, 1st Cross, Shri Veeranjaneya Temple Road, near SLR Packagings, Thirumalapura, Bengaluru, Karnataka 560073. Connect instantly at our parent help desk.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <a 
              href="mailto:horizoninternational04@gmail.com" 
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100/50 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-2 shadow-2xs"
            >
              <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Mail Desk</span>
            </a>
            <a 
              href="tel:+917353101553" 
              className="px-4 py-2.5 rounded-2xl bg-[#EFF2FE] hover:bg-[#DEE4FE]/70 border border-[#DCE4FE] text-[#3F51B5] text-xs font-bold transition flex items-center gap-2 shadow-2xs"
            >
              <Phone className="w-4 h-4 text-[#3F51B5] shrink-0" />
              <span>Call Us</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
