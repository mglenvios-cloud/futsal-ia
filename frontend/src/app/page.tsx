'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { LiveMatchCard } from '@/components/live/LiveMatchCard';
import { MatchCard } from '@/components/matches/MatchCard';
import { StandingsTable } from '@/components/teams/StandingsTable';
import { cn, getLeagueName } from '@/lib/utils';
import { SearchBar } from '@/components/ui/SearchBar';
import { AdBanner } from '@/components/ui/AdBanner';
import { BodegonAd } from '@/components/ads/BodegonAd';
import Link from 'next/link';

const LEAGUES = [
  { id: 'primera-a', label: 'Primera A' },
  { id: 'primera-b', label: 'Primera B' },
  { id: 'primera-c', label: 'Primera C' },
  { id: 'primera-d-za', label: 'Primera D ZA' },
  { id: 'primera-d-zb', label: 'Primera D ZB' },
];

function StreamBadge({ match }: { match: any }) {
  const hasYT = match.youtube_link && match.youtube_link.trim() !== '';
  const hasLPF = match.stream_link && match.stream_link.trim() !== '';

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
      {hasLPF && (
        <a
          href={match.stream_link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/25 text-orange-400 text-xs font-bold hover:bg-orange-500/25 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
          </svg>
          Ver en LPF Play
        </a>
      )}
      {hasYT && (
        <a
          href={match.youtube_link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 text-xs font-bold hover:bg-red-500/25 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Ver en YouTube
        </a>
      )}
    </div>
  );
}

function StreamMatchCard({ match }: { match: any }) {
  const hasYT = match.youtube_link && match.youtube_link.trim() !== '';
  const hasLPF = match.stream_link && match.stream_link.trim() !== '';
  const isLive = match.status === 'live';

  return (
    <div className={cn(
      'relative rounded-xl border overflow-hidden transition-all',
      isLive
        ? 'border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent live-border'
        : 'border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-transparent hover:border-orange-500/20',
    )}>
      <Link href={`/partidos/${match.id}`} className="block p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold">
            {getLeagueName(match.league)}
          </span>
          <div className="flex items-center gap-2">
            {hasLPF && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                LPF Play
              </span>
            )}
            {hasYT && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </span>
            )}
            {isLive && <span className="live-dot" />}
          </div>
        </div>

        {/* Teams & Score */}
        <div className="flex items-center gap-3">
          <div className="flex-1 text-right">
            <p className="text-sm font-bold truncate">{match.home_team}</p>
          </div>
          <div className="flex items-center gap-2 bg-white/[0.06] rounded-xl px-4 py-2 flex-shrink-0">
            <span className="text-xl font-black font-mono tabular-nums">{match.home_score ?? '-'}</span>
            <span className="text-surface-500">:</span>
            <span className="text-xl font-black font-mono tabular-nums">{match.away_score ?? '-'}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold truncate">{match.away_team}</p>
          </div>
        </div>

        {/* Date/time */}
        <div className="mt-2 text-center">
          <span className="text-xs text-surface-500">
            {match.date} {match.time ? `· ${match.time}` : ''}
          </span>
        </div>
      </Link>

      {/* Watch buttons */}
      <StreamBadge match={match} />
    </div>
  );
}

export default function HomePage() {
  const [liveMatches, setLiveMatches] = useState([]);
  const [todayMatches, setTodayMatches] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [streamMatches, setStreamMatches] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [standings, setStandings] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('primera-a');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [liveRes, todayRes, upcomingRes, streamRes, allRes] = await Promise.all([
          api.matches.live().catch(() => ({ live: [], today: [], upcoming: [] })),
          api.matches.today().catch(() => []),
          api.matches.upcoming(10).catch(() => []),
          api.matches.stream(50).catch(() => []),
          api.matches.list({ limit: 100 }).catch(() => ({ data: [] })),
        ]);
        setLiveMatches(liveRes.live || []);
        setTodayMatches(todayRes || []);
        setUpcoming(upcomingRes || []);
        setStreamMatches(Array.isArray(streamRes) ? streamRes : []);
        const all = allRes.data || allRes || [];
        const finished = Array.isArray(all) ? all.filter((m: any) => m.status === 'finished' && m.home_score != null && m.away_score != null).slice(0, 8) : [];
        setRecentResults(finished);
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

      {/* Banner 728x90 — Bodegón de Bebidas */}
      <a
        href="https://www.instagram.com/bodegondebebidas/"
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group block w-full rounded-lg overflow-hidden border border-white/[0.06] shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-r from-orange-600/10 via-orange-500/5 to-orange-600/10"
      >
        <div className="flex items-center gap-3 p-2">
          <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden">
            <img
              src="/images/bodegon-1.jpg"
              alt="Bodegón de Bebidas"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white truncate">Bodegón de Bebidas</p>
              <span className="text-[10px] text-purple-400 font-medium whitespace-nowrap">@bodegondebebidas</span>
            </div>
            <p className="text-[11px] text-surface-400 truncate">Distribuidora de Bebidas y Yerbas · Venta mayorista y minorista · Envíos a todo el país</p>
          </div>
        </div>
      </a>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">

          {/* En Vivo */}
          {liveMatches.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span className="live-dot" />
                <h2 className="text-lg font-bold uppercase tracking-widest">En Vivo</h2>
                <span className="text-xs text-surface-500">({liveMatches.length} partidos)</span>
              </div>
              <div className="grid gap-3">{liveMatches.map((match: any) => <LiveMatchCard key={match.id} match={match} />)}</div>
            </section>
          )}

          {/* 📺 Transmisiones — LPF Play y YouTube */}
          {streamMatches.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20 flex items-center justify-center text-base">📺</div>
                  <div>
                    <h2 className="text-lg font-bold uppercase tracking-widest">Transmisiones</h2>
                    <p className="text-[11px] text-surface-500">LPF Play · YouTube</p>
                  </div>
                </div>
                <span className="text-xs text-surface-500">{streamMatches.length} partidos</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {streamMatches.slice(0, 8).map((match: any) => (
                  <StreamMatchCard key={match.id} match={match} />
                ))}
              </div>
              {streamMatches.length > 8 && (
                <Link href="/partidos?filter=stream" className="block mt-3 text-center text-xs text-orange-400 hover:text-orange-300 transition-colors">
                  Ver todos los partidos con transmisión →
                </Link>
              )}
            </section>
          )}

          {/* Resultados Recientes */}
          {recentResults.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20 flex items-center justify-center text-base">✅</div>
                  <h2 className="text-lg font-bold uppercase tracking-widest">Resultados</h2>
                  <span className="text-xs text-surface-500">({recentResults.length})</span>
                </div>
                <Link href="/partidos" className="text-xs text-orange-400 hover:text-orange-300">Ver todos →</Link>
              </div>
              <div className="grid gap-2">{recentResults.map((match: any) => <MatchCard key={match.id} match={match} />)}</div>
            </section>
          )}

          {/* Banner entre secciones */}
          <div className="mb-2">
            <p className="text-[10px] text-surface-600 uppercase tracking-widest mb-2">Publicidad</p>
            <BodegonAd />
          </div>

          {/* Partidos de Hoy */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold uppercase tracking-widest">Partidos de Hoy</h2>
              <Link href="/partidos" className="text-xs text-orange-400 hover:text-orange-300 transition-colors">Ver todos →</Link>
            </div>
            {todayMatches.length > 0 ? (
              <div className="grid gap-2">{todayMatches.map((match: any) => <MatchCard key={match.id} match={match} />)}</div>
            ) : (
              <div className="card-gradient p-6 text-center rounded-xl">
                <p className="text-3xl mb-2">📆</p>
                <p className="text-surface-400 text-sm">No hay partidos programados para hoy</p>
                <Link href="/partidos?tab=fixture" className="inline-block mt-3 text-xs text-orange-400 hover:text-orange-300">Ver fixture →</Link>
              </div>
            )}
          </section>

          {/* Próximos Partidos */}
          <section>
            <h2 className="text-lg font-bold uppercase tracking-widest mb-4">Próximos Partidos</h2>
            <div className="grid gap-2">{upcoming.slice(0, 5).map((match: any) => <MatchCard key={match.id} match={match} />)}</div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Posiciones */}
          <section className="card-gradient overflow-hidden rounded-xl">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">🏆</span>
                <h2 className="text-sm font-bold uppercase tracking-widest">Posiciones</h2>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {LEAGUES.map((l) => (
                  <button key={l.id} onClick={() => setSelectedLeague(l.id)} className={cn('px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all border', selectedLeague === l.id ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'text-surface-400 hover:text-white bg-white/5 border-white/5')}>
                    {l.label}
                  </button>
                ))}
              </div>
              <StandingsTable standings={standings} compact />
              <Link href="/posiciones" className="block mt-3 text-center text-[11px] text-orange-400 hover:text-orange-300 transition-colors py-2 rounded-lg hover:bg-white/5">
                Ver tabla completa →
              </Link>
            </div>
          </section>

          {/* Banner sidebar — Bodegón */}
          <div>
            <p className="text-[10px] text-surface-600 uppercase tracking-widest mb-2">Publicidad</p>
            <BodegonAd large />
          </div>

          {/* Chat IA */}
          <section className="card-gradient overflow-hidden rounded-xl">
            <Link href="/chat" className="block group p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center text-base">🤖</div>
                <div>
                  <h3 className="text-sm font-bold">Chat Futsal IA</h3>
                  <p className="text-[11px] text-surface-400">Consultá resultados, posiciones y más</p>
                </div>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-2.5 text-xs text-surface-400 italic group-hover:text-surface-300 transition-colors border border-white/5">
                ¿Qué partidos se transmiten hoy por LPF Play?
              </div>
            </Link>
          </section>

          {/* Banner sidebar bottom */}
          <AdBanner size="banner" />
        </div>
      </div>
    </div>
  );
}
