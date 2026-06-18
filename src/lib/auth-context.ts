import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { householdMembers, households, pets } from "@/db/schema";
import { createServerSupabase } from "@/lib/supabase/server";

export async function getUserContext() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const member = await db.query.householdMembers.findFirst({
    where: eq(householdMembers.userId, user.id),
  });
  if (!member) return { userId: user.id, status: "no-membership" as const };

  const household = await db.query.households.findFirst({
    where: eq(households.id, member.householdId),
  });
  const pet = await db.query.pets.findFirst({
    where: eq(pets.householdId, member.householdId),
  });
  return { userId: user.id, status: "ready" as const, member, household: household!, pet: pet! };
}
