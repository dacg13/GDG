import React from "react";
import { Ticket } from "lucide-react";

/**
 * Concourse Empty-State Card per designing.md Section 5.3.4.
 * Features:
 * - Dashed 1px hairline border (the only dashed-border card use)
 * - Centered line-style icon consistent with ticket/terminal motif
 * - Concise, clear copy
 * - Optional action slot
 */
export default function EmptyState({
  title = "No applications yet",
  description = "You haven't submitted any applications. Choose your destination tracks to begin.",
  icon: Icon = Ticket,
  action,
  className = "",
}) {
  return (
    <div
      className={`border border-dashed border-[var(--color-border)] rounded-[var(--radius-sharp)] bg-[var(--color-surface)]/60 p-8 md:p-12 flex flex-col items-center justify-center text-center max-w-xl mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-ink-muted)] mb-4 bg-[var(--color-surface)]">
        <Icon className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
      </div>

      <h3 className="font-display text-lg font-semibold text-[var(--color-ink)] mb-1">
        {title}
      </h3>

      <p className="font-body text-sm text-[var(--color-ink-muted)] max-w-md mb-6 leading-relaxed">
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
}
