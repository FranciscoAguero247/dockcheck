import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VendorScorecardPage from '../page';
import { exportToCSV } from '@/lib/csvExport';

jest.mock('@/lib/csvExport', () => ({
  exportToCSV: jest.fn(),
}));

const mockScorecards = [
  {
    id: 'v1',
    vendor_name: 'Apex Industrial',
    total_pos: 20,
    on_time_deliveries: 19,
    discrepancy_count: 1,
    accuracy_rate: 95.0,
  },
  {
    id: 'v2',
    vendor_name: 'Branded Logistics',
    total_pos: 10,
    on_time_deliveries: 7,
    discrepancy_count: 3,
    accuracy_rate: 70.0,
  },
];

jest.mock('@/hooks/useVendorScorecards', () => ({
  useVendorScorecards: jest.fn(() => ({
    data: mockScorecards,
    loading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

import { useVendorScorecards } from '@/hooks/useVendorScorecards';

describe('VendorScorecard Page View', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeleton/spinner when loading state is true', () => {
    (useVendorScorecards as jest.Mock).mockReturnValue({
      data: [],
      loading: true,
      error: null,
    });

    render(<VendorScorecardPage />);
    expect(screen.getByTestId('scorecard-loading-skeleton')).toBeInTheDocument();
  });

  it('renders vendor metrics correctly when data loads', () => {
    render(<VendorScorecardPage />);

    expect(screen.getByText('Apex Industrial')).toBeInTheDocument();
    expect(screen.getByText('Branded Logistics')).toBeInTheDocument();

    const apexRow = screen.getByText('Apex Industrial').closest('tr')!;
    expect(within(apexRow).getByText('20')).toBeInTheDocument();
    expect(within(apexRow).getByText('95%')).toBeInTheDocument();

    const brandedRow = screen.getByText('Branded Logistics').closest('tr')!;
    expect(within(brandedRow).getByText('70%')).toBeInTheDocument();
  });

  it('filters vendor list when searching by vendor name', async () => {
    render(<VendorScorecardPage />);

    const searchInput = screen.getByPlaceholderText(/search vendor/i);
    await userEvent.type(searchInput, 'Apex');

    expect(screen.getByText('Apex Industrial')).toBeInTheDocument();
    expect(screen.queryByText('Branded Logistics')).not.toBeInTheDocument();
  });

  it('displays error state when hook fails', () => {
    (useVendorScorecards as jest.Mock).mockReturnValue({
      data: [],
      loading: false,
      error: 'Failed to connect to database',
    });

    render(<VendorScorecardPage />);
    expect(screen.getByText(/failed to connect to database/i)).toBeInTheDocument();
  });

  it('calls exportToCSV with formatted scorecard data on CSV button click', async () => {
    render(<VendorScorecardPage />);

    const exportBtn = screen.getByRole('button', { name: /export csv/i });
    await userEvent.click(exportBtn);

    expect(exportToCSV).toHaveBeenCalledTimes(1);
    expect(exportToCSV).toHaveBeenCalledWith(
      expect.stringMatching(/vendor-scorecards-.*\.csv/),
      mockScorecards,
      expect.arrayContaining([
        expect.objectContaining({ key: 'vendor_name' }),
        expect.objectContaining({ key: 'accuracy_rate' }),
      ])
    );
  });
});