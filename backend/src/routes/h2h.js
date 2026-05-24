const express = require('express');
const router = express.Router();
const db = require('../database/supabase');

router.get('/:team1/:team2', async (req, res) => {
  try {
    const { team1, team2 } = req.params;
    const matches = await db.getH2H(team1, team2);
    const team1Wins = matches.filter(m =>
      (m.home_team === team1 && m.home_score > m.away_score) ||
      (m.away_team === team1 && m.away_score > m.home_score)
    ).length;
    const team2Wins = matches.filter(m =>
      (m.home_team === team2 && m.home_score > m.away_score) ||
      (m.away_team === team2 && m.away_score > m.home_score)
    ).length;
    const draws = matches.length - team1Wins - team2Wins;
    res.json({ matches, stats: { total_matches: matches.length, team1_wins: team1Wins, team2_wins: team2Wins, draws } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/compare', async (req, res) => {
  try {
    const { team1, team2 } = req.body;
    if (!team1 || !team2) return res.status(400).json({ error: 'team1 and team2 required' });
    const matches = await db.getH2H(team1, team2);
    const team1Wins = matches.filter(m =>
      (m.home_team === team1 && m.home_score > m.away_score) ||
      (m.away_team === team1 && m.away_score > m.home_score)
    ).length;
    const team2Wins = matches.filter(m =>
      (m.home_team === team2 && m.home_score > m.away_score) ||
      (m.away_team === team2 && m.away_score > m.home_score)
    ).length;
    const draws = matches.length - team1Wins - team2Wins;
    res.json({ matches, stats: { total_matches: matches.length, team1_wins: team1Wins, team2_wins: team2Wins, draws } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;