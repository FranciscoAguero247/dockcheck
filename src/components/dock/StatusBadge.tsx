import { ShipmentStatus } from '@/types/database';
import { clsx } from 'clsx';

const statusStyles: Record<ShipmentStatus, string> = {
  expected: 'bg-slate-100 text-slate-700 border-slate-300',
  receiving: 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse',
  verified: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  discrepancy: 'bg-rose-50 text-rose-800 border-rose-300',
};

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize',
        statusStyles[status]
      )}
    >
      {status}
    </span>
  );
}