const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/referrals/validate/:code
router.get('/validate/:code', (req, res) => {
  const student = db.prepare(`
    SELECT s.id, s.name, c.name as college_name
    FROM students s
    LEFT JOIN colleges c ON s.college_id = c.id
    WHERE s.referral_code = ?
  `).get(req.params.code);

  if (!student) return res.status(404).json({ error: 'Referral code not found.' });
  res.json({ valid: true, referrer: student });
});

module.exports = router;
