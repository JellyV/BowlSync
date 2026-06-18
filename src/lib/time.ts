export function minutesBetween(a: Date, b: Date): number {
  return Math.floor(Math.abs(b.getTime() - a.getTime()) / 60000);
}

export function formatRelative(from: Date, now: Date = new Date()): string {
  const mins = minutesBetween(from, now);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function formatAbsolute(d: Date): string {
  return d.toLocaleString("en-US", {
    hour: "numeric", minute: "2-digit", weekday: "short", month: "short", day: "numeric",
  });
}
