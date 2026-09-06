import React from "react";
import { ArrowRight, Check, ArrowUpDown } from "lucide-react";

/**
 * Curated accent color palette (max 4 active in grid per designing.md 5.3.2)
 */
const ACCENT_PALETTES = [
  {
    headerBg: "bg-[#10233D]",
    headerText: "text-[#FAF6EC]",
    tagBg: "bg-[#F2A93B]",
    tagText: "text-[#1A1A16]",
    accentCode: "DEST-01",
  },
  {
    headerBg: "bg-[#2F7D4F]",
    headerText: "text-[#FAF6EC]",
    tagBg: "bg-[#FAF6EC]",
    tagText: "text-[#1A1A16]",
    accentCode: "DEST-02",
  },
  {
    headerBg: "bg-[#8B2E2E]",
    headerText: "text-[#FAF6EC]",
    tagBg: "bg-[#F2A93B]",
    tagText: "text-[#1A1A16]",
    accentCode: "DEST-03",
  },
  {
    headerBg: "bg-[#3D2C1E]",
    headerText: "text-[#FAF6EC]",
    tagBg: "bg-[#E3DDCE]",
    tagText: "text-[#1A1A16]",
    accentCode: "DEST-04",
  },
];

/**
 * Concourse Destination Poster Card per designing.md Section 5.3.2.
 */
export default function DestinationCard({
  department,
  index = 0,
  isSelected = false,
  isSubmitted = false,
  choiceLabel = null, // "1st Choice" | "2nd Choice" | null
  onToggle,
  onSwapPriority,
  className = "",
  showActions = true,
}) {
  const palette = ACCENT_PALETTES[index % ACCENT_PALETTES.length];

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isSubmitted && onToggle) onToggle();
    }
  };

  return (
    <div
      role={onToggle ? "checkbox" : "region"}
      aria-checked={isSelected}
      aria-disabled={isSubmitted}
      tabIndex={onToggle && !isSubmitted ? 0 : undefined}
      onKeyDown={handleKeyDown}
      onClick={() => {
        if (!isSubmitted && onToggle) onToggle();
      }}
      className={`group relative flex flex-col justify-between bg-[var(--color-surface)] border rounded-[var(--radius-sharp)] overflow-hidden transition-transform duration-150 ease-out cursor-pointer select-none ${
        isSelected
          ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]"
          : "border-[var(--color-border)] hover:-translate-y-[2px]"
      } ${isSubmitted ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
    >
      {/* Choice Ribbon if selected */}
      {choiceLabel && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-accent)] text-[var(--color-ink)] font-mono text-[11px] font-semibold tracking-wider uppercase rounded-[var(--radius-sharp)] shadow-sm">
          <span>{choiceLabel}</span>
          {onSwapPriority && (
            <button
              type="button"
              aria-label="Swap department priority"
              onClick={(e) => {
                e.stopPropagation();
                onSwapPriority();
              }}
              className="p-0.5 hover:bg-black/10 rounded transition-colors"
              title="Click to swap priority"
            >
              <ArrowUpDown className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Top 2/3: Color/Graphic Block */}
      <div
        className={`relative h-44 ${palette.headerBg} ${palette.headerText} p-6 flex flex-col justify-between overflow-hidden`}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs tracking-widest uppercase opacity-80">
            {department.code || palette.accentCode}
          </span>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded-[var(--radius-sharp)] uppercase font-medium tracking-wider bg-black/20 text-[#FAF6EC]">
            {isSubmitted ? "SUBMITTED" : isSelected ? "SELECTED" : "OPEN"}
          </span>
        </div>

        {/* Departure Graphic Node */}
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#FAF6EC]/70 mb-1">
            DESTINATION GATE
          </div>
          <h3 className="font-display text-2xl font-semibold leading-tight text-[#FAF6EC]">
            {department.name}
          </h3>
        </div>

        {/* Subtle geometric line design */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full border border-white/10 pointer-events-none" />
      </div>

      {/* Bottom 1/3: Department details & CTA */}
      <div className="p-5 flex flex-col flex-1 justify-between bg-[var(--color-surface)]">
        <p className="font-body text-[14px] text-[var(--color-ink-muted)] leading-relaxed line-clamp-3 mb-4">
          {department.description}
        </p>

        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)] mt-auto">
            <span className="font-mono text-xs font-medium text-[var(--color-ink)]">
              {isSubmitted
                ? "Application Lodged"
                : isSelected
                ? "Selected for Boarding"
                : "Select Track"}
            </span>

            <div
              className={`w-6 h-6 rounded-[var(--radius-sharp)] flex items-center justify-center border transition-colors ${
                isSelected
                  ? "bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-ink)]"
                  : "border-[var(--color-border)] text-[var(--color-ink-muted)] group-hover:border-[var(--color-primary)]"
              }`}
            >
              {isSelected ? (
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <ArrowRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
