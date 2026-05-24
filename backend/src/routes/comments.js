const express = require('express');
const db = require('../database/supabase');

module.exports = () => {
  const router = express.Router();

  router.get('/:matchId/comments', async (req, res) => {
    try {
      const comments = await db.getComments(req.params.matchId);
      res.json(comments || []);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/:matchId/comments', async (req, res) => {
    try {
      const { text, author, userId } = req.body;
      if (!text || !text.trim()) return res.status(400).json({ error: 'El comentario no puede estar vacío' });
      const comment = await db.addComment(req.params.matchId, (author || 'Anónimo').trim(), text.trim(), userId || null);
      res.json(comment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
