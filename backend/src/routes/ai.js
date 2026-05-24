const express = require('express');
const router = express.Router();
const aiService = require('../ai/aiService');

router.post('/chat', async (req, res) => {
  try {
    const { message, prompt, history, context } = req.body;
    const text = message || prompt;
    if (!text) return res.status(400).json({ error: 'Mensaje es requerido' });
    const result = await aiService.chat(text, { history: history || [], ...(context || {}) });
    res.json({ response: result.response || result.text || result.message || JSON.stringify(result) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analyze/:matchId', async (req, res) => {
  try {
    const result = await aiService.analyzeMatch(req.params.matchId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/compare', async (req, res) => {
  try {
    const { team1, team2 } = req.body;
    if (!team1 || !team2) return res.status(400).json({ error: 'Se requieren dos equipos' });
    const result = await aiService.compareTeams(team1, team2);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
