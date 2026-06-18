import { describe, it, expect } from "vitest";
import { safeNext } from "@/lib/safe-next";

const ORIGIN = "https://bowlsync.app";

describe("safeNext", () => {
  it("preserves a valid relative path", () => {
    expect(safeNext("/fed", ORIGIN)).toBe("/fed");
  });

  it("preserves a valid path with query string", () => {
    expect(safeNext("/history?range=week", ORIGIN)).toBe("/history?range=week");
  });

  it("returns '/' for null", () => {
    expect(safeNext(null, ORIGIN)).toBe("/");
  });

  it("returns '/' for empty string", () => {
    expect(safeNext("", ORIGIN)).toBe("/");
  });

  it("blocks protocol-relative attack (//evil.com)", () => {
    expect(safeNext("//evil.com", ORIGIN)).toBe("/");
  });

  it("blocks absolute off-origin attack (https://evil.com/x)", () => {
    expect(safeNext("https://evil.com/x", ORIGIN)).toBe("/");
  });

  it("blocks URL-encoded protocol-relative attack (decoded: //evil.com)", () => {
    // URLSearchParams.get decodes before passing here, so test the decoded value
    expect(safeNext("//evil.com", ORIGIN)).toBe("/");
  });

  it("bare string without leading slash is treated as relative path (same origin, safe)", () => {
    // new URL("evil.com", origin) → https://bowlsync.app/evil.com — still same origin
    expect(safeNext("evil.com", ORIGIN)).toBe("/evil.com");
  });

  it("allows same-origin absolute URL and returns only path", () => {
    expect(safeNext("https://bowlsync.app/dashboard", ORIGIN)).toBe("/dashboard");
  });

  it("returns '/' for an empty path root '/'", () => {
    expect(safeNext("/", ORIGIN)).toBe("/");
  });
});
