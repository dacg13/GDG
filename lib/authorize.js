import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Verifies the caller has an authenticated session with the "admin" role.
// Returns { session, status: "ok" } on success, or
// { session: null, status: "unauthenticated" | "forbidden" } on failure.
// Deliberately does NOT format an HTTP response — each call site keeps its
// own existing response shape/messages.
export async function getAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { session: null, status: "unauthenticated" };
  if (session.user.role !== "admin") return { session: null, status: "forbidden" };
  return { session, status: "ok" };
}
