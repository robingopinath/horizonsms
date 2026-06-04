# Horizon International Tech Play School Management SaaS Portal 🏫✨

A production-ready, full-stack School Management SaaS application tailored for pre-school levels (Day-Care, Pre-Nursery, Nursery, LKG, and UKG). This platform provides a centralized workspace for administrators, teachers, parents, and executive management, powered by an **Express + TypeScript** backend, a **React + Tailwind CSS** frontend, and **Gemini AI** for cognitive automation features.

[![SaaS Architecture](https://img.shields.io/badge/Architecture-Fullstack_Express_React-blue?style=for-the-badge)](https://expressjs.com/)
[![React 19](https://img.shields.io/badge/Frontend-React_19_&_Vite-orange?style=for-the-badge)](https://react.dev/)
[![Tailwind 4.0](https://img.shields.io/badge/Styling-Tailwind_CSS_4-06B6D4?style=for-the-badge)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Cognitive-Gemini_3.5_Flash-8E75C2?style=for-the-badge)](https://ai.google.dev/)

---

## 🏗️ System Architecture

The application is structured as a robust, single-repository full-stack system:

```text
├── .env.example            # Environment configurations (Gemini keys, etc.)
├── .gitignore              # Robust git ignore instructions for dependencies & assets
├── db.json                 # Auto-seeding local key-value state database file
├── metadata.json           # Application descriptor and configuration manifest
├── package.json            # Node.js dependencies, linting, build, and start scripts
├── server.ts               # Express.js REST API backend & static workspace middleware
├── tsconfig.json           # Type resolution and code compile targets
├── vite.config.ts          # Vite build automation, custom path aliases, and HMR setup
└── src/                    # React SPA Frontend codebase
    ├── App.tsx             # Main layout Router, auth-state core, and sidebar controls
    ├── main.tsx            # React application entry client point
    ├── types.ts            # Absolute type declarations and TypeScript schemas
    ├── index.css           # Global typography definitions and animation layers
    ├── index.html          # Shell HTML template
    └── components/         # Modular user interfaces (Views)
        ├── HorizonLogo.tsx        # High-contrast vector design branding logo
        ├── AdminDashboard.tsx     # Administrator Workspace controls & settings
        ├── StaffDashboard.tsx     # Teacher Terminal module & student grading
        ├── ParentDashboard.tsx    # Parents Gateway & Stripe billing simulated portal
        └── ManagementDashboard.tsx # Executive Board analytical metrics & charts
```

### Key Technical Aspects:
1. **Frontend (Client SPA):** Made with **React 19** and **Vite 6** to ensure immediate hot reload and compiling. Layouts are strictly animated using **motion** (`motion/react`) alongside a fully custom color palette using **Tailwind CSS v4.0**.
2. **Backend (Server App):** An **Express v4** API server written in custom TypeScript. In production, this backend serves the built React static files and handles any proxy requests securely.
3. **Persistent Cloud-Like Store (`db.json`):** The server uses an automated file-system-bound key-value storage engine. On initial loading, it checks if `db.json` exists; if missing, it seeds standard Indian play-school dummy datasets (with 15+ student records for Whitefield/Jayanagar main campuses and detailed finance histories).
4. **Cognitive Automation (Gemini 3.5 Flash):** Integrated server-side with `@google/genai` to prevent API key exposures on the browser. Features include automatic report card constructive feedback suggestions and single-click class curricular lesson planning based on pre-school milestones.

---

## 🛠️ Workspaces & Visual Profiles

The interface operates under four distinct system workspaces, simulated in the desktop layout via a permanent administrative navigation panel:

### 1. 🛡️ Admin Office Workspace
* Manage, register, update, or remove pupils and teach staff records.
* Global setup panel targeting evaluation ratios (e.g. adjust Homework Weight vs. Exam weight values).
* Oversee payroll distribution systems, disburse staff earnings, and instantly generate monthly tuition/kit custom invoices.

### 2. 🎓 Teacher Terminal
* View active class lists filtered across the pre-school curricular groups (Day-Care, Pre-Nursery, Nursery, LKG, UKG).
* Log attendance sheets with one-click toggles and auto-trigger simulated parent SMS notifications about absences.
* Record core evaluations in specific terms (Term 1, Term 2, Final Term) across play-based categories (Phonics, Motor Skills, Counting).
* **AI Assist Integration:** Instantly generate personalized constructive teacher comments for child report cards using natural language analysis.

### 3. 👥 Parent Gateway
* Monitor ward learning curves, view graded assessments, and print customized report card layouts.
* Daily attendance check summaries showing present, absent, or late statuses.
* Safe billing dashboard displaying due fees with structured detail lines and single-click **Simulated Stripe Checkout Payments** with instant token generation.

### 4. 📊 Executive Board Dashboard
* High-level micro-financial metrics for directors (Total Invoice Collections, Active Revenue, Pending Receivables, Staff Payroll outlays).
* Custom analytical D3/Recharts modules representing Class Student Enrollments, Monthly Invoicing distributions, and Teacher-to-Student ratios.
* Monitor general daily attendance rates to optimize school operations.

---

## ⚡ Deployment & Setup Guide

### 📋 Prerequisites
* **Node.js** (v18.x or larger recommended)
* A valid **Gemini API Key** (optional, fallback heuristic models run automatically if offline)

### 🚀 Running Globally / Locally

1. **Clone & Direct to Folder:**
   ```bash
   git clone <your-repository-url>
   cd <repository-directory>
   ```

2. **Initialize Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Settings:**
   Copy the example environment credentials:
   ```bash
   cp .env.example .env
   ```
   Add your keys inside your `.env` file:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   ```

4. **Boot Up Development Server:**
   ```bash
   npm run dev
   ```
   *The server initializes at `http://localhost:3000` with the Vite dev middleware running in the background.*

5. **Type Inspection & Lint Check:**
   ```bash
   npm run lint
   ```

---

## 📦 Production Builds & Deployment Steps

To export the software package for automated cloud environments or pipelines:

### 1. Direct Build Command
```bash
npm run build
```
This script executes two sequential actions:
* `vite build` to bundle, compile, and place optimized static asset bundles in `/dist`.
* `esbuild server.ts ... --outfile=dist/server.cjs` to compile the TypeScript Express backend into a standalone CommonJS execution bundle inside `dist`.

### 2. Standalone Start Command
```bash
npm start
```
Starts the built, self-contained server on port `3000` (`node dist/server.cjs`).

### ☁️ Platform Configuration Details

#### Vercel (Front-end Only Deployment)
If you wish to deploy the frontend SPA static files directly to Vercel:
* **Framework Preset:** `Vite`
* **Root Directory:** `./`
* **Build Command:** `npm run build` (or `vite build`)
* **Output Directory:** `dist`

#### Railway & Render (Full-Stack Deployment)
When deploying the active Express + React full-stack bundle to Docker, Railway, or Render:
1. Ensure the platform points to the root directory containing `package.json`.
2. Ensure to pass environment variables (e.g. `GEMINI_API_KEY`) via the platform's developer dashboard.
3. The build command should be `npm run build`.
4. The start command should be `npm start` (or `node dist/server.cjs`).
5. **Note on Ports:** The application compiles default to run on **Port 3000**. Avoid custom configurations that override default ingress variables.

---

## 📜 License

Distributed under the Apache-2.0 License. See `LICENSE` for more information.

---
*Developed as a high-fidelity SaaS benchmark for Horizon International Tech Play School.*
