'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const QUICK_ACTIONS = [
  { label: '¿Quién va primero?', prompt: '¿Quién va primero en las posiciones de Primera A?' },
  { label: 'Resultados de hoy', prompt: '¿Qué partidos hay hoy?' },
  { label: 'Análisis Boca vs River', prompt: 'Hace un análisis comparativo de Boca Juniors vs River Plate en futsal' },
  { label: 'Tabla de goleadores', prompt: '¿Quién es el goleador de Primera A?' },
  { label: '¿Cuándo es la próxima fecha?', prompt: '¿Cuándo es la próxima fecha del torneo?' },
  { label: 'H2H equipos', prompt: 'Hace un head to head entre Boca Juniors y Pinocho' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: '¡Hola! Soy tu asistente de Futsal Argentino. Preguntame lo que quieras sobre partidos, equipos, estadísticas o historial.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chat.send({ message: text, history: messages.slice(-6) });
      setMessages(prev => [...prev, { role: 'ai', content: res.response || 'No pude procesar eso.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Hubo un error al conectar con el asistente. Intentalo de nuevo.' }]);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <h1 className="text-2xl font-black uppercase tracking-widest mb-4">Asistente IA</h1>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_ACTIONS.map((qa, i) => (
            <button
              key={i}
              onClick={() => sendMessage(qa.prompt)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.04] border border-white/[0.06] text-surface-400 hover:text-white hover:bg-white/[0.08] transition-all"
            >
              {qa.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/10 text-white border border-primary-500/30'
                : 'bg-white/[0.06] text-white/90 border border-white/[0.06] backdrop-blur-sm'
            )}>
              {msg.content}
            </div>
          </div>
        ))}
          {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.06] border border-white/[0.06] backdrop-blur-sm rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
          placeholder="Escribí tu pregunta..."
          className="input-search flex-1"
          disabled={loading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="px-6 py-2.5 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-xl font-semibold text-sm hover:bg-primary-500/30 transition-all disabled:opacity-40"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
