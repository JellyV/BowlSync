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

export async function createHousehold(input: { householdName: string; displayName: string; petName: string }) {
  const userId = await requireUserId();
  const [household] = await db.insert(households)
    .values({ name: input.householdName, inviteCode: generateInviteCode() })
    .returning();
  await db.insert(householdMembers)
    .values({ householdId: household.id, userId, displayName: input.displayName });
  await db.insert(pets).values({ householdId: household.id, name: input.petName });
  redirect("/");
}

export async function joinHousehold(input: { inviteCode: string; displayName: string }): Promise<{ error?: string }> {
  const userId = await requireUserId();
  const household = await db.query.households.findFirst({
    where: eq(households.inviteCode, input.inviteCode.toUpperCase().trim()),
  });
  if (!household) return { error: "We couldn't find a household with that code. Check it and try again." };
  await db.insert(householdMembers)
    .values({ householdId: household.id, userId, displayName: input.displayName });
  redirect("/");
}
