const express = require('express');
const router = express.Router();
const db = require('../db/database');

function computeCollegeScore(collegeId) {
  const regs = db.prepare('SELECT COUNT(*) as c FROM students WHERE college_id = ?').get(collegeId).c;
  const att = db.prepare('SELECT COUNT(*) as c FROM attendance a JOIN students s ON a.student_id = s.id WHERE s.college_id = ? AND a.attended = 1').get(collegeId).c;
  const comp = db.prepare('SELECT COUNT(*) as c FROM project_progress pp JOIN students s ON pp.student_id = s.id WHERE s.college_id = ? AND pp.completed = 1').get(collegeId).c;
  const shares = db.prepare('SELECT COUNT(*) as c FROM shares sh JOIN students s ON sh.student_id = s.id WHERE s.college_id = ?').get(collegeId).c;
  const referrals = db.prepare('SELECT COUNT(*) as c FROM referrals r JOIN students s ON r.referrer_student_id = s.id WHERE s.college_id = ?').get(collegeId).c;
  return { regs, att, comp, shares, referrals, score: Math.round(regs * 0.30 + att * 0.25 + comp * 0.25 + shares * 0.10 + referrals * 0.10) };
}

function computeClubScore(clubId) {
  const regs = db.prepare('SELECT COUNT(*) as c FROM students WHERE club_id = ?').get(clubId).c;
  const att = db.prepare('SELECT COUNT(*) as c FROM attendance a JOIN students s ON a.student_id = s.id WHERE s.club_id = ? AND a.attended = 1').get(clubId).c;
  const comp = db.prepare('SELECT COUNT(*) as c FROM project_progress pp JOIN students s ON pp.student_id = s.id WHERE s.club_id = ? AND pp.completed = 1').get(clubId).c;
  const shares = db.prepare('SELECT COUNT(*) as c FROM shares sh JOIN students s ON sh.student_id = s.id WHERE s.club_id = ?').get(clubId).c;
  const referrals = db.prepare('SELECT COUNT(*) as c FROM referrals r JOIN students s ON r.referrer_student_id = s.id WHERE s.club_id = ?').get(clubId).c;
  return { regs, att, comp, shares, referrals, score: Math.round(regs * 0.30 + att * 0.25 + comp * 0.25 + shares * 0.10 + referrals * 0.10) };
}

// GET /api/leaderboard/colleges
router.get('/colleges', (req, res) => {
  const colleges = db.prepare('SELECT * FROM colleges').all();
  const ranked = colleges.map(c => {
    const s = computeCollegeScore(c.id);
    return {
      ...c,
      registrations: s.regs,
      attendance: s.att,
      projects_completed: s.comp,
      shares: s.shares,
      referrals: s.referrals,
      growth_score: s.score
    };
  }).sort((a, b) => b.growth_score - a.growth_score)
    .map((c, i) => ({ ...c, rank: i + 1 }));

  res.json(ranked);
});

// GET /api/leaderboard/clubs
router.get('/clubs', (req, res) => {
  const clubs = db.prepare('SELECT cl.*, c.name as college_name FROM clubs cl JOIN colleges c ON cl.college_id = c.id').all();
  const ranked = clubs.map(cl => {
    const s = computeClubScore(cl.id);
    return {
      ...cl,
      registrations: s.regs,
      attendance: s.att,
      projects_completed: s.comp,
      shares: s.shares,
      referrals: s.referrals,
      growth_score: s.score
    };
  }).sort((a, b) => b.growth_score - a.growth_score)
    .map((c, i) => ({ ...c, rank: i + 1 }));

  res.json(ranked);
});

// GET /api/leaderboard/students
router.get('/students', (req, res) => {
  const students = db.prepare(`
    SELECT s.id, s.name, s.referral_code,
           c.name as college_name, cl.name as club_name,
           pp.completed, pp.completion_time,
           (SELECT COUNT(*) FROM referrals r WHERE r.referrer_student_id = s.id) as referral_count,
           (SELECT COUNT(*) FROM project_votes pv WHERE pv.student_id = s.id) as votes,
           (SELECT COUNT(*) FROM shares sh WHERE sh.student_id = s.id) as share_count
    FROM students s
    LEFT JOIN colleges c ON s.college_id = c.id
    LEFT JOIN clubs cl ON s.club_id = cl.id
    LEFT JOIN project_progress pp ON s.id = pp.student_id
    WHERE pp.completed = 1
    ORDER BY votes DESC, referral_count DESC
    LIMIT 50
  `).all();
  res.json(students.map((s, i) => ({ ...s, rank: i + 1 })));
});

// GET /api/leaderboard/squads
router.get('/squads', (req, res) => {
  const squads = db.prepare(`
    SELECT sq.*, c.name as college_name,
           (SELECT COUNT(*) FROM squad_members sm WHERE sm.squad_id = sq.id) as member_count
    FROM squads sq
    JOIN colleges c ON sq.college_id = c.id
  `).all();

  const scored = squads.map(sq => {
    const members = db.prepare('SELECT student_id FROM squad_members WHERE squad_id = ?').all(sq.id);
    let totalRegs = 0, totalComp = 0, totalRefs = 0;
    members.forEach(m => {
      const prog = db.prepare('SELECT completed FROM project_progress WHERE student_id = ?').get(m.student_id);
      if (prog && prog.completed) totalComp++;
      totalRegs++;
      const refs = db.prepare('SELECT COUNT(*) as c FROM referrals WHERE referrer_student_id = ?').get(m.student_id).c;
      totalRefs += refs;
    });
    const score = Math.round(totalRegs * 30 + totalComp * 40 + totalRefs * 30);
    return { ...sq, projects_completed: totalComp, referrals: totalRefs, growth_score: score };
  }).sort((a, b) => b.growth_score - a.growth_score)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  res.json(scored);
});

module.exports = router;
