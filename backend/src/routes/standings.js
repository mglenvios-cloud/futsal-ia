const express = require('express');
const router = express.Router();
const db = require('../database/supabase');

router.get('/', async (req, res) => {
  try {
    const { league } = req.query;
    // Always use SQLite for standings (PF scraper writes here)
    const sqlite = require('../database/sqlite');
    res.json(sqlite.getStandings(league || undefined));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/diagnose', async (req, res) => {
  try {
    const sqlite = require('../database/sqlite');
    const supabaseStandings = await db.getStandings();
    const sqliteStandings = sqlite.getStandings();
    res.json({
      supabaseCount: supabaseStandings ? supabaseStandings.length : 0,
      sqliteCount: sqliteStandings ? sqliteStandings.length : 0,
      primaASupabase: supabaseStandings ? supabaseStandings.filter(s => s.league === 'primera-a').length : 0,
      primaASQLite: sqliteStandings ? sqliteStandings.filter(s => s.league === 'primera-a').length : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
