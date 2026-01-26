# E2E (Playwright)

## Prereqs

- Local Supabase is running (Docker required): `npx supabase start`
- DB is migrated + seeded: `npx supabase db reset`
  - The seed lives at `supabase/seed.sql` (wired via `supabase/config.toml`).
  - Seeded E2E user:
    - Email: `test@example.com`
    - Password: `testpassword123`

## Run tests

Playwright starts the app via `playwright.config.ts` (`npm run dev`, waits on `http://localhost:5173`).

- `npm run test:e2e`
- `npm run test:e2e:headed`
- `npm run test:e2e:ui`

## Notes

- Ensure `apps/web` + `apps/server` env vars point to your local Supabase instance:
  - Web: `VITE_SUPABASE_URL` should be the local API URL (default `http://127.0.0.1:54321`), plus `VITE_SUPABASE_ANON_KEY`
  - Server: `SUPABASE_URL` should be the local API URL (default `http://127.0.0.1:54321`), plus `SUPABASE_ANON_KEY` (loaded from `apps/server/.env`)
