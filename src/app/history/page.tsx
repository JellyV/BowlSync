import { redirect } from "next/navigation";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { feedings, householdMembers } from "@/db/schema";
import { getUserContext } from "@/lib/auth-context";
import { FeedingRow } from "@/components/feeding-row";
import { HistoryFilters } from "@/components/history-filters";
import { SiteHeader } from "@/components/site-header";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}

function isValidDate(d: Date): boolean {
  return !isNaN(d.getTime());
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const ctx = await getUserContext();
  if (ctx.status === "no-membership") redirect("/onboarding");

  const sp = await searchParams;
  const range = sp.range ?? "all";

  // Build date bounds — all times are UTC-aware via the DB timestamps
  const dateBounds: ReturnType<typeof gte>[] = [];

  if (range === "today") {
    // Start of today in local time (server local; acceptable for a pet-feeding app)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    dateBounds.push(gte(feedings.fedAt, todayStart));
  } else if (range === "week") {
    // Last 7 days: start of today-minus-6 days
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);
    dateBounds.push(gte(feedings.fedAt, weekStart));
  } else if (range === "custom") {
    if (sp.from) {
      const fromDate = new Date(sp.from);
      if (isValidDate(fromDate)) dateBounds.push(gte(feedings.fedAt, fromDate));
    }
    if (sp.to) {
      const toDate = new Date(sp.to);
      // Extend to end-of-day so the "to" date is inclusive
      if (isValidDate(toDate)) {
        toDate.setHours(23, 59, 59, 999);
        dateBounds.push(lte(feedings.fedAt, toDate));
      }
    }
  }
  // "all" → no additional bounds

  const [rows, members] = await Promise.all([
    db
      .select({
        id: feedings.id,
        fedAt: feedings.fedAt,
        fedByName: householdMembers.displayName,
        fedById: feedings.fedBy,
      })
      .from(feedings)
      .leftJoin(householdMembers, eq(householdMembers.id, feedings.fedBy))
      .where(and(eq(feedings.householdId, ctx.household.id), ...dateBounds))
      .orderBy(desc(feedings.fedAt))
      .limit(500),
    db
      .select({ id: householdMembers.id, displayName: householdMembers.displayName })
      .from(householdMembers)
      .where(eq(householdMembers.householdId, ctx.household.id)),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen flex-col items-center justify-start gap-8 px-4 py-12 bg-(--background)">
      <header className="w-full max-w-sm">
        <h1 className="text-2xl font-bold font-(family-name:--font-display) text-(--ink) text-center">
          History
        </h1>
        <p className="text-xs text-center text-(--foreground) mt-1 font-mono">
          {ctx.household.name}
        </p>
      </header>

      <Suspense>
        <HistoryFilters activeRange={range} from={sp.from} to={sp.to} />
      </Suspense>

      <section className="w-full max-w-sm">
        {rows.length === 0 ? (
          <p className="text-sm text-(--foreground) text-center py-8">
            No feedings in this range.
          </p>
        ) : (
          <div className="space-y-1.5">
            {rows.map((row) => (
              <FeedingRow key={row.id} row={row} justFed={null} members={members} />
            ))}
          </div>
        )}
      </section>
      </main>
    </>
  );
}
