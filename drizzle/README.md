# Migrations — read before running `drizzle-kit generate`

The journal (`meta/_journal.json`) intentionally has a **gap at idx 1**: entries are
`0000` (initial tables) and `0002_add_pet_type`, with **no `0001` entry**.

`0001_enable_rls.sql` is a **hand-written** migration (RLS deny-by-default + the
`auth.users` FK) that is applied **out of band** by `src/db/apply-rls.ts`
(`npm run db:apply-rls`), not by the Drizzle migrator. It is deliberately absent
from the journal.

**Footgun:** because the journal's first entry is `0000`, a cold
`npm run db:generate` will emit a new file numbered `0001_*`, colliding with the
existing `0001_enable_rls.sql`. When you generate the next migration, **rename the
generated file (and its snapshot) to the next free number** (e.g. `0003_*`) and
align the new `_journal.json` entry's `idx`/`tag` accordingly before
`npm run db:migrate`.

## Setup order on a fresh database
1. `npm run db:migrate` — creates tables + applies tracked migrations.
2. `npm run db:apply-rls` — enables RLS + adds the `auth.users` FK (one-time).
