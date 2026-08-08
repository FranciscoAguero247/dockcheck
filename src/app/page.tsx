'use client';

import { useState } from 'react';
import { useShipments } from '@/hooks/useShipments';
import { ShipmentCard } from '@/components/dock/ShipmentCard';
import Link from 'next/link';
import { CalendarDays, Filter, Layers, CheckCircle2, AlertTriangle, Clock, RotateCcw, BarChart3, Award } from 'lucide-react';
import { Printer } from 'lucide-react';
import { exportShipmentsToCSV } from '@/lib/csv';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function DockBoardPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const formattedDateString = dateFilter ? format(dateFilter, 'yyyy-MM-dd') : '';

  const { shipments, loading, error } = useShipments({
    status: statusFilter,
    date: formattedDateString,
  });

  const totalCount = shipments.length;
  const receivingCount = shipments.filter((s) => s.status === 'receiving').length;
  const verifiedCount = shipments.filter((s) => s.status === 'verified').length;
  const discrepancyCount = shipments.filter((s) => s.status === 'discrepancy').length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 md:p-8" aria-busy="true">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        </div>
      </main>
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Dock Board
          </h1>
          <p className="text-slate-500 text-sm">
            Live inbound trailer queue & receiving status
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportShipmentsToCSV(shipments)}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Export CSV
          </button>

          <Link 
            href="/metrics" 
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <BarChart3 className="w-4 h-4" />
            Metrics
          </Link>

          <Link 
            href="/vendor/scorecard"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <Award className="w-4 h-4 text-amber-500" />
            Vendor Scorecards
          </Link>

          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <Filter className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
            {['all', 'expected', 'receiving', 'verified', 'discrepancy'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                aria-pressed={statusFilter === status}
                className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors min-h-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                aria-label="Filter by arrival date"
              >
                <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-700">
                  {dateFilter ? format(dateFilter, 'PP') : 'Filter by date'}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
              />
            </PopoverContent>
          </Popover>

          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setDateFilter(undefined);
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </header>

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

      {shipments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm" role="status">
          <p className="text-lg font-semibold text-slate-900">No shipments match the selected filter.</p>
          <p className="mt-2 text-sm text-slate-600">Try widening the date range or switching back to the full dock board.</p>
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