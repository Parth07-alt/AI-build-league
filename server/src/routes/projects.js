const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

// GET /api/projects
router.get('/', (req, res) => {
  const projects = db.prepare('SELECT * FROM projects').all();
  res.json(projects);
});

// GET /api/projects/:id
router.get('/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });
  res.json(project);
});

// GET /api/projects/:id/passport (student's project passport)
router.get('/:studentId/passport', (req, res) => {
  const student = db.prepare(`
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
    WHERE s.id = ?
  `).get(req.params.studentId);

  if (!student) return res.status(404).json({ error: 'Student not found.' });
  res.json(student);
});

// POST /api/projects/:id/vote
router.post('/:studentId/vote', (req, res) => {
  const { voter_identifier } = req.body;
  if (!voter_identifier) return res.status(400).json({ error: 'Voter identifier required.' });

  const existing = db.prepare('SELECT id FROM project_votes WHERE student_id = ? AND voter_identifier = ?').get(req.params.studentId, voter_identifier);
  if (existing) return res.status(409).json({ error: 'You have already voted for this project.' });

  db.prepare('INSERT INTO project_votes (id, student_id, voter_identifier) VALUES (?, ?, ?)').run(uuidv4(), req.params.studentId, voter_identifier);

  const count = db.prepare('SELECT COUNT(*) as c FROM project_votes WHERE student_id = ?').get(req.params.studentId);
  res.json({ success: true, votes: count.c });
});

// POST /api/projects/:id/share
router.post('/:studentId/share', (req, res) => {
  const { platform } = req.body;
  if (!platform) return res.status(400).json({ error: 'Platform required.' });

  db.prepare('INSERT INTO shares (id, student_id, platform) VALUES (?, ?, ?)').run(uuidv4(), req.params.studentId, platform);
  db.prepare('INSERT INTO campaign_events (id, student_id, event_type, source, medium) VALUES (?, ?, ?, ?, ?)').run(uuidv4(), req.params.studentId, 'project_shared', platform, 'share');

  res.json({ success: true });
});

// GET /api/projects/wall/all - public project wall
router.get('/wall/all', (req, res) => {
  const { college, project_type, skill, sort } = req.query;

  let query = `
    SELECT s.id, s.name as student_name, s.referral_code,
           c.name as college_name, c.city,
           cl.name as club_name,
           p.name as project_name, p.skills, p.difficulty,
           pp.completed, pp.completion_time, pp.completed_at,
           (SELECT COUNT(*) FROM project_votes pv WHERE pv.student_id = s.id) as votes
    FROM students s
    LEFT JOIN colleges c ON s.college_id = c.id
    LEFT JOIN clubs cl ON s.club_id = cl.id
    LEFT JOIN projects p ON s.project_id = p.id
    LEFT JOIN project_progress pp ON s.id = pp.student_id
    WHERE pp.started = 1
  `;

  const params = [];
  if (college) { query += ' AND c.name LIKE ?'; params.push(`%${college}%`); }
  if (project_type) { query += ' AND p.name LIKE ?'; params.push(`%${project_type}%`); }

  if (sort === 'popular') {
    query += ' ORDER BY votes DESC';
  } else {
    query += ' ORDER BY pp.completed_at DESC NULLS LAST, s.created_at DESC';
  }

  query += ' LIMIT 100';

  const projects = db.prepare(query).all(...params);
  res.json(projects);
});

module.exports = router;
