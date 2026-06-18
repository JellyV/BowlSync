export function safeNext(raw: string | null, origin: string): string {
  if (!raw) return "/";
  try {
    const url = new URL(raw, origin);
    if (url.origin !== origin) return "/";
    return url.pathname + url.search;
  } catch {
    return "/";
  }
}
