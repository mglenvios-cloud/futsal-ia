const express = require('express');
const router = express.Router();
const axios = require('axios');
const scraperService = require('../services/scraperService');

router.post('/scrape', async (req, res) => {
  try {
    await scraperService.scrapeAllSources();
    res.json({ success: true, message: 'Scraping completado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/diagnose', async (req, res) => {
  const results = {};
  try {
    const r = await axios.get('https://pasionfutsal.com.ar/wp-json/sportspress/v2/events?per_page=3&status=publish', { timeout: 10000 });
    results.eventsOk = true;
    results.eventsCount = r.data.length;
    results.sample = r.data.slice(0, 2).map(e => ({ id: e.id, leagues: e.leagues, teams: e.teams, main_results: e.main_results }));
  } catch (err) {
    results.eventsOk = false;
    results.eventsError = err.message;
  }
  try {
    const r = await axios.get('https://pasionfutsal.com.ar/wp-json/sportspress/v2/tables?per_page=3', { timeout: 10000 });
    results.tablesOk = true;
    results.tablesCount = r.data.length;
    results.tables = r.data.slice(0, 2).map(t => ({ id: t.id, leagues: t.leagues, title: t.title?.rendered }));
  } catch (err) {
    results.tablesOk = false;
    results.tablesError = err.message;
  }
  res.json(results);
});

module.exports = router;
