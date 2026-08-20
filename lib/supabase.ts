// Supabase access for the vehicles catalog.
//
// Uses the Supabase REST API directly (fetch + anon key) instead of pulling in
// @supabase/supabase-js — keeps the dependency tree lean (next, react, tailwind,
// lucide-react only), per the owner spec.
//
// Contract: fetchVehiclesFromSupabase() returns null when Supabase is
// unconfigured, empty, or any request/parse error occurs. Callers fall back to
// the seeded catalog — the site must render fully without Supabase, and must
// never crash because of it.

import { CATEGORIES, type Category, type Transmission, type Vehicle } from "./vehicles";

// Supabase credentials (env-driven, no built-in defaults). When neither URL nor
// ANON key is set, `supabaseConfigured` is false and every fetch/write below
// short-circuits to null/false so the site renders the seeded catalog.
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

interface VehicleRow {
  id: string;
  title: string;
  category: string;
  image_url: string;
  transmission: string;
  fuel: string;
  seats: number;
  price_etb: number;
  available: boolean;
  created_at?: string;
}

const isCategory = (c: string): c is Category =>
  (CATEGORIES as readonly string[]).includes(c);

const isTransmission = (t: string): t is Transmission => t === "Auto" || t === "Manual";

function mapRow(row: VehicleRow): Vehicle | null {
  if (
    !row ||
    typeof row.id !== "string" ||
    typeof row.title !== "string" ||
    typeof row.image_url !== "string" ||
    typeof row.fuel !== "string" ||
    !isCategory(row.category) ||
    !isTransmission(row.transmission)
  ) {
    return null;
  }
  const seats = Number(row.seats);
  const priceEtb = Number(row.price_etb);
  if (!Number.isFinite(seats) || seats <= 0 || !Number.isFinite(priceEtb) || priceEtb < 0) {
    return null;
  }
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    imageUrl: row.image_url,
    transmission: row.transmission,
    fuel: row.fuel,
    seats,
    priceEtb,
    available: Boolean(row.available),
  };
}

export async function fetchVehiclesFromSupabase(): Promise<Vehicle[] | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/vehicles?select=*&order=created_at.asc`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const rows: unknown = await res.json();
    if (!Array.isArray(rows)) return null;
    const vehicles = rows
      .map((r) => mapRow(r as VehicleRow))
      .filter((v): v is Vehicle => v !== null);
    return vehicles.length > 0 ? vehicles : null;
  } catch {
    return null;
  }
}

// --- Admin writes (used by the admin dashboard) -----------------------------
// Coded per spec but not exercised yet: Supabase creds are not connected, so
// these return false and the dashboard falls back to localStorage. Writes use
// the anon key until a service-role key is wired up in production; the table's
// RLS allows public reads (see supabase/schema.sql), so real deployments should
// either pass a service-role key here or open anon-key write policies.

function toRow(v: Vehicle): Record<string, unknown> {
  return {
    id: v.id,
    title: v.title,
    category: v.category,
    image_url: v.imageUrl,
    transmission: v.transmission,
    fuel: v.fuel,
    seats: v.seats,
    price_etb: v.priceEtb,
    available: v.available,
  };
}

/** Upsert an existing vehicle by primary key `id`. */
export async function upsertVehicleToSupabase(vehicle: Vehicle): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/vehicles?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(toRow(vehicle)),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Insert a brand-new vehicle. */
export async function insertVehicleToSupabase(vehicle: Vehicle): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/vehicles`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(toRow(vehicle)),
    });
    return res.ok;
  } catch {
    return false;
  }
}
