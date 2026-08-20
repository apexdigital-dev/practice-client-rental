import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  passcodeConfigured,
  verifyPasscode,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!passcodeConfigured()) {
    return NextResponse.json(
      { error: "Admin passcode not configured — set ADMIN_PASSCODE and re-publish" },
      { status: 503 },
    );
  }

  let passcode = "";
  try {
    const body: unknown = await request.json();
    passcode =
      typeof (body as { passcode?: unknown }).passcode === "string"
        ? ((body as { passcode: string }).passcode)
        : "";
  } catch {
    // malformed body -> treated as an empty passcode (fails below)
  }

  if (!verifyPasscode(passcode)) {
    return NextResponse.json({ error: "Wrong passcode. Try again." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    // Not Secure-flagged so the demo works over http (localhost) and https
    // (published URL) alike; the cookie carries no sensitive data beyond a
    // signed, expiring session marker.
  });
  return res;
}
