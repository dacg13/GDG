import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Verifies the caller is authenticated and the given email query param
 * belongs to them. Does not format an HTTP response — callers keep their
 * own existing response shape/messages.
 * @param {Request} req
 * @returns {Promise<{
 *   status: "ok" | "unauthenticated" | "missing-email" | "forbidden",
 *   email: string | null,
 * }>}
 */
export async function verifyOwnEmailAccess(req) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { status: "unauthenticated", email: null };

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return { status: "missing-email", email: null };

  if (email !== session.user.email) return { status: "forbidden", email };

  return { status: "ok", email };
}
