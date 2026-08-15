import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import VendorScorecardPage from '@/app/vendor/scorecard/page';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockScorecardsData = [
  {
    vendor_id: 'v1',
    vendor_name: 'Apex Industrial',
    vendor_code: 'APEX-01',
    total_shipments: 20,
    verified_shipments: 19,
    discrepancy_shipments: 1,
    accuracy_rate: 96.5,
  },
  {
    vendor_id: 'v2',
    vendor_name: 'Branded Logistics',
    vendor_code: 'BRAND-02',
    total_shipments: 10,
    verified_shipments: 8,
    discrepancy_shipments: 2,
    accuracy_rate: 85.0,
  },
  {
    vendor_id: 'v3',
    vendor_name: 'Core Supply',
    vendor_code: 'CORE-03',
    total_shipments: 15,
    verified_shipments: 10,
    discrepancy_shipments: 5,
    accuracy_rate: 75.0,
  },
];

describe('VendorScorecardPage', () => {
  let selectMock: jest.Mock;
  let orderMock: jest.Mock;
  let fromMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    orderMock = jest.fn().mockResolvedValue({
      data: mockScorecardsData,
      error: null,
    });

    selectMock = jest.fn().mockReturnValue({
      order: orderMock,
    });

    fromMock = (supabase.from as jest.Mock).mockReturnValue({
      select: selectMock,
    });
  });

  it('renders loading spinner and text initially', async () => {
    // Delay resolution to capture loading state
    orderMock.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: [], error: null }), 100))
    );

    render(<VendorScorecardPage />);

    expect(screen.getByText(/loading scorecards\.\.\./i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/loading scorecards\.\.\./i)).not.toBeInTheDocument();
    });
  });

  it('fetches scorecard data from Supabase and renders rows correctly with ranks', async () => {
    render(<VendorScorecardPage />);


    expect(fromMock).toHaveBeenCalledWith('vendor_scorecards');
    expect(selectMock).toHaveBeenCalledWith('*');
    expect(orderMock).toHaveBeenCalledWith('accuracy_rate', { ascending: false });

    await waitFor(() => {
      expect(screen.getByText('Apex Industrial')).toBeInTheDocument();
    });


    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('(APEX-01)')).toBeInTheDocument();
    expect(screen.getByText('Branded Logistics')).toBeInTheDocument();
    expect(screen.getByText('Core Supply')).toBeInTheDocument();

    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('19')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    expect(screen.getByText('96.5%')).toHaveClass('bg-emerald-100 text-emerald-800');
    expect(screen.getByText('85%')).toHaveClass('bg-amber-100 text-amber-800');
    expect(screen.getByText('75%')).toHaveClass('bg-rose-100 text-rose-800');
  });

  it('renders empty state message when no scorecards are available', async () => {
    orderMock.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    render(<VendorScorecardPage />);

    await waitFor(() => {
      expect(screen.getByText(/no vendor scorecard data available\./i)).toBeInTheDocument();
    });
  });

  it('renders dashboard navigation link properly', () => {
    render(<VendorScorecardPage />);

    const backLink = screen.getByRole('link', { name: /back to dashboard/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/');
  });
});