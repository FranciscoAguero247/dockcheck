import { buildLineItemUpdates } from './receiving';

describe('receiving line item updates', () => {
  it('preserves shipment_id when building line item updates', () => {
    const updates = buildLineItemUpdates(
      'shipment-123',
      [{ id: 'line-1', expected_qty: 10 }],
      [{ id: 'line-1', counted: 8 }]
    );

    expect(updates).toEqual([
      {
        id: 'line-1',
        shipment_id: 'shipment-123',
        received_qty: 8,
        is_verified: false,
      },
    ]);
  });
});
