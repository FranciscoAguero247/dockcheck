import Papa from 'papaparse';
import { Shipment } from '@/types/database';

export interface ImportedShipmentRow {
  'ID'?: string;
  'Reference (BOL)'?: string;
  'Trailer Number'?: string;
  'Expected Pallets'?: string;
  'Status'?: string;
  'Scheduled Arrival'?: string;
}

export function parseShipmentsCSV(
  file: File,
  onComplete: (data: Partial<Shipment>[]) => void,
  onError: (error: string) => void
): void {
  Papa.parse<ImportedShipmentRow>(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      try {
        const mappedShipments: Partial<Shipment>[] = results.data.map((row) => ({
          reference_number: row['Reference (BOL)'] || '',
          trailer_number: row['Trailer Number'] || '',
          expected_pallets: row['Expected Pallets'] ? parseInt(row['Expected Pallets'], 10) : 0,
          status: (row['Status'] as Shipment['status']) || 'expected',
          scheduled_arrival: row['Scheduled Arrival'] || '',
        }));

        onComplete(mappedShipments);
      } catch {
        onError('Failed to map CSV rows to shipment structure.');
      }
    },
    error: (error) => {
      onError(error.message);
    },
  });
}