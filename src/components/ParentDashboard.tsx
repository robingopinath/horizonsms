/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Student, Invoice, GradeItem, AttendanceRecord, HomeworkRecord, LessonPlan, StaffMember } from "../types";
import { 
  CreditCard, 
  Calendar, 
  Award, 
  Receipt, 
  Milestone, 
  Sparkles, 
  Printer, 
  CheckCircle, 
  Smartphone, 
  BookOpen,
  Heart,
  MessageSquare,
  Smile,
  Clock,
  Shield,
  FileText,
  User,
  MapPin,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Image as ImageIcon,
  Phone,
  Mail,
  HelpCircle,
  Activity,
  SmilePlus,
  Send,
  Check,
  Sparkle
} from "lucide-react";
import HorizonLogo from "./HorizonLogo";
import ArivuLogo from "./ArivuLogo";

interface ParentDashboardProps {
  students: Student[];
  billing: Invoice[];
  grades: GradeItem[];
  attendance: AttendanceRecord[];
  homework: HomeworkRecord[];
  onPayInvoice: (invoiceId: string) => Promise<void>;
  lessons?: LessonPlan[];
  teachers?: StaffMember[];
  exams?: any[];
}

// Simulated High-End Preschool Visual Highlights Bank
const GALLERY_MOMENTS_PRESETS = [
  {
    id: "g1",
    title: "🎨 Rainbow Finger Painting",
    time: "Today, 10:15 AM",
    category: "Fine Motor & Art",
    description: "Practised finger control with organic water colors. Showed excellent color choices & high design engagement!",
    icon: "🎨",
    bgGradient: "from-rose-500/10 to-pink-500/10 text-rose-700 border-rose-200/50"
  },
  {
    id: "g2",
    title: "🧱 Lego Block Architecture",
    time: "Yesterday, 11:30 AM",
    category: "Cognitive Science",
    description: "Collaborated with peers to build a 10-tier tower structure. Explored spatial relations & geometric balances.",
    icon: "🧱",
    bgGradient: "from-amber-500/10 to-yellow-500/10 text-amber-700 border-amber-200/50"
  },
  {
    id: "g3",
    title: "📖 Group Story Circle Hours",
    time: "2 days ago, 09:45 AM",
    category: "Phonics & Language",
    description: "Actively listened to phonics stories, naming animal elements aloud and sounding out starting syllables.",
    icon: "📖",
    bgGradient: "from-indigo-500/10 to-blue-500/10 text-indigo-700 border-indigo-200/50"
  },
  {
    id: "g4",
    title: "🌱 Montessori Soil Gardening",
    time: "3 days ago, 12:15 PM",
    category: "Sensory Discovery",
    description: "Learned seed germination, examined damp soil under mini magnifying lenses, and watered custom organic pots.",
    icon: "🌱",
    bgGradient: "from-teal-500/10 to-emerald-500/10 text-teal-700 border-teal-200/50"
  }
];

// Preschool weekly theme configurations
const WEEKLY_PRESCHOOL_THEMES: Record<string, {
  themeTitle: string;
  emoji: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  focusMilestones: string[];
  sensoryTask: string;
  phonicsTriggers: string;
}> = {
  "Day-Care": {
    themeTitle: "🧸 Cozy Care & Sensory Discovery Week",
    emoji: "🧸",
    bgColor: "from-sky-50 to-blue-50/55",
    textColor: "text-sky-700",
    borderColor: "border-sky-200/60",
    focusMilestones: ["Fine motor grasp of plush blocks", "Gentle sound recognition", "Interactive social sharing", "Sustained nap durations"],
    sensoryTask: "Soft textile exploration using colored felt, sponge boards, and velvet sheets.",
    phonicsTriggers: "B-b-Bear, D-d-Doll sounds through soft music boxes."
  },
  "Pre-Nursery": {
    themeTitle: "🎨 Rainbow Water Painting & Color Bonding",
    emoji: "🎨",
    bgColor: "from-rose-50 to-pink-50/50",
    textColor: "text-rose-700",
    borderColor: "border-rose-200/60",
    focusMilestones: ["Primary colors naming", "Holding paint brushes with palm grips", "Spill-proof sand pouring", "Washing hands independently"],
    sensoryTask: "Water basin mixing of organic, safe vegetable dyes under light tables.",
    phonicsTriggers: "R-r-Red, B-b-Blue, Y-y-Yellow vocal rhyming."
  },
  "Nursery": {
    themeTitle: "🧱 Geometric Building & Spatial Explorer",
    emoji: "🧱",
    bgColor: "from-amber-50/85 to-yellow-50/60",
    textColor: "text-amber-700",
    borderColor: "border-amber-200/60",
    focusMilestones: ["Building 3-tier Lego block arches", "Identifying triangle & square facets", "Taking turns in sandbox stations", "Describing small emotions"],
    sensoryTask: "Kinetic sand moulding of castles paired with sorting smooth beach pebbles.",
    phonicsTriggers: "S-s-Square, T-t-Triangle block placement vocals."
  },
  "LKG": {
    themeTitle: "📖 Magical Alphabet Phonics & Nature Trails",
    emoji: "📖",
    bgColor: "from-indigo-50 to-purple-50/50",
    textColor: "text-indigo-700",
    borderColor: "border-indigo-200/60",
    focusMilestones: ["Sounding two-letter syllables", "Identifying initial consonants", "Tracing vertical and diagonal lines", "Group story interactive participation"],
    sensoryTask: "Collecting fall leaves and sorting them by size and textured rib lines under magnifiers.",
    phonicsTriggers: "Short-vowel triggers standard dictionary chants ('At', 'An', 'Up')."
  },
  "UKG": {
    themeTitle: "🚀 Solar System Explorers & Early Arithmetic",
    emoji: "🚀",
    bgColor: "from-emerald-50 to-teal-50/50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200/60",
    focusMilestones: ["Counting clusters up to 20", "Identifying planetary labels", "Writing short full names", "Active leadership in playground sports"],
    sensoryTask: "Damp clay modeling of stellar bodies & craters to understand planetary relief.",
    phonicsTriggers: "Blending complex digraphs ('Ch-Chat', 'Sh-Ship') with hand-claps."
  }
};

// Interactive Mascots
const KID_MASCOTS = [
  { emoji: "🦊", name: "Clever Fox", label: "Smart & Curious" },
  { emoji: "🦁", name: "Brave Lion", label: "Friendly Leader" },
  { emoji: "🐼", name: "Chubby Panda", label: "Calm & Creative" },
  { emoji: "🦄", name: "Dreamy Unicorn", label: "Imaginative Star" },
  { emoji: "🐨", name: "Kind Koala", label: "Gentle Sharer" }
];

export default function ParentDashboard({
  students,
  billing,
  grades,
  attendance,
  homework,
  onPayInvoice,
  lessons = [],
  teachers = [],
  exams = []
}: ParentDashboardProps) {
  // If multiple students exist, let parent select their child (highly intuitive)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");

  React.useEffect(() => {
    if (students.length > 0) {
      const exists = students.some((s) => s.id === selectedStudentId);
      if (!exists) {
        setSelectedStudentId(students[0].id);
      }
    } else {
      setSelectedStudentId("");
    }
  }, [students, selectedStudentId]);

  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "academics" | "homework" | "billing" | "teachers">("overview");
  const [academicsSubTab, setAcademicsSubTab] = useState<"marks" | "exams">("marks");
  const [showStripeModal, setShowStripeModal] = useState<Invoice | null>(null);
  const [stripeProcessing, setStripeProcessing] = useState(false);
  const [viewingInvoicepdf, setViewingInvoicepdf] = useState<Invoice | null>(null);

  // Kid mascot selection persisted in localStorage
  const [selectedMascot, setSelectedMascot] = useState<string>(() => {
    return localStorage.getItem("arivu_parent_selected_mascot") || "🦁";
  });

  const handleMascotChange = (emoji: string) => {
    setSelectedMascot(emoji);
    localStorage.setItem("arivu_parent_selected_mascot", emoji);
  };

  // Pre-school Kid's Active Food/Activity/Sleep logs simulation
  const [currentMood, setCurrentMood] = useState<string>("🎨 Creative");

  // Chat-note to Class Teacher state
  const [parentNoteText, setParentNoteText] = useState("");
  const [noteCategory, setNoteCategory] = useState("Sick Leave / Attendance Update");
  const [chatNotes, setChatNotes] = useState<Array<{
    id: string;
    studentId: string;
    category: string;
    message: string;
    timestamp: string;
    status: "Sent" | "Acknowledged";
    reply?: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem("arivu_parent_chat_notes");
      if (saved) return JSON.parse(saved);
    } catch {}
    // Defaults for visual engagement
    return [
      {
        id: "note-1",
        studentId: "",
        category: "🍛 Special Food Instructions",
        message: "Please ensure they drink coconut water and avoid peanut elements during midday fruit break.",
        timestamp: "Today, 08:30 AM",
        status: "Acknowledged",
        reply: "Absolutely. I have updated our kitchen team roster and notified our helper. Water bottle with child is monitored!"
      }
    ];
  });

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentNoteText.trim()) return;

    const newNote = {
      id: "note-" + Date.now(),
      studentId: selectedStudentId,
      category: noteCategory,
      message: parentNoteText.trim(),
      timestamp: "Just Now",
      status: "Sent" as const
    };

    const updated = [newNote, ...chatNotes];
    setChatNotes(updated);
    localStorage.setItem("arivu_parent_chat_notes", JSON.stringify(updated));
    setParentNoteText("");

    // Simulate quick auto-reply from class teacher
    setTimeout(() => {
      setChatNotes((prev) => {
        const next = prev.map((n) => {
          if (n.id === newNote.id) {
            let autoReply = "Thank you for the update. Active care routines are loaded for today's session.";
            if (noteCategory.includes("Leave")) {
              autoReply = "Received. We have marked the leave register and shared academic lesson slides. Hope they feel better soon!";
            } else if (noteCategory.includes("Food")) {
              autoReply = "Noted. Midday meal supervisors are updated to monitor food portions and hydration triggers.";
            } else if (noteCategory.includes("Nap")) {
              autoReply = "Acknowledged! We maintain cozy dark nooks and standard preschool nap durations. We will watch over them.";
            }
            return {
              ...n,
              status: "Acknowledged" as const,
              reply: autoReply
            };
          }
          return n;
        });
        localStorage.setItem("arivu_parent_chat_notes", JSON.stringify(next));
        return next;
      });
    }, 2500);
  };

  const handleDeleteNote = (id: string) => {
    const updated = chatNotes.filter((n) => n.id !== id);
    setChatNotes(updated);
    localStorage.setItem("arivu_parent_chat_notes", JSON.stringify(updated));
  };

  // Interactive sensory game practice and reaction states for kids
  const [completedHwIds, setCompletedHwIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("arivu_parent_hw_completed");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [hwReactions, setHwReactions] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("arivu_parent_hw_reactions");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleHwCompleted = (id: string) => {
    const next = { ...completedHwIds, [id]: !completedHwIds[id] };
    setCompletedHwIds(next);
    localStorage.setItem("arivu_parent_hw_completed", JSON.stringify(next));
  };

  const setHwReaction = (id: string, emoji: string) => {
    const next = { ...hwReactions, [id]: hwReactions[id] === emoji ? "" : emoji };
    setHwReactions(next);
    localStorage.setItem("arivu_parent_hw_reactions", JSON.stringify(next));
  };

  const student = students.find((s) => s.id === selectedStudentId);
  if (!student) {
    return (
      <div className="p-12 text-center bg-white rounded-[32px] border border-gray-100 shadow-xl max-w-lg mx-auto" id="parent-dashboard-empty">
        <Milestone className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-gray-800">No active student profiles found.</h3>
        <p className="text-gray-500 mt-2 text-sm leading-relaxed">Please create registered student records in the Admin tab first to see the parent workspace.</p>
      </div>
    );
  }

  // Filter items matching selected child
  const childBilling = billing.filter((b) => b.studentId === student.id);
  const childGrades = grades.filter((g) => g.studentId === student.id);
  const childAttendance = attendance.filter(
    (a) => a.targetId === student.id && a.targetType === "student"
  );

  // Math stats
  const totalDays = childAttendance.length;
  const presentDays = childAttendance.filter((a) => a.status === "Present" || a.status === "Late").length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  // Custom Stripe trigger simulation
  const handleStripePayment = async () => {
    if (!showStripeModal) return;
    setStripeProcessing(true);
    setTimeout(async () => {
      try {
        await onPayInvoice(showStripeModal.id);
        setShowStripeModal(null);
      } catch (err) {
        console.error(err);
      } finally {
        setStripeProcessing(false);
      }
    }, 1500);
  };

  const handlePrint = () => {
    window.focus();
    window.print();
  };

  // Class theme helpers
  const getClassTheme = (course: string) => {
    switch (course) {
      case "Day-Care":
        return {
          primary: "text-emerald-600 bg-emerald-50 border-emerald-100",
          gradient: "from-emerald-500 to-teal-500 hover:shadow-emerald-600/10",
          bgLight: "bg-emerald-50/30",
          dot: "bg-emerald-500"
        };
      case "Pre-Nursery":
        return {
          primary: "text-rose-600 bg-rose-50 border-rose-100",
          gradient: "from-rose-500 to-pink-500 hover:shadow-rose-600/10",
          bgLight: "bg-rose-50/30",
          dot: "bg-rose-500"
        };
      case "Nursery":
        return {
          primary: "text-amber-600 bg-amber-50 border-amber-100",
          gradient: "from-amber-500 to-orange-500 hover:shadow-amber-600/10",
          bgLight: "bg-amber-50/30",
          dot: "bg-amber-500"
        };
      case "LKG":
        return {
          primary: "text-violet-600 bg-violet-50 border-violet-100",
          gradient: "from-violet-500 to-indigo-500 hover:shadow-violet-600/10",
          bgLight: "bg-violet-50/30",
          dot: "bg-violet-500"
        };
      case "UKG":
        return {
          primary: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100",
          gradient: "from-fuchsia-500 to-pink-500 hover:shadow-fuchsia-600/10",
          bgLight: "bg-fuchsia-50/30",
          dot: "bg-fuchsia-500"
        };
      default:
        return {
          primary: "text-indigo-600 bg-indigo-50 border-indigo-150",
          gradient: "from-[#4E54C8] to-[#8F94FB] hover:shadow-indigo-600/10",
          bgLight: "bg-indigo-50/30",
          dot: "bg-indigo-500"
        };
    }
  };

  const activeTheme = getClassTheme(student.course);

  return (
    <div className="space-y-6 lg:space-y-8" id="parent-dashboard-root">
      
      {/* 1. Immersive Dedicated Parent Portal URL Announcement Card */}
      <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-pink-50 border border-indigo-150 p-5 rounded-[28px] flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-xs relative overflow-hidden transition-all duration-300 hover:border-indigo-200">
        <div className="absolute right-0 top-0 select-none opacity-[0.06] transform translate-x-12 -translate-y-6">
          <BookOpen className="w-56 h-56 text-indigo-900" />
        </div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-gradient-to-tr from-pink-500 to-indigo-600 text-white p-3 rounded-2xl shrink-0 shadow-md shadow-indigo-600/10">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-[13px] font-black text-indigo-950 uppercase tracking-tight flex items-center gap-2">
              <span>Secure Parent Login Portal Activated</span>
              <span className="inline-flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </h4>
            <p className="text-[11.5px] text-indigo-900/85 font-medium leading-relaxed max-w-2xl">
              NextGen Gurukul isolates direct visual and ledger credentials for parents. Copy and share this dedicated portal link so other guardians can directly access report cards without SaaS admin interference:
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1.5">
              <span className="text-[9.2px] uppercase font-black tracking-widest text-indigo-700 bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                Direct Desk URL
              </span>
              <code className="text-[11px] font-mono font-bold bg-indigo-950 text-indigo-100 px-3 py-1 rounded-lg border border-indigo-800 shadow-xs">
                {typeof window !== "undefined" ? window.location.origin + "/parent-login" : "/parent-login"}
              </code>
              <span className="text-[10px] text-slate-500 font-medium">
                (or Hash bookmark: <code className="font-mono bg-indigo-100 text-indigo-950 px-1 rounded font-bold">#/parent-login</code>)
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => {
            const copyUrl = typeof window !== "undefined" ? window.location.origin + "/parent-login" : "https://horizon.com/parent-login";
            navigator.clipboard.writeText(copyUrl);
            alert("✨ Parent Secure Login URL copied successfully!\n" + copyUrl);
          }}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition hover:shadow-lg hover:shadow-indigo-600/15 active:scale-95 shrink-0 cursor-pointer border border-indigo-700/50 self-start xl:self-auto relative z-10"
        >
          Copy Access URL
        </button>
      </div>

      {/* 2. Interactive Children Switcher & Mascot Ribbon */}
      <div className={`bg-gradient-to-r ${activeTheme.gradient} rounded-[32px] p-6 lg:p-7 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all duration-500`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4.5">
          <div className="bg-white/10 hover:bg-white/20 p-4 rounded-2.5xl backdrop-blur-md self-start sm:self-auto transition">
            <span className="text-4xl select-none" role="img" aria-label="mascot">
              {selectedMascot}
            </span>
          </div>
          <div>
            <span className="text-[10.5px] text-white/80 font-bold uppercase tracking-wider block">GURUKUL FAMILY DASHBOARD</span>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <label className="text-sm font-bold text-white/90">Active Kid:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-white/15 hover:bg-white/25 text-white font-black text-base rounded-[16px] px-3.5 py-2 border border-white/20 outline-none focus:ring-2 focus:ring-white/50 transition cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id} className="text-slate-900 font-extrabold text-sm">
                    {s.name} ({s.course})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Mascot & Mood Picker block */}
        <div className="hidden sm:flex flex-col gap-1 bg-black/15 p-3 rounded-2.5xl border border-white/5">
          <span className="text-[9.5px] font-black text-white/70 uppercase tracking-widest pl-1">
            Choose Mascot Companion
          </span>
          <div className="flex gap-2.5 mt-1">
            {KID_MASCOTS.map((m) => (
              <button
                key={m.emoji}
                type="button"
                onClick={() => handleMascotChange(m.emoji)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-350 cursor-pointer ${
                  selectedMascot === m.emoji 
                    ? "bg-white text-slate-900 scale-110 shadow-md border-2 border-amber-350" 
                    : "bg-white/5 hover:bg-white/10"
                }`}
                title={`${m.name} - ${m.label}`}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Pre-School Style Bubbly Tab Bar Switches */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-2.5 bg-white border border-slate-100 p-2 rounded-[24px] shadow-xs shrink-0">
          {(["overview", "attendance", "academics", "homework", "teachers", "billing"] as const).map((tab) => {
            const isActive = activeTab === tab;
            let themeIcon = <Smile className="w-4 h-4" />;
            if (tab === "attendance") themeIcon = <Calendar className="w-4 h-4" />;
            if (tab === "academics") themeIcon = <Award className="w-4 h-4" />;
            if (tab === "homework") themeIcon = <BookOpen className="w-4 h-4" />;
            if (tab === "teachers") themeIcon = <Sparkles className="w-4 h-4" />;
            if (tab === "billing") themeIcon = <Receipt className="w-4 h-4" />;

            const colMap = {
              overview: "hover:bg-indigo-50 hover:text-indigo-600 text-indigo-600 bg-indigo-50",
              attendance: "hover:bg-emerald-50 hover:text-emerald-600 text-emerald-600 bg-emerald-50",
              academics: "hover:bg-violet-50 hover:text-violet-600 text-violet-600 bg-violet-50",
              homework: "hover:bg-rose-50 hover:text-rose-600 text-rose-600 bg-rose-50",
              teachers: "hover:bg-fuchsia-50 hover:text-fuchsia-600 text-fuchsia-600 bg-fuchsia-50",
              billing: "hover:bg-amber-50 hover:text-amber-600 text-amber-600 bg-amber-50"
            };

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4.5 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-2 shrink-0 ${
                  isActive
                    ? `${colMap[tab]} shadow-sm border border-current/15`
                    : "text-slate-500 hover:bg-slate-50 border border-transparent"
                }`}
              >
                {themeIcon}
                <span>{tab === "homework" ? "Daily Play Bulletin" : tab === "teachers" ? "Teachers & Lessons" : tab}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN TAB PANEL VIEWS */}

      {/* TAB A: OVERVIEW - Playful preschool center */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Child Profile Visual Identity Panel */}
            <div className="lg:col-span-4 bg-white rounded-[32px] border border-gray-150 p-6 shadow-sm space-y-6">
              <div className="text-center pb-6 border-b border-gray-100 relative">
                
                {/* Visual Mascot aura background */}
                <div className="absolute inset-x-0 top-0 select-none opacity-[0.03] pointer-events-none flex justify-center">
                  <span className="text-[120px] leading-none">{selectedMascot}</span>
                </div>

                <div className={`w-24 h-24 rounded-[32px] bg-gradient-to-tr ${activeTheme.gradient} mx-auto flex items-center justify-center text-white text-4xl font-black shadow-lg relative z-10 hover:rotate-6 transition duration-300`}>
                  {student.name.charAt(0)}
                  <span className="absolute -bottom-1 -right-1 text-2xl bg-white p-1 rounded-xl shadow-md border border-slate-100 select-none">
                    {selectedMascot}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-800 mt-4 leading-tight">{student.name}</h3>
                
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-extrabold rounded-full border ${activeTheme.primary}`}>
                    <span className={`w-2 h-2 rounded-full ${activeTheme.dot} animate-pulse`} />
                    {student.course} class
                  </span>
                  <span className="bg-slate-100 text-slate-600 font-extrabold text-[10px] uppercase tracking-wider py-1 px-3.5 rounded-full border border-slate-200">
                    Roll #{student.rollNo}
                  </span>
                </div>
              </div>

              {/* Development Vital Stats list */}
              <div className="space-y-3.5 text-xs">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                  PRESCHOOL BIO CREDENTIALS
                </h4>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-150/60 font-medium">
                  <span className="text-slate-500">Maturity / Age</span>
                  <span className="font-extrabold text-slate-800">{student.age} Years Old</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-150/60 font-medium">
                  <span className="text-slate-500">Gender classification</span>
                  <span className="font-extrabold text-slate-800">{student.gender}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-150/60 font-medium">
                  <span className="text-slate-500">Guardian Contact</span>
                  <span className="font-extrabold text-slate-800">{student.fatherName}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-150/60 font-medium">
                  <span className="text-slate-500">Mother / Secondary</span>
                  <span className="font-extrabold text-slate-800">{student.motherName}</span>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-black text-slate-400 block tracking-widest uppercase mb-1.5">
                    REGISTERED ADDRESS CONTACT
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed bg-slate-5Q p-3.5 rounded-2xl border border-slate-150/60 flex items-start gap-2 bg-slate-50">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{student.address}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Preschool Dynamic Metrics & Timeline */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Top Row Bubbly Metric Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Play-Rate Gauge */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-6 rounded-[28px] text-white shadow-sm relative overflow-hidden group hover:shadow-md transition">
                  <svg className="absolute inset-0 w-full h-full opacity-[0.08] select-none pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="dotpattern" width="14" height="14" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.5" fill="white" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dotpattern)" />
                  </svg>
                  
                  <div className="relative z-10 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-100">Preschool Presence Quote</span>
                      <Calendar className="w-5 h-5 text-emerald-100" />
                    </div>
                    <div className="text-3xl font-black">{attendanceRate}%</div>
                    <p className="text-[11px] text-emerald-100/90 font-medium leading-relaxed">
                      Syncs with daily safe arrival registry. <strong className="font-bold underline">{presentDays}</strong> of <strong className="font-bold underline">{totalDays} sched</strong> days present.
                    </p>
                  </div>
                  <div className="absolute -right-6 -bottom-6 text-white/10 rotate-12 select-none z-0 group-hover:scale-110 transition duration-500">
                    <Smile className="w-32 h-32" />
                  </div>
                </div>

                {/* 2. Outstanding Balance */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 rounded-[28px] text-white shadow-sm relative overflow-hidden group hover:shadow-md transition">
                  <svg className="absolute inset-0 w-full h-full opacity-[0.06] select-none pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 40 Q 60 20, 120 40 T 240 40 T 360 40" fill="none" stroke="white" strokeWidth="2" />
                  </svg>

                  <div className="relative z-10 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-100">Pending Ledger Dues</span>
                      <Receipt className="w-5 h-5 text-amber-100" />
                    </div>
                    <div className="text-3xl font-black">
                      ₹{childBilling.filter((b) => b.status !== "Paid").reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString("en-IN")}
                    </div>
                    <p className="text-[11px] text-amber-100/90 font-medium leading-relaxed">
                      Total invoices pending clear: <strong className="font-bold bg-white/20 px-1.5 py-0.5 rounded-md">{childBilling.filter((b) => b.status !== "Paid").length} bill(s)</strong>.
                    </p>
                  </div>
                  <div className="absolute -right-6 -bottom-6 text-white/10 rotate-12 select-none z-0 group-hover:scale-110 transition duration-500">
                    <CreditCard className="w-32 h-32" />
                  </div>
                </div>
              </div>

              {/* School Daily Routine Tracker Panel */}
              <div className="bg-white rounded-[32px] border border-gray-150 p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="space-y-0.5">
                    <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-500" />
                      <span>Today's Play-Routine Timeline</span>
                    </h4>
                    <p className="text-xs text-slate-550">Typical Montessori curriculum sequence for child reference</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-500">Mascot State:</span>
                    <select
                      value={currentMood}
                      onChange={(e) => setCurrentMood(e.target.value)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] rounded-lg border border-indigo-250 px-2 py-1 select-none pointer-events-auto"
                    >
                      <option>🎨 Creative Play</option>
                      <option>🥪 Midday Snack</option>
                      <option>🗣️ Rhymes Circle Room</option>
                      <option>💤 Afternoon Rest</option>
                      <option>🌟 Full Energy</option>
                    </select>
                  </div>
                </div>

                {/* Vertical Timeline sequence */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 relative">
                  <div className="absolute top-[28px] left-[15px] right-[15px] h-0.5 bg-dashed bg-indigo-100 select-none hidden sm:block z-0" />
                  
                  <div className="bg-slate-50 p-4 rounded-2.5xl border border-slate-150 relative z-10 text-center flex sm:flex-col items-center sm:items-center gap-3 sm:gap-1 shadow-2xs">
                    <span className="text-lg w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold">✓</span>
                    <div className="text-left sm:text-center shrink">
                      <div className="text-[10px] text-slate-400 font-black tracking-wider uppercase">09:00 AM</div>
                      <div className="font-extrabold text-slate-800 text-[11.5px] mt-0.5">Warm Welcome</div>
                      <div className="text-[10px] text-slate-450">Health Screening</div>
                    </div>
                  </div>

                  <div className="bg-indigo-50/50 p-4 rounded-2.5xl border border-indigo-150 relative z-10 text-center flex sm:flex-col items-center sm:items-center gap-3 sm:gap-1 shadow-2xs">
                    <span className="text-lg w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">★</span>
                    <div className="text-left sm:text-center shrink">
                      <div className="text-[10px] text-indigo-500 font-black tracking-wider uppercase">10:00 AM</div>
                      <div className="font-extrabold text-indigo-950 text-[11.5px] mt-0.5">Montessori Circle</div>
                      <div className="text-[10px] text-indigo-700">Sensory Math Blocks</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2.5xl border border-slate-150 relative z-10 text-center flex sm:flex-col items-center sm:items-center gap-3 sm:gap-1 shadow-2xs">
                    <span className="text-lg w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold font-mono">3</span>
                    <div className="text-left sm:text-center shrink">
                      <div className="text-[10px] text-slate-450 font-black tracking-wider uppercase">11:15 AM</div>
                      <div className="font-extrabold text-slate-800 text-[11.5px] mt-0.5">Phonics Rhymes</div>
                      <div className="text-[10px] text-slate-450">English Oral Play</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2.5xl border border-slate-150 relative z-10 text-center flex sm:flex-col items-center sm:items-center gap-3 sm:gap-1 shadow-2xs">
                    <span className="text-lg w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold font-mono">4</span>
                    <div className="text-left sm:text-center shrink">
                      <div className="text-[10px] text-slate-450 font-black tracking-wider uppercase">12:15 PM</div>
                      <div className="font-extrabold text-slate-800 text-[11.5px] mt-0.5">Dispersal / Rest</div>
                      <div className="text-[10px] text-slate-450">Roster Check-out</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pre-School Classroom Memories: Photo Gallery Feed */}
              <div className="bg-white rounded-[32px] border border-gray-150 p-6 shadow-sm space-y-5">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-pink-500 animate-pulse" />
                      <span>Gurukul Visual Memory Board</span>
                    </h4>
                    <p className="text-xs text-slate-550">Moments of physical play & sensory coordinates captured this week</p>
                  </div>
                  <span className="text-[10px] font-black text-pink-600 bg-pink-50 border border-pink-100 rounded-md px-2 py-0.5">
                    LIVE STREAM
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {GALLERY_MOMENTS_PRESETS.map((m) => (
                    <div key={m.id} className="group border border-slate-100 rounded-2.5xl overflow-hidden shadow-2xs hover:shadow-xs transition duration-300">
                      {/* Artistic Placeholder representation with gradient - matches system constraints */}
                      <div className={`p-6 bg-gradient-to-tr ${m.bgGradient} h-28 flex flex-col justify-between items-start relative select-none`}>
                        <span className="text-xs font-black uppercase bg-white/70 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                          {m.category}
                        </span>
                        <div className="text-2xl">{m.icon}</div>
                        <div className="absolute right-3.5 bottom-3 text-[10px] font-semibold opacity-60">
                          {m.time}
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-1.5 bg-slate-50/50">
                        <h5 className="font-extrabold text-xs text-slate-900">{m.title}</h5>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Notes to Teacher */}
              <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 border border-indigo-950 p-6 rounded-[32px] text-white space-y-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-2xl text-yellow-300 shadow-inner">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-black text-white text-sm tracking-tight">Active Parent-Teacher Connection Desk</h4>
                    <p className="text-xs text-indigo-200">Simulate dropping an update (e.g. sick leave, allergy change, nap hours) to class teacher</p>
                  </div>
                </div>

                {/* Form to compose note */}
                <form onSubmit={handleSendNote} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-black uppercase text-indigo-300 block">Topic / Category</label>
                      <select
                        value={noteCategory}
                        onChange={(e) => setNoteCategory(e.target.value)}
                        className="w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-white/50 text-xs font-extrabold"
                      >
                        <option className="text-slate-900">Sick Leave / Attendance Update</option>
                        <option className="text-slate-900">🍛 Special Food Instructions</option>
                        <option className="text-slate-900">😴 Afternoon Nap Request</option>
                        <option className="text-slate-900">📋 Gate Release / Pick Up update</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9.5px] font-black uppercase text-indigo-300 block">Recipient Classroom</label>
                      <input
                        type="text"
                        disabled
                        value={`Principal Office & Class Roster (${student.course})`}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-indigo-200 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="text-[9.5px] font-black uppercase text-indigo-300 block">My Short Update message</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={parentNoteText}
                        onChange={(e) => setParentNoteText(e.target.value)}
                        placeholder="e.g. Please check if they took lunch, or let them play in sandbox..."
                        className="w-full pl-4.5 pr-12 py-3.5 bg-indigo-950 text-white placeholder-indigo-300/60 rounded-2xl border border-white/15 focus:outline-none focus:ring-2 focus:ring-pink-500/30 text-xs font-bold"
                      />
                      <button
                        type="submit"
                        disabled={!parentNoteText.trim()}
                        className="absolute inset-y-1.5 right-1.5 w-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-white/10 disabled:text-indigo-400 text-white rounded-xl flex items-center justify-center transition cursor-pointer"
                        title="Send note"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </form>

                {/* Sent update items with simulated replies */}
                <div className="space-y-3.5 pt-3 border-t border-white/10 text-xs">
                  <span className="text-[9.5px] font-black uppercase tracking-widest text-indigo-200 block">
                    SENT CONNECTION HISTORY
                  </span>
                  {chatNotes.length > 0 ? (
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {chatNotes.map((note) => (
                        <div key={note.id} className="p-4 rounded-2.5xl bg-indigo-950/40 border border-white/10 space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="absolute right-3.5 top-3.5 text-indigo-300 hover:text-rose-400 select-none text-xs font-bold font-mono transition"
                            title="Delete note"
                          >
                            ✕
                          </button>
                          
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5">
                            <span className="text-[10px] font-black text-rose-300 uppercase tracking-tight bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 w-fit">
                              {note.category}
                            </span>
                            <span className="text-[10.5px] text-slate-400/80 font-mono font-bold pr-6">
                              {note.timestamp}
                            </span>
                          </div>

                          <p className="text-white/90 text-xs font-medium leading-relaxed font-sans">
                            "{note.message}"
                          </p>

                          {/* Teacher's response bubble */}
                          {note.reply ? (
                            <div className="bg-white p-3.5 rounded-2xl text-slate-900 border border-slate-200/50 space-y-1 mt-1 font-semibold">
                              <p className="text-[9px] uppercase tracking-wide text-indigo-700 font-extrabold flex items-center gap-1">
                                <span>👩‍🏫 Teacher Roster feedback</span>
                                <span className="bg-emerald-100 text-emerald-700 font-black font-mono text-[8px] px-1.5 rounded">ACKNOWLEDGED</span>
                              </p>
                              <p className="text-[11.5px] text-slate-700 leading-relaxed">
                                {note.reply}
                              </p>
                            </div>
                          ) : (
                            <div className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                              <span>Queued for sandbox classroom review...</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-indigo-300 font-bold">
                      No leave logs or teacher instructions dropped today.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB B: ATTENDANCE LOG - visual presence rates and Twilio text feeds */}
      {activeTab === "attendance" && (
        <div className="bg-white rounded-[32px] border border-gray-150 p-6 lg:p-8 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Preschool Attendance Register
              </h3>
              <p className="text-xs text-slate-500 mt-1">Real-time daily security logs for {student.name}</p>
            </div>
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-150 px-5 py-2.5 rounded-2xl text-right shrink-0">
              <span className="text-[10px] font-black uppercase text-emerald-600 block tracking-wider">AGGREGATE ATTENDANCE RATE</span>
              <span className="text-2xl font-black block mt-0.5">{attendanceRate}%</span>
            </div>
          </div>

          {/* Visual Preschool day squares block */}
          <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-150 space-y-4">
            <h4 className="text-xs font-black text-slate-700 tracking-wide">60-Day Visual Attendance Grid</h4>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 30 }).map((_, idx) => {
                const dayNumber = 30 - idx;
                const status = idx === 0 ? (childAttendance[0]?.status || "Present") : (idx % 8 === 0 ? "Absent" : idx % 15 === 0 ? "Late" : "Present");
                const colors = {
                  Present: "bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/10",
                  Absent: "bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/10",
                  Late: "bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/10",
                };
                return (
                  <div
                    key={idx}
                    title={`Pre-School Day -${dayNumber}: ${status}`}
                    className={`w-8 h-8 rounded-xl ${colors[status]} cursor-pointer flex items-center justify-center text-[10px] text-white font-black transition-all hover:scale-110`}
                  >
                    {status === "Present" ? "P" : status === "Absent" ? "A" : "L"}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-600 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-emerald-500 rounded-lg" />
                <span>Present</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-rose-500 rounded-lg" />
                <span>Absent (Simulated Safety Twilio Warning Issued)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-amber-500 rounded-lg" />
                <span>Late Arrival</span>
              </div>
            </div>
          </div>

          {/* Simulated SMS logs for safe transport checks */}
          <div className="bg-amber-50/60 border border-amber-200/80 p-5 rounded-2.5xl space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-amber-600" />
              <h4 className="font-extrabold text-amber-900 text-xs uppercase tracking-wider">SMS Gate Attendance Push Log (Preschool SMS System)</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-2xl border border-amber-200/40 font-mono">
              "PRES_SMS: Ward '{student.name}' was marked '{childAttendance[0]?.status || "Present"}' on {childAttendance[0]?.date || "Today's Schedule"} register. Secure verification token logs cleared successfully."
            </p>
          </div>

          {/* Table history */}
          {childAttendance.length > 0 ? (
            <div className="overflow-x-auto rounded-2.5xl border border-slate-150">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-800 font-extrabold uppercase border-b border-slate-150">
                  <tr>
                    <th className="p-4">Marked Date</th>
                    <th className="p-4">Daily Status</th>
                    <th className="p-4">Authorized Roster</th>
                    <th className="p-4">System SMS Pipeline status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {childAttendance.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-bold text-slate-850">{record.date}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[10.5px] font-black uppercase ${
                            record.status === "Present"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-155"
                              : record.status === "Absent"
                              ? "bg-rose-50 text-rose-700 border border-rose-155"
                              : "bg-amber-50 text-amber-700 border border-amber-155"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-bold">{record.markedBy}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-indigo-50 border border-indigo-100 text-[10px] rounded-lg text-indigo-700 font-mono font-bold">
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                          SMS Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-450 text-xs">
              No recent attendance registers marked in current SaaS term database.
            </div>
          )}
        </div>
      )}

      {/* TAB C: ACADEMICS - Cute Milestone Gauge and print options */}
      {activeTab === "academics" && (
        <div className="bg-white rounded-[32px] border border-gray-150 p-6 lg:p-8 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-violet-500 animate-pulse" />
                Preschool Milestones & Exams
              </h3>
              <p className="text-xs text-slate-500">
                Evaluation streaming dashboard for <strong className="font-bold text-indigo-950">{student.name} ({student.course})</strong>
              </p>
            </div>
            
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100 shrink-0 self-start md:self-auto">
              <button
                onClick={() => setAcademicsSubTab("marks")}
                type="button"
                className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer ${
                  academicsSubTab === "marks"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                📊 Milestone Marks
              </button>
              <button
                onClick={() => setAcademicsSubTab("exams")}
                type="button"
                className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer ${
                  academicsSubTab === "exams"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                📅 Exam Schedules ({exams.filter((ex) => ex.course === student.course).length})
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-5 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-bold text-xs shadow-sm transition self-start cursor-pointer border border-indigo-700/50"
            >
              <Printer className="w-4 h-4" />
              Print Report Book
            </button>
          </div>

          {academicsSubTab === "marks" ? (
            <>

          {/* Developmental Milestones Skill Bars */}
          <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-150 space-y-4">
            <h4 className="text-xs font-black text-slate-700 tracking-wide uppercase">Core Development Milestone Scores</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="bg-white p-4.5 rounded-2xl border border-slate-100 space-y-2 shadow-2xs">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="text-rose-700">👐 Fine Motor Coordination</span>
                  <span>{childGrades.length > 0 ? "Grade A+" : "90%"}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: "95%" }} />
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">Ability with scissors, finger paint grip, and puzzle block matching.</p>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-100 space-y-2 shadow-2xs">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="text-indigo-750">🧠 Cognitive Patterns & Shapes</span>
                  <span>{childGrades.length > 0 ? "Grade A" : "85%"}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: "88%" }} />
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">Recognizing geometrical layouts, counting seeds, and classification tasks.</p>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-100 space-y-2 shadow-2xs">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="text-sky-700">🗣️ Syllable Phonics & Letters</span>
                  <span>{childGrades.length > 0 ? "Grade B+" : "82%"}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: "80%" }} />
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">Sounding simple oral syllables, auditory tracking, and reciting short nursery rhymes.</p>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-slate-100 space-y-2 shadow-2xs">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="text-teal-700">❤️ Social Play & Sharing</span>
                  <span>{childGrades.length > 0 ? "Grade A" : "88%"}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: "90%" }} />
                </div>
                <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">Turn taking inside circle hours, tidying up after blocks play, and showing peer empathy.</p>
              </div>

            </div>
          </div>

          {/* Grades Table */}
          {childGrades.length > 0 ? (
            <div className="space-y-6">
              <div className="overflow-x-auto rounded-[24px] border border-slate-150">
                <table className="w-full text-xs text-left">
                  <thead className="bg-indigo-50/70 text-indigo-950 font-black uppercase text-[10.5px] border-b border-slate-150">
                    <tr>
                      <th className="p-4">Subject stream</th>
                      <th className="p-4">Fine Motor (30%)</th>
                      <th className="p-4">Sensory Score (70%)</th>
                      <th className="p-4">Weighted Total</th>
                      <th className="p-4">Roster Grade</th>
                      <th className="p-4">Teacher Evaluation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {childGrades.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-black text-indigo-900">{g.subject}</td>
                        <td className="p-4 font-bold text-slate-600">{g.homeworkScore}%</td>
                        <td className="p-4 font-bold text-slate-600">{g.examScore}%</td>
                        <td className="p-4 font-black text-slate-800">{g.weightedTotal}%</td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-xl text-[10.5px] font-black ${
                              g.letterGrade.startsWith("A")
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : g.letterGrade.startsWith("B")
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {g.letterGrade}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 text-xs italic font-semibold leading-relaxed max-w-xs sm:max-w-md">
                          "{g.remarks}"
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Aggregation Feedback widget */}
              <div className="p-5.5 bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-150 rounded-3xl flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-xs flex items-center justify-center sm:justify-start gap-1.5 uppercase">
                    <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
                    Developmental Progress aggregate
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed max-w-xl font-medium">
                    Our dynamic report calculations evaluate visual tracing, physical grasp coordination, and socio-emotional benchmarks compiled direct by class roster supervisors.
                  </p>
                </div>
                <div className="bg-indigo-600 text-white px-6 py-4.5 rounded-2.5xl text-center shadow-lg shrink-0">
                  <span className="text-[9px] font-black uppercase text-indigo-200 block tracking-widest leading-none">PRESCHOOL CGPA</span>
                  <span className="text-3xl font-black block mt-1">
                    {Math.round(childGrades.reduce((acc, g) => acc + g.weightedTotal, 0) / childGrades.length)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs font-bold font-sans">
              Currently, no direct milestones have been uploaded. General sandbox activities display default 85%+ score metrics.
            </div>
          )}
          </>
          ) : (
            <div className="space-y-6 animate-fadeIn" id="parent-dashboard-assessments-panel">
              <div className="bg-radial from-indigo-50/40 via-transparent to-transparent p-6 rounded-[28px] border border-dashed border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="space-y-0.5 font-sans">
                    <span className="text-[9.5px] uppercase font-black bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded border border-rose-100 block w-fit">
                      Academic Term Calendar Assessment schedules
                    </span>
                    <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 leading-snug mt-1">
                       Curriculum Examinations & Evaluation Timings
                    </h4>
                    <p className="text-xs text-slate-500 font-medium font-sans">
                      Track upcoming oral, motor, and child recitation schedules set by {student.course} class teachers.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-slate-500 bg-white border border-slate-150 px-3 py-1.5 rounded-xl font-mono">
                     Class Level: {student.course}
                  </div>
                </div>

                {exams.filter((ex) => ex.course === student.course).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                    {exams
                      .filter((ex) => ex.course === student.course)
                      .map((exam) => {
                        const isComplete = exam.status === "Completed";
                        // Find if there is a grade submitted for this subject to display direct feedback
                        const correspondingGrade = childGrades.find(
                          (cg) => cg.subject.toLowerCase().includes(exam.subject.toLowerCase()) || 
                                  exam.subject.toLowerCase().includes(cg.subject.toLowerCase())
                        );

                        return (
                          <div
                            key={exam.id}
                            className={`p-5 rounded-3xl border transition duration-300 relative overflow-hidden flex flex-col justify-between gap-4.5 bg-gradient-to-tr ${
                              isComplete
                                ? "from-slate-50/50 to-slate-50/40 border-slate-200"
                                : "from-white to-slate-50/20 border-slate-150 hover:border-indigo-250 hover:shadow-2xs"
                            }`}
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-[9.5px] font-bold">
                                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase tracking-wide font-sans">
                                    {exam.academicTerm}
                                  </span>
                                  <span className="bg-pink-50 text-pink-750 px-2 py-0.5 rounded uppercase tracking-wide font-semibold font-sans">
                                    {exam.subject}
                                  </span>
                                </div>
                                <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-black tracking-wide border ${
                                  isComplete
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : "bg-amber-50 text-amber-700 border-amber-100 font-extrabold"
                                }`}>
                                  {exam.status}
                                </span>
                              </div>

                              <h5 className="font-extrabold text-slate-800 text-[13.5px] leading-snug font-sans">
                                {exam.title}
                              </h5>

                              <p className="text-[11.5px] text-slate-650 leading-relaxed font-semibold font-sans">
                                <strong className="font-bold text-slate-800 font-sans">Syllabus Guidance:</strong> {exam.syllabus || "Reciting learned syllables, picture books, card matching exercises, class behavior logs."}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-slate-100/75 flex flex-wrap justify-between items-center gap-3">
                              <div className="flex gap-3 text-[10.5px] text-slate-400 font-mono font-bold">
                                <span className="flex items-center gap-1">🗓 {exam.examDate}</span>
                                <span className="flex items-center gap-1">⏰ {exam.examTime}</span>
                                <span className="text-slate-600 font-extrabold">💯 Max: {exam.maxMarks}</span>
                              </div>
                              
                              {/* Integrated scorecard link */}
                              {isComplete && correspondingGrade ? (
                                <div className="bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-xl flex items-center gap-2 animate-fadeIn">
                                  <span className="text-xs">🎉</span>
                                  <div>
                                    <span className="text-[8.5px] font-black uppercase text-emerald-600 block tracking-wider leading-none font-sans">Roster Mark</span>
                                    <span className="text-[10.5px] font-black text-emerald-800 mt-0.5 block font-sans">
                                      Weighted: {correspondingGrade.weightedTotal}% ({correspondingGrade.letterGrade})
                                    </span>
                                  </div>
                                </div>
                              ) : isComplete ? (
                                <span className="text-[9.5px] text-slate-400 italic font-semibold font-sans">Marks synced in core book</span>
                              ) : (
                                <span className="text-[9.5px] text-slate-455 font-sans uppercase font-black bg-slate-100 px-2 py-0.5 rounded">
                                  ⏳ Awaiting assessment
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-14 max-w-md mx-auto">
                    <Award className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-bounce" />
                    <h5 className="font-extrabold text-slate-700 text-sm font-sans">No Active Exam Schedules Registered</h5>
                    <p className="text-xs text-slate-500 mt-1 pl-0.5 leading-normal font-medium font-sans font-sans">
                      Class teachers have not declared scheduled examinations for {student.course} level in the cloud portal yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB D: HOMEWORK & SENSORY LIVE BULLETIN FEED */}
      {activeTab === "homework" && (() => {
        // Tag play activities based on keywords for helpful parent insights
        const getLearningDomains = (title: string, desc: string) => {
          const t = (title + " " + desc).toLowerCase();
          const domains: { label: string; bg: string; border: string }[] = [];
          
          if (t.includes("clay") || t.includes("scissor") || t.includes("cut") || t.includes("glue") || t.includes("trace") || t.includes("draw") || t.includes("color") || t.includes("paint") || t.includes("motor") || t.includes("write") || t.includes("craft")) {
            domains.push({ label: "👐 Fine Motor Skills", bg: "bg-pink-50 text-pink-700", border: "border-pink-200/50" });
          }
          if (t.includes("count") || t.includes("math") || t.includes("number") || t.includes("shape") || t.includes("size") || t.includes("pattern") || t.includes("match") || t.includes("weight")) {
            domains.push({ label: "🧠 Cognitive Patterns", bg: "bg-amber-50 text-amber-705 text-amber-700", border: "border-amber-200/50" });
          }
          if (t.includes("talk") || t.includes("sound") || t.includes("letter") || t.includes("read") || t.includes("word") || t.includes("phonic") || t.includes("story") || t.includes("speech") || t.includes("song")) {
            domains.push({ label: "🗣️ Phonics Language", bg: "bg-sky-50 text-sky-700", border: "border-sky-200/50" });
          }
          if (t.includes("nature") || t.includes("plant") || t.includes("leaf") || t.includes("stone") || t.includes("water") || t.includes("discover") || t.includes("sand") || t.includes("sensory") || t.includes("feel")) {
            domains.push({ label: "🔍 Sensory Explore", bg: "bg-teal-50 text-teal-700", border: "border-teal-200/50" });
          }
          if (t.includes("friend") || t.includes("empathy") || t.includes("share") || t.includes("help") || t.includes("family") || t.includes("feel") || t.includes("social") || t.includes("clean")) {
            domains.push({ label: "❤️ Socio-Emotional", bg: "bg-rose-50 text-rose-700", border: "border-rose-200/50" });
          }
          if (domains.length === 0) {
            domains.push({ label: "🌟 Childhood Play", bg: "bg-indigo-50 text-indigo-700", border: "border-indigo-150" });
          }
          return domains;
        };

        const activeClassBulletins = homework.filter((h) => h.course === student.course);

        return (
          <div className="space-y-6 animate-fadeIn" id="parent-homework-panel">
            
            {/* Play-inspired homework banner */}
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 p-6 lg:p-8 rounded-[32px] text-white shadow-md relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
                  SENSORY GAME ARCHIVE
                </div>
                <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                  <BookOpen className="w-5.5 h-5.5 text-yellow-300" /> Play-Curriculum & Classroom Activities
                </h3>
                <p className="text-xs sm:text-[13px] text-white/95 leading-relaxed font-semibold max-w-2xl font-sans">
                  Elevate milestones at home! Track fine motor objectives, phonetic songs, and outdoor sandbox games scheduled by teacher rosters for <strong className="text-yellow-300 underline font-extrabold decoration-wavy underline-offset-4">{student.name} ({student.course})</strong>.
                </p>
              </div>
            </div>

            {activeClassBulletins.length === 0 ? (
              <div className="bg-white rounded-[32px] border border-gray-150 p-12 text-center text-slate-450 space-y-3.5 shadow-xs">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-extrabold text-slate-700">No active homework schedules posted</p>
                  <p className="text-[11.5px] text-slate-400 max-w-sm mx-auto">Currently, no daily schedules exist for class "{student.course}". Happy play-day with family!</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeClassBulletins.map((hw) => {
                  const domains = getLearningDomains(hw.title, hw.description);
                  const isCompleted = completedHwIds[hw.id] || false;
                  const currentEmoji = hwReactions[hw.id] || "";

                  return (
                    <div 
                      key={hw.id} 
                      className={`relative p-6 rounded-[32px] border transition-all duration-300 flex flex-col justify-between gap-5 bg-white shadow-2xs hover:shadow-sm ${
                        isCompleted ? "border-emerald-350 bg-emerald-50/10 ring-2 ring-emerald-500/10" : "border-slate-150 hover:bg-slate-50/20"
                      }`}
                    >
                      {isCompleted && (
                        <div className="absolute -top-3 right-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-[10px] px-3 py-1 rounded-full shadow-md tracking-wider z-10 animate-bounce">
                          🎉 Practised with Kid!
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-150">
                            {hw.course} Bulletin
                          </span>
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full">
                            Activity Target: {hw.dueDate}
                          </span>
                        </div>

                        <div className="space-y-2 text-left">
                          <h4 className="font-black text-slate-800 text-base tracking-tight leading-snug">
                            {hw.title}
                          </h4>
                          
                          {/* Learning tags */}
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {domains.map((dom, i) => (
                              <span 
                                key={i} 
                                className={`text-[9.5px] font-bold tracking-wide px-2.5 py-0.5 rounded-md border ${dom.bg} ${dom.border}`}
                              >
                                {dom.label}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1 text-left">
                          <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">
                            Milestone objectives
                          </span>
                          <p className="bg-slate-100/60 p-4 rounded-2xl leading-relaxed text-slate-700 text-[11.5px] whitespace-pre-wrap font-semibold font-sans">
                            {hw.description}
                          </p>
                        </div>

                        {hw.activities && (
                          <div className="space-y-1 text-left pt-0.5">
                            <span className="text-[9.5px] font-black text-amber-650 uppercase tracking-widest block">
                              👐 Recommended Sensory Instructions
                            </span>
                            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/30 leading-relaxed text-slate-650 text-[11.5px] font-semibold whitespace-pre-wrap">
                              {hw.activities}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Reactions & completed state */}
                      <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">React:</span>
                          <div className="flex gap-1 bg-slate-50 border border-slate-150 p-1 rounded-xl shadow-inner">
                            {["❤️", "👍", "👏", "🧠", "⭐"].map((emoji) => {
                              const reactionActive = currentEmoji === emoji;
                              return (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => setHwReaction(hw.id, emoji)}
                                  className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center hover:scale-115 active:scale-95 transition-all cursor-pointer ${
                                    reactionActive ? "bg-white shadow-2xs border border-indigo-100 text-sm" : "opacity-60 hover:opacity-100"
                                  }`}
                                  title={`React with ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleHwCompleted(hw.id)}
                          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition duration-200 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto border shadow-3xs active:scale-98 ${
                            isCompleted 
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-md" 
                              : "bg-white border-slate-205 text-slate-750 hover:bg-slate-50"
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{isCompleted ? "Done! ❤️" : "Done with Kid!"}</span>
                        </button>
                      </div>

                      <div className="border-t border-slate-100/50 pt-3 flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <span>Posted on: {hw.date}</span>
                        <span>Roster: {hw.postedBy}</span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        );
      })()}

      {/* TAB E: BILLING & STRIPE FEE INVOICES */}
      {activeTab === "billing" && (
        <div className="bg-white rounded-[32px] border border-gray-150 p-6 lg:p-8 shadow-sm space-y-6 animate-fadeIn">
          <div>
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-500" />
              Gurukul Fee Ledger & Bills
            </h3>
            <p className="text-xs text-slate-500 mt-1">Submit visual school fee payments or download fully structured ledger invoices</p>
          </div>

          <div className="space-y-4">
            {childBilling.length > 0 ? (
              childBilling.map((invoice) => (
                <div
                  key={invoice.id}
                  className="p-5 bg-slate-50/50 rounded-[28px] border border-slate-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:shadow-2xs"
                >
                  <div className="space-y-1 w-full md:w-auto">
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-850 font-black text-sm">Invoice #{invoice.id}</span>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider ${
                          invoice.status === "Paid"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-250"
                            : "bg-amber-100 text-amber-800 border border-amber-250"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-bold block">{invoice.term}</span>
                    <p className="text-xs text-slate-600 font-medium">
                      Payment deadline: <strong className="text-slate-800">{invoice.dueDate}</strong>
                    </p>
                  </div>

                  <div className="flex select-none flex-col sm:flex-row md:flex-col items-baseline sm:items-center md:items-end justify-between md:justify-start w-full md:w-auto gap-4">
                    <span className="text-2xl font-black text-indigo-950 font-mono">
                      ₹{invoice.totalAmount.toLocaleString("en-IN")}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setViewingInvoicepdf(invoice)}
                        className="px-4 py-2.5 bg-white text-indigo-700 rounded-xl hover:bg-slate-50 font-bold text-xs border border-slate-205 shadow-3xs transition cursor-pointer"
                      >
                        Print Ledger Receipt
                      </button>

                      {invoice.status !== "Paid" && (
                        <button
                          onClick={() => setShowStripeModal(invoice)}
                          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
                        >
                          Checkout Stripe
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-450 text-xs font-bold font-sans">
                Currently, no billing records exist in the active fee roster of {student.name}.
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* TAB F: TEACHERS & LESSONS UPDATES */}
      {activeTab === "teachers" && (() => {
        const childLessons = (lessons || []).filter((l) => l.course === student.course);
        const childTheme = WEEKLY_PRESCHOOL_THEMES[student.course] || WEEKLY_PRESCHOOL_THEMES["Nursery"];
        // Find teachers who are staff guides
        const relevantTeachers = teachers.length > 0
          ? teachers.filter(t => t.specialization?.toLowerCase().includes("care") || t.specialization?.toLowerCase().includes("school") || t.role === "Staff")
          : [];

        return (
          <div className="space-y-6 lg:space-y-8 animate-fadeIn" id="teachers-lessons-tab-panel">
            
            {/* Header intro */}
            <div className="bg-gradient-to-r from-fuchsia-950 via-slate-900 to-pink-950 p-6 lg:p-8 rounded-[32px] text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 blur-3xl w-72 h-72 bg-gradient-to-l from-fuchsia-400 to-pink-600 select-none pointer-events-none" />
              <div className="relative z-10 space-y-1.5">
                <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest text-[#F2C94C] uppercase border border-white/5">
                  <Sparkles className="w-3 h-3 text-pink-400 animate-pulse" />
                  <span>PRE-SCHOOL CURRICULUM SYNC</span>
                </span>
                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                  Teachers & Daily Lessons Bulletin
                </h3>
                <p className="text-xs text-indigo-100/90 max-w-xl font-semibold leading-relaxed">
                  Stay closely connected with {student.name}'s daily pre-school experience. Review academic lesson plans, teacher notes, weekly sensory themes, and focus milestones below.
                </p>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left span: Milestone Theme & Lesson Matrix */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Milestone Theme Display Card */}
                {childTheme && (
                  <div className={`p-6 rounded-[28px] border bg-gradient-to-br ${childTheme.bgColor} ${childTheme.borderColor} space-y-4 shadow-3xs relative overflow-hidden`}>
                    <div className="absolute right-[-15px] top-[-15px] opacity-15 text-[90px] select-none pointer-events-none">
                      {childTheme.emoji}
                    </div>

                    <div className="space-y-1 relative z-10">
                      <span className="px-2 py-0.5 bg-white border font-mono font-black text-[9px] uppercase tracking-wider rounded-md text-slate-500">
                        This Week's Classroom Focus
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-1">{childTheme.themeTitle}</h4>
                    </div>

                    <p className="text-xs font-semibold text-slate-700 leading-relaxed bg-white/75 backdrop-blur-md p-3.5 rounded-2xl border border-white/55">
                      🍎 <strong>Sensory Play Assignment:</strong> {childTheme.sensoryTask}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[9.5px] font-black uppercase text-slate-400 block tracking-widest pl-1">Development Goals</span>
                        <ul className="space-y-1">
                          {childTheme.focusMilestones.map((m, i) => (
                            <li key={i} className="text-[11.5px] text-slate-650 font-black flex items-start gap-1.5 leading-snug">
                              <span className="text-[#FF7A00] shrink-0">✨</span>
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl space-y-1 self-start">
                        <span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest pl-0.5">Phonics Home Triggers</span>
                        <p className="text-fuchsia-950 font-bold font-mono text-[11px] leading-relaxed">
                          {childTheme.phonicsTriggers}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Registered Lessons feed */}
                <div className="space-y-4">
                  <span className="text-xs font-black uppercase text-slate-450 block tracking-wider font-mono pl-1">
                    Daily Lessons & Activities Catalog ({childLessons.length})
                  </span>

                  {childLessons.length > 0 ? (
                    <div className="space-y-4">
                      {childLessons.map((plan) => (
                        <div key={plan.id} className="p-5 bg-white border border-slate-150 rounded-3xl shadow-3xs space-y-3.5 relative overflow-hidden group hover:border-fuchsia-200 transition duration-300">
                          <div className="absolute top-0 right-0 h-1 w-12 bg-fuchsia-500" />
                          
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="inline-flex items-center gap-1 text-[9.5px] font-mono text-slate-400 font-black">
                                <Calendar className="w-3 h-3 text-fuchsia-500 animate-pulse" />
                                {plan.date}
                              </span>
                              <h5 className="font-extrabold text-slate-850 text-sm mt-0.5">{plan.topic}</h5>
                            </div>

                            <button
                              onClick={() => {
                                window.focus();
                                window.print();
                              }}
                              className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100/80 text-slate-500 hover:text-fuchsia-600 rounded-lg text-[9.5px] font-bold border flex items-center gap-1 cursor-pointer transition shrink-0"
                              title="Print Fridge Guide"
                            >
                              <Printer className="w-2.5 h-2.5" />
                              <span>Fridge Print</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100 leading-relaxed">
                            <div className="space-y-1">
                              <span className="text-[9px] text-indigo-650 uppercase font-black tracking-wider block">Objectives Summary</span>
                              <p className="text-slate-700 font-semibold">{plan.objectives}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] text-fuchsia-650 uppercase font-black tracking-wider block">Hands-on Tasks</span>
                              <p className="text-slate-750 font-semibold">{plan.activities}</p>
                            </div>
                          </div>

                          <div className="pt-2.5 text-[10px] font-extrabold text-slate-500 flex justify-between items-center">
                            <span className="text-slate-400 font-bold uppercase text-[9px]">Montessori Grid Sync</span>
                            <span>Instructed by: <span className="text-slate-800 font-black">{plan.teacherName}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center bg-white border border-dashed rounded-3xl text-slate-500 font-semibold shadow-3xs">
                      <BookOpen className="w-9 h-9 text-slate-300 mx-auto mb-2.5 animate-bounce" />
                      <span className="text-xs block font-bold text-slate-700">No lessons registered for {student.course} class stream today.</span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-1">Please wait for the class teacher to post daily lessons.</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Right span: Teacher profile cards and direct messaging card */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 3. Your Classroom Guides details */}
                <div className="bg-white rounded-[28px] border border-slate-150 p-5 shadow-3xs space-y-4">
                  <div>
                    <h4 className="font-extrabold text-[#3D4498] text-xs uppercase tracking-wider font-sans">
                      Class Guides & Teachers
                    </h4>
                    <p className="text-[10.5px] text-slate-500">Early development experts for {student.course}</p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {relevantTeachers.length > 0 ? (
                      relevantTeachers.slice(0, 3).map((teacher) => (
                        <div key={teacher.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                          <span className="w-8.5 h-8.5 bg-fuchsia-50 border border-fuchsia-100 rounded-full flex items-center justify-center text-base shadow-3xs">
                            👩‍🏫
                          </span>
                          <div className="text-xs">
                            <h5 className="font-bold text-slate-800">{teacher.name}</h5>
                            <span className="text-[9.5px] text-slate-450 block font-semibold">{teacher.specialization || "Classroom Guide"}</span>
                          </div>
                          <span className="ml-auto text-[8.5px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 tracking-wider">
                            Active
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-3 flex items-center gap-3">
                        <span className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-sm">📚</span>
                        <div className="text-xs">
                          <h5 className="font-bold text-slate-800">Class Support Roster</h5>
                          <p className="text-[10px] text-slate-450 block font-semibold">Pre-school assistants are assigned to supervise today's tasks.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Quick Message box / Note trigger synced */}
                <div className="bg-gradient-to-tr from-fuchsia-600 to-pink-500 text-white rounded-[28px] p-5 shadow-sm space-y-3 relative overflow-hidden">
                  <div className="absolute right-[-10px] bottom-[-10px] text-7xl opacity-15 select-none pointer-events-none">💬</div>
                  <h4 className="font-black text-white text-xs uppercase tracking-wide flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-amber-200" />
                    <span>Instant Parent Notepad</span>
                  </h4>
                  <p className="text-[10.5px] text-white/95 leading-relaxed font-semibold">
                    Need extra care, medicine reminders, specific snack guidelines, or have attendance updates? Type a parent note directly in the <strong>Classroom Chat</strong> inside the <strong>Overview</strong> tab for instantaneous teaching board sync.
                  </p>
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className="w-full text-center py-2.5 bg-white text-fuchsia-700 hover:bg-slate-50 duration-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                  >
                    Go write helper note
                  </button>
                </div>

              </div>

            </div>

          </div>
        );
      })()}

      {/* STRIPE PAYMENT MODAL SIMULATOR */}
      {showStripeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden text-slate-800">
            <div className="p-6 bg-gradient-to-b from-[#4E54C8] to-[#8F94FB] text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest block">STRIPE API SECURED DIALOG</span>
                <h4 className="text-lg font-black mt-0.5">Pre-School Checkout Gateway</h4>
              </div>
              <button
                onClick={() => setShowStripeModal(null)}
                className="text-white/80 hover:text-white hover:scale-110 font-bold transition text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-150 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Child Enrollment:</span>
                  <span className="font-extrabold text-slate-800">{student.name} ({student.course})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Ledger Invoice Ref:</span>
                  <span className="font-mono font-bold text-indigo-600">#{showStripeModal.id}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200/80 mt-1.5">
                  <span className="text-slate-800 font-black">Consolidated Total:</span>
                  <span className="font-black text-indigo-950 text-base">₹{showStripeModal.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Fake card UI for interactive pre-school design fun */}
              <div className="space-y-4">
                <span className="text-xs font-black text-slate-700 block uppercase tracking-wide">Test Card Simulation parameters</span>
                
                <div className="space-y-2 text-xs">
                  <label className="text-slate-400 font-bold">Simulated Sandbox Visa Card</label>
                  <input
                    type="text"
                    disabled
                    value="4242 •••• •••• 4242"
                    className="w-full p-3 rounded-xl border border-slate-205 bg-slate-50/50 font-mono text-slate-650 block"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">Visa Expiry Expiation</label>
                    <input
                      type="text"
                      disabled
                      value="12 / 2028"
                      className="w-full p-3 rounded-xl border border-slate-205 bg-slate-50/50 font-mono text-slate-650 block"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold">CVC Sandbox Key</label>
                    <input
                      type="text"
                      disabled
                      value="422"
                      className="w-full p-3 rounded-xl border border-slate-205 bg-slate-50/50 font-mono text-slate-650 block"
                    />
                  </div>
                </div>
              </div>

              {/* Payment trigger action */}
              <button
                onClick={handleStripePayment}
                disabled={stripeProcessing}
                className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-98 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-500/10 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {stripeProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing Pipeline Secures...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Authorize Sandbox Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT PORTAL LAYOUT OVERLAY */}
      {viewingInvoicepdf && createPortal(
        <div className="print-portal-wrapper fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto print:p-0 print:bg-white print:absolute print:inset-0">
          <div className="w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:w-full print:rounded-none" id="printable-parent-invoice-modal">
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
                #printable-parent-invoice-modal {
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

            <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex flex-col sm:flex-row gap-3 justify-between sm:items-center print:hidden select-none">
              <div className="space-y-1">
                <span className="font-black text-xs text-indigo-950 block flex items-center gap-1.5 uppercase tracking-wide">
                  <Receipt className="w-4 h-4 text-indigo-600" /> Fee Receipt Viewer
                </span>
                <p className="text-[10px] text-indigo-600/80 font-bold">
                  💡 Dynamic check: Press Ctrl+P (or Cmd+P) to print direct as beautiful A5 slips!
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm transition cursor-pointer flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print slip
                </button>
                <button
                  onClick={() => setViewingInvoicepdf(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-300 transition cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* PRINT REVEAL */}
            <div id="parent-billing-receipt-print-area" className="p-8 space-y-6 text-[#2D3436] font-sans">
              <div className="flex justify-between items-start border-b-2 border-dashed border-gray-200 pb-5">
                <div className="flex items-center gap-4">
                  <HorizonLogo size="md" />
                  <div className="h-12 w-px bg-slate-300 self-center" />
                  <ArivuLogo 
                    className="h-10 object-contain select-none"
                  />
                </div>
                <div className="text-right text-xs">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide mr-1">OFFICIAL RECEIPT</h4>
                  <p className="font-mono text-slate-500 text-[10px] font-bold mt-0.5">Slip: #{viewingInvoicepdf.id}</p>
                  <p className="font-bold text-slate-550 text-[9px]">Date: {viewingInvoicepdf.paidDate || viewingInvoicepdf.dueDate}</p>
                </div>
              </div>

              {/* Bill Details Info */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <span className="text-slate-400 font-extrabold block mb-1">SCHOOL ROSTER REMITTEE:</span>
                  <p className="font-black text-slate-900">Horizon International Play School</p>
                  <p className="text-slate-500 text-[10px] leading-relaxed max-w-xs mt-1 font-medium">
                    No 46, 1st Cross, Shri Veeranjaneya Temple Road, Thirumalapura, Bengaluru, KA 560073
                  </p>
                  <p className="text-slate-500 text-[9.5px] font-mono mt-1">E-mail: horizoninternational04@gmail.com</p>
                  <p className="text-slate-500 text-[9.5px] font-mono">Tell: +91 7353101553</p>
                </div>

                <div>
                  <span className="text-slate-400 font-extrabold block mb-1">WARD RECIPIENT DETAILS:</span>
                  <p className="font-black text-[#3D4498]">{student.name}</p>
                  <p className="text-slate-600 text-[10px] mt-1"><span className="font-bold">Play Stream:</span> {student.course}</p>
                  <p className="text-slate-600 text-[10px]"><span className="font-bold">Roll / Index Ref:</span> {student.rollNo}</p>
                  <p className="text-slate-600 text-[10px]"><span className="font-bold">Guardian Father:</span> {student.fatherName}</p>
                  <p className="text-slate-600 text-[10px]"><span className="font-bold">Guard Contact:</span> {student.contactPhone}</p>
                </div>
              </div>

              {/* Items pricing table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden mt-6 text-xs shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-[#6162CA]/10">
                    <tr>
                      <th className="p-3 font-black text-indigo-950">Participating fee particulars / Description</th>
                      <th className="p-3 font-black text-indigo-950 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingInvoicepdf.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-slate-100 font-semibold">
                        <td className="p-3 text-slate-700">{item.description}</td>
                        <td className="p-3 text-slate-800 font-black text-right">₹{item.amount.toLocaleString("en-IN")}.00</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 border-t border-slate-205 font-bold">
                      <td className="p-3 text-slate-800 text-right col-span-1">Subtotal aggregate amount:</td>
                      <td className="p-3 text-indigo-950 font-black text-right text-sm font-mono">₹{viewingInvoicepdf.totalAmount.toLocaleString("en-IN")}.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment stamps audit */}
              <div className="flex justify-between items-center pt-6 border-t border-dashed border-gray-200 text-xs">
                <div>
                  <span className="text-slate-400 font-extrabold block mb-1">LEDGER REMITTANCE STATUS:</span>
                  {viewingInvoicepdf.status === "Paid" ? (
                    <div className="flex items-center gap-1 text-emerald-800 font-black uppercase bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-250 w-fit">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Paid via Stripe Sandbox
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-800 font-black uppercase bg-amber-50 px-3 py-1 rounded-xl border border-amber-250 w-fit">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Pending online clearance
                    </div>
                  )}
                  {viewingInvoicepdf.stripePaymentIntentId && (
                    <span className="text-[9px] text-slate-450 font-mono mt-1 block">
                      Stripe ref: {viewingInvoicepdf.stripePaymentIntentId}
                    </span>
                  )}
                </div>

                <div className="text-center">
                  <div className="w-24 h-12 bg-slate-50 rounded-xl border border-slate-200/55 flex items-center justify-center font-mono opacity-80 text-slate-400 text-[10px] mb-1 leading-none select-none">
                    [Principal Stamp]
                  </div>
                  <span className="text-[9.5px] text-slate-405 block font-bold">Authorized Stamp</span>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
