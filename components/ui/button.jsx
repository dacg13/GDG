import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Concourse Button Variants per designing.md Section 5.1.
 * Enforces:
 * - radius-button (6px)
 * - text-small (14px, Hanken Grotesk 500, uppercase 0.02em tracking)
 * - Height 44px
 * - Tactile active scale (0.98)
 * - Accessible 2px focus outlines
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-button)] font-body text-sm font-medium tracking-[0.02em] uppercase transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:active:scale-100",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-[#FFFDF7] hover:bg-[var(--color-primary-hover)] focus-visible:ring-[var(--color-accent)] disabled:bg-[var(--color-border)] disabled:text-[var(--color-ink-muted)]",
        primary:
          "bg-[var(--color-primary)] text-[#FFFDF7] hover:bg-[var(--color-primary-hover)] focus-visible:ring-[var(--color-accent)] disabled:bg-[var(--color-border)] disabled:text-[var(--color-ink-muted)]",
        secondary:
          "bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-bg)] focus-visible:ring-[var(--color-accent)] disabled:border-[var(--color-border)] disabled:text-[var(--color-ink-muted)]",
        ghost:
          "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-bg)] focus-visible:ring-[var(--color-accent)] disabled:text-[var(--color-ink-muted)]",
        destructive:
          "bg-transparent text-[var(--color-error)] border border-[var(--color-error)] hover:bg-[var(--color-error)]/10 focus-visible:ring-[var(--color-error)] disabled:border-[var(--color-border)] disabled:text-[var(--color-ink-muted)]",
        outline:
          "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-bg)] focus-visible:ring-[var(--color-accent)]",
        link:
          "text-[var(--color-primary)] underline-offset-4 hover:underline p-0 h-auto lowercase font-normal normal-case",
      },
      size: {
        default: "h-[44px] px-6 py-2",
        sm: "h-[36px] px-4 text-xs",
        lg: "h-[48px] px-8 text-base",
        icon: "h-[44px] w-[44px] p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

/**
 * Ticket-punch spinner for loading buttons per designing.md 5.1
 */
const TicketPunchSpinner = () => (
  <span className="inline-flex items-center gap-1.5" aria-hidden="true">
    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
    <span className="w-2 h-2 rounded-full bg-current animate-pulse [animation-delay:150ms]" />
    <span className="w-2 h-2 rounded-full bg-current animate-pulse [animation-delay:300ms]" />
  </span>
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, isLoading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <TicketPunchSpinner /> : children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
