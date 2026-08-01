# DockCheck

DockCheck is a Next.js App Router dashboard for live dock receiving operations. It reads shipments from Supabase, shows a live dock board, supports status/date filtering, and includes detail pages for receiving workflow review.

[![CI](https://github.com/francisco-aguero/dockcheck/actions/workflows/ci.yml/badge.svg)](https://github.com/francisco-aguero/dockcheck/actions/workflows/ci.yml)

## Features

- Real-time dock board cards with vendor, reference, arrival time, expected counts, and status chips
- Status and date filters for browsing inbound shipments
- Shipment detail route with line items and discrepancy tracking
- Supabase-backed data model and seed script for realistic sample shipments

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

## Supabase schema

The SQL schema in [scripts/schema.sql](scripts/schema.sql) defines:

- vendors
- shipments
- line_items
- discrepancies

with foreign keys, constraints, and indexes suitable for dock operations.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Add the same Supabase environment variables in the Vercel project settings.
4. Deploy and visit the generated URL.
