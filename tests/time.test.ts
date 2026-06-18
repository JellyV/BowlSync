import { describe, it, expect } from "vitest";
import { minutesBetween, formatRelative } from "@/lib/time";

describe("minutesBetween", () => {
  it("returns whole minutes between two dates", () => {
    expect(minutesBetween(new Date("2026-06-18T10:00:00Z"), new Date("2026-06-18T10:30:00Z"))).toBe(30);
  });
  it("is order-independent (uses Math.abs)", () => {
    const a = new Date("2026-06-18T10:00:00Z");
    const b = new Date("2026-06-18T10:30:00Z");
    expect(minutesBetween(b, a)).toBe(minutesBetween(a, b));
    expect(minutesBetween(b, a)).toBe(30);
  });
});

describe("formatRelative", () => {
  const now = new Date("2026-06-18T12:00:00Z");
  it("says 'just now' under 1 minute", () => {
    expect(formatRelative(new Date("2026-06-18T11:59:40Z"), now)).toBe("just now");
  });
  it("uses minutes under an hour", () => {
    expect(formatRelative(new Date("2026-06-18T11:25:00Z"), now)).toBe("35 min ago");
  });
  it("uses hours under a day", () => {
    expect(formatRelative(new Date("2026-06-18T10:00:00Z"), now)).toBe("2h ago");
  });
  it("uses days beyond 24h", () => {
    expect(formatRelative(new Date("2026-06-16T12:00:00Z"), now)).toBe("2d ago");
  });
  it("exactly 1 minute: shows '1 min ago' not 'just now'", () => {
    expect(formatRelative(new Date("2026-06-18T11:59:00Z"), now)).toBe("1 min ago");
  });
  it("exactly 60 minutes: shows '1h ago' not '60 min ago'", () => {
    expect(formatRelative(new Date("2026-06-18T11:00:00Z"), now)).toBe("1h ago");
  });
  it("exactly 24 hours: shows '1d ago' not '24h ago'", () => {
    expect(formatRelative(new Date("2026-06-17T12:00:00Z"), now)).toBe("1d ago");
  });
});
