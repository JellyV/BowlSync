export type Freshness = "fresh" | "recent" | "stale";

export function freshnessFromElapsed(minutes: number): Freshness {
  if (minutes < 120) return "fresh";
  if (minutes < 360) return "recent";
  return "stale";
}

export function freshnessColorVar(f: Freshness): string {
  return `var(--status-${f})`;
}
