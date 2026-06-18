"use server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { feedings } from "@/db/schema";
import { getUserContext } from "@/lib/auth-context";

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
