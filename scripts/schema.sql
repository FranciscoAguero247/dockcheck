create extension if not exists "pgcrypto";

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  reference_number text not null unique,
  trailer_number text not null,
  scheduled_arrival timestamptz not null,
  status text not null check (status in ('expected','receiving','verified','discrepancy')),
  expected_pallets integer not null check (expected_pallets >= 0),
  expected_cartons integer not null check (expected_cartons >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.line_items (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  sku text not null,
  description text not null,
  expected_qty integer not null check (expected_qty >= 0),
  received_qty integer not null check (received_qty >= 0),
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique (shipment_id, sku)
);

create table if not exists public.discrepancies (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  line_item_id uuid references public.line_items(id) on delete set null,
  type text not null check (type in ('shortage','overage','damage','mislabel')),
  affected_qty integer not null check (affected_qty >= 0),
  notes text,
  receiver_name text not null,
  logged_at timestamptz not null default now()
);

create index if not exists shipments_scheduled_arrival_idx on public.shipments(scheduled_arrival);
create index if not exists shipments_status_idx on public.shipments(status);
create index if not exists line_items_shipment_id_idx on public.line_items(shipment_id);
create index if not exists discrepancies_shipment_id_idx on public.discrepancies(shipment_id);
