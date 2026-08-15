import { formatCSVRow, exportShipmentsToCSV, CSVHeader } from './csvExport';

describe('CSV Export Utilities', () => {
  describe('formatCSVRow', () => {
    it('should format simple string and number values correctly', () => {
      const row = ['apple', 123, 'banana'];
      expect(formatCSVRow(row)).toBe('apple,123,banana');
    });

    it('should convert null and undefined values to empty strings', () => {
      const row = [null, undefined, 'text'];
      expect(formatCSVRow(row)).toBe(',,text');
    });

    it('should wrap values containing commas in double quotes', () => {
      const row = ['hello, world', 'normal'];
      expect(formatCSVRow(row)).toBe('"hello, world",normal');
    });

    it('should escape internal double quotes and wrap the value in quotes', () => {
      const row = ['say "hello"', 'normal'];
      expect(formatCSVRow(row)).toBe('"say ""hello""",normal');
    });

    it('should wrap values containing newlines in double quotes', () => {
      const row = ['line1\nline2', 'normal'];
      expect(formatCSVRow(row)).toBe('"line1\nline2",normal');
    });
  });

  describe('exportShipmentsToCSV', () => {
    let createObjectURLMock: jest.Mock;
    let revokeObjectURLMock: jest.Mock;
    let clickMock: jest.Mock;
    let appendChildSpy: jest.SpyInstance;
    let removeChildSpy: jest.SpyInstance;

    beforeEach(() => {
      createObjectURLMock = jest.fn().mockReturnValue('blob:mock-url');
      revokeObjectURLMock = jest.fn();
      clickMock = jest.fn();

      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      // Mock anchor element for download trigger
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return {
            setAttribute: jest.fn(),
            style: {},
            click: clickMock,
          } as unknown as HTMLAnchorElement;
        }
        return document.createElementNS('http://www.w3.org/1999/xhtml', tagName);
      });

      appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should do nothing if the data array is empty', () => {
      const data: Record<string, unknown>[] = [];
      const headers: CSVHeader<Record<string, unknown>>[] = [{ key: 'id', label: 'ID' }];

      exportShipmentsToCSV('shipments.csv', data, headers);

      expect(createObjectURLMock).not.toHaveBeenCalled();
      expect(clickMock).not.toHaveBeenCalled();
    });

    it('should generate a CSV blob, append anchor, trigger click, and cleanup', () => {
      interface Shipment {
        id: number;
        trackingNumber: string;
        status: string | null;
      }

      const data: Shipment[] = [
        { id: 1, trackingNumber: 'TRK123', status: 'Delivered' },
        { id: 2, trackingNumber: 'TRK456,EXP', status: null },
      ];

      const headers: CSVHeader<Shipment>[] = [
        { key: 'id', label: 'ID' },
        { key: 'trackingNumber', label: 'Tracking Number' },
        { key: 'status', label: 'Status' },
      ];

      exportShipmentsToCSV('shipments.csv', data, headers);

      expect(createObjectURLMock).toHaveBeenCalledTimes(1);
      const blobArg = createObjectURLMock.mock.calls[0][0];
      expect(blobArg).toBeInstanceOf(Blob);

      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});