"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import DataTable from "./DataTable";
import AdminNav from "./AdminNav";

export default function AdminContent({ applicants }) {
  const { data: session, isPending } = authClient.useSession();
  const [activeTab, setActiveTab] = useState("applicants");

  const user = session?.user;
  const isAdmin = user?.role === "admin";

  if (isPending) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-admin)] flex items-center justify-center p-8">
        <div className="font-mono text-sm text-[var(--color-ink-muted)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
          <span>AUTHENTICATING CONTROL TOWER SESSION...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-admin)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sharp)] p-8 text-center shadow-sm">
          <h2 className="font-display text-2xl font-bold text-[var(--color-ink)] mb-2">
            Authentication Required
          </h2>
          <p className="font-body text-sm text-[var(--color-ink-muted)] mb-6">
            Please check in with an authorized administrator pass to access the control tower.
          </p>
          <a
            href="/auth/signin"
            className="inline-flex items-center justify-center h-11 px-6 rounded-[var(--radius-button)] bg-[var(--color-primary)] text-white font-body text-sm uppercase tracking-wider font-semibold"
          >
            Go to Check-In
          </a>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-admin)] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sharp)] p-8 text-center shadow-sm">
          <h2 className="font-display text-2xl font-bold text-[var(--color-error)] mb-2">
            Access Restricted
          </h2>
          <p className="font-body text-sm text-[var(--color-ink-muted)] mb-6">
            You do not possess the required administrator credentials to enter the control tower.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center h-11 px-6 rounded-[var(--radius-button)] border border-[var(--color-border)] font-body text-sm text-[var(--color-ink)]"
          >
            Return to Terminal
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-admin)] flex">
      {/* Dedicated Left-Rail Navigation */}
      <AdminNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Control Tower Main Grid */}
      <main className="flex-1 pl-16 md:pl-20 min-w-0 py-8 px-4 sm:px-6 lg:px-8">
        <DataTable data={applicants || []} />
      </main>
    </div>
  );
}
