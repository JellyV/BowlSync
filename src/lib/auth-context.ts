import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { householdMembers, households, pets } from "@/db/schema";
import { createServerSupabase } from "@/lib/supabase/server";

export const getUserContext = cache(async function getUserContext() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const member = await db.query.householdMembers.findFirst({
    where: eq(householdMembers.userId, user.id),
  });
  if (!member) return { userId: user.id, status: "no-membership" as const };

  const [household, pet] = await Promise.all([
    db.query.households.findFirst({ where: eq(households.id, member.householdId) }),
    db.query.pets.findFirst({ where: eq(pets.householdId, member.householdId) }),
  ]);
  if (!household || !pet) return { userId: user.id, status: "no-membership" as const };
  return { userId: user.id, status: "ready" as const, member, household, pet };
});
