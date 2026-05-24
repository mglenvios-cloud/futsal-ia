const express = require('express');
const router = express.Router();
const scraperService = require('../services/scraperService');

router.post('/scrape', async (req, res) => {
  try {
    await scraperService.scrapeAllSources();
    res.json({ success: true, message: 'Scraping completado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
