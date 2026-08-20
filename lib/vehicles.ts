// Vehicle domain model, categories, seed catalog, and formatting helpers.
// The admin dashboard and the catalog reuse this module.
//
// The seed catalog itself now lives in config/siteConfig.ts (the single source
// of truth); here we just re-export it as SEED_VEHICLES so existing importers
// (admin, page) keep working unchanged.

import { siteConfig } from "@/config/siteConfig";

export const CATEGORIES = [
  "SUVs & 4WD",
  "Sedans & Economy",
  "Luxury & Wedding",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Transmission = "Auto" | "Manual";

export interface Vehicle {
  id: string;
  title: string;
  category: Category;
  imageUrl: string;
  transmission: Transmission;
  fuel: string;
  seats: number;
  priceEtb: number;
  available: boolean;
}

/** "15,000 ETB / day" — comma-separated thousands, exact card format. */
export function formatEtb(priceEtb: number): string {
  return `${priceEtb.toLocaleString("en-US")} ETB / day`;
}

export function availabilityLabel(vehicle: Vehicle): string {
  return vehicle.available ? "🟢 Available Now" : "🔴 Booked";
}

/** Pre-filled one-tap Telegram booking link for a vehicle. */
export function telegramBookingUrl(handle: string, vehicle: Vehicle): string {
  const message = `Hello! I'd like to book the ${vehicle.title} (${vehicle.category}) — ${formatEtb(
    vehicle.priceEtb,
  )} (${availabilityLabel(vehicle)}).`;
  return `https://t.me/${handle}?text=${encodeURIComponent(message)}`;
}

// Seeded catalog read from the central config. Supabase rows replace this list
// once NEXT_PUBLIC_SUPABASE_* are configured.
export const SEED_VEHICLES: Vehicle[] = siteConfig.carCatalog;
