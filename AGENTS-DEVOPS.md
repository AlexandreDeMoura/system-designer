# AGENTS-DEVOPS.md

Deployment and infrastructure configuration for System Designer.

---

## Architecture Overview

| Component | Platform | Domain |
|-----------|----------|--------|
| Frontend (`@sd/web`) | Cloudflare Pages | `system-designer.com` |
| Backend (`@sd/server`) | Fly.io | `system-designer-floral-hill-7039.fly.dev` |
| Database & Auth | Supabase Cloud | — |

---

## Frontend (Cloudflare Pages)

- Auto-deploys from `main` branch
- Build command: `npm run build`, output: `apps/web/dist`
- Environment variables:
  - `VITE_SUPABASE_URL` — Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key
  - `VITE_API_URL` — Fly.io backend URL (`https://system-designer-floral-hill-7039.fly.dev`)

---

## Backend (Fly.io)

- Deploys via `Dockerfile` at repo root (handles monorepo workspace deps)
- Config in `fly.toml`
- Secrets (set via `fly secrets set KEY=value`):
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `ANTHROPIC_API_KEY`

---

## Supabase Auth

Authentication uses Supabase Auth with two providers:

- **Email + Password** — Users sign up with email, receive confirmation email
- **Google OAuth** — Social login via Google

### URL Configuration (Supabase Dashboard → Authentication → URL Configuration)

| Setting | Value |
|---------|-------|
| **Site URL** | `https://system-designer.com` |
| **Redirect URLs** | `https://system-designer.com`, `https://www.system-designer.com`, `http://localhost:5173` |

The Site URL is the default redirect after email confirmation. All redirect URLs in the allowlist work for OAuth and magic links. Keep `localhost:5173` for local development.

### Google OAuth Setup

Configure in Supabase Dashboard → Authentication → Providers → Google:
- Requires Google Cloud Console OAuth credentials
- Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`

