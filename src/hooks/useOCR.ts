'use client';

import { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';

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

    // Pre-process image for better OCR results
    const preprocessImage = async (imageSource: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(imageSource);
                    return;
                }

                canvas.width = img.width;
                canvas.height = img.height;

                // Draw original image
                ctx.drawImage(img, 0, 0);

                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Apply image processing for better OCR
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Convert to grayscale
                    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

                    // Increase contrast
                    const contrast = 1.5;
                    const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));
                    const newGray = Math.min(255, Math.max(0, factor * (gray - 128) + 128));

                    // Binarization with adaptive threshold
                    const threshold = 140;
                    const binary = newGray > threshold ? 255 : 0;

                    data[i] = binary;
                    data[i + 1] = binary;
                    data[i + 2] = binary;
                }

                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = imageSource;
        });
    };

    // Extract lottery-specific pattern
    const extractLotteryInfo = (text: string): { numbers: string[]; province?: string; date?: string } => {
        // Normalize text
        const normalized = text
            .replace(/[oO]/g, '0')
            .replace(/[lI]/g, '1')
            .replace(/[zZ]/g, '2')
            .replace(/[sS]/g, '5')
            .replace(/[bB]/g, '8');

        // Extract 2-6 digit numbers
        const numberMatches = normalized.match(/\b\d{2,6}\b/g) || [];
        const numbers = [...new Set(numberMatches.filter(n => n.length >= 2 && n.length <= 6))];

        // Try to extract date (DD/MM/YYYY or DD-MM-YYYY patterns)
        const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
        let date: string | undefined;
        if (dateMatch) {
            const [, d, m, y] = dateMatch;
            const year = y.length === 2 ? `20${y}` : y;
            date = `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${year}`;
        }

        // Try to extract province/dai
        const provincePatterns: Record<string, string[]> = {
            'tphcm': ['hồ chí minh', 'tp.hcm', 'tphcm', 'sài gòn', 'saigon', 'hcm'],
            'dong-nai': ['đồng nai', 'dong nai'],
            'binh-duong': ['bình dương', 'binh duong'],
            'vung-tau': ['vũng tàu', 'vung tau', 'bà rịa'],
            'can-tho': ['cần thơ', 'can tho'],
            'da-nang': ['đà nẵng', 'da nang'],
            'mien-bac': ['miền bắc', 'mien bac', 'hà nội', 'ha noi'],
            'tien-giang': ['tiền giang', 'tien giang'],
            'ben-tre': ['bến tre', 'ben tre'],
            'long-an': ['long an'],
            'dong-thap': ['đồng tháp', 'dong thap'],
            'ca-mau': ['cà mau', 'ca mau'],
            'an-giang': ['an giang'],
            'kien-giang': ['kiên giang', 'kien giang'],
        };

        let province: string | undefined;
        const lowerText = text.toLowerCase();
        for (const [key, patterns] of Object.entries(provincePatterns)) {
            for (const pattern of patterns) {
                if (lowerText.includes(pattern)) {
                    province = key;
                    break;
                }
            }
            if (province) break;
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

            // Pre-process image for better recognition
            setProgress(10);
            const processedImage = await preprocessImage(imageSrc as string);

            // Create Tesseract worker with enhanced config
            setProgress(20);
            const worker = await createWorker('vie+eng', 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setProgress(20 + Math.round(m.progress * 70));
                    }
                },
            });

            // Recognize text
            const { data } = await worker.recognize(processedImage);
            await worker.terminate();

            setProgress(95);

            // Extract lottery-specific information
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
            const message = err instanceof Error ? err.message : 'OCR processing failed';
            setError(message);
            return null;
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    }, []);

    // Process with GPT-4 Vision for better accuracy (requires API key)
    const processWithGPT4Vision = useCallback(async (imageBase64: string, apiKey: string): Promise<OCRResult | null> => {
        setIsProcessing(true);
        setError(null);

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4-vision-preview',
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: `Đây là hình chụp vé số Việt Nam. Hãy trích xuất các thông tin sau:
1. Dãy số trên vé (6 chữ số)
2. Ngày xổ (định dạng DD-MM-YYYY)
3. Tên đài xổ số

Trả lời theo định dạng JSON:
{
  "numbers": ["123456", "789012"],
  "date": "01-01-2024",
  "province": "tphcm"
}

Chỉ trả về JSON, không giải thích.`
                                },
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                                    },
                                },
                            ],
                        },
                    ],
                    max_tokens: 500,
                }),
            });

            if (!response.ok) {
                throw new Error('GPT-4 Vision API failed');
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (content) {
                const parsed = JSON.parse(content);
                return {
                    text: content,
                    numbers: parsed.numbers || [],
                    confidence: 95,
                    province: parsed.province,
                    date: parsed.date,
                };
            }

            return null;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'GPT-4 Vision failed';
            setError(message);
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, []);

    return {
        processImage,
        processWithGPT4Vision,
        isProcessing,
        progress,
        error,
    };
}
