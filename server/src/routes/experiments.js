const express = require('express');
const router = express.Router();
const pool = require('../db/database');

// GET /api/experiments
router.get('/', async (req, res) => {
  try {
    const experiments = (await pool.query('SELECT * FROM experiments')).rows;
    res.json(experiments);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/experiments/:id
router.get('/:id', async (req, res) => {
  try {
    const exp = (await pool.query('SELECT * FROM experiments WHERE id = $1', [req.params.id])).rows[0];
    if (!exp) return res.status(404).json({ error: 'Experiment not found.' });
    res.json(exp);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
