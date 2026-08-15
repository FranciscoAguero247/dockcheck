'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Camera, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import Image from 'next/image';

interface DiscrepancyPhotoUploadProps {
  shipmentId: string;
  onPhotoUploaded: (url: string) => void;
}

export function DiscrepancyPhotoUpload({ shipmentId, onPhotoUploaded }: DiscrepancyPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    setUploading(true);
    setErrorMessage(null);
    setPreview(URL.createObjectURL(file));

    const fileExt = file.name.split('.').pop();
    const filePath = `${shipmentId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('discrepancy-photos')
      .upload(filePath, file);

    if (error) {
      console.error('Photo upload failed:', error.message);
      setErrorMessage('Upload failed. Tap to try again.');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('discrepancy-photos')
      .getPublicUrl(filePath);

    onPhotoUploaded(publicUrl);
    setUploading(false);
  };

  const handleReset = () => {
    setPreview(null);
    setErrorMessage(null);
  };

  return (
    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
      {preview ? (
        <div className="relative rounded-lg overflow-hidden max-h-48">
          <Image src={preview} alt="Discrepancy preview" className="w-full h-full object-cover" />
          
          {uploading ? (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-semibold">Uploading to Bucket...</span>
            </div>
          ) : errorMessage ? (
            <div className="absolute inset-0 bg-red-900/70 flex flex-col items-center justify-center text-white gap-1 p-2">
              <XCircle className="w-6 h-6 text-red-300" />
              <span className="text-xs font-medium">{errorMessage}</span>
              <button 
                onClick={handleReset}
                className="mt-1 text-[10px] bg-white text-red-900 font-bold px-2 py-1 rounded"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
        </div>
      ) : (
        <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
          <Camera className="w-8 h-8 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Attach Photo Evidence</span>
          <span className="text-[10px] text-slate-400">Capture from Camera or Pick File</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}