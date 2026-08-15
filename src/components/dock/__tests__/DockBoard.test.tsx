process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_token';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DockBoardPage from '@/app/page';

jest.mock('@/hooks/useShipments', () => ({
  useShipments: () => ({
    shipments: [
      {
        id: 'shipment-1',
        vendor_id: 'vendor-1',
        reference_number: 'BOL-100',
        trailer_number: 'TR-1',
        scheduled_arrival: '2026-07-31T10:00:00.000Z',
        status: 'receiving',
        expected_pallets: 4,
        expected_cartons: 120,
        vendor: { id: 'vendor-1', name: 'Apex Logistics', code: 'APX' },
      },
    ],
    loading: false,
    error: null,
  }),
}));

describe('DockBoardPage', () => {
  it('renders the dock board and allows status filtering', async () => {
    const user = userEvent.setup();
    render(<DockBoardPage />);

    expect(screen.getByText('Dock Board')).toBeInTheDocument();
    expect(screen.getByText('Apex Logistics')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /verified/i }));
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });
});
