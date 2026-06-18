"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HistoryFiltersProps {
  activeRange: string;
  from?: string;
  to?: string;
}

const RANGES = [
  { label: "Today", value: "today" },
  { label: "This week", value: "week" },
  { label: "All", value: "all" },
] as const;

export function HistoryFilters({ activeRange, from, to }: HistoryFiltersProps) {
  const router = useRouter();

  const [fromVal, setFromVal] = React.useState(from ?? "");
  const [toVal, setToVal] = React.useState(to ?? "");

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ range: "custom" });
    if (fromVal) params.set("from", fromVal);
    if (toVal) params.set("to", toVal);
    router.push(`/history?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-sm flex flex-col gap-4">
      {/* Quick-range buttons */}
      <div
        role="group"
        aria-label="Filter by time range"
        className="flex gap-2"
      >
        {RANGES.map(({ label, value }) => {
          const isActive = activeRange === value;
          return (
            <Link
              key={value}
              href={`/history?range=${value}`}
              aria-current={isActive ? "page" : undefined}
              className={`
                flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-center
                transition-colors
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)
                ${
                  isActive
                    ? "bg-(--accent) text-(--background)"
                    : "bg-(--foreground)/8 text-(--ink) hover:bg-(--accent)/20"
                }
              `}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Custom date-range picker */}
      <form
        onSubmit={handleApply}
        className="flex flex-col gap-3 rounded-xl border border-(--foreground)/15 p-4"
        aria-label="Custom date range"
      >
        <p className="text-xs font-semibold font-mono uppercase tracking-wide text-(--foreground)">
          Custom range
        </p>
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label
              htmlFor="history-from"
              className="text-xs text-(--foreground) font-mono"
            >
              From
            </label>
            <input
              id="history-from"
              type="date"
              value={fromVal}
              onChange={(e) => setFromVal(e.target.value)}
              className="
                rounded-lg border border-(--foreground)/20 bg-(--background)
                px-3 py-2 text-sm text-(--ink) w-full
                focus:outline-none focus:ring-2 focus:ring-(--accent)
              "
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label
              htmlFor="history-to"
              className="text-xs text-(--foreground) font-mono"
            >
              To
            </label>
            <input
              id="history-to"
              type="date"
              value={toVal}
              onChange={(e) => setToVal(e.target.value)}
              className="
                rounded-lg border border-(--foreground)/20 bg-(--background)
                px-3 py-2 text-sm text-(--ink) w-full
                focus:outline-none focus:ring-2 focus:ring-(--accent)
              "
            />
          </div>
        </div>
        <button
          type="submit"
          className="
            rounded-lg px-4 py-2 text-sm font-semibold
            bg-(--accent) text-(--background)
            hover:opacity-90 transition-opacity
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)
          "
        >
          Apply
        </button>
      </form>
    </div>
  );
}
