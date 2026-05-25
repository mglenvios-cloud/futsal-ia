'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { LiveMatchCard } from '@/components/live/LiveMatchCard';
import { MatchCard } from '@/components/matches/MatchCard';
import { StandingsTable } from '@/components/teams/StandingsTable';
import { cn, getLeagueName } from '@/lib/utils';
import { SearchBar } from '@/components/ui/SearchBar';
import { AdBanner } from '@/components/ui/AdBanner';
import Link from 'next/link';

const LEAGUES = [
  { id: 'primera-a', label: 'Primera A' },
  { id: 'primera-b', label: 'Primera B' },
  { id: 'primera-c', label: 'Primera C' },
  { id: 'primera-d-za', label: 'Primera D ZA' },
  { id: 'primera-d-zb', label: 'Primera D ZB' },
];

export default function HomePage() {
  const [liveMatches, setLiveMatches] = useState([]);
  const [todayMatches, setTodayMatches] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [standings, setStandings] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('primera-a');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [liveRes, todayRes, upcomingRes] = await Promise.all([
          api.matches.live().catch(() => ({ live: [], today: [], upcoming: [] })),
          api.matches.today().catch(() => []),
          api.matches.upcoming(10).catch(() => []),
        ]);
        setLiveMatches(liveRes.live || []);
        setTodayMatches(todayRes || []);
        setUpcoming(upcomingRes || []);
      } catch (err) { console.error('Error loading dashboard:', err); }
      setLoading(false);
    }
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api.standings.list(selectedLeague).then(setStandings).catch(() => setStandings([]));
  }, [selectedLeague]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-surface-400 text-sm">Cargando datos del futsal...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <SearchBar />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {liveMatches.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="live-dot" />
                <h2 className="text-lg font-bold uppercase tracking-widest">En Vivo</h2>
                <span className="text-xs text-surface-500">({liveMatches.length} partidos)</span>
              </div>
              <div className="grid gap-3">{liveMatches.map((match) => <LiveMatchCard key={match.id} match={match} />)}</div>
            </section>
          )}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold uppercase tracking-widest">Partidos de Hoy</h2>
              <Link href="/partidos" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">Ver todos →</Link>
            </div>
            {todayMatches.length > 0 ? (
              <div className="grid gap-2">{todayMatches.map((match) => <MatchCard key={match.id} match={match} />)}</div>
            ) : (
              <div className="card-gradient p-6 text-center rounded-xl">
                <p className="text-3xl mb-2">📆</p>
                <p className="text-surface-400 text-sm">No hay partidos programados para hoy</p>
                <Link href="/partidos?tab=fixture" className="inline-block mt-3 text-xs text-orange-400 hover:text-orange-300">Ver fixture →</Link>
              </div>
            )}
          </section>
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest mb-4">Próximos Partidos</h2>
            <div className="grid gap-2">{upcoming.slice(0, 5).map((match) => <MatchCard key={match.id} match={match} />)}</div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="card-gradient overflow-hidden rounded-xl">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">🏆</span>
                <h2 className="text-sm font-bold uppercase tracking-widest">Posiciones</h2>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {LEAGUES.map((l) => (
                  <button key={l.id} onClick={() => setSelectedLeague(l.id)} className={cn('px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all border', selectedLeague === l.id ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'text-surface-400 hover:text-white bg-white/5 border-white/5')}>{l.label}</button>
                ))}
              </div>
              <StandingsTable standings={standings} compact />
              <Link href="/posiciones" className="block mt-3 text-center text-[11px] text-orange-400 hover:text-orange-300 transition-colors py-2 rounded-lg hover:bg-white/5">Ver tabla completa →</Link>
            </div>
          </section>

          <AdBanner size="sm" />

          <section className="card-gradient overflow-hidden rounded-xl">
            <Link href="/chat" className="block group p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center text-base">🤖</div>
                <div>
                  <h3 className="text-sm font-bold">Chat Futsal IA</h3>
                  <p className="text-[11px] text-surface-400">Consultá resultados, posiciones y más</p>
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-2.5 text-xs text-surface-400 italic group-hover:text-surface-300 transition-colors border border-white/5">¿Quién ganó el último Pinocho vs San Lorenzo?</div>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
