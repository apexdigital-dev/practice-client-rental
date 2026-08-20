-- Apex Drive — vehicles table (Supabase/Postgres)
-- Ready to run later in the Supabase SQL editor once the owner's project exists.
-- The public site reads this table when NEXT_PUBLIC_SUPABASE_URL and
-- NEXT_PUBLIC_SUPABASE_ANON_KEY are set; the admin dashboard (next task) writes
-- to it with the service-role key.

create table if not exists public.vehicles (
  id           text primary key,
  title        text not null,
  category     text not null check (category in ('SUVs & 4WD', 'Sedans & Economy', 'Luxury & Wedding')),
  image_url    text not null,
  transmission text not null check (transmission in ('Auto', 'Manual')),
  fuel         text not null,
  seats        int  not null check (seats > 0),
  price_etb    int  not null check (price_etb >= 0),
  available    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Public read for the catalog; writes go through the service-role key (bypasses
-- RLS) from the admin dashboard, so no anon-key write policies are needed.
alter table public.vehicles enable row level security;

drop policy if exists "Public read vehicles" on public.vehicles;
create policy "Public read vehicles" on public.vehicles
  for select using (true);

create index if not exists vehicles_category_idx on public.vehicles (category);
create index if not exists vehicles_available_idx on public.vehicles (available);
