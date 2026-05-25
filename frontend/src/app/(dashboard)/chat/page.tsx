'use client';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const FAQ = [
  { q: '¿Quién va primero?', r: 'primera-a' },
  { q: 'Resultados de hoy', r: 'hoy' },
  { q: 'Tabla de goleadores', r: 'goleadores' },
  { q: 'Próximos partidos', r: 'proximos' },
  { q: 'Boca vs River', r: 'boca-vs-river' },
  { q: '¿Qué divisiones hay?', r: 'divisiones' },
];

const FAQ_RESPONSES: Record<string, string> = {
  'primera-a': 'En Primera A, Barracas Central lidera con 29 pts, seguido por América del Sud (29) y Boca (23). Mirá la tabla completa en Posiciones.',
  'hoy': 'No hay partidos programados para hoy. Revisá la sección Partidos o Fixture para ver los próximos.',
  'goleadores': 'Los goleadores varían por división. Andá a la sección de cada liga en Posiciones para ver los máximos anotadores.',
  'proximos': 'Los próximos partidos incluyen Villa Modelo vs 25 de Mayo (Primera C) y varios de Primera D. Revisá la sección Partidos > Fixture.',
  'boca-vs-river': 'Boca y River están en Primera A. Boca tiene 23 pts en 9 partidos, River 22 pts en 12. Para un análisis detallado usá la sección H2H.',
  'divisiones': 'El futsal argentino tiene: Primera A, B, C, D (Zona A y B), Femenino A, B, C y Copa Argentina. Cada una con su propia tabla y fixture.',
};

export default function ChatPage() {
  const [messages, setMessages] = useState([{ role: 'ai', content: '¡Hola! Soy el asistente de Futsal Online. Haceme cualquier consulta.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setMessages(p => [...p, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.chat.send({ message: text, history: messages.slice(-4) });
      setMessages(p => [...p, { role: 'ai', content: res.response || 'No pude procesar eso.' }]);
    } catch {
      const faq = FAQ.find(f => text.toLowerCase().includes(f.q.toLowerCase().slice(0, 8)));
      setMessages(p => [...p, { role: 'ai', content: faq ? FAQ_RESPONSES[faq.r] || FAQ_RESPONSES['divisiones'] : 'No entendí. Preguntame sobre resultados, posiciones, equipos o el torneo.' }]);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-xs font-black text-white">FO</div>
        <h1 className="text-lg font-black uppercase tracking-widest">Asistente IA</h1>
      </div>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {FAQ.map((f, i) => (
            <button key={i} onClick={() => send(f.q)} className="px-2.5 py-1.5 text-[11px] rounded-lg bg-white/[0.04] border border-white/[0.06] text-surface-400 hover:text-white hover:bg-white/[0.08] transition-colors">{f.q}</button>
          ))}
        </div>
      )}

      <div className="h-[50vh] overflow-y-auto space-y-2 mb-3 rounded-2xl border border-white/[0.06] p-4 bg-white/[0.01] scrollbar-thin">
        {messages.map((m, i) => (
          <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed', m.role === 'user' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/20' : 'bg-white/[0.04] text-surface-300 border border-white/[0.06]')}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.06]">
              <div className="flex gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{animationDelay:'0ms'}} /><span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{animationDelay:'150ms'}} /><span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{animationDelay:'300ms'}} /></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)} placeholder="Escribí tu pregunta..." className="input-search flex-1 text-sm" disabled={loading} />
        <button onClick={() => send(input)} disabled={loading || !input.trim()} className="px-5 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl font-semibold text-sm hover:bg-orange-500/30 transition-all disabled:opacity-40">Enviar</button>
      </div>

      <p className="text-[10px] text-surface-600 mt-3 text-center">También podés usar el botón flotante ⬇️ para consultas rápidas desde cualquier página.</p>
    </div>
  );
}
