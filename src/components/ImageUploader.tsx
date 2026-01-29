'use client';

import { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { useOCR } from '@/hooks/useOCR';

interface ImageUploaderProps {
    onNumbersDetected: (numbers: string[]) => void;
}

export function ImageUploader({ onNumbersDetected }: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { processImage, isProcessing, progress, error } = useOCR();

    const handleFile = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) return;

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Process with OCR
        const result = await processImage(file);
        if (result && result.numbers.length > 0) {
            onNumbersDetected(result.numbers);
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

    return (
        <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">📸</span> Chụp hoặc Tải Vé Số
            </h2>

            <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
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
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse-custom">
                                <Camera size={28} />
                            </div>
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center animate-pulse-custom">
                                <Upload size={28} />
                            </div>
                        </div>
                        <p className="text-white font-medium">Nhấn để chụp ảnh hoặc chọn từ thư viện</p>
                        <p className="text-white/50 text-sm">Hỗ trợ JPG, PNG - Tối đa 10MB</p>
                    </div>
                )}
            </div>

            {/* Processing Status */}
            {isProcessing && (
                <div className="mt-4 flex items-center justify-center gap-3 p-4 bg-purple-500/10 rounded-lg">
                    <Loader2 className="animate-spin text-purple-400" size={20} />
                    <span className="text-purple-300">Đang nhận diện... {progress}%</span>
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300">
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
}
