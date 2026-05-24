import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
}

export function getMatchStatus(status, minute) {
  switch (status) {
    case 'scheduled':
      return { label: 'Programado', color: 'text-surface-400', dot: null };
    case 'live':
      return { label: `${minute || 0}'`, color: 'text-red-400', dot: 'live' };
    case 'halftime':
      return { label: 'DESCANSO', color: 'text-yellow-400', dot: 'live' };
    case 'second_half':
      return { label: `${minute || 45}'`, color: 'text-red-400', dot: 'live' };
    case 'finished':
      return { label: 'FINALIZADO', color: 'text-green-400', dot: null };
    case 'postponed':
      return { label: 'POSTERGADO', color: 'text-orange-400', dot: null };
    case 'cancelled':
      return { label: 'CANCELADO', color: 'text-red-400', dot: null };
    default:
      return { label: status || '-', color: 'text-surface-400', dot: null };
  }
}

export function getLeagueColor(league) {
  const colors = {
    'primera-a': 'text-orange-400 border-orange-500/30',
    'primera-b': 'text-blue-400 border-blue-500/30',
    'primera-c': 'text-green-400 border-green-500/30',
    'primera-d-za': 'text-purple-400 border-purple-500/30',
    'primera-d-zb': 'text-pink-400 border-pink-500/30',
    'femenino-a': 'text-rose-400 border-rose-500/30',
    'femenino-b': 'text-rose-300 border-rose-400/30',
    'copa-argentina': 'text-yellow-400 border-yellow-500/30',
  };
  return colors[league] || 'text-surface-400 border-surface-500/30';
}

export function getLeagueName(league) {
  const names = {
    'primera-a': 'Primera A',
    'primera-b': 'Primera B',
    'primera-c': 'Primera C',
    'primera-d-za': 'Primera D Zona A',
    'primera-d-zb': 'Primera D Zona B',
    'femenino-a': 'Femenino A',
    'femenino-b': 'Femenino B',
    'copa-argentina': 'Copa Argentina',
  };
  return names[league] || league;
}

export function getTeamSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
