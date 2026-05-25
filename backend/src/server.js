require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const cron = require('node-cron');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

const db = require('./database/supabase');
const scraperService = require('./services/scraperService');
const liveMatchService = require('./services/liveMatchService');
const aiService = require('./ai/aiService');
const notificationService = require('./notifications/notificationService');

app.use('/api/matches', require('./routes/matches')(io));
app.use('/api/matches', require('./routes/comments')());
app.use('/api/teams', require('./routes/teams'));
app.use('/api/standings', require('./routes/standings'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/scraper', require('./routes/scraper'));
app.use('/api/search', require('./routes/search'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/h2h', require('./routes/h2h'));
app.use('/api/auth', require('./routes/auth')());
app.use('/api/notifications', require('./routes/notifications'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('subscribe:match', (matchId) => {
    socket.join(`match:${matchId}`);
  });

  socket.on('unsubscribe:match', (matchId) => {
    socket.leave(`match:${matchId}`);
  });

  socket.on('subscribe:league', (leagueId) => {
    socket.join(`league:${leagueId}`);
  });

  socket.on('subscribe:live', () => {
    socket.join('live:all');
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.set('io', io);

liveMatchService.init(io);
scraperService.init(io);

cron.schedule('*/30 * * * * *', async () => {
  try {
    await scraperService.scrapeAllSources();
  } catch (err) {
    console.error('Scheduled scrape error:', err.message);
  }
});

cron.schedule('*/5 * * * *', async () => {
  try {
    await liveMatchService.checkLiveMatches();
  } catch (err) {
    console.error('Live match check error:', err.message);
  }
});

const sqlite = require('./database/sqlite');

const PORT = process.env.PORT || 4000;

async function start() {
  await sqlite.init();
  console.log('Database initialized');

  server.listen(PORT, () => {
    console.log(`Futsal IA Backend running on port ${PORT}`);
    console.log(`WebSocket server ready`);
    scraperService.initialScrape();
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
