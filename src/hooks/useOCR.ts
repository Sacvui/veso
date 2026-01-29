'use client';

import { useState, useCallback } from 'react';
import { createWorker, PSM } from 'tesseract.js';

interface OCRResult {
    text: string;
    numbers: string[];
    confidence: number;
    province?: string;
    date?: string;
}

export function useOCR() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Enhanced image preprocessing for lottery tickets
    const preprocessImage = async (imageSource: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(imageSource);
                    return;
                }

                // Scale up small images for better OCR
                const scale = img.width < 1000 ? 2 : 1;
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                // Enable image smoothing for scaling
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Step 1: Convert to grayscale
                for (let i = 0; i < data.length; i += 4) {
                    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                    data[i] = data[i + 1] = data[i + 2] = gray;
                }

                // Step 2: Increase contrast (lottery tickets often have low contrast)
                const contrast = 1.8;
                const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
                    data[i + 1] = data[i];
                    data[i + 2] = data[i];
                }

                // Step 3: Adaptive thresholding (binarization)
                // Use Otsu's method approximation
                const histogram = new Array(256).fill(0);
                for (let i = 0; i < data.length; i += 4) {
                    histogram[Math.floor(data[i])]++;
                }

                // Find optimal threshold
                let total = canvas.width * canvas.height;
                let sum = 0;
                for (let i = 0; i < 256; i++) sum += i * histogram[i];

                let sumB = 0, wB = 0, wF = 0;
                let maxVariance = 0, threshold = 128;

                for (let t = 0; t < 256; t++) {
                    wB += histogram[t];
                    if (wB === 0) continue;
                    wF = total - wB;
                    if (wF === 0) break;

                    sumB += t * histogram[t];
                    const mB = sumB / wB;
                    const mF = (sum - sumB) / wF;
                    const variance = wB * wF * (mB - mF) * (mB - mF);

                    if (variance > maxVariance) {
                        maxVariance = variance;
                        threshold = t;
                    }
                }

                // Apply threshold
                for (let i = 0; i < data.length; i += 4) {
                    const binary = data[i] > threshold ? 255 : 0;
                    data[i] = data[i + 1] = data[i + 2] = binary;
                }

                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(imageSource);
            img.src = imageSource;
        });
    };

    // Extract lottery-specific patterns from text
    const extractLotteryInfo = (text: string): { numbers: string[]; province?: string; date?: string } => {
        // Character corrections for common OCR mistakes on lottery fonts
        let normalized = text
            .replace(/[oOоО]/g, '0')  // Latin and Cyrillic O
            .replace(/[lIіІ|]/g, '1') // l, I, pipe
            .replace(/[zZ]/g, '2')
            .replace(/[eE]/g, '6')    // Sometimes 6 looks like e
            .replace(/[sS\$]/g, '5')
            .replace(/[bB]/g, '8')
            .replace(/[gG]/g, '9')
            .replace(/[,\.]/g, '')    // Remove punctuation between numbers
            .replace(/\s+/g, ' ');    // Normalize spaces

        // Extract 2-6 digit numbers (lottery numbers)
        const numberMatches = normalized.match(/\b\d{2,6}\b/g) || [];

        // Also try to find numbers that might be split by spaces
        const spacedNumbers = normalized.match(/\d[\d\s]{4,8}\d/g) || [];
        const cleanedSpaced = spacedNumbers.map(n => n.replace(/\s/g, '')).filter(n => n.length >= 2 && n.length <= 6);

        const allNumbers = [...numberMatches, ...cleanedSpaced];
        const numbers = [...new Set(allNumbers.filter(n => n.length >= 2 && n.length <= 6))];

        // Extract date patterns
        const datePatterns = [
            /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,  // DD/MM/YYYY
            /ngày\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i,
            /(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{2,4})/i,
        ];

        let date: string | undefined;
        for (const pattern of datePatterns) {
            const match = text.match(pattern);
            if (match) {
                const [, d, m, y] = match;
                const year = y.length === 2 ? `20${y}` : y;
                date = `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${year}`;
                break;
            }
        }

        // Extract province from text
        const provincePatterns: Record<string, RegExp> = {
            'tphcm': /h[ồô]\s*ch[íi]\s*minh|tp\.?hcm|s[àa]i\s*g[òo]n|hcm/i,
            'dong-nai': /[đd][ồo]ng\s*nai/i,
            'binh-duong': /b[ìi]nh\s*d[ươ][oơ]ng/i,
            'vung-tau': /v[ũu]ng\s*t[àa]u|b[àa]\s*r[ịi]a/i,
            'can-tho': /c[ầa]n\s*th[ơo]/i,
            'da-nang': /[đd][àa]\s*n[ẵa]ng/i,
            'mien-bac': /mi[ềe]n\s*b[ắa]c|h[àa]\s*n[ộo]i/i,
            'tien-giang': /ti[ềe]n\s*giang/i,
            'ben-tre': /b[ếe]n\s*tre/i,
            'long-an': /long\s*an/i,
            'dong-thap': /[đd][ồo]ng\s*th[áa]p/i,
            'ca-mau': /c[àa]\s*mau/i,
            'an-giang': /an\s*giang/i,
            'kien-giang': /ki[êe]n\s*giang/i,
            'vinh-long': /v[ĩi]nh\s*long/i,
            'tra-vinh': /tr[àa]\s*vinh/i,
            'bac-lieu': /b[ạa]c\s*li[êe]u/i,
            'soc-trang': /s[óo]c\s*tr[ăa]ng/i,
            'hau-giang': /h[ậa]u\s*giang/i,
        };

        let province: string | undefined;
        for (const [key, pattern] of Object.entries(provincePatterns)) {
            if (pattern.test(text)) {
                province = key;
                break;
            }
        }

        return { numbers, province, date };
    };

    const processImage = useCallback(async (imageSource: string | File): Promise<OCRResult | null> => {
        setIsProcessing(true);
        setProgress(0);
        setError(null);

        try {
            // Convert File to base64 if needed
            let imageSrc = imageSource;
            if (imageSource instanceof File) {
                imageSrc = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.readAsDataURL(imageSource);
                });
            }

            // Step 1: Pre-process image
            setProgress(10);
            const processedImage = await preprocessImage(imageSrc as string);
            setProgress(25);

            // Step 2: Create Tesseract worker with optimized settings for numbers
            const worker = await createWorker('vie+eng', 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setProgress(25 + Math.round(m.progress * 60));
                    }
                },
            });

            // Configure Tesseract for better number recognition
            await worker.setParameters({
                tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ /.-:',
            });

            // Recognize text
            const { data } = await worker.recognize(processedImage);
            await worker.terminate();

            setProgress(90);

            // Step 3: Extract lottery information
            const lotteryInfo = extractLotteryInfo(data.text);

            setProgress(100);

            return {
                text: data.text,
                numbers: lotteryInfo.numbers,
                confidence: data.confidence,
                province: lotteryInfo.province,
                date: lotteryInfo.date,
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Lỗi xử lý ảnh';
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
