# Household page & invite surfacing — design

**Date:** 2026-07-06
**Status:** approved

## Problem

The invite code is generated and stored (`households.invite_code`) and joining
works via onboarding, but the code is never displayed anywhere in the UI. The
only way to invite someone today is to read the code out of the database.

## Decision summary

- New `/household` page showing the members list and an invite card.
- Entry point: the household name block on the home page becomes a link to
  `/household`, with a member avatar stack and a dashed "+" circle as the
  invite affordance (option B of the explored designs).
- V1 scope is display + copy + share only. No regenerate-code, no pre-filled
  join links, no rename (household names are auto-generated from the pet name,
  so rename is unnecessary).

## Home page entry point

In `src/app/page.tsx`, the `<header>` block changes:

- Household name bumps from `text-xs` to `text-sm`, stays mono.
- The name plus a new avatar row wrap in a single `<Link href="/household">`:
  overlapping initials circles for each member (alternating ink/foreground
  fills, `--background` ring) followed by a dashed "+" circle.
- Cluster gets pointer cursor (via Link), hover opacity shift, and
  focus-visible outline consistent with existing links.
- No new queries: the page already fetches `members` for the edit dialog.

## `/household` page

Server component at `src/app/household/page.tsx`. Guards identical to home:
unauthenticated → `/login` (inside `getUserContext`), no membership →
`/onboarding`.

Layout: `SiteHeader`, centered `max-w-sm` column, inline "Back to status"
link, then:

1. **Title block** — household name (display font), subtitle
   "Feeding {pet} together since {Month Year}" derived from
   `household.createdAt`.
2. **Members card** — mono uppercase label "Members · N"; one row per member:
   initials circle, display name, small "YOU" pill (accent tint) on the
   current member's row.
3. **Invite card** — label "Invite someone"; helper line
   "Anyone who feeds {pet} can join with this code."; the code in a dashed
   box (mono, ~2xl, wide tracking); two buttons: **Copy code** (primary,
   ink-filled) and **Share** (outline); footer line
   "They sign in at {host}, choose Join with a code, and enter it."

## Components

- `src/lib/initials.ts` — `memberInitial(name: string): string`. First
  grapheme of the trimmed name, uppercased; `"?"` for empty. Unit-tested.
- `src/components/member-avatars.tsx` — presentational avatar stack
  (members + optional dashed "+" circle). Used by the home page cluster and
  sized-up variants in the members list rows.
- `src/components/invite-card.tsx` — client component (needs browser APIs).
  Props: `code`, `petName`, `householdName`.
- `src/app/household/page.tsx` — server page; one query for members (same
  shape the home page uses).

No schema changes, no new server actions.

## Copy & share behavior

- **Copy code:** `navigator.clipboard.writeText(code)`; button label flips to
  "Copied" with a check icon for ~2s, then reverts. Clipboard API requires a
  secure context — fine on HTTPS and localhost.
- **Share:** message `Join {household} on BowlSync with code {code} — {origin}`.
  If `navigator.share` exists (mobile), open the native share sheet;
  user-cancelled shares (AbortError) are ignored. Otherwise (desktop) copy the
  message to the clipboard and show "Copied" on the Share button.

## Edge cases

- Single-member household: stack renders you + the dashed plus — correct and
  at its most useful.
- Long household names wrap; no truncation at `max-w-sm`.
- Members with empty/whitespace display names render "?" initials.

## Testing

- Unit: `tests/initials.test.ts` for `memberInitial` (basic, lowercase,
  whitespace, empty, multi-word takes first grapheme).
- Everything else is presentational; verify by running the app: cluster
  renders and navigates, copy/share behave, guards redirect.

## Out of scope (deliberate)

Regenerate code, pre-filled join links (`?code=`), rename household, member
management (remove/leave). The instructions-page copy fix ("enter a name for
the household" is inaccurate) is tracked separately.
