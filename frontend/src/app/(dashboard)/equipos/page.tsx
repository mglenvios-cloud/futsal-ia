'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

const LEAGUES = [
  { value: '', label: 'Todas' },
  { value: 'primera-a', label: 'Primera A' },
  { value: 'primera-b', label: 'Primera B' },
  { value: 'primera-c', label: 'Primera C' },
  { value: 'primera-d-zona-a', label: 'Primera D Zona A' },
  { value: 'primera-d-zona-b', label: 'Primera D Zona B' },
  { value: 'femenino-a', label: 'Femenino A' },
  { value: 'femenino-b', label: 'Femenino B' },
  { value: 'femenino-c', label: 'Femenino C' },
];

export default function EquiposPage() {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState('');
  const [league, setLeague] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.teams.list({}).then(setTeams).catch(() => setTeams([])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = teams;
    if (league) list = list.filter(t => t.league === league);
    if (search) list = list.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [teams, search, league]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black uppercase tracking-widest">Equipos</h1>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscá un equipo..."
          className="input-search flex-1 min-w-[200px]"
        />
        <select
          value={league}
          onChange={e => setLeague(e.target.value)}
          className="input-search w-auto"
        >
          {LEAGUES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <span className="text-sm text-surface-400">{filtered.length} equipos</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((team) => {
          const slug = team.name.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          return (
            <Link
              key={team.id}
              href={`/equipos/${slug}`}
              className="card-hover p-4 text-center group flex flex-col items-center gap-1.5"
            >
              <span className="text-3xl">⚽</span>
              <p className="text-sm font-semibold group-hover:text-primary-400 transition-colors leading-tight">{team.name}</p>
              {team.city && <p className="text-xs text-surface-500">{team.city}</p>}
              {team.founded && <p className="text-[10px] text-surface-500">Fundado {team.founded}</p>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
