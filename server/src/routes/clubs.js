const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/clubs?collegeId=
router.get('/', (req, res) => {
  const { collegeId } = req.query;
  let clubs;
  if (collegeId) {
    clubs = db.prepare('SELECT cl.*, c.name as college_name FROM clubs cl JOIN colleges c ON cl.college_id = c.id WHERE cl.college_id = ? ORDER BY cl.name').all(collegeId);
  } else {
    clubs = db.prepare('SELECT cl.*, c.name as college_name FROM clubs cl JOIN colleges c ON cl.college_id = c.id ORDER BY c.name, cl.name').all();
  }
  res.json(clubs);
});

// GET /api/clubs/:id
router.get('/:id', (req, res) => {
  const club = db.prepare('SELECT cl.*, c.name as college_name, c.city FROM clubs cl JOIN colleges c ON cl.college_id = c.id WHERE cl.id = ?').get(req.params.id);
  if (!club) return res.status(404).json({ error: 'Club not found.' });

  const stats = getClubStats(req.params.id);

  // Get rank
  const allClubs = db.prepare('SELECT id FROM clubs').all();
  const ranked = allClubs.map(c => ({ id: c.id, score: getClubStats(c.id).growth_score })).sort((a, b) => b.score - a.score);
  const rank = ranked.findIndex(c => c.id === req.params.id) + 1;

  res.json({ ...club, ...stats, rank });
});

function getClubStats(clubId) {
  const regs = db.prepare('SELECT COUNT(*) as c FROM students WHERE club_id = ?').get(clubId).c;
  const att = db.prepare('SELECT COUNT(*) as c FROM attendance a JOIN students s ON a.student_id = s.id WHERE s.club_id = ? AND a.attended = 1').get(clubId).c;
  const comp = db.prepare('SELECT COUNT(*) as c FROM project_progress pp JOIN students s ON pp.student_id = s.id WHERE s.club_id = ? AND pp.completed = 1').get(clubId).c;
  const shares = db.prepare('SELECT COUNT(*) as c FROM shares sh JOIN students s ON sh.student_id = s.id WHERE s.club_id = ?').get(clubId).c;
  const referrals = db.prepare('SELECT COUNT(*) as c FROM referrals r JOIN students s ON r.referrer_student_id = s.id WHERE s.club_id = ?').get(clubId).c;

  const score = Math.round(regs * 0.30 + att * 0.25 + comp * 0.25 + shares * 0.10 + referrals * 0.10);
  return { registrations: regs, attendance: att, projects_completed: comp, shares, referrals, growth_score: score };
}

module.exports = router;
