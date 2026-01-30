'use client';

import { useState, useCallback } from 'react';

interface GeminiOCRResult {
    numbers: string[];
    date?: string;
    province?: string;
    rawText?: string;
}

// Compress image to reduce token usage
async function compressImage(imageSrc: string, maxWidth: number = 800, quality: number = 0.7): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calculate new dimensions
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                // Convert to JPEG with compression
                resolve(canvas.toDataURL('image/jpeg', quality));
            } else {
                resolve(imageSrc);
            }
        };
        img.onerror = () => resolve(imageSrc);
        img.src = imageSrc;
    });
}

export function useGeminiOCR() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const processImage = useCallback(async (imageSource: string | File): Promise<GeminiOCRResult | null> => {
        setIsProcessing(true);
        setProgress(0);
        setError(null);

        try {
            // Convert File to base64 if needed
            let imageSrc = imageSource;
            if (imageSource instanceof File) {
                setProgress(10);
                imageSrc = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.readAsDataURL(imageSource);
                });
            }

            setProgress(20);

            // Compress image to reduce token usage (prevents quota issues)
            // Lottery tickets have large numbers, so smaller images work fine
            const compressedImage = await compressImage(imageSrc as string, 500, 0.6);
            setProgress(40);

            // Call server-side API (API key is secure on server)
            const response = await fetch('/api/ocr/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: compressedImage }),
            });

            setProgress(80);

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Lỗi nhận diện AI');
            }

            setProgress(100);

            return {
                numbers: result.numbers || [],
                date: result.date,
                province: result.province,
                rawText: result.rawText,
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Lỗi xử lý ảnh với AI';
            setError(message);
            return null;
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    }, []);

    return {
        processImage,
        isProcessing,
        progress,
        error,
    };
}
