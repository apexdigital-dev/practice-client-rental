import { Lock } from "lucide-react";
import { siteConfig } from "@/config/siteConfig";
import { passcodeConfigured } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

// Read ADMIN_PASSCODE at request time so the "not configured" state is live.
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  const configured = passcodeConfigured();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-400">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-bold text-white">{siteConfig.companyName} — Admin</h1>
          <p className="text-sm text-zinc-400">Sign in to manage your fleet</p>
        </div>

        {configured ? (
          <LoginForm />
        ) : (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-center text-sm font-medium text-red-300">
            Admin passcode not configured — set ADMIN_PASSCODE and re-publish
          </div>
        )}

        <p className="mt-6 text-center text-xs text-zinc-600">
          <a href="/" className="transition hover:text-zinc-300">
            ← Back to the public site
          </a>
        </p>
      </div>
    </div>
  );
}
