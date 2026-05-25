const axios = require('axios');
const db = require('../database/supabase');

const API_BASE = 'https://pasionfutsal.com.ar/wp-json';

const LEAGUE_MAP = {
  39: 'primera-a',
  35: 'primera-b',
  37: 'primera-c',
  42: 'primera-d',
  40: 'femenino-a',
  41: 'femenino-b',
  38: 'femenino-c',
};

const LEAGUE_ZONE = {
  43: 'za',
  44: 'zb',
};

async function fetchJson(url) {
  const { data } = await axios.get(url, { timeout: 15000 });
  return data;
}

function mapLeague(leagues) {
  if (!leagues || !leagues.length) return null;
  for (const id of leagues) {
    if (LEAGUE_MAP[id]) return LEAGUE_MAP[id];
    if (LEAGUE_ZONE[id]) return LEAGUE_ZONE[id];
  }
  return null;
}

function parseTableDate(title) {
  const m = title.match(/(\d{4})/);
  return m ? m[1] : '2026';
}

async function scrapeStandings() {
  const tables = await fetchJson(`${API_BASE}/sportspress/v2/tables?per_page=50`);
  let count = 0;
  const allStandings = [];

  for (const table of tables) {
    const leagueBase = mapLeague(table.leagues);
    if (!leagueBase) continue;

    const zone = table.leagues.some(id => LEAGUE_ZONE[id] === 'za') ? '-za' :
                 table.leagues.some(id => LEAGUE_ZONE[id] === 'zb') ? '-zb' : '';

    let league = leagueBase;
    if (league === 'primera-d') league = `primera-d${zone}`;
    if (!league.startsWith('primera-') && !league.startsWith('femenino-')) continue;

    const data = table.data;
    if (!data) continue;

    const rows = [];
    for (const [key, entry] of Object.entries(data)) {
      if (key === '0' || !entry.pos || entry.pos === 'Pos') continue;
      rows.push({
        league,
        position: parseInt(entry.pos) || 0,
        team_name: entry.name,
        played: parseInt(entry.j) || 0,
        won: parseInt(entry.pg) || 0,
        drawn: parseInt(entry.pe) || 0,
        lost: parseInt(entry.pp) || 0,
        goals_for: parseInt(entry.gf) || 0,
        goals_against: parseInt(entry.gc) || 0,
        goal_difference: parseInt(entry.dg) || 0,
        points: parseInt(entry.pts) || 0,
      });
    }

    if (rows.length > 0) {
      allStandings.push(...rows);
      count += rows.length;
    }
  }

  if (allStandings.length > 0) {
    await db.upsertStandings(allStandings);
  }
  return count;
}

async function scrapeMatches() {
  const events = await fetchJson(`${API_BASE}/sportspress/v2/events?per_page=100&status=publish`);
  const teams = {};
  let count = 0;

  for (const event of events) {
    const leagueId = event.sp_league;
    const league = mapLeague(leagueId ? [leagueId] : []);
    if (!league) continue;

    const dateMatch = event.date ? event.date.split('T')[0] : null;
    if (!dateMatch) continue;

    const teamIds = event.teams || [];
    if (teamIds.length < 2) continue;

    const results = event.results || {};
    let homeScore = null, awayScore = null;

    if (results[teamIds[0]] && results[teamIds[1]]) {
      const hg = parseInt(results[teamIds[0]].goals);
      const ag = parseInt(results[teamIds[1]].goals);
      if (!isNaN(hg) && !isNaN(ag)) {
        homeScore = hg;
        awayScore = ag;
      }
    }

    for (const tid of teamIds) {
      if (!teams[tid]) {
        try {
          const t = await fetchJson(`${API_BASE}/sportspress/v2/teams/${tid}`);
          teams[tid] = t.title.rendered || `Team ${tid}`;
        } catch {
          teams[tid] = `Team ${tid}`;
        }
      }
    }

    const match = {
      source_id: `pf-${event.id}`,
      source: 'pasionfutsal',
      league,
      home_team: teams[teamIds[0]] || `Team ${teamIds[0]}`,
      away_team: teams[teamIds[1]] || `Team ${teamIds[1]}`,
      home_score: homeScore,
      away_score: awayScore,
      status: homeScore !== null ? 'finished' : 'scheduled',
      date: dateMatch,
      round: null,
    };

    await db.upsertMatch(match);
    count++;
  }

  return count;
}

async function scrapeAll() {
  console.log('PasionFutsal Scraper: starting...');
  let standings = 0, matches = 0;

  try {
    standings = await scrapeStandings();
    console.log(`  standings: ${standings}`);
  } catch (err) {
    console.error(`  standings error: ${err.message}`);
  }

  try {
    matches = await scrapeMatches();
    console.log(`  matches: ${matches}`);
  } catch (err) {
    console.error(`  matches error: ${err.message}`);
  }

  return { standings, matches };
}

module.exports = { scrapeAll };
