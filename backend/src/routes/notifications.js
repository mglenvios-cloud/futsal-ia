const express = require('express');
const router = express.Router();
const db = require('../database/supabase');

router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.json([]);
    const notifications = await db.getNotifications(userId);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
