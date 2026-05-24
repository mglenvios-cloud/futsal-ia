const express = require('express');
const router = express.Router();
const db = require('../database/supabase');

router.get('/scorers', async (req, res) => {
  try {
    const { league, limit } = req.query;
    const scorers = await db.getTopScorers(league, parseInt(limit) || 20);
    res.json(scorers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/league', async (req, res) => {
  try {
    const { league } = req.query;
    const stats = await db.getLeagueStats(league);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
