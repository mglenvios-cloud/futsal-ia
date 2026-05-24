'use client';

import { useState } from 'react';
import { cn, getMatchStatus } from '@/lib/utils';
import Link from 'next/link';
import { api } from '@/lib/api';

export function LiveMatchCard({ match, onUpdate }: { match: any; onUpdate?: () => void }) {
  const status = getMatchStatus(match.status, match.minute);
  const [showActions, setShowActions] = useState(false);

  const finalizar = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await api.matches.update(match.id, {
      status: 'finished',
      home_score: match.home_score ?? 0,
      away_score: match.away_score ?? 0,
    });
    if (onUpdate) onUpdate();
  };

  const golLocal = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await api.matches.addGoal(match.id, { team: 'home', player_name: 'Jugador Local', minute: match.minute || 1, type: 'goal' });
    await api.matches.update(match.id, { minute: (match.minute || 1) + 1 });
    if (onUpdate) onUpdate();
  };

  const golVisitante = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await api.matches.addGoal(match.id, { team: 'away', player_name: 'Jugador Visitante', minute: match.minute || 1, type: 'goal' });
    await api.matches.update(match.id, { minute: (match.minute || 1) + 1 });
    if (onUpdate) onUpdate();
  };

  return (
    <div className="relative group">
      <Link href={`/partidos/${match.id}`} className="glass-hover p-4 block rounded-xl live-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">{match.league}</span>
          <span className={cn('px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1.5', status.color)}>
            {status.dot === 'live' && <span className="live-dot" />}
            {status.label}
          </span>
        </div>

        {match.goals && match.goals.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {match.goals.slice(-3).map(g => (
              <span key={g.id} className={cn(
                'text-[10px] px-1.5 py-0.5 rounded font-medium',
                g.team === 'home' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
              )}>
                {g.player_name.split(' ').pop()} {g.minute}'
              </span>
            ))}
            {match.goals.length > 3 && <span className="text-[10px] text-surface-500">+{match.goals.length - 3}</span>}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-right">
            <p className="text-sm font-semibold group-hover:text-primary-400 transition-colors">{match.home_team}</p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2">
            <span className={cn('text-2xl font-black font-mono tabular-nums', match.home_score > match.away_score ? 'text-primary-400' : 'text-white')}>
              {match.home_score ?? '-'}
            </span>
            <span className="text-surface-500 font-bold">:</span>
            <span className={cn('text-2xl font-black font-mono tabular-nums', match.away_score > match.home_score ? 'text-primary-400' : 'text-white')}>
              {match.away_score ?? '-'}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold group-hover:text-primary-400 transition-colors">{match.away_team}</p>
          </div>
        </div>

        {match.status === 'live' && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3 text-xs text-surface-500">
            <span>{match.minute ? `${match.minute}'` : (match.venue || 'Cancha no especificada')}</span>
            <span className="ml-auto">{match.round || ''}</span>
          </div>
        )}
      </Link>

      {/* Quick actions overlay */}
      {match.status === 'live' && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowActions(!showActions)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-surface-400"
          >
            ⚡
          </button>
          {showActions && (
            <div className="absolute right-0 top-8 bg-surface-900 border border-white/10 rounded-xl p-1 shadow-xl z-10 min-w-[140px]">
              <button onClick={golLocal} className="w-full text-left px-3 py-1.5 text-xs text-green-400 hover:bg-white/5 rounded-lg">⚽ Gol Local</button>
              <button onClick={golVisitante} className="w-full text-left px-3 py-1.5 text-xs text-blue-400 hover:bg-white/5 rounded-lg">⚽ Gol Visitante</button>
              <div className="border-t border-white/5 my-1" />
              <button onClick={finalizar} className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-white/5 rounded-lg">⏹ Finalizar</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
