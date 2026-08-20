import { siteConfig } from "@/config/siteConfig";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-6xl text-center text-sm text-zinc-400">
        <p>
          © 2026 {siteConfig.companyName}. All Rights Reserved. Powered &amp;
          Maintained by Apex Digital ⚡
        </p>
      </div>
    </footer>
  );
}
