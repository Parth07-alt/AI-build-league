const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET /api/referrals/validate/:code
router.get('/validate/:code', async (req, res) => {
  try {
    const student = (await pool.query(`
      SELECT s.id, s.name, c.name as college_name
      FROM students s
      LEFT JOIN colleges c ON s.college_id = c.id
      WHERE s.referral_code = $1
    `, [req.params.code])).rows[0];

    if (!student) return res.status(404).json({ error: 'Referral code not found.' });
    res.json({ valid: true, referrer: student });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
