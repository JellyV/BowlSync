import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/auth-context";
import { logWithGuard, confirmLogFeeding } from "@/actions/feedings";
import { formatRelative } from "@/lib/time";

export default async function FedPage() {
  const result = await logWithGuard();

  if (result.outcome === "logged") {
    redirect(`/?justFed=${result.id}`);
  }

  // Within 30-min window: show confirm prompt — no write on this render.
  const { minutesAgo, fedByName } = result;

  // Need pet name for copy. getUserContext() is wrapped with React.cache(),
  // so this second call is deduped — no extra Supabase or DB round-trips.
  const ctx = await getUserContext();
  const petName = ctx.status === "ready" ? ctx.pet.name : "Your pet";

  const relativeTime = minutesAgo < 1 ? "just now" : minutesAgo < 60 ? `${minutesAgo} min ago` : `${Math.floor(minutesAgo / 60)}h ago`;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 bg-(--background)">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-(--foreground)/20 bg-(--background) p-8 text-center">
        <div className="space-y-2">
          <h1 className="text-xl font-(family-name:--font-display) font-semibold text-(--ink)">
            Already fed?
          </h1>
          <p className="text-sm text-(--foreground)">
            {petName} was fed {relativeTime} by{" "}
            {fedByName ?? "someone"}.
          </p>
        </div>

        <form action={confirmLogFeeding} className="space-y-3">
          <button
            type="submit"
            className="
              w-full rounded-lg bg-(--ink) px-4 py-2.5
              text-sm font-medium text-(--background)
              hover:opacity-90 active:opacity-80
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)
              transition-opacity
            "
          >
            Log another feeding
          </button>
        </form>

        <a
          href="/"
          className="
            block text-sm text-(--foreground) underline underline-offset-2
            hover:text-(--ink)
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)
            transition-colors
          "
        >
          Cancel
        </a>
      </div>
    </main>
  );
}
