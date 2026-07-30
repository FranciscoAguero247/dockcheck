export type ShipmentStatus = 'expected' | 'receiving' | 'verified' | 'discrepancy';
export type DiscrepancyType = 'shortage' | 'overage' | 'damage' | 'mislabel';

export interface Vendor {
  id: string;
  name: string;
  code: string;
  created_at?: string;
}

export interface Shipment {
  id: string;
  vendor_id: string;
  reference_number: string;
  trailer_number: string;
  scheduled_arrival: string;
  status: ShipmentStatus;
  expected_pallets: number;
  expected_cartons: number;
  created_at?: string;
  updated_at?: string;
}

export interface ShipmentWithVendor extends Shipment {
  vendor?: Vendor;
}

export interface LineItem {
  id: string;
  shipment_id: string;
  sku: string;
  description: string;
  expected_qty: number;
  received_qty: number;
  is_verified: boolean;
  created_at?: string;
}

export interface Discrepancy {
  id: string;
  shipment_id: string;
  line_item_id?: string | null;
  type: DiscrepancyType;
  affected_qty: number;
  notes: string | null;
  receiver_name: string;
  logged_at: string;
}

// Database mapping for typed Supabase operations
export interface Database {
  public: {
    Tables: {
      vendors: { Row: Vendor };
      shipments: { Row: Shipment };
      line_items: { Row: LineItem };
      discrepancies: { Row: Discrepancy };
    };
  };
}