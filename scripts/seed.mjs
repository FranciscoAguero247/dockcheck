-- Seed Vendors
INSERT INTO vendors (id, name, code) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Apex Logistics Co.', 'APX'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Titan Distribution Solutions', 'TDS'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Cascade Freight Line', 'CFL');

-- Seed Today's Inbound Shipments
INSERT INTO shipments (id, vendor_id, reference_number, trailer_number, scheduled_arrival, status, expected_pallets, expected_cartons) VALUES
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BOL-98421', 'TR-502', NOW() - INTERVAL '2 hours', 'receiving', 12, 360),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'BOL-98422', 'TR-108', NOW() + INTERVAL '1 hour', 'expected', 8, 240),
  ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'BOL-98420', 'TR-304', NOW() - INTERVAL '4 hours', 'verified', 20, 800);

-- Seed Line Items for Active Receiving Trailer (TR-502)
INSERT INTO line_items (shipment_id, sku, description, expected_qty, received_qty, is_verified) VALUES
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'SKU-1002', 'Heavy Duty Pallet Jacks', 10, 10, true),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'SKU-4081', 'Industrial Stretch Wrap 18in', 100, 95, false),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'SKU-7720', 'Cardboard Shipping Containers (Large)', 250, 0, false);