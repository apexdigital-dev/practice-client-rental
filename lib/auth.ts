// Server-only admin auth: passcode check + expiring HMAC-signed session cookie.
//
// NEVER import this module from a client component or a "use client" file —
// it reads process.env.ADMIN_PASSCODE at request time and must never end up
// in a client bundle. Only route handlers and server components import it.
//
// Session token format: "<base64url payload>.<base64url HMAC-SHA256 signature>"
// where the payload is { exp: <unix seconds> }. The HMAC key is derived from
// the passcode itself, so sessions stay valid until ADMIN_PASSCODE changes.

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "apex_admin_session";
/** Session lifetime: 7 days. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/** True when ADMIN_PASSCODE is set in the environment (non-empty after trim). */
export function passcodeConfigured(): boolean {
  const p = process.env.ADMIN_PASSCODE;
  return typeof p === "string" && p.trim().length > 0;
}

/** Constant-time passcode comparison (both sides sha256-hashed first). */
export function verifyPasscode(input: string): boolean {
  if (!passcodeConfigured()) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(process.env.ADMIN_PASSCODE!.trim()).digest();
  return timingSafeEqual(a, b);
}

function hmacKey(): Buffer {
  return createHash("sha256").update(process.env.ADMIN_PASSCODE!.trim()).digest();
}

function sign(payload: string): string {
  return createHmac("sha256", hmacKey()).update(payload).digest("base64url");
}

/** Issue a fresh, expiring session token. */
export function createSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** Verify a session token: valid signature AND not expired. */
export function verifySessionToken(token: string): boolean {
  try {
    const dot = token.indexOf(".");
    if (dot <= 0) return false;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = Buffer.from(sign(payload));
    const actual = Buffer.from(sig);
    if (actual.length !== expected.length) return false;
    if (!timingSafeEqual(actual, expected)) return false;
    const data: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const exp = (data as { exp?: unknown }).exp;
    return typeof exp === "number" && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
