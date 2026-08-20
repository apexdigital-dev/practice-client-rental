# Apex Drive — Team Site

Next.js (App Router) + Tailwind CSS v4 + lucide-react, served on **port 3000**
(published at https://29e2bff7cf8107338f95abc5723c5e26.ctonew.app).

## Layout

```
app/
  layout.tsx          HTML shell + metadata
  page.tsx            Home page (server component; fetches vehicles, falls back to seed)
  globals.css         Tailwind v4 entrypoint + base dark styles
  admin/
    page.tsx          /admin — server-gated dashboard (session cookie required)
    AdminDashboard.tsx  Fleet manager: price edit, availability toggle, add-vehicle
    login/page.tsx    /admin/login — passcode gate (refuses access if unconfigured)
    login/LoginForm.tsx
  api/admin/
    login/route.ts    POST passcode → httpOnly signed session cookie (7 days)
    logout/route.ts   POST → clears the session cookie
  components/         Header, Hero, VehicleCatalog (client), VehicleCard, Footer
lib/
  config.ts           Env-driven config (agency name, Telegram handle, Supabase)
  vehicles.ts         Vehicle model, categories, seed catalog, ETB/Telegram helpers
  supabase.ts         Supabase REST client (read + admin upsert/insert, fallback-safe)
  auth.ts             SERVER-ONLY: passcode check + HMAC-signed session tokens
  local-store.ts      Client-only localStorage overrides (admin edits when no Supabase)
supabase/schema.sql   `vehicles` table DDL — ready to run in the Supabase project
public/favicon.svg
```

## Admin dashboard (`/admin`)

- Passcode gate is server-side: `/api/admin/login` compares the submitted
  passcode against `process.env.ADMIN_PASSCODE` (constant-time) and sets an
  httpOnly, 7-day HMAC-signed session cookie. `/admin` verifies the cookie on
  every request and redirects to `/admin/login` without one.
- If `ADMIN_PASSCODE` is not set, the login page shows "Admin passcode not
  configured — set ADMIN_PASSCODE and re-publish" and refuses access.
- Writes go to Supabase (`vehicles` table) when `NEXT_PUBLIC_SUPABASE_*` are
  set (upsert on id / insert), otherwise to localStorage in "Device-only mode"
  with a visible banner. The public catalog applies the same localStorage
  overrides post-mount when Supabase is absent, so edits show up on the site in
  the same browser.

## Publish

```bash
bun run publish   # installs deps, builds, frees port 3000 (sudo lsof/kill),
                  # starts the Next production server detached, waits for it
```

Server log: `.run/server.log`. The build is memory-light (no dev server runs).

## Config (env, all optional — see .env.example)

- `NEXT_PUBLIC_AGENCY_NAME` — navbar/footer title (default "Addis Car Rentals")
- `NEXT_PUBLIC_TELEGRAM_HANDLE` — Telegram username for booking links
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — when both are
  set the site reads the `vehicles` table (schema in `supabase/schema.sql`);
  otherwise it renders the seeded catalog. Fetch errors fall back to seed.

## Storage note

`/home` is a small 300M volume, so `node_modules` and `.next` are symlinks to
`/var/tmp/apex-site-store/` (root overlay). `publish.sh` recreates the links if a
fresh clone drops them.
