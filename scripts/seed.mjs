import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('Seeding database...');

  // 1. Seed Vendors
  const { error: vendorError } = await supabase.from('vendors').upsert([
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Apex Logistics Co.', code: 'APX' },
    { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Titan Distribution Solutions', code: 'TDS' },
    { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', name: 'Cascade Freight Line', code: 'CFL' }
  ]);
  if (vendorError) throw vendorError;

  // 2. Seed Shipments
  const now = new Date();
  const getOffsetDate = (hours) => new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();

  const { error: shipmentError } = await supabase.from('shipments').upsert([
    {
      id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
      vendor_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      reference_number: 'BOL-98421',
      trailer_number: 'TR-502',
      scheduled_arrival: getOffsetDate(-2),
      status: 'receiving',
      expected_pallets: 12,
      expected_cartons: 360
    },
    {
      id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
      vendor_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      reference_number: 'BOL-98422',
      trailer_number: 'TR-108',
      scheduled_arrival: getOffsetDate(1),
      status: 'expected',
      expected_pallets: 8,
      expected_cartons: 240
    },
    {
      id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
      vendor_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      reference_number: 'BOL-98420',
      trailer_number: 'TR-304',
      scheduled_arrival: getOffsetDate(-4),
      status: 'verified',
      expected_pallets: 20,
      expected_cartons: 800
    }
  ]);
  if (shipmentError) throw shipmentError;

  // 3. Seed Line Items
  const { error: lineItemError } = await supabase.from('line_items').upsert([
    { shipment_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', sku: 'SKU-1002', description: 'Heavy Duty Pallet Jacks', expected_qty: 10, received_qty: 10, is_verified: true },
    { shipment_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', sku: 'SKU-4081', description: 'Industrial Stretch Wrap 18in', expected_qty: 100, received_qty: 95, is_verified: false },
    { shipment_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', sku: 'SKU-7720', description: 'Cardboard Shipping Containers (Large)', expected_qty: 250, received_qty: 0, is_verified: false }
  ]);
  if (lineItemError) throw lineItemError;

  console.log('Database seeded successfully!');
}

seed().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});