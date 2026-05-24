const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'futsal.db');

let db;

function getDb() {
  if (db) return db;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

function initSchema() {
  const conn = getDb();

  conn.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT UNIQUE,
      league TEXT,
      venue TEXT,
      logo_url TEXT,
      founded INTEGER,
      stadium TEXT,
      address TEXT,
      city TEXT,
      province TEXT,
      website TEXT,
      social_instagram TEXT,
      social_twitter TEXT,
      social_facebook TEXT,
      description TEXT,
      history TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      position TEXT,
      number INTEGER,
      nationality TEXT DEFAULT 'Argentina',
      age INTEGER,
      photo_url TEXT,
      goals INTEGER DEFAULT 0,
      assists INTEGER DEFAULT 0,
      yellow_cards INTEGER DEFAULT 0,
      red_cards INTEGER DEFAULT 0,
      matches_played INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (team_id) REFERENCES teams(id)
    );
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id TEXT,
      source TEXT DEFAULT 'manual',
      league TEXT NOT NULL DEFAULT 'primera-a',
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      home_score INTEGER,
      away_score INTEGER,
      status TEXT DEFAULT 'scheduled',
      minute INTEGER,
      date TEXT,
      time TEXT,
      venue TEXT,
      round TEXT,
      stream_link TEXT,
      youtube_link TEXT,
      home_yellow INTEGER DEFAULT 0,
      away_yellow INTEGER DEFAULT 0,
      home_red INTEGER DEFAULT 0,
      away_red INTEGER DEFAULT 0,
      home_fouls INTEGER DEFAULT 0,
      away_fouls INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS standings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      league TEXT NOT NULL,
      position INTEGER NOT NULL,
      team_name TEXT NOT NULL,
      played INTEGER DEFAULT 0,
      won INTEGER DEFAULT 0,
      drawn INTEGER DEFAULT 0,
      lost INTEGER DEFAULT 0,
      goals_for INTEGER DEFAULT 0,
      goals_against INTEGER DEFAULT 0,
      goal_difference INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS top_scorers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      league TEXT NOT NULL,
      player_name TEXT NOT NULL,
      team_name TEXT NOT NULL,
      goals INTEGER DEFAULT 0,
      matches_played INTEGER DEFAULT 0,
      assists INTEGER DEFAULT 0,
      yellow_cards INTEGER DEFAULT 0,
      red_cards INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      url TEXT NOT NULL,
      source TEXT DEFAULT 'futsalplay',
      category TEXT DEFAULT 'highlights',
      thumbnail TEXT,
      published_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT,
      password_hash TEXT NOT NULL,
      avatar_url TEXT,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS match_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      team TEXT NOT NULL CHECK(team IN ('home','away')),
      player_name TEXT NOT NULL,
      minute INTEGER NOT NULL,
      type TEXT DEFAULT 'goal' CHECK(type IN ('goal','own_goal','penalty')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (match_id) REFERENCES matches(id)
    );
    CREATE TABLE IF NOT EXISTS match_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      user_id INTEGER,
      author TEXT DEFAULT 'Anónimo',
      text TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      match_id INTEGER,
      league TEXT,
      data TEXT,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_teams_league ON teams(league);
    CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
    CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league);
    CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
    CREATE INDEX IF NOT EXISTS idx_standings_league ON standings(league);
    CREATE INDEX IF NOT EXISTS idx_scorers_league ON top_scorers(league);
    CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
  `);

  return conn;
}

const api = {
  conn: null,

  init() {
    this.conn = initSchema();
    return this;
  },

  getMatches({ league, date, team, status, limit = 50, offset = 0 } = {}) {
    let sql = 'SELECT * FROM matches WHERE 1=1';
    const params = [];
    if (league) { sql += ' AND league = ?'; params.push(league); }
    if (date) { sql += ' AND date = ?'; params.push(date); }
    if (team) { sql += ' AND (home_team LIKE ? OR away_team LIKE ?)'; params.push(`%${team}%`, `%${team}%`); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    const count = this.conn.prepare(sql.replace('SELECT *', 'SELECT COUNT(*) as total')).get(...params).total;
    sql += ' ORDER BY date DESC, time ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    return { data: this.conn.prepare(sql).all(...params), count };
  },

  getMatchById(id) { return this.conn.prepare('SELECT * FROM matches WHERE id = ?').get(id) || null; },

  getLiveMatches() { return this.conn.prepare("SELECT * FROM matches WHERE status IN ('live', 'halftime', 'second_half') ORDER BY league, date").all(); },

  getTodayMatches() {
    const today = new Date().toISOString().split('T')[0];
    return this.conn.prepare('SELECT * FROM matches WHERE date = ? ORDER BY time').all(today);
  },

  getUpcomingMatches(limit = 20) {
    const today = new Date().toISOString().split('T')[0];
    return this.conn.prepare("SELECT * FROM matches WHERE date >= ? AND status = 'scheduled' ORDER BY date, time LIMIT ?").all(today, limit);
  },

  getStandings(league) {
    if (league) return this.conn.prepare('SELECT * FROM standings WHERE league = ? ORDER BY position').all(league);
    return this.conn.prepare('SELECT * FROM standings ORDER BY league, position').all();
  },

  getTeams({ search, league } = {}) {
    let sql = 'SELECT * FROM teams WHERE 1=1';
    const params = [];
    if (search) { sql += ' AND name LIKE ?'; params.push(`%${search}%`); }
    if (league) { sql += ' AND league = ?'; params.push(league); }
    return this.conn.prepare(sql + ' ORDER BY name').all(...params);
  },

  getTeamBySlug(slug) { return this.conn.prepare('SELECT * FROM teams WHERE slug = ?').get(slug) || null; },

  getTeamById(id) { return this.conn.prepare('SELECT * FROM teams WHERE id = ?').get(id) || null; },

  updateTeam(id, data) {
    data.updated_at = new Date().toISOString();
    const cols = Object.keys(data);
    const set = cols.map(c => `"${c}" = ?`).join(', ');
    this.conn.prepare(`UPDATE teams SET ${set} WHERE id = ?`).run(...cols.map(c => data[c]), id);
    return this.getTeamById(id);
  },

  getPlayers(teamId) {
    return this.conn.prepare('SELECT * FROM players WHERE team_id = ? ORDER BY position, number').all(teamId);
  },

  addPlayer(player) {
    player.created_at = new Date().toISOString();
    player.updated_at = player.created_at;
    const cols = Object.keys(player);
    const result = this.conn.prepare(`INSERT INTO players (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`).run(...cols.map(c => player[c]));
    return this.conn.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid);
  },

  upsertTeam(team) {
    const existing = team.slug ? this.conn.prepare('SELECT id FROM teams WHERE slug = ?').get(team.slug) : null;
    team.updated_at = new Date().toISOString();
    if (existing) {
      const cols = Object.keys(team).filter(k => k !== 'id' && k !== 'slug');
      const set = cols.map(c => `"${c}" = ?`).join(', ');
      this.conn.prepare(`UPDATE teams SET ${set} WHERE id = ?`).run(...cols.map(c => team[c]), existing.id);
      return this.getTeamById(existing.id);
    }
    team.created_at = team.updated_at;
    const cols = Object.keys(team);
    const result = this.conn.prepare(`INSERT INTO teams (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`).run(...cols.map(c => team[c]));
    return this.getTeamById(result.lastInsertRowid);
  },

  getTopScorers(league, limit = 20) {
    let sql = 'SELECT * FROM top_scorers WHERE 1=1';
    const params = [];
    if (league) { sql += ' AND league = ?'; params.push(league); }
    return this.conn.prepare(sql + ' ORDER BY goals DESC LIMIT ?').all(...params.concat([limit]));
  },

  getH2H(team1, team2) {
    return this.conn.prepare(
      "SELECT * FROM matches WHERE (home_team = ? AND away_team = ?) OR (home_team = ? AND away_team = ?) ORDER BY date"
    ).all(team1, team2, team2, team1);
  },

  upsertMatch(match) {
    const existing = this.conn.prepare('SELECT id, stream_link, youtube_link FROM matches WHERE source_id = ? AND source = ?').get(match.source_id, match.source || 'manual');
    match.updated_at = new Date().toISOString();
    if (existing) {
      match.id = existing.id;
      // Preserve existing stream/youtube links if not provided in update
      if (!match.stream_link && existing.stream_link) match.stream_link = existing.stream_link;
      if (!match.youtube_link && existing.youtube_link) match.youtube_link = existing.youtube_link;
      const cols = Object.keys(match).filter(k => k !== 'id');
      const set = cols.map(c => `"${c}" = ?`).join(', ');
      this.conn.prepare(`UPDATE matches SET ${set} WHERE id = ?`).run(...cols.map(c => match[c]), match.id);
      return match;
    }
    match.created_at = match.updated_at;
    const cols = Object.keys(match);
    const placeholders = cols.map(() => '?').join(', ');
    const result = this.conn.prepare(`INSERT INTO matches (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`).run(...cols.map(c => match[c]));
    match.id = result.lastInsertRowid;
    return match;
  },

  upsertStandings(rows) {
    for (const row of rows) {
      const existing = this.conn.prepare('SELECT id FROM standings WHERE league = ? AND team_name = ?').get(row.league, row.team_name);
      row.goal_difference = (row.goals_for || 0) - (row.goals_against || 0);
      row.updated_at = new Date().toISOString();
      if (existing) {
        const cols = Object.keys(row).filter(k => k !== 'id');
        const set = cols.map(c => `"${c}" = ?`).join(', ');
        this.conn.prepare(`UPDATE standings SET ${set} WHERE id = ?`).run(...cols.map(c => row[c]), existing.id);
      } else {
        row.created_at = new Date().toISOString();
        const cols = Object.keys(row);
        this.conn.prepare(`INSERT INTO standings (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`).run(...cols.map(c => row[c]));
      }
    }
  },

  upsertTopScorers(rows) {
    for (const row of rows) {
      const existing = this.conn.prepare('SELECT id FROM top_scorers WHERE league = ? AND player_name = ?').get(row.league, row.player_name);
      row.updated_at = new Date().toISOString();
      if (existing) {
        const cols = Object.keys(row).filter(k => k !== 'id');
        const set = cols.map(c => `"${c}" = ?`).join(', ');
        this.conn.prepare(`UPDATE top_scorers SET ${set} WHERE id = ?`).run(...cols.map(c => row[c]), existing.id);
      } else {
        row.created_at = new Date().toISOString();
        const cols = Object.keys(row);
        this.conn.prepare(`INSERT INTO top_scorers (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`).run(...cols.map(c => row[c]));
      }
    }
  },

  getNotifications() { return this.conn.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50').all(); },

  saveNotification(notification) {
    notification.created_at = new Date().toISOString();
    const cols = Object.keys(notification);
    const result = this.conn.prepare(`INSERT INTO notifications (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`).run(...cols.map(c => notification[c]));
    return { ...notification, id: result.lastInsertRowid };
  },

  getVideos({ league, team, limit = 20 } = {}) {
    let sql = 'SELECT * FROM videos WHERE 1=1';
    const params = [];
    if (league) { sql += ' AND league = ?'; params.push(league); }
    return this.conn.prepare(sql + ' ORDER BY created_at DESC LIMIT ?').all(...params.concat([limit]));
  },

  saveChatMessage(message) {
    message.created_at = new Date().toISOString();
    const cols = Object.keys(message);
    const result = this.conn.prepare(`INSERT INTO chat_messages (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`).run(...cols.map(c => message[c]));
    return { ...message, id: result.lastInsertRowid };
  },

  getChatHistory(sessionId) { return this.conn.prepare('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at').all(sessionId); },

  getComments(matchId) {
    return this.conn.prepare(`
      SELECT mc.*, u.username as user_username, u.avatar_url as user_avatar
      FROM match_comments mc
      LEFT JOIN users u ON mc.user_id = u.id
      WHERE mc.match_id = ?
      ORDER BY mc.created_at DESC LIMIT 50
    `).all(matchId);
  },

  addComment(matchId, author, text, userId = null) {
    const result = this.conn.prepare('INSERT INTO match_comments (match_id, user_id, author, text) VALUES (?, ?, ?, ?)').run(matchId, userId, author, text);
    return this.conn.prepare(`
      SELECT mc.*, u.username as user_username, u.avatar_url as user_avatar
      FROM match_comments mc
      LEFT JOIN users u ON mc.user_id = u.id
      WHERE mc.id = ?
    `).get(result.lastInsertRowid);
  },

  registerUser(username, passwordHash, email = null) {
    const existing = this.conn.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) return null;
    const result = this.conn.prepare('INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)').run(username, passwordHash, email);
    return this.conn.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  },

  loginUser(username) {
    return this.conn.prepare('SELECT id, username, password_hash, email, role, avatar_url FROM users WHERE username = ?').get(username);
  },

  getUserById(id) {
    return this.conn.prepare('SELECT id, username, email, role, avatar_url, created_at FROM users WHERE id = ?').get(id);
  },

  addVideo(video) {
    video.created_at = new Date().toISOString();
    const cols = Object.keys(video);
    const result = this.conn.prepare(`INSERT INTO videos (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`).run(...cols.map(c => video[c]));
    return { ...video, id: result.lastInsertRowid };
  },

  updateMatch(id, data) {
    data.updated_at = new Date().toISOString();
    const cols = Object.keys(data).filter(k => k !== 'id');
    const set = cols.map(c => `"${c}" = ?`).join(', ');
    this.conn.prepare(`UPDATE matches SET ${set} WHERE id = ?`).run(...cols.map(c => data[c]), id);
    return this.getMatchById(id);
  },

  getMatchGoals(matchId) {
    return this.conn.prepare('SELECT * FROM match_goals WHERE match_id = ? ORDER BY minute').all(matchId);
  },

  addMatchGoal(goal) {
    goal.created_at = new Date().toISOString();
    const cols = Object.keys(goal);
    const result = this.conn.prepare(`INSERT INTO match_goals (${cols.map(c => `"${c}"`).join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`).run(...cols.map(c => goal[c]));
    return this.conn.prepare('SELECT * FROM match_goals WHERE id = ?').get(result.lastInsertRowid);
  },

  searchAll(query) {
    const q = `%${query}%`;
    return {
      teams: this.conn.prepare('SELECT * FROM teams WHERE name LIKE ?').all(q),
      matches: this.conn.prepare('SELECT * FROM matches WHERE home_team LIKE ? OR away_team LIKE ?').all(q, q),
    };
  },
};

module.exports = api.init();