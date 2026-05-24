const express = require('express');
const db = require('../database/supabase');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /mp4|webm|mov|avi|mkv|jpg|png|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(null, ext);
  },
});

module.exports = () => {
  const router = express.Router();

  router.get('/', (req, res) => {
    try {
      const videos = db.getVideos(req.query);
      res.json(videos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/upload', upload.single('video'), (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
      const video = db.addVideo({
        title: req.body.title || req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        source: 'upload',
        category: req.body.category || 'highlights',
        thumbnail: req.body.thumbnail || null,
        league: req.body.league || null,
        published_at: new Date().toISOString(),
      });
      res.json(video);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
