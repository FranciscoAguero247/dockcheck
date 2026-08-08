import { Shipment } from '@/types/database';

export function exportShipmentsToCSV(shipments: Shipment[]): void {
  const headers = ['ID', 'Reference (BOL)', 'Trailer Number', 'Expected Pallets', 'Status', 'Scheduled Arrival'];
  
  const rows = shipments.map((s) => [
    s.id,
    `"${(s.reference_number || '').replace(/"/g, '""')}"`,
    `"${(s.trailer_number || '').replace(/"/g, '""')}"`,
    s.expected_pallets,
    s.status,
    `"${(s.scheduled_arrival || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `dockcheck_manifest_${new Date().toISOString().slice(0, 10)}.csv`);
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}