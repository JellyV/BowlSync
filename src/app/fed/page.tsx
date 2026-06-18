import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { feedings, householdMembers } from "@/db/schema";
import { getUserContext } from "@/lib/auth-context";
import { evaluateGuard } from "@/lib/duplicate-guard";
import { insertFeeding, confirmLogFeeding } from "@/actions/feedings";
import { formatRelative } from "@/lib/time";

export default async function FedPage() {
  const ctx = await getUserContext();
  if (ctx.status !== "ready") redirect("/onboarding");

  const last = await db
    .select({ fedAt: feedings.fedAt, fedByName: householdMembers.displayName })
    .from(feedings)
    .leftJoin(householdMembers, eq(householdMembers.id, feedings.fedBy))
    .where(and(eq(feedings.householdId, ctx.household.id), eq(feedings.petId, ctx.pet.id)))
    .orderBy(desc(feedings.fedAt))
    .limit(1);

  const decision = evaluateGuard(last[0] ?? null, new Date());

  if (decision.action === "log") {
    const id = await insertFeeding({
      householdId: ctx.household.id,
      petId: ctx.pet.id,
      memberId: ctx.member.id,
    });
    redirect(`/?justFed=${id}`);
  }

  // Within 30-min window: show confirm prompt — no write on this render.
  return (
    <main className="flex min-h-screen items-center justify-center px-4 bg-[var(--background)]">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-[var(--foreground)]/20 bg-[var(--background)] p-8 text-center">
        <div className="space-y-2">
          <h1 className="text-xl font-[family-name:var(--font-display)] font-semibold text-[var(--ink)]">
            Already fed?
          </h1>
          <p className="text-sm text-[var(--foreground)]">
            {ctx.pet.name} was fed {formatRelative(last[0].fedAt)} by{" "}
            {decision.fedByName ?? "someone"}.
          </p>
        </div>

        <form action={confirmLogFeeding} className="space-y-3">
          <button
            type="submit"
            className="
              w-full rounded-lg bg-[var(--ink)] px-4 py-2.5
              text-sm font-medium text-[var(--background)]
              hover:opacity-90 active:opacity-80
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]
              transition-opacity
            "
          >
            Log another feeding
          </button>
        </form>

        <a
          href="/"
          className="
            block text-sm text-[var(--foreground)] underline underline-offset-2
            hover:text-[var(--ink)]
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]
            transition-colors
          "
        >
          Cancel
        </a>
      </div>
    </main>
  );
}
