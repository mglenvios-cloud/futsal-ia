const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  matches: {
    list: (params: Record<string, string | number>) => fetchAPI(`/matches?${new URLSearchParams(params as any)}`),
    live: () => fetchAPI('/matches/live'),
    today: () => fetchAPI('/matches/today'),
    upcoming: (limit?: number) => fetchAPI(`/matches/upcoming?limit=${limit || 20}`),
    detail: (id: string | number) => fetchAPI(`/matches/${id}`),
    update: (id: string | number, body: Record<string, any>) =>
      fetchAPI(`/matches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    goals: (matchId: string | number) => fetchAPI(`/matches/${matchId}/goals`),
    addGoal: (matchId: string | number, body: { team: string; player_name: string; minute: number; type?: string }) =>
      fetchAPI(`/matches/${matchId}/goals`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    comments: (matchId: string) => fetchAPI(`/matches/${matchId}/comments`),
    addComment: (matchId: string, body: { text: string; author: string; userId?: number | null }) =>
      fetchAPI(`/matches/${matchId}/comments`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  teams: {
    list: (params: Record<string, string | number>) => fetchAPI(`/teams?${new URLSearchParams(params as any)}`),
    detail: (slug: string) => fetchAPI(`/teams/${slug}`),
  },

  standings: {
    list: (league: string) => fetchAPI(`/standings?${new URLSearchParams({ league })}`),
  },

  stats: {
    scorers: (league: string, limit?: number) => fetchAPI(`/stats/scorers?${new URLSearchParams({ league, limit: String(limit || 20) })}`),
  },

  chat: {
    send: (body: { message: string; history?: any[] }) =>
      fetchAPI('/ai/chat', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  h2h: {
    compare: (body: { team_a: string; team_b: string }) =>
      fetchAPI('/h2h/compare', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  auth: {
    register: (body: { username: string; password: string; email?: string }) =>
      fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: { username: string; password: string }) =>
      fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: (token: string) =>
      fetchAPI('/auth/me', { headers: { Authorization: token } }),
  },

  search: (q: string) => fetchAPI(`/search?q=${encodeURIComponent(q)}`),

  scraper: {
    videos: () => fetchAPI('/scraper/videos'),
  },

  notifications: {
    list: (userId?: string) => fetchAPI(`/notifications?userId=${userId || ''}`),
  },
};
