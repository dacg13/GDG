import { connect } from "@/lib/db";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Fixed-window rate limiter backed by Firestore. Approximate under heavy
 * concurrency by design — this is a soft throttle, not a hard invariant.
 * @param {{ key: string, limit: number, windowSeconds: number }} options
 * @returns {Promise<{allowed: boolean, retryAfterSeconds: number}>}
 */
export async function checkRateLimit({ key, limit, windowSeconds }) {
  const db = await connect();
  const nowSeconds = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(nowSeconds / windowSeconds) * windowSeconds;
  const docId = `${key}:${windowStart}`;
  const ref = db.collection("rateLimits").doc(docId);

  const snap = await ref.get();
  const currentCount = snap.exists ? (snap.data().count || 0) : 0;

  if (currentCount >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: windowStart + windowSeconds - nowSeconds,
    };
  }

  await ref.set(
    { count: FieldValue.increment(1), windowStart },
    { merge: true }
  );

  return { allowed: true, retryAfterSeconds: 0 };
}
