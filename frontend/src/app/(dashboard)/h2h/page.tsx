'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function H2HPage() {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleCompare() {
    if (!teamA.trim() || !teamB.trim()) return;
    setLoading(true);
    try {
      const data = await api.h2h.compare({ team_a: teamA, team_b: teamB });
      setResult(data);
    } catch {
      setResult({ error: 'No se pudieron obtener los datos. Verificá los nombres de los equipos.' });
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-black uppercase tracking-widest">Head to Head</h1>
      <p className="text-surface-400 text-sm">Compará dos equipos y conocé su historial de enfrentamientos</p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-surface-500 mb-1 block font-medium">Equipo A</label>
          <input
            type="text"
            value={teamA}
            onChange={(e) => setTeamA(e.target.value)}
            placeholder="Ej: Boca Juniors"
            className="input-search w-full"
            onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
          />
        </div>
        <div>
          <label className="text-xs text-surface-500 mb-1 block font-medium">Equipo B</label>
          <input
            type="text"
            value={teamB}
            onChange={(e) => setTeamB(e.target.value)}
            placeholder="Ej: River Plate"
            className="input-search w-full"
            onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
          />
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={loading || !teamA.trim() || !teamB.trim()}
        className="w-full py-3 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-xl font-bold text-sm hover:bg-primary-500/30 transition-all disabled:opacity-40"
      >
        {loading ? 'Comparando...' : 'Comparar'}
      </button>

      {result && (
        <div className="card p-6 space-y-6">
          {result.error ? (
            <p className="text-red-400 text-sm">{result.error}</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm font-semibold">{teamA}</p>
                  <p className="text-3xl font-black text-primary-400">{result.team_a_wins || 0}</p>
                  <p className="text-xs text-surface-500">Victorias</p>
                </div>
                <div>
                  <p className="text-sm text-surface-400">VS</p>
                  <p className="text-3xl font-black text-surface-400">{result.draws || 0}</p>
                  <p className="text-xs text-surface-500">Empates</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">{teamB}</p>
                  <p className="text-3xl font-black text-primary-400">{result.team_b_wins || 0}</p>
                  <p className="text-xs text-surface-500">Victorias</p>
                </div>
              </div>

              {result.total_matches > 0 && (
                <div className="text-center">
                  <span className="text-xs text-surface-500">Se enfrentaron </span>
                  <span className="text-sm font-bold text-white">{result.total_matches}</span>
                  <span className="text-xs text-surface-500"> veces</span>
                </div>
              )}

              {result.last_matches?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-3">Últimos Enfrentamientos</h3>
                  <div className="space-y-2">
                    {result.last_matches.map((m, i) => (
                      <div key={i} className="flex items-center justify-between bg-surface-200/20 rounded-xl px-4 py-2.5 text-sm">
                        <span className="font-medium truncate mr-2">{m.home_team}</span>
                        <span className="font-mono font-bold text-primary-400 whitespace-nowrap">{m.home_score} - {m.away_score}</span>
                        <span className="font-medium truncate ml-2">{m.away_team}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
