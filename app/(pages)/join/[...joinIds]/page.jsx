"use client";

import React, { useState, useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import { reviews } from "@/constants/index";
import NavBar from "@/components/NavBar";
import FormComp from "@/components/FormComp";
import Footer from "@/components/Footer";
import TicketStub from "@/components/ui/TicketStub";
import Button from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function JoinDepartmentPage({ params }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const isSignedIn = !!user;

  if (isPending) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
        <NavBar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="font-mono text-sm text-[var(--color-ink-muted)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
            <span>PREPARING BOARDING TERMINAL...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const joinIds = params?.joinIds || [];
  const valid = joinIds.every(
    (id) => reviews.some((dept) => dept.id === id) || id.startsWith("clerk_")
  );

  if (!valid || joinIds.length === 0) {
    notFound();
  }

  // Preserve the exact selection order: index 0 is primary, index 1 is secondary
  const departments = joinIds
    .map((id) => reviews.find((dept) => dept.id === id))
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <NavBar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isSignedIn ? (
          <FormComp
            dept1={departments[0]}
            dept2={departments[1]}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        ) : (
          <div className="max-w-md mx-auto my-12">
            <TicketStub
              stub={
                <div className="font-mono text-xs text-[var(--color-ink-muted)] space-y-2">
                  <div>GATE STATUS: LOCKED</div>
                  <div>PASS: REQUIRED</div>
                </div>
              }
            >
              <div className="w-10 h-10 rounded-[var(--radius-sharp)] border border-[var(--color-border)] flex items-center justify-center mb-4 text-[var(--color-primary)]">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-[var(--color-ink)] mb-2">
                Candidate Check-In Required
              </h2>
              <p className="font-body text-sm text-[var(--color-ink-muted)] mb-6 leading-relaxed">
                You must possess an active candidate boarding pass to access department application
                questions.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  variant="primary"
                  onClick={() => router.push("/auth/signin")}
                  className="w-full"
                >
                  Proceed to Check-In
                </Button>
                <Link href="/departments" className="text-center">
                  <Button variant="ghost" size="sm" className="w-full">
                    Select Different Tracks
                  </Button>
                </Link>
              </div>
            </TicketStub>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
