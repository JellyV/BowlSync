/**
 * One-off runner: applies drizzle/0001_enable_rls.sql directly via
 * MIGRATION_DATABASE_URL (direct/session connection, port 5432).
 *
 * This script exists because drizzle-kit only tracks files registered in its
 * journal; hand-written SQL files are NOT auto-picked-up.  Keep this script
 * committed so the RLS setup is reproducible.
 *
 * Usage:
 *   npx tsx src/db/apply-rls.ts
 *
 * Re-run safety:
 *   ENABLE ROW LEVEL SECURITY is idempotent — safe to re-run.
 *   ADD CONSTRAINT will fail with "already exists" on a second run.
 *   Run this script once against a fresh DB, or guard the constraint with a
 *   DO $$ ... $$ block if you need idempotency.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { readFileSync } from "fs";
import { join } from "path";
import postgres from "postgres";

const sqlFile = join(process.cwd(), "drizzle", "0001_enable_rls.sql");
const rawSql = readFileSync(sqlFile, "utf8");

// Remove all single-line comments (-- ...) and then extract non-empty statements.
const stripped = rawSql.replace(/--[^\n]*/g, "");
const statements = stripped
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((s) => s + ";");

if (!process.env.MIGRATION_DATABASE_URL) {
  throw new Error("MIGRATION_DATABASE_URL is not set. Ensure .env.local exists and contains it.");
}

const sql = postgres(process.env.MIGRATION_DATABASE_URL!, { max: 1 });

(async () => {
  for (const stmt of statements) {
    console.log("Executing:", stmt.slice(0, 100).replace(/\s+/g, " "));
    await sql.unsafe(stmt);
  }

  await sql.end();
  console.log("RLS migration applied successfully.");
})();
