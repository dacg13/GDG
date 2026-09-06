import React from "react";

/**
 * Concourse TicketStub Component
 * Universal record object per designing.md Section 5.3.1.
 * Features:
 * - 2px sharp radius (radius-sharp)
 * - 1px hairline border (border-hairline)
 * - Perforation line with semicircular notch cutouts
 * - Main info section (~70%) + Stub section (~30% on desktop, stacked on mobile)
 */
export default function TicketStub({
  children,
  stub,
  className = "",
  orientation = "horizontal", // 'horizontal' (desktop row) | 'vertical'
  variant = "default", // 'default' | 'ceremonial' | 'compact'
  ...props
}) {
  const isCeremonial = variant === "ceremonial";
  const isCompact = variant === "compact";

  return (
    <div
      className={`relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-sharp)] overflow-hidden transition-all ${
        orientation === "horizontal"
          ? "flex flex-col md:flex-row"
          : "flex flex-col"
      } ${className}`}
      {...props}
    >
      {/* Main content section */}
      <div className={`flex-1 ${isCompact ? "p-3" : isCeremonial ? "p-8" : "p-6"}`}>
        {children}
      </div>

      {stub && (
        <>
          {/* Perforation Divider with Notch Cutouts */}
          <div
            className={`relative flex items-center justify-center ${
              orientation === "horizontal"
                ? "border-t md:border-t-0 md:border-l border-dashed border-[var(--color-border)] my-0"
                : "border-t border-dashed border-[var(--color-border)]"
            }`}
            aria-hidden="true"
          >
            {/* Notches for horizontal view */}
            {orientation === "horizontal" ? (
              <>
                <span className="hidden md:block absolute -top-[9px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]" />
                <span className="hidden md:block absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]" />
                {/* Mobile horizontal notch */}
                <span className="md:hidden absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]" />
                <span className="md:hidden absolute -right-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]" />
              </>
            ) : (
              <>
                <span className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]" />
                <span className="absolute -right-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]" />
              </>
            )}
          </div>

          {/* Stub section */}
          <div
            className={`bg-[var(--color-surface)] flex flex-col justify-between ${
              orientation === "horizontal"
                ? "w-full md:w-[32%] lg:w-[28%]"
                : "w-full"
            } ${isCompact ? "p-3" : isCeremonial ? "p-8" : "p-6"}`}
          >
            {stub}
          </div>
        </>
      )}
    </div>
  );
}
