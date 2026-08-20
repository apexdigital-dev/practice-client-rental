import { Zap } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";

export function Hero() {
  const { badge, headline, subheadline } = siteConfig.hero;
  return (
    <section className="border-b border-zinc-800/80 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 px-4 pb-10 pt-12 sm:pt-16">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
          <Zap className="h-3.5 w-3.5" />
          {badge}
        </span>
        <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
          {headline}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-zinc-400 sm:text-base">
          {subheadline}
        </p>
      </div>
    </section>
  );
}
