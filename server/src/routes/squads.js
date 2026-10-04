const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');

// POST /api/squads
router.post('/', (req, res) => {
  const { name, college_id, created_by } = req.body;
  if (!name || !college_id || !created_by) {
    return res.status(400).json({ error: 'Name, college, and creator are required.' });
  }

  const squadId = uuidv4();
  db.prepare('INSERT INTO squads (id, name, college_id, created_by) VALUES (?, ?, ?, ?)').run(squadId, name, college_id, created_by);

  // Add creator as first member
  try {
    db.prepare('INSERT INTO squad_members (id, squad_id, student_id) VALUES (?, ?, ?)').run(uuidv4(), squadId, created_by);
  } catch (e) {}

  const squad = db.prepare('SELECT sq.*, c.name as college_name FROM squads sq JOIN colleges c ON sq.college_id = c.id WHERE sq.id = ?').get(squadId);
  res.status(201).json(squad);
});

// POST /api/squads/:id/join
router.post('/:id/join', (req, res) => {
  const { student_id } = req.body;
  if (!student_id) return res.status(400).json({ error: 'Student ID required.' });

  const squad = db.prepare('SELECT * FROM squads WHERE id = ?').get(req.params.id);
  if (!squad) return res.status(404).json({ error: 'Squad not found.' });

  const memberCount = db.prepare('SELECT COUNT(*) as c FROM squad_members WHERE squad_id = ?').get(req.params.id).c;
  if (memberCount >= 5) return res.status(400).json({ error: 'Squad is full (max 5 members).' });

  const alreadyMember = db.prepare('SELECT id FROM squad_members WHERE squad_id = ? AND student_id = ?').get(req.params.id, student_id);
  if (alreadyMember) return res.status(409).json({ error: 'Already a member of this squad.' });

  db.prepare('INSERT INTO squad_members (id, squad_id, student_id) VALUES (?, ?, ?)').run(uuidv4(), req.params.id, student_id);

  // Update student's squad_id
  db.prepare('UPDATE students SET squad_id = ? WHERE id = ?').run(req.params.id, student_id);

  res.json({ success: true });
});

// GET /api/squads/:id
router.get('/:id', (req, res) => {
  const squad = db.prepare(`
    SELECT sq.*, c.name as college_name,
           (SELECT COUNT(*) FROM squad_members sm WHERE sm.squad_id = sq.id) as member_count
    FROM squads sq
    JOIN colleges c ON sq.college_id = c.id
    WHERE sq.id = ?
  `).get(req.params.id);

  if (!squad) return res.status(404).json({ error: 'Squad not found.' });

  const members = db.prepare(`
    SELECT s.id, s.name, s.referral_code, p.name as project_name,
           pp.completed, pp.completion_time
    FROM squad_members sm
    JOIN students s ON sm.student_id = s.id
    LEFT JOIN projects p ON s.project_id = p.id
    LEFT JOIN project_progress pp ON s.id = pp.student_id
    WHERE sm.squad_id = ?
  `).all(req.params.id);

  res.json({ ...squad, members });
});

// GET /api/squads - list squads for a college
router.get('/', (req, res) => {
  const { college_id } = req.query;
  let squads;
  if (college_id) {
    squads = db.prepare(`
      SELECT sq.*, c.name as college_name,
             (SELECT COUNT(*) FROM squad_members sm WHERE sm.squad_id = sq.id) as member_count
      FROM squads sq
      JOIN colleges c ON sq.college_id = c.id
      WHERE sq.college_id = ?
      ORDER BY sq.created_at DESC
    `).all(college_id);
  } else {
    squads = db.prepare(`
      SELECT sq.*, c.name as college_name,
             (SELECT COUNT(*) FROM squad_members sm WHERE sm.squad_id = sq.id) as member_count
      FROM squads sq
      JOIN colleges c ON sq.college_id = c.id
      ORDER BY sq.created_at DESC
      LIMIT 30
    `).all();
  }
  res.json(squads);
});

module.exports = router;
