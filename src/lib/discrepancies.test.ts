import { filterDiscrepancies } from './discrepancies';

describe('filterDiscrepancies', () => {
  const items = [
    {
      id: '1',
      shipment_id: 'ship-1',
      line_item_id: 'line-1',
      type: 'shortage' as const,
      affected_qty: 3,
      notes: 'Missing pallets',
      receiver_name: 'Nina',
      logged_at: '2026-07-31T10:00:00.000Z',
    },
    {
      id: '2',
      shipment_id: 'ship-1',
      line_item_id: 'line-2',
      type: 'overage' as const,
      affected_qty: 2,
      notes: 'Extra cartons',
      receiver_name: 'Mina',
      logged_at: '2026-07-31T10:15:00.000Z',
    },
  ];

  it('filters by discrepancy type and receiver name', () => {
    expect(filterDiscrepancies(items, { type: 'shortage', receiver: 'nina' })).toEqual([items[0]]);
  });

  it('returns all items when no filters are applied', () => {
    expect(filterDiscrepancies(items, {})).toEqual(items);
  });
});
