import { minutesBetween } from "./time";

export const DUPLICATE_WINDOW_MINUTES = 30;

export type LastFeeding = { fedAt: Date; fedByName: string | null } | null;
export type GuardDecision =
  | { action: "log" }
  | { action: "prompt"; minutesAgo: number; fedByName: string | null };

export function evaluateGuard(last: LastFeeding, now: Date): GuardDecision {
  if (!last) return { action: "log" };
  const minutesAgo = minutesBetween(last.fedAt, now);
  if (minutesAgo >= DUPLICATE_WINDOW_MINUTES) return { action: "log" };
  return { action: "prompt", minutesAgo, fedByName: last.fedByName };
}
