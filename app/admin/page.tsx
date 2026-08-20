import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { AdminDashboard } from "./AdminDashboard";

// Server-side gate: no valid session cookie -> straight to /admin/login.
// This runs on every request, so the route can never render without a session.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token || !verifySessionToken(token)) {
    redirect("/admin/login");
  }
  return <AdminDashboard />;
}
