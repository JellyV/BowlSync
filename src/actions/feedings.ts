"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { feedings, householdMembers } from "@/db/schema";
import { getUserContext } from "@/lib/auth-context";
import { evaluateGuard } from "@/lib/duplicate-guard";

export async function insertFeeding(ctx: { householdId: string; petId: string; memberId: string }): Promise<string> {
  const [row] = await db.insert(feedings)
    .values({ householdId: ctx.householdId, petId: ctx.petId, fedBy: ctx.memberId })
    .returning({ id: feedings.id });
  return row.id;
}

export async function confirmLogFeeding(): Promise<void> {
  const ctx = await getUserContext();
  if (ctx.status !== "ready") redirect("/onboarding");
  const id = await insertFeeding({ householdId: ctx.household.id, petId: ctx.pet.id, memberId: ctx.member.id });
  redirect(`/?justFed=${id}`);
}

export async function logWithGuard(): Promise<
  { outcome: "logged"; id: string } | { outcome: "prompt"; minutesAgo: number; fedByName: string | null }
> {
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
    const id = await insertFeeding({ householdId: ctx.household.id, petId: ctx.pet.id, memberId: ctx.member.id });
    return { outcome: "logged", id };
  }
  return { outcome: "prompt", minutesAgo: decision.minutesAgo, fedByName: decision.fedByName };
}

export async function markFed(): Promise<void> {
  const result = await logWithGuard();
  if (result.outcome === "logged") {
    redirect(`/?justFed=${result.id}`);
  }
  redirect("/fed");
}

export async function editFeeding(input: { id: string; fedById?: string | null; fedAt?: Date }): Promise<void> {
  const ctx = await getUserContext();
  if (ctx.status !== "ready") redirect("/onboarding");
  await db.update(feedings)
    .set({
      ...(input.fedById !== undefined ? { fedBy: input.fedById } : {}),
      ...(input.fedAt ? { fedAt: input.fedAt } : {}),
    })
    .where(and(eq(feedings.id, input.id), eq(feedings.householdId, ctx.household.id)));
  revalidatePath("/");
}

export async function deleteFeeding(id: string): Promise<void> {
  const ctx = await getUserContext();
  if (ctx.status !== "ready") redirect("/onboarding");
  await db.delete(feedings).where(and(eq(feedings.id, id), eq(feedings.householdId, ctx.household.id)));
  revalidatePath("/");
}
