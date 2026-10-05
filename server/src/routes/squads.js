const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/database');

// POST /api/squads
router.post('/', async (req, res) => {
  const { name, college_id, created_by } = req.body;
  if (!name || !college_id || !created_by) {
    return res.status(400).json({ error: 'Name, college, and creator are required.' });
  }

  const squadId = uuidv4();
  try {
    await pool.query('INSERT INTO squads (id, name, college_id, created_by) VALUES ($1, $2, $3, $4)', [squadId, name, college_id, created_by]);

    // Add creator as first member
    try {
      await pool.query('INSERT INTO squad_members (id, squad_id, student_id) VALUES ($1, $2, $3)', [uuidv4(), squadId, created_by]);
    } catch (e) {}

    const squad = (await pool.query('SELECT sq.*, c.name as college_name FROM squads sq JOIN colleges c ON sq.college_id = c.id WHERE sq.id = $1', [squadId])).rows[0];
    res.status(201).json(squad);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/squads/:id/join
router.post('/:id/join', async (req, res) => {
  const { student_id } = req.body;
  if (!student_id) return res.status(400).json({ error: 'Student ID required.' });

  try {
    const squad = (await pool.query('SELECT * FROM squads WHERE id = $1', [req.params.id])).rows[0];
    if (!squad) return res.status(404).json({ error: 'Squad not found.' });

    const memberCount = parseInt((await pool.query('SELECT COUNT(*)::int as c FROM squad_members WHERE squad_id = $1', [req.params.id])).rows[0].c);
    if (memberCount >= 5) return res.status(400).json({ error: 'Squad is full (max 5 members).' });

    const alreadyMember = (await pool.query('SELECT id FROM squad_members WHERE squad_id = $1 AND student_id = $2', [req.params.id, student_id])).rows[0];
    if (alreadyMember) return res.status(409).json({ error: 'Already a member of this squad.' });

    await pool.query('INSERT INTO squad_members (id, squad_id, student_id) VALUES ($1, $2, $3)', [uuidv4(), req.params.id, student_id]);
    await pool.query('UPDATE students SET squad_id = $1 WHERE id = $2', [req.params.id, student_id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/squads/:id
router.get('/:id', async (req, res) => {
  try {
    const squad = (await pool.query(`
      SELECT sq.*, c.name as college_name,
             (SELECT COUNT(*)::int FROM squad_members sm WHERE sm.squad_id = sq.id) as member_count
      FROM squads sq
      JOIN colleges c ON sq.college_id = c.id
      WHERE sq.id = $1
    `, [req.params.id])).rows[0];

    if (!squad) return res.status(404).json({ error: 'Squad not found.' });

    const members = (await pool.query(`
      SELECT s.id, s.name, s.referral_code, p.name as project_name,
             pp.completed, pp.completion_time
      FROM squad_members sm
      JOIN students s ON sm.student_id = s.id
      LEFT JOIN projects p ON s.project_id = p.id
      LEFT JOIN project_progress pp ON s.id = pp.student_id
      WHERE sm.squad_id = $1
    `, [req.params.id])).rows;

    res.json({ ...squad, members });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/squads - list squads for a college
router.get('/', async (req, res) => {
  const { college_id } = req.query;
  try {
    let squads;
    if (college_id) {
      squads = (await pool.query(`
        SELECT sq.*, c.name as college_name,
               (SELECT COUNT(*)::int FROM squad_members sm WHERE sm.squad_id = sq.id) as member_count
        FROM squads sq
        JOIN colleges c ON sq.college_id = c.id
        WHERE sq.college_id = $1
        ORDER BY sq.created_at DESC
      `, [college_id])).rows;
    } else {
      squads = (await pool.query(`
        SELECT sq.*, c.name as college_name,
               (SELECT COUNT(*)::int FROM squad_members sm WHERE sm.squad_id = sq.id) as member_count
        FROM squads sq
        JOIN colleges c ON sq.college_id = c.id
        ORDER BY sq.created_at DESC
        LIMIT 30
      `)).rows;
    }
    res.json(squads);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
