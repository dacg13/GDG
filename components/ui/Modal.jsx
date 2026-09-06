"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import Button from "./button";

/**
 * Concourse Modal per designing.md Section 5.7.
 * Used for a single, focused decision (e.g. confirming destructive or bulk actions).
 * Features:
 * - Centered
 * - shadow-modal
 * - radius-panel (8px)
 * - 1px hairline border
 * - color-surface fill
 */
export default function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isDestructive = false,
  isLoading = false,
  showFooter = true,
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Modal Content */}
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-panel)] p-6 shadow-[var(--shadow-modal)] focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-start justify-between mb-3">
            {title && (
              <DialogPrimitive.Title className="font-display text-xl font-semibold text-[var(--color-ink)]">
                {title}
              </DialogPrimitive.Title>
            )}
            <DialogPrimitive.Close
              aria-label="Close modal"
              className="p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] rounded-[var(--radius-button)] focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
            >
              <X className="w-4 h-4" />
            </DialogPrimitive.Close>
          </div>

          {description && (
            <DialogPrimitive.Description className="font-body text-sm text-[var(--color-ink-muted)] leading-relaxed mb-4">
              {description}
            </DialogPrimitive.Description>
          )}

          <div className="my-2">{children}</div>

          {showFooter && (
            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {cancelLabel}
              </Button>
              <Button
                variant={isDestructive ? "destructive" : "primary"}
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : confirmLabel}
              </Button>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
