import { NextRequest, NextResponse } from 'next/server';

// Real lottery data API
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || formatToday();
    const region = searchParams.get('region') || '';

    try {
        const results = await fetchRealLotteryData(date, region);
        return NextResponse.json({ success: true, data: results, date });
    } catch (error) {
        console.error('Failed to fetch lottery results:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch results', details: String(error) },
            { status: 500 }
        );
    }
}

function formatToday(): string {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
}

// Province mapping
const provinces: Record<string, { name: string; region: string; code: string }> = {
    'mien-bac': { name: 'Miền Bắc', region: 'bac', code: 'xsmb' },
    'tphcm': { name: 'TP.HCM', region: 'nam', code: 'xshcm' },
    'dong-thap': { name: 'Đồng Tháp', region: 'nam', code: 'xsdt' },
    'ca-mau': { name: 'Cà Mau', region: 'nam', code: 'xscm' },
    'ben-tre': { name: 'Bến Tre', region: 'nam', code: 'xsbt' },
    'vung-tau': { name: 'Vũng Tàu', region: 'nam', code: 'xsvt' },
    'dong-nai': { name: 'Đồng Nai', region: 'nam', code: 'xsdn' },
    'can-tho': { name: 'Cần Thơ', region: 'nam', code: 'xsct' },
    'da-nang': { name: 'Đà Nẵng', region: 'trung', code: 'xsdng' },
    'khanh-hoa': { name: 'Khánh Hòa', region: 'trung', code: 'xskh' },
};

async function fetchRealLotteryData(dateStr: string, region: string) {
    const [day, month, year] = dateStr.split('-');
    const results: Record<string, any> = {};

    // Try fetching from xoso.me
    try {
        const url = `https://xoso.me/xskt/ngay-${day}-${month}-${year}.html`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

        const response = await fetch(proxyUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
        });

        if (response.ok) {
            const html = await response.text();
            const parsed = parseXoSoMeHTML(html, dateStr, region);
            if (Object.keys(parsed).length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.log('xoso.me failed:', e);
    }

    // Try fetching from ketqua.net
    try {
        const url = `https://ketqua.net/xo-so-mien-nam-${day}-${month}-${year}.html`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

        const response = await fetch(proxyUrl);
        if (response.ok) {
            const html = await response.text();
            const parsed = parseKetQuaHTML(html, dateStr, region);
            if (Object.keys(parsed).length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.log('ketqua.net failed:', e);
    }

    return results;
}

function parseXoSoMeHTML(html: string, dateStr: string, region: string) {
    const results: Record<string, any> = {};

    // Extract all 6-digit numbers (potential special prizes)
    const specialPrizes = html.match(/\b\d{6}\b/g) || [];
    // Extract all 5-digit numbers
    const fiveDigits = html.match(/\b\d{5}\b/g) || [];
    // Extract all 4-digit numbers
    const fourDigits = html.match(/\b\d{4}\b/g) || [];
    // Extract all 3-digit numbers  
    const threeDigits = html.match(/\b\d{3}\b/g) || [];
    // Extract all 2-digit numbers
    const twoDigits = html.match(/\b\d{2}\b/g) || [];

    // Filter unique numbers
    const uniqueSpecial = [...new Set(specialPrizes)];
    const uniqueFive = [...new Set(fiveDigits)];
    const uniqueFour = [...new Set(fourDigits)];
    const uniqueThree = [...new Set(threeDigits)];
    const uniqueTwo = [...new Set(twoDigits)];

    // Check for Miền Nam results
    if (!region || region === 'nam') {
        if (uniqueSpecial.length > 0) {
            results['mien-nam'] = {
                name: 'Miền Nam',
                region: 'nam',
                date: dateStr,
                prizes: {
                    'DB': uniqueSpecial.slice(0, 3),
                    'G1': uniqueFive.slice(0, 3),
                    'G2': uniqueFive.slice(3, 6),
                    'G3': uniqueFive.slice(6, 12),
                    'G4': uniqueFive.slice(12, 33),
                    'G5': uniqueFour.slice(0, 3),
                    'G6': uniqueFour.slice(3, 12),
                    'G7': uniqueThree.slice(0, 3),
                    'G8': uniqueTwo.slice(0, 3),
                },
            };
        }
    }

    // Check for Miền Bắc results
    if (!region || region === 'bac') {
        if (uniqueSpecial.length > 0 || uniqueFive.length > 10) {
            results['mien-bac'] = {
                name: 'Miền Bắc',
                region: 'bac',
                date: dateStr,
                prizes: {
                    'DB': uniqueSpecial.slice(0, 1).length > 0 ? uniqueSpecial.slice(0, 1) : uniqueFive.slice(0, 1),
                    'G1': uniqueFive.slice(1, 2),
                    'G2': uniqueFive.slice(2, 4),
                    'G3': uniqueFive.slice(4, 10),
                    'G4': uniqueFour.slice(0, 4),
                    'G5': uniqueFour.slice(4, 10),
                    'G6': uniqueThree.slice(0, 3),
                    'G7': uniqueTwo.slice(0, 4),
                },
            };
        }
    }

    return results;
}

function parseKetQuaHTML(html: string, dateStr: string, region: string) {
    // Similar parsing logic
    return parseXoSoMeHTML(html, dateStr, region);
}
