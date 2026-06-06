/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
enum CourseType {
  DAY_CARE = "Day-Care",
  PRE_NURSERY = "Pre-Nursery",
  NURSERY = "Nursery",
  LKG = "LKG",
  UKG = "UKG"
}

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI server-side with key
const apiKey = process.env.GEMINI_API_KEY;
let ai: any = null;

if (!apiKey) {
  console.warn("\n⚠️  [ENVIRONMENT WARNING]: GEMINI_API_KEY environment variable is missing.");
  console.warn("👉  Please define GEMINI_API_KEY in your deployment environment or .env file to enable generative AI features.");
  console.warn("🔄  Falling back gracefully to local high-fidelity simulated AI assistant.\n");
} else if (apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
  console.warn("\n⚠️  [ENVIRONMENT WARNING]: GEMINI_API_KEY is defined with a dynamic placeholder value.");
  console.warn("👉  Please configure a valid Gemini API key to connect to live models.");
  console.warn("🔄  Falling back gracefully to local high-fidelity simulated AI assistant.\n");
} else {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("🟢 [SUCCESS]: Gemini AI Client initialized successfully for backend queries.");
  } catch (err) {
    console.error("❌ [ERROR]: Failed to initialize GoogleGenAI client:", err);
    console.warn("🔄  Falling back gracefully to local high-fidelity simulated AI assistant.");
  }
}

app.use(express.json());

// Intercept wildcard or relative calls to logos from nested routes to guarantee server delivery
app.get("*", (req, res, next) => {
  const lowerPath = req.path.toLowerCase();
  if (
    lowerPath.endsWith("arivu_logo.png") ||
    lowerPath.endsWith("horizon_logo.png") ||
    lowerPath.endsWith("nextgen_logo.png") ||
    lowerPath.endsWith("arivu_logo.svg")
  ) {
    const fileName = req.path.split("/").pop();
    if (fileName) {
      let targetName = fileName;
      const lowerFile = fileName.toLowerCase();
      if (lowerFile === "horizon_logo.png") {
        targetName = "horizon_logo.png";
      } else if (lowerFile === "arivu_logo.png") {
        targetName = "arivu_logo.png";
      } else if (lowerFile === "nextgen_logo.png") {
        targetName = "nextgen_logo.png";
      } else if (lowerFile === "arivu_logo.svg") {
        targetName = "arivu_logo.svg";
      }
      
      const filePath = path.join(process.cwd(), "public", targetName);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
      const rootPath = path.join(process.cwd(), targetName);
      if (fs.existsSync(rootPath)) {
        return res.sendFile(rootPath);
      }
    }
  }
  next();
});

app.use(express.static(path.join(process.cwd(), "public")));
app.use("/public", express.static(path.join(process.cwd(), "public")));

// Persistent database file
const dbPath = path.join(process.cwd(), "db.json");

// Helper with robust initial play-school mock data (Indian context)
const initialDbData = {
  students: [
    {
      id: "std_1",
      name: "Aarav Malhotra",
      course: "Day-Care",
      rollNo: "DC-2026-001",
      age: 2,
      gender: "Male",
      fatherName: "Rajesh Malhotra",
      motherName: "Priyanka Malhotra",
      contactPhone: "+91 9845012345",
      email: "rajesh.malhotra@gmail.com",
      address: "Flat 202, Sunshine Apartments, Thirumalapura, Bengaluru",
      status: "Active",
      enrollmentDate: "2026-01-10",
      avatarSeed: "std1"
    },
    {
      id: "std_2",
      name: "Mira Patel",
      course: "Day-Care",
      rollNo: "DC-2026-002",
      age: 3,
      gender: "Female",
      fatherName: "Siddharth Patel",
      motherName: "Megha Patel",
      contactPhone: "+91 9900112233",
      email: "sid.patel@yahoo.com",
      address: "No 18, 3rd Main, Malleshwaram, Bengaluru",
      status: "Active",
      enrollmentDate: "2026-02-15",
      avatarSeed: "std2"
    },
    {
      id: "std_3",
      name: "Aanya Sharma",
      course: "Pre-Nursery",
      rollNo: "PN-2026-010",
      age: 3,
      gender: "Female",
      fatherName: "Amit Sharma",
      motherName: "Kiran Sharma",
      contactPhone: "+91 8884442211",
      email: "amit.sharma@outlook.com",
      address: "Nester Raga, Mahadevapura, Bengaluru",
      status: "Active",
      enrollmentDate: "2026-01-20",
      avatarSeed: "std3"
    },
    {
      id: "std_4",
      name: "Kabir Singh",
      course: "Pre-Nursery",
      rollNo: "PN-2026-011",
      age: 3,
      gender: "Male",
      fatherName: "Gurpreet Singh",
      motherName: "Jasmeet Kaur",
      contactPhone: "+91 7406112233",
      email: "singh.gurpreet@gmail.com",
      address: "Prestige Shantiniketan, Whitefield, Bengaluru",
      status: "Active",
      enrollmentDate: "2026-03-01",
      avatarSeed: "std4"
    },
    {
      id: "std_5",
      name: "Ishaan Iyer",
      course: "Nursery",
      rollNo: "NS-2026-020",
      age: 4,
      gender: "Male",
      fatherName: "Harihara Iyer",
      motherName: "Janaki Iyer",
      contactPhone: "+91 9123456789",
      email: "hari.iyer@live.com",
      address: "10th Main Road, Jayanagar, Bengaluru",
      status: "Active",
      enrollmentDate: "2025-11-15",
      avatarSeed: "std5"
    },
    {
      id: "std_6",
      name: "Reyansh Rao",
      course: "Nursery",
      rollNo: "NS-2026-021",
      age: 4,
      gender: "Male",
      fatherName: "Prashant Rao",
      motherName: "Divya Rao",
      contactPhone: "+91 9880022311",
      email: "prashrao@gmail.com",
      address: "SLV Layout, Thirumalapura, Bengaluru",
      status: "Active",
      enrollmentDate: "2025-12-05",
      avatarSeed: "std6"
    },
    {
      id: "std_7",
      name: "Diya Joshi",
      course: "Nursery",
      rollNo: "NS-2026-022",
      age: 4,
      gender: "Female",
      fatherName: "Sandeep Joshi",
      motherName: "Pooja Joshi",
      contactPhone: "+91 8095112244",
      email: "sandeep.joshi@gmail.com",
      address: "Greenwood Residency, Sarjapur Road, Bengaluru",
      status: "Active",
      enrollmentDate: "2026-01-05",
      avatarSeed: "std7"
    },
    {
      id: "std_8",
      name: "Rohan Sen",
      course: "LKG",
      rollNo: "LK-2026-031",
      age: 5,
      gender: "Male",
      fatherName: "Soumitra Sen",
      motherName: "Rimi Sen",
      contactPhone: "+91 9741005533",
      email: "soumitra.sen@gmail.com",
      address: "Sobha Amber, Thirumalapura Road, Bengaluru",
      status: "Active",
      enrollmentDate: "2025-05-12",
      avatarSeed: "std8"
    },
    {
      id: "std_9",
      name: "Avani Nair",
      course: "LKG",
      rollNo: "LK-2026-032",
      age: 4,
      gender: "Female",
      fatherName: "Girish Nair",
      motherName: "Anu Nair",
      contactPhone: "+91 8234567890",
      email: "girish.nair@hotmail.com",
      address: "RMV 2nd Stage, Sanjaynagar, Bengaluru",
      status: "Active",
      enrollmentDate: "2025-05-20",
      avatarSeed: "std9"
    },
    {
      id: "std_10",
      name: "Vihaan Desai",
      course: "LKG",
      rollNo: "LK-2026-033",
      age: 5,
      gender: "Male",
      fatherName: "Manoj Desai",
      motherName: "Sneha Desai",
      contactPhone: "+91 9844123456",
      email: "manoj.desai@gmail.com",
      address: "Chikkabanavara, Bengaluru North, Karnataka",
      status: "Active",
      enrollmentDate: "2025-06-01",
      avatarSeed: "std10"
    },
    {
      id: "std_11",
      name: "Prisha Reddy",
      course: "LKG",
      rollNo: "LK-2026-034",
      age: 5,
      gender: "Female",
      fatherName: "Venkat Reddy",
      motherName: "Madhavi Reddy",
      contactPhone: "+91 7353101889",
      email: "venkat.reddy@gmail.com",
      address: "No 12, Sri Veeranjaneya Temple Road, Thirumalapura, Bengaluru",
      status: "Active",
      enrollmentDate: "2025-05-15",
      avatarSeed: "std11"
    },
    {
      id: "std_12",
      name: "Aditya Bhat",
      course: "UKG",
      rollNo: "UK-2026-041",
      age: 5,
      gender: "Male",
      fatherName: "Narasimha Bhat",
      motherName: "Shilpa Bhat",
      contactPhone: "+91 9341122345",
      email: "bhat.narasimha@gmail.com",
      address: "Vidyaranyapura, Bengaluru, Karnataka",
      status: "Active",
      enrollmentDate: "2024-05-10",
      avatarSeed: "std12"
    },
    {
      id: "std_13",
      name: "Samantha Fernandes",
      course: "UKG",
      rollNo: "UK-2026-042",
      age: 6,
      gender: "Female",
      fatherName: "Keith Fernandes",
      motherName: "Maria Fernandes",
      contactPhone: "+91 7353101553",
      email: "keith.ferns@gmail.com",
      address: "Kothanur, Hennur Road, Bengaluru",
      status: "Active",
      enrollmentDate: "2024-05-12",
      avatarSeed: "std13"
    },
    {
      id: "std_14",
      name: "Sai Krishna",
      course: "UKG",
      rollNo: "UK-2026-043",
      age: 5,
      gender: "Male",
      fatherName: "Gopal Krishna",
      motherName: "Vasundhara",
      contactPhone: "+91 9448001122",
      email: "gopal.k@gmail.com",
      address: "Vrindavan Gardens, Thirumalapura Road, Bengaluru",
      status: "Active",
      enrollmentDate: "2024-05-18",
      avatarSeed: "std14"
    },
    {
      id: "std_15",
      name: "Kiara Hegde",
      course: "UKG",
      rollNo: "UK-2026-044",
      age: 6,
      gender: "Female",
      fatherName: "Mohan Hegde",
      motherName: "Rupa Hegde",
      contactPhone: "+91 7022011022",
      email: "mohanhegde@gmail.com",
      address: "Salarpuria Greenage, Bommanahalli, Bengaluru",
      status: "Active",
      enrollmentDate: "2024-06-02",
      avatarSeed: "std15"
    }
  ],
  staff: [
    {
      id: "stf_1",
      name: "Vidyasagar",
      role: "Admin",
      specialization: "Managing Director & Curriculum Head",
      email: "vidyasagarpcg@gmail.com",
      phone: "+917353101553",
      salary: 50000,
      joiningDate: "2026-06-05",
      status: "Active"
    },
    {
      id: "stf_2",
      name: "Mrs. Preeti Sharma",
      role: "Staff",
      specialization: "Day-Care & Pre-Nursery Head",
      email: "preeti@gmail.com",
      phone: "+91 7353001122",
      salary: 32000,
      joiningDate: "2022-06-15",
      status: "Active"
    },
    {
      id: "stf_3",
      name: "Miss Sandra Fernandez",
      role: "Staff",
      specialization: "Nursery & LKG Educator",
      email: "sandra@gmail.com",
      phone: "+91 9845012211",
      salary: 34000,
      joiningDate: "2021-08-01",
      status: "Active"
    },
    {
      id: "stf_4",
      name: "Miss Shalini Gowda",
      role: "Staff",
      specialization: "UKG Class Teacher",
      email: "shalini@gmail.com",
      phone: "+91 9008811223",
      salary: 35000,
      joiningDate: "2023-01-10",
      status: "Active"
    },
    {
      id: "stf_5",
      name: "Mr. Ramesh Kumar",
      role: "Accountant",
      specialization: "Senior billing & Payroll Lead",
      email: "ramesh@gmail.com",
      phone: "+91 7353101224",
      salary: 40000,
      joiningDate: "2021-02-15",
      status: "Active"
    },
    {
      id: "stf_6",
      name: "Mr. Suresh Hegde",
      role: "Management",
      specialization: "Board Trustee / School Owner",
      email: "suresh@gmail.com",
      phone: "+91 9900223344",
      salary: 110000,
      joiningDate: "2019-01-01",
      status: "Active"
    }
  ],
  attendance: [
    // Today's Date or mock attendance for last few days
    { id: "att_1", date: "2026-06-02", targetId: "std_1", targetType: "student", status: "Present", markedBy: "Mrs. Preeti Sharma", smsTriggered: true },
    { id: "att_2", date: "2026-06-02", targetId: "std_2", targetType: "student", status: "Present", markedBy: "Mrs. Preeti Sharma", smsTriggered: true },
    { id: "att_3", date: "2026-06-02", targetId: "std_3", targetType: "student", status: "Absent", markedBy: "Mrs. Preeti Sharma", smsTriggered: true },
    { id: "att_4", date: "2026-06-02", targetId: "std_4", targetType: "student", status: "Present", markedBy: "Mrs. Preeti Sharma", smsTriggered: true },
    { id: "att_5", date: "2026-06-02", targetId: "std_5", targetType: "student", status: "Present", markedBy: "Miss Sandra Fernandez", smsTriggered: true },
    { id: "att_6", date: "2026-06-02", targetId: "std_6", targetType: "student", status: "Present", markedBy: "Miss Sandra Fernandez", smsTriggered: true },
    { id: "att_7", date: "2026-06-02", targetId: "std_7", targetType: "student", status: "Late", markedBy: "Miss Sandra Fernandez", smsTriggered: true },
    { id: "att_8", date: "2026-06-02", targetId: "std_8", targetType: "student", status: "Present", markedBy: "Miss Sandra Fernandez", smsTriggered: true },
    { id: "att_9", date: "2026-06-02", targetId: "std_9", targetType: "student", status: "Present", markedBy: "Miss Sandra Fernandez", smsTriggered: true },
    { id: "att_10", date: "2026-06-02", targetId: "std_10", targetType: "student", status: "Absent", markedBy: "Miss Sandra Fernandez", smsTriggered: true },
    { id: "att_11", date: "2026-06-02", targetId: "std_11", targetType: "student", status: "Present", markedBy: "Miss Sandra Fernandez", smsTriggered: true },
    { id: "att_12", date: "2026-06-02", targetId: "std_12", targetType: "student", status: "Present", markedBy: "Miss Shalini Gowda", smsTriggered: true },
    { id: "att_13", date: "2026-06-02", targetId: "std_13", targetType: "student", status: "Present", markedBy: "Miss Shalini Gowda", smsTriggered: true },
    { id: "att_14", date: "2026-06-02", targetId: "std_14", targetType: "student", status: "Absent", markedBy: "Miss Shalini Gowda", smsTriggered: true },
    { id: "att_15", date: "2026-06-02", targetId: "std_15", targetType: "student", status: "Present", markedBy: "Miss Shalini Gowda", smsTriggered: true },
    // Teachers
    { id: "att_16", date: "2026-06-02", targetId: "stf_1", targetType: "staff", status: "Present", markedBy: "Auto-System", smsTriggered: false },
    { id: "att_17", date: "2026-06-02", targetId: "stf_2", targetType: "staff", status: "Present", markedBy: "Auto-System", smsTriggered: false },
    { id: "att_18", date: "2026-06-02", targetId: "stf_3", targetType: "staff", status: "Present", markedBy: "Auto-System", smsTriggered: false },
    { id: "att_19", date: "2026-06-02", targetId: "stf_4", targetType: "staff", status: "Present", markedBy: "Auto-System", smsTriggered: false }
  ],
  grades: [
    {
      id: "grd_1",
      studentId: "std_12",
      course: CourseType.UKG,
      academicTerm: "Term 1",
      subject: "Phonics & Alphabets",
      homeworkScore: 92,
      examScore: 88,
      weightedTotal: 89.2,
      letterGrade: "A",
      remarks: "Aditya has excellent grasp of phonics sounds. Speaks clearly.",
      markedBy: "Miss Shalini Gowda"
    },
    {
      id: "grd_2",
      studentId: "std_12",
      course: CourseType.UKG,
      academicTerm: "Term 1",
      subject: "EVS (Our Surroundings)",
      homeworkScore: 85,
      examScore: 90,
      weightedTotal: 88.5,
      letterGrade: "A",
      remarks: "Identifies trees and animals quickly. Energetic in class.",
      markedBy: "Miss Shalini Gowda"
    },
    {
      id: "grd_3",
      studentId: "std_13",
      course: CourseType.UKG,
      academicTerm: "Term 1",
      subject: "Phonics & Alphabets",
      homeworkScore: 98,
      examScore: 95,
      weightedTotal: 95.9,
      letterGrade: "A+",
      remarks: "Outstanding spelling ability and expressive reading.",
      markedBy: "Miss Shalini Gowda"
    },
    {
      id: "grd_4",
      studentId: "std_13",
      course: CourseType.UKG,
      academicTerm: "Term 1",
      subject: "Maths (Counting & Shapes)",
      homeworkScore: 95,
      examScore: 100,
      weightedTotal: 98.5,
      letterGrade: "A+",
      remarks: "Perfect scores in basic additions and shapes drawing.",
      markedBy: "Miss Shalini Gowda"
    },
    {
      id: "grd_5",
      studentId: "std_8",
      course: CourseType.LKG,
      academicTerm: "Term 1",
      subject: "Rhymes & Vocal",
      homeworkScore: 78,
      examScore: 82,
      weightedTotal: 80.8,
      letterGrade: "B",
      remarks: "Rohan knows the nursery rhymes but is sometimes shy to sing aloud.",
      markedBy: "Miss Sandra Fernandez"
    },
    {
      id: "grd_6",
      studentId: "std_11",
      course: CourseType.LKG,
      academicTerm: "Term 1",
      subject: "Motor Skills (Coloring)",
      homeworkScore: 88,
      examScore: 94,
      weightedTotal: 92.2,
      letterGrade: "A+",
      remarks: "Beautiful, neat coloring. Colors inside borders perfectly.",
      markedBy: "Miss Sandra Fernandez"
    }
  ],
  billing: [
    {
      id: "inv_1",
      studentId: "std_1",
      course: CourseType.DAY_CARE,
      term: "Quarterly Session (Jun-Aug)",
      dueDate: "2026-06-15",
      paidDate: "2026-06-01",
      items: [
        { description: "Day-Care Monthly Fees (June)", amount: 12000 },
        { description: "Nutritional Diet & Snacks Plan", amount: 3500 },
        { description: "Admission Kit & Soft Toys Fee", amount: 2000 }
      ],
      totalAmount: 17500,
      status: "Paid",
      stripePaymentIntentId: "ch_stripe_sim_9102"
    },
    {
      id: "inv_2",
      studentId: "std_12",
      course: CourseType.UKG,
      term: "First Term Fees 2026",
      dueDate: "2026-06-10",
      paidDate: undefined,
      items: [
        { description: "UKG Half-Yearly Tuition Charges", amount: 18000 },
        { description: "Smart Tech Interactive Lab", amount: 4000 },
        { description: "Play-Way Activity Material Kit", amount: 3000 }
      ],
      totalAmount: 25000,
      status: "Unpaid"
    },
    {
      id: "inv_3",
      studentId: "std_5",
      course: CourseType.NURSERY,
      term: "First Term Fees 2026",
      dueDate: "2026-06-10",
      paidDate: undefined,
      items: [
        { description: "Nursery Half-Yearly Tuition Charges", amount: 16000 },
        { description: "Aesthetic Crafts & Clay materials", amount: 3000 },
        { description: "Mid-day Fruit Snacks Program", amount: 2500 }
      ],
      totalAmount: 21500,
      status: "Unpaid"
    },
    {
      id: "inv_4",
      studentId: "std_3",
      course: CourseType.PRE_NURSERY,
      term: "First Term Fees 2026",
      dueDate: "2026-06-08",
      paidDate: "2026-05-28",
      items: [
        { description: "Pre-Nursery Term Fee", amount: 15000 },
        { description: "Activity Hub Subscription", amount: 2500 }
      ],
      totalAmount: 17500,
      status: "Paid",
      stripePaymentIntentId: "ch_stripe_sim_4401"
    }
  ],
  lessons: [
    {
      id: "les_1",
      course: CourseType.NURSERY,
      teacherId: "stf_3",
      teacherName: "Miss Sandra Fernandez",
      date: "2026-06-02",
      topic: "Introduction to Secondary Colours",
      objectives: "Teach children how mixing Red + Yellow makes Orange, and Blue + Yellow makes Green.",
      activities: "Hands-on water coloring with paper sheets. Handprint painting activity on the common board.",
      feedback: "All kids loved the color mixing. Reansh and Diya got orange quickly. Need extra paint sets next time."
    },
    {
      id: "les_2",
      course: CourseType.UKG,
      teacherId: "stf_4",
      teacherName: "Miss Shalini Gowda",
      date: "2026-06-02",
      topic: "Simple Double Letter Greetings",
      objectives: "Help child spell out conversational phrases like 'Good morning', 'Yes please', and 'Thank you'.",
      activities: "Roleplay in pairs of two. Interactive smartboard flashcard matching.",
      feedback: "Samantha played roleplay perfectly. Aditya is mixing thank you and please; will review in circle tomorrow."
    }
  ],
  homework: [
    {
      id: "hw_1",
      course: "Nursery",
      title: "Handprint Painting and Leaf Trace",
      description: "Gather 3 fallen leaves of different shapes. Dip them in water color or stamp pads and trace them onto page 12 of your Art Journal, showing leaf patterns.",
      activities: "Sensory leaf textures search, garden walking, rhyme circle singing 'Five Little Leaves'.",
      date: "2026-06-02",
      dueDate: "2026-06-04",
      postedBy: "Miss Sandra Fernandez"
    },
    {
      id: "hw_2",
      course: "UKG",
      title: "Double Letter Spelled Greetings",
      description: "Draw or find three cutouts representing double-letter words like FEED, SEED, GOOD. Practice writing each word 5 times in the draft notebook.",
      activities: "Interactive alphabet blocks game, reading circle, conversational greetings roleplay.",
      date: "2026-06-02",
      dueDate: "2026-06-03",
      postedBy: "Miss Shalini Gowda"
    }
  ],
  payroll: [
    {
      id: "pay_1",
      staffId: "stf_2",
      staffName: "Mrs. Preeti Sharma",
      role: "Staff",
      month: "May 2026",
      baseSalary: 32000,
      allowances: 3000,
      deductions: 500,
      netPayable: 34500,
      paidDate: "2026-05-31",
      status: "Paid"
    },
    {
      id: "pay_2",
      staffId: "stf_3",
      staffName: "Miss Sandra Fernandez",
      role: "Staff",
      month: "May 2026",
      baseSalary: 34000,
      allowances: 3000,
      deductions: 500,
      netPayable: 36500,
      paidDate: "2026-05-31",
      status: "Paid"
    },
    {
      id: "pay_3",
      staffId: "stf_4",
      staffName: "Miss Shalini Gowda",
      role: "Staff",
      month: "May 2026",
      baseSalary: 35000,
      allowances: 2500,
      deductions: 500,
      netPayable: 37000,
      paidDate: undefined,
      status: "Pending"
    }
  ],
  globalWeights: {
    homeworkWeight: 30,
    examWeight: 70
  }
};

// Seed or load DB
function readDb() {
  try {
    if (fs.existsSync(dbPath)) {
      const dbStr = fs.readFileSync(dbPath, "utf-8");
      const parsed = JSON.parse(dbStr);
      let changed = false;
      if (parsed && Array.isArray(parsed.students)) {
        parsed.students.forEach((s: any) => {
          if (!s.parentPassword) {
            s.parentPassword = "parent123";
            changed = true;
          }
        });
        if (changed) {
          writeDb(parsed);
        }
      }
      return parsed;
    }
  } catch (err) {
    console.error("Error reading database file, using fallback:", err);
  }
  // Initialize file
  const initialData = { ...initialDbData };
  initialData.students = initialData.students.map((s: any) => ({
    ...s,
    parentPassword: s.parentPassword || "parent123"
  }));
  writeDb(initialData);
  return initialData;
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// Ensure database sits populated
let database = readDb();

// -------------------------------------------------------------
// REST API Routes
// -------------------------------------------------------------

// Global Data Dump
app.get("/api/data", (req, res) => {
  res.json(database);
});

// Student Endpoints
app.post("/api/students", (req, res) => {
  const newStudent = { ...req.body, id: "std_" + Date.now() };
  database.students.push(newStudent);
  writeDb(database);
  res.status(201).json(newStudent);
});

app.put("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const idx = database.students.findIndex((s: any) => s.id === id);
  if (idx !== -1) {
    database.students[idx] = { ...database.students[idx], ...req.body };
    writeDb(database);
    res.json(database.students[idx]);
  } else {
    res.status(404).json({ error: "Student not found" });
  }
});

app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params;
  database.students = database.students.filter((s: any) => s.id !== id);
  writeDb(database);
  res.json({ success: true });
});

// Staff Endpoints
app.post("/api/staff", (req, res) => {
  const newStaff = { ...req.body, id: "stf_" + Date.now() };
  database.staff.push(newStaff);
  writeDb(database);
  res.status(201).json(newStaff);
});

app.put("/api/staff/:id", (req, res) => {
  const { id } = req.params;
  const idx = database.staff.findIndex((s: any) => s.id === id);
  if (idx !== -1) {
    database.staff[idx] = { ...database.staff[idx], ...req.body };
    writeDb(database);
    res.json(database.staff[idx]);
  } else {
    res.status(404).json({ error: "Member not found" });
  }
});

app.delete("/api/staff/:id", (req, res) => {
  const { id } = req.params;
  database.staff = database.staff.filter((s: any) => s.id !== id);
  writeDb(database);
  res.json({ success: true });
});

// Attendance Toggles (Student / Teacher)
app.post("/api/attendance", (req, res) => {
  const { targetId, targetType, date, status, markedBy } = req.body;
  
  // Find if log exists for target + date
  const idx = database.attendance.findIndex(
    (a: any) => a.targetId === targetId && a.date === date && a.targetType === targetType
  );

  let updatedRecord;
  if (idx !== -1) {
    database.attendance[idx].status = status;
    database.attendance[idx].markedBy = markedBy;
    database.attendance[idx].smsTriggered = true; // Always send simulated alert
    updatedRecord = database.attendance[idx];
  } else {
    updatedRecord = {
      id: "att_" + Date.now(),
      targetId,
      targetType,
      date,
      status,
      markedBy,
      smsTriggered: true
    };
    database.attendance.push(updatedRecord);
  }
  
  writeDb(database);
  res.json({
    success: true,
    record: updatedRecord,
    // Add realistic SMS response details
    smsMessage: `SIMULATED ALERT: Hello Parent, your ward was marked ${status} on ${date}. Regards, Horizon Tech Play School.`
  });
});

// Grades & Academic Tiers
app.post("/api/grades", (req, res) => {
  const { homeworkWeight, examWeight } = database.globalWeights || { homeworkWeight: 30, examWeight: 70 };
  const { studentId, course, academicTerm, subject, homeworkScore, examScore, remarks, markedBy } = req.body;
  
  const hw = parseFloat(homeworkScore) || 0;
  const ex = parseFloat(examScore) || 0;
  const weightedTotal = ((hw * homeworkWeight) + (ex * examWeight)) / 100;
  
  // Grade calculation
  let letterGrade = "F";
  if (weightedTotal >= 95) letterGrade = "A+";
  else if (weightedTotal >= 85) letterGrade = "A";
  else if (weightedTotal >= 75) letterGrade = "B";
  else if (weightedTotal >= 60) letterGrade = "C";
  
  const newGrade = {
    id: "grd_" + Date.now(),
    studentId,
    course,
    academicTerm,
    subject,
    homeworkScore: hw,
    examScore: ex,
    weightedTotal: Math.round(weightedTotal * 10) / 10,
    letterGrade,
    remarks,
    markedBy
  };
  
  database.grades.push(newGrade);
  writeDb(database);
  res.status(201).json(newGrade);
});

app.put("/api/grades/:id", (req, res) => {
  const { id } = req.params;
  const { homeworkWeight, examWeight } = database.globalWeights || { homeworkWeight: 30, examWeight: 70 };
  const idx = database.grades.findIndex((g: any) => g.id === id);
  if (idx !== -1) {
    const updated = { ...database.grades[idx], ...req.body };
    const hw = parseFloat(updated.homeworkScore) || 0;
    const ex = parseFloat(updated.examScore) || 0;
    const weightedTotal = ((hw * homeworkWeight) + (ex * examWeight)) / 100;
    
    let letterGrade = "F";
    if (weightedTotal >= 95) letterGrade = "A+";
    else if (weightedTotal >= 85) letterGrade = "A";
    else if (weightedTotal >= 75) letterGrade = "B";
    else if (weightedTotal >= 60) letterGrade = "C";

    updated.weightedTotal = Math.round(weightedTotal * 10) / 10;
    updated.letterGrade = letterGrade;

    database.grades[idx] = updated;
    writeDb(database);
    res.json(updated);
  } else {
    res.status(404).json({ error: "Grade entry not found" });
  }
});

// Billing / Invoicing
app.post("/api/billing", (req, res) => {
  const { studentId, course, term, dueDate, items, status } = req.body;
  const totalAmount = items.reduce((acc: number, item: any) => acc + (parseFloat(item.amount) || 0), 0);
  
  const newInvoice = {
    id: "inv_" + Date.now(),
    studentId,
    course,
    term,
    dueDate,
    items,
    totalAmount,
    status: status || "Unpaid"
  };
  
  database.billing.push(newInvoice);
  writeDb(database);
  res.status(201).json(newInvoice);
});

// Pay invoice with integrated simulated Stripe processing trigger
app.post("/api/billing/:id/pay", (req, res) => {
  const { id } = req.params;
  const { paymentMethod, paymentRef } = req.body || {};
  const idx = database.billing.findIndex((b: any) => b.id === id);
  if (idx !== -1) {
    database.billing[idx].status = "Paid";
    database.billing[idx].paidDate = new Date().toISOString().split("T")[0];
    database.billing[idx].stripePaymentIntentId = paymentRef || (paymentMethod ? `Paid via ${paymentMethod}` : "ch_stripe_user_paid_" + Math.floor(Math.random() * 100000));
    writeDb(database);
    res.json({
      success: true,
      message: "Payment logs processed securely via system billing engine.",
      invoice: database.billing[idx]
    });
  } else {
    res.status(404).json({ error: "Invoice not found" });
  }
});

app.delete("/api/billing/:id", (req, res) => {
  const { id } = req.params;
  database.billing = database.billing.filter((b: any) => b.id !== id);
  writeDb(database);
  res.json({ success: true });
});

// Lesson Plans
app.post("/api/lessons", (req, res) => {
  const newLesson = { ...req.body, id: "les_" + Date.now() };
  database.lessons.push(newLesson);
  writeDb(database);
  res.status(201).json(newLesson);
});

app.put("/api/lessons/:id", (req, res) => {
  const { id } = req.params;
  const idx = database.lessons.findIndex((l: any) => l.id === id);
  if (idx !== -1) {
    database.lessons[idx] = { ...database.lessons[idx], ...req.body };
    writeDb(database);
    res.json(database.lessons[idx]);
  } else {
    res.status(404).json({ error: "Lesson plan not found" });
  }
});

// Payroll Endpoints
app.post("/api/payroll", (req, res) => {
  const { staffId, staffName, role, month, baseSalary, allowances, deductions, status, paidDate } = req.body;
  const netPayable = (parseFloat(baseSalary) || 0) + (parseFloat(allowances) || 0) - (parseFloat(deductions) || 0);
  const newPayroll = {
    id: "pay_" + Date.now(),
    staffId,
    staffName,
    role,
    month,
    baseSalary: parseFloat(baseSalary) || 0,
    allowances: parseFloat(allowances) || 0,
    deductions: parseFloat(deductions) || 0,
    netPayable,
    status: status || "Pending",
    paidDate: paidDate || undefined
  };
  database.payroll.push(newPayroll);
  writeDb(database);
  res.status(201).json(newPayroll);
});

app.put("/api/payroll/:id", (req, res) => {
  const { id } = req.params;
  const idx = database.payroll.findIndex((p: any) => p.id === id);
  if (idx !== -1) {
    const updated = { ...database.payroll[idx], ...req.body };
    updated.netPayable = (parseFloat(updated.baseSalary) || 0) + (parseFloat(updated.allowances) || 0) - (parseFloat(updated.deductions) || 0);
    database.payroll[idx] = updated;
    writeDb(database);
    res.json(updated);
  } else {
    res.status(404).json({ error: "Payroll entry not found" });
  }
});

app.delete("/api/payroll/:id", (req, res) => {
  const { id } = req.params;
  const idx = database.payroll.findIndex((p: any) => p.id === id);
  if (idx !== -1) {
    const deleted = database.payroll.splice(idx, 1)[0];
    writeDb(database);
    res.json({ success: true, deleted });
  } else {
    res.status(404).json({ error: "Payroll entry not found" });
  }
});

// Global Setup Update
app.post("/api/settings", (req, res) => {
  const { homeworkWeight, examWeight } = req.body;
  database.globalWeights = {
    homeworkWeight: parseFloat(homeworkWeight) || 30,
    examWeight: parseFloat(examWeight) || 70
  };
  writeDb(database);
  res.json({ success: true, weights: database.globalWeights });
});

// Homework & Activities Endpoints
app.post("/api/homework", (req, res) => {
  const { course, title, description, activities, date, dueDate, postedBy } = req.body;
  if (!database.homework) {
    database.homework = [];
  }
  const newHw = {
    id: "hw_" + Date.now(),
    course,
    title,
    description,
    activities: activities || "",
    date: date || new Date().toISOString().split("T")[0],
    dueDate: dueDate || new Date().toISOString().split("T")[0],
    postedBy: postedBy || "Admin"
  };
  database.homework.push(newHw);
  writeDb(database);
  res.status(201).json(newHw);
});

app.put("/api/homework/:id", (req, res) => {
  const { id } = req.params;
  if (!database.homework) {
    database.homework = [];
  }
  const idx = database.homework.findIndex((h: any) => h.id === id);
  if (idx !== -1) {
    database.homework[idx] = { ...database.homework[idx], ...req.body };
    writeDb(database);
    res.json(database.homework[idx]);
  } else {
    res.status(404).json({ error: "Homework record not found" });
  }
});

app.delete("/api/homework/:id", (req, res) => {
  const { id } = req.params;
  if (database.homework) {
    database.homework = database.homework.filter((h: any) => h.id !== id);
    writeDb(database);
  }
  res.json({ success: true });
});

// Exam Schedules Endpoints
app.post("/api/exams", (req, res) => {
  const { title, course, subject, examDate, examTime, maxMarks, syllabus, academicTerm, status } = req.body;
  if (!database.exams) {
    database.exams = [];
  }
  const newExam = {
    id: "ex_" + Date.now(),
    title,
    course,
    subject,
    examDate: examDate || new Date().toISOString().split("T")[0],
    examTime: examTime || "09:00 AM",
    maxMarks: parseInt(maxMarks) || 50,
    syllabus: syllabus || "",
    academicTerm: academicTerm || "Term 1",
    status: status || "Scheduled"
  };
  database.exams.push(newExam);
  writeDb(database);
  res.status(201).json(newExam);
});

app.put("/api/exams/:id", (req, res) => {
  const { id } = req.params;
  if (!database.exams) {
    database.exams = [];
  }
  const idx = database.exams.findIndex((e: any) => e.id === id);
  if (idx !== -1) {
    database.exams[idx] = { ...database.exams[idx], ...req.body };
    writeDb(database);
    res.json(database.exams[idx]);
  } else {
    res.status(404).json({ error: "Exam schedule record not found" });
  }
});

app.delete("/api/exams/:id", (req, res) => {
  const { id } = req.params;
  if (database.exams) {
    database.exams = database.exams.filter((e: any) => e.id !== id);
    writeDb(database);
  }
  res.json({ success: true });
});

// -------------------------------------------------------------
// Server-Side Gemini AI Assistive Features
// -------------------------------------------------------------
app.post("/api/ai/remarks", async (req, res) => {
  const { name, course, subject, examScore, homeworkScore } = req.body;
  if (!name || !subject) {
    return res.status(400).json({ error: "Student name and subject are required for AI generation" });
  }

  const prompt = `You are a warm, supportive pre-school teacher at Horizon International Tech Play School.
Write a single-sentence encouraging, constructive report card comment (in English, maximum 35 words) for a student named "${name}" in the course "${course}" for the subject "${subject}". The student's homework score is ${homeworkScore}% and exam score is ${examScore}%. Keep it cheerful and focus on early developmental progress (fine motor skills, social participation, phonics, or communication).`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      const generatedText = response.text || "";
      return res.json({ remarks: generatedText.trim().replace(/^"|"$/g, '') });
    } catch (err) {
      console.error("Gemini AI API generation failed, falling back:", err);
    }
  }

  // Fallback heuristic remarks if Gemini is configured offline or unavailable
  const fallbackRemarks = [
    `${name} shows delightful progress in ${subject}, participating actively in circle-time and showing friendly peer sharing.`,
    `We love watching ${name}'s confidence grow in ${subject}. Performs tasks with beautiful curiosity and focus.`,
    `Excellent motor control and focus shown during our ${subject} sessions. A joy to teach in the classroom!`,
    `${name} engages with brilliant smiles during ${subject} activities and absorbs letters/concepts incredibly fast.`
  ];
  const selected = fallbackRemarks[Math.floor(Math.random() * fallbackRemarks.length)];
  res.json({ remarks: selected });
});

app.post("/api/ai/lesson-plan", async (req, res) => {
  const { topic, course } = req.body;
  if (!topic || !course) {
    return res.status(400).json({ error: "Topic and course level are required" });
  }

  const prompt = `You are a creative kindergarten curriculum designer.
Generate brief, engaging lesson activities for a pre-school level course "${course}" on the topic "${topic}".
Respond in simple JSON with exactly these three keys:
- "objectives" (short statement, e.g. "Identify primary primary shapes in the classroom")
- "activities" (2-3 fun play-based, hands-on, sensory instructions, e.g. "1. Shape hunt game under tables. 2. Crafting clay cylinders.")
Ensure the tone is playful, colorful, and fully suitable for kids aged 2 to 6. Keep both descriptions short (maximum 50 words each).`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const generatedText = response.text || "";
      const resultObj = JSON.parse(generatedText.trim());
      return res.json({
        objectives: resultObj.objectives,
        activities: resultObj.activities
      });
    } catch (err) {
      console.error("Gemini AI Lesson Plan generation failed, falling back:", err);
    }
  }

  // Fallback detailed lesson recommendations
  const fallbackPlan = {
    objectives: `Help children explore ${topic} via engaging visual flashcards and creative sensory hand-paint activities.`,
    activities: `1. Interactive circle time introducing ${topic} with matching sounds. 2. Group block puzzle building on the center mat. 3. Visual tracing with colored play-dough.`
  };
  res.json(fallbackPlan);
});

// -------------------------------------------------------------
// Development & Production Setup
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server loaded as middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Horizon Play School SaaS server running at http://localhost:${PORT}`);
  });
}

startServer();
