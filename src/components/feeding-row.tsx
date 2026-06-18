"use client";

import * as React from "react";
import { formatAbsolute } from "@/lib/time";
import { EditFeedingDialog } from "@/components/edit-feeding-dialog";

interface Member {
  id: string;
  displayName: string;
}

interface FeedingRowProps {
  row: {
    id: string;
    fedAt: Date;
    fedByName: string | null;
    fedById: string | null;
  };
  justFed: string | null;
  members: Member[];
}

export function FeedingRow({ row, justFed, members }: FeedingRowProps) {
  const isJust = row.id === justFed;
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`
          w-full flex items-center justify-between rounded-lg px-4 py-3 gap-3
          ${isJust ? "bg-(--accent)/15" : "bg-(--foreground)/5"}
          transition-colors
          hover:bg-(--accent)/20
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)
          text-left
        `}
        aria-label={`Edit feeding by ${row.fedByName ?? "Unknown"} at ${formatAbsolute(row.fedAt)}`}
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
      </button>

      <EditFeedingDialog
        open={open}
        onOpenChange={setOpen}
        feeding={{
          id: row.id,
          fedById: row.fedById,
          fedAt: row.fedAt,
        }}
        members={members}
      />
    </>
  );
}
