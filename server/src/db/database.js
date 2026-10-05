require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS colleges (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        city TEXT NOT NULL,
        demo_flag INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS clubs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        college_id TEXT NOT NULL REFERENCES colleges(id),
        demo_flag INTEGER DEFAULT 1
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
        college_id TEXT REFERENCES colleges(id),
        club_id TEXT REFERENCES clubs(id),
        project_id TEXT REFERENCES projects(id),
        squad_id TEXT,
        referral_code TEXT UNIQUE NOT NULL,
        referred_by TEXT,
        source TEXT DEFAULT 'organic',
        medium TEXT,
        campaign TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS registrations (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL UNIQUE REFERENCES students(id),
        registered_at TIMESTAMPTZ DEFAULT NOW(),
        status TEXT DEFAULT 'registered'
      );

      CREATE TABLE IF NOT EXISTS referrals (
        id TEXT PRIMARY KEY,
        referrer_student_id TEXT NOT NULL REFERENCES students(id),
        referred_student_id TEXT NOT NULL REFERENCES students(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL UNIQUE REFERENCES students(id),
        attended INTEGER DEFAULT 0,
        attended_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS project_progress (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL UNIQUE REFERENCES students(id),
        started INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0,
        completion_time INTEGER,
        completed_at TIMESTAMPTZ
      );

      CREATE TABLE IF NOT EXISTS shares (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL REFERENCES students(id),
        platform TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS squads (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        college_id TEXT NOT NULL REFERENCES colleges(id),
        created_by TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS squad_members (
        id TEXT PRIMARY KEY,
        squad_id TEXT NOT NULL REFERENCES squads(id),
        student_id TEXT NOT NULL REFERENCES students(id),
        joined_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS project_votes (
        id TEXT PRIMARY KEY,
        student_id TEXT NOT NULL REFERENCES students(id),
        voter_identifier TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS campaign_events (
        id TEXT PRIMARY KEY,
        student_id TEXT,
        event_type TEXT NOT NULL,
        source TEXT,
        medium TEXT,
        campaign TEXT,
        metadata TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
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
    console.log('✅ PostgreSQL schema initialized');
  } catch (err) {
    console.error('❌ DB schema init error:', err.message);
  } finally {
    client.release();
  }
}

initDB();

module.exports = pool;
