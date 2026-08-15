import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiscrepancyPhotoUpload } from './DiscrepancyPhotoUpload';
import { supabase } from '@/lib/supabase';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  },
}));

describe('DiscrepancyPhotoUpload Component', () => {
  const mockOnUploadSuccess = jest.fn();
  const defaultProps = {
    poId: 'PO-123',
    onUploadSuccess: mockOnUploadSuccess,
  };

  beforeAll(() => {
    // Polyfill JSDOM URL methods
    Object.defineProperty(window, 'URL', {
      writable: true,
      value: {
        createObjectURL: jest.fn(() => 'blob:http://localhost/fake-temp-url'),
        revokeObjectURL: jest.fn(),
      },
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area correctly', () => {
    render(<DiscrepancyPhotoUpload {...defaultProps} />);

    expect(screen.getByText(/upload discrepancy photo/i)).toBeInTheDocument();
    expect(screen.getByText(/png, jpg up to 5mb/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/choose file/i)).toBeInTheDocument();
  });

  it('shows error if a non-image file is selected', async () => {
    render(<DiscrepancyPhotoUpload {...defaultProps} />);

    const input = screen.getByLabelText(/choose file/i);
    const invalidFile = new File(['hello'], 'document.pdf', { type: 'application/pdf' });

    // applyAccept: false forces userEvent to pass non-matching files to onChange
    await userEvent.upload(input, invalidFile, { applyAccept: false });

    const errorMessage = await screen.findByText(/only image files \(png, jpg\) are allowed/i);
    expect(errorMessage).toBeInTheDocument();
    expect(mockOnUploadSuccess).not.toHaveBeenCalled();
  });

  it('shows error if file size exceeds max limit (5MB)', async () => {
    render(<DiscrepancyPhotoUpload {...defaultProps} />);

    const input = screen.getByLabelText(/choose file/i);
    // Create dummy file larger than 5MB
    const largeFile = new File([new ArrayBuffer(5 * 1024 * 1024 + 1)], 'large.png', {
      type: 'image/png',
    });

    await userEvent.upload(input, largeFile);

    const errorMessage = await screen.findByText(/file size must be less than 5mb/i);
    expect(errorMessage).toBeInTheDocument();
    expect(mockOnUploadSuccess).not.toHaveBeenCalled();
  });

  it('uploads valid image to Supabase and returns public URL', async () => {
    const mockUpload = jest.fn();
    const mockGetPublicUrl = jest.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/storage/PO-123/photo.png' },
    });

    let resolveUploadPromise: (value: {
      data: { path: string } | null;
      error: { message: string } | null;
    }) => void;
    
    const uploadPromise = new Promise<{
      data: { path: string } | null;
      error: { message: string } | null;
    }>((resolve) => {
      resolveUploadPromise = resolve;
    });

    mockUpload.mockReturnValue(uploadPromise);

    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    });

    render(<DiscrepancyPhotoUpload {...defaultProps} />);

    const input = screen.getByLabelText(/choose file/i);
    const validFile = new File(['img-content'], 'test.png', { type: 'image/png' });

    await userEvent.upload(input, validFile);

    expect(await screen.findByText(/uploading.../i)).toBeInTheDocument();

    resolveUploadPromise!({ data: { path: 'PO-123/12345.png' }, error: null });

    await waitFor(() => {
      expect(screen.getByText(/upload complete/i)).toBeInTheDocument();
    });

    expect(mockOnUploadSuccess).toHaveBeenCalledWith(
      'https://example.com/storage/PO-123/photo.png'
    );
  });

  it('handles Supabase upload errors gracefully', async () => {
    const mockUpload = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Upload failed: Storage bucket full' },
    });

    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: jest.fn(),
    });

    render(<DiscrepancyPhotoUpload {...defaultProps} />);

    const input = screen.getByLabelText(/choose file/i);
    const validFile = new File(['img-content'], 'test.png', { type: 'image/png' });

    await userEvent.upload(input, validFile);

    const errorMessage = await screen.findByText(/upload failed: storage bucket full/i);
    expect(errorMessage).toBeInTheDocument();
    expect(mockOnUploadSuccess).not.toHaveBeenCalled();
  });
});