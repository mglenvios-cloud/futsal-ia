'use client';

import { cn, getMatchStatus, formatDateShort, formatTime, getLeagueName } from '@/lib/utils';
import Link from 'next/link';

export function MatchCard({ match, compact = false }: { match: any; compact?: boolean }) {
  const status = getMatchStatus(match.status, match.minute);

  return (
    <Link
      href={`/partidos/${match.id}`}
      className={cn(
        'glass-hover flex gap-4 transition-all group rounded-xl relative',
        match.status === 'live' && 'live-border border-2',
        (match.stream_link || match.youtube_link) && 'border-l-2 border-l-orange-500/40',
        compact ? 'p-3' : 'p-4'
      )}
    >
      <div className={cn('flex flex-col items-center flex-shrink-0', compact ? 'min-w-[40px]' : 'min-w-[60px]')}>
        <span className={cn('font-mono font-bold', compact ? 'text-xs' : 'text-sm')}>
          {match.time ? formatTime(match.time) : '--:--'}
        </span>
        {match.date && <span className="text-xs text-surface-500">{formatDateShort(match.date)}</span>}
      </div>

      <div className="flex-1 min-w-0">
        {!compact && match.league && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-surface-500 font-semibold">{getLeagueName(match.league)}</span>
            {match.venue && <span className="text-[10px] text-surface-500/60">{match.venue}</span>}
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="flex-1 text-right truncate">
            <p className={cn('font-semibold truncate group-hover:text-primary-400 transition-colors', compact ? 'text-xs' : 'text-sm')}>{match.home_team}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={cn(
              'font-black font-mono tabular-nums min-w-[24px] text-center',
              compact ? 'text-base' : 'text-lg',
              match.status === 'live' && match.home_score > match.away_score ? 'text-primary-400' : 'text-white'
            )}>
              {match.home_score ?? '-'}
            </span>
            <span className="text-surface-500 font-bold">-</span>
            <span className={cn(
              'font-black font-mono tabular-nums min-w-[24px] text-center',
              compact ? 'text-base' : 'text-lg',
              match.status === 'live' && match.away_score > match.home_score ? 'text-primary-400' : 'text-white'
            )}>
              {match.away_score ?? '-'}
            </span>
          </div>
          <div className="flex-1 truncate">
            <p className={cn('font-semibold truncate group-hover:text-primary-400 transition-colors', compact ? 'text-xs' : 'text-sm')}>{match.away_team}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-1">
          {match.youtube_link && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              YT
            </span>
          )}
          {match.stream_link && !match.youtube_link && (
            <span className={cn(
              'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
              match.status === 'live' ? 'text-red-400 bg-red-500/15 animate-pulse' : 'text-orange-400 bg-orange-500/10'
            )}>LPF</span>
          )}
          {match.stream_link && match.youtube_link && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">LPF+YT</span>
          )}
          {status.dot === 'live' && <span className="live-dot" />}
        </div>
        {!compact && <span className={cn('text-xs font-semibold', status.color)}>{status.label}</span>}
      </div>
    </Link>
  );
}
