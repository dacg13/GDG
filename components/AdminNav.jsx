"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Users, Filter, LogOut, ArrowLeft, Shield } from "lucide-react";

/**
 * Concourse Admin Navigation Left Rail per designing.md Section 5.5.
 * Features:
 * - Slim rail: 72px collapsed / 220px expanded on hover
 * - color-bg-admin (#F5F4EF) fill with hairline border
 * - Simple line icons per item
 * - Applicants, Filters/Saved Views, Sign out
 */
export default function AdminNav({ onSelectTab, activeTab = "applicants" }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 bottom-0 z-30 bg-[var(--color-bg-admin)] border-r border-[var(--color-border)] transition-all duration-200 flex flex-col justify-between py-6 ${
        isHovered ? "w-56 shadow-lg" : "w-16"
      }`}
    >
      {/* Top: Tower Emblem */}
      <div>
        <div className="px-4 mb-8 flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-[var(--radius-sharp)] bg-[var(--color-primary)] text-white flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          {isHovered && (
            <div className="flex flex-col truncate">
              <span className="font-display text-sm font-bold text-[var(--color-ink)] truncate">
                CONTROL TOWER
              </span>
              <span className="font-mono text-[10px] text-[var(--color-ink-muted)] truncate">
                GDG RECRUITMENT
              </span>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="space-y-1 px-2">
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab("applicants")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sharp)] text-xs font-medium font-body transition-colors ${
              activeTab === "applicants"
                ? "bg-[var(--color-surface)] text-[var(--color-primary)] font-semibold border border-[var(--color-border)]"
                : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)]/60 hover:text-[var(--color-ink)]"
            }`}
            title="All Applicants"
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            {isHovered && <span className="truncate">Applicants</span>}
          </button>

          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sharp)] text-xs font-medium font-body text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)]/60 hover:text-[var(--color-ink)] transition-colors"
            title="Candidate Terminal"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            {isHovered && <span className="truncate">Return to Terminal</span>}
          </Link>
        </nav>
      </div>

      {/* Bottom: Sign Out */}
      <div className="px-2 pt-4 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => router.push("/auth/signout")}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-body text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-[var(--radius-sharp)] transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {isHovered && <span className="truncate">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
