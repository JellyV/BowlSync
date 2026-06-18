# BowlSync — Design Spec

> **Status:** Approved design (v1). Database schema is the next deliverable and is intentionally
> deferred to its own design step (see §7).
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

## 7. Data layer & tenancy (schema deferred to next step)

- Drizzle ORM over the Supabase **pooler** connection (serverless-safe).
- Multi-tenant from migration #1: **every `feedings` row carries `household_id`.**
- Tables (final shape decided in the DB-design step): `households`, `household_members`, `pets`,
  `feedings`.
- **Open decision deferred to DB design:** whether Supabase **RLS** is the *primary* security
  boundary (queries run as the user's JWT) or whether tenancy is enforced in application code with
  RLS as a backstop. This materially affects how Drizzle connects (user JWT vs. service role) and is
  the central question of the database design.

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

## 10. Operational

- **Keep-alive:** Vercel Cron hits `/api/keepalive` daily; the handler performs a trivial DB read so
  the Supabase free project never auto-pauses (free projects pause after 7 days of no DB activity).
  GitHub Action is the documented fallback if the app ever leaves Vercel.

## 11. Testing without hardware

The entire flow is exercisable by hitting `/fed` in a browser (type it, bookmark it, click the
in-app button) and confirming the DB updates and `/` reflects it. Adding the physical NTAG215 tag is
a final ~5-minute step: write the `/fed` URL onto it with a free NFC-writer app, tap, confirm it
triggers the exact same verified behavior.

## 12. Out of scope for v1

- PWA / "Add to Home Screen."
- Photo galleries, vaccination records, AI features, points/rewards.
- Native app (Capacitor, app stores).
- Multi-pet **UI** (schema must not preclude it; v1 UI assumes one pet, Nacho).
- Billing / subscriptions / premium tiers.
- Feeding-schedule / "next expected meal" prediction.

## 13. Suggested build order

1. Scaffold Next.js + shadcn/ui; connect Supabase (pooler); set up auth.
2. Drizzle schema + migrations + RLS policies (DB-design step decides the RLS model first).
3. Auth + onboarding (sign in, create/join household, set display name).
4. Core logging: `/fed` flow (POST-redirect-GET, 30-min duplicate guard, `?justFed` highlight).
5. Status page `/` (status line + recent-5 + tappable rows).
6. Edit / reassign / delete on entries.
7. History page with filters.
8. Keep-alive cron.
9. Instructions page + README polish (screenshots, architecture note, "judgment over complexity").
