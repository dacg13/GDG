"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

const baseAuthClient = createAuthClient({
  plugins: [adminClient()],
});

export const authClient = {
  ...baseAuthClient,
  signIn: baseAuthClient.signIn,
  signUp: baseAuthClient.signUp,
  useSession: baseAuthClient.useSession,
  signOut: async () => {
    try {
      await baseAuthClient.signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    }
  },
};