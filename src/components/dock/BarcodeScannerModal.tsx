'use client';

import { useEffect, useRef, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BarcodeScannerModal({ 
    isOpen, 
    onClose, 
    onScan 
}: { 
    isOpen: boolean; 
    onClose: () => void;
    onScan?: (scannedValue: string) => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    interface BarcodeDetectorInstance {
        detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>>;
    }

    interface BarcodeDetectorConstructor {
        new (options: { formats: string[] }): BarcodeDetectorInstance;
    }

    useEffect(() => {
        if (!isOpen) return;

        let stream: MediaStream | null = null;
        let animationFrameId: number;
        let isMounted = true;

        async function startCamera() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });

                if (!isMounted) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                if ('BarcodeDetector' in window) {
                    const BarcodeDetectorClass = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
                    
                    if(BarcodeDetectorClass){
                        const barcodeDetector = new BarcodeDetectorClass({
                            formats: ['code_128', 'qr_code', 'ean_13', 'code_39', 'upc_a']
                        });

                        const detectCode = async () => {
                            if (!isMounted) return;

                            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                                try {
                                    const barcodes = await barcodeDetector.detect(videoRef.current);
                                    if (barcodes.length > 0 && isMounted) {
                                        const scannedValue = barcodes[0].rawValue;
                                        console.log('Scanned:', scannedValue);
                                        
                                        if (onScan) {
                                            onScan(scannedValue);
                                        } else {
                                            router.push(`/shipments/${encodeURIComponent(scannedValue)}`);
                                        }
                                        
                                        onClose();
                                        return;
                                    }
                                } catch (err: unknown) {
                                    if (err instanceof Error) {
                                        if (err.name !== 'InvalidStateError' && err.name !== 'NotSupportedError') {
                                            console.error('Unexpected barcode detection error:', err);
                                        }
                                    } else {
                                        console.error('Unexpected barcode detection error:', err);
                                    }
                                }
                            }
                            animationFrameId = requestAnimationFrame(detectCode);
                        };

                        detectCode();
                    } else {
                        console.warn('BarcodeDetector API is not supported in this browser.');
                    }
                }
            } catch {
                if (isMounted) {
                    setError('Camera permission denied or device camera unavailable.');
                }
            }
        }

        startCamera();

        return () => {
            isMounted = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [isOpen, onClose, onScan, router]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                    aria-label="Close scanner"
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Scan Shipment Ref / BOL</h3>
                <p className="text-xs text-slate-500 mb-4">Position barcode or BOL reference inside the frame</p>

                {error ? (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-xs font-semibold">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                ) : (
                    <div className="relative aspect-video bg-black rounded-xl overflow-hidden border-2 border-slate-900">
                        <video
                            ref={videoRef}
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-8 border-2 border-dashed border-emerald-400 rounded-lg pointer-events-none animate-pulse" />
                    </div>
                )}
            </div>
        </div>
    );
}