"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { useState, useEffect } from "react";

const baseAuthClient = createAuthClient({
  plugins: [adminClient()],
});

export const authClient = {
  ...baseAuthClient,
  signIn: baseAuthClient.signIn,
  signUp: baseAuthClient.signUp,
  useSession: () => {
    const realSession = baseAuthClient.useSession();
    const [localSession, setLocalSession] = useState(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      const checkLocal = () => {
        try {
          const stored = localStorage.getItem("dev_test_session");
          if (stored) {
            setLocalSession(JSON.parse(stored));
          } else {
            setLocalSession(null);
          }
        } catch (e) {
          setLocalSession(null);
        } finally {
          setIsChecking(false);
        }
      };

      checkLocal();
      window.addEventListener("storage", checkLocal);
      window.addEventListener("dev_auth_change", checkLocal);
      return () => {
        window.removeEventListener("storage", checkLocal);
        window.removeEventListener("dev_auth_change", checkLocal);
      };
    }, []);

    // If real backend session exists, prioritize it
    if (realSession.data?.user) {
      return realSession;
    }

    // Otherwise, if mock dev test session is active, provide it
    if (localSession) {
      return {
        data: localSession,
        isPending: false,
        error: null,
      };
    }

    return {
      data: realSession.data,
      isPending: realSession.isPending && isChecking,
      error: realSession.error,
    };
  },
  signOut: async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("dev_test_session");
        window.dispatchEvent(new Event("dev_auth_change"));
      }
      await baseAuthClient.signOut().catch(() => {});
    } catch (e) {
      console.error("Sign out error:", e);
    }
  },
};