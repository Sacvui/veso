'use client';

import { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';

interface OCRResult {
    text: string;
    numbers: string[];
    confidence: number;
}

export function useOCR() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const extractNumbers = (text: string): string[] => {
        // Extract numbers that are 2-6 digits
        const matches = text.match(/\b\d{2,6}\b/g) || [];
        // Remove duplicates and filter
        return [...new Set(matches.filter(n => n.length >= 2 && n.length <= 6))];
    };

    const processImage = useCallback(async (imageSource: string | File): Promise<OCRResult | null> => {
        setIsProcessing(true);
        setProgress(0);
        setError(null);

        try {
            const worker = await createWorker('vie+eng', 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                },
            });

            const { data } = await worker.recognize(imageSource);
            await worker.terminate();

            const numbers = extractNumbers(data.text);

            return {
                text: data.text,
                numbers,
                confidence: data.confidence,
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'OCR processing failed';
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
