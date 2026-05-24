const db = require('../database/supabase');
const scraperService = require('./scraperService');

class LiveMatchService {
  constructor() {
    this.io = null;
    this.updateIntervals = new Map();
    this.liveMatchCache = new Map();
  }

  init(io) {
    this.io = io;
    this.startLiveUpdates();
  }

  startLiveUpdates() {
    setInterval(async () => {
      try {
        const liveMatches = await db.getLiveMatches();
        if (liveMatches.length > 0 && this.io) {
          this.io.to('live:all').emit('live:matches', {
            matches: liveMatches,
            timestamp: new Date().toISOString(),
          });

          for (const match of liveMatches) {
            this.io.to(`match:${match.id}`).emit('match:update', {
              ...match,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.error('Live update error:', err.message);
      }
    }, 5000);

    setInterval(async () => {
      try {
        await scraperService.scrapeAllSources();
      } catch (err) {
        console.error('Live scrape cycle error:', err.message);
      }
    }, 30000);
  }

  async checkLiveMatches() {
    try {
      const live = await db.getLiveMatches();
      for (const match of live) {
        const timeSinceUpdate = Date.now() - new Date(match.updated_at || match.created_at).getTime();
        if (timeSinceUpdate > 120000) {
          console.log(`Match ${match.id} might be stale, re-scraping...`);
        }
      }
    } catch (err) {
      console.error('Check live matches error:', err.message);
    }
  }

  async getMatchDetail(matchId) {
    return db.getMatchById(matchId);
  }

  async getLiveSummary() {
    const matches = await db.getLiveMatches();
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const todayMatches = await db.getTodayMatches();
    const upcoming = await db.getUpcomingMatches(10);

    return {
      live: matches,
      today: todayMatches,
      upcoming,
      timestamp: now.toISOString(),
    };
  }
}

module.exports = new LiveMatchService();
