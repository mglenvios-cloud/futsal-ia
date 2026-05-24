const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(file) {
  try {
    const p = path.join(DATA_DIR, file);
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch { return []; }
}

function writeJson(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  matches: {
    getAll() { return readJson('matches.json'); },
    getLive() { return readJson('matches.json').filter(m => m.status === 'live'); },
    getToday() {
      const today = new Date().toISOString().split('T')[0];
      return readJson('matches.json').filter(m => m.date === today);
    },
    getById(id) { return readJson('matches.json').find(m => m.id == id) || null; },
    getUpcoming(limit = 20) {
      const today = new Date().toISOString().split('T')[0];
      return readJson('matches.json').filter(m => m.status === 'scheduled' && m.date >= today).slice(0, limit);
    },
    upsert(match) {
      const matches = readJson('matches.json');
      const idx = matches.findIndex(m => m.source_id === match.source_id && m.source === match.source);
      if (idx >= 0) { matches[idx] = { ...matches[idx], ...match }; }
      else { match.id = matches.length + 1; matches.push(match); }
      writeJson('matches.json', matches);
      return match;
    },
    search(query) {
      const q = query.toLowerCase();
      return readJson('matches.json').filter(m =>
        m.home_team?.toLowerCase().includes(q) || m.away_team?.toLowerCase().includes(q)
      );
    },
    getByTeam(team) {
      const q = team.toLowerCase();
      return readJson('matches.json').filter(m =>
        m.home_team?.toLowerCase().includes(q) || m.away_team?.toLowerCase().includes(q)
      );
    },
  },
  standings: {
    get(league) {
      const data = readJson('standings.json');
      if (league) return data.filter(s => s.league === league);
      return data;
    },
    upsert(rows) {
      const existing = readJson('standings.json');
      for (const row of rows) {
        const idx = existing.findIndex(s => s.league === row.league && s.team_name === row.team_name);
        if (idx >= 0) existing[idx] = { ...existing[idx], ...row };
        else existing.push(row);
      }
      writeJson('standings.json', existing);
    },
  },
  teams: {
    getAll() { return readJson('teams.json'); },
    getBySlug(slug) { return readJson('teams.json').find(t => t.slug === slug) || null; },
    getByName(name) { return readJson('teams.json').find(t => t.name?.toLowerCase() === name?.toLowerCase()) || null; },
    search(query) {
      const q = query.toLowerCase();
      return readJson('teams.json').filter(t => t.name?.toLowerCase().includes(q));
    },
  },
  scorers: {
    get(league) {
      const data = readJson('scorers.json');
      if (league) return data.filter(s => s.league === league);
      return data;
    },
    upsert(rows) {
      const existing = readJson('scorers.json');
      for (const row of rows) {
        const idx = existing.findIndex(s => s.league === row.league && s.player_name === row.player_name);
        if (idx >= 0) existing[idx] = { ...existing[idx], ...row };
        else existing.push(row);
      }
      writeJson('scorers.json', existing);
    },
  },
  notifications: {
    getAll() { return readJson('notifications.json'); },
    save(n) {
      const items = readJson('notifications.json');
      items.unshift({ ...n, id: items.length + 1, created_at: new Date().toISOString(), read: false });
      writeJson('notifications.json', items);
      return items[0];
    },
  },
  chat: {
    save(msg) {
      const items = readJson('chat.json');
      items.push({ ...msg, id: items.length + 1, created_at: new Date().toISOString() });
      writeJson('chat.json', items);
      return msg;
    },
    getBySession(sessionId) {
      return readJson('chat.json').filter(m => m.session_id === sessionId);
    },
  },
  videos: {
    getAll() { return readJson('videos.json'); },
    save(v) {
      const items = readJson('videos.json');
      items.push({ ...v, id: items.length + 1, created_at: new Date().toISOString() });
      writeJson('videos.json', items);
    },
  },
};
