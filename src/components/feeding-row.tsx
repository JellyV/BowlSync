import { formatAbsolute } from "@/lib/time";

interface FeedingRowProps {
  row: {
    id: string;
    fedAt: Date;
    fedByName: string | null;
  };
  justFed: string | null;
}

export function FeedingRow({ row, justFed }: FeedingRowProps) {
  const isJust = row.id === justFed;

  return (
    <div
      className={`
        flex items-center justify-between rounded-lg px-4 py-3 gap-3
        ${isJust ? "bg-(--accent)/15" : "bg-(--foreground)/5"}
        transition-colors
      `}
    >
      <span className="font-mono text-xs text-(--foreground) tabular-nums shrink-0">
        {formatAbsolute(row.fedAt)}
      </span>

      <span className="text-sm text-(--ink) truncate flex-1 text-right">
        {row.fedByName ?? "Unknown"}
      </span>

      {isJust && (
        <span
          className="
            shrink-0 rounded-full px-2 py-0.5
            text-[10px] font-semibold uppercase tracking-wide
            bg-(--accent) text-(--background)
          "
        >
          just
        </span>
      )}
    </div>
  );
}
