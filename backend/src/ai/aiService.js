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
      const systemPrompt = this.buildSystemPrompt(context);
      const matches = await this.getContextMatches(context);

      const historyMessages = (context.history || []).map((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content,
      }));
      const messages = [
        { role: 'system', content: systemPrompt },
        ...matches,
        ...historyMessages,
        { role: 'user', content: prompt },
      ];

      if (!this.openai) {
        return this.fallbackResponse(prompt, context);
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

  buildSystemPrompt(context) {
    const { team, league, match } = context;
    let prompt = `Eres un experto en Futsal Argentino AFA. Tienes conocimiento profundo de todas las divisiones: Primera A, B, C, D (Zona A y B), Femenino y Copas.

Información actual del futsal argentino:
- Ligas: ${this.futsalKnowledge.leagues.join(', ')}
- Equipos destacados: ${this.futsalKnowledge.topTeams.join(', ')}

Puedes:
- Analizar partidos y resultados
- Comparar equipos (H2H)
- Dar estadísticas detalladas
- Predecir resultados basados en datos históricos
- Explicar reglamento del futsal AFA
- Recomendar estrategias`;

    if (team) prompt += `\n\nEl usuario está preguntando sobre el equipo: ${team}`;
    if (league) prompt += `\n\nContexto de liga: ${league}`;
    if (match) prompt += `\n\nContexto de partido: ${match.homeTeam} vs ${match.awayTeam}`;

    prompt += '\n\nResponde en español argentino. Sé preciso y directo. Usa datos actualizados.';
    return prompt;
  }

  async getContextMatches(context) {
    const messages = [];
    try {
      if (context.team) {
        const matches = (await db.getMatches({ team: context.team, limit: 5 })).data || [];
        if (matches?.length) {
          messages.push({
            role: 'system',
            content: `Últimos partidos de ${context.team}: ${JSON.stringify(matches)}`,
          });
        }
      }
      if (context.league) {
        const standings = await db.getStandings(context.league);
        if (standings?.length) {
          messages.push({
            role: 'system',
            content: `Tabla de posiciones ${context.league}: ${JSON.stringify(standings.slice(0, 10))}`,
          });
        }
      }
    } catch (err) {
      console.error('Context fetch error:', err.message);
    }
    return messages;
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

  fallbackResponse(prompt, context) {
    const promptLower = prompt.toLowerCase();
    let response = '';

    if (promptLower.includes('posicion') || promptLower.includes('tabla')) {
      response = 'Podés consultar las posiciones actualizadas en la sección "Posiciones" de la aplicación. Cada liga tiene su tabla completa con puntos, partidos jugados, goles a favor y en contra.';
    } else if (promptLower.includes('partido') || promptLower.includes('resultado')) {
      response = 'Los partidos y resultados se actualizan automáticamente. Revisá la sección "En Vivo" para ver los marcadores en tiempo real o "Partidos" para el fixture completo.';
    } else if (promptLower.includes('equipo') || promptLower.includes('club')) {
      response = 'Usá la sección "Equipos" para buscar cualquier club y ver su fixture, resultados, estadísticas e historial completo.';
    } else if (promptLower.includes('gol') || promptLower.includes('goleador')) {
      response = 'Los goleadores de cada división están disponibles en la sección "Estadísticas" con la tabla de máximos anotadores actualizada.';
    } else if (promptLower.includes('femenino')) {
      response = 'El Futsal Femenino AFA tiene Primera A, B y C. Encontrá toda la información en la sección correspondiente de la aplicación.';
    } else if (promptLower.includes('copa argentina')) {
      response = 'La Copa Argentina de Futsal enfrenta a equipos de todas las divisiones. Los fixtures y resultados están disponibles en la app.';
    } else {
      response = `Soy tu asistente especializado en Futsal Argentino AFA. Puedo ayudarte con:
• Resultados en vivo y fixture
• Tablas de posiciones de todas las divisiones
• Estadísticas y goleadores
• Comparación de equipos (H2H)
• Información de Primera A, B, C, D, Femenino y Copas

¿Qué querés consultar hoy?`;
    }

    return { success: true, response, model: 'fallback' };
  }
}

module.exports = new AIService();
