import { describe, it, expect } from "vitest";
import { freshnessFromElapsed, freshnessColorVar } from "@/lib/status";

describe("freshnessFromElapsed", () => {
  it("fresh under 2 hours", () => expect(freshnessFromElapsed(119)).toBe("fresh"));
  it("recent between 2 and 6 hours", () => expect(freshnessFromElapsed(200)).toBe("recent"));
  it("stale beyond 6 hours", () => expect(freshnessFromElapsed(400)).toBe("stale"));
});

describe("freshnessColorVar", () => {
  it("maps to css vars", () => {
    expect(freshnessColorVar("fresh")).toBe("var(--status-fresh)");
    expect(freshnessColorVar("stale")).toBe("var(--status-stale)");
  });
});
