'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { MatchCard } from '@/components/matches/MatchCard';
import { cn, getLeagueName } from '@/lib/utils';

const LEAGUES = [
  'primera-a', 'primera-b', 'primera-c', 'primera-d-za', 'primera-d-zb',
  'femenino-a', 'femenino-b', 'copa-argentina',
];

export default function PartidosPage() {
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const params = filter !== 'all' ? { league: filter, limit: 50 } : { limit: 50 };
        const data = await api.matches.list(params);
        setMatches(data.data || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase tracking-widest">Partidos</h1>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
            filter === 'all' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-surface-400 hover:text-white bg-surface-200/30'
          )}
        >
          Todas
        </button>
        {LEAGUES.map((l) => (
          <button
            key={l}
            onClick={() => setFilter(l)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
              filter === l ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-surface-400 hover:text-white bg-surface-200/30'
            )}
          >
            {getLeagueName(l)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : matches.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-4">📅</p>
          <p className="text-surface-400">No hay partidos disponibles para esta categoría</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
