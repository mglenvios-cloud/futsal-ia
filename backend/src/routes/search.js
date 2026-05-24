const express = require('express');
const router = express.Router();
const db = require('../database/supabase');

router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ teams: [], matches: [] });
    const results = await db.searchAll(q);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
