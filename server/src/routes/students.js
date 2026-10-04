const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

function generateReferralCode(name) {
  const namePart = name.split(' ')[0].toUpperCase().slice(0, 6);
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${namePart}-${randomPart}`;
}

// GET /api/students
router.get('/', (req, res) => {
  const students = db.prepare(`
    SELECT s.id, s.name, s.email, s.branch, s.referral_code, s.source, s.created_at,
           c.name as college_name, cl.name as club_name, p.name as project_name,
           r.status as registration_status, pp.completed as project_completed
    FROM students s
    LEFT JOIN colleges c ON s.college_id = c.id
    LEFT JOIN clubs cl ON s.club_id = cl.id
    LEFT JOIN projects p ON s.project_id = p.id
    LEFT JOIN registrations r ON s.id = r.student_id
    LEFT JOIN project_progress pp ON s.id = pp.student_id
    ORDER BY s.created_at DESC
  `).all();
  res.json(students);
});

// POST /api/students/register
router.post('/register', (req, res) => {
  const { name, email, branch, graduation_year, college_id, club_id, project_id, squad_id, referred_by, source, medium, campaign } = req.body;

  if (!name || !email || !college_id || !project_id) {
    return res.status(400).json({ error: 'Name, email, college, and project are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const existing = db.prepare('SELECT id FROM students WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'This email is already registered.' });
  }

  // Validate referral
  let referrerStudent = null;
  if (referred_by) {
    referrerStudent = db.prepare('SELECT id, email FROM students WHERE referral_code = ?').get(referred_by);
    if (!referrerStudent) {
      return res.status(400).json({ error: 'Referral link is invalid.' });
    }
  }

  const studentId = uuidv4();
  let referralCode = generateReferralCode(name);
  // Ensure uniqueness
  while (db.prepare('SELECT id FROM students WHERE referral_code = ?').get(referralCode)) {
    referralCode = generateReferralCode(name);
  }

  const insertStudent = db.prepare(`
    INSERT INTO students (id, name, email, branch, graduation_year, college_id, club_id, project_id, squad_id, referral_code, referred_by, source, medium, campaign)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStudent.run(
    studentId, name, email.toLowerCase(), branch || null,
    graduation_year || 2025, college_id, club_id || null,
    project_id, squad_id || null, referralCode,
    referrerStudent ? referrerStudent.id : null,
    source || 'organic', medium || 'direct', campaign || 'ai-build-league'
  );

  // Create registration
  db.prepare('INSERT INTO registrations (id, student_id, status) VALUES (?, ?, ?)').run(uuidv4(), studentId, 'registered');

  // Create attendance record
  db.prepare('INSERT INTO attendance (id, student_id, attended) VALUES (?, ?, 0)').run(uuidv4(), studentId);

  // Create project progress record
  db.prepare('INSERT INTO project_progress (id, student_id, started, completed) VALUES (?, ?, 0, 0)').run(uuidv4(), studentId);

  // Record referral
  if (referrerStudent) {
    db.prepare('INSERT INTO referrals (id, referrer_student_id, referred_student_id) VALUES (?, ?, ?)').run(uuidv4(), referrerStudent.id, studentId);
  }

  // Log event
  db.prepare('INSERT INTO campaign_events (id, student_id, event_type, source, medium, campaign) VALUES (?, ?, ?, ?, ?, ?)').run(
    uuidv4(), studentId, 'registration_completed', source || 'organic', medium || 'direct', campaign || 'ai-build-league'
  );

  const student = db.prepare(`
    SELECT s.*, c.name as college_name, cl.name as club_name, p.name as project_name
    FROM students s
    LEFT JOIN colleges c ON s.college_id = c.id
    LEFT JOIN clubs cl ON s.club_id = cl.id
    LEFT JOIN projects p ON s.project_id = p.id
    WHERE s.id = ?
  `).get(studentId);

  res.status(201).json({ success: true, student, referral_code: referralCode });
});

// GET /api/students/by-email/:email
router.get('/by-email/:email', (req, res) => {
  const student = db.prepare('SELECT id FROM students WHERE email = ?').get(req.params.email.toLowerCase());
  if (!student) return res.status(404).json({ error: 'Student not found.' });
  res.json({ id: student.id });
});

// GET /api/students/:id
router.get('/:id', (req, res) => {
  const student = db.prepare(`
    SELECT s.*, c.name as college_name, c.city as college_city, cl.name as club_name,
           p.name as project_name, p.skills as project_skills, p.description as project_description,
           r.status as registration_status,
           a.attended,
           pp.started as project_started, pp.completed as project_completed, pp.completion_time
    FROM students s
    LEFT JOIN colleges c ON s.college_id = c.id
    LEFT JOIN clubs cl ON s.club_id = cl.id
    LEFT JOIN projects p ON s.project_id = p.id
    LEFT JOIN registrations r ON s.id = r.student_id
    LEFT JOIN attendance a ON s.id = a.student_id
    LEFT JOIN project_progress pp ON s.id = pp.student_id
    WHERE s.id = ?
  `).get(req.params.id);

  if (!student) return res.status(404).json({ error: 'Student not found.' });

  // Get referral stats
  const referralCount = db.prepare('SELECT COUNT(*) as count FROM referrals WHERE referrer_student_id = ?').get(req.params.id);
  const votes = db.prepare('SELECT COUNT(*) as count FROM project_votes WHERE student_id = ?').get(req.params.id);

  // Get college rank
  const collegeRank = getCollegeRank(student.college_id);

  res.json({ ...student, referral_count: referralCount.count, vote_count: votes.count, college_rank: collegeRank });
});

// GET /api/students/:id/referral
router.get('/:id/referral', (req, res) => {
  const referrals = db.prepare(`
    SELECT r.*, s.name, s.college_id, c.name as college_name
    FROM referrals r
    JOIN students s ON r.referred_student_id = s.id
    LEFT JOIN colleges c ON s.college_id = c.id
    WHERE r.referrer_student_id = ?
  `).all(req.params.id);
  res.json(referrals);
});

function getCollegeRank(collegeId) {
  const colleges = db.prepare('SELECT id FROM colleges').all();
  const scores = colleges.map(c => ({
    id: c.id,
    score: computeCollegeScore(c.id)
  })).sort((a, b) => b.score - a.score);
  const rank = scores.findIndex(c => c.id === collegeId) + 1;
  return rank || colleges.length;
}

function computeCollegeScore(collegeId) {
  const regs = db.prepare('SELECT COUNT(*) as c FROM students WHERE college_id = ?').get(collegeId).c;
  const att = db.prepare('SELECT COUNT(*) as c FROM attendance a JOIN students s ON a.student_id = s.id WHERE s.college_id = ? AND a.attended = 1').get(collegeId).c;
  const comp = db.prepare('SELECT COUNT(*) as c FROM project_progress pp JOIN students s ON pp.student_id = s.id WHERE s.college_id = ? AND pp.completed = 1').get(collegeId).c;
  const shares = db.prepare('SELECT COUNT(*) as c FROM shares sh JOIN students s ON sh.student_id = s.id WHERE s.college_id = ?').get(collegeId).c;
  const referrals = db.prepare('SELECT COUNT(*) as c FROM referrals r JOIN students s ON r.referrer_student_id = s.id WHERE s.college_id = ?').get(collegeId).c;

  return Math.round(
    regs * 0.30 +
    att * 0.25 +
    comp * 0.25 +
    shares * 0.10 +
    referrals * 0.10
  );
}

module.exports = router;
