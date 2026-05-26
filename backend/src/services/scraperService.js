const axios = require('axios');
const cheerio = require('cheerio');
const db = require('../database/supabase');
const plpScraper = require('./plpScraper');
const pasionFutsalScraper = require('./pasionFutsalScraper');

class ScraperService {
  constructor() {
    this.io = null;
    this.sources = [
      { name: 'parenlapelotafutsal', url: 'https://parenlapelotafutsal.com.ar', enabled: true },
      { name: 'pasionfutsal', url: 'https://pasionfutsal.com.ar', enabled: true },
      { name: 'futsalplay', url: 'https://futsalplay.com.ar', enabled: false },
      { name: 'afa', url: 'https://www.afa.com.ar', enabled: false },
      { name: 'promiedos', url: 'https://www.promiedos.com.ar/futsal', enabled: false },
      { name: 'segundopalo', url: 'https://www.segundopalo.com', enabled: false },
      { name: 'sofascore', url: 'https://www.sofascore.com', enabled: false },
      { name: 'flashscore', url: 'https://www.flashscore.com.ar/futbol-sala/', enabled: false },
    ];
    this.leagues = [
      { id: 'primera-a', name: 'Primera A', slug: 'primeraA' },
      { id: 'primera-b', name: 'Primera B', slug: 'primeraB' },
      { id: 'primera-c', name: 'Primera C', slug: 'primeraC' },
      { id: 'primera-d-za', name: 'Primera D Zona A', slug: 'primeraDA' },
      { id: 'primera-d-zb', name: 'Primera D Zona B', slug: 'primeraDB' },
      { id: 'femenino-a', name: 'Femenino Primera A', slug: 'fem/primeraA' },
      { id: 'femenino-b', name: 'Femenino Primera B', slug: 'fem/primeraB' },
      { id: 'femenino-c', name: 'Femenino Primera C', slug: 'fem/primeraC' },
      { id: 'copa-argentina', name: 'Copa Argentina', slug: 'copas/copa-argentina' },
    ];
  }

  init(io) {
    this.io = io;
  }

  async initialScrape() {
    console.log('Running initial scrape...');
    await this.scrapeAllSources();
  }

  async scrapeAllSources() {
    console.log('Scraping ALL sources...');
    const results = await Promise.allSettled([
      this.scrapeParenLaPelota(),
      this.scrapePasionFutsal(),
      this.scrapeFutsalPlay(),
      this.scrapeAFA(),
      this.scrapePromiedos(),
      this.scrapeSegundoPalo(),
      this.scrapeSofaScore(),
      this.scrapeFlashscore(),
    ]);

    results.forEach((r, i) => {
      const name = this.sources[i]?.name || `source-${i}`;
      if (r.status === 'fulfilled') {
        console.log(`✓ ${name} scraped successfully`);
      } else {
        console.error(`✗ ${name} scrape failed:`, r.reason?.message || 'Unknown error');
      }
    });

    if (this.io) {
      this.io.emit('data:updated', { timestamp: new Date().toISOString() });
    }
  }

  async scrapeParenLaPelota() {
    const results = await plpScraper.scrapeAll();
    const total = Object.values(results).reduce((a, r) => ({ standings: a.standings + r.standings, fixtures: a.fixtures + r.fixtures }), { standings: 0, fixtures: 0 });
    console.log(`ParenLaPelota: ${total.standings} standings, ${total.fixtures} fixtures`);
  }

  async scrapePasionFutsal() {
    try {
      const results = await pasionFutsalScraper.scrapeAll();
      console.log(`PasionFutsal: ${results.standings} standings, ${results.matches} matches`);
    } catch (err) {
      console.error(`PasionFutsal error: ${err.message}`);
    }
  }

  async scrapeFutsalPlay() {
    try {
      const { data } = await axios.get('https://futsalplay.com.ar', {
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });

      const $ = cheerio.load(data);
      let count = 0;

      $('article, .partido, .match-card, [class*="partido"], [class*="match"]').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length < 10) return;

        const match = {
          source: 'futsalplay',
          league: 'primera-a',
          status: 'scheduled',
        };

        const teams = text.match(/([A-ZÁÉÍÓÚÑa-záéíóúñ\s]+)\s+(\d+)\s*[-–]\s*(\d+)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]+)/);
        if (teams) {
          match.home_team = teams[1].trim();
          match.away_team = teams[4].trim();
          match.home_score = parseInt(teams[2]);
          match.away_score = parseInt(teams[3]);
          match.status = 'finished';
          count++;
        }
      });

      console.log(`FutsalPlay: ${count} matches extracted`);
    } catch (err) {
      throw new Error(`FutsalPlay: ${err.message}`);
    }
  }

  async scrapeAFA() {
    try {
      const { data } = await axios.get('https://www.afa.com.ar', {
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });

      const $ = cheerio.load(data);
      let count = 0;

      $('a[href*="futsal"], a[href*="futsala"], .futsal, [class*="futsal"]').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        if (href) {
          console.log(`AFA Futsal link found: ${text} -> ${href}`);
          count++;
        }
      });

      const futsalLinks = [];
      $('a').each((i, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().trim().toLowerCase();
        if (href.includes('futsal') || text.includes('futsal')) {
          futsalLinks.push({ text: $(el).text().trim(), href });
        }
      });

      console.log(`AFA: ${futsalLinks.length} futsal-related links found`);
    } catch (err) {
      throw new Error(`AFA: ${err.message}`);
    }
  }

  async scrapePromiedos() {
    try {
      const { data } = await axios.get('https://www.promiedos.com.ar/futsal', {
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });

      const $ = cheerio.load(data);
      const matches = [];
      let count = 0;

      $('.partido, .match, [class*="partido"], tr.partido').each((i, el) => {
        const local = $(el).find('.local, .eq1, .team-home').text().trim();
        const visitante = $(el).find('.visitante, .eq2, .team-away').text().trim();
        const gLocal = parseInt($(el).find('.gol-local, .score-home, .g1').text()) || null;
        const gVisit = parseInt($(el).find('.gol-visita, .score-away, .g2').text()) || null;
        const estado = $(el).find('.estado, .status, .state').text().trim().toLowerCase();

        if (local && visitante) {
          const match = {
            source: 'promiedos',
            home_team: local,
            away_team: visitante,
            home_score: gLocal,
            away_score: gVisit,
            league: 'primera-a',
            status: 'scheduled',
          };

          if (gLocal !== null && gVisit !== null) match.status = 'finished';
          else if (estado.includes('vivo') || estado.includes('envivo')) match.status = 'live';
          else if (estado.includes('post') || estado.includes('sus')) match.status = 'postponed';

          matches.push(match);
          count++;
        }
      });

      for (const match of matches) {
        await db.upsertMatch(match);
      }

      // Standings disabled - PF provides authoritative data

      console.log(`Promiedos: ${count} matches extracted`);
    } catch (err) {
      throw new Error(`Promiedos: ${err.message}`);
    }
  }

  async scrapeSegundoPalo() {
    try {
      const { data } = await axios.get('https://www.segundopalo.com', {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html',
        },
      });

      const $ = cheerio.load(data);
      let count = 0;

      $('article, .post, .entry, [class*="post"], [class*="noticia"]').each((i, el) => {
        const title = $(el).find('h1, h2, h3, .title, .entry-title').text().trim();
        const content = $(el).text().trim().toLowerCase();

        if (title && (content.includes('futsal') || content.includes('futbol sala'))) {
          console.log(`SegundoPalo article: ${title.substring(0, 60)}`);
          count++;
        }
      });

      console.log(`SegundoPalo: ${count} futsal articles found`);
    } catch (err) {
      throw new Error(`SegundoPalo: ${err.message}`);
    }
  }

  async scrapeSofaScore() {
    try {
      const { data } = await axios.get('https://www.sofascore.com/football/futsal', {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json, text/html',
        },
      });

      const $ = cheerio.load(data);
      console.log('SofaScore page loaded');
    } catch (err) {
      throw new Error(`SofaScore: ${err.message}`);
    }
  }

  async scrapeFlashscore() {
    try {
      const { data } = await axios.get('https://www.flashscore.com.ar/futbol-sala/', {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        },
      });

      const $ = cheerio.load(data);
      let count = 0;

      $('[class*="match"], [class*="event"], .event__match').each((i, el) => {
        const homeEl = $(el).find('[class*="home"], [class*="participant"]').first();
        const awayEl = $(el).find('[class*="away"], [class*="participant"]').last();
        const scoreEl = $(el).find('[class*="score"], [class*="result"]');

        const home = homeEl.text().trim();
        const away = awayEl.text().trim();
        const score = scoreEl.text().trim();

        if (home && away && (score.includes('-') || score.includes(':'))) {
          const parts = score.split(/[-:]/).map(s => parseInt(s.trim()));
          const match = {
            source: 'flashscore',
            home_team: home,
            away_team: away,
            home_score: parts[0] || null,
            away_score: parts[1] || null,
            league: 'primera-a',
            status: parts[0] !== null ? 'finished' : 'scheduled',
          };
          db.upsertMatch(match).catch(() => {});
          count++;
        }
      });

      console.log(`Flashscore: ${count} matches extracted`);
    } catch (err) {
      throw new Error(`Flashscore: ${err.message}`);
    }
  }

  async getFutsalVideos() {
    const videos = [];
    try {
      const { data } = await axios.get('https://futsalplay.com.ar', {
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const $ = cheerio.load(data);
      $('iframe[src*="youtube"], iframe[src*="youtu.be"]').each((i, el) => {
        const src = $(el).attr('src');
        if (src) videos.push({ url: src, source: 'futsalplay' });
      });
    } catch {}
    return videos;
  }
}

module.exports = new ScraperService();
