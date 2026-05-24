const express = require('express');
const db = require('../database/supabase');
const liveMatchService = require('../services/liveMatchService');

module.exports = (io) => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const params = {};
      if (req.query.league) params.league = req.query.league;
      if (req.query.date) params.date = req.query.date;
      if (req.query.team) params.team = req.query.team;
      if (req.query.status) params.status = req.query.status;
      if (req.query.limit) params.limit = parseInt(req.query.limit);
      if (req.query.offset) params.offset = parseInt(req.query.offset);
      const result = await db.getMatches(params);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/live', async (req, res) => {
    try {
      const summary = await liveMatchService.getLiveSummary();
      res.json(summary);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/today', async (req, res) => {
    try {
      const matches = await db.getTodayMatches();
      res.json(matches);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/upcoming', async (req, res) => {
    try {
      const matches = await db.getUpcomingMatches(parseInt(req.query.limit) || 20);
      res.json(matches);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const match = await db.getMatchById(req.params.id);
      if (!match) return res.status(404).json({ error: 'Partido no encontrado' });
      const goals = await db.getMatchGoals(req.params.id);
      res.json({ ...match, goals });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const existing = await db.getMatchById(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Partido no encontrado' });

      const allowed = ['home_score','away_score','status','minute','home_yellow','away_yellow','home_red','away_red','home_fouls','away_fouls','stream_link','youtube_link'];
      const updates = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }

      if (updates.status === 'finished' && !existing.home_score && !existing.away_score && (req.body.home_score === undefined || req.body.away_score === undefined)) {
        // if finishing without score, set 0-0
        updates.home_score = updates.home_score ?? 0;
        updates.away_score = updates.away_score ?? 0;
      }

      const updated = await db.updateMatch(req.params.id, updates);

      if (io) {
        io.to(`match:${req.params.id}`).emit('match:update', { ...updated, timestamp: new Date().toISOString() });
        io.to('live:all').emit('live:update', { match: updated });
      }

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/:id/goals', async (req, res) => {
    try {
      const goals = await db.getMatchGoals(req.params.id);
      res.json(goals);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/:id/goals', async (req, res) => {
    try {
      const match = await db.getMatchById(req.params.id);
      if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

      const { team, player_name, minute, type } = req.body;
      if (!team || !player_name || minute === undefined) {
        return res.status(400).json({ error: 'Faltan datos: team, player_name, minute' });
      }
      if (!['home','away'].includes(team)) {
        return res.status(400).json({ error: 'team debe ser home o away' });
      }

      const goal = await db.addMatchGoal({ match_id: parseInt(req.params.id), team, player_name, minute, type: type || 'goal' });

      // Auto-update score
      const goals = await db.getMatchGoals(req.params.id);
      const homeGoals = goals.filter(g => g.team === 'home').length;
      const awayGoals = goals.filter(g => g.team === 'away').length;
      await db.updateMatch(req.params.id, { home_score: homeGoals, away_score: awayGoals });

      const updated = await db.getMatchById(req.params.id);
      if (io) {
        io.to(`match:${req.params.id}`).emit('match:update', { ...updated, goals, timestamp: new Date().toISOString() });
        io.to('live:all').emit('live:goal', { matchId: req.params.id, goal, score: { home: homeGoals, away: awayGoals } });
      }

      res.json({ goal, match: updated });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
