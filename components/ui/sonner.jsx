"use client";

import { Toaster as Sonner } from "sonner";

/**
 * Concourse Toaster per designing.md Section 5.8.
 * Features:
 * - Position: bottom-right (desktop) / bottom-center (mobile)
 * - radius-input (4px)
 * - shadow-float
 * - 1px hairline border, color-surface fill, color-ink text
 * - 4px vertical left-edge accent bar (color-success for success, color-error for error)
 * - Paired with icon, auto-dismiss 4s with close action
 */
const Toaster = ({ ...props }) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      duration={4000}
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast font-body text-sm bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-border)] rounded-[var(--radius-input)] shadow-[var(--shadow-float)] p-4 flex items-center gap-3",
          description: "font-body text-xs text-[var(--color-ink-muted)]",
          actionButton:
            "font-body text-xs uppercase font-medium bg-[var(--color-primary)] text-white rounded-[var(--radius-button)] px-3 py-1.5",
          cancelButton:
            "font-body text-xs uppercase font-medium bg-[var(--color-bg)] text-[var(--color-ink-muted)] rounded-[var(--radius-button)] px-3 py-1.5",
          success:
            "!border-l-4 !border-l-[var(--color-success)] !bg-[var(--color-surface)]",
          error:
            "!border-l-4 !border-l-[var(--color-error)] !bg-[var(--color-surface)]",
          info:
            "!border-l-4 !border-l-[var(--color-primary)] !bg-[var(--color-surface)]",
          warning:
            "!border-l-4 !border-l-[var(--color-warning)] !bg-[var(--color-surface)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
export default Toaster;
