import React from "react";

/**
 * Concourse Admin Summary Tile per designing.md Section 5.3.3.
 * Deliberately the quietest card type in the system:
 * - Flat color-surface fill
 * - 1px hairline border
 * - radius-sharp (2px)
 * - Large number in JetBrains Mono (text-h1)
 * - Uppercase small label beneath (Hanken Grotesk 500)
 * - No icon, no shadow, no gradient
 */
export default function SummaryTile({
  label,
  value,
  secondary,
  className = "",
}) {
  return (
    <div
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sharp)] p-5 flex flex-col justify-between ${className}`}
    >
      <div className="font-mono text-3xl lg:text-4xl font-semibold text-[var(--color-ink)] tracking-tight">
        {value}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-body text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
          {label}
        </span>
        {secondary && (
          <span className="font-mono text-xs text-[var(--color-ink-muted)]">
            {secondary}
          </span>
        )}
      </div>
    </div>
  );
}
