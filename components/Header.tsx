import { CarFront, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <a
          href="/"
          className="flex min-w-0 items-center gap-2.5"
          aria-label={`${siteConfig.companyName} home`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400">
            <CarFront className="h-5 w-5" />
          </span>
          <span className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
            {siteConfig.companyName}
          </span>
        </a>
        <a
          href={siteConfig.telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#229ED9] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#1d8cc2]"
        >
          <MessageCircle className="h-4 w-4" />
          💬 Chat on Telegram
        </a>
      </div>
    </header>
  );
}
