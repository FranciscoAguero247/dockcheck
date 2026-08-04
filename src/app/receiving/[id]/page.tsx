'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { filterDiscrepancies } from '@/lib/discrepancies';
import { ShipmentWithVendor, LineItem, Discrepancy, DiscrepancyType } from '@/types/database';
import { ArrowLeft, Package, Truck, Clock3, AlertTriangle, CheckCircle2, PlusCircle, Send, Search } from 'lucide-react';
import { DiscrepancyPhotoUpload } from '@/components/receiving/DiscrepancyPhotoUpload';

interface LineFormValues {
  counted: number;
}

interface DiscrepancyEntry {
  lineId: string;
  type: DiscrepancyType;
  quantity: number;
  note: string;
  receiver: string;
}

interface ReceivingFormValues {
  lines: Record<string, LineFormValues>;
}

export default function ShipmentDetailPage() {
  const params = useParams<{ id: string }>();
  const [shipment, setShipment] = useState<ShipmentWithVendor | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [receiverFilter, setReceiverFilter] = useState('');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null); // State to store uploaded photo URL if needed

  const { control, handleSubmit, reset } = useForm<ReceivingFormValues>({
    defaultValues: {
      lines: {},
    },
  });

  const watchedLines = useWatch({ control, name: 'lines' });

  const mismatchCount = useMemo(
    () =>
      lineItems.filter((item) => {
        const counted = Number(watchedLines?.[item.id]?.counted ?? item.received_qty ?? 0);
        return item.expected_qty !== counted;
      }).length,
    [lineItems, watchedLines]
  );

  const visibleDiscrepancies = useMemo(
    () => filterDiscrepancies(discrepancies, { type: typeFilter === 'all' ? '' : typeFilter, receiver: receiverFilter }),
    [discrepancies, receiverFilter, typeFilter]
  );

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
        const typedLineItems = lineItemData as LineItem[];
        const nextLines = Object.fromEntries(
          typedLineItems.map((item) => [item.id, { counted: Number(item.received_qty ?? 0) }])
        );
        setLineItems(typedLineItems);
        reset({ lines: nextLines });
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
  }, [params?.id, reset]);

  async function onSubmit(values: ReceivingFormValues) {
    if (!params?.id) return;

    setSubmitting(true);
    setFeedback(null);

    const discrepancyEntries: DiscrepancyEntry[] = [];

    for (const item of lineItems) {
      const counted = Number(values.lines[item.id]?.counted ?? item.received_qty ?? 0);
      if (counted !== item.expected_qty) {
        discrepancyEntries.push({
          lineId: item.id,
          type: counted < item.expected_qty ? 'shortage' : 'overage',
          quantity: Math.abs(counted - item.expected_qty),
          note: counted < item.expected_qty ? 'Counted fewer than expected.' : 'Counted more than expected.',
          receiver: 'Dock Receiver',
        });
      }
    }

    const response = await fetch(`/api/receiving/${params.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        lines: Object.entries(values.lines).map(([id, value]) => ({ id, counted: Number(value.counted) })), 
        discrepancies: discrepancyEntries,
        photoUrl: uploadedPhotoUrl // Optional: pass along the photo URL if your backend API accepts it
      }),
    });

    const payload = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setFeedback(payload.error || 'Unable to save receiving results.');
      return;
    }

    setFeedback(`Receiving completed. Shipment marked ${payload.status}.`);

    const { data: discrepancyData } = await supabase
      .from('discrepancies')
      .select('*')
      .eq('shipment_id', params.id)
      .order('logged_at', { ascending: false });

    if (discrepancyData) {
      setDiscrepancies(discrepancyData as Discrepancy[]);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 md:p-8" aria-busy="true">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
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
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600" role="status">
          Shipment not found. Return to the dock board and try another trailer.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-3 md:p-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          Back to Dock Board
        </Link>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">Receiving Flow</p>
              <h1 className="text-xl font-black text-slate-900">{shipment.reference_number}</h1>
              <p className="mt-1 text-sm text-slate-600">{shipment.vendor?.name || 'Unknown vendor'}</p>
            </div>
            <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
              {shipment.status}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Truck className="w-3.5 h-3.5" /> Trailer</div>
              <p className="mt-1 text-sm font-bold text-slate-900">{shipment.trailer_number}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Clock3 className="w-3.5 h-3.5" /> Arrival</div>
              <p className="mt-1 text-sm font-bold text-slate-900">{new Date(shipment.scheduled_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Package className="w-3.5 h-3.5" /> Expected</div>
              <p className="mt-1 text-sm font-bold text-slate-900">{shipment.expected_pallets} pallets / {shipment.expected_cartons} cartons</p>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Line-by-line verification</h2>
              <span className="text-xs font-medium text-slate-500">{mismatchCount} mismatches</span>
            </div>

            <div className="mt-3 space-y-3">
              {lineItems.map((item) => {
                const counted = Number(watchedLines?.[item.id]?.counted ?? item.received_qty ?? 0);
                const matched = counted === item.expected_qty;
                return (
                  <div key={item.id} className={`rounded-xl border p-3 ${matched ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.sku}</p>
                        <p className="text-xs text-slate-600">{item.description}</p>
                      </div>
                      <div className="text-right text-[11px] text-slate-600">
                        <p>Expected: {item.expected_qty}</p>
                        <p>Counted: {counted}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Controller
                        name={`lines.${item.id}.counted` as const}
                        control={control}
                        render={({ field }) => (
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            aria-label={`Count for ${item.sku}`}
                            value={field.value ?? 0}
                            onChange={(event) => field.onChange(Number(event.target.value))}
                            className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                          />
                        )}
                      />
                      <span className="text-xs text-slate-500">units</span>
                      {matched ? (
                        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Match
                        </span>
                      ) : (
                        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          <AlertTriangle className="w-3.5 h-3.5" /> Review
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <PlusCircle className="w-4 h-4 text-slate-500" />
              Discrepancy log & Documentation
            </div>
            <p className="mt-1 text-xs text-slate-500">Any mismatch opens a discrepancy entry automatically. Attach optional photographic evidence below.</p>

            <div className="mt-4">
              <DiscrepancyPhotoUpload 
                shipmentId={shipment.id} 
                onPhotoUploaded={(url) => {
                  setUploadedPhotoUrl(url);
                }} 
              />
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr]">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  value={receiverFilter}
                  onChange={(event) => setReceiverFilter(event.target.value)}
                  placeholder="Filter by receiver"
                  className="w-full bg-transparent outline-none"
                />
              </label>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none"
              >
                <option value="all">All types</option>
                <option value="shortage">Shortage</option>
                <option value="overage">Overage</option>
                <option value="damage">Damage</option>
                <option value="mislabel">Mislabel</option>
              </select>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              {visibleDiscrepancies.length === 0 ? 'No discrepancies match the current filters.' : visibleDiscrepancies.map((item) => (
                <div key={item.id} className="mt-2 rounded-lg border border-rose-200 bg-white p-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-rose-700 capitalize">{item.type}</p>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{item.receiver_name}</span>
                  </div>
                  <p className="text-xs text-slate-600">{item.notes || 'No note supplied.'}</p>
                  <p className="mt-1 text-[11px] text-slate-500">Qty: {item.affected_qty} • Receiver: {item.receiver_name}</p>
                </div>
              ))}
            </div>
          </section>

          {feedback ? (
            <div className={`rounded-xl border p-3 text-sm ${feedback.includes('completed') ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
              {feedback}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Saving receiving results...' : 'Complete check-in'}
          </button>
        </form>
      </div>
    </main>
  );
}