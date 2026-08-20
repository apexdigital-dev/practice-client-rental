// =============================================================================
// Central site configuration — THE single source of truth for all business
// details. To create a new client site, edit this one file: company name,
// location, hours, phone, Telegram handle, hero copy, and the default vehicle
// catalog. Everything else in the app reads from here.
//
// Vehicle domain types + formatting helpers live in lib/vehicles.ts (used by
// the admin dashboard and the catalog). siteConfig re-exports the ones that
// matter here so a client never needs to touch that file for business data.
// =============================================================================

import type { Vehicle } from "@/lib/vehicles";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

export const siteConfig = {
  // --- Agency ---------------------------------------------------------------
  companyName: "Addis Car Rentals",

  // --- Contact / location ---------------------------------------------------
  location: "Bole Medhanialem, Addis Ababa, Ethiopia",
  workingHours: "Mon – Sat: 8:00 AM – 8:00 PM",

  phone: "+251 91 123 4567",
  phoneHref: "tel:+251911234567",

  // --- Telegram -------------------------------------------------------------
  telegramUsername: "demo_rental_admin",
  telegramUrl: "https://t.me/demo_rental_admin",

  // --- Hero -----------------------------------------------------------------
  hero: {
    badge: "Live fleet · ETB daily rates",
    headline:
      "Rent Luxury & Economy Cars in Addis Ababa — Instant Telegram Booking",
    subheadline:
      "Browse the live fleet, pick your car, and book in one tap on Telegram — " +
      "no phone calls, no waiting.",
  },

  // --- Default catalog ------------------------------------------------------
  // The live site still preloads Supabase rows / stored admin edits on top of
  // this (see page.tsx + VehicleCatalog); this list is the fallback that ships
  // with the site and is what a client edits to seed their own fleet.
  carCatalog: [
    {
      id: "land-cruiser-prado",
      title: "Toyota Land Cruiser Prado",
      category: "SUVs & 4WD",
      imageUrl: img("photo-1533473359331-0135ef1b58bf"),
      transmission: "Auto",
      fuel: "Diesel",
      seats: 7,
      priceEtb: 15000,
      available: true,
    },
    {
      id: "toyota-rav4",
      title: "Toyota RAV4",
      category: "SUVs & 4WD",
      imageUrl: img("photo-1519641471654-76ce0107ad1b"),
      transmission: "Auto",
      fuel: "Petrol",
      seats: 5,
      priceEtb: 9500,
      available: false,
    },
    {
      id: "mitsubishi-pajero",
      title: "Mitsubishi Pajero",
      category: "SUVs & 4WD",
      imageUrl: img("photo-1568605117036-5fe5e7bab0b7"),
      transmission: "Auto",
      fuel: "Diesel",
      seats: 7,
      priceEtb: 12000,
      available: true,
    },
    {
      id: "toyota-hilux",
      title: "Toyota Hilux",
      category: "SUVs & 4WD",
      imageUrl: img("photo-1533106418989-88406c7cc8ca"),
      transmission: "Manual",
      fuel: "Diesel",
      seats: 5,
      priceEtb: 10500,
      available: true,
    },
    {
      id: "suzuki-jimny",
      title: "Suzuki Jimny",
      category: "SUVs & 4WD",
      imageUrl: img("photo-1567818735868-e71b99932e29"),
      transmission: "Manual",
      fuel: "Petrol",
      seats: 4,
      priceEtb: 6500,
      available: false,
    },
    {
      id: "toyota-corolla",
      title: "Toyota Corolla",
      category: "Sedans & Economy",
      imageUrl: img("photo-1623869675781-80aa31012a5a"),
      transmission: "Auto",
      fuel: "Petrol",
      seats: 5,
      priceEtb: 5500,
      available: true,
    },
    {
      id: "toyota-vitz",
      title: "Toyota Vitz",
      category: "Sedans & Economy",
      imageUrl: img("photo-1549317661-bd32c8ce0db2"),
      transmission: "Manual",
      fuel: "Petrol",
      seats: 4,
      priceEtb: 2500,
      available: true,
    },
    {
      id: "hyundai-accent",
      title: "Hyundai Accent",
      category: "Sedans & Economy",
      imageUrl: img("photo-1553440569-bcc63803a83d"),
      transmission: "Auto",
      fuel: "Petrol",
      seats: 5,
      priceEtb: 4000,
      available: false,
    },
    {
      id: "kia-picanto",
      title: "Kia Picanto",
      category: "Sedans & Economy",
      imageUrl: img("photo-1511919884226-fd3cad34687c"),
      transmission: "Manual",
      fuel: "Petrol",
      seats: 4,
      priceEtb: 2800,
      available: true,
    },
    {
      id: "mercedes-s-class",
      title: "Mercedes-Benz S-Class",
      category: "Luxury & Wedding",
      imageUrl: img("photo-1563720223185-11003d516935"),
      transmission: "Auto",
      fuel: "Petrol",
      seats: 5,
      priceEtb: 35000,
      available: true,
    },
    {
      id: "range-rover-vogue",
      title: "Range Rover Vogue",
      category: "Luxury & Wedding",
      imageUrl: img("photo-1617531653332-bd46c24f2068"),
      transmission: "Auto",
      fuel: "Petrol",
      seats: 5,
      priceEtb: 40000,
      available: false,
    },
    {
      id: "land-cruiser-v8",
      title: "Toyota Land Cruiser V8",
      category: "Luxury & Wedding",
      imageUrl: img("photo-1606016159991-dfe4f2746ad5"),
      transmission: "Auto",
      fuel: "Diesel",
      seats: 7,
      priceEtb: 30000,
      available: true,
    },
  ] as Vehicle[],
};

export type SiteConfig = typeof siteConfig;

// Convenience type re-exports so a client editing siteConfig (company, catalog)
// doesn't need to know where the domain types live. The CATEGORIES value itself
// stays in lib/vehicles.ts (imported from there by the catalog + admin) — a
// runtime re-export here would create an import cycle with lib/vehicles.ts.
export type { Category, Transmission, Vehicle } from "@/lib/vehicles";
