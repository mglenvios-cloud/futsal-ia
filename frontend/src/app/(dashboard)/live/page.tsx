'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { subscribeToLiveMatches } from '@/lib/socket';
import { LiveMatchCard } from '@/components/live/LiveMatchCard';
import { cn } from '@/lib/utils';

export default function LivePage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(5000);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.matches.live();
        setMatches(data.live || []);
      } catch {}
      setLoading(false);
    }
    load();

    const unsub = subscribeToLiveMatches((data) => {
      setMatches(data.matches || []);
    });

    const interval = setInterval(load, autoRefresh);
    return () => { clearInterval(interval); unsub(); };
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <h1 className="text-2xl font-black uppercase tracking-widest">En Vivo</h1>
          </div>
          {matches.length > 0 && (
            <span className="text-sm text-surface-400 font-mono">({matches.length})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-500">Actualizar:</span>
          {[5000, 10000, 30000].map((ms) => (
            <button
              key={ms}
              onClick={() => setAutoRefresh(ms)}
              className={cn(
                'px-3 py-1 text-xs rounded-lg transition-all',
                autoRefresh === ms
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-surface-400 border border-transparent hover:text-white'
              )}
            >
              {ms / 1000}s
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : matches.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-4">📺</p>
          <h2 className="text-xl font-bold mb-2">No hay partidos en vivo</h2>
          <p className="text-surface-400 text-sm">Los resultados se actualizarán automáticamente cuando comiencen los partidos</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((match) => (
            <LiveMatchCard key={match.id} match={match} onUpdate={() => {
              api.matches.live().then(data => setMatches(data.live || [])).catch(() => {});
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
