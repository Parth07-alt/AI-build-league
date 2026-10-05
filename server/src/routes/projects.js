const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../db/database');

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    const project = (await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id])).rows[0];
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projects/:id/passport (student's project passport)
router.get('/:studentId/passport', async (req, res) => {
  try {
    const student = (await pool.query(`
      SELECT s.id, s.name, s.referral_code,
             c.name as college_name, c.city,
             cl.name as club_name,
             p.name as project_name, p.skills, p.description,
             pp.completion_time, pp.completed, pp.completed_at
      FROM students s
      LEFT JOIN colleges c ON s.college_id = c.id
      LEFT JOIN clubs cl ON s.club_id = cl.id
      LEFT JOIN projects p ON s.project_id = p.id
      LEFT JOIN project_progress pp ON s.id = pp.student_id
      WHERE s.id = $1
    `, [req.params.studentId])).rows[0];

    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/projects/:id/vote
router.post('/:studentId/vote', async (req, res) => {
  const { voter_identifier } = req.body;
  if (!voter_identifier) return res.status(400).json({ error: 'Voter identifier required.' });

  try {
    const existing = (await pool.query('SELECT id FROM project_votes WHERE student_id = $1 AND voter_identifier = $2', [req.params.studentId, voter_identifier])).rows[0];
    if (existing) return res.status(409).json({ error: 'You have already voted for this project.' });

    await pool.query('INSERT INTO project_votes (id, student_id, voter_identifier) VALUES ($1, $2, $3)', [uuidv4(), req.params.studentId, voter_identifier]);

    const count = parseInt((await pool.query('SELECT COUNT(*)::int as c FROM project_votes WHERE student_id = $1', [req.params.studentId])).rows[0].c);
    res.json({ success: true, votes: count });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/projects/:id/share
router.post('/:studentId/share', async (req, res) => {
  const { platform } = req.body;
  if (!platform) return res.status(400).json({ error: 'Platform required.' });

  try {
    await pool.query('INSERT INTO shares (id, student_id, platform) VALUES ($1, $2, $3)', [uuidv4(), req.params.studentId, platform]);
    await pool.query('INSERT INTO campaign_events (id, student_id, event_type, source, medium) VALUES ($1, $2, $3, $4, $5)', [uuidv4(), req.params.studentId, 'project_shared', platform, 'share']);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projects/wall/all - public project wall
router.get('/wall/all', async (req, res) => {
  try {
    const { college, project_type, skill, sort } = req.query;

    let query = `
      SELECT s.id, s.name as student_name, s.referral_code,
             c.name as college_name, c.city,
             cl.name as club_name,
             p.name as project_name, p.skills, p.difficulty,
             pp.completed, pp.completion_time, pp.completed_at,
             (SELECT COUNT(*)::int FROM project_votes pv WHERE pv.student_id = s.id) as votes
      FROM students s
      LEFT JOIN colleges c ON s.college_id = c.id
      LEFT JOIN clubs cl ON s.club_id = cl.id
      LEFT JOIN projects p ON s.project_id = p.id
      LEFT JOIN project_progress pp ON s.id = pp.student_id
      WHERE pp.started = 1
    `;

    const params = [];
    let paramIndex = 1;

    if (college) { 
      query += ` AND c.name ILIKE $${paramIndex}`; 
      params.push(`%${college}%`); 
      paramIndex++;
    }
    if (project_type) { 
      query += ` AND p.name ILIKE $${paramIndex}`; 
      params.push(`%${project_type}%`); 
      paramIndex++;
    }

    if (sort === 'popular') {
      query += ' ORDER BY votes DESC';
    } else {
      query += ' ORDER BY pp.completed_at DESC NULLS LAST, s.created_at DESC';
    }

    query += ' LIMIT 100';

    const projects = (await pool.query(query, params)).rows;
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
