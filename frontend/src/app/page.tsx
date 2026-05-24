'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { LiveMatchCard } from '@/components/live/LiveMatchCard';
import { MatchCard } from '@/components/matches/MatchCard';
import { StandingsTable } from '@/components/teams/StandingsTable';
import { cn, getLeagueName, getLeagueColor } from '@/lib/utils';
import { SearchBar } from '@/components/ui/SearchBar';
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
      } catch (err) {
        console.error('Error loading dashboard:', err);
      }
      setLoading(false);
    }
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api.standings.list(selectedLeague)
      .then(setStandings)
      .catch(() => setStandings([]));
  }, [selectedLeague]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-400">Cargando datos del futsal argentino...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
              <div className="grid gap-3">
                {liveMatches.map((match) => (
                  <LiveMatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold uppercase tracking-widest">Partidos de Hoy</h2>
              <Link href="/partidos" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                Ver todos →
              </Link>
            </div>
            {todayMatches.length > 0 ? (
              <div className="grid gap-2">
                {todayMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="card-gradient p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📆</span>
                </div>
                <p className="text-surface-400 text-sm">No hay partidos programados para hoy</p>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest mb-4">Próximos Partidos</h2>
            <div className="grid gap-2">
              {upcoming.slice(0, 5).map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card-gradient overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏆</span>
                  <h2 className="text-sm font-bold uppercase tracking-widest">Posiciones</h2>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {LEAGUES.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLeague(l.id)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium rounded-lg transition-all border',
                      selectedLeague === l.id
                        ? 'bg-primary-500/20 text-primary-400 border-primary-500/30 shadow-lg shadow-primary-500/5'
                        : 'text-surface-400 hover:text-white bg-white/5 border-white/5 hover:border-white/10'
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <StandingsTable standings={standings} compact />
              <Link
                href="/posiciones"
                className="block mt-4 text-center text-xs text-primary-400 hover:text-primary-300 transition-colors py-2 rounded-lg hover:bg-white/5"
              >
                Ver tabla completa →
              </Link>
            </div>
          </section>

          <section className="card-gradient overflow-hidden">
            <Link href="/chat" className="block group p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center text-lg">
                  🤖
                </div>
                <div>
                  <h3 className="text-sm font-bold">Chat Futsal IA</h3>
                  <p className="text-xs text-surface-400">Preguntá cualquier cosa sobre futsal argentino</p>
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 text-sm text-surface-400 italic group-hover:text-surface-300 transition-colors border border-white/5">
                ¿Quién ganó el último Pinocho vs San Lorenzo?
              </div>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
