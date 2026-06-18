import { FeedingRow } from "@/components/feeding-row";

interface RecentListProps {
  rows: Array<{
    id: string;
    fedAt: Date;
    fedByName: string | null;
  }>;
  justFed: string | null;
}

export function RecentList({ rows, justFed }: RecentListProps) {
  return (
    <section className="w-full max-w-sm mx-auto space-y-3">
      <h2 className="text-xs font-semibold font-mono tracking-widest uppercase text-(--foreground)">
        Recent
      </h2>

      {rows.length === 0 ? (
        <p className="text-sm text-(--foreground) text-center py-4">
          No feedings yet. Tap the bowl to log the first one.
        </p>
      ) : (
        <div className="space-y-1.5">
          {rows.map((row) => (
            <FeedingRow key={row.id} row={row} justFed={justFed} />
          ))}
        </div>
      )}

      <a
        href="/history"
        className="
          block text-center text-xs text-(--foreground) underline underline-offset-2
          hover:text-(--ink)
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)
          transition-colors pt-1
        "
      >
        View all history →
      </a>
    </section>
  );
}
