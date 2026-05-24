'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { subscribeToMatch } from '@/lib/socket';
import { cn, getMatchStatus, formatDate, getLeagueName } from '@/lib/utils';

function AuthForm({ onLogin }: { onLogin: (user: any) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const fn = mode === 'login' ? api.auth.login : api.auth.register;
      const res = await fn({ username, password });
      localStorage.setItem('futsal_user', JSON.stringify(res.user));
      localStorage.setItem('futsal_token', res.token);
      onLogin(res.user);
    } catch (e) {
      setError(e.message || 'Error');
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <input type="text" placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)}
        className="input-search text-sm py-2" required />
      <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
        className="input-search text-sm py-2" required />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary text-sm px-4 py-2 flex-1">
          {mode === 'login' ? 'Ingresar' : 'Registrarse'}
        </button>
        <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="btn-secondary text-sm px-4 py-2">
          {mode === 'login' ? 'Registrarse' : 'Ya tengo cuenta'}
        </button>
      </div>
    </form>
  );
}

function CommentsSection({ matchId }: { matchId: string }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('futsal_user');
    if (stored) setUser(JSON.parse(stored));
    api.matches.comments(matchId).then(setComments).catch(() => {});
  }, [matchId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem('futsal_token');
      const comment = await api.matches.addComment(matchId, {
        text: newComment,
        author: user?.username || 'Anónimo',
        userId: user?.id || null,
      });
      setComments((prev) => [comment, ...prev]);
      setNewComment('');
    } catch {}
  };

  const logout = () => {
    localStorage.removeItem('futsal_user');
    localStorage.removeItem('futsal_token');
    setUser(null);
  };

  return (
    <div className="card-gradient overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <span>💬</span> Comentarios
          </h3>
          <span className="text-xs text-surface-500">{comments.length}</span>
        </div>

        {user ? (
          <div className="flex items-center justify-between mb-4 bg-white/[0.04] rounded-xl px-3 py-2">
            <span className="text-sm text-surface-300">👤 {user.username}</span>
            <button onClick={logout} className="text-xs text-surface-500 hover:text-red-400 transition-colors">Salir</button>
          </div>
        ) : (
          <div className="mb-4 bg-white/[0.04] rounded-xl p-3">
            <AuthForm onLogin={setUser} />
          </div>
        )}

        {user && (
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex gap-2">
              <input type="text" placeholder="Escribí un comentario..." value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="input-search text-sm py-2 flex-1" />
              <button type="submit" className="btn-primary text-sm px-4 py-2 whitespace-nowrap">Enviar</button>
            </div>
          </form>
        )}

        <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin">
          {comments.length === 0 ? (
            <p className="text-surface-500 text-sm text-center py-6">No hay comentarios. ¡Iniciá sesión y sé el primero!</p>
          ) : (
            comments.map((c, i) => (
              <div key={c.id || i} className="bg-white/[0.04] border border-white/[0.04] rounded-xl p-3 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-xs text-primary-400">{c.author || 'Anónimo'}</span>
                  {c.user_id && <span className="text-[9px] text-primary-500/50">✓</span>}
                  <span className="text-[10px] text-surface-500 ml-auto">
                    {c.created_at ? new Date(c.created_at + 'Z').toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-surface-300">{c.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function MatchDetailPage() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin state
  const [showAdmin, setShowAdmin] = useState(false);
  const [newGoalTeam, setNewGoalTeam] = useState('home');
  const [newGoalPlayer, setNewGoalPlayer] = useState('');
  const [newGoalMinute, setNewGoalMinute] = useState('');
  const [newGoalType, setNewGoalType] = useState('goal');

  useEffect(() => {
    if (!id || Array.isArray(id)) return;
    async function load() {
      try {
        const data = await api.matches.detail(String(id));
        setMatch(data);
        setGoals(data.goals || []);
      } catch {}
      setLoading(false);
    }
    load();
    const unsub = subscribeToMatch(String(id), (data) => {
      setMatch(data);
      if (data.goals) setGoals(data.goals);
    });
    return unsub;
  }, [id]);

  const finalizarPartido = async () => {
    await api.matches.update(String(id), { status: 'finished' });
    const data = await api.matches.detail(String(id));
    setMatch(data);
  };

  const marcarVivo = async () => {
    await api.matches.update(String(id), { status: 'live', minute: 1 });
    const data = await api.matches.detail(String(id));
    setMatch(data);
  };

  const addGoal = async (e) => {
    e.preventDefault();
    if (!newGoalPlayer.trim() || !newGoalMinute) return;
    try {
      const res = await api.matches.addGoal(String(id), {
        team: newGoalTeam,
        player_name: newGoalPlayer,
        minute: parseInt(newGoalMinute),
        type: newGoalType,
      });
      if (res.goal) setGoals(prev => [...prev, res.goal]);
      if (res.match) setMatch(res.match);
      setNewGoalPlayer('');
      setNewGoalMinute('');
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!match) return <div className="card p-12 text-center"><p className="text-surface-400">Partido no encontrado</p></div>;

  const status = getMatchStatus(match.status, match.minute);
  const homeGoals = goals.filter(g => g.team === 'home').length;
  const awayGoals = goals.filter(g => g.team === 'away').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Scoreboard */}
      <div className="card-gradient overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-surface-500 font-medium">{getLeagueName(match.league)}</span>
            <span className={cn('px-3 py-1 rounded-full text-xs font-bold', status.color, status.dot === 'live' && 'bg-red-500/20')}>
              {status.dot === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse inline-block mr-1" />}
              {status.label}
            </span>
          </div>

          {match.date && (
            <p className="text-center text-sm text-surface-400 mb-2">
              {formatDate(match.date)} {match.time ? `- ${match.time.substring(0, 5)}` : ''}
            </p>
          )}

          <div className="flex items-center justify-center gap-8 py-8">
            <div className="text-right flex-1">
              <p className="text-lg font-bold">{match.home_team}</p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 rounded-2xl px-6 py-3">
              <span className={cn('text-5xl font-black font-mono', match.status === 'live' && homeGoals > awayGoals ? 'text-primary-400' : 'text-white')}>
                {homeGoals > 0 ? homeGoals : (match.home_score ?? '-')}
              </span>
              <span className="text-2xl text-surface-500 font-bold">:</span>
              <span className={cn('text-5xl font-black font-mono', match.status === 'live' && awayGoals > homeGoals ? 'text-primary-400' : 'text-white')}>
                {awayGoals > 0 ? awayGoals : (match.away_score ?? '-')}
              </span>
            </div>
            <div className="text-left flex-1">
              <p className="text-lg font-bold">{match.away_team}</p>
            </div>
          </div>

          <div className="flex justify-center gap-6 text-sm text-surface-400">
            {match.venue && <span>🏟️ {match.venue}</span>}
            {match.round && <span>📋 {match.round}</span>}
          </div>
        </div>
      </div>

      {/* Goals Timeline */}
      {goals.length > 0 && (
        <div className="card-gradient overflow-hidden">
          <div className="p-5">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>⚽</span> Goles
            </h3>
            <div className="space-y-2">
              {goals.map((g) => (
                <div key={g.id} className={cn(
                  'flex items-center gap-3 p-2 rounded-lg',
                  g.team === 'home' ? 'bg-white/[0.04]' : 'bg-white/[0.02]'
                )}>
                  <div className={cn('w-1 h-8 rounded-full flex-shrink-0', g.team === 'home' ? 'bg-green-500' : 'bg-blue-500')} />
                  <span className="text-lg">⚽</span>
                  <p className="font-semibold text-sm flex-1">{g.player_name}</p>
                  <span className="text-surface-400 font-mono text-xs">{g.minute}'</span>
                  {g.type === 'own_goal' && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">EC</span>}
                  {g.type === 'penalty' && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">P</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin Controls */}
      <div className="card-gradient overflow-hidden">
        <div className="p-5">
          <button
            onClick={() => setShowAdmin(!showAdmin)}
            className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 w-full text-left"
          >
            <span>⚙️</span> Control del Partido
            <span className="text-surface-500 ml-auto">{showAdmin ? '▲' : '▼'}</span>
          </button>

          {showAdmin && (
            <div className="mt-4 space-y-4">
              <div className="flex gap-2">
                {match.status !== 'finished' && match.status !== 'live' && (
                  <button onClick={marcarVivo} className="btn-primary text-sm px-4 py-2 flex-1">
                    ▶️ Iniciar Partido
                  </button>
                )}
                {match.status !== 'finished' && (
                  <button onClick={finalizarPartido} className="px-4 py-2 text-sm font-medium rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all flex-1">
                    ⏹️ Finalizar Partido
                  </button>
                )}
              </div>

              <div className="border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-3">Agregar Gol</h4>
                <form onSubmit={addGoal} className="space-y-2">
                  <div className="flex gap-2">
                    <select value={newGoalTeam} onChange={e => setNewGoalTeam(e.target.value)}
                      className="input-search text-sm py-2">
                      <option value="home">Local</option>
                      <option value="away">Visitante</option>
                    </select>
                    <input type="text" placeholder="Jugador" value={newGoalPlayer} onChange={e => setNewGoalPlayer(e.target.value)}
                      className="input-search text-sm py-2 flex-1" />
                    <input type="number" placeholder="Min" value={newGoalMinute} onChange={e => setNewGoalMinute(e.target.value)}
                      className="input-search text-sm py-2 w-16 text-center" />
                    <select value={newGoalType} onChange={e => setNewGoalType(e.target.value)}
                      className="input-search text-sm py-2">
                      <option value="goal">Gol</option>
                      <option value="penalty">Penal</option>
                      <option value="own_goal">EC</option>
                    </select>
                    <button type="submit" className="btn-primary text-sm px-4 py-2 whitespace-nowrap">+</button>
                  </div>
                </form>
              </div>

              <div className="flex gap-2 text-[11px] text-surface-500">
                <span>Local: {homeGoals} goles</span>
                <span>Visitante: {awayGoals} goles</span>
                <span>Estado: {match.status}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {match.status === 'live' && (
        <div className="card-gradient overflow-hidden">
          <div className="p-5">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <span>📊</span> Estadísticas del Partido
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="stat-card">
                <p className="stat-value">{(match.home_yellow || 0) + (match.away_yellow || 0)}</p>
                <p className="stat-label">Tarjetas Amarillas</p>
              </div>
              <div className="stat-card">
                <p className="stat-value">{(match.home_red || 0) + (match.away_red || 0)}</p>
                <p className="stat-label">Tarjetas Rojas</p>
              </div>
              <div className="stat-card">
                <p className="stat-value">{(match.home_fouls || 0) + (match.away_fouls || 0)}</p>
                <p className="stat-label">Faltas</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Streams */}
      {(match.stream_link || match.youtube_link) && (
        <div className="card-gradient overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className={cn(
                'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                match.status === 'live' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-orange-500/20 text-orange-400'
              )}>
                {match.status === 'live' ? 'EN VIVO' : 'DISPONIBLE'}
              </div>
              <h3 className="text-sm font-bold uppercase tracking-widest">Transmisiones</h3>
            </div>

            <div className="grid gap-3">
              {match.stream_link && (
                <a href={match.stream_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold text-lg transition-all duration-200 shadow-lg shadow-orange-500/25 group">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Ver en LPF Play</span>
                  <svg className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}

              {match.youtube_link && (
                <a href={match.youtube_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-lg transition-all duration-200 shadow-lg shadow-red-900/30 group">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>Ver en YouTube</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <CommentsSection matchId={String(id)} />
    </div>
  );
}
