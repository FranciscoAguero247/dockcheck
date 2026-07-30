import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Loaded Key preview:", supabaseServiceKey ? supabaseServiceKey.substring(0, 10) + "..." : "UNDEFINED");
if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL in your environment.');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('Missing Supabase service role key. Set SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function seed() {
  console.log('Seeding database...');

  const vendors = [
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Apex Logistics Co.', code: 'APX' },
    { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Titan Distribution Solutions', code: 'TDS' },
    { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Cascade Freight Line', code: 'CFL' },
    { id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', name: 'Northwind Supply', code: 'NWS' },
  ];

  const { error: vendorError } = await supabase.from('vendors').upsert(vendors);
  if (vendorError) throw vendorError;

  const now = new Date();
  const getOffsetDate = (hours) => new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();

  const shipments = [
    {
      id: '11111111-1111-4111-8111-111111111111',
      vendor_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      reference_number: 'BOL-98421',
      trailer_number: 'TR-502',
      scheduled_arrival: getOffsetDate(-2),
      status: 'receiving',
      expected_pallets: 12,
      expected_cartons: 360,
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      vendor_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      reference_number: 'BOL-98422',
      trailer_number: 'TR-108',
      scheduled_arrival: getOffsetDate(1),
      status: 'expected',
      expected_pallets: 8,
      expected_cartons: 240,
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      vendor_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      reference_number: 'BOL-98420',
      trailer_number: 'TR-304',
      scheduled_arrival: getOffsetDate(-4),
      status: 'verified',
      expected_pallets: 20,
      expected_cartons: 800,
    },
    {
      id: '44444444-4444-4444-8444-444444444444',
      vendor_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
      reference_number: 'BOL-98501',
      trailer_number: 'TR-912',
      scheduled_arrival: getOffsetDate(3),
      status: 'expected',
      expected_pallets: 6,
      expected_cartons: 180,
    },
    {
      id: '55555555-5555-4555-8555-555555555555',
      vendor_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      reference_number: 'BOL-98502',
      trailer_number: 'TR-771',
      scheduled_arrival: getOffsetDate(-6),
      status: 'discrepancy',
      expected_pallets: 15,
      expected_cartons: 450,
    },
  ];

  const { error: shipmentError } = await supabase.from('shipments').upsert(shipments);
  if (shipmentError) throw shipmentError;

  const lineItems = [
    {
      id: 'aaaa1111-1111-1111-1111-111111111111',
      shipment_id: '11111111-1111-4111-8111-111111111111',
      sku: 'SKU-1002',
      description: 'Heavy Duty Pallet Jacks',
      expected_qty: 10,
      received_qty: 10,
      is_verified: true,
    },
    {
      id: 'aaaa2222-2222-2222-2222-222222222222',
      shipment_id: '11111111-1111-4111-8111-111111111111',
      sku: 'SKU-4081',
      description: 'Industrial Stretch Wrap 18in',
      expected_qty: 100,
      received_qty: 95,
      is_verified: false,
    },
    {
      id: 'aaaa3333-3333-3333-3333-333333333333',
      shipment_id: '11111111-1111-4111-8111-111111111111',
      sku: 'SKU-7720',
      description: 'Cardboard Shipping Containers (Large)',
      expected_qty: 250,
      received_qty: 0,
      is_verified: false,
    },
    {
      id: 'aaaa4444-4444-4444-4444-444444444444',
      shipment_id: '22222222-2222-4222-8222-222222222222',
      sku: 'SKU-8874',
      description: 'Battery Backup Units',
      expected_qty: 40,
      received_qty: 0,
      is_verified: false,
    },
    {
      id: 'aaaa5555-5555-5555-5555-555555555555',
      shipment_id: '33333333-3333-4333-8333-333333333333',
      sku: 'SKU-3001',
      description: 'Industrial Shelving Kits',
      expected_qty: 60,
      received_qty: 60,
      is_verified: true,
    },
    {
      id: 'aaaa6666-6666-4666-8666-666666666666',
      shipment_id: '44444444-4444-4444-8444-444444444444',
      sku: 'SKU-9023',
      description: 'Ergonomic Office Chairs',
      expected_qty: 24,
      received_qty: 0,
      is_verified: false,
    },
    {
      id: '66666666-6666-4666-8666-666666666666',
      shipment_id: '55555555-5555-4555-8555-555555555555',
      sku: 'SKU-6007',
      description: 'Wireless Barcode Scanners',
      expected_qty: 18,
      received_qty: 12,
      is_verified: false,
    },
  ];

  const { error: lineItemError } = await supabase.from('line_items').upsert(lineItems);
  if (lineItemError) throw lineItemError;

  const discrepancies = [
    {
      shipment_id: '55555555-5555-4555-8555-555555555555',
      line_item_id: '66666666-6666-4666-8666-666666666666',
      type: 'shortage',
      affected_qty: 6,
      notes: 'Scanner count fell short during dock check.',
      receiver_name: 'Mina Patel',
      logged_at: getOffsetDate(-7),
    },
  ];

  const { error: discrepancyError } = await supabase.from('discrepancies').upsert(discrepancies);
  if (discrepancyError) throw discrepancyError;

  console.log('Database seeded successfully!');
}

seed().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});