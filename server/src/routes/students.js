const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/database');

function generateReferralCode(name) {
  const namePart = name.split(' ')[0].toUpperCase().slice(0, 6);
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${namePart}-${randomPart}`;
}

async function getCollegeRank(collegeId) {
  const result = await pool.query(`
    SELECT c.id,
      ROUND(
        COUNT(DISTINCT s.id) * 0.30 +
        COUNT(DISTINCT CASE WHEN a.attended = 1 THEN s.id ELSE NULL END) * 0.25 +
        COUNT(DISTINCT CASE WHEN pp.completed = 1 THEN s.id ELSE NULL END) * 0.25 +
        COUNT(DISTINCT sh.id) * 0.10 +
        COUNT(DISTINCT r.id) * 0.10
      )::int as score
    FROM colleges c
    LEFT JOIN students s ON s.college_id = c.id
    LEFT JOIN attendance a ON a.student_id = s.id
    LEFT JOIN project_progress pp ON pp.student_id = s.id
    LEFT JOIN shares sh ON sh.student_id = s.id
    LEFT JOIN referrals r ON r.referrer_student_id = s.id
    GROUP BY c.id
    ORDER BY score DESC
  `);
  const rank = result.rows.findIndex(c => c.id === collegeId) + 1;
  return rank || result.rows.length;
}

// GET /api/students
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
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
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/students/register
router.post('/register', async (req, res) => {
  const { name, email, branch, graduation_year, college_id, club_id, project_id, squad_id, referred_by, source, medium, campaign } = req.body;

  if (!name || !email || !college_id || !project_id) {
    return res.status(400).json({ error: 'Name, email, college, and project are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    const existing = (await pool.query('SELECT id FROM students WHERE email = $1', [email.toLowerCase()])).rows[0];
    if (existing) return res.status(409).json({ error: 'This email is already registered.' });

    let referrerStudent = null;
    if (referred_by) {
      referrerStudent = (await pool.query('SELECT id, email FROM students WHERE referral_code = $1', [referred_by])).rows[0];
      if (!referrerStudent) return res.status(400).json({ error: 'Referral link is invalid.' });
    }

    const studentId = uuidv4();
    let referralCode = generateReferralCode(name);
    let codeExists = (await pool.query('SELECT id FROM students WHERE referral_code = $1', [referralCode])).rows[0];
    while (codeExists) {
      referralCode = generateReferralCode(name);
      codeExists = (await pool.query('SELECT id FROM students WHERE referral_code = $1', [referralCode])).rows[0];
    }

    await pool.query(
      `INSERT INTO students (id, name, email, branch, graduation_year, college_id, club_id, project_id, squad_id, referral_code, referred_by, source, medium, campaign)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [studentId, name, email.toLowerCase(), branch || null, graduation_year || 2025,
       college_id, club_id || null, project_id, squad_id || null, referralCode,
       referrerStudent ? referrerStudent.id : null,
       source || 'organic', medium || 'direct', campaign || 'ai-build-league']
    );

    await pool.query('INSERT INTO registrations (id, student_id, status) VALUES ($1,$2,$3)', [uuidv4(), studentId, 'registered']);
    await pool.query('INSERT INTO attendance (id, student_id, attended) VALUES ($1,$2,0)', [uuidv4(), studentId]);
    await pool.query('INSERT INTO project_progress (id, student_id, started, completed) VALUES ($1,$2,0,0)', [uuidv4(), studentId]);

    if (referrerStudent) {
      await pool.query('INSERT INTO referrals (id, referrer_student_id, referred_student_id) VALUES ($1,$2,$3)', [uuidv4(), referrerStudent.id, studentId]);
    }

    await pool.query(
      'INSERT INTO campaign_events (id, student_id, event_type, source, medium, campaign) VALUES ($1,$2,$3,$4,$5,$6)',
      [uuidv4(), studentId, 'registration_completed', source || 'organic', medium || 'direct', campaign || 'ai-build-league']
    );

    const student = (await pool.query(`
      SELECT s.*, c.name as college_name, cl.name as club_name, p.name as project_name
      FROM students s
      LEFT JOIN colleges c ON s.college_id = c.id
      LEFT JOIN clubs cl ON s.club_id = cl.id
      LEFT JOIN projects p ON s.project_id = p.id
      WHERE s.id = $1
    `, [studentId])).rows[0];

    res.status(201).json({ success: true, student, referral_code: referralCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/students/by-email/:email
router.get('/by-email/:email', async (req, res) => {
  try {
    const student = (await pool.query('SELECT id FROM students WHERE email = $1', [req.params.email.toLowerCase()])).rows[0];
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json({ id: student.id });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/students/:id
router.get('/:id', async (req, res) => {
  try {
    const student = (await pool.query(`
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
      WHERE s.id = $1
    `, [req.params.id])).rows[0];

    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const referralCount = parseInt((await pool.query('SELECT COUNT(*)::int as count FROM referrals WHERE referrer_student_id = $1', [req.params.id])).rows[0].count);
    const votes = parseInt((await pool.query('SELECT COUNT(*)::int as count FROM project_votes WHERE student_id = $1', [req.params.id])).rows[0].count);
    const collegeRank = await getCollegeRank(student.college_id);

    res.json({ ...student, referral_count: referralCount, vote_count: votes, college_rank: collegeRank });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/students/:id/referral
router.get('/:id/referral', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, s.name, s.college_id, c.name as college_name
      FROM referrals r
      JOIN students s ON r.referred_student_id = s.id
      LEFT JOIN colleges c ON s.college_id = c.id
      WHERE r.referrer_student_id = $1
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
