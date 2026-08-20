"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { CATEGORIES, type Category, type Vehicle } from "@/lib/vehicles";
import { supabaseConfigured } from "@/lib/supabase";
import { mergeLocalOverrides } from "@/lib/local-store";
import { siteConfig } from "@/config/siteConfig";
import { VehicleCard } from "./VehicleCard";

const ALL = "All" as const;
type Filter = Category | typeof ALL;
const FILTERS: Filter[] = [ALL, ...CATEGORIES];

export function VehicleCatalog({
  vehicles = siteConfig.carCatalog,
  telegramHandle,
}: {
  vehicles?: Vehicle[];
  telegramHandle: string;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>(ALL);

  // When Supabase is absent, layer the owner's admin edits (localStorage
  // overrides) on top of the server-rendered catalog. Applied after mount so
  // the first client render matches SSR — no hydration mismatch.
  const [localVehicles, setLocalVehicles] = useState<Vehicle[] | null>(null);
  useEffect(() => {
    if (supabaseConfigured) return;
    setLocalVehicles(mergeLocalOverrides(vehicles));
  }, [vehicles]);

  const effectiveVehicles = localVehicles ?? vehicles;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return effectiveVehicles.filter((v) => {
      if (filter !== ALL && v.category !== filter) return false;
      if (q && !v.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [effectiveVehicles, query, filter]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      {/* Quick search (filters by title) */}
      <div className="relative mx-auto max-w-xl">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cars… e.g. Land Cruiser"
          aria-label="Search cars"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-9 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category tabs: All | SUVs & 4WD | Sedans & Economy | Luxury & Wedding */}
      <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
        {FILTERS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === c
                ? "bg-amber-400 text-zinc-950"
                : "border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-zinc-500">
        {filtered.length} of {effectiveVehicles.length} vehicles
      </p>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-zinc-500">
          No vehicles match your search.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <VehicleCard key={v.id} vehicle={v} telegramHandle={telegramHandle} />
          ))}
        </div>
      )}
    </section>
  );
}
