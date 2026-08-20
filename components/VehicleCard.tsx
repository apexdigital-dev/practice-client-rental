import { Fuel, MessageCircle, Settings2, Users } from "lucide-react";
import {
  availabilityLabel,
  formatEtb,
  telegramBookingUrl,
  type Vehicle,
} from "@/lib/vehicles";

export function VehicleCard({
  vehicle,
  telegramHandle,
}: {
  vehicle: Vehicle;
  telegramHandle: string;
}) {
  const available = vehicle.available;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 transition hover:border-zinc-700 hover:shadow-lg hover:shadow-black/40">
      {/* Photo + color-coded status badge */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={vehicle.imageUrl}
          alt={vehicle.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow ${
            available ? "bg-emerald-500 text-emerald-950" : "bg-red-500 text-white"
          }`}
        >
          {availabilityLabel(vehicle)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-snug text-white">{vehicle.title}</h3>
          <span className="shrink-0 rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-zinc-300">
            {vehicle.category}
          </span>
        </div>

        {/* Spec icons: transmission, fuel, seats */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <Settings2 className="h-3.5 w-3.5 text-zinc-500" />
            {vehicle.transmission}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Fuel className="h-3.5 w-3.5 text-zinc-500" />
            {vehicle.fuel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-zinc-500" />
            {vehicle.seats} seats
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <p className="text-lg font-extrabold text-amber-400">{formatEtb(vehicle.priceEtb)}</p>
          <a
            href={telegramBookingUrl(telegramHandle, vehicle)}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-white transition ${
              available ? "bg-[#229ED9] hover:bg-[#1d8cc2]" : "bg-zinc-700 hover:bg-zinc-600"
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            💬 Book via Telegram
          </a>
        </div>
      </div>
    </article>
  );
}
