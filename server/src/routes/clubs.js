const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET /api/clubs?collegeId=
router.get('/', async (req, res) => {
  try {
    const { collegeId } = req.query;
    let clubs;
    if (collegeId) {
      clubs = (await pool.query('SELECT cl.*, c.name as college_name FROM clubs cl JOIN colleges c ON cl.college_id = c.id WHERE cl.college_id = $1 ORDER BY cl.name', [collegeId])).rows;
    } else {
      clubs = (await pool.query('SELECT cl.*, c.name as college_name FROM clubs cl JOIN colleges c ON cl.college_id = c.id ORDER BY c.name, cl.name')).rows;
    }
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/clubs/:id
router.get('/:id', async (req, res) => {
  try {
    const club = (await pool.query('SELECT cl.*, c.name as college_name, c.city FROM clubs cl JOIN colleges c ON cl.college_id = c.id WHERE cl.id = $1', [req.params.id])).rows[0];
    if (!club) return res.status(404).json({ error: 'Club not found.' });

    const statsResult = await pool.query(`
      SELECT
        COUNT(DISTINCT s.id)::int as registrations,
        COUNT(DISTINCT CASE WHEN a.attended = 1 THEN s.id END)::int as attendance,
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
      WHERE s.club_id = $1
    `, [req.params.id]);

    const stats = statsResult.rows[0];

    // Get rank
    const allClubsStats = await pool.query(`
      SELECT cl.id,
        ROUND(
          COUNT(DISTINCT s.id) * 0.30 +
          COUNT(DISTINCT CASE WHEN a.attended = 1 THEN s.id END) * 0.25 +
          COUNT(DISTINCT CASE WHEN pp.completed = 1 THEN s.id END) * 0.25 +
          COUNT(DISTINCT sh.id) * 0.10 +
          COUNT(DISTINCT r.id) * 0.10
        )::int as score
      FROM clubs cl
      LEFT JOIN students s ON s.club_id = cl.id
      LEFT JOIN attendance a ON a.student_id = s.id
      LEFT JOIN project_progress pp ON pp.student_id = s.id
      LEFT JOIN shares sh ON sh.student_id = s.id
      LEFT JOIN referrals r ON r.referrer_student_id = s.id
      GROUP BY cl.id
      ORDER BY score DESC
    `);
    const rank = allClubsStats.rows.findIndex(c => c.id === req.params.id) + 1;

    res.json({ ...club, ...stats, rank: rank || allClubsStats.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
