import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

export const metadata: Metadata = {
  title: 'Futsal Argentino | Resultados en Vivo, Tablas y Estadísticas AFA',
  description: 'Portal del Futsal Argentino AFA. Resultados en vivo, tablas de posiciones, fixture, goleadores, videos y análisis de Primera A, B, C, D, Femenino y Copas.',
  keywords: 'futsal argentina, futsal afa, paren la pelota, resultado futsal, tabla posiciones futsal, primera a futsal, futsal en vivo',
  openGraph: {
    title: 'Futsal Argentino | Resultados en Vivo AFA',
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
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
