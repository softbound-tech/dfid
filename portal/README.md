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

Next.js 16 (App Router, TypeScript) · Tailwind CSS · Prisma 7 + PostgreSQL ·
Recharts · JWT session cookies (no third-party auth provider — this is a
small internal tool, not a consumer product).

## Getting started

You need a Postgres database to develop against — a free
[Neon](https://neon.tech) database works well and needs no local install.

```bash
npm install
# set DATABASE_URL in .env to your Postgres connection string
npx prisma db push   # creates the tables from prisma/schema.prisma
npx prisma db seed    # loads sample seeding rates + demo logins
npm run dev            # http://localhost:3000
```

Demo logins (seeded by `prisma/seed.ts` — **change or remove before any real
pilot use**):

| Role  | Phone           | PIN  |
|-------|-----------------|------|
| Admin | 233200000001    | 1234 |
| Agent | 233240000002    | 1234 |

`.env` holds `DATABASE_URL` and `SESSION_SECRET` (used to sign session
cookies) — **generate a real random `SESSION_SECRET` before deploying
anywhere real**:

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

The app is a standard Next.js app and deploys cleanly to Vercel:

1. Import the `softbound-tech/dfid` repo as a Vercel project, with **root
   directory set to `portal`**.
2. Add a Postgres database to the project (Vercel dashboard → the project →
   **Storage** tab → **Create Database** → Postgres — Neon-backed, free tier
   available). Connecting it to the project sets `DATABASE_URL`
   automatically.
3. Add a `SESSION_SECRET` environment variable (see above for generating one).
4. Deploy. Then run once, pointed at the production database, to create the
   tables and load starter data:
   ```bash
   DATABASE_URL="<production connection string>" npx prisma db push
   DATABASE_URL="<production connection string>" npx prisma db seed
   ```

## Scope notes / what's deliberately not here yet

This is an MVP for a small, mostly-online pilot (agro-dealers entering data
themselves, not offline in the field). Reasonable next steps once the pilot
proves out: offline-capable entry for low-connectivity areas, WhatsApp/USSD
intake for farmers to self-report, SMS-based planting reminders, and a
dealer-facing view of local demand. None of that is built yet — the current
scope is deliberately narrow so a first pilot can start fast.
