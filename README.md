# DockCheck

DockCheck is a production-minded dock receiving workspace for teams under deadline pressure. It gives the receiving team a live view of trailers waiting to be checked in, gives supervisors a clear picture of how the shift is tracking, and captures discrepancies the moment a count does not match so inventory errors do not surface later as a mystery.

[![CI](https://github.com/francisco-aguero/dockcheck/actions/workflows/ci.yml/badge.svg)](https://github.com/francisco-aguero/dockcheck/actions/workflows/ci.yml)

## The problem

Receivers under deadline pressure cannot see which trailers are waiting, supervisors cannot see how receiving is tracking against the day, and when a count does not match, the discrepancy often surfaces days later as a mystery inventory error that someone else has to chase.

The people who feel this most are:
- the receiving team during the shift
- the supervisor at end of day
- the inventory team downstream

## Screenshots

- Dock board overview: [public/screenshots/dock-board.svg](public/screenshots/dock-board.png)
- Receiving flow: [public/screenshots/receiving-flow.svg](public/screenshots/receiving-flow.png)

## What it does

- Live dock board with status and date filtering
- Mobile-friendly receiving workflow for line-by-line verification
- Automatic discrepancy logging when counts differ
- Supervisory metrics and printable end-of-shift summaries
- Empty states, loading skeletons, and keyboard/touch-friendly controls

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase for storage and realtime data
- Recharts for metrics visuals
- Jest and Testing Library for automated tests

## Schema overview

The data model is designed around four core tables:

```text
vendors
  └── shipments
        ├── line_items
        └── discrepancies
```

Key fields include:
- vendors: vendor identity and code
- shipments: trailer, arrival, expected counts, and status
- line_items: expected versus counted quantities per SKU
- discrepancies: mismatch details, type, receiver, and notes

## Demo login

The demo experience is intentionally lightweight for evaluation purposes.

- Email: demo@dockcheck.app
- Password: DockCheck2026!

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run tests:
   ```bash
   npm test
   ```
3. Run linting:
   ```bash
   npm run lint
   ```
4. Create a production build:
   ```bash
   npm run build
   ```
5. Create a Supabase project and add the following environment variables to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
6. Apply the schema from [scripts/schema.sql](scripts/schema.sql) in the Supabase SQL editor.
7. Seed the data:
   ```bash
   node scripts/seed.mjs
   ```
8. Start the app:
   ```bash
   npm run dev
   ```

## Deployment

### Vercel

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Add the same Supabase environment variables in the Vercel project settings.
4. Deploy and visit the generated URL.

### Environment variables

Set these in Vercel or your deployment environment:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

A template is available in [.env.example](.env.example).
