'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';
import { AdBanner } from './AdBanner';
import { LogoCanvas } from './LogoCanvas';

const navLinks = [
  { label: 'En Vivo', href: '/live' },
  { label: 'Partidos', href: '/partidos' },
  { label: 'Posiciones', href: '/posiciones' },
  { label: 'Fixture', href: '/partidos?tab=fixture' },
  { label: 'Equipos', href: '/equipos' },
  { label: 'Chat IA', href: '/chat' },
  { label: 'Videos', href: '/videos' },
];

const leagues = [
  { label: 'Primera A', href: '/?league=primera-a' },
  { label: 'Primera B', href: '/?league=primera-b' },
  { label: 'Primera C', href: '/?league=primera-c' },
  { label: 'Primera D ZA', href: '/?league=primera-d-za' },
  { label: 'Primera D ZB', href: '/?league=primera-d-zb' },
  { label: 'Femenino', href: '/?league=femenino-a' },
  { label: 'Copa Argentina', href: '/?league=copa-argentina' },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={cn(
      'sticky top-0 z-50 w-full transition-all duration-300',
      scrolled ? 'bg-surface/80 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/10' : 'bg-surface'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <LogoCanvas size={36} />
            <span className="text-lg font-black tracking-tight">
              <span className="text-gradient">Futsal</span><span className="text-white/90"> Online</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap',
                  pathname === link.href
                    ? 'bg-primary-500/15 text-primary-400 shadow-sm shadow-primary-500/5'
                    : 'text-surface-500 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            onClick={toggle}
            className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-white/5 transition-all"
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-xl text-surface-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-white/5 bg-surface/90 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all',
                  pathname === link.href
                    ? 'bg-primary-500/15 text-primary-400'
                    : 'text-surface-400 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-white/5">
              <p className="text-xs text-surface-500 px-4 mb-2 font-semibold uppercase tracking-wider">Divisiones</p>
              <div className="space-y-0.5">
                {leagues.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-surface-400 hover:text-white rounded-lg transition-all hover:bg-white/5"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
