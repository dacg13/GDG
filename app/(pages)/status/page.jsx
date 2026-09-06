"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import TicketStub from "@/components/ui/TicketStub";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  Ticket,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
  Compass,
} from "lucide-react";

export default function StatusPage() {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const user = session?.user;

  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isAuthPending && !user) {
      router.push("/auth/signin");
      return;
    }

    if (user?.email) {
      fetchSubmissions();
    }
  }, [user, isAuthPending, router]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/get-submissions");
      if (!res.ok) {
        throw new Error("Unable to retrieve your applications.");
      }
      const json = await res.json();
      setSubmissions(json.data || []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setErrorMessage("Could not load your departure schedule. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatAnswers = (questions) => {
    if (!questions) return [];
    if (typeof questions === "object" && !Array.isArray(questions)) {
      return Object.entries(questions).map(([q, a]) => ({
        question: q,
        answer: String(a || ""),
      }));
    }
    return [];
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <NavBar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Departure Board Banner */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sharp)] p-6 md:p-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                <span>PERSONAL DEPARTURE BOARD</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-[var(--color-ink)]">
                Your Application Status
              </h1>
              <p className="font-body text-sm text-[var(--color-ink-muted)] mt-1">
                Monitor your recruitment progress across your chosen destination gates.
              </p>
            </div>

            {user && (
              <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sharp)] p-4 font-mono text-xs text-[var(--color-ink)] flex flex-col gap-1">
                <div className="text-[10px] uppercase text-[var(--color-ink-muted)]">
                  CANDIDATE ID
                </div>
                <div className="font-semibold text-sm truncate max-w-[200px]">
                  {user.name || user.email}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="h-44 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sharp)] animate-pulse" />
            <div className="h-44 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sharp)] animate-pulse" />
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMessage && (
          <div className="max-w-xl mx-auto text-center py-10">
            <p className="font-body text-sm text-[var(--color-error)] mb-4">
              {errorMessage}
            </p>
            <Button variant="secondary" onClick={fetchSubmissions}>
              Retry Connection
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMessage && submissions.length === 0 && (
          <EmptyState
            title="No Active Boarding Passes"
            description="You haven't submitted any department applications yet. Choose your destination tracks to start your recruitment journey."
            action={
              <Link href="/departments">
                <Button variant="primary" className="gap-2">
                  <span>Explore Destinations</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            }
          />
        )}

        {/* Submissions List (Ticket-Stub per Application) */}
        {!isLoading && !errorMessage && submissions.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-6">
            {submissions.map((sub, idx) => {
              const isExpanded = expandedId === (sub._id || sub.id || idx);
              const answers = formatAnswers(sub.Questions);
              const status = sub.shortlisted ? "shortlisted" : "under review";

              return (
                <TicketStub
                  key={sub._id || sub.id || idx}
                  className="shadow-sm"
                  stub={
                    <div className="flex flex-col justify-between h-full space-y-4">
                      <div>
                        <div className="font-mono text-[10px] uppercase text-[var(--color-ink-muted)] mb-1">
                          GATE STATUS
                        </div>
                        <StatusBadge status={status} />
                      </div>

                      <div className="font-mono text-xs text-[var(--color-ink-muted)] space-y-1.5 pt-3 border-t border-dashed border-[var(--color-border)]">
                        <div>
                          PREF:{" "}
                          <span className="font-semibold text-[var(--color-ink)]">
                            {sub.Pref === "1" ? "1st Choice" : "2nd Choice"}
                          </span>
                        </div>
                        <div>
                          PASS:{" "}
                          <span className="font-semibold text-[var(--color-ink)]">
                            {sub.RegistrationNumber || "CNCS-REC"}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => toggleExpand(sub._id || sub.id || idx)}
                          className="w-full flex items-center justify-between text-xs font-mono font-medium text-[var(--color-primary)] hover:underline py-1 focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
                        >
                          <span>{isExpanded ? "Collapse Details" : "View Answers"}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded-[var(--radius-sharp)] bg-[var(--color-primary)] text-white font-bold">
                        GATE 0{idx + 1}
                      </span>
                      <span className="text-[var(--color-ink-muted)]">
                        ITINERARY RECORD
                      </span>
                    </div>

                    <div>
                      <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">
                        {sub.Department}
                      </h2>
                      <p className="font-mono text-xs text-[var(--color-ink-muted)] mt-0.5">
                        Candidate: {sub.Name} ({sub.RegistrationNumber})
                      </p>
                    </div>

                    {/* Expandable Submitted Answers */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-[var(--color-border)] space-y-3 animate-in fade-in duration-200">
                        <div className="font-mono text-xs uppercase font-semibold text-[var(--color-ink-muted)]">
                          RECORDED RESPONSES
                        </div>
                        {answers.length > 0 ? (
                          <div className="space-y-3">
                            {answers.map((item, i) => (
                              <div
                                key={i}
                                className="bg-[var(--color-bg)] p-3 rounded-[var(--radius-sharp)] border border-[var(--color-border)] text-xs"
                              >
                                <div className="font-medium text-[var(--color-ink-muted)] mb-1">
                                  {item.question}
                                </div>
                                <div className="text-[var(--color-ink)] font-body whitespace-pre-wrap leading-relaxed">
                                  {item.answer || (
                                    <span className="italic opacity-50">
                                      No response provided
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="font-body text-xs text-[var(--color-ink-muted)] italic">
                            No specific questionnaire items recorded for this department.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </TicketStub>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
