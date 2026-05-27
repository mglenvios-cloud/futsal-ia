const express = require('express');
const router = express.Router();
const sqlite = require('../database/sqlite');

router.get('/', (req, res) => {
  try {
    const { group: group_name } = req.query;
    const matches = sqlite.getLibertadoresMatches({ group_name });
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/standings', (req, res) => {
  try {
    const matches = sqlite.getLibertadoresMatches();
    const groups = {};
    for (const m of matches) {
      if (!groups[m.group_name]) groups[m.group_name] = {};
      const home = m.home_team.replace(/\s*\([^)]*\)\s*/g, '').trim();
      const away = m.away_team.replace(/\s*\([^)]*\)\s*/g, '').trim();
      if (!groups[m.group_name][home]) groups[m.group_name][home] = { team: m.home_team, teamShort: home, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, played: 0 };
      if (!groups[m.group_name][away]) groups[m.group_name][away] = { team: m.away_team, teamShort: away, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0, played: 0 };
      if (m.status === 'finished' && m.home_score != null && m.away_score != null) {
        groups[m.group_name][home].played++;
        groups[m.group_name][away].played++;
        groups[m.group_name][home].gf += m.home_score;
        groups[m.group_name][home].ga += m.away_score;
        groups[m.group_name][away].gf += m.away_score;
        groups[m.group_name][away].ga += m.home_score;
        if (m.home_score > m.away_score) { groups[m.group_name][home].w++; groups[m.group_name][home].pts += 3; groups[m.group_name][away].l++; }
        else if (m.home_score < m.away_score) { groups[m.group_name][away].w++; groups[m.group_name][away].pts += 3; groups[m.group_name][home].l++; }
        else { groups[m.group_name][home].d++; groups[m.group_name][home].pts++; groups[m.group_name][away].d++; groups[m.group_name][away].pts++; }
      }
    }
    for (const g in groups) {
      for (const t in groups[g]) {
        groups[g][t].gd = groups[g][t].gf - groups[g][t].ga;
      }
      groups[g] = Object.values(groups[g]).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    }
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
