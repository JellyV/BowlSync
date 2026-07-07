import { describe, it, expect } from "vitest";
import { memberInitial } from "@/lib/initials";

describe("memberInitial", () => {
  it("takes the first letter, uppercased", () => {
    expect(memberInitial("Vakho")).toBe("V");
    expect(memberInitial("nino")).toBe("N");
  });
  it("ignores leading whitespace", () => {
    expect(memberInitial("  ana")).toBe("A");
  });
  it("uses the first word of multi-word names", () => {
    expect(memberInitial("Mary Jane")).toBe("M");
  });
  it("falls back to ? for empty or whitespace-only names", () => {
    expect(memberInitial("")).toBe("?");
    expect(memberInitial("   ")).toBe("?");
  });
  it("keeps multi-byte characters intact", () => {
    expect(memberInitial("გიორგი")).toBe("გ".toUpperCase());
    expect(memberInitial("😀 cool name")).toBe("😀");
  });
});
