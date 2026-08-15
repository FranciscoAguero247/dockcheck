'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface DiscrepancyPhotoUploadProps {
  poId: string;
  onUploadSuccess: (url: string) => void;
}

export function DiscrepancyPhotoUpload({ poId, onUploadSuccess }: DiscrepancyPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccess(false);

    // Validate file type (Only PNG, JPG)
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setErrorMessage('Only image files (png, jpg) are allowed');
      return;
    }

    // Validate file size (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size must be less than 5MB');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const filePath = `${poId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('discrepancies')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) {
      setErrorMessage(error.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('discrepancies')
      .getPublicUrl(filePath);

    setUploading(false);
    setSuccess(true);
    onUploadSuccess(publicUrl);
  };

  return (
    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
      {preview && !errorMessage ? (
        <div className="relative rounded-lg overflow-hidden max-h-48">
          <Image src={preview} alt="Discrepancy preview" width={200} height={200} className="w-full h-full object-cover" />
          
          {uploading ? (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Uploading...</span>
            </div>
          ) : success ? (
            <div className="absolute inset-0 bg-emerald-900/40 flex items-center justify-center text-white gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>Upload complete</span>
            </div>
          ) : null}
        </div>
      ) : (
        <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
          <Camera className="w-8 h-8 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Upload discrepancy photo</span>
          <span className="text-[10px] text-slate-400">PNG, JPG up to 5MB</span>
          <input
            type="file"
            accept="image/png, image/jpeg"
            aria-label="Choose file"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}

      {errorMessage && (
        <div className="mt-2 text-red-600 text-xs font-medium">
          {errorMessage}
        </div>
      )}
    </div>
  );
}