/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Student, StaffMember, CourseType } from "../types";
import { 
  GraduationCap, 
  Calendar, 
  Sparkles, 
  LayoutGrid, 
  List, 
  Smile, 
  Zap, 
  Palette, 
  Brain, 
  Sun, 
  AlertCircle, 
  Phone, 
  Search, 
  Award, 
  Check,
  CheckCircle2,
  Sparkle,
  Heart,
  Moon,
  MessageSquare,
  Users,
  SmilePlus
} from "lucide-react";

interface StaffDashboardProps {
  students: Student[];
  grades?: any[];
  lessons?: any[];
  teachers: StaffMember[];
  onToggleAttendance: (payload: {
    targetId: string;
    targetType: "student" | "staff";
    date: string;
    status: "Present" | "Absent" | "Late";
    markedBy: string;
  }) => Promise<{ success: boolean; smsMessage?: string }>;
  onSaveGrade?: (grade: any) => Promise<void>;
  onSaveLesson?: (lesson: any) => Promise<void>;
  attendanceRecords: any[];
  activeTab?: string;
  onTabChange?: (tab: any) => void;
}

// Creative Pre-loaded engagement states to make the UI look colorful and fully realized from the start
const DEFAULT_VIBES: Record<string, { label: string; emoji: string; color: string; bg: string; text: string }> = {
  v1: { label: "Artistic & Drawing", emoji: "🎨", color: "from-pink-400 to-rose-500", bg: "bg-pink-50/70", text: "text-pink-700" },
  v2: { label: "Super Energetic", emoji: "⚡", color: "from-amber-400 to-orange-500", bg: "bg-amber-50/70", text: "text-amber-700" },
  v3: { label: "Highly Focused", emoji: "📚", color: "from-emerald-400 to-teal-500", bg: "bg-emerald-50/70", text: "text-emerald-700" },
  v4: { label: "Happy & Smiling", emoji: "😄", color: "from-sky-400 to-blue-500", bg: "bg-sky-50/70", text: "text-sky-700" },
  v5: { label: "Quiet & Listening", emoji: "🕊️", color: "from-indigo-400 to-purple-500", bg: "bg-indigo-50/70", text: "text-indigo-700" },
};

const VIBE_OPTIONS = [
  { key: "v4", label: "Happy", emoji: "😄", color: "from-sky-400 to-blue-500", bg: "bg-sky-50", text: "text-sky-700" },
  { key: "v2", label: "Energetic", emoji: "⚡", color: "from-amber-400 to-orange-500", bg: "bg-amber-50", text: "text-amber-700" },
  { key: "v1", label: "Artistic", emoji: "🎨", color: "from-pink-400 to-rose-500", bg: "bg-pink-50", text: "text-pink-700" },
  { key: "v3", label: "Focused", emoji: "📚", color: "from-emerald-400 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-500" },
  { key: "v5", label: "Quiet", emoji: "🕊️", color: "from-indigo-400 to-purple-500", bg: "bg-indigo-50", text: "text-indigo-750" },
];

export default function StaffDashboard({
  students,
  teachers,
  onToggleAttendance,
  attendanceRecords,
}: StaffDashboardProps) {
  // Pick active teacher profile for demonstration (Mrs. Preeti Sharma / Miss Sandra Fernandez)
  const [activeTeacherId, setActiveTeacherId] = useState<string>(
    teachers.find((t) => t.role === "Staff")?.id || "stf_2"
  );
  const teacher = teachers.find((t) => t.id === activeTeacherId) || teachers[0];

  const currentDateStr = new Date().toISOString().split("T")[0]; // "2026-06-02"
  const [selectedCourse, setSelectedCourse] = useState<CourseType | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // SMS Warning Trigger Feedback log
  const [smsLog, setSmsLog] = useState<{ name: string; phone: string; message: string } | null>(null);

  // Engagement Vibes State: Seed the first few children for gorgeous colors
  const [engagementVibes, setEngagementVibes] = useState<Record<string, string>>({
    "std_1": "v4",
    "std_2": "v2",
    "std_3": "v1",
    "std_4": "v3",
    "std_5": "v5",
    "std_6": "v4",
    "std_7": "v2",
  });

  // Filter students based on selected course/class and search queries
  const filteredStudents = students.filter((s) => {
    const isCourseMatch = selectedCourse === "ALL" || s.course === selectedCourse;
    const isSearchMatch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    return isCourseMatch && isSearchMatch && s.status === "Active";
  });

  // Stat calculations
  const totalKidsInClass = filteredStudents.length;
  const markedToday = filteredStudents.map(stud => {
    const rec = attendanceRecords.find(
      a => a.targetId === stud.id && a.date === currentDateStr && a.targetType === "student"
    );
    return rec ? rec.status : "Unmarked";
  });

  const presentCount = markedToday.filter(s => s === "Present" || s === "Late").length;
  const lateCount = markedToday.filter(s => s === "Late").length;
  const absentCount = markedToday.filter(s => s === "Absent").length;
  const unmarkedCount = markedToday.filter(s => s === "Unmarked").length;
  const attendanceRate = totalKidsInClass > 0 ? Math.round((presentCount / totalKidsInClass) * 100) : 100;

  // Attendance toggling
  const handleAttendanceChange = async (studentId: string, status: "Present" | "Absent" | "Late") => {
    const studentObj = students.find((s) => s.id === studentId);
    if (!studentObj) return;

    try {
      const res = await onToggleAttendance({
        targetId: studentId,
        targetType: "student",
        date: currentDateStr,
        status,
        markedBy: teacher.name,
      });

      if (status === "Absent" && res.smsMessage) {
        setSmsLog({
          name: studentObj.name,
          phone: studentObj.contactPhone,
          message: res.smsMessage,
        });
        setTimeout(() => setSmsLog(null), 7000);
      }
    } catch (err) {
      console.error("Failed to mark attendance:", err);
    }
  };

  // Mass mark all present
  const handleQuickMarkAllPresent = async () => {
    const unmarkedKids = filteredStudents.filter(stud => {
      const rec = attendanceRecords.find(
        a => a.targetId === stud.id && a.date === currentDateStr && a.targetType === "student"
      );
      return !rec;
    });

    if (unmarkedKids.length === 0) return;

    try {
      for (const kid of unmarkedKids) {
        await onToggleAttendance({
          targetId: kid.id,
          targetType: "student",
          date: currentDateStr,
          status: "Present",
          markedBy: teacher.name,
        });
      }
    } catch (err) {
      console.error("Failed to batch mark present:", err);
    }
  };

  // Custom colors corresponding to childhood education phases (Delightful & colorful visual system)
  const getCourseColorPalette = (course: string) => {
    switch(course) {
      case "Day-Care":
        return {
          bg: "bg-rose-50 hover:bg-rose-100/70 border-rose-100",
          activeBg: "bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 outline-rose-200",
          badge: "bg-rose-100 text-rose-700",
          accentColor: "text-rose-500",
          borderColor: "border-rose-200"
        };
      case "Pre-Nursery":
        return {
          bg: "bg-amber-50 hover:bg-amber-100/70 border-amber-100",
          activeBg: "bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 outline-amber-200",
          badge: "bg-amber-100 text-amber-700",
          accentColor: "text-amber-500",
          borderColor: "border-amber-200"
        };
      case "Nursery":
        return {
          bg: "bg-teal-50 hover:bg-teal-100/70 border-teal-100",
          activeBg: "bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 outline-teal-200",
          badge: "bg-teal-100 text-teal-700",
          accentColor: "text-teal-500",
          borderColor: "border-teal-200"
        };
      case "LKG":
        return {
          bg: "bg-indigo-50 hover:bg-indigo-100/70 border-indigo-100",
          activeBg: "bg-gradient-to-br from-indigo-500 via-violet-500 to-indigo-600 outline-indigo-200",
          badge: "bg-indigo-100 text-indigo-700",
          accentColor: "text-indigo-500",
          borderColor: "border-indigo-200"
        };
      case "UKG":
        return {
          bg: "bg-fuchsia-50 hover:bg-fuchsia-100/70 border-fuchsia-100",
          activeBg: "bg-gradient-to-br from-fuchsia-500 via-purple-500 to-fuchsia-600 outline-fuchsia-200",
          badge: "bg-fuchsia-100 text-fuchsia-700",
          accentColor: "text-fuchsia-500",
          borderColor: "border-fuchsia-200"
        };
      default:
        return {
          bg: "bg-slate-50 hover:bg-slate-100 border-slate-100",
          activeBg: "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 outline-slate-200",
          badge: "bg-slate-100 text-slate-700",
          accentColor: "text-indigo-500",
          borderColor: "border-slate-200"
        };
    }
  };

  const courseOptions = ["ALL", ...Object.values(CourseType)] as const;

  return (
    <div className="space-y-6" id="staff-dashboard-root">
      
      {/* 1. Master Premium Welcome Header & Stats Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Welcome Block with Colorful Mesh Background Overlay */}
        <div className="lg:col-span-7 bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#DB2777] rounded-[32px] p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-pink-500/25 rounded-full blur-3xl animate-pulse" />
          
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 border border-white/20 backdrop-blur-md rounded-full text-[11px] font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
              Preschooler Success Platform
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                Attendance & Engagement
              </h2>
              <p className="text-white/80 text-xs font-semibold max-w-md">
                Keep parents synchronized instantly. Capture child smiles, playfulness, and high attentiveness on active rosters daily.
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-white/10 pt-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-extrabold text-base border border-white/10">
                {teacher.name.charAt(0)}
              </div>
              <div>
                <span className="block text-[10px] text-white/60 font-black uppercase tracking-wider">Active Educator</span>
                <span className="font-extrabold text-sm">{teacher.name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-xl p-1 border border-white/5 self-stretch sm:self-auto">
              <select
                value={activeTeacherId}
                onChange={(e) => setActiveTeacherId(e.target.value)}
                className="bg-transparent text-xs font-bold text-white px-2 py-1.5 focus:outline-none cursor-pointer focus:ring-0 [&>option]:text-gray-900"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Real-time Dynamic Colorful Metrics (Absences, Present Ratio, Current Status) */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          
          {/* Active Attendance Rate Stat */}
          <div className="bg-white rounded-[28px] border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between items-start relative overflow-hidden group min-w-0">
            {/* Elegant SVG Emerald Mesh pattern background */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.05] select-none pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="staff-emerald-dots" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.2" fill="#10B981" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#staff-emerald-dots)" />
            </svg>

            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 relative z-10">
              <Smile className="w-5.5 h-5.5" />
            </div>
            
            <div className="mt-4 space-y-1 w-full min-w-0 relative z-10">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block truncate">Presence Quotient</span>
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="text-lg sm:text-xl xl:text-2xl font-black text-slate-800 tracking-tight truncate" title={`${attendanceRate}%`}>{attendanceRate}%</span>
                <span className="text-emerald-600 text-xs font-black shrink-0">↑ Good</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden select-none">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-700" 
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Absentees Pulse Card */}
          <div className="bg-white rounded-[28px] border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between items-start relative overflow-hidden group min-w-0">
            {/* Elegant SVG Rose Waves pattern background */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.06] select-none pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 40 Q 50 15, 100 40 T 200 40" fill="none" stroke="#F43F5E" strokeWidth="1" />
              <path d="M0 50 Q 50 25, 100 50 T 200 50" fill="none" stroke="#F43F5E" strokeWidth="1.5" className="opacity-40" />
            </svg>

            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:bg-rose-500/10 transition-colors" />
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 relative shrink-0 relative z-10">
              <AlertCircle className="w-5.5 h-5.5" />
              {absentCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-bounce">
                  {absentCount}
                </span>
              )}
            </div>
            
            <div className="mt-4 space-y-1 w-full min-w-0 relative z-10">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block truncate">Absences Today</span>
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="text-lg sm:text-xl xl:text-2xl font-black text-slate-800 tracking-tight truncate" title={absentCount.toString()}>{absentCount}</span>
                <span className="text-slate-400 text-xs font-bold shrink-0">Kids Count</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold leading-tight truncate">
                {absentCount > 0 ? "SMS Alerts dispatched to parents" : "Perfect attendance potential"}
              </p>
            </div>
          </div>

          {/* Quick Stats: Present & Late Breakdown */}
          <div className="bg-white rounded-[28px] border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 col-span-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Users className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Roster Logging Status</span>
                <span className="text-sm font-extrabold text-slate-700">
                  {presentCount}/{totalKidsInClass} Active Roster Present
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block">LATE ENTRIES</span>
                <span className="text-sm font-extrabold text-slate-800">{lateCount} Kids</span>
              </div>
              <div className="w-1.5 h-8 bg-amber-400 rounded-full" />
            </div>
          </div>

        </div>

      </div>

      {/* 2. Beautiful Playgroup & Classroom Ribbon Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
            Select Live Classroom Hub
          </label>
          <span className="text-xs font-bold text-indigo-600">
            Realtime syncing enabled
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {courseOptions.map((c) => {
            const count = students.filter(
              (s) => (c === "ALL" || s.course === c) && s.status === "Active"
            ).length;
            const isSelected = selectedCourse === c;
            const palette = getCourseColorPalette(c);
            
            return (
              <button
                key={c}
                onClick={() => setSelectedCourse(c)}
                className={`p-4 rounded-[24px] border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? `${palette.activeBg} text-white border-transparent shadow-[0_12px_24px_rgba(79,70,229,0.25)] scale-[1.03]`
                    : `${palette.bg} text-slate-700 border-gray-100`
                }`}
              >
                {/* Decorative circle on hover */}
                <div className="absolute inset-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <GraduationCap className={`w-5.5 h-5.5 transition-transform duration-300 group-hover:scale-110 ${
                  isSelected ? "text-white/90" : palette.accentColor
                }`} />
                
                <span className="font-extrabold text-xs tracking-tight uppercase leading-none mt-1">
                  {c === "ALL" ? "ALL CLASSES" : c}
                </span>

                <span
                  className={`text-[9px] px-2.5 py-0.5 rounded-full font-black leading-none mt-0.5 ${
                    isSelected ? "bg-white/20 text-white" : "bg-white/90 text-slate-600 shadow-3xs"
                  }`}
                >
                  {count} Kids
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Twilio simulation warning notification logs banner */}
      {smsLog && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-[24px] text-red-800 animate-slideUp text-xs space-y-1.5 shadow-sm relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-red-500 to-pink-500" />
          <div className="space-y-0.5 pl-2">
            <span className="font-black uppercase tracking-wider text-red-600 text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
              Alert Push Transmitted (Twilio Active Simulator)
            </span>
            <p className="font-semibold text-gray-700 max-w-2xl">
              Student <span className="font-black text-slate-800 underline decoration-red-300">{smsLog.name}</span> has been marked absent. Immediate SMS notification push delivered to parent: <span className="font-extrabold text-red-600 font-mono">{smsLog.phone}</span>.
            </p>
          </div>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-sans font-black text-[9px] uppercase tracking-wider self-start sm:self-auto shrink-0 shadow-3xs">
            SMS DELIVERED ✓
          </span>
        </div>
      )}

      {/* 4. Main Workspace Logs Area with Search, Filters, and Presets */}
      <div className="bg-white rounded-[32px] border border-gray-100 p-6 shadow-md space-y-6">
        
        {/* Workspace controls header bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-50 pb-5">
          <div className="space-y-0.5">
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              Daily Attendance & Engagement Grid
              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 font-mono">
                {selectedCourse === "ALL" ? "All Roster" : selectedCourse}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive logging workspace for <span className="font-bold text-indigo-600">{currentDateStr}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {/* Live Search bar */}
            <div className="relative flex items-center w-full sm:w-60">
              <span className="absolute left-3.5 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search kid by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50/50 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-150/40 focus:border-indigo-400 transition"
              />
            </div>

            {/* Quick action panel */}
            {unmarkedCount > 0 && (
              <button
                onClick={handleQuickMarkAllPresent}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl text-xs font-black hover:shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark All Present
              </button>
            )}

            {/* View Mode Toggle Switch */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition ${
                  viewMode === "grid"
                    ? "bg-white text-indigo-905 shadow-2xs font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Grid Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition ${
                  viewMode === "table"
                    ? "bg-white text-indigo-905 shadow-2xs font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Dense List
              </button>
            </div>
          </div>
        </div>

        {/* 5. Classroom view modes (Grid or Table) */}
        {filteredStudents.length > 0 ? (
          viewMode === "grid" ? (
            
            /* Visual Card Grid (Playful Preschooler Cards) */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredStudents.map((stud) => {
                const markedToday = attendanceRecords.find(
                  (a) =>
                    a.targetId === stud.id &&
                    a.date === currentDateStr &&
                    a.targetType === "student"
                );
                const status = markedToday ? markedToday.status : "Unmarked";
                
                // Active status border glow and styling
                let borderTheme = "border-slate-100 hover:border-slate-300 bg-white shadow-3xs";
                let statusGlow = "bg-slate-300";
                
                if (status === "Present") {
                  borderTheme = "border-emerald-350 bg-emerald-50/15 shadow-[0_4px_20px_rgba(16,185,129,0.06)] ring-1 ring-emerald-400/20";
                  statusGlow = "bg-emerald-500 animate-pulse";
                } else if (status === "Late") {
                  borderTheme = "border-amber-350 bg-amber-50/15 shadow-[0_4px_20px_rgba(245,158,11,0.06)] ring-1 ring-amber-400/20";
                  statusGlow = "bg-amber-500";
                } else if (status === "Absent") {
                  borderTheme = "border-rose-250 bg-rose-50/15 shadow-[0_4px_20px_rgba(244,63,94,0.06)] ring-1 ring-rose-400/20";
                  statusGlow = "bg-rose-500";
                }

                const currentVibeKey = engagementVibes[stud.id] || "v4";
                const vibe = DEFAULT_VIBES[currentVibeKey] || DEFAULT_VIBES.v4;

                const coursePalette = getCourseColorPalette(stud.course);

                return (
                  <div
                    key={stud.id}
                    className={`rounded-[28px] border p-5 transition-all duration-300 flex flex-col justify-between gap-5 relative group ${borderTheme}`}
                  >
                    
                    {/* Upper Line Info */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {/* Interactive Avatar Base with Initial Glow */}
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${vibe.color} text-white font-black text-sm flex items-center justify-center relative shadow-sm`}>
                          {stud.name.charAt(0)}
                          <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${statusGlow}`} />
                        </div>
                        
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm tracking-tight capitalize select-none">
                            {stud.name}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 block font-mono">
                            Roll {stud.rollNo} • Age {stud.age}
                          </span>
                        </div>
                      </div>

                      {/* Cute preschooler class label tag */}
                      <span className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full ${coursePalette.badge} border ${coursePalette.borderColor}`}>
                        {stud.course}
                      </span>
                    </div>

                    {/* Vibe / Mood tracker selector */}
                    <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Engagement Vibe
                        </span>
                        
                        <span className={`text-[10px] font-extrabold inline-flex items-center gap-1 ${vibe.text}`}>
                          <span>{vibe.emoji}</span>
                          <span>{vibe.label}</span>
                        </span>
                      </div>

                      {/* Clickable vibe emoticons */}
                      <div className="flex justify-between items-center gap-1 bg-white/70 shadow-4xs border border-slate-150/50 rounded-xl p-1">
                        {VIBE_OPTIONS.map((opt) => {
                          const isActive = currentVibeKey === opt.key;
                          return (
                            <button
                              key={opt.key}
                              onClick={() => {
                                setEngagementVibes({
                                  ...engagementVibes,
                                  [stud.id]: opt.key
                                });
                              }}
                              title={opt.label}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all duration-200 cursor-pointer ${
                                isActive 
                                  ? `${opt.bg} shadow-3xs scale-110 ring-1 ring-slate-100` 
                                  : "hover:bg-slate-100/75 opacity-60 hover:opacity-100"
                              }`}
                            >
                              {opt.emoji}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Footer Controls: Main Attendance Toggle Node */}
                    <div className="pt-1 border-t border-slate-50 flex flex-col gap-2">
                      
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleAttendanceChange(stud.id, "Present")}
                          className={`flex-1 py-2 rounded-xl text-[11px] font-black tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                            status === "Present"
                              ? "bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] font-black"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(stud.id, "Late")}
                          className={`flex-1 py-2 rounded-xl text-[11px] font-black tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                            status === "Late"
                              ? "bg-amber-500 text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)] font-black"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() => handleAttendanceChange(stud.id, "Absent")}
                          className={`flex-1 py-2 rounded-xl text-[11px] font-black tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                            status === "Absent"
                              ? "bg-rose-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)] font-black"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Absent
                        </button>
                      </div>

                      {/* Parent details snippet */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-1 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-350" />
                          {stud.contactPhone}
                        </span>
                        <span className="text-slate-350 select-none">
                          Emergency Contact
                        </span>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            
            /* Ultra Dense Master Table (Colorful Elements) */
            <div className="overflow-x-auto rounded-[24px] border border-slate-150/60 shadow-3xs">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#EFF4FC]/60 text-slate-700 text-[11px] font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 rounded-tl-xl text-center w-20">Roll Ref</th>
                    <th className="p-4">Preschooler student name</th>
                    <th className="p-4 w-32">Class Level</th>
                    <th className="p-4 text-center w-52">Engagement Vibe</th>
                    <th className="p-4 text-center">Roster Attendance Control</th>
                    <th className="p-4 rounded-tr-xl text-right w-44">Emergency Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((stud) => {
                    const markedToday = attendanceRecords.find(
                      (a) =>
                        a.targetId === stud.id &&
                        a.date === currentDateStr &&
                        a.targetType === "student"
                    );
                    const status = markedToday ? markedToday.status : "Unmarked";
                    const currentVibeKey = engagementVibes[stud.id] || "v4";
                    const vibe = DEFAULT_VIBES[currentVibeKey] || DEFAULT_VIBES.v4;
                    const coursePalette = getCourseColorPalette(stud.course);

                    return (
                      <tr
                        key={stud.id}
                        className="hover:bg-slate-50/50 transition duration-150"
                      >
                        <td className="p-4 font-mono font-black text-slate-400 text-center text-xs">
                          {stud.rollNo}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${vibe.color} text-white font-black text-xs flex items-center justify-center`}>
                              {stud.name.charAt(0)}
                            </span>
                            <div>
                              <span className="font-extrabold text-slate-755 hover:text-indigo-600 transition select-none block">
                                {stud.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold block">
                                Age {stud.age} • Gender {stud.gender}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md ${coursePalette.badge} border ${coursePalette.borderColor}`}>
                            {stud.course}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black ${vibe.bg} ${vibe.text} ring-1 ring-slate-100`}>
                            <span>{vibe.emoji}</span>
                            <span>{vibe.label}</span>
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {(["Present", "Absent", "Late"] as const).map((st) => (
                              <button
                                key={st}
                                onClick={() => handleAttendanceChange(stud.id, st)}
                                className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                  status === st
                                    ? st === "Present"
                                      ? "bg-green-500 text-white shadow-xs"
                                      : st === "Absent"
                                      ? "bg-rose-500 text-white shadow-xs"
                                      : "bg-amber-500 text-white shadow-xs"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-right font-bold text-slate-600 font-mono text-xs">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="text-[11px] text-slate-500 font-bold">{stud.contactPhone}</span>
                            <Phone className="w-3.5 h-3.5 text-slate-350" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          )
        ) : (
          <div className="text-center py-16 px-4 bg-slate-50 rounded-[28px] border border-dashed border-slate-200">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-700 text-sm">No matched preschool kids found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              We couldn't locate any active kid profiles matching "{searchQuery}" under class "{selectedCourse}". Retry with different parameters.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
