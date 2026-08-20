// Client-side persistence for the admin dashboard when Supabase is NOT
// configured (today's reality). Stores per-vehicle overrides plus newly added
// vehicles in localStorage, keyed by vehicle id, so edits survive reloads and
// are visible to the public catalog in the same browser.
//
// Shape stored under `apex_drive_admin_vehicles_v1`:
//   { overrides: { [vehicleId]: Partial<Vehicle> }, added: Vehicle[] }
//
// This module is SSR-safe (no window access at module scope) and may be
// imported from client components only.

import type { Vehicle } from "./vehicles";

const STORAGE_KEY = "apex_drive_admin_vehicles_v1";

export interface StoredState {
  overrides: Record<string, Partial<Vehicle>>;
  added: Vehicle[];
}

const EMPTY: StoredState = { overrides: {}, added: [] };

function read(): StoredState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return EMPTY;
    const state = parsed as Partial<StoredState>;
    return {
      overrides:
        state.overrides && typeof state.overrides === "object" ? state.overrides : {},
      added: Array.isArray(state.added) ? state.added : [],
    };
  } catch {
    return EMPTY;
  }
}

function write(state: StoredState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full/blocked — edits just won't persist; UI still works in-memory.
  }
}

/**
 * Merge a base catalog (seed or Supabase rows) with local overrides and added
 * vehicles. Overrides win per-vehicle; added vehicles append at the end.
 */
export function mergeLocalOverrides(base: Vehicle[]): Vehicle[] {
  const { overrides, added } = read();
  const merged = base.map((v) =>
    overrides[v.id] ? { ...v, ...overrides[v.id] } : v,
  );
  const existing = new Set(merged.map((v) => v.id));
  const additions = added.filter((a) => !existing.has(a.id));
  return [...merged, ...additions];
}

/** Persist a (partial) update to one vehicle. */
export function saveOverride(id: string, patch: Partial<Vehicle>): void {
  const state = read();
  state.overrides[id] = { ...(state.overrides[id] ?? {}), ...patch };
  write(state);
}

/** Persist a brand-new vehicle. */
export function addVehicleLocal(vehicle: Vehicle): void {
  const state = read();
  state.added = state.added.filter((a) => a.id !== vehicle.id);
  state.added.push(vehicle);
  write(state);
}

export const LOCAL_STORAGE_KEY = STORAGE_KEY;
