'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Upload, X, Loader2, SwitchCamera, ZoomIn, FlashlightOff, Flashlight } from 'lucide-react';
import { useOCR } from '@/hooks/useOCR';

interface OCRDetectionResult {
    numbers: string[];
    date?: string;
    province?: string;
}

interface ImageUploaderProps {
    onNumbersDetected: (result: OCRDetectionResult) => void;
}

export function ImageUploader({ onNumbersDetected }: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [hasFlash, setHasFlash] = useState(false);
    const [flashOn, setFlashOn] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const { processImage, isProcessing, progress, error } = useOCR();

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleFile = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        const result = await processImage(file);
        if (result && result.numbers.length > 0) {
            onNumbersDetected({
                numbers: result.numbers,
                date: result.date,
                province: result.province,
            });
        }
    }, [processImage, onNumbersDetected]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const clearImage = () => {
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Open camera
    const openCamera = async () => {
        try {
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }

            // Check for flash capability
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities?.() as any;
            setHasFlash(capabilities?.torch === true);

            setIsCameraOpen(true);
        } catch (err) {
            console.error('Camera access denied:', err);
            alert('Không thể truy cập camera. Vui lòng cho phép quyền camera.');
        }
    };

    // Close camera
    const closeCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
        setFlashOn(false);
    };

    // Switch camera
    const switchCamera = () => {
        closeCamera();
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
        setTimeout(openCamera, 100);
    };

    // Toggle flash
    const toggleFlash = async () => {
        if (streamRef.current) {
            const track = streamRef.current.getVideoTracks()[0];
            try {
                await (track as any).applyConstraints({ advanced: [{ torch: !flashOn }] });
                setFlashOn(!flashOn);
            } catch (err) {
                console.error('Flash toggle failed:', err);
            }
        }
    };

    // Capture photo
    const capturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0);

        // Get image data
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setPreview(imageData);

        // Close camera
        closeCamera();

        // Process with OCR
        const result = await processImage(imageData);
        if (result && result.numbers.length > 0) {
            onNumbersDetected({
                numbers: result.numbers,
                date: result.date,
                province: result.province,
            });
        }
    };

    return (
        <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">📸</span> Chụp hoặc Tải Vé Số
            </h2>

            {/* Camera View */}
            {isCameraOpen ? (
                <div className="relative rounded-xl overflow-hidden bg-black">
                    {/* Video Feed */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full aspect-[3/4] object-cover"
                    />

                    {/* Scan Frame Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Darkened corners */}
                        <div className="absolute inset-0 bg-black/50" />

                        {/* Clear center area for lottery ticket */}
                        <div className="absolute left-[10%] right-[10%] top-[15%] bottom-[25%] bg-transparent"
                            style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }}>

                            {/* Corner guides */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg" />

                            {/* Scan line animation */}
                            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan" />
                        </div>

                        {/* Guide text */}
                        <div className="absolute top-4 left-0 right-0 text-center">
                            <p className="text-white text-sm bg-black/50 inline-block px-4 py-1 rounded-full">
                                📋 Đặt vé số vào khung
                            </p>
                        </div>

                        <div className="absolute bottom-[18%] left-0 right-0 text-center">
                            <p className="text-white/80 text-xs">
                                Giữ vé số thẳng và rõ ràng
                            </p>
                        </div>
                    </div>

                    {/* Camera Controls */}
                    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-6">
                        {/* Flash Toggle */}
                        {hasFlash && (
                            <button
                                onClick={toggleFlash}
                                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition"
                            >
                                {flashOn ? <Flashlight size={24} /> : <FlashlightOff size={24} />}
                            </button>
                        )}

                        {/* Capture Button */}
                        <button
                            onClick={capturePhoto}
                            className="w-20 h-20 rounded-full bg-white flex items-center justify-center hover:scale-105 transition shadow-lg"
                        >
                            <div className="w-16 h-16 rounded-full border-4 border-gray-800" />
                        </button>

                        {/* Switch Camera */}
                        <button
                            onClick={switchCamera}
                            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition"
                        >
                            <SwitchCamera size={24} />
                        </button>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={closeCamera}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition"
                    >
                        <X size={24} />
                    </button>

                    {/* Hidden Canvas for capture */}
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            ) : (
                <>
                    {/* Upload Area */}
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                            }`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => !preview && fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleChange}
                            className="hidden"
                        />

                        {preview ? (
                            <div className="relative">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="max-h-64 mx-auto rounded-lg object-contain"
                                />
                                <button
                                    onClick={(e) => { e.stopPropagation(); clearImage(); }}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); openCamera(); }}
                                        className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center hover:scale-105 transition"
                                    >
                                        <Camera size={28} />
                                    </button>
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center animate-pulse-custom">
                                        <Upload size={28} />
                                    </div>
                                </div>
                                <p className="text-white font-medium">Nhấn 📷 để mở camera hoặc tải ảnh từ thư viện</p>
                                <p className="text-white/50 text-sm">Hỗ trợ JPG, PNG - Tối đa 10MB</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Camera Button */}
                    {!preview && (
                        <button
                            onClick={openCamera}
                            className="w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition"
                        >
                            <Camera size={20} />
                            Mở Camera Quét Vé Số
                        </button>
                    )}
                </>
            )}

            {/* Processing Status */}
            {isProcessing && (
                <div className="mt-4 flex items-center justify-center gap-3 p-4 bg-purple-500/10 rounded-lg">
                    <Loader2 className="animate-spin text-purple-400" size={20} />
                    <span className="text-purple-300">Đang nhận diện số... {progress}%</span>
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300">
                    ⚠️ {error}
                </div>
            )}

            {/* Add scan animation style */}
            <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
