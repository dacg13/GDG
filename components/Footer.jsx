"use client";

import React from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[var(--color-bg)] border-t border-[var(--color-border)] py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[var(--color-border)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] inline-block" />
              <span className="font-display text-base font-semibold text-[var(--color-ink)]">
                CONCOURSE · GDG
              </span>
            </div>
            <p className="font-body text-xs text-[var(--color-ink-muted)]">
              Developer Student Club Recruitment &amp; Boarding Portal
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-6 font-body text-xs text-[var(--color-ink-muted)]">
            <Link
              href="/"
              className="hover:text-[var(--color-primary)] transition-colors"
            >
              Terminal Home
            </Link>
            <Link
              href="/departments"
              className="hover:text-[var(--color-primary)] transition-colors"
            >
              Destinations
            </Link>
            <Link
              href="/status"
              className="hover:text-[var(--color-primary)] transition-colors"
            >
              Departure Board
            </Link>
            <Link
              href="/auth/signin"
              className="hover:text-[var(--color-primary)] transition-colors"
            >
              Check-In
            </Link>
          </nav>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs text-[var(--color-ink-muted)]">
          <div>
            &copy; {currentYear} GDG Recruitment Portal. Crafted with purpose &amp; precision.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>SYSTEM STATUS: OPERATIONAL</span>
            <span>·</span>
            <span>ALL GATES ACTIVE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
