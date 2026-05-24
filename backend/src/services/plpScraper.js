const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../database/supabase');

const LEAGUE_MAP = [
  { slug: 'primeraA/primera', league: 'primera-a', name: 'Primera A' },
  { slug: 'primeraB/primera', league: 'primera-b', name: 'Primera B' },
  { slug: 'primeraC/primera', league: 'primera-c', name: 'Primera C' },
  { slug: 'primeraDA/primera', league: 'primera-d-za', name: 'Primera D Zona A' },
  { slug: 'primeraDB/primera', league: 'primera-d-zb', name: 'Primera D Zona B' },
  { slug: 'fem/primeraA/primera', league: 'femenino-a', name: 'Femenino A' },
  { slug: 'fem/primeraB/primera', league: 'femenino-b', name: 'Femenino B' },
  { slug: 'fem/primeraC/primera', league: 'femenino-c', name: 'Femenino C' },
];

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

const TEAM_NAME_MAP = {
  'Barracas Ctral': 'Barracas Central',
  'Ctral': 'Central',
  'America del Sud': 'América del Sud',
  'J. Newbery': 'Jorge Newbery',
  'Est Porteño': 'Estudiantil Porteño',
  'Nva. Chicago': 'Nueva Chicago',
  'Dep Merlo': 'Deportivo Merlo',
  'Dep Moron': 'Deportivo Morón',
  'Dep Riestra': 'Deportivo Riestra',
  'Dep America': 'Deportivo América',
  'Dep Tigre': 'Deportivo Tigre',
  'Def Olivos': 'Defensores de Olivos',
  'Est Federal': 'Estrella Federal',
  'Estrella Maldonado': 'Estrella de Maldonado',
  'Sp Italiano': 'Sportivo Italiano',
  'Alte Brown': 'Almirante Brown',
  'Atl Provincial': 'Atlético Provincial',
  'Caballito Jrs': 'Caballito Juniors',
  'JJ Urquiza': 'J.J. Urquiza',
  'J Unida': 'Juventud Unida',
  'La Matanza Fem': 'La Matanza Fem',
};

function normalizeTeamName(name) {
  return TEAM_NAME_MAP[name] || name;
}

async function fetchPage(slug) {
  const url = `https://parenlapelotafutsal.com.ar/${slug}`;
  const { data } = await axios.get(url, {
    timeout: 20000,
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html' },
  });
  return data;
}

function parseStandings(html, league) {
  const $ = cheerio.load(html);
  const rows = [];
  const tables = $('table');
  if (tables.length === 0) return rows;

  const table = $(tables[0]);
  const trs = table.find('tr');

  trs.each((i, tr) => {
    const tds = $(tr).find('td');
    if (tds.length < 9) return;

    const position = parseInt($(tds[0]).text().trim());
    const team_name = $(tds[1]).text().trim();
    if (!team_name || isNaN(position)) return;

    rows.push({
      league,
      position,
      team_name: normalizeTeamName(team_name),
      played: parseInt($(tds[2]).text().trim()) || 0,
      won: parseInt($(tds[3]).text().trim()) || 0,
      drawn: parseInt($(tds[4]).text().trim()) || 0,
      lost: parseInt($(tds[5]).text().trim()) || 0,
      goals_for: parseInt($(tds[6]).text().trim()) || 0,
      goals_against: parseInt($(tds[7]).text().trim()) || 0,
      goal_difference: parseInt($(tds[8]).text().trim()) || 0,
      points: parseInt($(tds[9]).text().trim()) || 0,
    });
  });

  return rows;
}

function parseFixtures(html, league) {
  const $ = cheerio.load(html);
  const fixtures = [];

  // Find the round from rendered text
  let round = 0;
  const roundText = $('p:contains("Fecha")').first().text();
  const roundMatch = roundText.match(/Fecha\s*(\d+)/);
  if (roundMatch) round = parseInt(roundMatch[1]);

  // Find fixture rows: divs with grid-cols-[1fr_72px_1fr] that contain match data
  // These are in the fixture section after the "Local/Res/Visitante" header
  const matchRows = $('div.grid.grid-cols-\\[1fr_72px_1fr\\]');
  let idx = 0;
  matchRows.each((i, row) => {
    const cols = $(row).children('div');
    if (cols.length < 3) return;

    // First col: home team (text-right)
    const homeDiv = $(cols[0]);
    const home = homeDiv.find('span').last().text().trim();

    // Third col: away team (text-left)
    const awayDiv = $(cols[2]);
    const away = awayDiv.find('span').last().text().trim();

    // Second col: score
    const scoreDiv = $(cols[1]);
    const scoreSpans = scoreDiv.find('span');
    let homeScore = null, awayScore = null;
    if (scoreSpans.length >= 3) {
      const hs = $(scoreSpans[0]).text().trim();
      const as = $(scoreSpans[2]).text().trim();
      if (hs && as) {
        homeScore = parseInt(hs);
        awayScore = parseInt(as);
      }
    }

    if (!home || !away || home === 'Local' || home === 'Visitante') return;

    fixtures.push({
      source_id: `plp-${league}-${idx++}`,
      source: 'parenlapelotafutsal',
      league,
      home_team: normalizeTeamName(home),
      away_team: normalizeTeamName(away),
      home_score: homeScore,
      away_score: awayScore,
      status: homeScore !== null && awayScore !== null ? 'finished' : 'scheduled',
      round: round ? `Fecha ${round}` : null,
    });
  });

  return fixtures;
}

async function scrapeDivision(slug, league) {
  const html = await fetchPage(slug);
  const standings = parseStandings(html, league);
  if (standings.length > 0) {
    await db.upsertStandings(standings);
  }
  const fixtures = parseFixtures(html, league);
  for (const match of fixtures) {
    await db.upsertMatch(match);
  }
  return { standings: standings.length, fixtures: fixtures.length };
}

async function scrapeAll() {
  console.log('PLP Scraper: scraping all divisions...');
  const results = {};
  for (const info of LEAGUE_MAP) {
    try {
      const r = await scrapeDivision(info.slug, info.league);
      results[info.league] = r;
      console.log(`  ${info.league}: ${r.standings} standings, ${r.fixtures} fixtures`);
    } catch (err) {
      console.error(`  ${info.league} error:`, err.message);
      results[info.league] = { standings: 0, fixtures: 0, error: err.message };
    }
  }
  return results;
}

module.exports = { scrapeAll, scrapeDivision };
