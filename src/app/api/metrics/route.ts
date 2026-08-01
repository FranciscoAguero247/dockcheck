import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const supabase = createServerSupabase();

    const startDate = start ? new Date(start) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = end ? new Date(end) : new Date();

    const { data: shipments } = await supabase
      .from('shipments')
      .select('id, status, created_at, updated_at, vendor_id, reference_number')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    const { data: vendors } = await supabase.from('vendors').select('id, name');
    const { data: discrepancies } = await supabase
      .from('discrepancies')
      .select('*')
      .gte('logged_at', startDate.toISOString())
      .lte('logged_at', endDate.toISOString())
      .order('logged_at', { ascending: true });

    const shipmentsByDay = new Map<string, { day: string; verified: number; total: number }>();
    const vendorBuckets = new Map<string, number>();
    const typeBuckets = new Map<string, number>();

    shipments?.forEach((shipment) => {
      const day = shipment.created_at ? shipment.created_at.slice(0, 10) : 'unknown';
      const entry = shipmentsByDay.get(day) || { day, verified: 0, total: 0 };
      entry.total += 1;
      if (shipment.status === 'verified') entry.verified += 1;
      shipmentsByDay.set(day, entry);
    });

    discrepancies?.forEach((item) => {
      const vendorName = vendors?.find((vendor) => vendor.id === shipments?.find((shipment) => shipment.id === item.shipment_id)?.vendor_id)?.name || 'Unknown';
      vendorBuckets.set(vendorName, (vendorBuckets.get(vendorName) || 0) + 1);
      typeBuckets.set(item.type, (typeBuckets.get(item.type) || 0) + 1);
    });

    const accuracySeries = Array.from(shipmentsByDay.values()).map((entry) => ({
      day: entry.day,
      accuracy: entry.total > 0 ? Math.round((entry.verified / entry.total) * 100) : 0,
      verified: entry.verified,
      total: entry.total,
    }));

    return NextResponse.json({
      accuracySeries,
      discrepanciesByVendor: Array.from(vendorBuckets.entries()).map(([name, value]) => ({ name, value })),
      discrepanciesByType: Array.from(typeBuckets.entries()).map(([name, value]) => ({ name, value })),
      verifiedPerDay: accuracySeries,
      totals: {
        verified: shipments?.filter((shipment) => shipment.status === 'verified').length || 0,
        discrepancies: discrepancies?.length || 0,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
