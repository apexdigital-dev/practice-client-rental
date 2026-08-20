"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || passcode.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (res.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }
      const data: unknown = await res.json().catch(() => null);
      setError(
        (data && typeof data === "object" && "error" in data
          ? String((data as { error: unknown }).error)
          : null) ?? "Login failed — try again.",
      );
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/40"
    >
      <label
        htmlFor="passcode"
        className="mb-1.5 block text-sm font-medium text-zinc-300"
      >
        Passcode
      </label>
      <input
        id="passcode"
        type="password"
        autoComplete="current-password"
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
        placeholder="Enter admin passcode"
        autoFocus
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-base text-white placeholder-zinc-600 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
      />

      {error && (
        <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || passcode.length === 0}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3.5 text-base font-bold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LogIn className="h-5 w-5" />
        {busy ? "Signing in…" : "Sign in to Admin"}
      </button>
    </form>
  );
}
