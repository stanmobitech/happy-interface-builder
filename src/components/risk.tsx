import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/chemichemi";

export const riskStyles: Record<RiskLevel, { badge: string; ring: string; text: string; label: string }> = {
  SAFE: { badge: "bg-safe/15 text-safe border-safe/30", ring: "stroke-safe", text: "text-safe", label: "Safe" },
  CAUTION: { badge: "bg-caution/15 text-caution border-caution/30", ring: "stroke-caution", text: "text-caution", label: "Caution" },
  DANGER: { badge: "bg-danger/15 text-danger border-danger/30", ring: "stroke-danger", text: "text-danger", label: "Danger" },
  CRITICAL: { badge: "bg-critical/20 text-critical border-critical/40", ring: "stroke-critical", text: "text-critical", label: "Critical" },
};

export const severityStyles: Record<string, string> = {
  low: "bg-safe/15 text-safe border-safe/30",
  moderate: "bg-caution/15 text-caution border-caution/30",
  high: "bg-danger/15 text-danger border-danger/30",
  critical: "bg-critical/20 text-critical border-critical/40",
};

export function RiskPill({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        riskStyles[level].badge,
        level === "CRITICAL" && "animate-pulse",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}

export function RiskGauge({ score, level }: { score: number; level: RiskLevel }) {
  const pct = Math.min(1, score / 10);
  const r = 62;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative grid size-40 place-items-center">
      <svg viewBox="0 0 160 160" className="size-40 -rotate-90">
        <circle cx="80" cy="80" r={r} className="fill-none stroke-border" strokeWidth="12" />
        <circle
          cx="80"
          cy="80"
          r={r}
          className={cn("fill-none transition-all duration-700", riskStyles[level].ring)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
        />
      </svg>
      <div className="absolute text-center">
        <div className={cn("font-display text-4xl font-bold leading-none", riskStyles[level].text)}>{score}</div>
        <div className="mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">of 10</div>
      </div>
    </div>
  );
}
