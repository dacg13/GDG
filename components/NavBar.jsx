"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useSubmissions } from "@/components/SubmissionsProvider";
import { Ticket, ChevronDown, User, Shield, LogOut, Compass } from "lucide-react";
import StatusBadge from "./ui/StatusBadge";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const { submittedDepartments } = useSubmissions();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [terminalTime, setTerminalTime] = useState("");
  const dropdownRef = useRef(null);

  const user = session?.user;
  const isAdmin = user?.role === "admin";
  const hasSubmissions = submittedDepartments && submittedDepartments.length > 0;

  // Live terminal clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTerminalTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    router.push("/auth/signout");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-[var(--color-border)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Concourse Wordmark + Terminal Clock */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--color-primary)] hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] rounded"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] inline-block" />
            <span className="font-display text-lg font-semibold tracking-tight text-[var(--color-ink)]">
              CONCOURSE
            </span>
            <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-widest text-[var(--color-ink-muted)]">
              / GDG PORTAL
            </span>
          </Link>

          {terminalTime && (
            <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-[var(--color-border)] font-mono text-xs text-[var(--color-ink-muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
              <span>TERMINAL {terminalTime}</span>
            </div>
          )}
        </div>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-body font-medium">
          <Link
            href="/departments"
            className={`transition-colors hover:text-[var(--color-primary)] ${
              pathname === "/departments"
                ? "text-[var(--color-primary)] font-semibold border-b-2 border-[var(--color-accent)] pb-0.5"
                : "text-[var(--color-ink-muted)]"
            }`}
          >
            Destinations
          </Link>

          {user && (
            <Link
              href="/status"
              className={`transition-colors hover:text-[var(--color-primary)] ${
                pathname === "/status"
                  ? "text-[var(--color-primary)] font-semibold border-b-2 border-[var(--color-accent)] pb-0.5"
                  : "text-[var(--color-ink-muted)]"
              }`}
            >
              Departure Board
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="text-xs font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-[var(--radius-sharp)] bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Control Tower
            </Link>
          )}
        </nav>

        {/* Right: Boarding-Pass Chip / Authentication State */}
        <div className="flex items-center gap-3">
          {isPending ? (
            <div className="w-24 h-9 bg-[var(--color-border)]/50 rounded-[var(--radius-button)] animate-pulse" />
          ) : !user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center h-[38px] px-4 rounded-[var(--radius-button)] font-body text-xs font-semibold uppercase tracking-[0.02em] text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
              >
                Check In / Sign In
              </Link>
            </div>
          ) : (
            /* Boarding-Pass Chip Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                aria-label="User account and boarding status"
                className="flex items-center gap-2.5 h-[40px] px-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sharp)] hover:border-[var(--color-primary)] transition-all select-none focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                <div className="flex flex-col text-left">
                  <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--color-ink)] leading-tight">
                    {user.name?.split(" ")[0] || "BOARDING PASS"}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--color-ink-muted)] leading-tight">
                    {hasSubmissions
                      ? `${submittedDepartments.length} BOARDED`
                      : "CHECKED IN"}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[var(--color-ink-muted)] transition-transform duration-150 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sharp)] shadow-[var(--shadow-float)] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-[var(--color-border)]">
                    <p className="font-body text-xs font-semibold text-[var(--color-ink)] truncate">
                      {user.name || "Candidate"}
                    </p>
                    <p className="font-mono text-[11px] text-[var(--color-ink-muted)] truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-bg)] transition-colors"
                    >
                      <Compass className="w-4 h-4 text-[var(--color-ink-muted)]" />
                      <span>Terminal Home</span>
                    </Link>

                    <Link
                      href="/departments"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-bg)] transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-[var(--color-ink-muted)]" />
                      <span>Destination Tracks</span>
                    </Link>

                    <Link
                      href="/status"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-bg)] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-[var(--color-ink-muted)]" />
                        <span>My Departure Board</span>
                      </div>
                      {hasSubmissions && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-success)]/15 text-[var(--color-success)] font-semibold">
                          {submittedDepartments.length}
                        </span>
                      )}
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--color-primary)] font-medium hover:bg-[var(--color-bg)] transition-colors"
                      >
                        <Shield className="w-4 h-4 text-[var(--color-primary)]" />
                        <span>Control Tower</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-[var(--color-border)] pt-1">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
