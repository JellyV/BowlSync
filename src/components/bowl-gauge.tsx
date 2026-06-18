import { markFed } from "@/actions/feedings";
import { minutesBetween, formatRelative, formatAbsolute } from "@/lib/time";
import { freshnessFromElapsed, freshnessColorVar } from "@/lib/status";

interface BowlGaugeProps {
  lastFedAt: Date | null;
  lastFedByName: string | null;
  petName: string;
}

export function BowlGauge({ lastFedAt, lastFedByName, petName }: BowlGaugeProps) {
  const now = new Date();
  const minutes = lastFedAt ? minutesBetween(lastFedAt, now) : Infinity;
  const freshness = freshnessFromElapsed(Number.isFinite(minutes) ? minutes : 999);
  const bgColor = freshnessColorVar(freshness);

  const relativeLabel = lastFedAt ? formatRelative(lastFedAt, now) : "Not fed yet";
  const absoluteLabel = lastFedAt ? formatAbsolute(lastFedAt) : null;

  return (
    <form action={markFed}>
      <button
        type="submit"
        aria-label={`Mark ${petName} as fed. Last fed: ${relativeLabel}`}
        className="
          relative mx-auto flex h-56 w-56 flex-col items-center justify-center
          rounded-full border-4 border-(--foreground)/10
          transition-transform duration-150
          hover:scale-105 active:scale-95
          focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-(--accent)
          cursor-pointer
        "
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-3xl font-bold font-(family-name:--font-display) text-(--background) drop-shadow-sm leading-none text-center px-4">
          {relativeLabel}
        </span>

        {lastFedByName && (
          <span className="mt-2 text-xs font-mono text-(--background)/80 px-4 text-center leading-tight">
            fed by {lastFedByName}
          </span>
        )}

        {absoluteLabel && (
          <span className="mt-1 text-[10px] font-mono text-(--background)/60 px-4 text-center leading-tight">
            {absoluteLabel}
          </span>
        )}

        <span className="mt-3 text-xs font-medium text-(--background)/70 uppercase tracking-widest">
          Tap to log
        </span>
      </button>
    </form>
  );
}
