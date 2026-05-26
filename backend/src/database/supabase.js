const { createClient } = require('@supabase/supabase-js');
const sqlite = require('./sqlite');
const localDb = require('./localDb');

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-anon-key';

let supabase;
try { supabase = createClient(supabaseUrl, supabaseKey); } catch { supabase = null; }

async function trySupabase(fn) {
  if (!supabase) return null;
  try {
    const result = await fn();
    if (result && !result.error) return result.data || result;
  } catch {}
  return null;
}

const db = {
  async getMatches(params = {}) {
    const r = await trySupabase(async () => {
      const { league, date, team, status, limit, offset } = params;
      let q = supabase.from('matches').select('*', { count: 'exact' });
      if (league) q = q.eq('league', league);
      if (date) q = q.eq('date', date);
      if (team) q = q.or(`home_team.eq.${team},away_team.eq.${team}`);
      if (status) q = q.eq('status', status);
      return await q.order('date', { ascending: false }).order('time').range(offset || 0, (offset || 0) + (limit || 50) - 1);
    });
    if (r) return r;
    return sqlite.getMatches(params);
  },

  async getMatchById(id) {
    const r = await trySupabase(() => supabase.from('matches').select('*').eq('id', id).single());
    if (r) return r;
    return sqlite.getMatchById(id) || localDb.matches.getById(id);
  },

  async getLiveMatches() {
    const r = await trySupabase(() => supabase.from('matches').select('*').in('status', ['live', 'halftime', 'second_half']).order('league').order('date'));
    if (r) return r;
    return sqlite.getLiveMatches().length ? sqlite.getLiveMatches() : localDb.matches.getLive();
  },

  async getTodayMatches() {
    const r = await trySupabase(async () => {
      const today = new Date().toISOString().split('T')[0];
      return await supabase.from('matches').select('*').eq('date', today).order('time');
    });
    if (r) return r;
    return sqlite.getTodayMatches().length ? sqlite.getTodayMatches() : localDb.matches.getToday();
  },

  async getUpcomingMatches(limit = 20) {
    const r = await trySupabase(async () => {
      const today = new Date().toISOString().split('T')[0];
      return await supabase.from('matches').select('*').gte('date', today).eq('status', 'scheduled').order('date').order('time').limit(limit);
    });
    if (r) return r;
    return sqlite.getUpcomingMatches(limit).length ? sqlite.getUpcomingMatches(limit) : localDb.matches.getUpcoming(limit);
  },

  async getStandings(league) {
    const r = await trySupabase(async () => {
      let q = supabase.from('standings').select('*');
      if (league) q = q.eq('league', league);
      return await q.order('position');
    });
    if (r) return r;
    return sqlite.getStandings(league).length ? sqlite.getStandings(league) : localDb.standings.get(league);
  },

  async getTeams(params = {}) {
    const r = await trySupabase(async () => {
      const { search, league } = params;
      let q = supabase.from('teams').select('*');
      if (search) q = q.ilike('name', `%${search}%`);
      if (league) q = q.eq('league', league);
      return await q.order('name');
    });
    if (r) return r;
    return sqlite.getTeams(params);
  },

  async getTeamBySlug(slug) {
    const r = await trySupabase(() => supabase.from('teams').select('*').eq('slug', slug).single());
    if (r) return r;
    return sqlite.getTeamBySlug(slug) || localDb.teams.getBySlug(slug);
  },

  async getTeamById(id) {
    return sqlite.getTeamById(id);
  },

  async getPlayers(teamId) {
    return sqlite.getPlayers(teamId);
  },

  async addPlayer(player) {
    return sqlite.addPlayer(player);
  },

  async upsertTeam(team) {
    return sqlite.upsertTeam(team);
  },

  async updateTeam(id, data) {
    return sqlite.updateTeam(id, data);
  },

  async getTopScorers(league, limit = 20) {
    const r = await trySupabase(async () => {
      let q = supabase.from('top_scorers').select('*');
      if (league) q = q.eq('league', league);
      return await q.order('goals', { ascending: false }).limit(limit);
    });
    if (r) return r;
    return sqlite.getTopScorers(league, limit).length ? sqlite.getTopScorers(league, limit) : localDb.scorers.get(league);
  },

  async getH2H(team1, team2) {
    const r = await trySupabase(() =>
      supabase.from('matches').select('*')
        .or(`and(home_team.eq.${team1},away_team.eq.${team2}),and(home_team.eq.${team2},away_team.eq.${team1})`)
        .order('date')
    );
    if (r) return r;
    return sqlite.getH2H(team1, team2).length ? sqlite.getH2H(team1, team2) : (await db.getMatches({})).data.filter(m => {
      const h = m.home_team?.toLowerCase(), a = m.away_team?.toLowerCase();
      const t1 = team1.toLowerCase(), t2 = team2.toLowerCase();
      return (h === t1 && a === t2) || (h === t2 && a === t1);
    });
  },

  async upsertMatch(match) {
    const r = await trySupabase(() => supabase.from('matches').upsert(match, { onConflict: 'source_id' }).select().single());
    if (r) return r;
    return sqlite.upsertMatch(match) || localDb.matches.upsert(match);
  },

  async clearStandings() {
    try { await trySupabase(() => supabase.from('standings').delete().neq('league', '_nonexistent')); } catch {}
    // Does NOT clear local SQLite - that's handled separately by the scraper
  },

  async upsertStandings(rows) {
    const ok = await trySupabase(() => supabase.from('standings').upsert(rows, { onConflict: 'league,team_name' }));
    if (ok) return;
    sqlite.upsertStandings(rows);
    localDb.standings.upsert(rows);
  },

  async upsertTopScorers(rows) {
    const ok = await trySupabase(() => supabase.from('top_scorers').upsert(rows, { onConflict: 'league,player_name' }));
    if (ok) return;
    sqlite.upsertTopScorers(rows);
    localDb.scorers.upsert(rows);
  },

  async getNotifications(userId) {
    const r = await trySupabase(() => supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50));
    if (r) return r;
    return sqlite.getNotifications(userId).length ? sqlite.getNotifications(userId) : localDb.notifications.getAll();
  },

  async saveNotification(notification) {
    const r = await trySupabase(() => supabase.from('notifications').insert(notification));
    if (r) return r;
    return sqlite.saveNotification(notification) || localDb.notifications.save(notification);
  },

  async getVideos(params = {}) {
    const r = await trySupabase(async () => {
      const { league, limit } = params;
      let q = supabase.from('videos').select('*');
      if (league) q = q.eq('league', league);
      return await q.order('created_at', { ascending: false }).limit(limit || 20);
    });
    if (r) return r;
    return sqlite.getVideos(params).length ? sqlite.getVideos(params) : localDb.videos.getAll();
  },

  async saveChatMessage(message) {
    const r = await trySupabase(() => supabase.from('chat_messages').insert(message));
    if (r) return r;
    return sqlite.saveChatMessage(message) || localDb.chat.save(message);
  },

  async getChatHistory(sessionId) {
    const r = await trySupabase(() => supabase.from('chat_messages').select('*').eq('session_id', sessionId).order('created_at'));
    if (r) return r;
    return sqlite.getChatHistory(sessionId).length ? sqlite.getChatHistory(sessionId) : localDb.chat.getBySession(sessionId);
  },

  async getComments(matchId) {
    return sqlite.getComments(matchId);
  },

  async addComment(matchId, author, text, userId = null) {
    return sqlite.addComment(matchId, author, text, userId);
  },

  async registerUser(username, passwordHash, email = null) {
    return sqlite.registerUser(username, passwordHash, email);
  },

  async loginUser(username) {
    return sqlite.loginUser(username);
  },

  async getUserById(id) {
    return sqlite.getUserById(id);
  },

  async addVideo(video) {
    return sqlite.addVideo(video);
  },

  async updateMatch(id, data) {
    return sqlite.updateMatch(id, data);
  },

  async getMatchGoals(matchId) {
    return sqlite.getMatchGoals(matchId);
  },

  async addMatchGoal(goal) {
    return sqlite.addMatchGoal(goal);
  },

  async searchAll(query) {
    try {
      if (supabase) {
        const teamsRes = await supabase.from('teams').select('*').ilike('name', `%${query}%`);
        const matchesRes = await supabase.from('matches').select('*').or(`home_team.ilike.%${query}%,away_team.ilike.%${query}%`);
        if (!teamsRes.error && !matchesRes.error) {
          return { teams: teamsRes.data || [], matches: matchesRes.data || [] };
        }
      }
    } catch {}
    return sqlite.searchAll(query);
  },
};

module.exports = db;