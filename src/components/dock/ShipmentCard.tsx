'use client';

import { Shipment } from '@/types/database';
import { StatusBadge } from './StatusBadge';
import { Truck, Package, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ShipmentCard({ shipment }: { shipment: Shipment }) {
  const arrivalTime = new Date(shipment.scheduled_arrival).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {shipment.vendor?.name || 'Unknown Vendor'}
            </h3>
            <p className="text-sm font-mono text-slate-500">Ref: {shipment.reference_number}</p>
          </div>
          <StatusBadge status={shipment.status} />
        </div>

        <div className="grid grid-cols-2 gap-3 my-4 py-3 bg-slate-50 rounded-lg px-3 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-slate-400" />
            <span>Trailer: <strong className="font-semibold text-slate-900">{shipment.trailer_number}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{arrivalTime}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Package className="w-4 h-4 text-slate-400" />
            <span>
              Expected: <strong className="font-semibold text-slate-900">{shipment.expected_pallets}</strong> Pallets / <strong className="font-semibold text-slate-900">{shipment.expected_cartons}</strong> Cartons
            </span>
          </div>
        </div>
      </div>

      <Link
        href={`/receiving/${shipment.id}`}
        className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
      >
        <span>Open Receiving Flow</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}