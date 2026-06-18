import { describe, it, expect } from "vitest";
import { generateInviteCode } from "@/lib/invite-code";

describe("generateInviteCode", () => {
  it("is 6 chars from the unambiguous alphabet", () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
  });
  it("is reasonably unique across many calls", () => {
    const set = new Set(Array.from({ length: 1000 }, () => generateInviteCode()));
    expect(set.size).toBeGreaterThan(990);
  });
});
