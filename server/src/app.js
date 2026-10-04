require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const studentRoutes = require('./routes/students');
const collegeRoutes = require('./routes/colleges');
const clubRoutes = require('./routes/clubs');
const projectRoutes = require('./routes/projects');
const leaderboardRoutes = require('./routes/leaderboard');
const dashboardRoutes = require('./routes/dashboard');
const squadRoutes = require('./routes/squads');
const experimentRoutes = require('./routes/experiments');
const budgetRoutes = require('./routes/budget');
const referralRoutes = require('./routes/referrals');
const campaignRoutes = require('./routes/campaign');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests. Please try again later.' }
});
app.use('/api', limiter);

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/squads', squadRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/campaign', campaignRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
