import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Concourse Textarea Component per designing.md Section 5.2.
 * - Radius: 4px (radius-input)
 * - Typography: 16px text-body (Hanken Grotesk)
 * - 1px hairline border, color-surface fill
 * - Focus: 2px primary border, NO glow/shadow
 * - Error: 2px error border
 */
const Textarea = React.forwardRef(({ className, hasError = false, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-[var(--radius-input)] border bg-[var(--color-surface)] px-4 py-3 text-base font-body text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]/70 transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-[var(--color-bg)] disabled:text-[var(--color-ink-muted)]",
        hasError
          ? "border-2 border-[var(--color-error)]"
          : "border-[var(--color-border)] focus-visible:border-2 focus-visible:border-[var(--color-primary)]",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
export default Textarea;
