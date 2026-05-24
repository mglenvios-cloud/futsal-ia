# AGENTS.md - Futsal IA

## Dev Servers

```bash
# Backend (port 4000)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm run dev
```

## Lint / Typecheck

```bash
# Backend lint
cd backend && npm run lint

# Frontend lint
cd frontend && npm run lint

# Frontend typecheck
cd frontend && npm run typecheck
```

## Build

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

## Architecture

- `backend/` - Express + Socket.io + node-cron + SQLite
- `frontend/` - Next.js 16 App Router + TailwindCSS + Socket.io-client
- Scraping via cheerio/axios from ParenLaPelota
- AI via OpenAI GPT-4 with fallback

## Deployment

### Backend → Railway

```bash
cd backend
# Create account at railway.app → New Project → Deploy from GitHub repo
# Set env: PORT=4000, FRONTEND_URL=https://futsal-ia.vercel.app
# Add volume mount: /data for SQLite persistence
```

### Frontend → Vercel

```bash
cd frontend
# Create account at vercel.com → Import GitHub repo
# Set env: NEXT_PUBLIC_API_URL=https://futsal-ia-backend.up.railway.app
#         NEXT_PUBLIC_SOCKET_URL=https://futsal-ia-backend.up.railway.app
```
