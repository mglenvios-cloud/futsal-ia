'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { MatchCard } from '@/components/matches/MatchCard';
import { cn } from '@/lib/utils';

const POS_COLORS = {
  'Arquero': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Cierre': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Ala Derecho': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Ala Izquierdo': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Pívot': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const LEAGUE_LABELS = {
  'primera-a': 'Primera A', 'primera-b': 'Primera B', 'primera-c': 'Primera C',
  'primera-d-zona-a': 'Primera D Zona A', 'primera-d-zona-b': 'Primera D Zona B',
  'femenino-a': 'Femenino A', 'femenino-b': 'Femenino B', 'femenino-c': 'Femenino C',
};

export default function TeamDetailPage() {
  const { slug } = useParams();
  const [team, setTeam] = useState(null);
  const [tab, setTab] = useState('info');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      try {
        const t = await api.teams.detail(String(slug));
        setTeam(t);
      } catch { setTeam(null); }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!team) return <div className="max-w-3xl mx-auto card p-12 text-center"><p className="text-surface-400">Equipo no encontrado</p></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Club Info Header */}
      <div className="card-gradient p-6 relative overflow-hidden">
        <div className="flex items-start gap-5">
          <span className="text-6xl flex-shrink-0">⚽</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-black uppercase tracking-wider">{team.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-surface-400 mt-1.5">
              {team.league && <span className="px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 text-xs font-medium">{LEAGUE_LABELS[team.league] || team.league}</span>}
              {team.city && <span>📍 {team.city}{team.province ? `, ${team.province}` : ''}</span>}
              {team.founded && <span>📅 Fundado {team.founded}</span>}
              {team.stadium && <span>🏟️ {team.stadium}</span>}
            </div>
            {team.position && (
              <div className="flex gap-4 mt-3">
                <div className="stat-card text-center min-w-[60px]">
                  <p className="stat-value">{team.position}º</p>
                  <p className="stat-label">Posición</p>
                </div>
                <div className="stat-card text-center min-w-[60px]">
                  <p className="stat-value">{team.points || 0}</p>
                  <p className="stat-label">Puntos</p>
                </div>
              </div>
            )}
          </div>
        </div>
        {team.social_instagram && (
          <div className="flex gap-3 mt-3">
            {team.social_instagram && <a href={`https://instagram.com/${team.social_instagram}`} target="_blank" rel="noopener noreferrer" className="text-sm text-surface-400 hover:text-pink-400 transition-colors">📷 Instagram</a>}
            {team.social_twitter && <a href={`https://twitter.com/${team.social_twitter}`} target="_blank" rel="noopener noreferrer" className="text-sm text-surface-400 hover:text-blue-400 transition-colors">🐦 Twitter</a>}
            {team.social_facebook && <a href={`https://facebook.com/${team.social_facebook}`} target="_blank" rel="noopener noreferrer" className="text-sm text-surface-400 hover:text-blue-600 transition-colors">📘 Facebook</a>}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { id: 'info', label: 'Club' },
          { id: 'matches', label: 'Partidos' },
          { id: 'stats', label: 'Estadísticas' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all',
              tab === t.id ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-surface-400 hover:text-white bg-surface-200/30'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === 'info' && (
        <div className="space-y-4">
          {team.description && (
            <div className="card p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-surface-400 mb-2">Descripción</h3>
              <p className="text-sm leading-relaxed">{team.description}</p>
            </div>
          )}
          {team.history && (
            <div className="card p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-surface-400 mb-2">Historia</h3>
              <p className="text-sm leading-relaxed">{team.history}</p>
            </div>
          )}
          {team.address && (
            <div className="card p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-surface-400 mb-2">Dirección</h3>
              <p className="text-sm">{team.address}{team.city ? `, ${team.city}` : ''}{team.province ? `, ${team.province}` : ''}</p>
            </div>
          )}
          {!team.description && !team.history && !team.address && (
            <div className="card p-8 text-center">
              <p className="text-surface-400 text-sm">Información del club próximamente</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Matches */}
      {tab === 'matches' && (
        <div className="space-y-2">
          {team.matches?.length > 0 ? (
            team.matches.map((m: any) => <MatchCard key={m.id} match={m} />)
          ) : (
            <div className="card p-8 text-center"><p className="text-surface-400 text-sm">No hay partidos registrados</p></div>
          )}
        </div>
      )}

      {/* Tab: Stats */}
      {tab === 'stats' && (
        <div className="card p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Estadísticas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[ { label: 'PJ', key: 'pj' }, { label: 'G', key: 'wins' }, { label: 'E', key: 'draws' }, { label: 'P', key: 'losses' } ].map((s) => (
              <div key={s.key} className="stat-card text-center">
                <p className="stat-value">{team.position ? (team[s.key as keyof typeof team] || 0) : 0}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-surface-500 text-xs mt-4">Estadísticas de la temporada actual</p>
        </div>
      )}
    </div>
  );
}
