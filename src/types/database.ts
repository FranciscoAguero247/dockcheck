export type ShipmentStatus = 'expected' | 'receiving' | 'verified' | 'discrepancy';
export type DiscrepancyType = 'shortage' | 'overage' | 'damage' | 'mislabel';
export type UserRole = 'receiver' | 'supervisor' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

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

export interface Database {
  public: {
    Tables: {
      profiles: { 
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string };
        Update: Partial<Omit<Profile, 'id'>>;
      };
      vendors: { 
        Row: Vendor;
        Insert: Omit<Vendor, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Vendor, 'id'>>;
      };
      shipments: { 
        Row: Shipment;
        Insert: Omit<Shipment, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<Shipment, 'id'>>;
      };
      line_items: { 
        Row: LineItem;
        Insert: Omit<LineItem, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<LineItem, 'id'>>;
      };
      discrepancies: { 
        Row: Discrepancy;
        Insert: Omit<Discrepancy, 'id' | 'logged_at'> & { id?: string; logged_at?: string };
        Update: Partial<Omit<Discrepancy, 'id'>>;
      };
    };
  };
}