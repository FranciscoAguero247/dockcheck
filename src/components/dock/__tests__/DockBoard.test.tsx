import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DockBoardPage from '@/app/page';

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '';
  },
}));

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '';
  },
}));

jest.mock('@/hooks/useRole', () => ({
  useRole: () => ({
    role: 'supervisor',
    loading: false,
    isSupervisor: true,
  }),
}));

const mockShipmentsData = [
  {
    id: 'shipment-1',
    vendor_id: 'vendor-1',
    reference_number: 'BOL-100',
    trailer_number: 'TR-1',
    scheduled_arrival: '2026-08-14T10:00:00.000Z',
    status: 'receiving',
    expected_pallets: 4,
    expected_cartons: 120,
    vendor: { id: 'vendor-1', name: 'Apex Logistics', code: 'APX' },
  },
  {
    id: 'shipment-2',
    vendor_id: 'vendor-2',
    reference_number: 'BOL-101',
    trailer_number: 'TR-2',
    scheduled_arrival: '2026-08-14T11:00:00.000Z',
    status: 'verified',
    expected_pallets: 2,
    expected_cartons: 60,
    vendor: { id: 'vendor-2', name: 'Beta Freight', code: 'BET' },
  },
];

jest.mock('@/hooks/useShipments', () => ({
  useShipments: (filters?: { status?: string; date?: string }) => {
    let filtered = mockShipmentsData;
    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter((s) => s.status === filters.status);
    }
    return {
      shipments: filtered,
      loading: false,
      error: null,
    };
  },
}));

describe('DockBoardPage', () => {
  it('renders the dock board and allows status filtering', async () => {
    const user = userEvent.setup();
    render(<DockBoardPage />);

    expect(screen.getByText('Dock Board')).toBeInTheDocument();
    
    expect(await screen.findByText('Apex Logistics')).toBeInTheDocument();
    expect(screen.getByText('Beta Freight')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /verified/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Beta Freight')).toBeInTheDocument();
      expect(screen.queryByText('Apex Logistics')).not.toBeInTheDocument();
    });
  });
});