'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, CalendarDays, Printer, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';

interface MetricsPayload {
  accuracySeries: Array<{ day: string; accuracy: number; verified: number; total: number }>;
  discrepanciesByVendor: Array<{ name: string; value: number }>;
  discrepanciesByType: Array<{ name: string; value: number }>;
  verifiedPerDay: Array<{ day: string; verified: number; total: number }>;
  totals: { verified: number; discrepancies: number };
}

const palette = ['#0f172a', '#475569', '#94a3b8', '#f59e0b', '#dc2626'];

export default function MetricsPage() {
  const [payload, setPayload] = useState<MetricsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7d');

  useEffect(() => {
    let isMounted = true;

    async function loadMetrics() {
      setLoading(true);
      const params = new URLSearchParams();
      if (range === '7d') {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        params.set('start', start.toISOString());
        params.set('end', end.toISOString());
      } else if (range === '30d') {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        params.set('start', start.toISOString());
        params.set('end', end.toISOString());
      }

      const response = await fetch(`/api/metrics?${params.toString()}`);
      const data = await response.json();
      if (isMounted) {
        setPayload(data);
        setLoading(false);
      }
    }

    void loadMetrics();

    const channel = supabase
      .channel('public:metrics-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, () => {
        if (isMounted) {
          void loadMetrics();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'discrepancies' }, () => {
        if (isMounted) {
          void loadMetrics();
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [range]);

  const summary = useMemo(() => {
    const accuracy = payload?.accuracySeries?.length
      ? Math.round(payload.accuracySeries.reduce((sum, item) => sum + item.accuracy, 0) / payload.accuracySeries.length)
      : 0;

    return {
      accuracy,
      verified: payload?.totals?.verified ?? 0,
      discrepancies: payload?.totals?.discrepancies ?? 0,
    };
  }, [payload]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Loading metrics…</p>
          <p className="mt-2 text-sm text-slate-600">Collecting receiving performance data for the selected range.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
              <ArrowLeft className="w-4 h-4" />
              Back to Dock Board
            </Link>
            <h1 className="mt-2 text-2xl font-black text-slate-900">Operations Metrics</h1>
            <p className="text-sm text-slate-600">Shift health, discrepancy trends, and throughput at a glance.</p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
              <CalendarDays className="w-4 h-4" />
              <select value={range} onChange={(event) => setRange(event.target.value)} className="bg-transparent outline-none">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
            </label>
            <button type="button" onClick={() => window.print()} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
              <Printer className="w-4 h-4" /> Print summary
            </button>
          </div>
        </div>

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-300">Accuracy rate</p>
              <TrendingUp className="w-4 h-4 text-slate-300" />
            </div>
            <p className="mt-3 text-3xl font-black">{summary.accuracy}%</p>
            <p className="mt-1 text-sm text-slate-300">Average match rate across the selected window</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-emerald-700">Verified shipments</p>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="mt-3 text-3xl font-black text-emerald-900">{summary.verified}</p>
            <p className="mt-1 text-sm text-emerald-700">Closed out successfully in this period</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-rose-700">Discrepancies logged</p>
              <AlertTriangle className="w-4 h-4 text-rose-700" />
            </div>
            <p className="mt-3 text-3xl font-black text-rose-900">{summary.discrepancies}</p>
            <p className="mt-1 text-sm text-rose-700">Follow-up items that need attention</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-500" />
                <h2 className="text-base font-semibold text-slate-900">Accuracy over time</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">Trend</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payload?.accuracySeries ?? []} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="accuracy" fill="#0f172a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-500" />
                <h2 className="text-base font-semibold text-slate-900">Discrepancies by vendor</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">Share</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={payload?.discrepanciesByVendor ?? []} dataKey="value" nameKey="name" outerRadius={92} innerRadius={56} paddingAngle={2}>
                    {(payload?.discrepanciesByVendor ?? []).map((entry, index) => (
                      <Cell key={entry.name} fill={palette[index % palette.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">End-of-shift summary</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">Printable</span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Verified shipments per day</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {(payload?.verifiedPerDay ?? []).map((item) => (
                  <li key={item.day} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                    <span>{item.day}</span>
                    <span className="font-semibold text-slate-900">{item.verified}/{item.total}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Discrepancy breakdown</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {(payload?.discrepanciesByType ?? []).map((item) => (
                  <li key={item.name} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
                    <span className="capitalize">{item.name}</span>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
