const express = require('express');
const router = express.Router();
const db = require('../database/supabase');

router.get('/', async (req, res) => {
  try {
    const { league } = req.query;
    const standings = await db.getStandings(league);
    res.json(standings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
