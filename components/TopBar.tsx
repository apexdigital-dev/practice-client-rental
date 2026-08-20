import { Clock, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";

export function TopBar() {
  return (
    <div className="border-b border-zinc-800/60 bg-zinc-900/70 text-zinc-300">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-1.5 text-[11px] sm:text-xs lg:justify-between">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-amber-400" aria-hidden />
          {siteConfig.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-amber-400" aria-hidden />
          {siteConfig.workingHours}
        </span>
        <a
          href={siteConfig.phoneHref}
          className="inline-flex items-center gap-1.5 transition hover:text-amber-400"
        >
          <Phone className="h-3.5 w-3.5 text-amber-400" aria-hidden />
          {siteConfig.phone}
        </a>
      </div>
    </div>
  );
}
