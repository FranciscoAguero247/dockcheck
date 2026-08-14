import { exportShipmentsToCSV, formatCSVRow } from './csvExport';

describe('CSV Export Utility', () => {
  let appendChildSpy: jest.SpyInstance;
  let removeChildSpy: jest.SpyInstance;
  let createObjectURLSpy: jest.SpyInstance;
  let revokeObjectURLSpy: jest.SpyInstance;

  beforeEach(() => {
    appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node as any);
    removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node as any);

    createObjectURLSpy = jest.spyOn(global.URL, 'createObjectURL').mockReturnValue('blob:http://localhost/mock-url');
    revokeObjectURLSpy = jest.spyOn(global.URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('formatCSVRow', () => {
    it('formats basic string values correctly', () => {
      const row = ['Vendor A', 'PO-1002', 'Received'];
      expect(formatCSVRow(row)).toBe('Vendor A,PO-1002,Received');
    });

    it('escapes fields containing commas', () => {
      const row = ['Acme, Inc.', 'PO-1002', 'OK'];
      expect(formatCSVRow(row)).toBe('"Acme, Inc.",PO-1002,OK');
    });

    it('escapes double quotes by doubling them', () => {
      const row = ['Widget "X"', 'PO-1003'];
      expect(formatCSVRow(row)).toBe('"Widget ""X""",PO-1003');
    });

    it('handles null, undefined, and numbers gracefully', () => {
      const row = [100, null, undefined, 99.5];
      expect(formatCSVRow(row)).toBe('100,,,99.5');
    });
  });

  describe('exportShipmentsToCSV', () => {
    const mockData = [
      { vendor: 'Acme Corp', totalDeliveries: 45, accuracyRate: '98%' },
      { vendor: 'Global Logistics, LLC', totalDeliveries: 12, accuracyRate: '85%' },
    ];

    const headers = [
      { key: 'vendor' as const, label: 'Vendor Name' },
      { key: 'totalDeliveries' as const, label: 'Total Deliveries' },
      { key: 'accuracyRate' as const, label: 'Accuracy' },
    ];

    it('creates a download link and triggers click on export', () => {
      const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      exportShipmentsToCSV('vendor-scorecard.csv', mockData, headers);

      expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
      expect(appendChildSpy).toHaveBeenCalledTimes(1);
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(removeChildSpy).toHaveBeenCalledTimes(1);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/mock-url');
    });

    it('does not trigger download if dataset is empty', () => {
      const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      exportShipmentsToCSV('empty.csv', [], headers);

      expect(createObjectURLSpy).not.toHaveBeenCalled();
      expect(clickSpy).not.toHaveBeenCalled();
    });
  });
});