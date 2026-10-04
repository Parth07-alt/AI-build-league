const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/dashboard/overview
router.get('/overview', (req, res) => {
  const target = 500;
  const totalRegs = db.prepare('SELECT COUNT(*) as c FROM registrations').get().c;
  const attended = db.prepare('SELECT COUNT(*) as c FROM attendance WHERE attended = 1').get().c;
  const projectsStarted = db.prepare('SELECT COUNT(*) as c FROM project_progress WHERE started = 1').get().c;
  const projectsCompleted = db.prepare('SELECT COUNT(*) as c FROM project_progress WHERE completed = 1').get().c;
  const referralRegs = db.prepare('SELECT COUNT(*) as c FROM referrals').get().c;
  const shares = db.prepare('SELECT COUNT(*) as c FROM shares').get().c;
  const qualifiedRegs = attended; // Attended = qualified

  // Top campus
  const colleges = db.prepare('SELECT id, name FROM colleges').all();
  let topCollege = null, topCollegeScore = 0;
  colleges.forEach(c => {
    const regs = db.prepare('SELECT COUNT(*) as c FROM students WHERE college_id = ?').get(c.id).c;
    if (regs > topCollegeScore) { topCollegeScore = regs; topCollege = c.name; }
  });

  // Top club
  const clubs = db.prepare('SELECT id, name FROM clubs').all();
  let topClub = null, topClubCount = 0;
  clubs.forEach(cl => {
    const regs = db.prepare('SELECT COUNT(*) as c FROM students WHERE club_id = ?').get(cl.id).c;
    if (regs > topClubCount) { topClubCount = regs; topClub = cl.name; }
  });

  // Best channel
  const channels = db.prepare('SELECT source, COUNT(*) as c FROM students GROUP BY source ORDER BY c DESC LIMIT 1').get();

  res.json({
    target,
    registrations: totalRegs,
    progress_pct: Math.round((totalRegs / target) * 100),
    qualified_registrations: qualifiedRegs,
    attendance: attended,
    projects_started: projectsStarted,
    projects_completed: projectsCompleted,
    referral_registrations: referralRegs,
    shares,
    top_campus: topCollege,
    top_club: topClub,
    best_channel: channels ? channels.source : 'student_club',
    is_demo: true
  });
});

// GET /api/dashboard/funnel
router.get('/funnel', (req, res) => {
  const totalRegs = db.prepare('SELECT COUNT(*) as c FROM registrations').get().c;
  const attended = db.prepare('SELECT COUNT(*) as c FROM attendance WHERE attended = 1').get().c;
  const projectsStarted = db.prepare('SELECT COUNT(*) as c FROM project_progress WHERE started = 1').get().c;
  const projectsCompleted = db.prepare('SELECT COUNT(*) as c FROM project_progress WHERE completed = 1').get().c;
  const shares = db.prepare('SELECT COUNT(*) as c FROM shares').get().c;
  const referrals = db.prepare('SELECT COUNT(*) as c FROM referrals').get().c;

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
});

// GET /api/dashboard/channels
router.get('/channels', (req, res) => {
  const channels = db.prepare('SELECT source, COUNT(*) as count FROM students GROUP BY source ORDER BY count DESC').all();
  res.json(channels);
});

// GET /api/dashboard/projects
router.get('/projects', (req, res) => {
  const projects = db.prepare(`
    SELECT p.id, p.name,
           COUNT(s.id) as total_selected,
           SUM(CASE WHEN pp.started = 1 THEN 1 ELSE 0 END) as started,
           SUM(CASE WHEN pp.completed = 1 THEN 1 ELSE 0 END) as completed
    FROM projects p
    LEFT JOIN students s ON s.project_id = p.id
    LEFT JOIN project_progress pp ON pp.student_id = s.id
    GROUP BY p.id, p.name
    ORDER BY total_selected DESC
  `).all();
  res.json(projects);
});

// GET /api/dashboard/colleges
router.get('/colleges', (req, res) => {
  const colleges = db.prepare('SELECT * FROM colleges').all();
  const data = colleges.map(c => {
    const regs = db.prepare('SELECT COUNT(*) as c FROM students WHERE college_id = ?').get(c.id).c;
    const att = db.prepare('SELECT COUNT(*) as c FROM attendance a JOIN students s ON a.student_id = s.id WHERE s.college_id = ? AND a.attended = 1').get(c.id).c;
    const comp = db.prepare('SELECT COUNT(*) as c FROM project_progress pp JOIN students s ON pp.student_id = s.id WHERE s.college_id = ? AND pp.completed = 1').get(c.id).c;
    const shares = db.prepare('SELECT COUNT(*) as c FROM shares sh JOIN students s ON sh.student_id = s.id WHERE s.college_id = ?').get(c.id).c;
    return { ...c, registrations: regs, attendance: att, completions: comp, shares };
  }).sort((a, b) => b.registrations - a.registrations);
  res.json(data);
});

// GET /api/dashboard/clubs
router.get('/clubs', (req, res) => {
  const clubs = db.prepare('SELECT cl.*, c.name as college_name FROM clubs cl JOIN colleges c ON cl.college_id = c.id').all();
  const data = clubs.map(cl => {
    const regs = db.prepare('SELECT COUNT(*) as c FROM students WHERE club_id = ?').get(cl.id).c;
    const comp = db.prepare('SELECT COUNT(*) as c FROM project_progress pp JOIN students s ON pp.student_id = s.id WHERE s.club_id = ? AND pp.completed = 1').get(cl.id).c;
    return { ...cl, registrations: regs, completions: comp };
  }).sort((a, b) => b.registrations - a.registrations);
  res.json(data);
});

// GET /api/dashboard/referrals
router.get('/referrals', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as c FROM referrals').get().c;
  const topReferrers = db.prepare(`
    SELECT s.name, s.referral_code, COUNT(r.id) as referral_count,
           c.name as college_name
    FROM students s
    LEFT JOIN referrals r ON r.referrer_student_id = s.id
    LEFT JOIN colleges c ON s.college_id = c.id
    GROUP BY s.id
    HAVING referral_count > 0
    ORDER BY referral_count DESC
    LIMIT 10
  `).all();
  res.json({ total, top_referrers: topReferrers });
});

// GET /api/dashboard/daily - daily registration trend
router.get('/daily', (req, res) => {
  const data = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as registrations
    FROM students
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all();
  res.json(data);
});

module.exports = router;
