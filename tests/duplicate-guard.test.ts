import { describe, it, expect } from "vitest";
import { evaluateGuard } from "@/lib/duplicate-guard";

const now = new Date("2026-06-18T12:00:00Z");

describe("evaluateGuard", () => {
  it("logs when there is no prior feeding", () => {
    expect(evaluateGuard(null, now)).toEqual({ action: "log" });
  });
  it("logs when last feeding is older than 30 min", () => {
    expect(evaluateGuard({ fedAt: new Date("2026-06-18T11:29:00Z"), fedByName: "Alex" }, now))
      .toEqual({ action: "log" });
  });
  it("prompts when last feeding is within 30 min", () => {
    expect(evaluateGuard({ fedAt: new Date("2026-06-18T11:52:00Z"), fedByName: "Alex" }, now))
      .toEqual({ action: "prompt", minutesAgo: 8, fedByName: "Alex" });
  });
});
