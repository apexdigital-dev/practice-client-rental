"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CarFront,
  Check,
  ChevronDown,
  ExternalLink,
  LogOut,
  Plus,
} from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import {
  CATEGORIES,
  SEED_VEHICLES,
  availabilityLabel,
  formatEtb,
  type Category,
  type Transmission,
  type Vehicle,
} from "@/lib/vehicles";
import {
  fetchVehiclesFromSupabase,
  insertVehicleToSupabase,
  supabaseConfigured,
  upsertVehicleToSupabase,
} from "@/lib/supabase";
import {
  addVehicleLocal,
  mergeLocalOverrides,
  saveOverride,
} from "@/lib/local-store";

const selectClass =
  "w-full appearance-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-base text-white outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20";
const inputClass =
  "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-base text-white placeholder-zinc-600 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20";

/** One-tap inline price editor: shows the formatted rate, tap to edit, save on blur/Enter. */
function PriceEditor({
  vehicle,
  onCommit,
  saved,
}: {
  vehicle: Vehicle;
  onCommit: (id: string, priceEtb: number) => void;
  saved: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(vehicle.priceEtb));

  // Keep the draft in sync if the vehicle changes underneath (e.g. revert).
  useEffect(() => {
    setValue(String(vehicle.priceEtb));
  }, [vehicle.priceEtb]);

  function commit() {
    setEditing(false);
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return;
    if (Math.round(n) !== vehicle.priceEtb) onCommit(vehicle.id, Math.round(n));
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Edit daily rate for ${vehicle.title}`}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base font-extrabold text-amber-400 transition hover:border-amber-400/50 active:scale-95"
        >
          {formatEtb(vehicle.priceEtb)}
        </button>
        {saved && <SavedPill />}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setValue(String(vehicle.priceEtb));
            setEditing(false);
          }
        }}
        aria-label={`Daily rate for ${vehicle.title} in ETB`}
        className="w-28 rounded-lg border border-amber-400/50 bg-zinc-950 px-3 py-2 text-base font-extrabold text-amber-400 outline-none focus:ring-2 focus:ring-amber-400/20"
      />
      <span className="text-xs text-zinc-500">ETB / day</span>
    </div>
  );
}

function SavedPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-semibold text-emerald-400">
      <Check className="h-3.5 w-3.5" /> Saved
    </span>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "SUVs & 4WD" as Category,
    price: "",
    imageUrl: "",
    transmission: "Auto" as Transmission,
    fuel: "",
    seats: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formBusy, setFormBusy] = useState(false);

  // Load the fleet once: Supabase when configured, otherwise seed + local edits.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let base: Vehicle[] = SEED_VEHICLES;
      if (supabaseConfigured) {
        const remote = await fetchVehiclesFromSupabase();
        if (remote && remote.length > 0) base = remote;
      }
      if (!cancelled) {
        setVehicles(supabaseConfigured ? base : mergeLocalOverrides(base));
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function flashSaved(id: string) {
    setSavedId(id);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSavedId(null), 1600);
  }

  /** Persist one vehicle: Supabase when connected, localStorage otherwise. */
  async function persist(updated: Vehicle, isNew: boolean): Promise<boolean> {
    if (supabaseConfigured) {
      return isNew
        ? insertVehicleToSupabase(updated)
        : upsertVehicleToSupabase(updated);
    }
    if (isNew) addVehicleLocal(updated);
    else saveOverride(updated.id, updated);
    return true;
  }

  function commitPrice(id: string, priceEtb: number) {
    const prev = vehicles.find((v) => v.id === id);
    if (!prev) return;
    setVehicles((vs) => vs.map((v) => (v.id === id ? { ...v, priceEtb } : v)));
    void persist({ ...prev, priceEtb }, false).then((ok) => {
      if (ok) flashSaved(id);
      else setVehicles((vs) => vs.map((v) => (v.id === id ? { ...v, priceEtb: prev.priceEtb } : v)));
    });
  }

  function toggleAvailable(id: string) {
    const prev = vehicles.find((v) => v.id === id);
    if (!prev) return;
    const next = { ...prev, available: !prev.available };
    setVehicles((vs) => vs.map((v) => (v.id === id ? next : v)));
    void persist(next, false).then((ok) => {
      if (ok) flashSaved(id);
      else setVehicles((vs) => vs.map((v) => (v.id === id ? { ...v, available: prev.available } : v)));
    });
  }

  async function onAddVehicle(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const title = form.title.trim();
    const imageUrl = form.imageUrl.trim();
    const fuel = form.fuel.trim();
    const price = Number(form.price);
    const seats = Number(form.seats);

    if (!title) return setFormError("Title is required.");
    if (!imageUrl) return setFormError("Image URL is required.");
    if (!/^https?:\/\//i.test(imageUrl))
      return setFormError("Image URL must start with http(s)://");
    if (!Number.isFinite(price) || price < 0)
      return setFormError("Price must be 0 or a positive number.");
    if (!Number.isFinite(seats) || seats < 1 || !Number.isInteger(seats))
      return setFormError("Seats must be a whole number of at least 1.");
    if (!fuel) return setFormError("Fuel is required.");

    const vehicle: Vehicle = {
      id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      category: form.category,
      imageUrl,
      transmission: form.transmission,
      fuel,
      seats,
      priceEtb: Math.round(price),
      available: true,
    };

    setFormBusy(true);
    const ok = await persist(vehicle, true);
    setFormBusy(false);
    if (!ok) {
      setFormError("Could not save — check your connection and try again.");
      return;
    }
    setVehicles((vs) => [...vs, vehicle]);
    flashSaved(vehicle.id);
    setForm({
      title: "",
      category: "SUVs & 4WD",
      price: "",
      imageUrl: "",
      transmission: "Auto",
      fuel: "",
      seats: "",
    });
    setShowAdd(false);
  }

  async function logout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // cookie may still clear client-side on the next navigation attempt
    }
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Admin header: agency name + View site + logout */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400">
              <CarFront className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{siteConfig.companyName}</p>
              <p className="text-[11px] text-zinc-500">Admin dashboard</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View site
            </a>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-red-500/50 hover:text-red-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        {!supabaseConfigured && (
          <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Device-only mode — changes are saved on this browser. Connect
            Supabase for live sync.
          </div>
        )}

        {/* Add-vehicle toggle */}
        <button
          type="button"
          onClick={() => setShowAdd((s) => !s)}
          aria-expanded={showAdd}
          className="mb-4 inline-flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-sm font-bold text-white transition hover:border-zinc-700 sm:w-auto sm:min-w-64"
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4 text-amber-400" />
            Add vehicle
          </span>
          <ChevronDown
            className={`h-4 w-4 text-zinc-500 transition-transform ${showAdd ? "rotate-180" : ""}`}
          />
        </button>

        {showAdd && (
          <form
            onSubmit={onAddVehicle}
            className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <label htmlFor="add-title" className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Title *
              </label>
              <input
                id="add-title"
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Toyota Fortuner"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="add-category" className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Category *
              </label>
              <select
                id="add-category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className={selectClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="add-price" className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Price (ETB / day) *
              </label>
              <input
                id="add-price"
                type="number"
                min={0}
                inputMode="numeric"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="e.g. 8000"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="add-image" className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Image URL *
              </label>
              <input
                id="add-image"
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://…"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="add-transmission" className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Transmission *
              </label>
              <select
                id="add-transmission"
                value={form.transmission}
                onChange={(e) =>
                  setForm({ ...form, transmission: e.target.value as Transmission })
                }
                className={selectClass}
              >
                <option value="Auto">Auto</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            <div>
              <label htmlFor="add-seats" className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Seats *
              </label>
              <input
                id="add-seats"
                type="number"
                min={1}
                inputMode="numeric"
                value={form.seats}
                onChange={(e) => setForm({ ...form, seats: e.target.value })}
                placeholder="e.g. 5"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="add-fuel" className="mb-1.5 block text-xs font-semibold text-zinc-400">
                Fuel *
              </label>
              <input
                id="add-fuel"
                type="text"
                value={form.fuel}
                onChange={(e) => setForm({ ...form, fuel: e.target.value })}
                placeholder="e.g. Petrol"
                className={inputClass}
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={formBusy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3.5 text-base font-bold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
                {formBusy ? "Saving…" : "Add vehicle"}
              </button>
            </div>

            {formError && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 sm:col-span-2">
                {formError}
              </p>
            )}
          </form>
        )}

        {/* Fleet list */}
        {!loaded ? (
          <p className="py-10 text-center text-sm text-zinc-500">Loading fleet…</p>
        ) : vehicles.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-500">
            No vehicles yet — add your first one above.
          </p>
        ) : (
          <ul className="space-y-3">
            {vehicles.map((v) => (
              <li
                key={v.id}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3.5 sm:flex-row sm:items-center"
              >
                <img
                  src={v.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-16 w-full shrink-0 rounded-xl object-cover sm:h-14 sm:w-20"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="truncate text-base font-bold text-white">{v.title}</h2>
                    <span className="shrink-0 rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300">
                      {v.category}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {v.transmission} · {v.fuel} · {v.seats} seats
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <PriceEditor
                      vehicle={v}
                      onCommit={commitPrice}
                      saved={savedId === v.id}
                    />
                    <button
                      type="button"
                      role="switch"
                      aria-checked={v.available}
                      aria-label={`${v.available ? "Mark" : "Set"} ${v.title} ${v.available ? "booked" : "available"}`}
                      onClick={() => toggleAvailable(v.id)}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                        v.available ? "bg-emerald-500" : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                          v.available ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                    <span className="text-xs font-semibold">
                      {availabilityLabel(v)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-center text-xs text-zinc-600">
          {vehicles.length} vehicle{vehicles.length === 1 ? "" : "s"} ·{" "}
          {supabaseConfigured
            ? "Syncing with Supabase"
            : "Saved on this browser only"}
        </p>
      </main>
    </div>
  );
}
