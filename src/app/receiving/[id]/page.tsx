'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShipmentWithVendor, LineItem, Discrepancy } from '@/types/database';
import { ArrowLeft, Package, Truck, Clock3, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ShipmentDetailPage() {
  const params = useParams<{ id: string }>();
  const [shipment, setShipment] = useState<ShipmentWithVendor | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;

    async function loadShipment() {
      setLoading(true);
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select(`*, vendor:vendors(name, code)`)
        .eq('id', params.id)
        .maybeSingle();

      if (!shipmentError && shipmentData) {
        setShipment(shipmentData as ShipmentWithVendor);
      }

      const { data: lineItemData } = await supabase
        .from('line_items')
        .select('*')
        .eq('shipment_id', params.id)
        .order('sku');

      if (lineItemData) {
        setLineItems(lineItemData as LineItem[]);
      }

      const { data: discrepancyData } = await supabase
        .from('discrepancies')
        .select('*')
        .eq('shipment_id', params.id)
        .order('logged_at', { ascending: false });

      if (discrepancyData) {
        setDiscrepancies(discrepancyData as Discrepancy[]);
      }

      setLoading(false);
    }

    void loadShipment();
  }, [params?.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600 font-medium">Loading shipment details...</p>
        </div>
      </main>
    );
  }

  if (!shipment) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Dock Board
        </Link>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          Shipment not found.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Dock Board
        </Link>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Receiving Detail
              </p>
              <h1 className="text-2xl font-black text-slate-900">{shipment.reference_number}</h1>
              <p className="mt-2 text-sm text-slate-600">
                {shipment.vendor?.name || 'Unknown vendor'} • {shipment.vendor?.code || 'N/A'}
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-sm font-semibold capitalize text-slate-700">
              {shipment.status}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Truck className="w-4 h-4" /> Trailer
              </div>
              <p className="mt-2 text-lg font-bold text-slate-900">{shipment.trailer_number}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Clock3 className="w-4 h-4" /> Arrival
              </div>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {new Date(shipment.scheduled_arrival).toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <Package className="w-4 h-4" /> Expected Counts
              </div>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {shipment.expected_pallets} pallets • {shipment.expected_cartons} cartons
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Line Items</h2>
            <span className="text-sm text-slate-500">{lineItems.length} items</span>
          </div>

          <div className="mt-4 space-y-3">
            {lineItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{item.sku}</p>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="rounded-full bg-white px-3 py-1">Expected: {item.expected_qty}</span>
                    <span className="rounded-full bg-white px-3 py-1">Received: {item.received_qty}</span>
                    {item.is_verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                        <AlertTriangle className="w-4 h-4" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Discrepancies</h2>
            <span className="text-sm text-slate-500">{discrepancies.length} logged</span>
          </div>

          <div className="mt-4 space-y-3">
            {discrepancies.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                No discrepancies logged for this shipment.
              </div>
            ) : (
              discrepancies.map((item) => (
                <div key={item.id} className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-rose-800">{item.type}</p>
                      <p className="text-sm text-rose-700">{item.notes || 'No notes provided.'}</p>
                    </div>
                    <div className="text-sm text-rose-700">
                      <p>Qty affected: {item.affected_qty}</p>
                      <p>Receiver: {item.receiver_name}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
