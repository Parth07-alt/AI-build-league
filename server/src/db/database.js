const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/abl.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create all tables
db.exec(`
  CREATE TABLE IF NOT EXISTS colleges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    demo_flag INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS clubs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    college_id TEXT NOT NULL,
    demo_flag INTEGER DEFAULT 1,
    FOREIGN KEY (college_id) REFERENCES colleges(id)
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    estimated_minutes INTEGER NOT NULL,
    skills TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    branch TEXT,
    graduation_year INTEGER,
    linkedin_url TEXT,
    college_id TEXT,
    club_id TEXT,
    project_id TEXT,
    squad_id TEXT,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by TEXT,
    source TEXT DEFAULT 'organic',
    medium TEXT,
    campaign TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (college_id) REFERENCES colleges(id),
    FOREIGN KEY (club_id) REFERENCES clubs(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL UNIQUE,
    registered_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'registered',
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    referrer_student_id TEXT NOT NULL,
    referred_student_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (referrer_student_id) REFERENCES students(id),
    FOREIGN KEY (referred_student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL UNIQUE,
    attended INTEGER DEFAULT 0,
    attended_at TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS project_progress (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL UNIQUE,
    started INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    completion_time INTEGER,
    completed_at TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS shares (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS squads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    college_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (college_id) REFERENCES colleges(id),
    FOREIGN KEY (created_by) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS squad_members (
    id TEXT PRIMARY KEY,
    squad_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    joined_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (squad_id) REFERENCES squads(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS project_votes (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    voter_identifier TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS campaign_events (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    event_type TEXT NOT NULL,
    source TEXT,
    medium TEXT,
    campaign TEXT,
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS experiments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    hypothesis TEXT NOT NULL,
    variant_a TEXT NOT NULL,
    variant_b TEXT NOT NULL,
    metric TEXT NOT NULL,
    status TEXT DEFAULT 'running',
    sample_size INTEGER DEFAULT 0,
    result TEXT,
    decision TEXT
  );

  CREATE TABLE IF NOT EXISTS budget_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT
  );
`);

module.exports = db;
