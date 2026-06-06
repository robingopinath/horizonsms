import React, { useState } from "react";
import { BookOpen, Search, Printer, HelpCircle, FileText, CheckCircle2, Award, Users, Shield, ShieldCheck, Heart, Sparkles, CreditCard, ChevronRight, School, Globe } from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  sections: {
    title: string;
    content: string;
    bullets?: string[];
  }[];
}

export default function SaaSEbookGuide() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChapter, setActiveChapter] = useState<string>("ch1");

  const chapters: Chapter[] = [
    {
      id: "ch1",
      title: "1. Campus Vision & SaaS Ecosystem",
      subtitle: "Introduction to Horizon International Tech Play School Digital Core",
      icon: <School className="w-5 h-5 text-indigo-600" />,
      sections: [
        {
          title: "Operating Strategy & Mission",
          content: "Horizon International Tech Play School, powered by NextGen Gurukul and licensed under Arivu Foundation, is a forward-looking early educational institute. The SaaS platform serves as a modern operating hub that seamlessly connects administrators, instructors, parents, and trust leaders into an efficient system.",
          bullets: [
            "Cohesion: Real-time synchronization across SIS (Student Information System), Grading, Attendance, and Billing modules.",
            "Pedagogical Integrity: Retaining the playful Montessori essence while introducing early tech exposure, structured progress tracking, and developmental observations.",
            "Accountability: Powered by the Arivu Foundation Charitable & Educational Trust to verify transparency, compliance, and academic excellence."
          ]
        },
        {
          title: "System Architecture & Integration Topology",
          content: "The platform's engineering design centers around zero-entropy synchronization. When a teacher updates grades or logs play attendance on-campus, this propagates to administrative accounting records and guardian dashboards instantly. Features are designed to reduce double-entry administrative waste, safeguarding staff hours."
        }
      ]
    },
    {
      id: "ch2",
      title: "2. Administrative Power Guide (SIS, HR & Payroll)",
      subtitle: "Full systems guide for administrators and management controls",
      icon: <Shield className="w-5 h-5 text-rose-600" />,
      sections: [
        {
          title: "Student Information System (SIS)",
          content: "Admins can oversee the student ledger, admit prospective children, assign them to streams, edit guardian profiles, and archive students. This acts as the single source of truth for headcount data.",
          bullets: [
            "Adding Students: Enter full name, registration age group, parent email keys, active enrollment state, and initial fee settings.",
            "Editing Profiles: Modify contact details, parent relationships, or stream flags on the fly.",
            "State Preservation: Deletions are securely handled, prompting validation keys to prevent catalog accidents."
          ]
        },
        {
          title: "Human Resources (HR) & Guides Roster",
          content: "Instructors and administrators can be cataloged seamlessly on the Roster ledger. The SaaS platform tracks active payroll calculations, joining timelines, specializations, and daily work statuses.",
          bullets: [
            "Vidyasagar MD Record: The trust head and director index is pre-loaded and locked as the primary administrator ('vidyasagarpcg@gmail.com').",
            "Teacher Profiles: Roster stores specialization certificates (e.g., Montessori Head, Play Therapist, Tech Lab Specialist).",
            "Archiving Cohorts: Guides can be marked as active, on leave, or retired within the HR grid."
          ]
        },
        {
          title: "Trust Payroll Accounting Engine",
          content: "Salary ledgers are tabulated by the SaaS platform using predefined dynamic templates. Administrators can record monthly pay disbursements, bonus structures, and print payslips securely.",
          bullets: [
            "Dynamic Calculation: Calculates base salaries, additional curriculum header bonuses, and trust deduction fields simultaneously.",
            "Disbursal Flags: Clear colored tagging guides (e.g., Paid vs. Pending) to monitor budget alignment easily.",
            "Audit Trail: Payroll data links directly with Arivu Foundation financial audits for compliance."
          ]
        }
      ]
    },
    {
      id: "ch3",
      title: "3. Instructor & Guide Playbook",
      subtitle: "Instructions for educators on attendance, grading, and syllabus tracking",
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      sections: [
        {
          title: "Marking Morning Attendance",
          content: "Instructors access the dynamic Roll Call Attendance panel first thing in the morning. Since consistency is a pillar of early learning, the tracking matrix supports quick toggle flags.",
          bullets: [
            "Attendance Toggles: Switch any student's state between Present, Absent, or Late with a single tap.",
            "Instant Sync: Marked records automatically compile into parent metrics and public statistical summaries.",
            "Aggregated View: The system keeps historical logs of classroom presence to detect long-term patterns."
          ]
        },
        {
          title: "Playroom Grading & Milestone Assessments",
          content: "Unlike rigid traditional tests, Horizon International Play School evaluates play milestones, behavioral milestones, and interactive physical milestones. Grading models adjust based on weighted formulas configured by administrators.",
          bullets: [
            "Milestone Types: Grading records support physical coordination, social collaboration, basic numeracy play, and phonics milestones.",
            "Weighted Scores: Supports exam weights (assessments) and homework weights (weekly activities) customizable inside Settings.",
            "Interactive Feedbacks: Teachers can append feedback remarks on milestones to share with guardians."
          ]
        },
        {
          title: "Syllabus Planning & Daily Digital Bulletins",
          content: "Lessons plans are created on-platform by certified guides to manage weekly curricula across multiple learning domains.",
          bullets: [
            "Weekly Lessons: Guides outline Montessori focus materials, interactive group routines, and recommended reading sessions.",
            "Daily Bulletins: Log actual play activities completed today or instructions for evening activities at home."
          ]
        }
      ]
    },
    {
      id: "ch4",
      title: "4. Guardian & Parent Secure Desk",
      subtitle: "A collaborative bridge for child monitoring and parent cooperation",
      icon: <Heart className="w-5 h-5 text-fuchsia-600" />,
      sections: [
        {
          title: "Monitoring child progress",
          content: "Through the dedicated Parent workspace, guardians obtain full transparency of their child's educational track, logs, assignments, grades, and teacher notes.",
          bullets: [
            "Milestone Ledger: Guardians can instantly view feedback and scores parsed into comprehensive charts.",
            "Daily Presence Tracker: A calendar showing full attendance status to reinforce student routing.",
            "Teachers directory: Reach out with teachers and coordinators, viewing specialized syllabus files."
          ]
        },
        {
          title: "Secure Communication & Tuition Settlement",
          content: "Parents can complete fee invoice payments securely on-platform, tracking paid ledgers instantly.",
          bullets: [
            "Invoice Tallying: Check billing descriptions, due milestones, tuition itemization, and net payable value.",
            "Simulated Payment Processing: A direct payment gate confirmation system for easy testing and billing sandbox usage."
          ]
        }
      ]
    },
    {
      id: "ch5",
      title: "5. Billing & School Finance Ledger",
      subtitle: "A detailed breakdown of fee engines, payments, and invoices",
      icon: <CreditCard className="w-5 h-5 text-amber-600" />,
      sections: [
        {
          title: "Invoice Generation Engine",
          content: "Administrators generate detailed invoices targeted at families. Invoices can be structured for general tuition, Montessori materials, food, transport, or lab assessments.",
          bullets: [
            "Targeted Invoicing: Send bills selectively or cast invoices globally for entire classroom cohorts.",
            "Automatic Net Value Parsing: Auto-sums base headers, tax percentages, foundation discounts, and displays grand totals.",
            "Real-Time Paid Stats: Displays live tracking of paid vs. outstanding dues to provide cash flow insights for trust managers."
          ]
        }
      ]
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  const getFilteredChapters = () => {
    if (!searchQuery.trim()) return chapters;
    const q = searchQuery.toLowerCase();
    
    return chapters.map(ch => {
      const filteredSections = ch.sections.filter(sec => 
        sec.title.toLowerCase().includes(q) || 
        sec.content.toLowerCase().includes(q) ||
        (sec.bullets && sec.bullets.some(b => b.toLowerCase().includes(q)))
      );
      
      if (filteredSections.length > 0 || ch.title.toLowerCase().includes(q) || ch.subtitle.toLowerCase().includes(q)) {
        return {
          ...ch,
          sections: filteredSections.length > 0 ? filteredSections : ch.sections
        };
      }
      return null;
    }).filter(ch => ch !== null) as Chapter[];
  };

  const filteredChapters = getFilteredChapters();

  return (
    <div className="w-full space-y-6">
      {/* Dynamic Style Tags for Pristine Browser-Native PDF Printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-ebook, #printable-ebook * {
            visibility: visible !important;
          }
          #printable-ebook {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            padding: 2rem !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
          }
          .text-gradient {
            background: none !important;
            -webkit-background-clip: initial !important;
            -webkit-text-fill-color: initial !important;
            color: #1e1b4b !important;
          }
        }
      `}</style>

      {/* Hero Header Area */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[32px] p-6 sm:p-10 text-white relative overflow-hidden shadow-xl no-print">
        {/* Decorative Grid backdrop */}
        <div className="absolute inset-0 opacity-[0.06] select-none pointer-events-none mix-blend-overlay">
          <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="headerGridManual" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#6366F1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#headerGridManual)" />
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 rounded-full text-[10.5px] font-black uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 animate-pulse" /> Official Training E-Book & Guide
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight uppercase font-sans">
              Horizon SaaS Platform Handbook
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
              An immersive digital operating guide compiled for administrators, certified teachers, classroom coordinators, and board of directors of Horizon International Tech Play School, Thirumalapura.
            </p>
          </div>
          
          <button
            onClick={handlePrint}
            className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all hover:scale-[1.03] active:scale-[0.97] shrink-0 cursor-pointer flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Generate & Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Sidebar Index Indicator (Hidden on Print) */}
        <nav className="col-span-1 lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-6 no-print">
          <div className="space-y-2">
            <label className="text-[10px] tracking-wider text-slate-400 font-black uppercase block pl-1">
              Search Handbook Content
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search topics, SIS, payroll..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-650/10 focus:border-indigo-650 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] text-indigo-600 hover:underline font-black uppercase"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="text-[10px] tracking-wider text-slate-400 font-black uppercase block pl-1 font-mono">
              Table of Contents
            </span>
            <div className="space-y-1.5 flex flex-col">
              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveChapter(ch.id);
                    const el = document.getElementById(`manual-${ch.id}`);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`w-full px-4 py-3 rounded-2xl text-left transition duration-200 flex items-center justify-between gap-3 border ${
                    activeChapter === ch.id 
                      ? "bg-slate-900 border-slate-900 text-white font-bold" 
                      : "bg-slate-50/40 border-slate-100 hover:bg-slate-100/50 text-slate-700 font-extrabold"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`shrink-0 ${activeChapter === ch.id ? "text-amber-400" : "text-indigo-600"}`}>
                      {ch.icon}
                    </span>
                    <span className="text-xs truncate font-sans">{ch.title.substring(3)}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${activeChapter === ch.id ? "text-amber-400" : "text-slate-400"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats Banner card inside nav sidebar list */}
          <div className="bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-50/20 border border-indigo-100/50 p-4.5 rounded-[22px] space-y-3 shadow-inner">
            <h4 className="text-[11px] font-black text-indigo-950 uppercase tracking-tight flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Administrative Notice
            </h4>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              All training material conforms with the Horizon play school academic standards valid for the 2026/2027 fiscal layout.
            </p>
          </div>
        </nav>

        {/* E-book Printable and Interactive View Area */}
        <div className="col-span-1 lg:col-span-8 space-y-8">
          
          {/* Ebook Document Wrapper */}
          <article 
            id="printable-ebook" 
            className="bg-white rounded-[32px] border border-slate-200/80 p-8 sm:p-12 shadow-[0_8px_30px_rgb(15,23,42,0.02)] relative overflow-hidden"
          >
            {/* Header top elements printed ONLY - invisible in standard webpage, but layout handles it cleanly */}
            <div className="hidden print:flex flex-col items-center justify-center text-center pb-8 border-b border-slate-200 mb-10">
              <span className="text-[10px] font-black tracking-[0.25em] text-indigo-600 uppercase">OFFICIAL SCHOOL MANUAL & SYSTEM GUIDE</span>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-2">HORIZON INTERNATIONAL TECH PLAY SCHOOL</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Unified SaaS Application Guide (NextGen Gurukul Operating Core)</p>
            </div>

            {/* COVER PAGE (Printed as fine Page 1) */}
            <div className="space-y-6 pb-12 border-b border-dashed border-slate-200 mb-12">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="inline-block bg-[#F2C94C] text-[#2D2D2D] text-[9.5px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-2xs font-display">
                    Secure Operation Ledger
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight uppercase font-sans">
                    Universal SaaS<br />
                    <span className="text-indigo-650 font-black">Handbook E-Book</span>
                  </h1>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-[8px] font-black tracking-widest text-[#5E60E6] uppercase">SYSTEM VERSION</span>
                  <span className="text-xs font-extrabold text-slate-800 font-mono">v2.5.2 Stable</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">Target Readers Checklist</span>
                  <div className="mt-3.5 space-y-2 text-slate-600 font-semibold font-sans">
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Admin Officer Desk</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Teachers & Activity Guides</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Foundation Trust Auditors</p>
                  </div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">School Authority Indices</span>
                  <div className="mt-3.5 space-y-1 bg-transparent text-[11px] text-slate-600 font-medium font-sans leading-relaxed">
                    <p>• <strong>Institution:</strong> Horizon International</p>
                    <p>• <strong>Trust Body:</strong> Arivu Foundation</p>
                    <p>• <strong>Design Engine:</strong> NextGen Gurukul</p>
                    <p>• <strong>Affiliation Link:</strong> Bengaluru Urban District</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CHAPTERS INDEX SECTION */}
            <div className="space-y-12">
              {filteredChapters.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <BookOpen className="w-10 h-10 mx-auto opacity-30 mb-2" />
                  <p className="text-xs font-bold font-sans">No chapters or sections found matching your search query.</p>
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="text-indigo-650 hover:underline text-xs font-black uppercase mt-2 block mx-auto"
                  >
                    Reset Search Filter
                  </button>
                </div>
              ) : (
                filteredChapters.map((ch, index) => (
                  <section 
                    key={ch.id} 
                    id={`manual-${ch.id}`}
                    className={`space-y-6 pt-2 pb-6 border-b border-slate-100 last:border-b-0 ${index > 0 ? "page-break pt-8" : ""}`}
                  >
                    {/* Chapter title header bar with icon and accents */}
                    <div className="flex items-center gap-4 border-b border-indigo-50 pb-3 select-none">
                      <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100/30">
                        {ch.icon}
                      </div>
                      <div className="leading-tight">
                        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase font-sans">
                          {ch.title}
                        </h2>
                        <p className="text-[10.5px] sm:text-xs text-slate-450 font-bold block">
                          {ch.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Section blocks inside Chapter */}
                    <div className="space-y-6">
                      {ch.sections.map((sec, secIdx) => (
                        <div key={secIdx} className="space-y-3 text-left font-sans text-xs">
                          <h3 className="text-[12.5px] sm:text-sm font-black text-slate-800 tracking-tight uppercase pl-1.5 border-l-4 border-indigo-600 block leading-none py-0.5">
                            {sec.title}
                          </h3>
                          <p className="text-slate-600 font-medium leading-relaxed font-sans text-[11.5px] pl-3.5">
                            {sec.content}
                          </p>

                          {sec.bullets && (
                            <ul className="pl-6 space-y-1.5 list-disc text-slate-500 font-semibold font-sans text-[11px]">
                              {sec.bullets.map((bullet, bulletIdx) => (
                                <li key={bulletIdx} className="leading-relaxed">
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>

            {/* Handbook Core Footer (Printed) */}
            <div className="hidden print:flex flex-col items-center justify-center text-center mt-12 pt-6 border-t border-slate-200">
              <span className="text-[8px] font-black text-slate-400 tracking-[0.2em] uppercase leading-none">END OF SAAS MANUAL E-BOOK</span>
              <p className="text-[9.5px] text-slate-400 font-bold font-sans mt-1.5">© 2026 Horizon International Tech Play School & Arivu Foundation Charitable Trust. All Rights Reserved.</p>
            </div>
          </article>

          {/* Quick FAQ Interactive segment */}
          <div className="bg-white rounded-[28px] border border-slate-200/80 p-6 shadow-[0_8px_20px_rgba(15,23,42,0.01)] space-y-4 no-print text-[11.5px] font-sans">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <HelpCircle className="w-4.5 h-4.5 text-indigo-600 animate-bounce" /> Frequently Asked Questions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1 border border-slate-100">
                <p className="font-extrabold text-slate-800 uppercase tracking-tight text-[10.5px]">How do I export to a clean PDF?</p>
                <p className="text-slate-500 font-medium leading-relaxed">Simply click the "Generate & Download PDF" button at the top header. The browser will invoke its printing system with custom styled CSS to remove other system links and output just the clean handbook.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1 border border-slate-100">
                <p className="font-extrabold text-slate-800 uppercase tracking-tight text-[10.5px]">Is the handbook synced?</p>
                <p className="text-slate-500 font-medium leading-relaxed">Yes! If our systems group adjusts the platform core guidelines or weighted evaluation metrics, updates propagate directly to the live guidebook ledger reader.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
