# BowlSync

**Did the dog get fed?**

Two people, one bowl, one dog. The dog gets fed. Then the other person comes home, sees the bowl, feeds the dog again. The dog loves this. The dog should not love this.

BowlSync solves that exact problem: a shared, glanceable log that answers "fed or not?" at a glance, with a 30-minute guard against accidental double-logs, and an NFC tag near the bowl so logging takes one tap.

---

## Screenshots

| Status page | History | Duplicate guard |
|---|---|---|
| ![Status page showing Bowl Gauge](docs/screenshots/status.png) | ![History page with date filters](docs/screenshots/history.png) | ![Duplicate-feed confirm prompt](docs/screenshots/confirm.png) |

> Screenshots are placeholders — add real ones to `docs/screenshots/` and update these paths.

---

## What it does

- **Tap the bowl tag → feeding logged.** An NFC sticker near the bowl opens `/fed` in the browser. If the dog was fed in the last 30 minutes you get a confirmation prompt; otherwise the feeding is logged automatically and you're taken to the status page.
- **Bowl Gauge** — a circular hero on the status page that shows time-since-fed and shifts color as time passes (sage green when fresh → clay orange when it's been a while). Glanceable from across the room.
- **Shared household** — one household, multiple members. Everyone signs in and sees the same log. The "fed by" attribution is always the person who tapped.
- **Edit, reassign, delete** — tap any row on the status page to correct the time or reassign who actually fed the dog. Accidental taps can be deleted.
- **Filterable history** — today / this week / custom date range.

### What it does not do

No feeding schedule, no reminders, no predictions, no native app, no billing. See the [design spec](docs/superpowers/specs/2026-06-18-bowlsync-design.md) for the full out-of-scope list.

---

## Stack and why

| Layer | Choice | Why |
|---|---|---|
| Frontend + backend | **Next.js 16 App Router** | Single codebase, server actions for mutations, React for the UI. |
| Hosting | **Vercel** | Zero-config Next.js deploys, built-in cron, good free tier. |
| Database + Auth | **Supabase** (hosted Postgres + Supabase Auth) | Managed Postgres, magic-link email auth, Google OAuth — all in one project. |
| ORM | **Drizzle** | Code-first schema (TypeScript → SQL migration files), typed queries, works cleanly with the Supabase connection pooler. |
| UI components | **shadcn/ui (Base UI edition) + Tailwind v4** | Accessible components with no runtime overhead; swappable theme tokens. |

### The tradeoff story

The goal here is demonstrated *judgment*, not complexity. A dog-feeding tracker does not need a message queue, a separate GraphQL layer, or a microservices architecture. It needs a tight loop from "tap" to "logged" with sensible tenancy and a clean schema.

**Cloudflare Workers + D1** was considered and rejected. D1 is an edge SQLite — fast, cheap, globally distributed. But Drizzle's D1 support is weaker than its Postgres support, and Supabase's Auth is better than building auth on top of Cloudflare Workers. For a product whose biggest challenge is **auth + multi-tenancy**, not global read latency, Vercel + Supabase is the better fit.

**Tenancy model:** RLS is enabled on all tables with deny-by-default (no policies for `anon` or `authenticated`) — this fully seals the public PostgREST path. Drizzle connects as the `postgres` role (which bypasses RLS) and every server action scopes queries to the signed-in user's `household_id`. The RLS layer is a backstop; the application layer is the real gate.

---

## Local setup

### Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone https://github.com/your-username/bowlsync.git
cd bowlsync
npm install
```

### 2. Set environment variables

Create `.env.local` (gitignored) from the example:

```bash
cp .env.example .env.local
```

Fill in the values. You'll find them in your Supabase project under **Settings → Data API** and **Settings → Database**:

```
# From Settings → Data API (Project URL + anon key)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# From Settings → Database → Connection string
# "Transaction pooler" (port 6543) — for app runtime queries
DATABASE_URL=postgresql://postgres.xxxx:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# "Session pooler" or "Direct connection" (port 5432) — for running migrations
MIGRATION_DATABASE_URL=postgresql://postgres.xxxx:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

The two connection strings differ by port: **6543** for the transaction pooler (serverless-safe) and **5432** for the direct/session connection (needed for DDL during migrations). Never run migrations through the transaction pooler — Drizzle can misbehave.

> **Security note:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` is intentionally public. It is the Supabase "publishable" key. The values that must stay secret are `DATABASE_URL`, `MIGRATION_DATABASE_URL`, and (if you use it) `SUPABASE_SERVICE_ROLE_KEY`. Never commit these.

### 3. Run database migrations

```bash
npm run db:migrate
```

This creates four tables (`households`, `household_members`, `pets`, `feedings`).

Then, enable Row Level Security:

```bash
npm run db:apply-rls
```

This enables deny-by-default RLS on all four tables and adds the `auth.users` foreign key. It runs the SQL in `drizzle/0001_enable_rls.sql` as a one-time step (not tracked in Drizzle's migration journal).

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

1. Push to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. Add the same env vars from `.env.local` in **Project → Settings → Environment Variables**. Use the production values (not localhost).
4. Deploy.

### Cron (keep-alive)

`vercel.json` includes a daily cron:

```json
{ "crons": [{ "path": "/api/keepalive", "schedule": "0 9 * * *" }] }
```

This hits `/api/keepalive` once a day, which runs a trivial `SELECT 1` to keep the Supabase free project from auto-pausing (free projects pause after 7 days of inactivity). No action needed — Vercel picks it up automatically on deploy.

### Google sign-in (optional)

Magic-link email sign-in works out of the box with no extra config. Google OAuth requires configuring a Google Cloud OAuth client and enabling the Google provider in **Supabase → Authentication → Providers**. The app UI shows a Google button regardless; it will fail gracefully if the provider is not configured.

---

## The NFC tag step

This is the five-minute finishing touch, not a hard requirement. The whole app works without hardware.

1. Buy a pack of blank NFC stickers (NTAG213 or NTAG215 — any size, widely available for a few dollars for a pack of ten).
2. Install [NFC Tools](https://www.wakdev.com/en/apps/nfc-tools.html) (free, iOS and Android).
3. Open NFC Tools → **Write** → **Add a record** → **URL**.
4. Enter your `/fed` URL (e.g. `https://your-bowlsync-app.vercel.app/fed`).
5. Tap your phone to the blank sticker. Done in about a second.
6. Stick it near the bowl.

When anyone taps the sticker with their phone, the browser opens `/fed` and the feeding is logged (or a confirmation prompt appears if the dog was fed recently). NFC stickers are completely passive — no battery, no connectivity of their own. They just store a URL.

---

## Design

See [docs/superpowers/specs/2026-06-18-bowlsync-design.md](docs/superpowers/specs/2026-06-18-bowlsync-design.md) for the full design spec: data model, tenancy approach, color tokens, typography choices, and the rationale behind every locked decision.

---

## License

MIT
