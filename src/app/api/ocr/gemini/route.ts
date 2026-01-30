'use server';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API key is stored securely in Vercel Environment Variables
// Never expose this to the client side
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface GeminiOCRResponse {
    success: boolean;
    numbers: string[];
    date?: string;
    province?: string;
    rawText?: string;
    error?: string;
    modelUsed?: string;
}

// Models to try in order (fallback chain) - Only Gemini 2.0 models
const MODELS_TO_TRY = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
];

const PROMPT = `Bạn là chuyên gia nhận diện vé số Việt Nam. Hãy phân tích ảnh vé số này và trích xuất thông tin:

1. **SỐ VÉ** (QUAN TRỌNG NHẤT): Tìm dãy số 6 chữ số trên vé (thường được in lớn, nổi bật). Đây là số dùng để dò giải.

2. **NGÀY MỞ THƯỞNG**: Tìm ngày xổ số (định dạng DD/MM/YYYY hoặc DD-MM-YYYY).

3. **TỈNH/ĐÀI**: Xác định đài xổ số (ví dụ: Đồng Tháp, TP.HCM, Bình Dương, Cần Thơ, v.v.)

Trả lời theo định dạng JSON sau (KHÔNG thêm markdown code block):
{
    "numbers": ["123456"],
    "date": "DD-MM-YYYY",
    "province": "tên-tỉnh-viết-thường-có-dấu-gạch-ngang",
    "rawText": "toàn bộ text đọc được trên vé"
}

Lưu ý về province slug:
- TP Hồ Chí Minh -> "tphcm"
- Đồng Tháp -> "dong-thap"
- Cần Thơ -> "can-tho"
- Bình Dương -> "binh-duong"
- An Giang -> "an-giang"
- Vĩnh Long -> "vinh-long"
- Bến Tre -> "ben-tre"
- Cà Mau -> "ca-mau"
- Đồng Nai -> "dong-nai"
- Sóc Trăng -> "soc-trang"
- Tây Ninh -> "tay-ninh"
- Bình Thuận -> "binh-thuan"
- Kiên Giang -> "kien-giang"
- Đà Lạt/Lâm Đồng -> "da-lat"
- Bình Phước -> "binh-phuoc"
- Hậu Giang -> "hau-giang"
- Long An -> "long-an"
- Tiền Giang -> "tien-giang"
- Vũng Tàu -> "vung-tau"
- Bạc Liêu -> "bac-lieu"
- Trà Vinh -> "tra-vinh"
- Miền Bắc/Hà Nội -> "mien-bac"
- Bình Thuận -> "binh-thuan"

Nếu không tìm thấy thông tin nào, để mảng/chuỗi rỗng.`;

async function tryGenerateWithModel(modelName: string, base64Data: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent([
        {
            inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg',
            },
        },
        PROMPT,
    ]);
    const response = await result.response;
    return response.text();
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest): Promise<NextResponse<GeminiOCRResponse>> {
    try {
        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                success: false,
                numbers: [],
                error: 'Gemini API key chưa được cấu hình. Vui lòng thêm GEMINI_API_KEY vào Vercel Environment Variables.',
            }, { status: 500 });
        }

        const { image } = await request.json();

        if (!image) {
            return NextResponse.json({
                success: false,
                numbers: [],
                error: 'Không có ảnh được gửi lên.',
            }, { status: 400 });
        }

        // Extract base64 data from data URL
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

        let text: string = '';
        let modelUsed: string = '';
        let lastError: Error | null = null;

        // Try each model with retry logic
        for (const modelName of MODELS_TO_TRY) {
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    console.log(`Trying ${modelName} (attempt ${attempt + 1})...`);
                    text = await tryGenerateWithModel(modelName, base64Data);
                    modelUsed = modelName;
                    break; // Success, exit retry loop
                } catch (error) {
                    lastError = error as Error;
                    const errorMessage = lastError.message || '';

                    // If rate limited, wait and retry
                    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
                        console.log(`Rate limited on ${modelName}, waiting 4 seconds...`);
                        await sleep(4000);
                        continue; // Retry
                    }

                    // If model not found, try next model
                    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                        console.log(`Model ${modelName} not found, trying next...`);
                        break; // Move to next model
                    }

                    // Other errors, try next model
                    console.error(`Error with ${modelName}:`, errorMessage);
                    break;
                }
            }

            if (text) break; // Found working model
        }

        // If all models failed
        if (!text) {
            return NextResponse.json({
                success: false,
                numbers: [],
                error: `Không thể kết nối Gemini AI. Vui lòng thử lại sau hoặc dùng chế độ Tesseract. (${lastError?.message || 'Unknown error'})`,
            }, { status: 429 });
        }

        // Parse JSON response from Gemini
        try {
            // Clean up the response - remove markdown code blocks if present
            let cleanText = text.trim();
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.slice(7);
            }
            if (cleanText.startsWith('```')) {
                cleanText = cleanText.slice(3);
            }
            if (cleanText.endsWith('```')) {
                cleanText = cleanText.slice(0, -3);
            }
            cleanText = cleanText.trim();

            const parsed = JSON.parse(cleanText);

            // Convert date from DD-MM-YYYY to YYYY-MM-DD for HTML date input
            let formattedDate = parsed.date;
            if (parsed.date && /^\d{2}-\d{2}-\d{4}$/.test(parsed.date)) {
                const [d, m, y] = parsed.date.split('-');
                formattedDate = `${y}-${m}-${d}`;
            } else if (parsed.date && /^\d{2}\/\d{2}\/\d{4}$/.test(parsed.date)) {
                const [d, m, y] = parsed.date.split('/');
                formattedDate = `${y}-${m}-${d}`;
            }

            return NextResponse.json({
                success: true,
                numbers: parsed.numbers || [],
                date: formattedDate,
                province: parsed.province,
                rawText: parsed.rawText,
                modelUsed,
            });
        } catch (parseError) {
            // If JSON parsing fails, try to extract numbers manually
            const numberMatches = text.match(/\b\d{6}\b/g) || [];
            return NextResponse.json({
                success: true,
                numbers: [...new Set(numberMatches)],
                rawText: text,
                modelUsed,
            });
        }
    } catch (error) {
        console.error('Gemini OCR Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Lỗi khi xử lý ảnh với Gemini AI';

        // User-friendly error messages
        let userMessage = errorMessage;
        if (errorMessage.includes('429') || errorMessage.includes('quota')) {
            userMessage = 'API đã hết quota. Vui lòng chờ vài giây và thử lại, hoặc chuyển sang chế độ Tesseract.';
        }

        return NextResponse.json({
            success: false,
            numbers: [],
            error: userMessage,
        }, { status: 500 });
    }
}
