-- Applied directly via src/db/apply-rls.ts (NOT tracked in drizzle's journal).
-- Drizzle-kit does not auto-track hand-written SQL files; this file is applied
-- once using the one-off runner below.  Re-run safety notes:
--   ALTER TABLE ... ENABLE ROW LEVEL SECURITY  =>  idempotent (safe to re-run)
--   ALTER TABLE ... ADD CONSTRAINT             =>  NOT idempotent; will error on
--       re-run with "constraint already exists". Guard with a DO block if needed.

ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedings ENABLE ROW LEVEL SECURITY;
-- No policies granted to anon/authenticated => deny-by-default on the public PostgREST path.

ALTER TABLE household_members
  ADD CONSTRAINT household_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
