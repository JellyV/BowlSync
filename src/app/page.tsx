import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { feedings, householdMembers } from "@/db/schema";
import { getUserContext } from "@/lib/auth-context";
import { BowlGauge } from "@/components/bowl-gauge";
import { RecentList } from "@/components/recent-list";
import { ClearJustFed } from "@/components/clear-just-fed";
import { SiteHeader } from "@/components/site-header";
import { MemberAvatars } from "@/components/member-avatars";
import { getAnimal } from "@/lib/animals";

interface PageProps {
  searchParams: Promise<{ justFed?: string }>;
}

export default async function StatusPage({ searchParams }: PageProps) {
  const ctx = await getUserContext();
  if (ctx.status === "no-membership") redirect("/onboarding");

  const sp = await searchParams;
  const justFed = sp.justFed ?? null;

  const [rows, members] = await Promise.all([
    db
      .select({ id: feedings.id, fedAt: feedings.fedAt, fedByName: householdMembers.displayName, fedById: feedings.fedBy })
      .from(feedings)
      .leftJoin(householdMembers, eq(householdMembers.id, feedings.fedBy))
      .where(eq(feedings.householdId, ctx.household.id))
      .orderBy(desc(feedings.fedAt))
      .limit(5),
    db
      .select({ id: householdMembers.id, displayName: householdMembers.displayName })
      .from(householdMembers)
      .where(eq(householdMembers.householdId, ctx.household.id)),
  ]);

  const lastFedAt = rows[0]?.fedAt ?? null;
  const lastFedByName = rows[0]?.fedByName ?? null;

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen flex-col items-center justify-start gap-10 px-4 py-12 bg-(--background)">
      <header className="w-full max-w-sm">
        <h1 className="text-2xl font-bold font-(family-name:--font-display) text-(--ink) text-center">
          {ctx.pet.name}{getAnimal(ctx.pet.type)?.emoji ? (
            <span className="emoji ml-2">{getAnimal(ctx.pet.type)!.emoji}</span>
          ) : null}
        </h1>
        <Link
          href="/household"
          aria-label={`${ctx.household.name} — members and invites`}
          className="
            mt-1.5 flex flex-col items-center gap-2 rounded-lg
            hover:opacity-75 transition-opacity
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)
          "
        >
          <p className="text-sm text-center text-(--foreground) font-mono">
            {ctx.household.name}
          </p>
          <MemberAvatars members={members} withAdd />
        </Link>
      </header>

      <BowlGauge
        lastFedAt={lastFedAt}
        lastFedByName={lastFedByName}
        petName={ctx.pet.name}
        petType={ctx.pet.type ?? undefined}
      />

      <ClearJustFed />

      <RecentList rows={rows} justFed={justFed} members={members} />
      </main>
    </>
  );
}
