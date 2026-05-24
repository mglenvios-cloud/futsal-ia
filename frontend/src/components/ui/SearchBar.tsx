'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ teams: [], matches: [] });
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.length < 2) { setResults({ teams: [], matches: [] }); return; }
      try {
        const data = await api.search(query);
        setResults(data);
        setOpen(true);
      } catch { setOpen(false); }
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscá equipos, partidos... (ej: Boca, River, San Lorenzo)"
          className="input-search pl-12"
        />
      </div>
      {open && (results.teams.length > 0 || results.matches.length > 0) && (
        <div className="absolute top-full mt-2 w-full bg-surface-100 border border-surface-300/30 rounded-xl shadow-2xl z-50 overflow-hidden">
          {results.teams.length > 0 && (
            <div className="p-3">
              <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider px-2 mb-2">Equipos</p>
              {results.teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/equipos/${team.slug || team.name?.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-200/50 transition-colors"
                >
                  <span className="text-lg">⚽</span>
                  <span className="text-sm font-medium">{team.name}</span>
                  <span className="text-xs text-surface-500 ml-auto">{team.league || ''}</span>
                </Link>
              ))}
            </div>
          )}
          {results.matches.length > 0 && (
            <div className="p-3 border-t border-surface-300/20">
              <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider px-2 mb-2">Partidos</p>
              {results.matches.slice(0, 5).map((match) => (
                <Link
                  key={match.id}
                  href={`/partidos/${match.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-200/50 transition-colors"
                >
                  <span className="text-lg">📅</span>
                  <span className="text-sm">{match.home_team} vs {match.away_team}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
