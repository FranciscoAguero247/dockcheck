'use client';

import { useState } from 'react';
import { useShipments } from '@/hooks/useShipments';
import { ShipmentCard } from '@/components/dock/ShipmentCard';
import { CalendarDays, Filter, Layers, CheckCircle2, AlertTriangle, Clock, RotateCcw, BarChart3 } from 'lucide-react';

export default function DockBoardPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const { shipments, loading, error } = useShipments({
    status: statusFilter,
    date: dateFilter,
  });

  const totalCount = shipments.length;
  const receivingCount = shipments.filter((s) => s.status === 'receiving').length;
  const verifiedCount = shipments.filter((s) => s.status === 'verified').length;
  const discrepancyCount = shipments.filter((s) => s.status === 'discrepancy').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-600 font-medium">Connecting to Dock Feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 text-rose-800 rounded-lg m-6 border border-rose-200">
        <p className="font-bold">Failed to load Dock Board</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Dock Board
          </h1>
          <p className="text-slate-500 text-sm">
            Live inbound trailer queue & receiving status
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <a href="/metrics" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
            <BarChart3 className="w-4 h-4" />
            Metrics
          </a>
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <Filter className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
            {['all', 'expected', 'receiving', 'verified', 'discrepancy'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-sm text-slate-600">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="bg-transparent outline-none text-sm text-slate-700"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setDateFilter('');
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Expected</p>
            <p className="text-xl font-bold text-slate-900">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">In Progress</p>
            <p className="text-xl font-bold text-amber-900">{receivingCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Verified</p>
            <p className="text-xl font-bold text-emerald-900">{verifiedCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Discrepancies</p>
            <p className="text-xl font-bold text-rose-900">{discrepancyCount}</p>
          </div>
        </div>
      </section>

      {/* Shipments Grid */}
      {shipments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">No shipments match the selected filter.</p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shipments.map((shipment) => (
            <ShipmentCard key={shipment.id} shipment={shipment} />
          ))}
        </section>
      )}
    </main>
  );
}