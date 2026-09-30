# CoopConnect LMS — AI-Powered Learning Management System
### Smart India Hackathon 2026

**CoopConnect LMS** is a modular, AI-driven Learning Management System specifically tailored for Indian Cooperative Societies, Primary Agricultural Credit Societies (PACS), Dairy Unions, Handloom Weaver Societies, and District Central Cooperative Banks (DCCBs).

---

## 🎯 Core Demo Flow

The system implements the full end-to-end evaluation flow:

$$\text{Login} \longrightarrow \text{Student Dashboard} \longrightarrow \text{Course Curriculum} \longrightarrow \text{Interactive Lessons} \longrightarrow \text{MCQ Assessment} \longrightarrow \text{Instant Score} \longrightarrow \text{AI Skill Analysis} \longrightarrow \text{Intelligent Recommendations} \longrightarrow \text{Verified Certificate}$$

---

## 🌟 Key Features

### 1. Indian Cooperative Focused Curriculum
- Standardized courses for **PACS Digital Accounting**, **AEPS Micro-ATM Operations**, **Cooperative Governance & Statutory Audit**, **Dairy Cold Chain & AMCU Testing**, and **KCC Credit Appraisal**.
- Multi-lesson modules with duration, bilingual audio note simulation, and statutory practice checklists.

### 2. AI Skill Gap & Proficiency Analyzer
- **Modular Engine**: Pluggable interface supporting heuristic analysis and TensorFlow.js neural network models.
- **Categorization**:
  - **Strong (Score $\ge 80\%$)**: Mastery competency with confidence score.
  - **Developing ($60\% - 79\%$)**: Intermediate competency nearing threshold.
  - **Critical Skill Gap ($< 60\%$)**: Automatically flags deficits with exact deficit delta (e.g., `-35% to mastery`).
- **Direct AI Endpoint**: `POST /api/ai/analyze-skills` for integration with external ERP and skill modules.

### 3. Dynamic Course Recommendation Engine
- Automatically maps identified skill gaps to catalog courses from the database.
- Provides contextual reasoning (e.g. *Targeted to bridge critical gap in "Cooperative Accounting"*).

### 4. Official Verifiable Digital Certificates
- Generates tamper-proof certificates with unique Certificate Numbers (e.g. `COOP-SIH-XXXX`), SHA-256 verification hashes, and print/PDF-ready styling.
- Public certificate verification endpoint: `/api/certificates/verify/:query`.

### 5. Multi-Role RBAC Portals
- **Student / Cooperative Member**: Course enrollment, interactive reading, quiz taking, AI skill profile, certificate access.
- **Trainer**: Course creation, syllabus/module structuring, quiz and question builder with skill tags, member assessment monitoring.
- **Admin**: System-wide analytics, national skill gap heatmap, society participation metrics, user role management.

### 6. Offline-First Edge Architecture
- Local SQLite Cache / IndexedDB simulation for remote rural PACS and edge Raspberry Pi devices.
- Sync Queue stages actions performed without internet and commits them to the central cloud upon reconnect.

---

## 🔑 Quick Demo Credentials (1-Click Switcher Available in UI)

| Role | User Name | Email | Password | Cooperative Society |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Ramesh Patel | `ramesh.patel@coopconnect.in` | `password123` | Kaira Milk Producers Union (Dairy) |
| **Student (PACS)** | Sunita Sharma | `sunita.sharma@coopconnect.in` | `password123` | Haveli Taluka PACS, Pune |
| **Trainer** | Dr. Anand Deshmukh | `prof.sharma@coopconnect.in` | `trainer123` | VAMNICOM / NCCT Faculty |
| **Admin** | Vikramaditya Rao | `admin@coopconnect.in` | `admin123` | NCDC / Ministry Admin |

---

## 🛠️ Technology Stack

- **Frontend**: React.js 19, Vite 6, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express.js REST API.
- **Database**: PostgreSQL compatible schema + Built-in high performance SQLite WAL mode engine (`node:sqlite`) for zero-setup execution.
- **AI/ML Layer**: Modular AI Skill Engine (`server/src/services/aiService.js`).
- **Offline Sync Layer**: Sync Queue Service (`server/src/services/syncService.js`).

---

## 🚀 Quick Start Instructions

### 1. Install all dependencies
```bash
npm run install:all
```

### 2. Seed Database with Indian Cooperative Data
```bash
npm run seed
```

### 3. Start Development Servers (Backend + Frontend)
```bash
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/login` — Sign in with email and password
- `POST /api/auth/register` — Register member with cooperative society
- `GET /api/auth/me` — Retrieve authenticated user profile
- `GET /api/auth/demo-accounts` — List sample accounts for evaluation

### Courses & Syllabus
- `GET /api/courses` — List all courses with category/search filters
- `GET /api/courses/:id` — Course syllabus with modules, lessons, and quizzes
- `POST /api/enrollments` — Enroll current user in a course
- `GET /api/enrollments/my-courses` — User's enrolled courses and progress

### Lessons & Quizzes
- `GET /api/lessons/:id` — Lesson content and navigation
- `POST /api/lessons/:id/complete` — Mark lesson as completed
- `GET /api/quizzes/:id` — Quiz questions with skill tags
- `POST /api/quizzes/:id/submit` — Submit quiz, calculate score, and trigger AI analysis

### AI Skill Analysis & Recommendations
- `GET /api/ai/skills` — Learner competency profile (Strong, Developing, Skill Gaps)
- `POST /api/ai/analyze-skills` — Standalone AI evaluation endpoint
- `GET /api/ai/recommendations` — Dynamic course recommendations targeting skill gaps

### Certification & Verification
- `GET /api/certificates/my-certificates` — List user's earned credentials
- `GET /api/certificates/:id` — Certificate details
- `GET /api/certificates/verify/:query` — Public verification by number or hash

### Trainer & Admin
- `GET /api/trainer/stats` — Trainer dashboard statistics
- `POST /api/trainer/courses` — Create a new course
- `POST /api/trainer/courses/:courseId/modules` — Add module
- `POST /api/trainer/modules/:moduleId/lessons` — Add lesson
- `POST /api/trainer/courses/:courseId/quizzes` — Add quiz with questions
- `GET /api/admin/analytics` — System metrics and skill gap heatmap
- `GET /api/admin/users` — User directory
- `PATCH /api/admin/users/:userId/role` — Update user role

### Offline Edge Sync
- `POST /api/sync/batch` — Sync offline queued actions from edge devices
- `GET /api/sync/status` — Sync queue node health and log
