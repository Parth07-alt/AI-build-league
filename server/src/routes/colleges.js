const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET /api/colleges
router.get('/', async (req, res) => {
  try {
    const colleges = (await pool.query('SELECT * FROM colleges ORDER BY name')).rows;
    res.json(colleges);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/colleges/:id
router.get('/:id', async (req, res) => {
  try {
    const college = (await pool.query('SELECT * FROM colleges WHERE id = $1', [req.params.id])).rows[0];
    if (!college) return res.status(404).json({ error: 'College not found.' });

    const statsResult = await pool.query(`
      SELECT
        COUNT(DISTINCT s.id)::int as registrations,
        COUNT(DISTINCT CASE WHEN a.attended = 1 THEN s.id END)::int as attendance,
        COUNT(DISTINCT CASE WHEN pp.started = 1 THEN s.id END)::int as projects_started,
        COUNT(DISTINCT CASE WHEN pp.completed = 1 THEN s.id END)::int as projects_completed,
        COUNT(DISTINCT sh.id)::int as shares,
        COUNT(DISTINCT r.id)::int as referrals,
        ROUND(
          COUNT(DISTINCT s.id) * 0.30 +
          COUNT(DISTINCT CASE WHEN a.attended = 1 THEN s.id END) * 0.25 +
          COUNT(DISTINCT CASE WHEN pp.completed = 1 THEN s.id END) * 0.25 +
          COUNT(DISTINCT sh.id) * 0.10 +
          COUNT(DISTINCT r.id) * 0.10
        )::int as growth_score
      FROM students s
      LEFT JOIN attendance a ON a.student_id = s.id
      LEFT JOIN project_progress pp ON pp.student_id = s.id
      LEFT JOIN shares sh ON sh.student_id = s.id
      LEFT JOIN referrals r ON r.referrer_student_id = s.id
      WHERE s.college_id = $1
    `, [req.params.id]);

    const stats = statsResult.rows[0];
    res.json({ ...college, ...stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
