const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET /api/budget
router.get('/', async (req, res) => {
  try {
    const items = (await pool.query('SELECT * FROM budget_items ORDER BY amount DESC')).rows;
    const total = items.reduce((sum, i) => sum + i.amount, 0);
    res.json({ total, items, note: 'Illustrative reward structure — subject to organizer/institution policy.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
