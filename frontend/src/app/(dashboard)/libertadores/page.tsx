'use client';
import { useState, useEffect } from 'react';
import { cn, formatDate } from '@/lib/utils';
import { BodegonAd } from '@/components/ads/BodegonAd';
import Link from 'next/link';

const API = '/api';
const GROUPS = ['A', 'B', 'C'];

function TeamFlag({ name }: { name: string }) {
  const flags: Record<string, string> = {
    'Boca Juniors': '🇦🇷', 'Carlos Barbosa': '🇧🇷', 'Fantasmas M.M.': '🇧🇴', 'Peñarol': '🇺🇾',
    'Magnus': '🇧🇷', 'Centauros': '🇻🇪', 'Panta Walon': '🇵🇪', 'Divino Niño': '🇪🇨',
    'Nacional': '🇺🇾', 'Cerro Porteño': '🇵🇾', 'Deportivo Lyon Cali': '🇨🇴', 'Colo-Colo': '🇨🇱',
  };
  const short = Object.keys(flags).find(k => name.includes(k));
  return <span className="text-base mr-1">{short ? flags[short] : '🌎'}</span>;
}

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

export default function LibertadoresPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [standings, setStandings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'resultados' | 'fixture'>('resultados');

  useEffect(() => {
    async function load() {
      try {
        const [mRes, sRes] = await Promise.all([
          fetch(`${API}/libertadores`).then(r => r.json()),
          fetch(`${API}/libertadores/standings`).then(r => r.json()),
        ]);
        setMatches(Array.isArray(mRes) ? mRes : []);
        setStandings(sRes || {});
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = matches.filter(m => tab === 'resultados' ? m.status === 'finished' : true);

  if (loading) return (
    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">🏆</span>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest">Copa Libertadores</h1>
          <p className="text-xs text-surface-400">Futsal 2026 · Carlos Barbosa, Brasil</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 rounded-xl p-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-surface-400">
          <span>📅 24 - 31 de mayo</span>
          <span>📍 Carlos Barbosa, RS - Brasil</span>
          <span>🏟️ Centro Municipal de Eventos</span>
          <span>🏆 12 equipos · 3 grupos</span>
          <a href="https://play.tycsports.com/copa-libertadores/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 font-semibold">📺 Ver en TyC Play</a>
          <a href="https://www.youtube.com/@conmebol" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 font-semibold">▶️ Ver en YouTube</a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('resultados')} className={cn('px-4 py-2 text-sm font-semibold rounded-xl transition-all', tab === 'resultados' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-surface-400 hover:text-white bg-white/5')}>Resultados</button>
        <button onClick={() => setTab('fixture')} className={cn('px-4 py-2 text-sm font-semibold rounded-xl transition-all', tab === 'fixture' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-surface-400 hover:text-white bg-white/5')}>Fixture</button>
      </div>

      {/* Groups */}
      {GROUPS.map(g => {
        const groupStandings = standings[g] || [];
        const groupMatches = filtered.filter(m => m.group_name === g);
        if (groupMatches.length === 0 && groupStandings.length === 0) return null;
        return (
          <section key={g} className="card-gradient rounded-xl overflow-hidden border border-white/[0.06]">
            <div className="bg-gradient-to-r from-yellow-500/10 to-transparent px-4 py-3 border-b border-white/[0.06]">
              <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                Grupo {g}
              </h2>
            </div>

            {/* Standings table */}
            {groupStandings.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-surface-500 border-b border-white/[0.06]">
                      <th className="text-left p-3 font-semibold">#</th>
                      <th className="text-left p-3 font-semibold">Equipo</th>
                      <th className="p-3 font-semibold">PJ</th>
                      <th className="p-3 font-semibold">G</th>
                      <th className="p-3 font-semibold">E</th>
                      <th className="p-3 font-semibold">P</th>
                      <th className="p-3 font-semibold">GF</th>
                      <th className="p-3 font-semibold">GC</th>
                      <th className="p-3 font-semibold">DG</th>
                      <th className="p-3 font-semibold text-yellow-400">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupStandings.map((team: any, i: number) => (
                      <tr key={team.team} className={cn('border-b border-white/[0.03] hover:bg-white/[0.02]', i < 2 && 'bg-green-500/5')}>
                        <td className="p-3 font-bold">{i + 1}</td>
                        <td className="p-3 font-medium"><TeamFlag name={team.team} />{team.teamShort}</td>
                        <td className="p-3 text-center">{team.played}</td>
                        <td className="p-3 text-center text-green-400">{team.w}</td>
                        <td className="p-3 text-center text-amber-400">{team.d}</td>
                        <td className="p-3 text-center text-red-400">{team.l}</td>
                        <td className="p-3 text-center">{team.gf}</td>
                        <td className="p-3 text-center">{team.ga}</td>
                        <td className="p-3 text-center font-mono">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                        <td className="p-3 text-center font-bold text-yellow-400">{team.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Matches */}
            {groupMatches.length > 0 && (
              <div className="divide-y divide-white/[0.04]">
                {groupMatches.map(m => (
                  <div key={m.id} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-2 text-[11px] text-surface-500 mb-1">
                      <span>{m.date && formatDate(m.date)}</span>
                      {m.time && <span>· {m.time}</span>}
                      {m.round && <span>· {m.round}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 text-right">
                        <p className="text-sm font-bold"><TeamFlag name={m.home_team} />{m.home_team.replace(/\s*\([^)]*\)\s*/g, '')}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white/[0.06] rounded-lg px-3 py-1.5 flex-shrink-0">
                        <span className={cn('text-lg font-black font-mono', m.status === 'finished' ? (m.home_score > m.away_score ? 'text-green-400' : 'text-white') : 'text-surface-400')}>{m.home_score ?? '-'}</span>
                        <span className="text-surface-500">:</span>
                        <span className={cn('text-lg font-black font-mono', m.status === 'finished' ? (m.away_score > m.home_score ? 'text-green-400' : 'text-white') : 'text-surface-400')}>{m.away_score ?? '-'}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{m.away_team.replace(/\s*\([^)]*\)\s*/g, '')}<TeamFlag name={m.away_team} /></p>
                      </div>
                    </div>
                    <StreamBadge match={m} />
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <div className="mb-2">
        <p className="text-[10px] text-surface-600 uppercase tracking-widest mb-2">Publicidad</p>
        <BodegonAd />
      </div>
    </div>
  );
}
