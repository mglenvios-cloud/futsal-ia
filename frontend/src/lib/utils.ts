import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLeagueName(slug: string): string {
  const names: Record<string, string> = {
    'primera-a': 'Primera A',
    'primera-b': 'Primera B',
    'primera-c': 'Primera C',
    'primera-d-za': 'Primera D Zona A',
    'primera-d-zb': 'Primera D Zona B',
    'femenino-a': 'Femenino A',
    'femenino-b': 'Femenino B',
    'femenino-c': 'Femenino C',
    'copa-argentina': 'Copa Argentina',
  };
  return names[slug] || slug;
}

export const LEAGUE_SLUGS = [
  'primera-a',
  'primera-b',
  'primera-c',
  'primera-d-za',
  'primera-d-zb',
  'femenino-a',
  'femenino-b',
  'femenino-c',
  'copa-argentina',
];

export function getLeagueColor(slug: string): string {
  const colors: Record<string, string> = {
    'primera-a': 'text-yellow-400',
    'primera-b': 'text-blue-400',
    'primera-c': 'text-green-400',
    'primera-d-za': 'text-purple-400',
    'primera-d-zb': 'text-purple-400',
    'femenino-a': 'text-pink-400',
    'femenino-b': 'text-pink-400',
    'copa-argentina': 'text-red-400',
  };
  return colors[slug] || 'text-surface-400';
}

export function getMatchStatus(status?: string, minute?: number) {
  switch (status) {
    case 'live':
      return {
        label: minute ? `${minute}'` : 'EN VIVO',
        color: 'text-red-500 bg-red-500/15',
        dot: 'live',
      };
    case 'finished':
      return { label: 'Finalizado', color: 'text-surface-400 bg-surface-400/15', dot: 'finished' };
    case 'postponed':
      return { label: 'Postergado', color: 'text-yellow-400 bg-yellow-400/15', dot: 'postponed' };
    case 'cancelled':
      return { label: 'Suspendido', color: 'text-red-400 bg-red-400/15', dot: 'cancelled' };
    default:
      return { label: 'Programado', color: 'text-surface-500 bg-surface-500/10', dot: 'scheduled' };
  }
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
}

export function getTeamSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
