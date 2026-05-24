const express = require('express');
const crypto = require('crypto');
const db = require('../database/supabase');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = () => {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    try {
      const { username, password, email } = req.body;
      if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      if (username.length < 3) return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres' });
      if (password.length < 4) return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
      const user = await db.registerUser(username.trim(), hashPassword(password), email || null);
      if (!user) return res.status(409).json({ error: 'El usuario ya existe' });
      res.json({ user, token: user.id.toString() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      const user = await db.loginUser(username.trim());
      if (!user || user.password_hash !== hashPassword(password)) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
      }
      const { password_hash, ...safeUser } = user;
      res.json({ user: safeUser, token: safeUser.id.toString() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/me', async (req, res) => {
    try {
      const userId = req.headers.authorization;
      if (!userId) return res.status(401).json({ error: 'No autorizado' });
      const user = await db.getUserById(parseInt(userId));
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
