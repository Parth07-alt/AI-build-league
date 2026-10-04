const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/colleges
router.get('/', (req, res) => {
  const colleges = db.prepare('SELECT * FROM colleges ORDER BY name').all();
  res.json(colleges);
});

// GET /api/colleges/:id
router.get('/:id', (req, res) => {
  const college = db.prepare('SELECT * FROM colleges WHERE id = ?').get(req.params.id);
  if (!college) return res.status(404).json({ error: 'College not found.' });

  const stats = getCollegeStats(req.params.id);
  res.json({ ...college, ...stats });
});

function getCollegeStats(collegeId) {
  const regs = db.prepare('SELECT COUNT(*) as c FROM students WHERE college_id = ?').get(collegeId).c;
  const att = db.prepare('SELECT COUNT(*) as c FROM attendance a JOIN students s ON a.student_id = s.id WHERE s.college_id = ? AND a.attended = 1').get(collegeId).c;
  const started = db.prepare('SELECT COUNT(*) as c FROM project_progress pp JOIN students s ON pp.student_id = s.id WHERE s.college_id = ? AND pp.started = 1').get(collegeId).c;
  const comp = db.prepare('SELECT COUNT(*) as c FROM project_progress pp JOIN students s ON pp.student_id = s.id WHERE s.college_id = ? AND pp.completed = 1').get(collegeId).c;
  const shares = db.prepare('SELECT COUNT(*) as c FROM shares sh JOIN students s ON sh.student_id = s.id WHERE s.college_id = ?').get(collegeId).c;
  const referrals = db.prepare('SELECT COUNT(*) as c FROM referrals r JOIN students s ON r.referrer_student_id = s.id WHERE s.college_id = ?').get(collegeId).c;

  const score = Math.round(regs * 0.30 + att * 0.25 + comp * 0.25 + shares * 0.10 + referrals * 0.10);

  return { registrations: regs, attendance: att, projects_started: started, projects_completed: comp, shares, referrals, growth_score: score };
}

module.exports = router;
