const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET /api/leaderboard/colleges - single optimized query
router.get('/colleges', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id, c.name, c.city, c.demo_flag,
        COUNT(DISTINCT s.id)::int as registrations,
        COUNT(DISTINCT CASE WHEN a.attended = 1 THEN s.id ELSE NULL END)::int as attendance,
        COUNT(DISTINCT CASE WHEN pp.completed = 1 THEN s.id ELSE NULL END)::int as projects_completed,
        COUNT(DISTINCT sh.id)::int as shares,
        COUNT(DISTINCT r.id)::int as referrals,
        ROUND(
          COUNT(DISTINCT s.id) * 0.30 +
          COUNT(DISTINCT CASE WHEN a.attended = 1 THEN s.id ELSE NULL END) * 0.25 +
          COUNT(DISTINCT CASE WHEN pp.completed = 1 THEN s.id ELSE NULL END) * 0.25 +
          COUNT(DISTINCT sh.id) * 0.10 +
          COUNT(DISTINCT r.id) * 0.10
        )::int as growth_score
      FROM colleges c
      LEFT JOIN students s ON s.college_id = c.id
      LEFT JOIN attendance a ON a.student_id = s.id
      LEFT JOIN project_progress pp ON pp.student_id = s.id
      LEFT JOIN shares sh ON sh.student_id = s.id
      LEFT JOIN referrals r ON r.referrer_student_id = s.id
      GROUP BY c.id, c.name, c.city, c.demo_flag
      ORDER BY growth_score DESC
    `);
    const ranked = result.rows.map((c, i) => ({ ...c, rank: i + 1 }));
    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leaderboard/clubs - single optimized query
router.get('/clubs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        cl.id, cl.name, cl.college_id, cl.demo_flag,
        c.name as college_name,
        COUNT(DISTINCT s.id)::int as registrations,
        COUNT(DISTINCT CASE WHEN a.attended = 1 THEN s.id ELSE NULL END)::int as attendance,
        COUNT(DISTINCT CASE WHEN pp.completed = 1 THEN s.id ELSE NULL END)::int as projects_completed,
        COUNT(DISTINCT sh.id)::int as shares,
        COUNT(DISTINCT r.id)::int as referrals,
        ROUND(
          COUNT(DISTINCT s.id) * 0.30 +
          COUNT(DISTINCT CASE WHEN a.attended = 1 THEN s.id ELSE NULL END) * 0.25 +
          COUNT(DISTINCT CASE WHEN pp.completed = 1 THEN s.id ELSE NULL END) * 0.25 +
          COUNT(DISTINCT sh.id) * 0.10 +
          COUNT(DISTINCT r.id) * 0.10
        )::int as growth_score
      FROM clubs cl
      JOIN colleges c ON cl.college_id = c.id
      LEFT JOIN students s ON s.club_id = cl.id
      LEFT JOIN attendance a ON a.student_id = s.id
      LEFT JOIN project_progress pp ON pp.student_id = s.id
      LEFT JOIN shares sh ON sh.student_id = s.id
      LEFT JOIN referrals r ON r.referrer_student_id = s.id
      GROUP BY cl.id, cl.name, cl.college_id, cl.demo_flag, c.name
      ORDER BY growth_score DESC
    `);
    const ranked = result.rows.map((c, i) => ({ ...c, rank: i + 1 }));
    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leaderboard/students
router.get('/students', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, s.name, s.referral_code,
             c.name as college_name, cl.name as club_name,
             pp.completed, pp.completion_time,
             (SELECT COUNT(*)::int FROM referrals r WHERE r.referrer_student_id = s.id) as referral_count,
             (SELECT COUNT(*)::int FROM project_votes pv WHERE pv.student_id = s.id) as votes,
             (SELECT COUNT(*)::int FROM shares sh WHERE sh.student_id = s.id) as share_count
      FROM students s
      LEFT JOIN colleges c ON s.college_id = c.id
      LEFT JOIN clubs cl ON s.club_id = cl.id
      LEFT JOIN project_progress pp ON s.id = pp.student_id
      WHERE pp.completed = 1
      ORDER BY votes DESC, referral_count DESC
      LIMIT 50
    `);
    res.json(result.rows.map((s, i) => ({ ...s, rank: i + 1 })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/leaderboard/squads
router.get('/squads', async (req, res) => {
  try {
    const squads = (await pool.query(`
      SELECT sq.*, c.name as college_name,
             (SELECT COUNT(*)::int FROM squad_members sm WHERE sm.squad_id = sq.id) as member_count
      FROM squads sq
      JOIN colleges c ON sq.college_id = c.id
    `)).rows;

    const scored = await Promise.all(squads.map(async sq => {
      const members = (await pool.query('SELECT student_id FROM squad_members WHERE squad_id = $1', [sq.id])).rows;
      let totalComp = 0, totalRefs = 0;
      for (const m of members) {
        const prog = (await pool.query('SELECT completed FROM project_progress WHERE student_id = $1', [m.student_id])).rows[0];
        if (prog && prog.completed) totalComp++;
        const refs = parseInt((await pool.query('SELECT COUNT(*)::int as c FROM referrals WHERE referrer_student_id = $1', [m.student_id])).rows[0].c);
        totalRefs += refs;
      }
      const score = Math.round(members.length * 30 + totalComp * 40 + totalRefs * 30);
      return { ...sq, projects_completed: totalComp, referrals: totalRefs, growth_score: score };
    }));

    const ranked = scored.sort((a, b) => b.growth_score - a.growth_score).map((s, i) => ({ ...s, rank: i + 1 }));
    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
