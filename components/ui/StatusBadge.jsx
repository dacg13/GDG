import React from "react";
import { Ticket, Clock, CheckCircle2, Flag } from "lucide-react";

/**
 * Concourse Status Badge per designing.md Section 5.4.
 * Rule: Always radius-pill (999px), text-small, icon + label + color together.
 * Never color alone.
 */
export default function StatusBadge({ status, className = "" }) {
  const normalized = (status || "").toString().toLowerCase().trim();

  let config = {
    label: "Submitted",
    icon: Ticket,
    bg: "bg-[#6B6558]/12",
    text: "text-[var(--color-ink)]",
    srText: "Application status: Submitted",
  };

  if (normalized === "shortlisted" || normalized === "true") {
    config = {
      label: "Shortlisted",
      icon: CheckCircle2,
      bg: "bg-[#2F7D4F]/12",
      text: "text-[var(--color-success)]",
      srText: "Application status: Shortlisted for next round",
    };
  } else if (
    normalized === "under review" ||
    normalized === "review" ||
    normalized === "pending"
  ) {
    config = {
      label: "Under Review",
      icon: Clock,
      bg: "bg-[#D98E1F]/15",
      text: "text-[var(--color-warning)]",
      srText: "Application status: Currently under review by committee",
    };
  } else if (
    normalized === "closed" ||
    normalized === "rejected" ||
    normalized === "not selected" ||
    normalized === "false"
  ) {
    config = {
      label: "Applications Closed",
      icon: Flag,
      bg: "bg-[#6B6558]/12",
      text: "text-[var(--color-ink-muted)]",
      srText: "Application status: Applications Closed",
    };
  }

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] ${config.bg} ${config.text} text-[13px] font-medium tracking-normal select-none ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      <span>{config.label}</span>
      <span className="sr-only">({config.srText})</span>
    </span>
  );
}
