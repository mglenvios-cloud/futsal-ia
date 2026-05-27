'use client';
import { useState, useEffect } from 'react';
import { cn, formatDate } from '@/lib/utils';
import { BodegonAd } from '@/components/ads/BodegonAd';

const API = '/api';

const CATEGORIES = [
  { id: 'senior', label: 'Selección Mayor', emoji: '🇦🇷', desc: 'Copa América · Amistosos' },
  { id: 'sub20', label: 'Sub-20', emoji: '🟡', desc: 'Sudamericano Sub-20' },
  { id: 'sub17', label: 'Sub-17', emoji: '🟢', desc: 'Sudamericano Sub-17' },
  { id: 'femenina', label: 'Femenina', emoji: '💪', desc: 'Copa América Femenina' },
];

const COMP_NAMES: Record<string, string> = {
  'copa-america': 'Copa América',
  'sudamericano': 'Sudamericano',
  'friendly': 'Amistoso',
  'world-cup': 'Mundial',
};

function StreamBadge({ match }: { match: any }) {
  return (
    <div className="flex items-center gap-1.5 mt-1">
      {match.stream_link && (
        <a href={match.stream_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
          className="text-[10px] px-2 py-0.5 rounded bg-orange-500/15 border border-orange-500/25 text-orange-400 font-bold hover:bg-orange-500/25 transition-all">
          TyC Play
        </a>
      )}
      {match.youtube_link && (
        <a href={match.youtube_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
          className="text-[10px] px-2 py-0.5 rounded bg-red-500/15 border border-red-500/25 text-red-400 font-bold hover:bg-red-500/25 transition-all">
          YouTube
        </a>
      )}
    </div>
  );
}

export default function SeleccionesPage() {
  const [data, setData] = useState<any>({});
  const [activeCat, setActiveCat] = useState('senior');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/selecciones`).then(r => r.json());
        setData(res || {});
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    load();
  }, []);

  const catInfo = CATEGORIES.find(c => c.id === activeCat);
  const matches = data[activeCat] || [];

  if (loading) return (
    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">🇦🇷</span>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest">Selecciones</h1>
          <p className="text-xs text-surface-400">Argentina Futsal · Todas las categorías</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCat(cat.id)}
            className={cn('px-4 py-2.5 text-sm font-semibold rounded-xl transition-all border text-left flex items-center gap-2',
              activeCat === cat.id
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : 'text-surface-400 hover:text-white bg-white/5 border-white/5'
            )}>
            <span className="text-lg">{cat.emoji}</span>
            <div>
              <p>{cat.label}</p>
              <p className="text-[10px] font-normal text-surface-500">{cat.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Active category matches */}
      <section className="card-gradient rounded-xl overflow-hidden border border-white/[0.06]">
        <div className="bg-gradient-to-r from-blue-500/10 to-transparent px-4 py-3 border-b border-white/[0.06]">
          <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2">
            <span className="text-xl">{catInfo?.emoji}</span>
            {catInfo?.label}
          </h2>
        </div>

        {matches.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-3xl mb-2">📅</p>
            <p className="text-surface-400 text-sm">No hay partidos registrados para esta categoría</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {matches.map((m: any) => (
              <div key={m.id} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-2 text-[11px] text-surface-500 mb-1">
                  {m.competition && <span className="text-blue-400 font-semibold uppercase tracking-wider">{COMP_NAMES[m.competition] || m.competition}</span>}
                  <span>·</span>
                  <span>{m.date && formatDate(m.date)}</span>
                  {m.time && <span>· {m.time}</span>}
                  {m.venue && <span>· {m.venue}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-right">
                    <p className="text-sm font-bold">{m.home_team}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/[0.06] rounded-lg px-3 py-1.5 flex-shrink-0">
                    <span className={cn('text-lg font-black font-mono', m.status === 'finished' ? (m.home_score > m.away_score ? 'text-green-400' : 'text-white') : 'text-surface-400')}>{m.home_score ?? '-'}</span>
                    <span className="text-surface-500">:</span>
                    <span className={cn('text-lg font-black font-mono', m.status === 'finished' ? (m.away_score > m.home_score ? 'text-green-400' : 'text-white') : 'text-surface-400')}>{m.away_score ?? '-'}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{m.away_team}</p>
                  </div>
                </div>
                <StreamBadge match={m} />
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mb-2">
        <p className="text-[10px] text-surface-600 uppercase tracking-widest mb-2">Publicidad</p>
        <BodegonAd />
      </div>
    </div>
  );
}
