const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET /api/dashboard/overview
router.get('/overview', async (req, res) => {
  try {
    const target = 500;
    const q = async (sql, params = []) => parseInt((await pool.query(sql, params)).rows[0]?.c || 0);

    const totalRegs = await q('SELECT COUNT(*)::int as c FROM registrations');
    const attended = await q('SELECT COUNT(*)::int as c FROM attendance WHERE attended = 1');
    const projectsStarted = await q('SELECT COUNT(*)::int as c FROM project_progress WHERE started = 1');
    const projectsCompleted = await q('SELECT COUNT(*)::int as c FROM project_progress WHERE completed = 1');
    const referralRegs = await q('SELECT COUNT(*)::int as c FROM referrals');
    const shares = await q('SELECT COUNT(*)::int as c FROM shares');

    // Top campus
    const topCampusResult = await pool.query(`
      SELECT c.name, COUNT(s.id)::int as cnt
      FROM colleges c LEFT JOIN students s ON s.college_id = c.id
      GROUP BY c.id, c.name ORDER BY cnt DESC LIMIT 1
    `);
    const topCollege = topCampusResult.rows[0]?.name || null;

    // Top club
    const topClubResult = await pool.query(`
      SELECT cl.name, COUNT(s.id)::int as cnt
      FROM clubs cl LEFT JOIN students s ON s.club_id = cl.id
      GROUP BY cl.id, cl.name ORDER BY cnt DESC LIMIT 1
    `);
    const topClub = topClubResult.rows[0]?.name || null;

    // Best channel
    const channelResult = await pool.query('SELECT source FROM students GROUP BY source ORDER BY COUNT(*) DESC LIMIT 1');
    const bestChannel = channelResult.rows[0]?.source || 'student_club';

    res.json({
      target, registrations: totalRegs,
      progress_pct: Math.round((totalRegs / target) * 100),
      qualified_registrations: attended,
      attendance: attended,
      projects_started: projectsStarted,
      projects_completed: projectsCompleted,
      referral_registrations: referralRegs,
      shares,
      top_campus: topCollege,
      top_club: topClub,
      best_channel: bestChannel,
      is_demo: true
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/funnel
router.get('/funnel', async (req, res) => {
  try {
    const q = async (sql) => parseInt((await pool.query(sql)).rows[0]?.c || 0);
    const totalRegs = await q('SELECT COUNT(*)::int as c FROM registrations');
    const attended = await q('SELECT COUNT(*)::int as c FROM attendance WHERE attended = 1');
    const projectsStarted = await q('SELECT COUNT(*)::int as c FROM project_progress WHERE started = 1');
    const projectsCompleted = await q('SELECT COUNT(*)::int as c FROM project_progress WHERE completed = 1');
    const shares = await q('SELECT COUNT(*)::int as c FROM shares');
    const referrals = await q('SELECT COUNT(*)::int as c FROM referrals');

    res.json([
      { stage: 'Community Reach', value: 10000, label: 'Illustrative planning estimate' },
      { stage: 'Landing Visits', value: 1500, label: 'Illustrative planning estimate' },
      { stage: 'Registrations', value: totalRegs, label: 'Actual demo data' },
      { stage: 'Qualified (Attended)', value: attended, label: 'Actual demo data' },
      { stage: 'Project Started', value: projectsStarted, label: 'Actual demo data' },
      { stage: 'Project Completed', value: projectsCompleted, label: 'Actual demo data' },
      { stage: 'Project Shared', value: shares, label: 'Actual demo data' },
      { stage: 'Referral Registrations', value: referrals, label: 'Actual demo data' },
    ]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/channels
router.get('/channels', async (req, res) => {
  try {
    const result = await pool.query('SELECT source, COUNT(*)::int as count FROM students GROUP BY source ORDER BY count DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/projects
router.get('/projects', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.name,
             COUNT(s.id)::int as total_selected,
             SUM(CASE WHEN pp.started = 1 THEN 1 ELSE 0 END)::int as started,
             SUM(CASE WHEN pp.completed = 1 THEN 1 ELSE 0 END)::int as completed
      FROM projects p
      LEFT JOIN students s ON s.project_id = p.id
      LEFT JOIN project_progress pp ON pp.student_id = s.id
      GROUP BY p.id, p.name
      ORDER BY total_selected DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/colleges
router.get('/colleges', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.name, c.city, c.demo_flag,
             COUNT(DISTINCT s.id)::int as registrations,
             COUNT(DISTINCT CASE WHEN a.attended = 1 THEN s.id END)::int as attendance,
             COUNT(DISTINCT CASE WHEN pp.completed = 1 THEN s.id END)::int as completions,
             COUNT(DISTINCT sh.id)::int as shares
      FROM colleges c
      LEFT JOIN students s ON s.college_id = c.id
      LEFT JOIN attendance a ON a.student_id = s.id
      LEFT JOIN project_progress pp ON pp.student_id = s.id
      LEFT JOIN shares sh ON sh.student_id = s.id
      GROUP BY c.id, c.name, c.city, c.demo_flag
      ORDER BY registrations DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/clubs
router.get('/clubs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cl.id, cl.name, cl.college_id, cl.demo_flag,
             c.name as college_name,
             COUNT(DISTINCT s.id)::int as registrations,
             COUNT(DISTINCT CASE WHEN pp.completed = 1 THEN s.id END)::int as completions
      FROM clubs cl
      JOIN colleges c ON cl.college_id = c.id
      LEFT JOIN students s ON s.club_id = cl.id
      LEFT JOIN project_progress pp ON pp.student_id = s.id
      GROUP BY cl.id, cl.name, cl.college_id, cl.demo_flag, c.name
      ORDER BY registrations DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/referrals
router.get('/referrals', async (req, res) => {
  try {
    const total = parseInt((await pool.query('SELECT COUNT(*)::int as c FROM referrals')).rows[0].c);
    const topReferrers = (await pool.query(`
      SELECT s.name, s.referral_code, COUNT(r.id)::int as referral_count,
             c.name as college_name
      FROM students s
      LEFT JOIN referrals r ON r.referrer_student_id = s.id
      LEFT JOIN colleges c ON s.college_id = c.id
      GROUP BY s.id, s.name, s.referral_code, c.name
      HAVING COUNT(r.id) > 0
      ORDER BY referral_count DESC
      LIMIT 10
    `)).rows;
    res.json({ total, top_referrers: topReferrers });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/daily
router.get('/daily', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*)::int as registrations
      FROM students
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
