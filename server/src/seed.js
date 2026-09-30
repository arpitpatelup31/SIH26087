import bcrypt from 'bcryptjs';
import { dbHelper, initializeDatabase } from './config/db.js';

export async function runSeed() {
  console.log('🌱 Seeding CoopConnect LMS database with Indian Cooperative ecosystem data...');
  initializeDatabase();

  const passwordHash = await bcrypt.hash('password123', 10);
  const trainerHash = await bcrypt.hash('trainer123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  // 1. Seed Roles
  dbHelper.run("INSERT OR IGNORE INTO roles (id, name, description) VALUES (1, 'student', 'Cooperative Member / PACS Staff')");
  dbHelper.run("INSERT OR IGNORE INTO roles (id, name, description) VALUES (2, 'trainer', 'Certified Cooperative Trainer / NCCT Faculty')");
  dbHelper.run("INSERT OR IGNORE INTO roles (id, name, description) VALUES (3, 'admin', 'Cooperative Registrar / System Administrator')");

  // 2. Seed Users
  dbHelper.run(`
    INSERT OR REPLACE INTO users (id, name, email, password_hash, role_id, cooperative_society, member_id, phone, state, avatar)
    VALUES 
    (1, 'Ramesh Patel', 'ramesh.patel@coopconnect.in', ?, 1, 'Kaira District Co-operative Milk Producers Union', 'GJ-COOP-88219', '+91 98250 12345', 'Gujarat', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh'),
    (2, 'Sunita Sharma', 'sunita.sharma@coopconnect.in', ?, 1, 'Haveli Taluka Primary Agricultural Credit Society', 'MH-PACS-44102', '+91 98220 54321', 'Maharashtra', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita'),
    (3, 'Dr. Anand Deshmukh', 'prof.sharma@coopconnect.in', ?, 2, 'VAMNICOM - National Council for Cooperative Training', 'NCCT-FAC-109', '+91 94220 98765', 'Maharashtra', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anand'),
    (4, 'Vikramaditya Rao', 'admin@coopconnect.in', ?, 3, 'National Cooperative Development Corporation (NCDC)', 'NCDC-ADM-001', '+91 99100 11223', 'New Delhi', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram')
  `, [passwordHash, passwordHash, trainerHash, adminHash]);

  // 3. Seed Skills
  const skillsData = [
    { id: 1, name: 'Cooperative Accounting', category: 'Finance & Bookkeeping', description: 'Double-entry bookkeeping, cash book balancing, Day book & PACS ledger maintenance' },
    { id: 2, name: 'Digital Literacy & DBT', category: 'Technology', description: 'AEPS micro-ATM operations, PM-KISAN DBT validation, and online banking reconciliation' },
    { id: 3, name: 'PACS Governance & Bye-laws', category: 'Compliance & Legal', description: 'Cooperative Societies Act, AGM conduction, quorum rules, and statutory audit readiness' },
    { id: 4, name: 'Dairy Cold Chain & Quality Control', category: 'Agriculture & Dairy', description: 'Milk fat/SNF electronic analyzer operation, chilling center standard operating procedures' },
    { id: 5, name: 'Credit Appraisal & Loan Recovery', category: 'Banking & Credit', description: 'Kisan Credit Card (KCC) limit calculation, collateral evaluation, and NPA prevention' },
    { id: 6, name: 'Handloom & Weaver Supply Chain', category: 'Artisan & Textiles', description: 'Yarn procurement subsidies, GeM portal listing, and export compliance for weaver SHGs' }
  ];

  for (const s of skillsData) {
    dbHelper.run(`
      INSERT OR REPLACE INTO skills (id, name, category, description)
      VALUES (?, ?, ?, ?)
    `, [s.id, s.name, s.category, s.description]);
  }

  // 4. Seed Courses
  const coursesData = [
    {
      id: 1,
      title: 'PACS Digital Accounting & Financial Management',
      slug: 'pacs-digital-accounting',
      description: 'Master computerised accounting for Primary Agricultural Credit Societies (PACS) under the Ministry of Cooperation national digitization mandate. Covers Day Book, General Ledger, Member Passbooks, and Trial Balance generation.',
      category: 'Finance & Accounting',
      level: 'Beginner',
      duration_hours: 6.5,
      thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
      target_skill_id: 1,
      trainer_id: 3
    },
    {
      id: 2,
      title: 'AEPS Micro-ATM & DBT Operations in Rural Cooperatives',
      slug: 'aeps-micro-atm-dbt-operations',
      description: 'Practical training on operating biometric Micro-ATMs, Aadhaar Enabled Payment System (AEPS), PM-KISAN DBT disbursals, and fraud prevention for PACS secretaries and counter operators.',
      category: 'Digital Banking',
      level: 'Intermediate',
      duration_hours: 4.0,
      thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      target_skill_id: 2,
      trainer_id: 3
    },
    {
      id: 3,
      title: 'Cooperative Governance, Bye-Laws & Statutory Audit',
      slug: 'cooperative-governance-bye-laws',
      description: 'Comprehensive guide to model bye-laws, Board of Directors meetings, statutory inspection preparation, and transparent member dividend distribution in cooperative societies.',
      category: 'Governance & Legal',
      level: 'Intermediate',
      duration_hours: 5.0,
      thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
      target_skill_id: 3,
      trainer_id: 3
    },
    {
      id: 4,
      title: 'Dairy Cold Chain Logistics & Electronic Milk Testing',
      slug: 'dairy-cold-chain-logistics',
      description: 'Learn modern milk collection center (AMCU) management, digital Gerber/ultrasonic milk fat and SNF testing, chilling vats maintenance, and clean milk production protocols.',
      category: 'Dairy & Agriculture',
      level: 'Beginner',
      duration_hours: 4.5,
      thumbnail: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=800&q=80',
      target_skill_id: 4,
      trainer_id: 3
    },
    {
      id: 5,
      title: 'Kisan Credit Card (KCC) Appraisal & Risk Mitigation',
      slug: 'kcc-appraisal-risk-mitigation',
      description: 'Essential underwriting principles for crop loans, scale of finance calculation, interest subvention schemes, and effective recovery mechanisms for rural credit societies.',
      category: 'Banking & Credit',
      level: 'Advanced',
      duration_hours: 5.5,
      thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
      target_skill_id: 5,
      trainer_id: 3
    }
  ];

  for (const c of coursesData) {
    dbHelper.run(`
      INSERT OR REPLACE INTO courses (id, title, slug, description, category, level, duration_hours, thumbnail, target_skill_id, trainer_id, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [c.id, c.title, c.slug, c.description, c.category, c.level, c.duration_hours, c.thumbnail, c.target_skill_id, c.trainer_id]);
  }

  // 5. Seed Modules & Lessons for Course 1 (PACS Digital Accounting)
  dbHelper.run(`
    INSERT OR REPLACE INTO modules (id, course_id, title, description, order_index)
    VALUES 
    (1, 1, 'Module 1: Principles of Double-Entry Bookkeeping in PACS', 'Foundational accounting structure and primary books of accounts.', 1),
    (2, 1, 'Module 2: Day Book & General Ledger Posting', 'Step-by-step recording of cash, transfer, and member credit entries.', 2),
    (3, 1, 'Module 3: Bank Reconciliation & Final Trial Balance', 'Monthly reconciliation with DCCB branches and trial balance generation.', 3)
  `);

  // Lessons for Course 1
  const lessonsCourse1 = [
    {
      id: 1,
      module_id: 1,
      title: 'Introduction to PACS Accounting Framework & National Common Software',
      content: `### Welcome to PACS Digital Accounting

Under the initiative of the Ministry of Cooperation, Primary Agricultural Credit Societies (PACS) across India are being migrated to a unified ERP standard.

#### 1. Why Standardized Accounting Matters:
* **Transparency**: Real-time audit trails prevent misallocation of member funds.
* **Direct Benefit Transfer (DBT)**: Seamless integration with Aadhaar and PM-KISAN portals.
* **Credit Refinance**: Simplified documentation when applying for NABARD refinance through District Central Cooperative Banks (DCCBs).

#### 2. Key Accounting Records in a Cooperative Society:
1. **Cash Book (Rokar Bahi)**: Daily record of physical cash inflows and outflows.
2. **Day Book (Roznamcha)**: Chronological journal of all cash and non-cash voucher transactions.
3. **Member Loan Ledger (Khatauni)**: Individual member share capital, crop loan balance, and interest accrued.
4. **General Ledger (Khatiyan)**: Classified summary of all asset, liability, income, and expenditure accounts.

*Next, we will look into voucher preparation and debit/credit rules.*`,
      content_type: 'text',
      duration_mins: 12,
      order_index: 1
    },
    {
      id: 2,
      module_id: 1,
      title: 'Voucher Preparation: Receipt, Payment, and Transfer Vouchers',
      content: `### Understanding Accounting Vouchers

Every financial entry in a cooperative society must be backed by a pre-numbered and signed voucher.

#### 1. Receipt Voucher (Jama Chitha):
Prepared whenever cash or cheque is received from a member or external entity (e.g., share subscription, loan installment repayment, fertilizer sale proceeds).

#### 2. Payment Voucher (Kharch Chitha):
Prepared when society incurs expenditure or disburses loans (e.g., KCC disbursement, electricity bill, staff remuneration). Must be countersigned by the Secretary and President/Treasurer.

#### 3. Transfer Voucher (Hawala Chitha):
Used for non-cash adjustment entries, such as adjusting government interest subvention against member loan accounts.`,
      content_type: 'text',
      duration_mins: 15,
      order_index: 2
    },
    {
      id: 3,
      module_id: 2,
      title: 'Posting Transactions to the Digital Day Book',
      content: `### Digital Day Book Posting Procedures

In computerized PACS software, daily transactions must be verified before the daily cash balance can be locked.

#### Golden Rules Applied to PACS:
* **Real Accounts**: Debit what comes in, Credit what goes out (e.g., Cash, Fertilizer Stock).
* **Personal Accounts**: Debit the receiver, Credit the giver (e.g., Member Loan Account).
* **Nominal Accounts**: Debit all expenses and losses, Credit all incomes and gains (e.g., Interest on Short Term Loan).

#### End-of-Day Checklist:
1. Physical cash box tally with Cash Book balance.
2. Verification of all dual authorization signatures.
3. Automated backup to edge SQLite cache & cloud server.`,
      content_type: 'text',
      duration_mins: 18,
      order_index: 1
    },
    {
      id: 4,
      module_id: 3,
      title: 'Preparation of Trial Balance & Balance Sheet for Audit',
      content: `### Finalizing Cooperative Accounts for Audit

At the conclusion of each financial quarter or year, PACS must draft the Trial Balance (Kaccha Chitha).

#### Key Components:
1. **Liabilities**: Share Capital, Reserve Funds, DCCB Borrowings, Member Deposits.
2. **Assets**: Cash in hand, Balance with DCCB, Loans outstanding, Fixed assets.
3. **Trading Account**: Fertilizer, seeds, and pesticide inventory valuations.

Proper balancing ensures 'A' or 'B' audit classification by Cooperative Department auditors!`,
      content_type: 'text',
      duration_mins: 20,
      order_index: 1
    }
  ];

  for (const l of lessonsCourse1) {
    dbHelper.run(`
      INSERT OR REPLACE INTO lessons (id, module_id, title, content, content_type, duration_mins, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [l.id, l.module_id, l.title, l.content, l.content_type, l.duration_mins, l.order_index]);
  }

  // 6. Seed Quizzes & Questions
  // Quiz 1: Module 1 Quiz
  dbHelper.run(`
    INSERT OR REPLACE INTO quizzes (id, module_id, course_id, title, description, passing_score, duration_mins)
    VALUES (1, 1, 1, 'Module 1 Assessment: Cooperative Accounting Fundamentals', 'Test your knowledge on PACS double-entry bookkeeping, voucher preparation, and ledger classifications.', 60, 10)
  `);

  // Questions for Quiz 1
  const questionsQuiz1 = [
    {
      id: 1,
      quiz_id: 1,
      question_text: 'Which primary document is maintained by a PACS to record daily cash receipts and disbursements in chronological order?',
      option_a: 'Profit & Loss Statement',
      option_b: 'Cash Book (Rokar Bahi)',
      option_c: 'Member Share Register',
      option_d: 'Fixed Asset Inventory',
      correct_option: 'B',
      skill_id: 1,
      explanation: 'The Cash Book (Rokar Bahi) is the primary book of entry recording daily physical cash inflows and outflows.',
      order_index: 1
    },
    {
      id: 2,
      quiz_id: 1,
      question_text: 'When a farmer repays their short-term crop loan installment in cash, which voucher should the PACS accountant prepare?',
      option_a: 'Payment Voucher (Kharch Chitha)',
      option_b: 'Receipt Voucher (Jama Chitha)',
      option_c: 'Transfer Voucher (Hawala Chitha)',
      option_d: 'Debit Note',
      correct_option: 'B',
      skill_id: 1,
      explanation: 'Cash received from members as loan repayment or deposit is entered via a Receipt Voucher (Jama Chitha).',
      order_index: 2
    },
    {
      id: 3,
      quiz_id: 1,
      question_text: 'Under the Golden Rules of Accounting, what is the correct treatment when a PACS pays an electricity bill of ₹3,500 in cash?',
      option_a: 'Credit Electricity Expense, Debit Cash',
      option_b: 'Debit Electricity Expense (Nominal Account), Credit Cash (Real Account)',
      option_c: 'Debit Member Account, Credit Bank Account',
      option_d: 'Debit Reserve Fund, Credit Share Capital',
      correct_option: 'B',
      skill_id: 1,
      explanation: 'Debit all expenses and losses (Nominal Account), Credit what goes out (Real Account - Cash).',
      order_index: 3
    },
    {
      id: 4,
      quiz_id: 1,
      question_text: 'Which digital service allows cooperative society members to withdraw cash using biometric fingerprint authentication at PACS counters?',
      option_a: 'SWIFT Wire Transfer',
      option_b: 'Aadhaar Enabled Payment System (AEPS / Micro-ATM)',
      option_c: 'Credit Default Swap',
      option_d: 'Cheque Truncation System only',
      correct_option: 'B',
      skill_id: 2,
      explanation: 'AEPS (Aadhaar Enabled Payment System) allows interoperable doorstep banking using biometric micro-ATMs.',
      order_index: 4
    },
    {
      id: 5,
      quiz_id: 1,
      question_text: 'What is the statutory quorum requirement typically mandated for a PACS Annual General Body Meeting (AGM) under state cooperative bye-laws?',
      option_a: 'Any 2 members',
      option_b: 'Minimum percentage (e.g., 20% or 1/5th of total active voting members) specified in bye-laws',
      option_c: 'Only the Managing Director',
      option_d: 'No quorum required for AGM',
      correct_option: 'B',
      skill_id: 3,
      explanation: 'State cooperative bye-laws mandate a minimum quorum (usually 1/5th or specified percentage) for valid AGM resolutions.',
      order_index: 5
    }
  ];

  for (const q of questionsQuiz1) {
    dbHelper.run(`
      INSERT OR REPLACE INTO questions (id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, skill_id, explanation, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [q.id, q.quiz_id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, q.skill_id, q.explanation, q.order_index]);
  }

  // 7. Seed Initial Enrollment for Ramesh Patel
  dbHelper.run(`
    INSERT OR REPLACE INTO enrollments (id, user_id, course_id, status, progress_percent, enrolled_at)
    VALUES (1, 1, 1, 'in_progress', 50.0, CURRENT_TIMESTAMP)
  `);

  dbHelper.run(`
    INSERT OR REPLACE INTO lesson_progress (user_id, lesson_id, course_id, is_completed, completed_at)
    VALUES 
    (1, 1, 1, 1, CURRENT_TIMESTAMP),
    (1, 2, 1, 1, CURRENT_TIMESTAMP)
  `);

  // Initial Skill Profile for Ramesh Patel
  dbHelper.run(`
    INSERT OR REPLACE INTO skill_profiles (id, user_id, skill_id, proficiency_level, score, last_assessed_at)
    VALUES 
    (1, 1, 2, 'Strong', 85.0, CURRENT_TIMESTAMP),
    (2, 1, 1, 'Skill Gap', 45.0, CURRENT_TIMESTAMP),
    (3, 1, 3, 'Developing', 68.0, CURRENT_TIMESTAMP)
  `);

  // Initial Recommendations for Ramesh Patel
  dbHelper.run(`
    INSERT OR REPLACE INTO recommendations (id, user_id, course_id, skill_id, reason, priority)
    VALUES 
    (1, 1, 1, 1, 'Targeted to bridge critical gap in "Cooperative Accounting" (Assessed < 60%)', 1),
    (2, 1, 3, 3, 'Recommended to elevate developing proficiency in "PACS Governance & Bye-laws"', 2)
  `);

  console.log('✅ Database seeded with rich cooperative courses, skills, quizzes, and learner profiles!');
}

if (process.argv[1].endsWith('seed.js')) {
  runSeed().catch(console.error);
}
