"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { reviews } from "@/constants";
import DestinationCard from "@/components/ui/DestinationCard";
import Button from "@/components/ui/button";
import { ArrowRight, Plane, Sparkles, Compass, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activeDepartmentIndex, setActiveDepartmentIndex] = useState(0);

  // Departments list from project constants
  const departments = reviews || [];

  useEffect(() => {
    setHasLoaded(true);
    // Cycle the highlighted department in the board strip every few seconds
    const interval = setInterval(() => {
      setActiveDepartmentIndex((prev) => (prev + 1) % Math.max(1, departments.length));
    }, 4000);
    return () => clearInterval(interval);
  }, [departments.length]);

  return (
    <div className="w-full">
      {/* 1. Terminal Departures Hero Band (Full-Bleed Primary Navy) */}
      <section className="relative w-full bg-[var(--color-primary)] text-[#FAF6EC] py-16 md:py-24 border-b border-[var(--color-border)] overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#FAF6EC_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            {/* Terminal Meta Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--radius-sharp)] bg-white/10 text-[var(--color-accent)] font-mono text-xs uppercase tracking-widest mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
              <span>TERMINAL DEPARTURES · RECRUITMENT 2026</span>
            </div>

            {/* Signature Fraunces Display Headline */}
            <h1 className="font-display text-display-xl tracking-tight text-[#FAF6EC] mb-6">
              Your next journey begins at the gate.
            </h1>

            <p className="font-body text-body-l text-[#FAF6EC]/80 max-w-2xl mb-8 leading-relaxed">
              Step into the concourse. Choose up to two destination tracks, board your
              application process, and build alongside fellow engineers, designers, and creators.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/departments">
                <Button variant="secondary" size="lg" className="gap-2">
                  <span>Explore Destination Tracks</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-[#FAF6EC] border border-white/20 hover:bg-white/10"
                >
                  Candidate Check-In
                </Button>
              </Link>
            </div>
          </div>

          {/* 2. Split-Flap Departure-Board Strip (Signature Element) */}
          <div className="mt-14 pt-8 border-t border-white/15">
            <div className="flex items-center justify-between mb-3 font-mono text-xs text-[#FAF6EC]/70 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                LIVE DEPARTURE SCHEDULE
              </span>
              <span className="hidden sm:inline">STATUS: ALL GATES OPEN</span>
            </div>

            {/* Departure Board Ribbon */}
            <div className="bg-[#0B1A2E] border border-white/15 rounded-[var(--radius-sharp)] p-3 md:p-4 overflow-x-auto">
              <div className="min-w-[650px] grid grid-cols-12 gap-3 items-center font-mono text-xs">
                <div className="col-span-2 text-[#FAF6EC]/60 uppercase">GATE</div>
                <div className="col-span-5 text-[#FAF6EC]/60 uppercase">DESTINATION TRACK</div>
                <div className="col-span-3 text-[#FAF6EC]/60 uppercase">STATUS</div>
                <div className="col-span-2 text-right text-[#FAF6EC]/60 uppercase">ACTION</div>

                {departments.slice(0, 4).map((dept, idx) => {
                  const isActive = idx === activeDepartmentIndex % 4;
                  return (
                    <React.Fragment key={dept.id || idx}>
                      <div className="col-span-2 text-[var(--color-accent)] font-semibold">
                        G-{String(idx + 1).padStart(2, "0")}
                      </div>
                      <div className="col-span-5 font-semibold text-[#FAF6EC] truncate">
                        <span
                          className={`inline-block ${
                            hasLoaded ? "animate-flip" : ""
                          }`}
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                          {dept.name}
                        </span>
                      </div>
                      <div className="col-span-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                        <span className="text-[var(--color-accent)] font-medium">
                          NOW BOARDING
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <Link
                          href="/departments"
                          className="text-[#FAF6EC]/80 hover:text-[var(--color-accent)] underline underline-offset-2"
                        >
                          Book &rarr;
                        </Link>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Destination Tracks Grid */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2">
              SELECT YOUR PATH
            </div>
            <h2 className="font-display text-h1 text-[var(--color-ink)]">
              Destination Tracks
            </h2>
          </div>
          <p className="font-body text-sm text-[var(--color-ink-muted)] max-w-md mt-2 md:mt-0">
            Apply to up to two departments. Each track provides hands-on mentorship,
            real-world project delivery, and community leadership.
          </p>
        </div>

        {/* 3-Column Destination Poster Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.slice(0, 6).map((dept, index) => (
            <DestinationCard
              key={dept.id || index}
              department={dept}
              index={index}
              onToggle={() => router.push("/departments")}
              showActions={true}
            />
          ))}
        </div>

        {departments.length > 6 && (
          <div className="mt-10 text-center">
            <Link href="/departments">
              <Button variant="secondary" size="lg" className="gap-2">
                <span>View All {departments.length} Destination Gates</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* 4. Concourse Process / Why Join Section */}
      <section className="bg-[var(--color-surface)] border-y border-[var(--color-border)] py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2">
              THE CONCOURSE JOURNEY
            </div>
            <h2 className="font-display text-h2 text-[var(--color-ink)] mb-4">
              How the recruitment process works.
            </h2>
            <p className="font-body text-body-l text-[var(--color-ink-muted)]">
              Every phase is structured to value your time, evaluate genuine problem-solving,
              and ensure complete transparency throughout your application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-[var(--color-border)] rounded-[var(--radius-sharp)] bg-[var(--color-bg)]">
              <div className="font-mono text-xs text-[var(--color-accent)] font-semibold mb-2">
                STEP 01 · CHECK-IN
              </div>
              <h3 className="font-display text-xl font-semibold text-[var(--color-ink)] mb-2">
                Choose Your Destinations
              </h3>
              <p className="font-body text-sm text-[var(--color-ink-muted)] leading-relaxed">
                Review available tracks and choose up to two departments based on your skills
                and technical interests.
              </p>
            </div>

            <div className="p-6 border border-[var(--color-border)] rounded-[var(--radius-sharp)] bg-[var(--color-bg)]">
              <div className="font-mono text-xs text-[var(--color-accent)] font-semibold mb-2">
                STEP 02 · BOARDING PASS
              </div>
              <h3 className="font-display text-xl font-semibold text-[var(--color-ink)] mb-2">
                Submit Your Answers
              </h3>
              <p className="font-body text-sm text-[var(--color-ink-muted)] leading-relaxed">
                Complete the boarding questions. Your answers save automatically locally so you
                never lose your progress.
              </p>
            </div>

            <div className="p-6 border border-[var(--color-border)] rounded-[var(--radius-sharp)] bg-[var(--color-bg)]">
              <div className="font-mono text-xs text-[var(--color-accent)] font-semibold mb-2">
                STEP 03 · DEPARTURE BOARD
              </div>
              <h3 className="font-display text-xl font-semibold text-[var(--color-ink)] mb-2">
                Track Live Status
              </h3>
              <p className="font-body text-sm text-[var(--color-ink-muted)] leading-relaxed">
                Receive your ceremonial stamped ticket and track updates directly from your
                personal departure board.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
