/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { LessonPlan, CourseType, StaffMember, Student } from "../types";
import { 
  Plus, 
  Sparkles, 
  BookOpen, 
  Calendar, 
  Award, 
  Clock, 
  Heart, 
  Users, 
  MapPin, 
  Palette, 
  FileText, 
  Printer, 
  CheckCircle, 
  Send,
  Trash2,
  Bookmark,
  Check,
  AlertCircle,
  TrendingUp,
  Brain,
  Milestone,
  Smile,
  ChevronRight,
  Sparkle
} from "lucide-react";

interface TeacherDashboardProps {
  lessons: LessonPlan[];
  teachers: StaffMember[];
  students: Student[];
  onSaveLesson: (lessonPayload: any) => Promise<void>;
  userRole?: string;
  exams?: any[];
  onSaveExam?: (examPayload: any) => Promise<void>;
  onDeleteExam?: (examId: string) => Promise<void>;
  onSaveGrade?: (gradePayload: any) => Promise<void>;
  grades?: any[];
}

// Bubbly weekly themes database per grade
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
    bgColor: "from-amber-50/80 to-yellow-50/60",
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

// Rich auto-population templates for high-end Montessori lessons
const CHIEF_LESSON_TEMPLATE_PRESETS = [
  {
    topic: "Magical Light Box Leaf Analysis",
    objectives: "Observe translucent plant patterns and recognize starting letter 'L' for Leaf.",
    activities: "Collect five backyard maple leaves, position them on frosted battery LED light boxes, map ribs, chant L-L-Leaf rhyming lines.",
  },
  {
    topic: "Montessori Rainbow Balance Trays",
    objectives: "Refine hand-eye coordination using bamboo tongs and fine colored marbles.",
    activities: "Sort 15 marbles by size and color scale. Fill separate porcelain saucers using safe bamboo tweezers under teacher supervision.",
  },
  {
    topic: "Damp Sand Relief Hand Printing",
    objectives: "Explore physical geometry relief and count standard digital prints.",
    activities: "Press wet hand prints into fine sandbox troughs. Cast plaster patterns or count finger depressions as active mathematical digits.",
  },
  {
    topic: "Chanting Animal Phonics Choir",
    objectives: "Master starting sound triggers for barnyard animals and refine pitch control.",
    activities: "Using colorful animal puppet props, children sound out C-C-Cat, Pig, and Cow. Group choruses with wooden percussion sticks rhythmically.",
  }
];

export default function TeacherDashboard({
  lessons,
  teachers,
  students,
  onSaveLesson,
  userRole = "Admin",
  exams = [],
  onSaveExam,
  onDeleteExam,
  onSaveGrade,
  grades = []
}: TeacherDashboardProps) {
  // Active selected grade level
  const [selectedGrade, setSelectedGrade] = useState<CourseType>(CourseType.NURSERY);

  // Sub-navigation tab inside TeacherDashboard
  const [subTab, setSubTab] = useState<"lessons" | "exams">("lessons");

  // Exam scheduling states
  const [examTitle, setExamTitle] = useState("");
  const [examSubject, setExamSubject] = useState("Phonics & Language");
  const [examDate, setExamDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [examTime, setExamTime] = useState("09:30 AM");
  const [examMaxMarks, setExamMaxMarks] = useState(50);
  const [examSyllabus, setExamSyllabus] = useState("");
  const [examTerm, setExamTerm] = useState<"Term 1" | "Term 2" | "Final Term">("Term 1");
  const [isEditingExamId, setIsEditingExamId] = useState<string | null>(null);
  const [examFeedback, setExamFeedback] = useState<string | null>(null);
  const [savingExam, setSavingExam] = useState(false);

  // Score recording states for a selected exam
  const [gradingExam, setGradingExam] = useState<any | null>(null);
  const [gradingRoster, setGradingRoster] = useState<Record<string, { homeworkScore: number, examScore: number, remarks: string }>>({});

  // Lesson Plan editor fields
  const [topic, setTopic] = useState("");
  const [objectives, setObjectives] = useState("");
  const [activities, setActivities] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [formFeedback, setFormFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Auto-fill template utility
  const applyPresetTemplate = () => {
    const randomPreset = CHIEF_LESSON_TEMPLATE_PRESETS[Math.floor(Math.random() * CHIEF_LESSON_TEMPLATE_PRESETS.length)];
    setTopic(randomPreset.topic);
    setObjectives(randomPreset.objectives);
    setActivities(randomPreset.activities);
  };

  // Setup initial teacher if list exists
  React.useEffect(() => {
    if (teachers.length > 0 && !selectedTeacherId) {
      // Prefer standard 'Staff' role or just first staff as author
      const staffList = teachers.filter(t => t.role === "Staff");
      if (staffList.length > 0) {
        setSelectedTeacherId(staffList[0].id);
      } else {
        setSelectedTeacherId(teachers[0].id);
      }
    }
  }, [teachers, selectedTeacherId]);

  // Daily activity checklists for current grade simulator
  const [checklistLog, setChecklistLog] = useState<Record<string, Record<string, boolean>>>({});

  const toggleChecklistItem = (studentId: string, activityKey: string) => {
    setChecklistLog(prev => {
      const studentMap = prev[studentId] || {};
      return {
        ...prev,
        [studentId]: {
          ...studentMap,
          [activityKey]: !studentMap[activityKey]
        }
      };
    });
  };

  // Exam Action Handlers
  const handleClearExamForm = () => {
    setExamTitle("");
    setExamSubject("Phonics & Language");
    setExamDate(new Date().toISOString().split("T")[0]);
    setExamTime("09:30 AM");
    setExamMaxMarks(50);
    setExamSyllabus("");
    setExamTerm("Term 1");
    setIsEditingExamId(null);
  };

  const handleEditExamClick = (exam: any) => {
    setExamTitle(exam.title);
    setExamSubject(exam.subject);
    setExamDate(exam.examDate);
    setExamTime(exam.examTime);
    setExamMaxMarks(exam.maxMarks);
    setExamSyllabus(exam.syllabus);
    setExamTerm(exam.academicTerm);
    setIsEditingExamId(exam.id);
  };

  const handleSubmitExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      setExamFeedback("❌ Please enter a beautiful exam title.");
      return;
    }
    setSavingExam(true);
    setExamFeedback(null);
    try {
      const payload: any = {
        title: examTitle.trim(),
        course: selectedGrade,
        subject: examSubject,
        examDate,
        examTime,
        maxMarks: Number(examMaxMarks) || 50,
        syllabus: examSyllabus.trim(),
        academicTerm: examTerm,
        status: isEditingExamId ? (exams.find(ex => ex.id === isEditingExamId)?.status || "Scheduled") : "Scheduled"
      };
      if (isEditingExamId) {
        payload.id = isEditingExamId;
      }
      if (onSaveExam) {
        await onSaveExam(payload);
        setExamFeedback(`✨ Scheduled exam "${examTitle}" updated!`);
        handleClearExamForm();
        setTimeout(() => setExamFeedback(null), 3500);
      }
    } catch (err) {
      setExamFeedback("❌ Failed to save scheduled exam.");
    } finally {
      setSavingExam(false);
    }
  };

  const handleOpenGrading = (exam: any) => {
    setGradingExam(exam);
    // Auto-populate grading roster with existing grades if they exist
    const roster: Record<string, any> = {};
    students.filter(s => s.course === selectedGrade).forEach(s => {
      const existingGrade = grades.find(g => g.studentId === s.id && g.subject === exam.subject && g.academicTerm === exam.academicTerm);
      roster[s.id] = {
        homeworkScore: existingGrade ? existingGrade.homeworkScore : 0,
        examScore: existingGrade ? existingGrade.examScore : 0,
        remarks: existingGrade ? existingGrade.remarks : ""
      };
    });
    setGradingRoster(roster);
  };

  const handleUpdateStudentRosterScore = (stdId: string, field: "homeworkScore" | "examScore" | "remarks", value: any) => {
    setGradingRoster(prev => ({
      ...prev,
      [stdId]: {
        ...prev[stdId],
        [field]: value
      }
    }));
  };

  const handleSaveStudentGrade = async (stdId: string) => {
    if (!onSaveGrade || !gradingExam) return;
    const item = gradingRoster[stdId];
    const studentObj = students.find(s => s.id === stdId);
    if (!studentObj) return;

    const payload = {
      studentId: stdId,
      course: selectedGrade,
      academicTerm: gradingExam.academicTerm,
      subject: gradingExam.subject,
      homeworkScore: Number(item.homeworkScore) || 0,
      examScore: Number(item.examScore) || 0,
      remarks: item.remarks || "Well performed sensory task.",
      markedBy: userRole || "Teacher"
    };

    try {
      await onSaveGrade(payload);
      alert(`✨ Scorecard saved successfully for ${studentObj.name}!`);
    } catch (err) {
      alert("❌ Failed to update score. Please retry.");
    }
  };

  const handleMarkExamCompleted = async (exam: any) => {
    if (onSaveExam) {
      await onSaveExam({
        ...exam,
        status: "Completed"
      });
      setGradingExam(null);
      alert("🏆 Exam assessment marked as Completed!");
    }
  };

  // Submission handler
  const handleSubmitLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setFormFeedback("❌ Please enter a beautiful lesson topic.");
      return;
    }

    const teacherObj = teachers.find(t => t.id === selectedTeacherId) || { name: "Ad-hoc Teacher" };

    const payload = {
      course: selectedGrade,
      teacherId: selectedTeacherId,
      teacherName: teacherObj.name,
      date,
      topic: topic.trim(),
      objectives: objectives.trim(),
      activities: activities.trim()
    };

    setSaving(true);
    setFormFeedback(null);

    try {
      await onSaveLesson(payload);
      setFormFeedback("✨ Dynamic Montessori Lesson Plan Saved & Synced Successfully!");
      // Reset major fields
      setTopic("");
      setObjectives("");
      setActivities("");
      // Clear message after duration
      setTimeout(() => setFormFeedback(null), 4000);
    } catch {
      setFormFeedback("❌ Failed to save lesson. Please verify parameters or retry.");
    } finally {
      setSaving(false);
    }
  };

  // Filter students & lessons matching selected level
  const filteredStudents = students.filter(s => s.course === selectedGrade);
  const filteredLessons = lessons.filter(l => l.course === selectedGrade);

  const gradeTheme = WEEKLY_PRESCHOOL_THEMES[selectedGrade] || WEEKLY_PRESCHOOL_THEMES["Nursery"];

  return (
    <div className="space-y-6 lg:space-y-8" id="teacher-dashboard-main">
      
      {/* 1. Header Banner & Identity */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 p-6 lg:p-8 rounded-[36px] text-white shadow-xl relative overflow-hidden">
        {/* Playful backgrounds */}
        <div className="absolute right-0 top-0 opacity-10 blur-3xl w-72 h-72 bg-gradient-to-l from-pink-500 to-indigo-500 select-none pointer-events-none" />
        <div className="absolute bottom-[-40px] left-12 opacity-5 select-none text-[180px] pointer-events-none">🏫</div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs font-black tracking-widest text-[#F2C94C] uppercase border border-white/5">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>MONTESSORI SAAS TEACHERS PLATFORM</span>
            </div>
            <h2 className="text-2xl lg:text-3.5xl font-black tracking-tight leading-tight">
              Pre-School Lesson Matrix & Activites
            </h2>
            <p className="text-xs lg:text-sm text-indigo-200/90 max-w-2xl font-medium leading-relaxed">
              Design sensory-driven lesson plans, track toddler nap/snack milestones, and broadcast beautiful early-childhood curriculums directly to Parent Portals.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shrink-0 flex items-center gap-4 shadow-inner max-w-sm">
            <span className="text-3xl">👩‍🏫</span>
            <div className="text-xs">
              <span className="text-[10px] uppercase font-black text-slate-300 tracking-wider block">Live Active Classroom</span>
              <span className="font-extrabold text-white text-sm">{selectedGrade} Level Active</span>
              <span className="text-slate-200/80 block font-semibold mt-0.5">{filteredStudents.length} Todders Registered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Sub-Tab Switcher: Lessons vs Exam Manager */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-2xs max-w-sm">
        <button
          onClick={() => { setSubTab("lessons"); setGradingExam(null); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
            subTab === "lessons" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Lessons & Routines</span>
        </button>
        <button
          onClick={() => { setSubTab("exams"); setGradingExam(null); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-center transition cursor-pointer flex items-center justify-center gap-1.5 ${
            subTab === "exams" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Exam Management</span>
        </button>
      </div>

      {/* 2. Grade Level Switcher Tabs - styled like modern cards with custom icons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {[
          { key: CourseType.DAY_CARE, label: "🧸 Day-Care", color: "hover:border-sky-300 hover:text-sky-600 bg-sky-50 text-sky-700 font-extrabold", active: "ring-2 ring-sky-500 bg-sky-400 text-white font-black" },
          { key: CourseType.PRE_NURSERY, label: "🎨 Pre-Nursery", color: "hover:border-rose-300 hover:text-rose-600 bg-rose-50 text-rose-700 font-extrabold", active: "ring-2 ring-rose-500 bg-rose-400 text-white font-black" },
          { key: CourseType.NURSERY, label: "🧱 Nursery", color: "hover:border-amber-300 hover:text-amber-600 bg-amber-50 text-amber-700 font-extrabold", active: "ring-2 ring-amber-500 bg-amber-400 text-white font-black" },
          { key: CourseType.LKG, label: "📖 Lower KG", color: "hover:border-indigo-300 hover:text-indigo-600 bg-indigo-50 text-indigo-700 font-extrabold", active: "ring-2 ring-indigo-500 bg-indigo-400 text-white font-black" },
          { key: CourseType.UKG, label: "🚀 Upper KG", color: "hover:border-emerald-300 hover:text-emerald-600 bg-emerald-50 text-emerald-700 font-extrabold", active: "ring-2 ring-emerald-500 bg-emerald-400 text-white font-black" },
        ].map((item) => {
          const isSelected = selectedGrade === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setSelectedGrade(item.key)}
              className={`p-4 rounded-2xl text-[12.5px] uppercase tracking-wide border transition duration-300 cursor-pointer text-center flex flex-col items-center justify-center gap-1.5 shadow-2xs hover:-translate-y-0.5 ${
                isSelected ? item.active : `${item.color} border-slate-100 bg-white`
              }`}
            >
              <span className="text-slate-900 group-hover:scale-115 transition block leading-none" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Grade Grid & Details Section */}
      {subTab === "lessons" ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand: Theme focus & Lesson plans history list */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* A. Bubbly Montessori Theme Focus Display Card */}
          <div className={`p-6 rounded-[32px] border bg-gradient-to-br ${gradeTheme.bgColor} ${gradeTheme.borderColor} space-y-4 shadow-2xs relative overflow-hidden transition`}>
            
            <div className="absolute right-[-20px] top-[-20px] opacity-15 text-[110px] select-none pointer-events-none">
              {gradeTheme.emoji}
            </div>

            <div className="space-y-1.5 relative z-10">
              <span className="px-2.5 py-0.5 bg-white border font-mono font-bold text-[9px] uppercase tracking-wider rounded-md text-slate-500">
                Weekly Pre-school Milestone Theme
              </span>
              <h3 className={`text-lg font-black ${gradeTheme.textColor}`}>{gradeTheme.themeTitle}</h3>
            </div>

            <p className="text-[12.5px] font-semibold text-slate-700 leading-relaxed bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-white/50">
              🍎 <strong>Sensory Play Assignment:</strong> {gradeTheme.sensoryTask}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest pl-1">Focus Milestones</span>
                <ul className="space-y-1.5">
                  {gradeTheme.focusMilestones.map((m, i) => (
                    <li key={i} className="text-[11.5px] text-slate-600 font-extrabold flex items-start gap-1.5 leading-snug">
                      <span className="text-amber-500 shrink-0">✨</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 bg-white/70 backdrop-blur-md border border-white/60 rounded-2xl space-y-1.5 self-start">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest pl-0.5">Phonics Choir Key Triggers</span>
                <p className="text-indigo-900 font-bold font-mono text-[11.5px] leading-relaxed">
                  {gradeTheme.phonicsTriggers}
                </p>
              </div>
            </div>
          </div>

          {/* B. Live Toddler Activity Logs & Classroom Checklist */}
          <div className="bg-white rounded-[32px] border border-gray-150 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-pink-500 animate-pulse" />
                  <span>Real-Time Toddler Care Checklist</span>
                </h4>
                <p className="text-xs text-slate-500">Log midday checks for authorized {selectedGrade} attendants</p>
              </div>
              <span className="text-[9.5px] font-mono tracking-wider font-bold bg-pink-50 border border-pink-100 text-pink-600 px-2 py-0.5 rounded-md self-start">
                PARENT DESK SYNCED
              </span>
            </div>

            {filteredStudents.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-100 scrollbar-thin">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-800 border-b border-indigo-150/50 font-black uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Roll No & Name</th>
                      <th className="p-3.5 text-center">🍛 Full Lunch?</th>
                      <th className="p-3.5 text-center">💤 Cozy Nap?</th>
                      <th className="p-3.5 text-center">🧸 Soft Play?</th>
                      <th className="p-3.5 text-center">Quick Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-[11.5px]">
                    {filteredStudents.map((std) => (
                      <tr key={std.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-850">#{std.rollNo} - {std.name}</div>
                          <span className="text-[9px] text-slate-400 block mt-0.5 font-bold">Age: {std.age} Yrs</span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => toggleChecklistItem(std.id, "lunch")}
                            className={`w-7 h-7 rounded-full inline-flex items-center justify-center text-xs transition border cursor-pointer ${
                              checklistLog[std.id]?.lunch 
                                ? "bg-emerald-100 border-emerald-300 text-emerald-800 scale-105" 
                                : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                            }`}
                          >
                            {checklistLog[std.id]?.lunch ? "✓" : "🍛"}
                          </button>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => toggleChecklistItem(std.id, "nap")}
                            className={`w-7 h-7 rounded-full inline-flex items-center justify-center text-xs transition border cursor-pointer ${
                              checklistLog[std.id]?.nap 
                                ? "bg-violet-100 border-violet-300 text-violet-800 scale-105" 
                                : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                            }`}
                          >
                            {checklistLog[std.id]?.nap ? "✓" : "💤"}
                          </button>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => toggleChecklistItem(std.id, "play")}
                            className={`w-7 h-7 rounded-full inline-flex items-center justify-center text-xs transition border cursor-pointer ${
                              checklistLog[std.id]?.play 
                                ? "bg-amber-100 border-amber-300 text-amber-800 scale-105" 
                                : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                            }`}
                          >
                            {checklistLog[std.id]?.play ? "✓" : "🧸"}
                          </button>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold border ${
                            checklistLog[std.id]?.lunch && checklistLog[std.id]?.nap
                              ? "bg-emerald-50 text-emerald-700 border-emerald-150"
                              : "bg-amber-50 text-amber-700 border-amber-150"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${checklistLog[std.id]?.lunch && checklistLog[std.id]?.nap ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                            {checklistLog[std.id]?.lunch && checklistLog[std.id]?.nap ? "Fully Satisfied" : "Observing Care"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 border border-dashed rounded-2xl text-slate-500 font-bold">
                No attendant students currently matching pre-school roster.
              </div>
            )}
          </div>

          {/* C. Registered Montessori Lesson Plans Feed */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Currriculum Lesson Plan Matrix</span>
                </h4>
                <p className="text-xs text-slate-550">Active mapped plans for {selectedGrade} class</p>
              </div>
              <span className="text-[10.5px] font-bold text-slate-500">
                {filteredLessons.length} Plan(s) Synced
              </span>
            </div>

            {filteredLessons.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredLessons.map((plan) => (
                  <div key={plan.id} className="p-5 bg-white border border-slate-150 rounded-2.5xl shadow-2xs space-y-3.5 relative overflow-hidden group hover:border-indigo-250 transition-all duration-300">
                    {/* Corner Tag */}
                    <div className="absolute top-0 right-0 h-1.5 w-16 bg-indigo-500 rounded-bl-full" />
                    
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Topic Date: {plan.date}</span>
                        </div>
                        <h4 className="font-black text-slate-900 text-[13.5px] mt-1 pr-12 group-hover:text-indigo-600 transition">
                          {plan.topic}
                        </h4>
                      </div>
                      
                      <button
                        onClick={() => {
                          window.focus();
                          window.print();
                        }}
                        className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-xl text-[10px] font-bold border flex items-center gap-1 cursor-pointer absolute right-4 top-4"
                        title="Print Lesson details"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2.5 border-t border-slate-100 leading-relaxed">
                      <div className="space-y-1">
                        <strong className="text-[9.5px] text-indigo-600 uppercase font-black tracking-wider block">Objectives Summary</strong>
                        <p className="text-slate-700 font-semibold">{plan.objectives}</p>
                      </div>
                      <div className="space-y-1">
                        <strong className="text-[9.5px] text-emerald-600 uppercase font-black tracking-wider block">Coordinated Activities</strong>
                        <p className="text-slate-700 font-semibold">{plan.activities}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2.5 text-[10px] font-extrabold text-slate-500">
                      <span>Co-ordinated Authored by: <strong className="text-slate-800">{plan.teacherName}</strong></span>
                      <span className="bg-indigo-50 text-indigo-700 px-3 py-0.5 border border-indigo-100 rounded-md uppercase tracking-wider text-[8.5px]">
                        {selectedGrade} Class Standard
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white border border-slate-150 rounded-3xl col-span-full">
                <Milestone className="w-12 h-12 text-slate-350 mx-auto mb-3 animate-bounce" />
                <h5 className="font-bold text-slate-800 text-sm">No curriculum plans registered for this grade yet.</h5>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Use the quick sensory lesson builder on the right page to spawn colorful lesson templates instantly.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Hand: Quick interactive Lesson Editor Form */}
        <div className="xl:col-span-5 space-y-6">
          
          <div className="bg-gradient-to-tr from-white to-slate-50/50 border border-slate-150 rounded-[32px] p-6 shadow-sm space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-black text-slate-900 text-base tracking-tight flex items-center gap-1.5">
                  <Palette className="w-5 h-5 text-indigo-600" />
                  <span>Curriculum Builder</span>
                </h4>
                <p className="text-xs text-slate-550">Create sensory-oriented goals for parents</p>
              </div>

              <button
                type="button"
                onClick={applyPresetTemplate}
                className="px-3.5 py-2 bg-gradient-to-r from-[#FF7A00] to-amber-500 hover:from-[#E06B00] text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1"
                title="Randomly generate amazing Montessori activities"
              >
                <Sparkle className="w-3.5 h-3.5 animate-pulse" />
                <span>Preset Sparkle</span>
              </button>
            </div>

            {formFeedback && (
              <div className={`p-4 rounded-2xl text-xs font-bold leading-relaxed border ${
                formFeedback.startsWith("✨") 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-250" 
                  : "bg-rose-50 text-rose-800 border-rose-250"
              }`}>
                {formFeedback}
              </div>
            )}

            <form onSubmit={handleSubmitLesson} className="space-y-4 text-xs font-semibold text-slate-800">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 block tracking-widest pl-0.5">Author Teacher</label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full bg-white border border-slate-150 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-bold font-sans cursor-pointer"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialization || "Classroom Guide"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 block tracking-widest pl-0.5">Assigned Class</label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value as CourseType)}
                    className="w-full bg-white border border-slate-150 rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-bold font-sans cursor-pointer"
                  >
                    {Object.values(CourseType).map(ct => (
                      <option key={ct} value={ct}>{ct} Level</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 block tracking-widest pl-0.5">Execution Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white border border-slate-150 rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 block tracking-widest pl-0.5">Topic Theme / Lesson Title</label>
                <input
                  type="text"
                  placeholder="e.g. Tactile felt discovery with paint rollers..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-white border border-slate-150 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-bold"
                  maxLength={110}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 block tracking-widest pl-0.5">Learning Objectives</label>
                <textarea
                  rows={2}
                  placeholder="What sensory/cognitive development milestones are we addressing?"
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="w-full bg-white border border-slate-150 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-bold leading-relaxed scrollbar-hide"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 block tracking-widest pl-0.5">Hands-on Co-ordinated Activities</label>
                <textarea
                  rows={2}
                  placeholder="Describe building circles, sand trails, song sequences..."
                  value={activities}
                  onChange={(e) => setActivities(e.target.value)}
                  className="w-full bg-white border border-slate-150 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-bold leading-relaxed scrollbar-hide"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {saving ? "Saving to Gurukul Database..." : "Save Lesson & Sync Parent App"}
              </button>

            </form>
          </div>

          {/* SaaS Preschool Quick Stats Panel */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-150 rounded-[32px] p-5 flex items-center justify-between shadow-2xs relative overflow-hidden select-none">
            <div className="space-y-0.5">
              <span className="text-[9.5px] font-mono tracking-wider font-extrabold text-emerald-600 uppercase block">MONTESSORI MILESTONE PROGRESS</span>
              <h5 className="font-extrabold text-slate-800 text-[13.5px]">Direct Teacher Feed</h5>
              <p className="text-[10px] text-slate-500 font-semibold">95% Roster engagement mapped in system</p>
            </div>
            <div className="text-3xl">🥦</div>
          </div>

        </div>
      </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start animate-fadeIn" id="teacher-dashboard-exams-workspace">
          
          {/* LEFT COLUMN: xl:col-span-7 - Scorecard entry desk OR Exam Schedules list */}
          <div className="xl:col-span-7 space-y-6">
            {gradingExam ? (
              /* A. Grading scorecard desk */
              <div className="bg-white rounded-[32px] border border-slate-150 p-6 lg:p-8 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest font-black text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-100">
                      Active Grading Desk • {gradingExam.academicTerm}
                    </span>
                    <h3 className="text-lg font-black text-slate-800">
                      {gradingExam.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed font-sans">
                      Subject Stream: <strong className="font-bold text-slate-700">{gradingExam.subject}</strong> • Max Marks: <strong className="font-bold text-slate-700">{gradingExam.maxMarks}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setGradingExam(null)}
                    type="button"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-[#2B547E] font-extrabold text-xs uppercase tracking-wider cursor-pointer border border-transparent font-sans"
                  >
                    ← Close Desk
                  </button>
                </div>

                {/* Students list for score input */}
                {filteredStudents.length > 0 ? (
                  <div className="space-y-4">
                    <span className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                      Enrolled Students Class Roll ({filteredStudents.length})
                    </span>
                    
                    <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2 space-y-4 pt-1">
                      {filteredStudents.map((std) => {
                        const scoreData = gradingRoster[std.id] || { homeworkScore: 0, examScore: 0, remarks: "" };
                        return (
                          <div key={std.id} className="pt-3.5 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans border-b border-slate-50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-705 font-extrabold text-sm">
                                {std.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-800 leading-none mb-1">{std.name}</h4>
                                <p className="text-[10.5px] text-slate-400 font-mono">Roll: {std.rollNo}</p>
                              </div>
                            </div>

                            {/* Scoring inputs */}
                            <div className="flex flex-wrap items-center gap-3.5">
                              <div className="w-24">
                                <label className="text-[9px] uppercase font-black text-slate-400 block tracking-tight mb-0.5 font-sans">Fine Motor (30%)</label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={scoreData.homeworkScore}
                                    onChange={(e) => handleUpdateStudentRosterScore(std.id, "homeworkScore", Number(e.target.value) || 0)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-xs text-center font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                  <span className="absolute right-1 text-[9px] text-slate-455 font-bold bottom-1">%</span>
                                </div>
                              </div>

                              <div className="w-24">
                                <label className="text-[9px] uppercase font-black text-slate-400 block tracking-tight mb-0.5 font-sans">Sensory Score (70%)</label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={scoreData.examScore}
                                    onChange={(e) => handleUpdateStudentRosterScore(std.id, "examScore", Number(e.target.value) || 0)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-xs text-center font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                  <span className="absolute right-1 text-[9px] text-slate-455 font-bold bottom-1">%</span>
                                </div>
                              </div>

                              <div className="flex-1 min-w-[140px]">
                                <label className="text-[9px] uppercase font-black text-slate-400 block tracking-tight mb-0.5 font-sans">Teacher Evaluation Remarks</label>
                                <input
                                  type="text"
                                  placeholder="Well-coordinated sensory activity."
                                  value={scoreData.remarks || ""}
                                  onChange={(e) => handleUpdateStudentRosterScore(std.id, "remarks", e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-250 rounded-lg py-1.5 px-2.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>

                              <button
                                onClick={() => handleSaveStudentGrade(std.id)}
                                type="button"
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg uppercase tracking-wider self-end shadow-xs cursor-pointer border border-transparent font-sans"
                              >
                                Save Score
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-between items-center bg-slate-50 p-4.5 rounded-2xl">
                      <div className="space-y-0.5 font-sans">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide block">Roster Actions</label>
                        <p className="text-[11px] text-slate-550 font-semibold">Have you recorded all classroom scores correctly?</p>
                      </div>
                      <button
                        onClick={() => handleMarkExamCompleted(gradingExam)}
                        type="button"
                        className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-black uppercase tracking-wider cursor-pointer border border-transparent font-sans"
                      >
                        ✔ Finalize Assessment & Mark Completed
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-450 text-xs font-sans">
                    No active student profiles registered in {selectedGrade} class list. Please declare students in Admin section first.
                  </div>
                )}
              </div>
            ) : (
              /* B. Exam Schedule list */
              <div className="space-y-5">
                <div className="bg-white rounded-[32px] border border-slate-150 p-6 lg:p-7 shadow-2xs space-y-4">
                  <div className="flex flex-wrap justify-between items-center gap-3">
                    <div className="space-y-0.5 font-sans">
                      <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 align-middle">
                        <Award className="w-4 h-4 text-violet-500" />
                        <span>Gurukul Class Assessment Schedules</span>
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">Upcoming and completed examinations scheduled for {selectedGrade}</p>
                    </div>
                    <span className="text-[9.5px] uppercase tracking-wider font-extrabold bg-indigo-50 border border-indigo-150 rounded px-2.5 py-1.5 text-indigo-700 font-sans">
                      Synced on-cloud database
                    </span>
                  </div>

                  {/* List items */}
                  {exams.filter(ex => ex.course === selectedGrade).length > 0 ? (
                    <div className="space-y-4">
                      {exams
                        .filter(ex => ex.course === selectedGrade)
                        .map((exam) => {
                          const isComplete = exam.status === "Completed";
                          return (
                            <div
                              key={exam.id}
                              className={`p-5 rounded-3xl border transition duration-350 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-3xs hover:shadow-2xs ${
                                isComplete
                                  ? "bg-slate-50/50 border-slate-150"
                                  : "bg-white border-slate-150 hover:border-slate-200"
                              }`}
                            >
                              <div className="space-y-2 max-w-xl">
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase tracking-wide font-sans">
                                    {exam.academicTerm}
                                  </span>
                                  <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded uppercase tracking-wide font-semibold font-sans">
                                    {exam.subject}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded uppercase tracking-wide ${
                                    isComplete 
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold font-sans" 
                                      : "bg-amber-50 text-amber-700 border border-amber-100 font-extrabold font-sans"
                                  }`}>
                                    {exam.status}
                                  </span>
                                </div>
                                
                                <h4 className="font-extrabold text-sm text-slate-700 lg:text-base leading-snug font-sans">
                                  {exam.title}
                                </h4>
                                
                                <p className="text-slate-605 text-[11.5px] font-semibold font-sans leading-relaxed">
                                  <span className="font-bold text-slate-800 font-sans">Syllabus focus: </span>
                                  {exam.syllabus || "Montessori curriculum baseline objectives and picture recitation guides."}
                                </p>

                                <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-400 pt-1 font-mono">
                                  <span className="flex items-center gap-1">
                                    🗓 {exam.examDate}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    ⏰ {exam.examTime}
                                  </span>
                                  <span className="flex items-center gap-1 text-slate-700 font-black">
                                    💯 Marks Max: {exam.maxMarks}
                                  </span>
                                </div>
                              </div>

                              {/* Actions on this scheduled assessment exam card */}
                              <div className="flex flex-row md:flex-col items-stretch justify-end gap-2 shrink-0 border-t border-slate-100 md:border-transparent pt-3.5 md:pt-0">
                                <button
                                  onClick={() => handleOpenGrading(exam)}
                                  type="button"
                                  className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10.5px] uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-sm border border-transparent font-sans"
                                >
                                  📝 Enter Student Marks
                                </button>
                                
                                <div className="flex gap-1.5 md:justify-end">
                                  <button
                                    onClick={() => handleEditExamClick(exam)}
                                    type="button"
                                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg hover:text-indigo-600 font-bold transition text-xs flex-1 md:flex-none uppercase text-center cursor-pointer border border-slate-150 font-sans"
                                    title="Edit exam"
                                  >
                                    Edit
                                  </button>
                                  {onDeleteExam && (
                                    <button
                                      onClick={() => {
                                        if (confirm("Are you sure you want to cancel and delete this scheduled curriculum assessment?")) {
                                          onDeleteExam(exam.id);
                                        }
                                      }}
                                      type="button"
                                      className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg font-bold transition text-xs flex-1 md:flex-none uppercase text-center cursor-pointer border border-transparent font-sans"
                                      title="Delete/Cancel exam"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-[24px]">
                      <Award className="w-10 h-10 text-slate-300 mx-auto mb-2.5 animate-bounce" />
                      <p className="text-xs font-bold text-slate-550 font-sans">No scheduled exams mapped for {selectedGrade} class.</p>
                      <p className="text-[10px] text-slate-400 mt-1 pl-0.5 leading-normal font-sans">Use the right-hand panel form to schedule a beautiful assessment portfolio for this level.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: xl:col-span-5 - Generate/Schedule a New Assessment form */}
          <div className="xl:col-span-5 space-y-6">
            <div className="bg-white rounded-[32px] border border-slate-150 p-6 lg:p-7 shadow-2xs space-y-5">
              <div className="space-y-0.5 border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-slate-800 text-sm font-sans">
                  {isEditingExamId ? "✏️ Edit Scheduled assessment" : "📅 Montessori Exam Planner"}
                </h4>
                <p className="text-xs text-slate-500 font-sans">
                  {isEditingExamId ? "Update selected calendar schedule" : "Schedule a beautiful portfolio assessment"}
                </p>
              </div>

              {examFeedback && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-150 animate-fadeIn flex items-center gap-1.5 font-sans">
                  <span>{examFeedback}</span>
                </div>
              )}

              <form onSubmit={handleSubmitExam} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-400 block tracking-widest pl-0.5 font-sans">Exam Title / Assessment Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oral Nursery Rhyme & Letter Identification"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-extrabold font-sans"
                    maxLength={100}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-black uppercase text-slate-404 block tracking-widest pl-0.5 font-sans">Subject Stream</label>
                    <select
                      value={examSubject}
                      onChange={(e) => setExamSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5 outline-none text-xs font-bold cursor-pointer font-sans"
                    >
                      <option>Phonics & Language</option>
                      <option>Cognitive Tiers</option>
                      <option>Drawing & Fine Motor</option>
                      <option>Social Play & Sharing</option>
                      <option>Day-Care Caring Sensory</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-black uppercase text-slate-404 block tracking-widest pl-0.5 font-sans">Academic Term</label>
                    <select
                      value={examTerm}
                      onChange={(e: any) => setExamTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2.5 outline-none text-xs font-bold cursor-pointer font-sans"
                    >
                      <option>Term 1</option>
                      <option>Term 2</option>
                      <option>Final Term</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3.5 text-xs font-semibold">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[9.5px] font-black uppercase text-slate-404 block tracking-widest pl-0.5 font-sans">Scheduled Date</label>
                    <input
                      type="date"
                      required
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-black uppercase text-slate-404 block tracking-widest pl-0.5 font-sans">Max Marks</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={100}
                      value={examMaxMarks}
                      onChange={(e) => setExamMaxMarks(Number(e.target.value) || 50)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 text-xs font-bold text-center"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs font-semibold">
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-black uppercase text-slate-404 block tracking-widest pl-0.5 font-sans">Daily Hour / Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 09:30 AM"
                      value={examTime}
                      onChange={(e) => setExamTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3.5 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-extrabold font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9.5px] font-black uppercase text-slate-404 block tracking-widest pl-0.5 font-sans">Syllabus Details & Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Describe child expectations, recitation list, or block designs..."
                    value={examSyllabus}
                    onChange={(e) => setExamSyllabus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-bold leading-relaxed scrollbar-hide font-sans"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={savingExam}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-md shadow-indigo-600/10 cursor-pointer text-center border border-transparent font-sans"
                  >
                    {savingExam ? "Saving schedule..." : isEditingExamId ? "Update Schedule" : "Schedule Exam"}
                  </button>
                  {isEditingExamId && (
                    <button
                      type="button"
                      onClick={handleClearExamForm}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer border border-transparent font-sans"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            {/* Quick Helper guidelines Card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-150 rounded-[32px] p-5 flex items-start gap-3.5 shadow-3xs select-none">
              <span className="text-2xl pt-1">📖</span>
              <div className="space-y-0.5 font-sans">
                <span className="text-[9px] font-mono tracking-wider font-black text-amber-600 uppercase block">GURUKUL STAFF RULE GUIDE</span>
                <h5 className="font-extrabold text-slate-800 text-[12.5px]">Evaluation Weighting Rule</h5>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                  The SaaS computing engine automatically divides student cards into Fine Motor Skill tasks (30% weight) and raw Sensory tests (70% weight). No manuals needed.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
