import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { householdMembers } from "@/db/schema";
import { getUserContext } from "@/lib/auth-context";
import { SiteHeader } from "@/components/site-header";
import { AvatarCircle } from "@/components/member-avatars";
import { InviteCard } from "@/components/invite-card";

export const metadata = {
  title: "Your household",
  description: "See who's in your household and invite someone new.",
};

export default async function HouseholdPage() {
  const ctx = await getUserContext();
  if (ctx.status === "no-membership") redirect("/onboarding");

  const members = await db
    .select({ id: householdMembers.id, displayName: householdMembers.displayName })
    .from(householdMembers)
    .where(eq(householdMembers.householdId, ctx.household.id))
    .orderBy(asc(householdMembers.createdAt));

  const since = ctx.household.createdAt.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen flex-col items-center justify-start px-4 py-10 bg-(--background)">
        <div className="w-full max-w-sm space-y-6">
          <Link
            href="/"
            className="
              inline-flex items-center gap-1.5 text-sm text-(--foreground)
              hover:text-(--ink) transition-colors rounded-md
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)
            "
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to status
          </Link>

          <header className="text-center space-y-1">
            <h1 className="text-2xl font-bold font-(family-name:--font-display) text-(--ink)">
              {ctx.household.name}
            </h1>
            <p className="text-xs font-mono text-(--foreground)">
              Feeding {ctx.pet.name} together since {since}
            </p>
          </header>

          <section
            className="rounded-xl border border-(--foreground)/20 bg-(--background) p-5 space-y-3"
            aria-label="Household members"
          >
            <h2 className="text-xs font-semibold font-mono uppercase tracking-wide text-(--foreground)">
              Members · {members.length}
            </h2>
            <ul className="space-y-2">
              {members.map((m, i) => (
                <li key={m.id} className="flex items-center gap-3">
                  <AvatarCircle name={m.displayName} index={i} className="h-8 w-8 text-[13px]" />
                  <span className="flex-1 text-sm text-(--ink)">{m.displayName}</span>
                  {m.id === ctx.member.id && (
                    <span className="rounded-full bg-(--accent)/35 px-2 py-0.5 text-[10px] font-mono text-(--ink)">
                      YOU
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <InviteCard
            code={ctx.household.inviteCode}
            petName={ctx.pet.name}
            householdName={ctx.household.name}
          />
        </div>
      </main>
    </>
  );
}
