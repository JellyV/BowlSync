# BowlSync 🐾

One shared answer to "did anyone feed the dog?"

**[Live app](https://bowl-sync.vercel.app)**

<p align="center">
  <img src="docs/screenshots/home-mobile.png" alt="BowlSync home screen on a phone: a circular gauge showing the dog was fed 30 minutes ago and by whom, with the household name above and recent feedings below" width="320">
</p>

## Why this exists

My dog Nachoie never turns down a second dinner. If you feed him and someone
else walks into the kitchen twenty minutes later, he will stare at them like
he hasn't eaten in days, and they will believe him. For a while our household
ran on "did you feed him?" texts. Sometimes nobody answered. He either got fed
twice or waited longer than he should have.

BowlSync replaces that group-chat question with a page anyone in the household
can glance at. It shows when the last feeding happened and who did it. Logging
a new one takes a single tap, and if a feeding was already logged in the past
30 minutes, the app asks you to confirm before recording another. Most double
feedings get caught right there.

## How you use it

- Sign in with an email magic link. There are no passwords.
- Start a household, then share its invite code with everyone who feeds the
  pet. All members write to the same log.
- Log feedings whichever way fits: stick an NFC tag near the bowl and tap your
  phone on it, put a one-tap shortcut on your home screen, or press the button
  in the app. All three open the same `/fed` page.
- The home screen gauge shifts color as time since the last feeding grows, so
  the answer reads from across the room.
- History is filterable by day, week, or a custom range, and any entry can be
  corrected or reassigned after the fact.

## Under the hood

Next.js 16 (App Router) with server actions, React 19, TypeScript, and
Tailwind CSS v4. Supabase provides magic-link auth and hosted Postgres,
Drizzle ORM owns the schema and queries, Vitest covers the unit-testable
logic, and the whole thing deploys on Vercel.

The stack is intentionally small. A feeding tracker's hard problems are auth
and multi-tenancy, not scale, so those get the attention: Postgres row-level
security runs deny-by-default as a backstop, and every server action scopes
its queries to the signed-in member's household.

## Running locally

You need Node 18+ and a free [Supabase](https://supabase.com) project.

```bash
git clone https://github.com/JellyV/BowlSync.git
cd BowlSync
npm install
cp .env.example .env.local   # fill in the values from your Supabase project
npm run db:migrate           # create tables
npm run db:apply-rls         # enable row-level security
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).
