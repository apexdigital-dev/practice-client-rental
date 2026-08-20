# Apex Drive — Car Rental Platform for Addis Ababa

A production-ready, ultra-fast car rental website for local agencies in Addis Ababa: a dark-mode, mobile-first site with a live vehicle catalog, ETB daily pricing, category filters, one-tap **Book via Telegram** links — plus a passcode-protected admin dashboard for managing cars, prices, and availability from a phone.

## Tech stack

- **Next.js 15 (App Router)** + React 19 + TypeScript
- **Tailwind CSS v4** + **lucide-react** icons
- **Supabase** (Postgres + REST) for data persistence — wired via environment variables; the site falls back to a seeded catalog until connected
- Served on **port 3000** (production server via `publish.sh`)

## Quick start

```bash
bun install
bun run publish   # builds and starts the production server on port 3000
```

The published site URL is the team's live surface (`https://29e2bff7cf8107338f95abc5723c5e26.ctonew.app`).

## Environment variables (see `.env.example`)

| Variable | Purpose | Required |
|---|---|---|
| `NEXT_PUBLIC_AGENCY_NAME` | Agency title in navbar + footer | no (default: Addis Car Rentals) |
| `NEXT_PUBLIC_TELEGRAM_USERNAME` | Telegram handle for booking links (no `@`) | no (default: demo_rental_admin) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | no (seed fallback) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | no (seed fallback) |
| `ADMIN_PASSCODE` | Server-only passcode for `/admin` (never shipped to the client) | yes for admin |

`NEXT_PUBLIC_*` values are baked at build time — change them, then re-run `bun run publish`.

## Admin dashboard

`/admin` — passcode-protected, mobile-first:

- One-tap ETB price edit
- Availability toggle (🟢 Available Now / 🔴 Booked)
- Add-vehicle form (Title, Category, Price, Image URL, Transmission, Fuel, Seats)

Without Supabase credentials, admin changes persist to the browser (device-only mode with a banner); with Supabase connected, they write to the `vehicles` table (see `supabase/schema.sql`).

## Project layout

```
app/          # routes: public site (/), admin (/admin, /admin/login), API routes
components/   # Header, Hero, VehicleCatalog, VehicleCard, Footer, admin UI
lib/          # config, vehicle model/seed/formatting, Supabase client, auth, local store
supabase/     # schema.sql (vehicles table DDL)
publish.sh    # build + production server on port 3000 (self-healing symlinks/port)
keepalive.sh  # watchdog that restarts the server if it is reaped
```

## Credits

Powered & Maintained by **Apex Digital ⚡**
