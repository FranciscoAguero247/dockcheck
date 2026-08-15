export interface CSVHeader<T> {
  key: keyof T;
  label: string;
}

export function formatCSVRow(row: Array<string | number | null | undefined>): string {
  return row
    .map((cell) => {
      if (cell === null || cell === undefined) {
        return '';
      }
      const stringValue = String(cell);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    })
    .join(',');
}

export function exportShipmentsToCSV<T extends Record<string, unknown>>(
  filename: string,
  data: T[],
  headers: CSVHeader<T>[]
): void {
  if (!data || data.length === 0) {
    return;
  }

  const csvRows: string[] = [];

  const headerLabels = headers.map((header) => header.label);
  csvRows.push(formatCSVRow(headerLabels));

  for (const item of data) {
    const rowValues = headers.map((header) => {
      const value = item[header.key];
      if (value === null || value === undefined) {
        return '';
      }
      return value as string | number;
    });
    csvRows.push(formatCSVRow(rowValues));
  }

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}