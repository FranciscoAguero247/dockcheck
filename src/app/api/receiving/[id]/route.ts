import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const supabase = createServerSupabase();

    const { data: lineItems, error: lineItemsError } = await supabase
      .from('line_items')
      .select('*')
      .eq('shipment_id', id)
      .order('sku');

    if (lineItemsError) {
      return NextResponse.json({ error: lineItemsError.message }, { status: 500 });
    }

    const updates = body.lines.map((line: { id: string; counted: number }) => ({
      id: line.id,
      received_qty: line.counted,
      is_verified: line.counted === lineItems.find((item) => item.id === line.id)?.expected_qty,
    }));

    const { error: updateError } = await supabase.from('line_items').upsert(updates);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const { data: updatedLineItems } = await supabase
      .from('line_items')
      .select('*')
      .eq('shipment_id', id);

    const allMatched = updatedLineItems?.every((line) => line.is_verified) ?? false;
    const nextStatus = allMatched ? 'verified' : 'discrepancy';

    const { error: shipmentError } = await supabase
      .from('shipments')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (shipmentError) {
      return NextResponse.json({ error: shipmentError.message }, { status: 500 });
    }

    const discrepancyPayloads = body.discrepancies
      .filter((item: { lineId: string }) => item.lineId)
      .map((item: { lineId: string; type: string; quantity: number; note: string; receiver: string }) => ({
        shipment_id: id,
        line_item_id: item.lineId,
        type: item.type,
        affected_qty: item.quantity,
        notes: item.note || null,
        receiver_name: item.receiver,
        logged_at: new Date().toISOString(),
      }));

    if (discrepancyPayloads.length > 0) {
      const { error: discrepancyError } = await supabase.from('discrepancies').insert(discrepancyPayloads);
      if (discrepancyError) {
        return NextResponse.json({ error: discrepancyError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, status: nextStatus });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
