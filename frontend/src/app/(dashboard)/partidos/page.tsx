'use client';
import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { MatchCard } from '@/components/matches/MatchCard';
import { cn, getLeagueName, formatDate } from '@/lib/utils';

const LEAGUES = [
  'primera-a', 'primera-b', 'primera-c', 'primera-d-za', 'primera-d-zb',
  'femenino-a', 'femenino-b', 'copa-argentina',
];

function groupByDate(matches: any[]) {
  const groups: Record<string, any[]> = {};
  matches.forEach(m => {
    const key = m.date || 'sin-fecha';
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

export default function PartidosPage() {
  const [tab, setTab] = useState<'partidos' | 'fixture'>('partidos');
  const [matches, setMatches] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        let data;
        if (tab === 'fixture') {
          data = await api.matches.upcoming(100);
        } else {
          const params = filter !== 'all' ? { league: filter, limit: 200 } : { limit: 200 };
          data = await api.matches.list(params);
          data = data.data || [];
          data = data.filter((m: any) => m.status === 'finished' && m.home_score != null && m.away_score != null);
        }
        setMatches(Array.isArray(data) ? data : []);
      } catch { setMatches([]); }
      setLoading(false);
    }
    load();
  }, [tab, filter]);

  const grouped = useMemo(() => groupByDate(matches), [matches]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase tracking-widest">Partidos</h1>
      </div>

      <div className="flex gap-2 mb-2">
        <button onClick={() => setTab('partidos')} className={cn('px-4 py-2 text-sm font-semibold rounded-xl transition-all', tab === 'partidos' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-surface-400 hover:text-white bg-white/5')}>Resultados</button>
        <button onClick={() => setTab('fixture')} className={cn('px-4 py-2 text-sm font-semibold rounded-xl transition-all', tab === 'fixture' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-surface-400 hover:text-white bg-white/5')}>Fixture</button>
      </div>

      {tab === 'partidos' && (
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilter('all')} className={cn('px-3 py-1.5 text-xs font-medium rounded-lg transition-all', filter === 'all' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-surface-400 hover:text-white bg-surface-200/30')}>Todas</button>
          {LEAGUES.map(l => (
            <button key={l} onClick={() => setFilter(l)} className={cn('px-3 py-1.5 text-xs font-medium rounded-lg transition-all', filter === l ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-surface-400 hover:text-white bg-surface-200/30')}>{getLeagueName(l)}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : matches.length === 0 ? (
        <div className="card p-12 text-center"><p className="text-4xl mb-4">📅</p><p className="text-surface-400">No hay partidos disponibles</p></div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, dayMatches]) => (
            <div key={date}>
              <h3 className="text-sm font-bold text-surface-500 uppercase tracking-wider mb-3 border-b border-white/[0.06] pb-2">
                {date === 'sin-fecha' ? 'Sin fecha' : formatDate(date)}
              </h3>
              <div className="grid gap-2">
                {dayMatches.map((match: any) => <MatchCard key={match.id} match={match} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
