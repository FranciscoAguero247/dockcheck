import { computeAccuracy, computeShipmentStatus, evaluateLineCount } from './verification';

describe('verification logic', () => {
  it('marks a line as matched when the counted quantity equals the expected quantity', () => {
    expect(evaluateLineCount(10, 10)).toEqual({
      matched: true,
      discrepancy: null,
    });
  });

  it('creates a shortage discrepancy when the count is below expectation', () => {
    expect(evaluateLineCount(10, 7)).toEqual({
      matched: false,
      discrepancy: {
        type: 'shortage',
        quantity: 3,
        note: 'Counted fewer than expected.',
      },
    });
  });

  it('computes a verified shipment when every line matches', () => {
    expect(computeShipmentStatus([{ expectedQty: 5, countedQty: 5 }, { expectedQty: 2, countedQty: 2 }])).toBe('verified');
  });

  it('computes a discrepancy shipment when any line mismatches', () => {
    expect(computeShipmentStatus([{ expectedQty: 5, countedQty: 4 }, { expectedQty: 2, countedQty: 2 }])).toBe('discrepancy');
  });

  it('computes accuracy as a percentage of matched lines', () => {
    expect(computeAccuracy([{ expectedQty: 5, countedQty: 5 }, { expectedQty: 2, countedQty: 1 }, { expectedQty: 3, countedQty: 3 }])).toBe(67);
  });
});
