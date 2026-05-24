'use client';

import { cn } from '@/lib/utils';

function PositionBadge({ position }: { position: number }) {
  if (position === 1) return <span className="position-gold">1</span>;
  if (position === 2) return <span className="position-silver">2</span>;
  if (position === 3) return <span className="position-bronze">3</span>;
  return <span className="position-default">{position}</span>;
}

function getFormColor(wins: number, losses: number) {
  const ratio = wins / (wins + losses || 1);
  if (ratio > 0.6) return 'text-green-400';
  if (ratio >= 0.4) return 'text-yellow-400';
  return 'text-red-400';
}

export function StandingsTable({ standings, compact = false }: { standings: any[]; compact?: boolean }) {
  if (!standings || standings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
          <span className="text-2xl">🏆</span>
        </div>
        <p className="text-surface-500 text-sm">No hay datos de posiciones disponibles</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] text-surface-500 uppercase tracking-[0.15em]">
            <th className="text-center py-3 px-3 w-12 font-semibold">#</th>
            <th className="text-left py-3 pr-2 font-semibold">Equipo</th>
            {!compact && (
              <>
                <th className="text-center py-3 px-2 w-10 font-semibold">PJ</th>
                <th className="text-center py-3 px-2 w-10 font-semibold">G</th>
                <th className="text-center py-3 px-2 w-10 font-semibold">E</th>
                <th className="text-center py-3 px-2 w-10 font-semibold">P</th>
                <th className="text-center py-3 px-2 w-10 font-semibold">GF</th>
                <th className="text-center py-3 px-2 w-10 font-semibold">GC</th>
                <th className="text-center py-3 px-2 w-10 font-semibold">DG</th>
              </>
            )}
            <th className="text-center py-3 pl-2 w-14 font-semibold text-primary-400">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, idx) => {
            const pos = team.position || idx + 1;
            const gf = team.goals_for ?? team.gf ?? 0;
            const gc = team.goals_against ?? team.gc ?? 0;
            const gd = team.goal_difference ?? team.dg ?? gf - gc;
            const pts = team.points ?? team.pts ?? 0;
            const pj = team.played ?? team.pj ?? 0;
            const won = team.won ?? team.g ?? 0;
            const drawn = team.drawn ?? team.e ?? 0;
            const lost = team.lost ?? team.p ?? 0;

            return (
              <tr
                key={team.id || `standings-${team.team_name || team.name}-${idx}`}
                className={cn(
                  'border-t border-white/[0.03] transition-colors hover:bg-white/[0.03] cursor-pointer',
                  pos === 1 && 'border-t-2 border-t-yellow-500/20',
                )}
              >
                <td className="py-3 px-3">
                  <PositionBadge position={pos} />
                </td>
                <td className="py-3 pr-2 font-semibold text-sm truncate max-w-[130px] sm:max-w-none">
                  <span className="flex items-center gap-2">
                    <span className={cn('w-1 h-1 rounded-full flex-shrink-0', getFormColor(won, lost))} />
                    {team.team_name || team.name}
                  </span>
                </td>
                {!compact && (
                  <>
                    <td className="text-center py-3 px-2 text-surface-400 font-mono text-xs tabular-nums">{pj}</td>
                    <td className="text-center py-3 px-2 text-surface-400 font-mono text-xs tabular-nums">{won}</td>
                    <td className="text-center py-3 px-2 text-surface-400 font-mono text-xs tabular-nums">{drawn}</td>
                    <td className="text-center py-3 px-2 text-surface-400 font-mono text-xs tabular-nums">{lost}</td>
                    <td className="text-center py-3 px-2 text-surface-400 font-mono text-xs tabular-nums">{gf}</td>
                    <td className="text-center py-3 px-2 text-surface-400 font-mono text-xs tabular-nums">{gc}</td>
                    <td className={cn(
                      'text-center py-3 px-2 font-mono text-xs tabular-nums font-bold',
                      gd > 0 ? 'text-green-400' : gd < 0 ? 'text-red-400' : 'text-surface-500'
                    )}>
                      {gd > 0 ? `+${gd}` : gd}
                    </td>
                  </>
                )}
                <td className="text-center py-3 pl-2 font-mono text-sm font-black tabular-nums">
                  <span className={cn(
                    'px-2.5 py-1 rounded-lg',
                    pts >= 20 ? 'text-primary-400 bg-primary-500/10' : 'text-surface-300 bg-white/5'
                  )}>
                    {pts}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
