"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import TicketStub from "@/components/ui/TicketStub";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { FaGoogle } from "react-icons/fa";
import { AlertCircle, ArrowLeft, Ticket } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (session?.user && !isPending) {
      router.push("/");
    }
  }, [session, isPending, router]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage("");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err) {
      console.error("Google sign-in error:", err);
      setErrorMessage("Google check-in failed. Please try again or use your credentials.");
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter both email address and password.");
      return;
    }

    if (mode === "signup" && !name) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        const res = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/",
        });
        if (res?.error) {
          setErrorMessage(res.error.message || "Failed to create candidate pass.");
        } else {
          router.push("/");
        }
      } else {
        const res = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });
        if (res?.error) {
          setErrorMessage(res.error.message || "Invalid credentials. Please verify your details.");
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setErrorMessage("Check-in validation failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
        <NavBar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="font-mono text-sm text-[var(--color-ink-muted)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
            <span>CONNECTING TO CHECK-IN TERMINAL...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <NavBar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Back link */}
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--color-ink-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Terminal</span>
            </Link>
          </div>

          {/* Ticket-Stub Auth Container */}
          <TicketStub
            className="shadow-[var(--shadow-float)]"
            stub={
              <div className="flex flex-col justify-between h-full text-center sm:text-left py-2">
                <div>
                  <div className="flex items-center gap-1.5 text-[var(--color-accent)] mb-2 font-mono text-[11px] font-semibold tracking-wider uppercase">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>CHECK-IN GATE</span>
                  </div>
                  <h3 className="font-display text-base font-semibold text-[var(--color-ink)]">
                    Candidate Pass
                  </h3>
                  <p className="font-body text-xs text-[var(--color-ink-muted)] mt-1 leading-relaxed">
                    Verify your identity to board your application or check your departure status.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--color-border)] font-mono text-[10px] text-[var(--color-ink-muted)] space-y-1">
                  <div>TERM · CNCS-2026</div>
                  <div>STATUS · CHECK-IN OPEN</div>
                </div>
              </div>
            }
          >
            {/* Header */}
            <div className="mb-6">
              <div className="font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-1">
                STEP 00 · IDENTIFICATION
              </div>
              <h2 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
                {mode === "signin" ? "Candidate Check-In" : "Create Candidate Pass"}
              </h2>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-5 p-3 rounded-[var(--radius-sharp)] border border-[var(--color-error)]/40 bg-[var(--color-error)]/10 text-[var(--color-error)] font-body text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Google OAuth Action (Dominant per designing.md Section 6) */}
            <div className="mb-6">
              <Button
                type="button"
                variant="primary"
                onClick={handleGoogleSignIn}
                isLoading={isGoogleLoading}
                className="w-full gap-2.5 bg-[var(--color-primary)]"
              >
                <FaGoogle className="w-4 h-4 text-white" />
                <span>Continue with Google</span>
              </Button>
            </div>

            {/* Hairline Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="w-full border-t border-[var(--color-border)]" />
              <span className="absolute bg-[var(--color-surface)] px-3 font-mono text-[11px] uppercase tracking-wider text-[var(--color-ink-muted)]">
                or with email pass
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label
                    htmlFor="name"
                    className="block font-body text-xs font-semibold text-[var(--color-ink)] mb-1"
                  >
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block font-body text-xs font-semibold text-[var(--color-ink)] mb-1"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="candidate@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block font-body text-xs font-semibold text-[var(--color-ink)] mb-1"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="secondary"
                  isLoading={isSubmitting}
                  className="w-full"
                >
                  {mode === "signin" ? "Check In" : "Generate Pass & Continue"}
                </Button>
              </div>
            </form>

            {/* Mode toggle */}
            <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-body text-[var(--color-ink-muted)]">
              <span>
                {mode === "signin"
                  ? "New candidate to the concourse?"
                  : "Already hold a candidate pass?"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setErrorMessage("");
                }}
                className="font-semibold text-[var(--color-primary)] hover:underline uppercase tracking-wider font-mono text-[11px]"
              >
                {mode === "signin" ? "Create Pass" : "Sign In"}
              </button>
            </div>
          </TicketStub>
        </div>
      </main>

      <Footer />
    </div>
  );
}
