'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Award, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface VendorScorecard {
  vendor_id: string;
  vendor_name: string;
  vendor_code: string;
  total_shipments: number;
  verified_shipments: number;
  discrepancy_shipments: number;
  accuracy_rate: number;
}

export default function VendorScorecardPage() {
  const [scorecards, setScorecards] = useState<VendorScorecard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScorecards() {
      const { data, error } = await supabase
        .from('vendor_scorecards')
        .select('*')
        .order('accuracy_rate', { ascending: false });

      if (!error && data) {
        setScorecards(data as VendorScorecard[]);
      }
      setLoading(false);
    }
    fetchScorecards();
  }, []);

  return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Link href="/" className="flex items-center gap-6 text-slate-600 hover:text-slate-900 border-b border-slate-200 p-4">
          <ArrowLeft className="w-5 h-5" />
           <span>Back to Dashboard</span>
        </Link>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
              <th className="p-4">Rank</th>
              <th className="p-4">Vendor</th>
              <th className="p-4 text-center">Total Shipments</th>
              <th className="p-4 text-center">Verified</th>
              <th className="p-4 text-center">Discrepancies</th>
              <th className="p-4 text-right">Accuracy Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                    <span>Loading scorecards...</span>
                  </div>
                </td>
              </tr>
            ) : scorecards.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400">
                  No vendor scorecard data available.
                </td>
              </tr>
            ) : (
              scorecards.map((vendor, index) => (
                <tr key={vendor.vendor_id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-400">#{index + 1}</td>
                  <td className="p-4">
                    <span className="font-bold text-slate-900">{vendor.vendor_name}</span>
                    <span className="ml-2 font-mono text-xs text-slate-400">({vendor.vendor_code})</span>
                  </td>
                  <td className="p-4 text-center font-mono">{vendor.total_shipments}</td>
                  <td className="p-4 text-center font-mono text-emerald-700">{vendor.verified_shipments}</td>
                  <td className="p-4 text-center font-mono text-rose-700">{vendor.discrepancy_shipments}</td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      vendor.accuracy_rate >= 95 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : vendor.accuracy_rate >= 80 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {vendor.accuracy_rate}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
  );
}