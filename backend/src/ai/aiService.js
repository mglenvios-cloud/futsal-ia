const OpenAI = require('openai');
const db = require('../database/supabase');

class AIService {
  constructor() {
    this.openai = null;
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    this.futsalKnowledge = {
      leagues: [
        'Primera A', 'Primera B', 'Primera C', 'Primera D Zona A', 'Primera D Zona B',
        'Femenino Primera A', 'Femenino Primera B', 'Copa Argentina',
      ],
      topTeams: [
        'Pinocho', 'San Lorenzo', 'Boca Juniors', 'River Plate', 'Barracas Central',
        '17 de Agosto', 'América del Sud', 'Ferro Carril Oeste', 'Kimberley',
        'Racing Club', 'Independiente', 'Camioneros',
      ],
    };
  }

  async chat(prompt, context = {}) {
    try {
      // Obtener datos reales de la BD según las keywords del mensaje
      const liveData = await this.fetchContextData(prompt, context);
      const systemPrompt = this.buildSystemPrompt(context, liveData);

      const historyMessages = (context.history || []).map((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content,
      }));

      const messages = [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        { role: 'user', content: prompt },
      ];

      if (!this.openai) {
        return this.fallbackResponse(prompt, context, liveData);
      }

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      });

      return {
        success: true,
        response: completion.choices[0]?.message?.content || 'No se pudo generar respuesta',
        model: 'gpt-4',
      };
    } catch (err) {
      console.error('AI chat error:', err.message);
      return this.fallbackResponse(prompt, context);
    }
  }

  // Busca datos reales en la BD según las keywords del mensaje
  async fetchContextData(prompt, context = {}) {
    const lower = prompt.toLowerCase();
    const data = {};

    try {
      // Siempre traer partidos en vivo
      data.live = await db.getLiveMatches().catch(() => []);

      // Partidos con transmisión
      if (lower.includes('transmit') || lower.includes('lpf') || lower.includes('youtube') || lower.includes('vivo') || lower.includes('ver') || lower.includes('canal')) {
        const result = await db.getMatches({ limit: 50 });
        const all = result.data || result || [];
        data.streaming = all.filter(m =>
          (m.stream_link && m.stream_link.trim() !== '') ||
          (m.youtube_link && m.youtube_link.trim() !== '')
        ).slice(0, 10);
      }

      // Partidos de hoy
      if (lower.includes('hoy') || lower.includes('hoy') || lower.includes('partido') || lower.includes('resultado')) {
        data.today = await db.getTodayMatches().catch(() => []);
      }

      // Próximos partidos
      if (lower.includes('próximo') || lower.includes('proximo') || lower.includes('fixture') || lower.includes('cuando')) {
        data.upcoming = await db.getUpcomingMatches(5).catch(() => []);
      }

      // Posiciones de Primera A por defecto
      if (lower.includes('posicion') || lower.includes('tabla') || lower.includes('puntaje') || lower.includes('lider')) {
        const league = context.league || 'primera-a';
        data.standings = await db.getStandings(league).catch(() => []);
      }

      // Equipo específico mencionado
      if (context.team) {
        const matches = (await db.getMatches({ team: context.team, limit: 5 })).data || [];
        data.teamMatches = matches;
      }

      // Buscar equipo por nombre en el mensaje
      const teamNames = this.futsalKnowledge.topTeams;
      for (const team of teamNames) {
        if (lower.includes(team.toLowerCase())) {
          const matches = (await db.getMatches({ team, limit: 5 })).data || [];
          if (matches.length > 0) {
            data.teamMatches = matches;
            data.mentionedTeam = team;
            break;
          }
        }
      }

    } catch (err) {
      console.error('Context data fetch error:', err.message);
    }

    return data;
  }

  buildSystemPrompt(context, liveData = {}) {
    const now = new Date();
    const fecha = now.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const hora = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    let prompt = `Eres FutsalBot, el asistente oficial del portal Futsal Online, especializado en el Futsal Argentino AFA.
Fecha y hora actual: ${fecha}, ${hora}.

Divisiones: ${this.futsalKnowledge.leagues.join(', ')}
Equipos destacados: ${this.futsalKnowledge.topTeams.join(', ')}

Podés ayudar con:
- Resultados en vivo y del día
- Tabla de posiciones de cada división
- Fixture y próximos partidos
- ¿Qué partidos se transmiten por LPF Play o YouTube?
- Comparación de equipos (H2H)
- Reglamento del futsal AFA`;

    // Inyectar datos reales en el contexto
    if (liveData.live && liveData.live.length > 0) {
      prompt += `\n\n🔴 PARTIDOS EN VIVO AHORA:\n${liveData.live.map(m =>
        `- ${m.home_team} ${m.home_score ?? '?'}-${m.away_score ?? '?'} ${m.away_team} (${m.league})`
      ).join('\n')}`;
    } else {
      prompt += `\n\n🔴 No hay partidos en vivo en este momento.`;
    }

    if (liveData.today && liveData.today.length > 0) {
      prompt += `\n\n📅 PARTIDOS DE HOY:\n${liveData.today.map(m =>
        `- ${m.home_team} vs ${m.away_team} ${m.time || ''} (${m.league}) estado: ${m.status}`
      ).join('\n')}`;
    }

    if (liveData.streaming && liveData.streaming.length > 0) {
      prompt += `\n\n📺 PARTIDOS CON TRANSMISIÓN:\n${liveData.streaming.map(m => {
        const canales = [];
        if (m.stream_link && m.stream_link.trim()) canales.push(`LPF Play: ${m.stream_link}`);
        if (m.youtube_link && m.youtube_link.trim()) canales.push(`YouTube: ${m.youtube_link}`);
        return `- ${m.home_team} vs ${m.away_team} (${m.date}) — ${canales.join(', ')}`;
      }).join('\n')}`;
    }

    if (liveData.upcoming && liveData.upcoming.length > 0) {
      prompt += `\n\n📆 PRÓXIMOS PARTIDOS:\n${liveData.upcoming.map(m =>
        `- ${m.home_team} vs ${m.away_team} el ${m.date} ${m.time || ''} (${m.league})`
      ).join('\n')}`;
    }

    if (liveData.standings && liveData.standings.length > 0) {
      prompt += `\n\n🏆 POSICIONES ${context.league || 'PRIMERA A'}:\n${liveData.standings.slice(0, 8).map(s =>
        `${s.position}. ${s.team_name} — ${s.points}pts (${s.played}PJ, ${s.wins}G, ${s.draws}E, ${s.losses}P)`
      ).join('\n')}`;
    }

    if (liveData.teamMatches && liveData.teamMatches.length > 0) {
      const team = liveData.mentionedTeam || context.team;
      prompt += `\n\n⚽ ÚLTIMOS PARTIDOS DE ${team}:\n${liveData.teamMatches.map(m =>
        `- ${m.home_team} ${m.home_score ?? '-'}-${m.away_score ?? '-'} ${m.away_team} (${m.date}) ${m.status === 'finished' ? '✅' : ''}`
      ).join('\n')}`;
    }

    prompt += '\n\nResponde en español argentino. Sé directo, preciso y amigable. Usá los datos reales provistos arriba cuando los necesites.';
    return prompt;
  }

  async analyzeMatch(matchId) {
    const match = await db.getMatchById(matchId);
    if (!match) return { error: 'Partido no encontrado' };
    const h2h = await db.getH2H(match.home_team || match.home_team_name, match.away_team || match.away_team_name);

    const prompt = `Analiza el siguiente partido de futsal:
Local: ${match.home_team} vs Visitante: ${match.away_team}
Liga: ${match.league}
Fecha: ${match.date} ${match.time}
Resultado: ${match.home_score ?? '-'} - ${match.away_score ?? '-'}
Estado: ${match.status}
Historial H2H: ${JSON.stringify(h2h)}

Proporciona:
1. Análisis del partido
2. Datos clave
3. Estadísticas relevantes
4. Pronóstico`;

    return this.chat(prompt, { match });
  }

  async compareTeams(team1, team2) {
    const matches = await db.getH2H(team1, team2);
    const prompt = `Compara los equipos de futsal:
Equipo 1: ${team1}
Equipo 2: ${team2}
Historial H2H: ${JSON.stringify(matches)}

Proporciona:
1. Comparativa detallada
2. Historial de enfrentamientos
3. Fortalezas y debilidades
4. Predicción del próximo partido`;

    return this.chat(prompt, { team: `${team1} vs ${team2}` });
  }

  fallbackResponse(prompt, context = {}, liveData = {}) {
    const lower = prompt.toLowerCase();
    let response = '';

    // Transmisiones
    if (lower.includes('transmit') || lower.includes('lpf') || lower.includes('youtube') || lower.includes('canal') || lower.includes('ver en vivo')) {
      if (liveData.streaming && liveData.streaming.length > 0) {
        response = `📺 **Partidos con transmisión disponible:**\n\n`;
        liveData.streaming.forEach(m => {
          response += `• **${m.home_team} vs ${m.away_team}** (${m.date})\n`;
          if (m.stream_link && m.stream_link.trim()) response += `  🟠 LPF Play: ${m.stream_link}\n`;
          if (m.youtube_link && m.youtube_link.trim()) response += `  🔴 YouTube: ${m.youtube_link}\n`;
        });
      } else {
        response = 'No encontré partidos con transmisión programada en este momento. Los partidos con transmisión por **LPF Play** o **YouTube** aparecen en la sección "📺 Transmisiones" del inicio.';
      }

    // En vivo
    } else if (lower.includes('vivo') || lower.includes('jugando') || lower.includes('ahora')) {
      if (liveData.live && liveData.live.length > 0) {
        response = `🔴 **Partidos en vivo ahora:**\n\n`;
        liveData.live.forEach(m => {
          response += `• **${m.home_team} ${m.home_score ?? '?'} - ${m.away_score ?? '?'} ${m.away_team}**\n  Liga: ${m.league}\n`;
        });
      } else {
        response = 'No hay partidos en vivo en este momento. Podés ver los próximos partidos en la sección **"Partidos"** del menú.';
      }

    // Hoy
    } else if (lower.includes('hoy') && (lower.includes('partido') || lower.includes('result'))) {
      if (liveData.today && liveData.today.length > 0) {
        response = `📅 **Partidos de hoy:**\n\n`;
        liveData.today.forEach(m => {
          const score = m.home_score !== null ? `${m.home_score}-${m.away_score}` : m.time || 'Hora a confirmar';
          response += `• ${m.home_team} vs ${m.away_team} — ${score}\n`;
        });
      } else {
        response = 'No encontré partidos programados para hoy. Revisá el **fixture** en la sección "Partidos".';
      }

    // Posiciones
    } else if (lower.includes('posicion') || lower.includes('tabla') || lower.includes('puntaje')) {
      if (liveData.standings && liveData.standings.length > 0) {
        response = `🏆 **Tabla de Posiciones (${context.league || 'Primera A'}):**\n\n`;
        liveData.standings.slice(0, 8).forEach(s => {
          response += `${s.position}. **${s.team_name}** — ${s.points}pts\n`;
        });
        response += '\nPodés ver la tabla completa en la sección **"Posiciones"**.';
      } else {
        response = 'Las posiciones se actualizan automáticamente. Revisá la sección **"Posiciones"** del menú para ver las tablas completas de todas las divisiones.';
      }

    // Equipo específico
    } else if (liveData.teamMatches && liveData.teamMatches.length > 0) {
      const team = liveData.mentionedTeam || context.team;
      response = `⚽ **Últimos partidos de ${team}:**\n\n`;
      liveData.teamMatches.forEach(m => {
        const score = m.home_score !== null ? `${m.home_score}-${m.away_score}` : 'vs';
        response += `• ${m.home_team} **${score}** ${m.away_team} (${m.date})\n`;
      });

    } else {
      response = `Soy **FutsalBot** 🤖, tu asistente de Futsal Argentino AFA. Puedo ayudarte con:\n\n• 🔴 **¿Hay partidos en vivo ahora?**\n• 📺 **¿Qué partidos se transmiten por LPF Play o YouTube?**\n• 📅 **¿Cuáles son los partidos de hoy?**\n• 🏆 **¿Cómo va la tabla de posiciones?**\n• ⚽ **¿Cuándo juega [equipo]?**\n• 📊 **Comparar dos equipos (H2H)**\n\n¿Qué querés consultar?`;
    }

    return { success: true, response, model: 'fallback' };
  }
}

module.exports = new AIService();
