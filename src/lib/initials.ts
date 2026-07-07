/**
 * First grapheme of the trimmed name, uppercased — "?" when the name is
 * empty or whitespace-only. Spread (not [0]) so surrogate pairs like emoji
 * or non-Latin scripts aren't split.
 */
export function memberInitial(name: string): string {
  const first = [...name.trim()][0];
  return first ? first.toUpperCase() : "?";
}
