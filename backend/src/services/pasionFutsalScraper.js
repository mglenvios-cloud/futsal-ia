const axios = require('axios');
const supabase = require('../database/supabase');
const sqlite = require('../database/sqlite');

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
  }
  // Check zones: return base league 'primera-d'
  for (const id of leagues) {
    if (LEAGUE_ZONE[id]) return 'primera-d';
  }
  return null;
}

function getZone(leagues) {
  if (!leagues || !leagues.length) return '';
  return leagues.some(id => LEAGUE_ZONE[id] === 'za') ? '-za' :
         leagues.some(id => LEAGUE_ZONE[id] === 'zb') ? '-zb' : '';
}

function parseTableDate(title) {
  const m = title.match(/(\d{4})/);
  return m ? m[1] : '2026';
}

async function scrapeStandings() {
  const tables = await fetchJson(`${API_BASE}/sportspress/v2/tables?per_page=50`);
  console.log(`  fetched ${tables.length} tables`);
  let count = 0;
  const allStandings = [];
  const leaguesToClear = new Set();

  for (const table of tables) {
    // Only 2026 season (season ID 162)
    const season = parseInt(table.seasons);
    if (season !== 162) {
      console.log(`    skipping table ${table.id} (season ${season})`);
      continue;
    }
    const lid = table.leagues;
    const leagueIds = lid != null && lid !== '' ? [lid].flat() : [];
    const leagueBase = mapLeague(leagueIds);
    if (!leagueBase) continue;

    const zone = getZone(leagueIds);
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
      leaguesToClear.add(league);
      count += rows.length;
    }
  }

  if (allStandings.length > 0) {
    // Delete all standings for affected leagues, then insert fresh data
    for (const league of leaguesToClear) {
      sqlite.exec(`DELETE FROM standings WHERE league = '${league.replace(/'/g, "''")}'`);
    }
    sqlite.upsertStandings(allStandings);
    // Also clear Supabase old data (best effort)
    try { await supabase.clearStandings(); } catch {}
  }
  return count;
}

async function scrapeMatches() {
  const events = await fetchJson(`${API_BASE}/sportspress/v2/events?per_page=100&status=publish`);
  console.log(`  fetched ${events.length} events`);
  const teamsCache = {};
  let count = 0, skipped = 0;

  for (const event of events) {
    // Only 2026 season
    const season = parseInt(event.seasons);
    if (season !== 162) continue;

    // teams can be array [2179,2175] or space-separated string "2179 2175"
    const teamIds = (Array.isArray(event.teams) ? event.teams : (event.teams || '').toString().split(/\s+/)).filter(Boolean).map(Number);
    if (teamIds.length < 2) continue;

    // main_results can be array ["2","3"] or string "2 3"
    let homeScore = null, awayScore = null;
    if (event.main_results != null) {
      const raw = Array.isArray(event.main_results) ? event.main_results : event.main_results.toString().split(/\s+/);
      const parts = raw.filter(Boolean).map(Number);
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        homeScore = parts[0];
        awayScore = parts[1];
      }
    }

    for (const tid of teamIds) {
      const key = String(tid);
      if (!teamsCache[key]) {
        try {
          const t = await fetchJson(`${API_BASE}/sportspress/v2/teams/${tid}`);
          teamsCache[key] = t.title.rendered || `Team ${tid}`;
        } catch {
          teamsCache[key] = `Team ${tid}`;
        }
      }
    }

    const match = {
      source_id: `pf-${event.id}`,
      source: 'pasionfutsal',
      league,
      home_team: teamsCache[String(teamIds[0])] || `Team ${teamIds[0]}`,
      away_team: teamsCache[String(teamIds[1])] || `Team ${teamIds[1]}`,
      home_score: homeScore,
      away_score: awayScore,
      status: homeScore !== null ? 'finished' : 'scheduled',
      date: dateMatch,
      round: event.day || null,
    };

    await db.upsertMatch(match);
    count++;
  }

  console.log(`  matches: ${count}, skipped: ${skipped}`);
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
