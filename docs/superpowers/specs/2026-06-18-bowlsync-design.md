# BowlSync — Design Spec

> **Status:** Approved design (v1), including the full database design (§7). Ready to build.
>
> **Date:** 2026-06-18
> **Source:** `FED_NACHO_SPEC.md` (original product brief), refined through brainstorming.

---

## 1. What this is

BowlSync is a free, open-source web app that logs dog feedings via an NFC tap (or an in-app
button), shows a shared glanceable status ("Nacho was last fed 2 hours ago by Alex"), and keeps a
filterable feeding history. It exists to solve one real problem: two roommates coordinating feeding
an 11-week-old Texas Heeler named Nacho without double-feeding or forgetting.

It is **one shared hosted instance**, multi-tenant by household. The owner hosts it once; everyone
else just signs up and uses it. No user ever deploys anything.

**Portfolio framing:** the value is demonstrated *judgment*, not complexity — sensible architecture
with defensible tradeoffs, real end-user design (including non-coders), a complete shipped product,
and knowing what *not* to build.

## 2. Decisions locked in this design

| Decision | Choice | Notes |
|---|---|---|
| Auth | Supabase Auth: **magic link + Google** | Minimize password friction; long-lived sessions. |
| Query layer | **Drizzle ORM** over the Supabase pooler | Typed, LINQ-like, real migration files. |
| Schema workflow | **Code-first** (Drizzle schema-as-code → `generate` → `migrate`) | Code is the single source of truth; **no schema edits in the Supabase dashboard** (drift = the one thing to avoid). See §7. |
| Tenancy / RLS | **App-enforced + RLS backstop** (Option B) | Drizzle connects as `postgres` (bypasses RLS) and scopes every query by household; RLS enabled deny-by-default to seal the public PostgREST path. See §7. |
| Attribution | **Always the logged-in user** | One shared `/fed` tag, no `?owner=` param, no name-picker, no guest handling. Reassign later via edit. |
| Duplicate guard | **30-minute window, with prompt** | Within 30 min → "are you sure?" prompt; never silent-drop. |
| Feeding schedule | **Out of scope for v1** | No "next expected meal" prediction. |
| Highlight just-fed entry | **Explicit one-shot ID via redirect** | `/?justFed=<id>`, cleared from URL after first paint. |
| Keep-alive | **Vercel Cron** → `/api/keepalive` | Daily trivial DB read; GitHub Action is the fallback. |

## 3. Stack

- **Frontend + backend:** Next.js (App Router), React, **shadcn/ui** components.
- **Hosting:** Vercel.
- **Database + Auth:** Supabase (hosted Postgres + Supabase Auth). Use the Supabase **connection
  pooler** string from serverless functions.
- **ORM:** Drizzle (schema-as-code + migrations).

The NFC tag has **zero hard dependency on the code** — its entire job is to open a URL. The whole
app is buildable and fully testable by opening URLs / clicking buttons. The physical tag is a
~5-minute write step at the very end.

## 4. Route structure

| Route | Type | Job |
|---|---|---|
| `/` | GET (read-only) | Glanceable status page. Last-fed headline, recent-5 list, "View all history →". Safe to refresh infinitely. |
| `/fed` | GET → server logic | NFC tag target. Checks for a recent feeding; if clear, auto-logs (POST) and redirects to `/?justFed=<id>`; if one exists <30 min ago, renders the confirm prompt instead. |
| `/history` | GET | Full all-time history with today / this week / custom-range filters. |
| `/login` | GET | Magic link + Google sign-in. Honors `?next=` so an unauthenticated tap returns to `/fed` after sign-in. |
| `/auth/callback` | route handler | Supabase auth code exchange. |
| `/onboarding` | GET/action | Create household **or** join via invite code; set display name. |
| `/instructions` | static | Non-coder setup guide. |
| `/api/keepalive` | route handler | Cron target; trivial DB read to prevent Supabase auto-pause. |

**Server actions** (not pages): `logFeeding`, `confirmLogFeeding`, `editFeeding` (reassign who /
change time), `deleteFeeding`.

## 5. The logging flow (core)

```
Tap shared tag → GET /fed
   │
   ├─ Not signed in?            → redirect /login?next=/fed → (sign in) → back to /fed
   ├─ Signed in, no household?  → redirect /onboarding
   │
   └─ Signed in + in a household:
         server reads most recent feeding for this pet
            │
            ├─ none in last 30 min → auto-POST logFeeding (no click)
            │                         → 303 redirect to /?justFed=<id>
            │
            └─ one < 30 min ago   → render confirm page:
                  "Nacho was fed 8 min ago by Alex. Log another?"
                  [Confirm] → POST confirmLogFeeding → 303 redirect to /?justFed=<id>
                  [Cancel]  → 303 redirect to /            (nothing logged)
```

### Invariants this flow guarantees

1. **No write ever happens on a plain GET render.** The auto-log is a POST issued on load
   (POST-redirect-GET); the browser's final URL is always `/` (a pure read). Pull-to-refresh, back
   button, and link preloaders cannot create phantom feedings.
2. **Attribution is always `auth.uid()`.** `fed_by` is the signed-in user's household member, never a
   URL param. Wrong-person fixes happen via edit/reassign.
3. **Duplicate guard prompts, never silently drops.** A genuine second meal still gets through on
   Confirm. The window is 30 minutes.

## 6. Status page (`/`) contents, top to bottom

1. **Current status line** — the glanceable headline: "Nacho was last fed 2 hours ago by Alex,"
   with the absolute time alongside the relative one. Most prominent element on the page.
2. **Recent feedings list** — the last **5** feedings for the pet, newest at top. The just-added
   entry (identified by `?justFed=<id>`) is visually highlighted (subtle background / "just now"
   badge / brief flash). It is **not** floated as a separate element above the list — it is simply
   the highlighted top row of this same list.
   - **Each row is tappable to edit that row** (consistent gesture). The editor lets the user:
     - **Reassign who fed** (to another household member),
     - **Change the time** (quick relative options "just now / 15 min ago / 30 min ago" + manual
       picker fallback),
     - **Delete the entry** (for phantom/accidental logs).
   - Editing applies to **any** row, not just the newest.
3. **"View all history →"** link/button — to the separate `/history` page.

### Just-fed highlight mechanism

`/fed` writes the row, then redirects to `/?justFed=<id>`. The status page reads the param,
highlights exactly that row, then a small client effect strips the param from the URL
(`history.replaceState`) after first paint. This means:

- The highlight reflects **the action the user just took**, not whatever is merely recent (a
  roommate's feeding from 40s ago will not falsely light up).
- `/` stays a **pure read** — `?justFed` is only a render hint, never triggers a write.
- A later manual refresh of `/` shows a clean page with no stale highlight.

## 7. Database design

### 7.1 Approach: code-first

Schema lives as Drizzle **schema-as-code** in TypeScript (`schema.ts`) and is the **single source of
truth**. Workflow: edit `schema.ts` → `drizzle-kit generate` (emits a reviewable SQL migration file)
→ `drizzle-kit migrate` (applies it). We use `generate` + `migrate` (real migration files), **not**
`push`, for reproducible, reviewable history.

**Cardinal rule: never hand-edit the schema in the Supabase dashboard.** The dashboard is for
*viewing* data only; the code is the only thing that *shapes* it. Dashboard edits cause drift that
breaks migrations.

A few Supabase-specific things naturally live as **raw SQL inside migration files** rather than as
Drizzle table objects: **RLS enablement/policies, the `auth` schema, and any triggers.** That is
still code-first (versioned SQL in the repo), just not expressed as TS.

### 7.2 Tenancy model (Option B — app-enforced + RLS backstop)

The browser never queries our tables — all data access is server-side via Drizzle in Next.js server
actions / route handlers. So:

- **RLS is ENABLED on all four tables with NO policies granted to `anon`/`authenticated`** →
  deny-by-default fully seals the public PostgREST path (the anon key cannot read/write our tables).
- **Drizzle connects as the `postgres` role, which bypasses RLS**, and is our single enforcement
  point: every server action resolves the signed-in user → their `household_id` → and always filters
  by it. Funnel all access through a few helpers so the `where household_id = …` is never forgotten.

Multi-tenant from migration #1: **every `feedings` row carries `household_id`** (denormalized on
purpose — tenancy boundary + indexing).

### 7.3 Tables

All IDs are `uuid` (default `gen_random_uuid()`); all timestamps are `timestamptz`.

**`households`**

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | not null |
| `invite_code` | text | not null, **unique** (short code for joining; regenerable) |
| `created_at` | timestamptz | not null, default `now()` |

**`household_members`** — links a Supabase `auth.users` row to a household; carries the display name shown as "fed by".

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `household_id` | uuid | not null, FK → `households(id)` **on delete cascade** |
| `user_id` | uuid | not null, FK → `auth.users(id)` **on delete cascade**, **unique** |
| `display_name` | text | not null |
| `created_at` | timestamptz | not null, default `now()` |

> `user_id` unique → **one household per user in v1**. Multi-household membership is out of scope;
> relax by dropping the unique constraint later.

**`pets`**

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `household_id` | uuid | not null, FK → `households(id)` **on delete cascade** |
| `name` | text | not null (e.g. "Nacho") |
| `created_at` | timestamptz | not null, default `now()` |

> v1 UI assumes one pet per household; the table makes multi-pet trivial later. Onboarding
> **auto-creates a "Nacho" pet** when a household is created.

**`feedings`** — the core log.

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid | PK |
| `household_id` | uuid | not null, FK → `households(id)` **on delete cascade** (denormalized tenancy key) |
| `pet_id` | uuid | not null, FK → `pets(id)` **on delete cascade** |
| `fed_by` | uuid | **nullable**, FK → `household_members(id)` **on delete set null** (preserve history if a member leaves → show "Unknown") |
| `fed_at` | timestamptz | not null, default `now()` — **the feeding time; editable** |
| `created_at` | timestamptz | not null, default `now()` — row insert time; audit, not editable |

> `fed_by` references `household_members(id)` (not `auth.users`) so reassignment picks among
> household members and display-name changes flow through automatically.

### 7.4 Indexes

- `feedings (household_id, fed_at desc)` — the workhorse: powers recent-5, history, and the
  duplicate-guard lookup.
- Uniques already cover the rest: `households.invite_code`, `household_members.user_id`.
- A separate `(pet_id, fed_at desc)` index is **deliberately deferred** — the table holds at most
  thousands of rows ever; add it only if/when multi-pet ships. (Intentional non-over-indexing.)

### 7.5 Key queries

**Duplicate guard (on `/fed`):**
```sql
SELECT * FROM feedings
WHERE household_id = $1 AND pet_id = $2
ORDER BY fed_at DESC
LIMIT 1;
-- app compares fed_at to now(); if < 30 min ago → prompt, else auto-log
```

**Recent-5 (status page) / history (same shape + filters):**
```sql
SELECT f.*, m.display_name FROM feedings f
LEFT JOIN household_members m ON m.id = f.fed_by
WHERE f.household_id = $1
ORDER BY f.fed_at DESC
LIMIT 5;
```

### 7.6 Not needed as tables (completeness check)

- **Users / sessions** → provided by Supabase (`auth.users`, Supabase Auth).
- **Invite codes** → a column on `households` (one regenerable code). A separate `household_invites`
  table (multiple codes / expiry / single-use) is YAGNI for v1.
- **Settings / schedule** → none (feeding-schedule is out of scope).
- **Drizzle migration bookkeeping** (`__drizzle_migrations`) → auto-managed by Drizzle.

### 7.7 Connections & environment variables

Two connection strings (a known-good Drizzle + Supabase split):

| Purpose | Connection | Env var |
|---|---|---|
| **Migrations** (DDL) | Direct / session connection, port **5432** | `MIGRATION_DATABASE_URL` |
| **App runtime** (serverless queries) | Transaction pooler, port **6543** | `DATABASE_URL` |

> Running DDL through the transaction pooler can misbehave; use the direct/session connection for
> migrations and the transaction pooler for runtime.

Full env var set (values in `.env.local`, never committed — see §10):

```
NEXT_PUBLIC_SUPABASE_URL=        # client auth
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # client auth (public by design)
DATABASE_URL=                    # transaction pooler (6543) — runtime
MIGRATION_DATABASE_URL=          # direct/session (5432) — migrations
SUPABASE_SERVICE_ROLE_KEY=       # server-only, if needed for admin auth ops (never NEXT_PUBLIC_)
```

### 7.8 Setup workflow (how the DB gets created)

1. **User** creates a new Supabase project in the dashboard (~2 min) and pastes the values above into
   `d:/Projects/BowlSync/.env.local`.
2. **Agent** writes the Drizzle `schema.ts`, `drizzle.config.ts`, and the RLS-enable SQL.
3. Run `drizzle-kit generate` then `drizzle-kit migrate` → the four tables + RLS appear in Supabase.

No Supabase access token or MCP server required; secrets stay in `.env.local`. (Supabase MCP is an
optional alternative but grants broader access than needed — not used.)

## 8. Auth & sessions

- Supabase Auth: magic link + Google.
- **Long-lived sessions** so a user signs in once per phone browser and stays signed in; the NFC
  tap then lands in an already-authenticated browser and logs seamlessly.
- Unauthenticated edge case handled gracefully: a tap on `/fed` while signed out captures the intended
  destination (`?next=/fed`), routes to `/login`, and returns the user to `/fed` after sign-in so the
  action completes — never a raw error.

## 9. Onboarding

- Sign in (magic link / Google).
- **Create a household** (name it) **or join an existing one** via an invite code/link.
- Set your **display name** (the name shown as "fed by").
- One household = one shared feeding log; roommates join the same household.
- Invite-code mechanics (generation, redemption, expiry) to be detailed in the implementation plan.

## 10. Secrets & public-repo hygiene

This repo is intended to go **public** later, so secrets must never enter git history from commit #1
(scrubbing history after the fact is painful; prevention is free).

**The rule:** secrets live in `.env.local` (gitignored by Next.js default) and in **Vercel
environment variables** for production. They never appear in the repo. Commit a `.env.example` with
keys but no values so cloners know what to fill in.

**Not all Supabase keys are secret** — this is by design and is why RLS is our security boundary:

| Value | Secret? | Where it goes |
|---|---|---|
| anon / publishable key | ❌ Public by design | `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ships to browser — fine) |
| Project URL | ❌ Not secret | `NEXT_PUBLIC_SUPABASE_URL` |
| service_role key | 🔴 Top secret (bypasses RLS) | server-only env var, never `NEXT_PUBLIC_`, never in repo |
| DB connection string (pooler) | 🔴 Secret (contains DB password) | server-only env var, never in repo |

Anything prefixed `NEXT_PUBLIC_` is public by definition — only put genuinely-public values there.
The anon key being visible in a public repo or browser is **not** a leak; RLS is what protects data.
The values that must never leak are the **service_role key** and the **DB connection string**.

**Rotation is cleanup, not the plan.** Never commit secrets in the first place. Roll the service_role
key / reset the DB password in the Supabase dashboard only if a secret slips into a commit, or as a
belt-and-suspenders step right before flipping the repo public.

**Before going public:** enable GitHub secret scanning / push protection (free on public repos);
optionally add a local `gitleaks` pre-commit hook.

## 11. Operational

- **Keep-alive:** Vercel Cron hits `/api/keepalive` daily; the handler performs a trivial DB read so
  the Supabase free project never auto-pauses (free projects pause after 7 days of no DB activity).
  GitHub Action is the documented fallback if the app ever leaves Vercel.

## 12. Testing without hardware

The entire flow is exercisable by hitting `/fed` in a browser (type it, bookmark it, click the
in-app button) and confirming the DB updates and `/` reflects it. Adding the physical NTAG215 tag is
a final ~5-minute step: write the `/fed` URL onto it with a free NFC-writer app, tap, confirm it
triggers the exact same verified behavior.

## 13. Out of scope for v1

- PWA / "Add to Home Screen."
- Photo galleries, vaccination records, AI features, points/rewards.
- Native app (Capacitor, app stores).
- Multi-pet **UI** (schema must not preclude it; v1 UI assumes one pet, Nacho).
- Billing / subscriptions / premium tiers.
- Feeding-schedule / "next expected meal" prediction.

## 14. Suggested build order

1. Scaffold Next.js + shadcn/ui; connect Supabase (pooler); set up auth.
2. Drizzle schema (§7.3) + migrations + RLS enablement (deny-by-default, §7.2).
3. Auth + onboarding (sign in, create/join household, set display name).
4. Core logging: `/fed` flow (POST-redirect-GET, 30-min duplicate guard, `?justFed` highlight).
5. Status page `/` (status line + recent-5 + tappable rows).
6. Edit / reassign / delete on entries.
7. History page with filters.
8. Keep-alive cron.
9. Instructions page + README polish (screenshots, architecture note, "judgment over complexity").
