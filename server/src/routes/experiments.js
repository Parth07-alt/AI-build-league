const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/experiments
router.get('/', (req, res) => {
  const experiments = db.prepare('SELECT * FROM experiments').all();
  res.json(experiments);
});

// GET /api/experiments/:id
router.get('/:id', (req, res) => {
  const exp = db.prepare('SELECT * FROM experiments WHERE id = ?').get(req.params.id);
  if (!exp) return res.status(404).json({ error: 'Experiment not found.' });
  res.json(exp);
});

module.exports = router;
