const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/budget
router.get('/', (req, res) => {
  const items = db.prepare('SELECT * FROM budget_items ORDER BY amount DESC').all();
  const total = items.reduce((sum, i) => sum + i.amount, 0);
  res.json({ total, items, note: 'Illustrative reward structure — subject to organizer/institution policy.' });
});

module.exports = router;
