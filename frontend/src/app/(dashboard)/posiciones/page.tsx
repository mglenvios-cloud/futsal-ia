'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { StandingsTable } from '@/components/teams/StandingsTable';
import { BodegonAd } from '@/components/ads/BodegonAd';
import { cn, getLeagueName } from '@/lib/utils';

const LEAGUES = [
  { id: 'primera-a', label: 'Primera A' },
  { id: 'primera-b', label: 'Primera B' },
  { id: 'primera-c', label: 'Primera C' },
  { id: 'primera-d-za', label: 'Primera D ZA' },
  { id: 'primera-d-zb', label: 'Primera D ZB' },
  { id: 'femenino-a', label: 'Femenino A' },
  { id: 'femenino-b', label: 'Femenino B' },
  { id: 'femenino-c', label: 'Femenino C' },
  { id: 'copa-argentina', label: 'Copa Argentina' },
];

const LEAGUE_EMOJIS: Record<string, string> = {
  'primera-a': '⭐',
  'primera-b': '🔵',
  'primera-c': '🟢',
  'primera-d-za': '🟣',
  'primera-d-zb': '🟣',
  'femenino-a': '💗',
  'femenino-b': '💗',
  'femenino-c': '💗',
  'copa-argentina': '🏆',
};

export default function PosicionesPage() {
  const [league, setLeague] = useState('primera-a');
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.standings.list(league)
      .then(setStandings)
      .catch(() => setStandings([]))
      .finally(() => setLoading(false));
  }, [league]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center text-lg">
          🏆
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest">{getLeagueName(league)}</h1>
          <p className="text-xs text-surface-500 mt-0.5">{standings.length} equipos · Temporada 2026</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {LEAGUES.map((l) => (
          <button
            key={l.id}
            onClick={() => setLeague(l.id)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-all border',
              league === l.id
                ? 'bg-primary-500/20 text-primary-400 border-primary-500/30 shadow-lg shadow-primary-500/5'
                : 'text-surface-400 hover:text-white bg-white/5 border-white/5 hover:border-white/10'
            )}
          >
            <span className="mr-1">{LEAGUE_EMOJIS[l.id]}</span>
            {l.label}
          </button>
        ))}
      </div>

      <div className="card-gradient overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-5 pb-2">
            <StandingsTable standings={standings} />
          </div>
        )}
      </div>

      <div>
        <p className="text-[10px] text-surface-600 uppercase tracking-widest mb-2">Publicidad</p>
        <BodegonAd large />
      </div>
    </div>
  );
}
