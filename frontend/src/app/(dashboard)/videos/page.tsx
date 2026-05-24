'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'highlights', label: 'Resúmenes' },
  { id: 'goals', label: 'Goles' },
  { id: 'interviews', label: 'Entrevistas' },
  { id: 'analysis', label: 'Análisis' },
  { id: 'streams', label: 'En Vivo' },
];

const LEAGUES = [
  { id: '', label: 'General' },
  { id: 'primera-a', label: 'Primera A' },
  { id: 'primera-b', label: 'Primera B' },
  { id: 'femenino-a', label: 'Femenino' },
];

function UploadSection({ onUploaded }) {
  const fileRef = useRef(null);
  const [title, setTitle] = useState('');
  const [league, setLeague] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileRef.current?.files?.[0]) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('video', fileRef.current.files[0]);
      if (title) form.append('title', title);
      if (league) form.append('league', league);
      form.append('category', 'highlights');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/videos/upload`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (onUploaded) onUploaded(data);
      setTitle('');
      fileRef.current.value = '';
    } catch {}
    setUploading(false);
  };

  return (
    <details className="card-gradient overflow-hidden">
      <summary className="p-4 cursor-pointer text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:text-primary-400 transition-colors">
        <span>📤</span> Subir Video
      </summary>
      <form onSubmit={handleUpload} className="p-4 pt-0 space-y-3 border-t border-white/5">
        <input
          type="text"
          placeholder="Título del video (opcional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-search text-sm py-2"
        />
        <select
          value={league}
          onChange={(e) => setLeague(e.target.value)}
          className="input-search text-sm py-2"
        >
          {LEAGUES.map((l) => (
            <option key={l.id} value={l.id} className="bg-surface">{l.label}</option>
          ))}
        </select>
        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          className="input-search text-sm py-2 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary-500/20 file:text-primary-400 file:text-xs file:font-semibold hover:file:bg-primary-500/30"
        />
        <button type="submit" disabled={uploading} className="btn-primary text-sm w-full">
          {uploading ? 'Subiendo...' : 'Subir Video'}
        </button>
      </form>
    </details>
  );
}

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const data = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/videos`).then(r => r.json());
      setVideos(data || []);
    } catch {
      try {
        const data = await api.scraper.videos();
        setVideos(data.videos || []);
      } catch { setVideos([]); }
    }
    setLoading(false);
  };

  useEffect(() => { loadVideos(); }, []);

  const filtered = category === 'all'
    ? videos
    : videos.filter((v) => v.category === category);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center text-lg">🎥</div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest">Videos</h1>
          <p className="text-xs text-surface-500 mt-0.5">{videos.length} videos</p>
        </div>
      </div>

      <UploadSection onUploaded={loadVideos} />

      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-lg transition-all border',
              category === c.id
                ? 'bg-primary-500/20 text-primary-400 border-primary-500/30'
                : 'text-surface-400 hover:text-white bg-white/5 border-white/5'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="card-gradient p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎥</span>
          </div>
          <h2 className="text-xl font-bold mb-2">No hay videos</h2>
          <p className="text-surface-400 text-sm px-4">Subí tu primer video o esperá a que se carguen desde las fuentes automáticas</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v, i) => (
            <a key={v.id || i} href={v.url} target="_blank" rel="noopener noreferrer" className="glass-hover rounded-xl overflow-hidden group block">
              <div className="aspect-video bg-gradient-to-br from-surface-200/50 to-surface-300/20 flex items-center justify-center overflow-hidden">
                <span className="text-6xl group-hover:scale-110 transition-transform duration-300">▶️</span>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold group-hover:text-primary-400 transition-colors line-clamp-2">
                  {v.title || `Video de Futsal`}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] uppercase tracking-wider text-surface-500 font-semibold">{v.source || 'FutsalPlay'}</span>
                  {v.league && <span className="text-[10px] text-surface-500/60">{v.league}</span>}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
