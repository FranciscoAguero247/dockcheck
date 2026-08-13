import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiscrepancyPhotoUpload } from '../DiscrepancyPhotoUpload';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
      }),
    },
  },
}));

describe('DiscrepancyPhotoUpload Component', () => {
  const mockOnUploadSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area correctly', () => {
    render(<DiscrepancyPhotoUpload poId="po-123" onUploadSuccess={mockOnUploadSuccess} />);

    expect(screen.getByText(/upload discrepancy photo/i)).toBeInTheDocument();
    expect(screen.getByText(/png, jpg up to 5mb/i)).toBeInTheDocument();
  });

  it('shows error if a non-image file is selected', async () => {
    render(<DiscrepancyPhotoUpload poId="po-123" onUploadSuccess={mockOnUploadSuccess} />);

    const invalidFile = new File(['text content'], 'notes.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/choose file/i) as HTMLInputElement;

    await userEvent.upload(input, invalidFile);

    expect(screen.getByText(/only image files \(png, jpg\) are allowed/i)).toBeInTheDocument();
    expect(mockOnUploadSuccess).not.toHaveBeenCalled();
  });

  it('shows error if file size exceeds max limit (5MB)', async () => {
    render(<DiscrepancyPhotoUpload poId="po-123" onUploadSuccess={mockOnUploadSuccess} />);

    const oversizedFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large-damage.jpg', {
      type: 'image/jpeg',
    });
    const input = screen.getByLabelText(/choose file/i) as HTMLInputElement;

    await userEvent.upload(input, oversizedFile);

    expect(screen.getByText(/file size must be less than 5mb/i)).toBeInTheDocument();
    expect(mockOnUploadSuccess).not.toHaveBeenCalled();
  });

  it('uploads valid image to Supabase and returns public URL', async () => {
    const mockUpload = jest.fn().mockResolvedValue({
      data: { path: 'discrepancies/po-123/damage.png' },
      error: null,
    });
    const mockGetPublicUrl = jest.fn().mockReturnValue({
      data: { publicUrl: 'https://supabase.co/storage/v1/object/public/discrepancies/damage.png' },
    });

    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    });

    render(<DiscrepancyPhotoUpload poId="po-123" onUploadSuccess={mockOnUploadSuccess} />);

    const validFile = new File(['fake-image-bytes'], 'damage.png', { type: 'image/png' });
    const input = screen.getByLabelText(/choose file/i) as HTMLInputElement;

    await userEvent.upload(input, validFile);

    expect(screen.getByText(/uploading.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining('po-123/'),
        validFile,
        expect.objectContaining({ cacheControl: '3600', upsert: false })
      );
      expect(mockOnUploadSuccess).toHaveBeenCalledWith(
        'https://supabase.co/storage/v1/object/public/discrepancies/damage.png'
      );
    });

    expect(screen.getByText(/upload complete/i)).toBeInTheDocument();
  });

  it('handles Supabase upload errors gracefully', async () => {
    const mockUpload = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Storage quota exceeded' },
    });

    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: jest.fn(),
    });

    render(<DiscrepancyPhotoUpload poId="po-123" onUploadSuccess={mockOnUploadSuccess} />);

    const validFile = new File(['fake-image-bytes'], 'damage.png', { type: 'image/png' });
    const input = screen.getByLabelText(/choose file/i) as HTMLInputElement;

    await userEvent.upload(input, validFile);

    await waitFor(() => {
      expect(screen.getByText(/storage quota exceeded/i)).toBeInTheDocument();
      expect(mockOnUploadSuccess).not.toHaveBeenCalled();
    });
  });
});