import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import postgres from "postgres";

if (!process.env.MIGRATION_DATABASE_URL) {
  throw new Error("MIGRATION_DATABASE_URL is not set. Ensure .env.local exists and contains it.");
}

const sql = postgres(process.env.MIGRATION_DATABASE_URL!, { max: 1 });

(async () => {
  const rows = await sql<{ relname: string; relrowsecurity: boolean }[]>`
    select relname, relrowsecurity
    from pg_class
    where relname in ('households','household_members','pets','feedings')
    order by relname
  `;
  console.log("RLS verification:");
  for (const row of rows) {
    console.log(`  ${row.relname}: relrowsecurity = ${row.relrowsecurity}`);
  }
  const allEnabled = rows.every((r) => r.relrowsecurity === true);
  console.log(allEnabled ? "\nAll 4 tables have RLS enabled." : "\nWARNING: some tables missing RLS!");
  await sql.end();
})();
