import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

export const households = pgTable("households", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const householdMembers = pgTable("household_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  // userId references auth.users(id); FK added via raw SQL in Task 5 (Drizzle does not model the auth schema).
  userId: uuid("user_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pets = pgTable("pets", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const feedings = pgTable("feedings", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  petId: uuid("pet_id").notNull().references(() => pets.id, { onDelete: "cascade" }),
  fedBy: uuid("fed_by").references(() => householdMembers.id, { onDelete: "set null" }),
  fedAt: timestamp("fed_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("feedings_household_fed_at_idx").on(t.householdId, t.fedAt.desc())]);

export type Feeding = typeof feedings.$inferSelect;
export type HouseholdMember = typeof householdMembers.$inferSelect;
export type Pet = typeof pets.$inferSelect;
export type Household = typeof households.$inferSelect;
