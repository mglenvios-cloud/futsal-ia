const express = require('express');
const router = express.Router();
const sqlite = require('../database/sqlite');

const CATEGORIES = ['senior', 'sub20', 'sub17', 'femenina'];

router.get('/', (req, res) => {
  try {
    const { category } = req.query;
    const matches = sqlite.getSeleccionesMatches({ category });
    const grouped = {};
    for (const m of matches) {
      const cat = m.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(m);
    }
    if (category) {
      return res.json(grouped[category] || []);
    }
    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', (req, res) => {
  res.json(CATEGORIES);
});

module.exports = router;
