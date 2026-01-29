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
        // Keep original text for province/date detection (before number normalization)
        const originalText = text;

        // Character corrections for common OCR mistakes on lottery fonts
        let normalized = text
            .replace(/[oOоО]/g, '0')  // Latin and Cyrillic O
            .replace(/[lIіІ|]/g, '1') // l, I, pipe
            .replace(/[zZ]/g, '2')
            .replace(/[sS\$]/g, '5')
            .replace(/[bB]/g, '8')
            .replace(/[gG]/g, '9')
            .replace(/[,\.]/g, '')    // Remove punctuation between numbers
            .replace(/\s+/g, ' ');    // Normalize spaces

        // PRIORITY 1: Look for 6-digit lottery ticket numbers (main ticket number)
        // Common patterns on lottery tickets: L889246, L 889246, Số: 889246
        const sixDigitPatterns = [
            /[LlІ1]\s*(\d{6})/g,           // L889246 or L 889246
            /s[ốo]\s*:?\s*(\d{6})/gi,      // Số: 889246 or so 889246
            /v[éeè]\s*s[ốo]\s*:?\s*(\d{6})/gi,  // vé số: 889246
            /(\d{6})/g,                      // plain 6-digit numbers
        ];

        const sixDigitNumbers: string[] = [];
        for (const pattern of sixDigitPatterns) {
            let match;
            while ((match = pattern.exec(normalized)) !== null) {
                const num = match[1] || match[0];
                if (num.length === 6 && /^\d{6}$/.test(num)) {
                    sixDigitNumbers.push(num);
                }
            }
        }

        // PRIORITY 2: Extract other numbers (2-5 digits) for prize checking
        const otherNumberMatches = normalized.match(/\b\d{2,5}\b/g) || [];

        // Also try to find numbers that might be split by spaces (e.g., "88 92 46" -> "889246")
        const spacedNumbers = normalized.match(/\d[\d\s]{4,10}\d/g) || [];
        const cleanedSpaced = spacedNumbers
            .map(n => n.replace(/\s/g, ''))
            .filter(n => n.length === 6 && /^\d{6}$/.test(n));

        // Combine all 6-digit numbers (highest priority)
        const allSixDigit = [...new Set([...sixDigitNumbers, ...cleanedSpaced])];

        // Then add other numbers
        const otherNumbers = [...new Set(otherNumberMatches.filter(n => n.length >= 2 && n.length <= 5))];

        // 6-digit numbers first, then others
        const numbers = [...allSixDigit, ...otherNumbers];

        // Extract date patterns (more comprehensive)
        const datePatterns = [
            // Standard formats
            /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/,  // DD/MM/YYYY or DD-MM-YYYY
            /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,      // DD/MM/YY
            // Vietnamese text formats
            /ng[àa]y\s*(\d{1,2})[\/\-\.\s]+(\d{1,2})[\/\-\.\s]+(\d{2,4})/i,
            /ng[àa]y\s*(\d{1,2})\s*th[áa]ng\s*(\d{1,2})\s*n[aă]m\s*(\d{2,4})/i,
            /(\d{1,2})\s*th[áa]ng\s*(\d{1,2})\s*n[aă]m\s*(\d{2,4})/i,
            // Lottery ticket specific: "Mở thưởng: 05-01-2026" or "XSDT 05/01/2026"
            /m[ởo]\s*th[ưu][ởo]ng\s*:?\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i,
            /xs\w+\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i,
            // "thứ hai 05-01-2026"
            /th[ứu]\s*\w+\s*(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i,
        ];

        let date: string | undefined;
        for (const pattern of datePatterns) {
            const match = originalText.match(pattern);
            if (match) {
                const [, d, m, y] = match;
                let year = y;
                if (y.length === 2) {
                    year = parseInt(y) > 50 ? `19${y}` : `20${y}`;
                }
                const day = d.padStart(2, '0');
                const month = m.padStart(2, '0');
                // Return in YYYY-MM-DD format for HTML date input
                date = `${year}-${month}-${day}`;
                break;
            }
        }

        // Extract province from text (comprehensive list of all Vietnamese lottery provinces)
        const provincePatterns: Record<string, RegExp> = {
            // MIỀN BẮC
            'mien-bac': /mi[ềe]n\s*b[ắa]c|xsmb|h[àa]\s*n[ộo]i|mb/i,

            // MIỀN TRUNG
            'thua-thien-hue': /th[ừu]a?\s*thi[êe]n\s*hu[ếe]|hu[ếe]|xshue/i,
            'phu-yen': /ph[úu]\s*y[êe]n|xspy/i,
            'dak-lak': /[đd][ắa]k\s*l[ắa]k|daklak|xsdlk/i,
            'quang-nam': /qu[ảa]ng\s*nam|xsqna/i,
            'da-nang': /[đd][àa]\s*n[ẵa]ng|danang|xsdng/i,
            'khanh-hoa': /kh[áa]nh\s*h[oò]a|nha\s*trang|xskh/i,
            'binh-dinh': /b[ìi]nh\s*[đd][ịi]nh|xsbdi/i,
            'quang-tri': /qu[ảa]ng\s*tr[ịi]|xsqt/i,
            'quang-binh': /qu[ảa]ng\s*b[ìi]nh|xsqb/i,
            'gia-lai': /gia\s*lai|xsgl/i,
            'ninh-thuan': /ninh\s*thu[ậa]n|xsnt/i,
            'quang-ngai': /qu[ảa]ng\s*ng[ãa]i|xsqng/i,
            'dak-nong': /[đd][ắa]k\s*n[ôo]ng|xsdno/i,
            'kon-tum': /kon\s*tum|xskt/i,

            // MIỀN NAM
            'tphcm': /h[ồô]\s*ch[íi]\s*minh|tp\.?\s*hcm|s[àa]i\s*g[òo]n|hcm|xshcm/i,
            'dong-thap': /[đd][ồo]ng\s*th[áa]p|xsdt/i,
            'ca-mau': /c[àa]\s*mau|xscm/i,
            'ben-tre': /b[ếe]n\s*tre|xsbt/i,
            'vung-tau': /v[ũu]ng\s*t[àa]u|b[àa]\s*r[ịi]a|xsvt/i,
            'bac-lieu': /b[ạa]c\s*li[êe]u|xsbl/i,
            'dong-nai': /[đd][ồo]ng\s*nai|xsdn/i,
            'can-tho': /c[ầa]n\s*th[ơo]|xsct/i,
            'soc-trang': /s[óo]c\s*tr[ăa]ng|xsst/i,
            'tay-ninh': /t[âa]y\s*ninh|xstn/i,
            'an-giang': /an\s*giang|xsag/i,
            'binh-thuan': /b[ìi]nh\s*thu[ậa]n|phan\s*thi[ếe]t|xsbth/i,
            'vinh-long': /v[ĩi]nh\s*long|xsvl/i,
            'binh-duong': /b[ìi]nh\s*d[ươ][ơo]ng|xsbd/i,
            'tra-vinh': /tr[àa]\s*vinh|xstv/i,
            'long-an': /long\s*an|xsla/i,
            'binh-phuoc': /b[ìi]nh\s*ph[ướu][ớo]c|xsbp/i,
            'hau-giang': /h[ậa]u\s*giang|xshg/i,
            'tien-giang': /ti[ềe]n\s*giang|xstg/i,
            'kien-giang': /ki[êe]n\s*giang|r[ạa]ch\s*gi[áa]|xskg/i,
            'da-lat': /[đd][àa]\s*l[ạa]t|l[âa]m\s*[đd][ồo]ng|xsdl/i,
        };

        let province: string | undefined;
        for (const [key, pattern] of Object.entries(provincePatterns)) {
            if (pattern.test(originalText)) {
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
