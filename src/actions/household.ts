"use server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { households, householdMembers, pets } from "@/db/schema";
import { createServerSupabase } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/invite-code";

async function requireUserId() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user.id;
}

export async function createHousehold(input: { householdName: string; displayName: string; petName: string; petType: string }) {
  const userId = await requireUserId();

  // Guard: if the user already belongs to a household, they shouldn't be on onboarding.
  const existing = await db.query.householdMembers.findFirst({
    where: eq(householdMembers.userId, userId),
  });
  if (existing) redirect("/");

  await db.transaction(async (tx) => {
    const [household] = await tx.insert(households)
      .values({ name: input.householdName, inviteCode: generateInviteCode() })
      .returning();
    await tx.insert(householdMembers)
      .values({ householdId: household.id, userId, displayName: input.displayName });
    await tx.insert(pets).values({ householdId: household.id, name: input.petName, type: input.petType });
  });

  // redirect() throws a special Next.js error; it must be outside the transaction
  // so it is not caught as a transaction failure and does not trigger a rollback.
  redirect("/");
}

export async function joinHousehold(input: { inviteCode: string; displayName: string }): Promise<{ error?: string }> {
  const userId = await requireUserId();

  // Guard: prevent duplicate membership (householdMembers.userId is UNIQUE).
  const existing = await db.query.householdMembers.findFirst({
    where: eq(householdMembers.userId, userId),
  });
  if (existing) return { error: "You're already part of a household." };

  const household = await db.query.households.findFirst({
    where: eq(households.inviteCode, input.inviteCode.toUpperCase().trim()),
  });
  if (!household) return { error: "We couldn't find a household with that code. Check it and try again." };

  await db.insert(householdMembers)
    .values({ householdId: household.id, userId, displayName: input.displayName });
  redirect("/");
}
