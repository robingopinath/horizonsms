/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Student, StaffMember, Invoice, AttendanceRecord } from "../types";
import { TrendingUp, Coins, Activity, Users, MapPin, Phone, Mail, Award, Landmark, Plus, BookOpen, GraduationCap } from "lucide-react";
import HorizonLogo from "./HorizonLogo";

interface ManagementDashboardProps {
  students: Student[];
  staff: StaffMember[];
  billing: Invoice[];
  attendance: AttendanceRecord[];
}

export default function ManagementDashboard({
  students,
  staff,
  billing,
  attendance
}: ManagementDashboardProps) {
  // 1. MACRO METRICS MATHS
  const totalStudents = students.filter(s => s.status === "Active").length;
  const totalStaff = staff.length;
  
  // Calculate average student daily attendance (for dates logged)
  const studentLogs = attendance.filter(a => a.targetType === "student");
  const presentLogsCount = studentLogs.filter(a => a.status === "Present" || a.status === "Late").length;
  const avgAttendance = studentLogs.length > 0 ? Math.round((presentLogsCount / studentLogs.length) * 100) : 92;

  // Calculate fees collected
  const paidInvoices = billing.filter(b => b.status === "Paid");
  const unPaidInvoices = billing.filter(b => b.status === "Unpaid" || b.status === "Pending");
  const aggregateFeesCollected = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const outstandingFeesAggregate = unPaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  // Revenue by Class stream (For bespoke dashboard charts)
  const courseCapitals = {
    "Day-Care": 0,
    "Pre-Nursery": 0,
    "Nursery": 0,
    "LKG": 0,
    "UKG": 0
  };
  paidInvoices.forEach(inv => {
    if (courseCapitals[inv.course] !== undefined) {
      courseCapitals[inv.course] += inv.totalAmount;
    }
  });

  // Calculate highest revenue class
  const classStreams = Object.keys(courseCapitals) as Array<keyof typeof courseCapitals>;
  const classValDistribution = classStreams.map(c => courseCapitals[c]);
  const maximumClassCap = Math.max(...classValDistribution, 1);

  return (
    <div className="space-y-6" id="management-dashboard-root">
      {/* Play-School Contact & Location Card */}
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-6 rounded-3xl text-white shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-extrabold px-3 py-1 rounded-full uppercase tracking-widest text-center self-start">
              Corporate Headquarters Directory
            </span>
            <h3 className="text-2xl font-black tracking-tight" style={{ fontFamily: '"Outfit", sans-serif' }}>
              Horizon International Tech Play School
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl flex items-start gap-1">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              No 46, 1st Cross, Shri Veeranjaneya Temple Road, near SLR Packagings, Thirumalapura, Bengaluru, Karnataka 560073
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-semibold">
            <div className="bg-slate-800/80 p-3 h-fit rounded-2xl flex items-center gap-2 border border-slate-700">
              <Phone className="w-4 h-4 text-orange-400" />
              <div>
                <span className="text-[9px] text-slate-400 block">PHONE CONTACT</span>
                <span className="text-slate-200">+91 7353101553</span>
              </div>
            </div>

            <div className="bg-slate-800/80 p-3 h-fit rounded-2xl flex items-center gap-2 border border-slate-700">
              <Mail className="w-4 h-4 text-[#8F94FB]" />
              <div>
                <span className="text-[9px] text-slate-400 block">E-MAIL ENDPOINT</span>
                <span className="text-slate-200 underline">horizoninternational04@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Large Colorful Bento Macro Stats */}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.08 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] p-6 rounded-3xl text-white shadow-md space-y-4 relative overflow-hidden cursor-pointer"
        >
          <div className="relative z-10">
            <div className="bg-white/20 w-10 h-10 rounded-2xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 block">Active Student Enrolled</span>
              <span className="text-3xl font-black mt-1 block">{totalStudents}</span>
            </div>
            <p className="text-[10.5px] text-white/75 mt-2">Day-Care up to UKG courses active</p>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] text-white/10 transform rotate-12 select-none">
            <Users className="w-24 h-24" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="bg-gradient-to-br from-[#4E54C8] to-[#8F94FB] p-6 rounded-3xl text-white shadow-md space-y-4 relative overflow-hidden cursor-pointer"
        >
          <div className="relative z-10">
            <div className="bg-white/20 w-10 h-10 rounded-2xl flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 block">Average Day Attendance</span>
              <span className="text-3xl font-black mt-1 block">{avgAttendance}%</span>
            </div>
            <p className="text-[10.5px] text-white/75 mt-2">Overall classroom active ratio</p>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] text-white/10 transform rotate-12 select-none">
            <Activity className="w-24 h-24" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="bg-gradient-to-br from-[#11998e] to-[#38ef7d] p-6 rounded-3xl text-white shadow-md space-y-4 relative overflow-hidden cursor-pointer"
        >
          <div className="relative z-10">
            <div className="bg-white/20 w-10 h-10 rounded-2xl flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 block">Aggregate Paid Fees</span>
              <span className="text-3xl font-black mt-1 block">₹{aggregateFeesCollected.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-[10.5px] text-white/75 mt-2">Secured Stripe & cash invoices clearance</p>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] text-white/10 transform rotate-12 select-none">
            <Coins className="w-24 h-24" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="bg-gradient-to-br from-[#F2994A] to-[#F2C94C] p-6 rounded-3xl text-white shadow-md space-y-4 relative overflow-hidden cursor-pointer"
        >
          <div className="relative z-10">
            <div className="bg-white/20 w-10 h-10 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="mt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 block">Outstanding Arrears</span>
              <span className="text-3xl font-black mt-1 block">₹{outstandingFeesAggregate.toLocaleString("en-IN")}</span>
            </div>
            <p className="text-[10.5px] text-white/75 mt-2">Awaiting parent transaction submissions</p>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] text-white/10 transform rotate-12 select-none">
            <TrendingUp className="w-24 h-24" />
          </div>
        </motion.div>
      </motion.main>

      {/* Analytical visualizations */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Custom Visual SVG Chart representing Tuition Revenue by Course */}
        <motion.div 
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md space-y-4"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3D4498]">Tuition Revenue Ledger</span>
            <h4 className="text-lg font-black text-gray-800">Clearances by Classroom Level</h4>
          </div>

          <div className="space-y-4 pt-4">
            {classStreams.map((stream, idx) => {
              const val = courseCapitals[stream];
              const ratio = Math.max(Math.round((val / maximumClassCap) * 100), 2);
              const colorCodes = {
                "Day-Care": "bg-pink-500",
                "Pre-Nursery": "bg-purple-500",
                "Nursery": "bg-blue-500",
                "LKG": "bg-green-500",
                "UKG": "bg-[#F9801D]"
              };
              return (
                <div key={stream} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-gray-600 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${colorCodes[stream]}`} />
                      {stream}
                    </span>
                    <span className="font-mono font-bold text-gray-800">₹{val.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="h-6 w-full bg-gray-100 rounded-full overflow-hidden flex items-center justify-start">
                    <motion.div
                      className={`h-full ${colorCodes[stream]} text-white text-[9px] font-black flex items-center justify-end pr-2.5`}
                      initial={{ width: 0 }}
                      animate={{ width: `${ratio}%` }}
                      transition={{ duration: 1.0, ease: "easeOut", delay: idx * 0.1 }}
                    >
                      {ratio > 15 && `${ratio}%`}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Financial collection Distribution statement */}
        <motion.div 
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md space-y-4 flex flex-col justify-between"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Receivables Distribution</span>
            <h4 className="text-lg font-black text-gray-800">School Consolidated Statement</h4>
          </div>

          <div className="py-4 space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100/65 flex justify-between items-center text-xs">
              <span className="text-emerald-800 font-semibold">Processed Revenue (INR):</span>
              <span className="font-mono text-emerald-700 font-black text-sm">₹{aggregateFeesCollected.toLocaleString("en-IN")}</span>
            </div>
            
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100/65 flex justify-between items-center text-xs">
              <span className="text-amber-800 font-semibold">Uncollected Outstanding:</span>
              <span className="font-mono text-amber-700 font-black text-sm">₹{outstandingFeesAggregate.toLocaleString("en-IN")}</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100/65 flex justify-between items-center text-xs">
              <span className="text-indigo-800 font-bold">Total Envisioned Volume:</span>
              <span className="font-mono text-indigo-700 font-black text-sm">₹{(aggregateFeesCollected + outstandingFeesAggregate).toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Location coordinates summary info */}
          <div className="p-4 bg-gray-50 rounded-2xl text-[11px] text-gray-500 leading-normal border border-gray-100 font-medium">
            <span className="font-extrabold text-indigo-950 block mb-0.5">Macro school governance metrics</span>
            The Horizon Tech Play School corporate administrative board uses these charts to confirm budget balances, staff payouts, and quarterly activities indices accurately.
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
