const express = require('express');
const router = express.Router();
const db = require('../database/supabase');

router.get('/', async (req, res) => {
  try {
    const { search, league } = req.query;
    const teams = await db.getTeams({ search, league });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const team = await db.getTeamBySlug(req.params.slug);
    if (!team) return res.status(404).json({ error: 'Equipo no encontrado' });

    const matches = (await db.getMatches({ team: team.name, limit: 20 })).data || [];
    const standings = await db.getStandings(team.league);
    const position = standings.find(s => s.team_name === team.name) || null;
    res.json({ ...team, matches, position: position?.position || null, points: position?.points || 0, players: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug/matches', async (req, res) => {
  try {
    const team = await db.getTeamBySlug(req.params.slug);
    if (!team) return res.status(404).json({ error: 'Equipo no encontrado' });

    const matches = (await db.getMatches({ team: team.name, limit: parseInt(req.query.limit) || 20 })).data || [];
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
