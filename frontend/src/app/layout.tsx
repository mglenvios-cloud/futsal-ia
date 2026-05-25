import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { FloatingChat } from '@/components/chat/FloatingChat';
import { AdBanner } from '@/components/ui/AdBanner';

export const metadata: Metadata = {
  title: 'Futsal Online | Resultados en Vivo, Tablas y Estadísticas',
  description: 'Portal del Futsal Argentino. Resultados en vivo, tablas de posiciones, fixture, goleadores, videos y análisis de todas las divisiones.',
  keywords: 'futsal argentina, futsal online, paren la pelota, resultado futsal, tabla posiciones futsal, futsal en vivo',
  openGraph: {
    title: 'Futsal Online | Resultados en Vivo',
    description: 'Resultados en vivo, tablas y estadísticas del Futsal Argentino',
    type: 'website',
    locale: 'es_AR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <AdBanner size="sm" />
            <div className="mt-4">{children}</div>
          </main>
          <footer className="border-t border-white/[0.06] mt-12 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <AdBanner size="sm" />
              <p className="text-center text-[10px] text-surface-600 mt-4 uppercase tracking-widest">Futsal Online © 2026 — Datos proporcionados por ParenLaPelota</p>
            </div>
          </footer>
          <FloatingChat />
        </ThemeProvider>
      </body>
    </html>
  );
}
