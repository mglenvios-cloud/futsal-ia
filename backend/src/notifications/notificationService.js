const db = require('../database/supabase');

class NotificationService {
  constructor() {
    this.subscribers = new Map();
    this.matchTimers = new Map();
  }

  async sendGoalAlert(matchId, team, scorer, minute) {
    const match = await db.getMatchById(matchId);
    if (!match) return;

    const message = {
      type: 'goal',
      title: '⚽ ¡GOL!',
      body: `${scorer || 'Jugador'} de ${team} anotó a los ${minute}'`,
      match: `${match.home_team} vs ${match.away_team}`,
      league: match.league,
      timestamp: new Date().toISOString(),
    };

    await this.broadcast(message);
  }

  async sendMatchStart(matchId) {
    const match = await db.getMatchById(matchId);
    if (!match) return;

    const message = {
      type: 'match_start',
      title: '🔴 PARTIDO EN VIVO',
      body: `${match.home_team} vs ${match.away_team} - ${match.league}`,
      matchId: match.id,
      timestamp: new Date().toISOString(),
    };

    await this.broadcast(message);
  }

  async sendMatchEnd(matchId) {
    const match = await db.getMatchById(matchId);
    if (!match) return;

    const message = {
      type: 'match_end',
      title: '✅ PARTIDO FINALIZADO',
      body: `${match.home_team} ${match.home_score ?? 0} - ${match.away_score ?? 0} ${match.away_team}`,
      matchId: match.id,
      timestamp: new Date().toISOString(),
    };

    await this.broadcast(message);
  }

  async sendRedCardAlert(matchId, team, player, minute) {
    const match = await db.getMatchById(matchId);
    if (!match) return;

    const message = {
      type: 'red_card',
      title: '🟥 TARJETA ROJA',
      body: `${player || 'Jugador'} de ${team} expulsado a los ${minute}'`,
      match: `${match.home_team} vs ${match.away_team}`,
      timestamp: new Date().toISOString(),
    };

    await this.broadcast(message);
  }

  async sendUpcomingMatch(match) {
    const message = {
      type: 'upcoming',
      title: '📅 PRÓXIMO PARTIDO',
      body: `${match.home_team} vs ${match.away_team} - ${match.date} ${match.time || ''}`,
      league: match.league,
      matchId: match.id,
      timestamp: new Date().toISOString(),
    };

    await this.broadcast(message);
  }

  async broadcast(message) {
    if (global.io) {
      global.io.emit('notification', message);
    }

    try {
      await db.saveNotification({
        type: message.type,
        title: message.title,
        body: message.body,
        data: message,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Save notification error:', err.message);
    }
  }

  getSubscribers() {
    return Array.from(this.subscribers.keys());
  }
}

module.exports = new NotificationService();
