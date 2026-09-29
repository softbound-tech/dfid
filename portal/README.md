# Qualiseed Farm Intelligence Portal

An internal tool for Qualiseed Ltd: agro-dealers and field agents record what
farmers intend to plant (crop, acreage, location, planting month), and the
portal turns that into a live seed-demand forecast and a near-term
distribution timeline for Qualiseed's own sales/production planning team.

This is a **first-run pilot build** — scoped for a small pilot (a handful of
agro-dealers, one region to start) rather than a full public-facing product.
See "Before a real pilot" below for what to check before relying on it.

## How it works

- **Agro-dealers / field agents** log in with a phone number + PIN and use
  the **Entry** form to record a farmer's planting plan.
- **Qualiseed admin staff** log in and see the **Dashboard**: total acreage
  and estimated seed bags needed, broken down by crop, region and planting
  month, plus a "next 3 months" view of what needs to reach dealers soonest.
  A CSV export is available for anything that needs to go into Excel/ERP.
- Admins manage dealer accounts under **Agents**, and the acreage → bags
  conversion rates under **Settings**.

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS · Prisma 7 + SQLite ·
Recharts · JWT session cookies (no third-party auth provider — this is a
small internal tool, not a consumer product).

## Getting started

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db and applies the schema
npx prisma db seed        # loads sample seeding rates + demo logins
npm run dev                # http://localhost:3000
```

Demo logins (seeded by `prisma/seed.ts` — **change or remove before any real
pilot use**):

| Role  | Phone           | PIN  |
|-------|-----------------|------|
| Admin | 233200000001    | 1234 |
| Agent | 233240000002    | 1234 |

`.env` holds `DATABASE_URL` (SQLite file) and `SESSION_SECRET` (used to sign
session cookies). Both have working local defaults, but **generate a real
random `SESSION_SECRET` before deploying anywhere real**:

```bash
openssl rand -base64 32
```

## Before a real pilot

1. **Confirm the seeding rates.** `prisma/seed.ts` loads *sample* kg-of-seed-
   per-acre and bag-size figures for Maize, Rice, Soybean and Vegetables —
   they're placeholders, not agronomy-verified numbers. Fix them on the
   **Settings** page (admin login) before trusting the "estimated bags"
   figures for any real production or buying decision.
2. **Replace the demo logins.** Create real agro-dealer accounts on the
   **Agents** page, then deactivate or change the PIN on the seeded demo
   accounts above.
3. **Set a real `SESSION_SECRET`** in production — see above.

## Deploying

The app is a standard Next.js app and deploys cleanly to Vercel. The one
thing to change first: **swap SQLite for a hosted database**, since
serverless platforms don't give you a persistent filesystem to keep a SQLite
file in.

The schema and code don't need to change beyond the datasource — Prisma's
driver-adapter architecture makes this a small, contained edit:

1. Provision a Postgres database (e.g. [Neon](https://neon.tech) has a
   generous free tier and pairs well with Vercel; Vercel Postgres works too).
2. In `prisma/schema.prisma`, change `provider = "sqlite"` to
   `provider = "postgresql"` under `datasource db`.
3. Swap the adapter in `src/lib/db.ts` and `prisma/seed.ts`: replace
   `@prisma/adapter-better-sqlite3` / `PrismaBetterSqlite3` with
   `@prisma/adapter-pg` / `PrismaPg` (`npm install @prisma/adapter-pg pg`),
   passing `{ connectionString: process.env.DATABASE_URL }`.
4. Set `DATABASE_URL` (your Postgres connection string) and `SESSION_SECRET`
   as environment variables on Vercel.
5. Run `npx prisma migrate deploy` against the new database, then
   `npx prisma db seed` once to load starter seeding-rate defaults (skip this
   if you'd rather enter them by hand in Settings).

## Scope notes / what's deliberately not here yet

This is an MVP for a small, mostly-online pilot (agro-dealers entering data
themselves, not offline in the field). Reasonable next steps once the pilot
proves out: offline-capable entry for low-connectivity areas, WhatsApp/USSD
intake for farmers to self-report, SMS-based planting reminders, and a
dealer-facing view of local demand. None of that is built yet — the current
scope is deliberately narrow so a first pilot can start fast.
