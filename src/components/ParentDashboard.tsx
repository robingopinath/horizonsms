/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Student, Invoice, GradeItem, AttendanceRecord, HomeworkRecord } from "../types";
import { CreditCard, Calendar, Award, Receipt, Milestone, Sparkles, Printer, CheckCircle, Smartphone, BookOpen } from "lucide-react";
import HorizonLogo from "./HorizonLogo";

interface ParentDashboardProps {
  students: Student[];
  billing: Invoice[];
  grades: GradeItem[];
  attendance: AttendanceRecord[];
  homework: HomeworkRecord[];
  onPayInvoice: (invoiceId: string) => Promise<void>;
}

export default function ParentDashboard({
  students,
  billing,
  grades,
  attendance,
  homework,
  onPayInvoice
}: ParentDashboardProps) {
  // If multiple students exist, let parent select their child (highly intuitive for evaluation)
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

  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "academics" | "billing" | "homework">("overview");
  const [showStripeModal, setShowStripeModal] = useState<Invoice | null>(null);
  const [stripeProcessing, setStripeProcessing] = useState(false);
  const [viewingInvoicepdf, setViewingInvoicepdf] = useState<Invoice | null>(null);

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
      <div className="p-8 text-center bg-white rounded-3xl border border-gray-100 shadow-xl max-w-lg mx-auto">
        <Milestone className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-gray-800">No active student profiles found.</h3>
        <p className="text-gray-500 mt-2">Please create student records in the Admin tab first.</p>
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

  return (
    <div className="space-y-6" id="parent-dashboard-root">
      {/* Child Switcher Ribbon */}
      <div className="bg-gradient-to-r from-[#4E54C8] to-[#8F94FB] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
            <Milestone className="w-10 h-10 text-white" />
          </div>
          <div>
            <span className="text-xs text-indigo-200 font-semibold tracking-wider uppercase">Active Parent View</span>
            <div className="flex items-center gap-2 mt-1">
              <label className="text-sm font-medium text-indigo-100 hidden sm:inline">My Ward:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-white/10 hover:bg-white/20 text-white font-extrabold text-base rounded-xl px-3 py-1.5 border border-white/20 outline-none focus:ring-2 focus:ring-white/50 transition cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id} className="text-gray-800">
                    {s.name} ({s.course})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 bg-black/15 p-1 rounded-2xl self-start md:self-auto">
          {(["overview", "attendance", "academics", "homework", "billing"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold capitalize transition-all duration-300 ${
                activeTab === tab
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-indigo-100 hover:bg-white/10"
              }`}
            >
              {tab === "homework" ? "Homework & Activities" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Panels */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left panel: Profile Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-md space-y-6">
            <div className="text-center pb-6 border-b border-gray-100">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-400 via-orange-400 to-yellow-300 mx-auto flex items-center justify-center text-white text-4xl font-black shadow-lg">
                {student.name.charAt(0)}
              </div>
              <h3 className="text-xl font-extrabold text-gray-800 mt-4">{student.name}</h3>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 text-xs font-bold text-teal-700 bg-teal-50 rounded-full">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Active Enrollment
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Course Stream</span>
                <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full text-xs">
                  {student.course}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Roll Number</span>
                <span className="font-semibold text-gray-700">{student.rollNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Age / Gender</span>
                <span className="font-semibold text-gray-700">{student.age} yrs / {student.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Father's Name</span>
                <span className="font-semibold text-gray-700">{student.fatherName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Mother's Name</span>
                <span className="font-semibold text-gray-700">{student.motherName}</span>
              </div>
              <div className="pt-2">
                <span className="text-gray-400 block font-medium mb-1">Registered Address</span>
                <p className="text-gray-600 text-xs leading-relaxed bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                  {student.address}
                </p>
              </div>
            </div>
          </div>

          {/* Right panel: Modern Bento Stats */}
          <div className="md:col-span-2 space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-400 to-green-500 p-6 rounded-3xl text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-green-100">Attendance Quotient</span>
                  <div className="text-4xl font-extrabold">{attendanceRate}%</div>
                  <p className="text-xs text-green-100 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {presentDays} of {totalDays} scheduled days present
                  </p>
                </div>
                <div className="absolute -right-6 -bottom-6 text-white/10 transform rotate-12">
                  <Calendar className="w-32 h-32" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-400 to-amber-500 p-6 rounded-3xl text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-100">Unpaid Invoices</span>
                  <div className="text-4xl font-extrabold">
                    ₹{childBilling.filter((b) => b.status !== "Paid").reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString("en-IN")}
                  </div>
                  <p className="text-xs text-amber-100 flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5" />
                    {childBilling.filter((b) => b.status !== "Paid").length} bill(s) pending clearance
                  </p>
                </div>
                <div className="absolute -right-6 -bottom-6 text-white/10 transform rotate-12">
                  <CreditCard className="w-32 h-32" />
                </div>
              </div>
            </div>

            {/* Latest Progress Notice */}
            <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
              <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                Academic Overview for {student.name}
              </h4>
              {childGrades.length > 0 ? (
                <div className="space-y-3">
                  {childGrades.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 rounded-2xl bg-amber-50/50 border border-amber-100">
                      <div>
                        <span className="text-xs text-indigo-500 font-bold block">{item.subject}</span>
                        <p className="text-xs text-gray-600 truncate max-w-sm mt-0.5">"{item.remarks}"</p>
                      </div>
                      <div className="text-right">
                        <span className="text-indigo-900 font-extrabold text-sm block">{item.weightedTotal}%</span>
                        <span className="text-[10px] font-black text-amber-600 uppercase bg-amber-100 px-1.5 py-0.5 rounded-md">Grade {item.letterGrade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-xs">
                  No academic report card marks updated yet. Check back soon.
                </div>
              )}
            </div>

            {/* Simulated SMS Alert Previewer */}
            <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-amber-800 text-xs uppercase tracking-wider">SMS Push Alert Simulation (Twilio Pipeline)</h4>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-2xl border border-amber-200/60 font-mono">
                "SIMULATED SMS to {student.contactPhone}: Horizon Int. Tech Play School notifies that {student.name} is {childAttendance[0]?.status || "Present"} today. Standard safety dashboard notifications enabled."
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="bg-white rounded-3xl border border-[#ECEFF1] p-6 shadow-md space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Attendance Log</h3>
              <p className="text-xs text-gray-500">Track child daily presence and check auto warnings</p>
            </div>
            <div className="text-right bg-green-50 px-4 py-2 rounded-2xl border border-green-100">
              <span className="text-xs text-green-700 font-bold block">Consolidated Rate</span>
              <span className="text-2xl font-black text-green-600">{attendanceRate}%</span>
            </div>
          </div>

          {/* Graphical grid representing 30 days attendance */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-600 block">Visual 60-Day Presence Stream</span>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 30 }).map((_, idx) => {
                const dayNumber = 30 - idx;
                const status = idx === 0 ? (childAttendance[0]?.status || "Present") : (idx % 8 === 0 ? "Absent" : idx % 15 === 0 ? "Late" : "Present");
                const colors = {
                  Present: "bg-green-500 hover:bg-green-600",
                  Absent: "bg-red-500 hover:bg-red-600",
                  Late: "bg-amber-500 hover:bg-amber-600",
                };
                return (
                  <div
                    key={idx}
                    title={`Day -${dayNumber}: ${status}`}
                    className={`w-6 h-6 rounded-md ${colors[status]} cursor-pointer flex items-center justify-center text-[9px] text-white font-bold transition-all duration-200 shadow-sm`}
                  >
                    {status === "Present" ? "P" : status === "Absent" ? "A" : "L"}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-600 pt-2 border-t border-gray-100">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-500 rounded-sm" /> Present</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500 rounded-sm" /> Absent (Triggers Warning SMS)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-500 rounded-sm" /> Late Arrival</span>
            </div>
          </div>

          {/* Audit table */}
          {childAttendance.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 text-xs font-bold uppercase">
                  <tr>
                    <th className="p-4 rounded-tl-2xl">Attendance Date</th>
                    <th className="p-4">Daily Status</th>
                    <th className="p-4">Marked Author</th>
                    <th className="p-4 rounded-tr-2xl">Simulated Alert Trigger</th>
                  </tr>
                </thead>
                <tbody>
                  {childAttendance.map((record) => (
                    <tr key={record.id} className="border-t border-gray-100 hover:bg-gray-50/50 transition">
                      <td className="p-4 font-bold text-gray-800">{record.date}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                            record.status === "Present"
                              ? "bg-green-100 text-green-700"
                              : record.status === "Absent"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 font-medium">{record.markedBy}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-100 font-mono text-[10px] rounded-lg text-indigo-700">
                          <CheckCircle className="w-3 h-3 text-indigo-600" />
                          SMS Verified & Push Sent
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400 text-xs">
              No recent attendance logs cleared in database.
            </div>
          )}
        </div>
      )}

      {activeTab === "academics" && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Student Academic Report Card</h3>
              <p className="text-xs text-gray-500">
                Grade Weighted Matrix: <span className="font-extrabold text-[#744FC9]">Homework 30%</span> •{" "}
                <span className="font-extrabold text-[#F9801D]">Exams 70%</span>
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-2xl hover:from-indigo-600 hover:to-indigo-700 font-bold text-xs shadow-md transition self-start"
            >
              <Printer className="w-4 h-4" />
              Print Report Card
            </button>
          </div>

          {childGrades.length > 0 ? (
            <div className="space-y-6">
              <div className="overflow-x-auto rounded-3xl border border-gray-100">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#6162CA]/10 text-gray-800 text-xs font-extrabold uppercase">
                    <tr>
                      <th className="p-4 rounded-tl-2xl">Subject Stream</th>
                      <th className="p-4">Homework (30%)</th>
                      <th className="p-4">Exam Marks (70%)</th>
                      <th className="p-4">Weighted Total</th>
                      <th className="p-4">Final Grade</th>
                      <th className="p-4 rounded-tr-2xl">Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {childGrades.map((g) => (
                      <tr key={g.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                        <td className="p-4 font-extrabold text-indigo-900">{g.subject}</td>
                        <td className="p-4 text-gray-600 font-bold">{g.homeworkScore}%</td>
                        <td className="p-4 text-gray-600 font-bold">{g.examScore}%</td>
                        <td className="p-4 text-gray-800 font-extrabold text-sm">{g.weightedTotal}%</td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-xl text-xs font-black ${
                              g.letterGrade.startsWith("A")
                                ? "bg-green-100 text-green-700"
                                : g.letterGrade.startsWith("B")
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {g.letterGrade}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 text-xs italic font-medium leading-normal max-w-xs md:max-w-md">
                          "{g.remarks}"
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Progress Summary Section */}
              <div className="p-6 bg-gradient-to-br from-[#8E44AD]/10 to-[#3498DB]/10 rounded-3xl border border-indigo-100 flex flex-col md:flex-row gap-6 justify-between items-center text-center md:text-left">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-indigo-950 flex items-center gap-2 justify-center md:justify-start">
                    <Award className="text-indigo-600 w-5 h-5 animate-pulse" />
                    School Academic Remarks & Feedback
                  </h4>
                  <p className="text-xs text-indigo-900 leading-relaxed max-w-xl">
                    Our dynamic report card calculates final metrics. For play-school children, grades are indicators of visual recognition, social play progress, and motor response coordinates.
                  </p>
                </div>
                <div className="bg-[#6C5CE7] text-white px-6 py-4 rounded-3xl text-center shadow-md">
                  <span className="text-[10px] font-bold uppercase text-indigo-100 block tracking-widest">Aggregate Score</span>
                  <span className="text-3xl font-black block mt-0.5">
                    {Math.round(childGrades.reduce((acc, g) => acc + g.weightedTotal, 0) / childGrades.length)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              No report card entries uploaded yet for this student class.
            </div>
          )}
        </div>
      )}

      {activeTab === "billing" && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-md space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Play-School Fee Invoices</h3>
            <p className="text-xs text-gray-500">Submit electronic fee payments securely via integrated Stripe trigger</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {childBilling.length > 0 ? (
              childBilling.map((invoice) => (
                <div
                  key={invoice.id}
                  className="p-5 bg-[#FAFAFA] rounded-3xl border border-gray-200/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition hover:shadow-sm"
                >
                  <div className="space-y-1.5 w-full sm:w-auto">
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-950 font-black text-sm block">#{invoice.id}</span>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          invoice.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-bold block">{invoice.term}</span>
                    <p className="text-xs text-gray-600 font-medium">
                      Due On: <span className="font-extrabold text-gray-800">{invoice.dueDate}</span>
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-4">
                    <span className="text-xl font-black text-indigo-950">
                      ₹{invoice.totalAmount.toLocaleString("en-IN")}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingInvoicepdf(invoice)}
                        className="px-4 py-2 bg-white text-indigo-600 rounded-xl hover:bg-gray-100/50 font-bold text-xs border border-gray-200 shadow-sm transition"
                      >
                        View Fee Receipt
                      </button>

                      {invoice.status !== "Paid" && (
                        <button
                          onClick={() => setShowStripeModal(invoice)}
                          className="px-4 py-2 bg-gradient-to-r from-[#F9801D] to-orange-600 text-white rounded-xl hover:shadow-md font-bold text-xs transition"
                        >
                          Pay with Stripe
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400 text-xs text-center">
                Currently, no billing records have been cleared in database.
              </div>
            )}
          </div>
        </div>
      )}

      {/* HOMEWORK & SENSORY LIVE FEED PANEL */}
      {activeTab === "homework" && (() => {
        // Internal helper to tag play activities based on keyword attributes for parents
        const getLearningDomains = (title: string, desc: string) => {
          const t = (title + " " + desc).toLowerCase();
          const domains: { label: string; bg: string; border: string }[] = [];
          
          if (t.includes("clay") || t.includes("scissor") || t.includes("cut") || t.includes("glue") || t.includes("trace") || t.includes("draw") || t.includes("color") || t.includes("paint") || t.includes("motor") || t.includes("write") || t.includes("craft")) {
            domains.push({ label: "👐 Fine Motor Skills", bg: "bg-pink-50 text-pink-700", border: "border-pink-250/60" });
          }
          if (t.includes("count") || t.includes("math") || t.includes("number") || t.includes("shape") || t.includes("size") || t.includes("pattern") || t.includes("match") || t.includes("weight")) {
            domains.push({ label: "🧠 Cognitive Science", bg: "bg-amber-55 bg-amber-50 text-amber-700", border: "border-amber-250/60" });
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
            case "Nursery":
              return { bg: "bg-teal-50/30 border-teal-200/80", headerBg: "bg-teal-100 text-teal-800", focusBg: "bg-teal-500" };
            case "LKG":
              return { bg: "bg-violet-50/30 border-violet-200/80", headerBg: "bg-violet-100 text-violet-800", focusBg: "bg-violet-500" };
            case "UKG":
              return { bg: "bg-fuchsia-50/30 border-fuchsia-200/80", headerBg: "bg-fuchsia-100 text-fuchsia-800", focusBg: "bg-fuchsia-500" };
            default:
              return { bg: "bg-slate-50 border-slate-205", headerBg: "bg-slate-100 text-slate-800", focusBg: "bg-slate-500" };
          }
        };

        const activeClassBulletins = homework.filter((h) => h.course === student.course);

        return (
          <div className="space-y-6 animate-fadeIn" id="parent-homework-panel">
            {/* Colorful, modern parent workspace banner */}
            <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 p-6 rounded-[28px] text-white shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
                  Sensory Bulletin Feed
                </div>
                <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-yellow-300" /> Daily Activities & Homework Feed
                </h3>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-semibold max-w-2xl">
                  Strengthen your child's milestones with ease! Below displays play-curriculum objectives, fine motor games, and observations posted live by teachers for <strong className="text-yellow-300 font-extrabold underline decoration-wavy underline-offset-4">{student.name} ({student.course} class)</strong>.
                </p>
              </div>
            </div>

            {activeClassBulletins.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-slate-450 space-y-3 shadow-xs">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-extrabold text-slate-700">No active activity bulletins posted</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">Currently, no daily homework records exist in our database for class "{student.course}". Enjoy the free play day!</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeClassBulletins.map((hw) => {
                  const palette = getClassPalette(hw.course);
                  const domains = getLearningDomains(hw.title, hw.description);
                  const isCompleted = completedHwIds[hw.id] || false;
                  const currentEmoji = hwReactions[hw.id] || "";

                  return (
                    <div 
                      key={hw.id} 
                      className={`relative p-6 rounded-[28px] border transition-all duration-300 flex flex-col justify-between gap-5 bg-white shadow-3xs hover:shadow-xs ${
                        isCompleted ? "border-emerald-350 bg-emerald-50/15 ring-2 ring-emerald-500/10" : palette.bg
                      }`}
                    >
                      {/* Interactive finished ribbon */}
                      {isCompleted && (
                        <div className="absolute -top-3 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-[9px] px-3 py-1 rounded-full shadow-sm tracking-wide z-10 animate-bounce">
                          🎉 Practised Today!
                        </div>
                      )}

                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${palette.headerBg}`}>
                            {hw.course} Class
                          </span>
                          <span className="text-[10px] font-bold text-rose-500 font-mono">
                            Due Date: {hw.dueDate}
                          </span>
                        </div>

                        {/* Title list */}
                        <div className="space-y-1.5 text-left">
                          <h4 className="font-black text-slate-800 text-base tracking-tight leading-snug">
                            {hw.title}
                          </h4>
                          {/* Learning Domain Tags */}
                          <div className="flex flex-wrap gap-1.5">
                            {domains.map((dom, i) => (
                              <span 
                                key={i} 
                                className={`text-[9px] font-black tracking-wide px-2 py-0.5 rounded-md border ${dom.bg} ${dom.border}`}
                              >
                                {dom.label}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Description block */}
                        <div className="space-y-1.5 text-left">
                          <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">
                            Milestones & Objectives
                          </span>
                          <p className="bg-slate-100/50 p-4 rounded-2xl leading-relaxed text-slate-700 text-[11.5px] whitespace-pre-wrap font-medium">
                            {hw.description}
                          </p>
                        </div>

                        {/* Recommended Play block */}
                        {hw.activities && (
                          <div className="space-y-1.5 text-left pt-1">
                            <span className="text-[9.5px] font-black text-amber-650 uppercase tracking-widest block flex items-center gap-1">
                              <span>👐 Sensory Play Instruction</span>
                            </span>
                            <div className="bg-amber-100/30 p-4 rounded-2xl border border-amber-200/30 leading-relaxed text-slate-600 text-[11.5px] whitespace-pre-wrap font-semibold">
                              {hw.activities}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Interactive Action Row: React strips and finished switch */}
                      <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-3.5 sm:items-center justify-between">
                        
                        {/* Parent reaction strip buttons */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">React:</span>
                          <div className="flex gap-1 bg-slate-50 border border-slate-100 p-1 rounded-xl">
                            {["❤️", "👍", "🧠", "👏", "⭐"].map((emoji) => {
                              const reactionActive = currentEmoji === emoji;
                              return (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => setHwReaction(hw.id, emoji)}
                                  className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center text-xs hover:scale-115 active:scale-95 transition-all cursor-pointer ${
                                    reactionActive ? "bg-white shadow-3xs border border-violet-100 text-base" : "opacity-60 hover:opacity-100"
                                  }`}
                                  title={`React with ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Interactive Done checkbox button */}
                        <button
                          type="button"
                          onClick={() => toggleHwCompleted(hw.id)}
                          className={`px-4 py-2.5 rounded-xl font-black text-xs transition duration-200 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto border shadow-3xs active:scale-98 ${
                            isCompleted 
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-transparent shadow-[0_5px_15px_rgba(16,185,129,0.25)]" 
                              : "bg-white border-slate-205 text-slate-650 hover:bg-slate-50"
                          }`}
                        >
                          <CheckCircle className={`w-4 h-4 ${isCompleted ? "stroke-[3px]" : ""}`} />
                          <span>{isCompleted ? "Completed! ❤️" : "Done with Kid!"}</span>
                        </button>

                      </div>

                      {/* Authors metadata footer row */}
                      <div className="border-t border-slate-100/50 pt-3.5 flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <span>Posted Date: {hw.date}</span>
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

      {/* STRIPE PAYMENT MODAL SIMULATOR */}
      {showStripeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-gray-800">
            <div className="p-6 bg-gradient-to-b from-[#4E54C8] to-[#8F94FB] text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest block">Stripe Gateway Sandbox</span>
                <h4 className="text-lg font-black mt-0.5">Secure Checkout Trigger</h4>
              </div>
              <button
                onClick={() => setShowStripeModal(null)}
                className="text-white/80 hover:text-white hover:scale-105 font-bold transition text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-gray-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Child Stream:</span>
                  <span className="font-extrabold text-gray-700">{student.name} ({student.course})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Invoice Ref:</span>
                  <span className="font-mono font-bold text-indigo-600">#{showStripeModal.id}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200/80 mt-1">
                  <span className="text-gray-800 font-extrabold">Amount Due:</span>
                  <span className="font-black text-indigo-950 text-base">₹{showStripeModal.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Security info */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-gray-700 block">Test Mode Details (Simulated Gateway)</span>
                <div className="space-y-2 text-xs">
                  <label className="text-gray-400 font-medium">Test Credit Card Number</label>
                  <input
                    type="text"
                    disabled
                    value="4242 •••• •••• 4242"
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 font-mono text-gray-600 block"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-gray-400 font-medium">Expiry</label>
                    <input
                      type="text"
                      disabled
                      value="12 / 2028"
                      className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 font-mono text-gray-600 block"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-400 font-medium">CVV Sandbox</label>
                    <input
                      type="text"
                      disabled
                      value="422"
                      className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 font-mono text-gray-600 block"
                    />
                  </div>
                </div>
              </div>

              {/* Trigger */}
              <button
                onClick={handleStripePayment}
                disabled={stripeProcessing}
                className="w-full py-4 rounded-2xl bg-[#F9801D] text-white hover:bg-orange-600 text-sm font-extrabold shadow-lg transition flex items-center justify-center gap-2 text-center"
              >
                {stripeProcessing ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authorized Pipeline Security...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Process Payment with Sandbox Stripe
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW INVOICE DISPLAY */}
      {viewingInvoicepdf && createPortal(
        <div className="print-portal-wrapper fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto print:p-0 print:bg-white print:absolute print:inset-0">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:w-full print:rounded-none" id="printable-parent-invoice-modal">
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
                <span className="font-extrabold text-xs text-indigo-900 block flex items-center gap-1.5 uppercase tracking-wide">
                  <Receipt className="w-4 h-4 text-indigo-600" /> Fee Receipt
                </span>
                <p className="text-[10px] text-indigo-600/80 font-bold">
                  💡 Active tab check: If the print window does not open, please click the "Open App" button in the top-right!
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-extrabold hover:bg-indigo-700 shadow-sm transition cursor-pointer flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  onClick={() => setViewingInvoicepdf(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-extrabold hover:bg-gray-300 transition cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>

            {/* FEE INVOICE BODY PRINTABLE */}
            <div id="parent-billing-receipt-print-area" className="p-8 space-y-6 text-[#2D3436] font-sans">
              <div className="flex justify-between items-start border-b-2 border-dashed border-gray-200 pb-6">
                <div className="flex items-center gap-4">
                  <HorizonLogo size="md" />
                  <div className="h-16 w-px bg-slate-300 self-center" />
                  <img 
                    src="/arivu_logo.png" 
                    alt="Arivu Logo" 
                    className="h-[64px] object-contain select-none"
                  />
                </div>
                <div className="text-right text-xs">
                  <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide">OFFICIAL RECEIPT</h4>
                  <p className="font-mono text-gray-500 text-[10px] font-bold mt-0.5">Bill ref: #{viewingInvoicepdf.id}</p>
                  <p className="font-semibold text-gray-500 text-[9.5px]">Date: {viewingInvoicepdf.paidDate || viewingInvoicepdf.dueDate}</p>
                </div>
              </div>

              {/* School & Parent Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 font-bold block mb-1">ISSUED BY:</span>
                  <p className="font-extrabold text-gray-800">Horizon International Tech Play School</p>
                  <p className="text-gray-500 text-[10px] leading-relaxed max-w-xs">
                    No 46, 1st Cross, Shri Veeranjaneya Temple Road, near SLR Packagings, Thirumalapura, Bengaluru, Karnataka 560073
                  </p>
                  <p className="text-gray-500 text-[10px] mt-1">E-mail: horizoninternational04@gmail.com</p>
                  <p className="text-gray-500 text-[10px]">Phone: +91 7353101553</p>
                </div>

                <div>
                  <span className="text-gray-400 font-bold block mb-1">BILL TO (STUDENT):</span>
                  <p className="font-extrabold text-[#3D4498]">{student.name}</p>
                  <p className="text-gray-600 text-[10px]"><span className="font-bold">Course / Stream:</span> {student.course}</p>
                  <p className="text-gray-600 text-[10px]"><span className="font-bold">Roll / Ledger Ref:</span> {student.rollNo}</p>
                  <p className="text-gray-600 text-[10px]"><span className="font-bold">Guardian:</span> {student.fatherName}</p>
                  <p className="text-gray-600 text-[10px]"><span className="font-bold">Phone:</span> {student.contactPhone}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden mt-6 text-xs shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-[#6162CA]/10">
                    <tr>
                      <th className="p-3 font-extrabold">Fee particulars / Description</th>
                      <th className="p-3 font-extrabold text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingInvoicepdf.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-gray-100">
                        <td className="p-3 text-gray-700 font-medium">{item.description}</td>
                        <td className="p-3 text-gray-800 font-extrabold text-right">₹{item.amount.toLocaleString("en-IN")}.00</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50/50 border-t border-gray-200">
                      <td className="p-3 text-gray-800 font-bold text-right col-span-1">Subtotal amount:</td>
                      <td className="p-3 text-indigo-950 font-black text-right text-base">₹{viewingInvoicepdf.totalAmount.toLocaleString("en-IN")}.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment stamps */}
              <div className="flex justify-between items-center pt-6 border-t border-dashed border-gray-200 text-xs">
                <div>
                  <span className="text-gray-400 font-bold block mb-1">PAYMENT AUDIT STATUS:</span>
                  {viewingInvoicepdf.status === "Paid" ? (
                    <div className="flex items-center gap-1.5 text-green-700 font-extrabold uppercase bg-green-50 px-3 py-1 rounded-xl border border-green-200">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Paid via Stripe Sandbox
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-700 font-extrabold uppercase bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Pending Online Clearance
                    </div>
                  )}
                  {viewingInvoicepdf.stripePaymentIntentId && (
                    <span className="text-[9px] text-gray-400 font-mono mt-1.5 block">
                      ID: {viewingInvoicepdf.stripePaymentIntentId}
                    </span>
                  )}
                </div>

                <div className="text-center">
                  <div className="w-24 h-12 bg-gray-50 rounded-xl border border-gray-200/50 flex items-center justify-center font-mono opacity-80 text-gray-400 text-[10px] mb-1">
                    [Principal Stamp]
                  </div>
                  <span className="text-[10px] text-gray-400 block font-medium">Horizon Auth Stamp</span>
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
