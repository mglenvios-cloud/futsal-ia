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

router.post('/reset-standings', async (req, res) => {
  try {
    const db = require('../database/sqlite');
    db.exec("DELETE FROM standings");
    res.json({ success: true, message: 'Standings cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pf-test-standings', async (req, res) => {
  try {
    const axios = require('axios');
    const API_BASE = 'https://pasionfutsal.com.ar/wp-json';
    const tables = (await axios.get(`${API_BASE}/sportspress/v2/tables?per_page=50`, { timeout: 15000 })).data;

    const LEAGUE_MAP = {
      39: 'primera-a', 35: 'primera-b', 37: 'primera-c', 42: 'primera-d',
      40: 'femenino-a', 41: 'femenino-b', 38: 'femenino-c',
    };
    const LEAGUE_ZONE = { 43: 'za', 44: 'zb' };

    const results = [];
    for (const table of tables) {
      const seasonN = parseInt(table.seasons);
      const lid = table.leagues;
      const leagueIds = lid != null && lid !== '' ? [lid].flat() : [];
      let leagueBase = null;
      for (const id of leagueIds) {
        if (LEAGUE_MAP[id]) { leagueBase = LEAGUE_MAP[id]; break; }
      }
      if (!leagueBase) { for (const id of leagueIds) { if (LEAGUE_ZONE[id]) { leagueBase = 'primera-d'; break; } } }
      const zone = leagueIds.some(id => LEAGUE_ZONE[id] === 'za') ? '-za' :
                   leagueIds.some(id => LEAGUE_ZONE[id] === 'zb') ? '-zb' : '';
      let league = leagueBase;
      if (league === 'primera-d') league = `primera-d${zone}`;

      const parsed = [];
      if (table.data) {
        for (const [key, entry] of Object.entries(table.data)) {
          if (key === '0' || !entry.pos || entry.pos === 'Pos') continue;
          parsed.push({ pos: entry.pos, name: entry.name });
        }
      }

      results.push({
        id: table.id, seasons: seasonN, leagues: lid,
        leagueMapped: leagueBase, zoneSuffix: zone, fullLeague: league,
        title: (table.title?.rendered || '').substring(0, 40),
        parsedCount: parsed.length,
      });
    }
    res.json({ total: tables.length, results });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Test the actual PF scrapeStandings logic
router.get('/test-pf-scrape', async (req, res) => {
  try {
    const axios = require('axios');
    const sqlite = require('../database/sqlite');
    const supabase = require('../database/supabase');
    const API_BASE = 'https://pasionfutsal.com.ar/wp-json';

    const tables = (await axios.get(`${API_BASE}/sportspress/v2/tables?per_page=50`, { timeout: 15000 })).data;

    const LEAGUE_MAP = { 39: 'primera-a', 35: 'primera-b', 37: 'primera-c', 42: 'primera-d', 40: 'femenino-a', 41: 'femenino-b', 38: 'femenino-c' };
    const LEAGUE_ZONE = { 43: 'za', 44: 'zb' };

    let count = 0;
    const allStandings = [];
    const leaguesToClear = new Set();

    for (const table of tables) {
      const season = parseInt(table.seasons);
      if (season !== 162) continue;
      const lid = table.leagues;
      const leagueIds = lid != null && lid !== '' ? [lid].flat() : [];
      const leagueBase = (() => { for (const id of leagueIds) { if (LEAGUE_MAP[id]) return LEAGUE_MAP[id]; } return null; })();
      if (!leagueBase) continue;
      const zone = leagueIds.some(id => LEAGUE_ZONE[id] === 'za') ? '-za' : leagueIds.some(id => LEAGUE_ZONE[id] === 'zb') ? '-zb' : '';
      let league = leagueBase;
      if (league === 'primera-d') league = `primera-d${zone}`;
      if (!league.startsWith('primera-') && !league.startsWith('femenino-')) continue;
      const data = table.data;
      if (!data) continue;
      for (const [key, entry] of Object.entries(data)) {
        if (key === '0' || !entry.pos || entry.pos === 'Pos') continue;
        allStandings.push({
          league, position: parseInt(entry.pos) || 0, team_name: entry.name,
          played: parseInt(entry.j) || 0, won: parseInt(entry.pg) || 0,
          drawn: parseInt(entry.pe) || 0, lost: parseInt(entry.pp) || 0,
          goals_for: parseInt(entry.gf) || 0, goals_against: parseInt(entry.gc) || 0,
          goal_difference: parseInt(entry.dg) || 0, points: parseInt(entry.pts) || 0,
        });
        count++;
      }
      leaguesToClear.add(league);
    }

    // Now try to insert
    let insertError = null;
    try {
      if (allStandings.length > 0) {
        for (const l of leaguesToClear) {
          sqlite.exec(`DELETE FROM standings WHERE league = '${l.replace(/'/g, "''")}'`);
        }
        sqlite.upsertStandings(allStandings);
      }
    } catch (err) {
      insertError = err.message;
    }

    const sqliteCount = sqlite.getStandings().length;
    const primeraACount = sqlite.getStandings('primera-a').length;

    res.json({
      tablesFetched: tables.length,
      parsedCount: count,
      leaguesToClear: Array.from(leaguesToClear),
      insertError,
      sqliteCountAfter: sqliteCount,
      primeraACount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
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
    const r = await axios.get('https://pasionfutsal.com.ar/wp-json/sportspress/v2/tables?per_page=50', { timeout: 10000 });
    results.tablesOk = true;
    results.tablesCount = r.data.length;
    results.tables = r.data.map(t => ({ id: t.id, leagues: t.leagues, seasons: t.seasons, title: t.title?.rendered }));
  } catch (err) {
    results.tablesOk = false;
    results.tablesError = err.message;
  }
  res.json(results);
});

module.exports = router;
