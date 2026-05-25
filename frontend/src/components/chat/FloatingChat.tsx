'use client';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const FAQ_BOT = [
  { q: '¿Cómo ver partidos en vivo?', a: 'Andá a la sección "En Vivo" del menú o a "Partidos" para ver todos los resultados.' },
  { q: '¿Dónde están las posiciones?', a: 'En la sección "Posiciones" tenés todas las tablas por división.' },
  { q: '¿Qué divisiones hay?', a: 'Primera A, B, C, D (Zona A y B), Femenino A, B, C y Copa Argentina.' },
  { q: '¿Cómo busco un equipo?', a: 'Usá el buscador en la página principal o andá a "Equipos".' },
  { q: '¿Tiene chat con IA?', a: 'Sí, usá el chat completo en "Chat IA" o preguntá acá abajo.' },
];

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState<{role:string;content:string}[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setChat(p => [...p, { role: 'user', content: text }]);
    setMsg('');
    setLoading(true);
    try {
      const res = await api.chat.send({ message: text, history: chat.slice(-4) });
      setChat(p => [...p, { role: 'ai', content: res.response || 'No pude procesar eso.' }]);
    } catch {
      const faq = FAQ_BOT.find(f => text.toLowerCase().includes(f.q.toLowerCase().slice(0, 10)));
      setChat(p => [...p, { role: 'ai', content: faq?.a || 'Consultame sobre resultados, equipos o posiciones.' }]);
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/30 flex items-center justify-center hover:scale-105 transition-transform"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-80 sm:w-96 rounded-2xl border border-white/[0.08] bg-surface/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <span className="text-sm font-bold">💬 Consultá rápido</span>
            <button onClick={() => setOpen(false)} className="text-surface-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="h-64 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {chat.length === 0 && (
              <div className="flex flex-wrap gap-1.5">
                {FAQ_BOT.map((f, i) => (
                  <button key={i} onClick={() => send(f.q)} className="px-2.5 py-1.5 text-[11px] rounded-lg bg-white/[0.04] border border-white/[0.06] text-surface-400 hover:text-white hover:bg-white/[0.08] transition-colors">
                    {f.q}
                  </button>
                ))}
              </div>
            )}
            {chat.map((m, i) => (
              <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed', m.role === 'user' ? 'bg-orange-500/20 text-orange-300' : 'bg-white/[0.04] text-surface-300')}>{m.content}</div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="rounded-xl px-3 py-2 bg-white/[0.04]"><div className="flex gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{animationDelay:'0ms'}} /><span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{animationDelay:'150ms'}} /><span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{animationDelay:'300ms'}} /></div></div></div>}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t border-white/[0.06] flex gap-2">
            <input ref={inputRef} type="text" value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(msg)} placeholder="Escribí..." className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-surface-500 outline-none focus:border-orange-500/40 transition-colors" disabled={loading} />
            <button onClick={() => send(msg)} disabled={loading || !msg.trim()} className="px-3 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-semibold hover:bg-orange-500/30 transition-colors disabled:opacity-40">→</button>
          </div>
        </div>
      )}
    </>
  );
}
