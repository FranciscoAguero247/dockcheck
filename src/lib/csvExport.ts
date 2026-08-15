import { Shipment } from '@/types/database';

export interface CSVHeader<T> {
  key: keyof T;
  label: string;
}

export function formatCSVRow(row: unknown[]): string {
  return row
    .map((val) => {
      if (val === null || val === undefined) {
        return '';
      }
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    })
    .join(',');
}

export function exportShipmentsToCSV<T extends Record<string, unknown>>(
  filenameOrShipments: string | Shipment[],
  data?: T[],
  headers?: CSVHeader<T>[]
): void {
  let filename = `dockcheck_manifest_${new Date().toISOString().slice(0, 10)}.csv`;
  let csvRows: unknown[][] = [];

  if (typeof filenameOrShipments === 'string') {
    filename = filenameOrShipments;
    const items = data || [];
    if (items.length === 0) return;

    if (headers && headers.length > 0) {
      const headerLabels = headers.map((h) => h.label);
      const dataRows = items.map((item) => headers.map((h) => item[h.key]));
      csvRows = [headerLabels, ...dataRows];
    } else {
      const keys = Object.keys(items[0] || {});
      const dataRows = items.map((item) => keys.map((k) => item[k]));
      csvRows = [keys, ...dataRows];
    }
  } 
  else {
    const shipments = filenameOrShipments;
    if (!shipments || shipments.length === 0) return;

    const defaultHeaders = [
      'ID',
      'Reference (BOL)',
      'Trailer Number',
      'Expected Pallets',
      'Status',
      'Scheduled Arrival',
    ];

    const dataRows = shipments.map((s) => [
      s.id,
      s.reference_number ?? '',
      s.trailer_number ?? '',
      s.expected_pallets,
      s.status,
      s.scheduled_arrival ?? '',
    ]);

    csvRows = [defaultHeaders, ...dataRows];
  }

  const csvContent = csvRows.map(formatCSVRow).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}