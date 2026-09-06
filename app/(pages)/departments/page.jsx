"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import DestinationCard from "@/components/ui/DestinationCard";
import Button from "@/components/ui/button";
import { reviews } from "@/constants";
import { useSubmissions } from "@/components/SubmissionsProvider";
import { toast } from "sonner";
import { ArrowRight, ArrowUpDown, AlertCircle, Check } from "lucide-react";

export default function DepartmentsPage() {
  const router = useRouter();
  const { submittedDepartments } = useSubmissions();
  const [selectedDepartments, setSelectedDepartments] = useState([]); // [deptName1, deptName2]

  const departments = reviews || [];
  const remainingSlots = Math.max(0, 2 - (submittedDepartments?.length || 0));
  const selectedCount = selectedDepartments.length;

  const toggleDepartment = (deptName) => {
    if (submittedDepartments?.includes(deptName)) {
      toast.error(`You have already submitted an application for ${deptName}.`);
      return;
    }

    if (remainingSlots <= 0) {
      toast.error("You have already submitted the maximum allowed (2) applications.");
      return;
    }

    setSelectedDepartments((current) => {
      if (current.includes(deptName)) {
        return current.filter((name) => name !== deptName);
      }
      if (current.length >= remainingSlots) {
        toast.error(`You can select at most ${remainingSlots} destination track(s).`);
        return current;
      }
      return [...current, deptName];
    });
  };

  const swapPriority = () => {
    if (selectedDepartments.length === 2) {
      setSelectedDepartments([selectedDepartments[1], selectedDepartments[0]]);
      toast.info("Department priority swapped (1st Choice ↔ 2nd Choice)");
    }
  };

  const handleContinue = () => {
    if (!selectedDepartments.length) return;

    // Resolve IDs in selected order: index 0 is 1st choice, index 1 is 2nd choice
    const selectedIds = selectedDepartments
      .map((name) => departments.find((d) => d.name === name)?.id)
      .filter(Boolean);

    router.push(`/join/${selectedIds.join("/")}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <NavBar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Terminal Header & Action Strip */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sharp)] p-6 md:p-8 mb-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                <span>STEP 01 · DESTINATION SELECTION</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-[var(--color-ink)]">
                Choose Your Destination Gates
              </h1>
              <p className="font-body text-sm text-[var(--color-ink-muted)] mt-1 max-w-xl">
                Select up to <strong>two</strong> tracks. Your first selection serves as your primary track.
              </p>
            </div>

            {/* Selection Summary & Priority Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[var(--color-bg)] p-4 border border-[var(--color-border)] rounded-[var(--radius-sharp)]">
              <div>
                <div className="font-mono text-xs text-[var(--color-ink-muted)] uppercase">
                  SLOTS REMAINING
                </div>
                <div className="font-mono text-xl font-semibold text-[var(--color-ink)]">
                  {selectedCount} / {remainingSlots} SELECTED
                </div>
              </div>

              {selectedCount === 2 && (
                <button
                  type="button"
                  onClick={swapPriority}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] rounded-[var(--radius-button)] font-mono text-xs text-[var(--color-ink)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
                  title="Swap 1st and 2nd choices"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span>Swap Priority</span>
                </button>
              )}

              <Button
                variant="primary"
                onClick={handleContinue}
                disabled={selectedCount === 0}
                className="gap-2"
              >
                <span>Proceed to Boarding</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active selection ribbon */}
          {selectedCount > 0 && (
            <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex flex-wrap items-center gap-3 font-mono text-xs">
              <span className="text-[var(--color-ink-muted)]">ACTIVE ITINERARY:</span>
              <span className="px-2.5 py-1 bg-[var(--color-primary)] text-white rounded-[var(--radius-sharp)] font-semibold">
                1st: {selectedDepartments[0]}
              </span>
              {selectedDepartments[1] && (
                <span className="px-2.5 py-1 bg-[var(--color-accent)] text-[var(--color-ink)] rounded-[var(--radius-sharp)] font-semibold">
                  2nd: {selectedDepartments[1]}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 3-Column Destination Poster Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, index) => {
            const isSelected = selectedDepartments.includes(dept.name);
            const isSubmitted = submittedDepartments?.includes(dept.name);
            const choiceIndex = selectedDepartments.indexOf(dept.name);
            const choiceLabel =
              choiceIndex === 0
                ? "1st Choice"
                : choiceIndex === 1
                ? "2nd Choice"
                : null;

            return (
              <DestinationCard
                key={dept.id || index}
                department={dept}
                index={index}
                isSelected={isSelected}
                isSubmitted={isSubmitted}
                choiceLabel={choiceLabel}
                onToggle={() => toggleDepartment(dept.name)}
                onSwapPriority={selectedCount === 2 ? swapPriority : undefined}
                showActions={true}
              />
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
