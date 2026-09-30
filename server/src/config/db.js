import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory for persistent SQLite database
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'coopconnect_lms.db');
const db = new DatabaseSync(dbPath);

// Enable Foreign Key constraints and WAL mode for high performance concurrency
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Database helper utilities to provide clean async-like / standardized access
export const dbHelper = {
  exec: (sql) => db.exec(sql),
  
  query: (sql, params = []) => {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },
  
  get: (sql, params = []) => {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  },
  
  all: (sql, params = []) => {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },
  
  run: (sql, params = []) => {
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return {
      lastInsertRowid: result.lastInsertRowid,
      changes: result.changes
    };
  },
  
  transaction: (fn) => {
    db.exec('BEGIN TRANSACTION;');
    try {
      const res = fn();
      db.exec('COMMIT;');
      return res;
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  }
};

// Initialize Table Schemas
export function initializeDatabase() {
  db.exec(`
    -- Roles
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    );

    -- Users (Student/Member, Trainer, Admin)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      cooperative_society TEXT,
      member_id TEXT,
      phone TEXT,
      state TEXT DEFAULT 'Maharashtra',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
    );

    -- Skills (e.g., Digital Accounting, PACS Governance, Dairy Cold Chain, Micro-credit)
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      description TEXT
    );

    -- Courses
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT 'Beginner',
      duration_hours REAL DEFAULT 4.0,
      thumbnail TEXT,
      target_skill_id INTEGER,
      trainer_id INTEGER NOT NULL,
      is_published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (target_skill_id) REFERENCES skills(id) ON DELETE SET NULL,
      FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Modules
    CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    -- Lessons
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      content_type TEXT DEFAULT 'text',
      video_url TEXT,
      duration_mins INTEGER DEFAULT 15,
      order_index INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
    );

    -- Quizzes (Module Quizzes or Course Final Assessments)
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      passing_score INTEGER DEFAULT 60,
      duration_mins INTEGER DEFAULT 15,
      FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE SET NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    -- Questions
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL,
      skill_id INTEGER NOT NULL,
      explanation TEXT,
      order_index INTEGER DEFAULT 1,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE RESTRICT
    );

    -- Enrollments
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed'
      progress_percent REAL DEFAULT 0.0,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    -- Lesson Progress Tracking
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      is_completed INTEGER DEFAULT 1,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    -- Quiz Attempts
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      quiz_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      score REAL NOT NULL,
      total_questions INTEGER NOT NULL,
      correct_answers INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    -- Quiz Answers (Per Question Breakdown)
    CREATE TABLE IF NOT EXISTS quiz_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      selected_option TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE RESTRICT
    );

    -- Assessment Results (Skill-wise breakdown per attempt)
    CREATE TABLE IF NOT EXISTS assessment_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      attempt_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      score REAL NOT NULL,
      status TEXT NOT NULL, -- 'Strong', 'Developing', 'Skill Gap'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE RESTRICT
    );

    -- Skill Profiles (Aggregated User Competency Matrix)
    CREATE TABLE IF NOT EXISTS skill_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      proficiency_level TEXT NOT NULL, -- 'Strong', 'Developing', 'Skill Gap'
      score REAL NOT NULL,
      last_assessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, skill_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
    );

    -- AI Recommendations
    CREATE TABLE IF NOT EXISTS recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      priority INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
    );

    -- Certificates
    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      certificate_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      grade TEXT DEFAULT 'A',
      verification_hash TEXT NOT NULL,
      status TEXT DEFAULT 'valid',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    -- Offline Sync Queue (Edge device / SQLite cloud synchronization architecture)
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      device_id TEXT NOT NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending', 'synced', 'failed'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      synced_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log('✅ CoopConnect Database schema initialized successfully.');
}

export default db;
