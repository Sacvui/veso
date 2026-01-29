import { NextRequest, NextResponse } from 'next/server';

// CORS proxy to fetch lottery results from external sources
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || formatToday();
    const region = searchParams.get('region');

    try {
        // Try fetching from xoso.me via CORS proxy
        const results = await fetchLotteryResults(date, region);
        return NextResponse.json({ success: true, data: results, date });
    } catch (error) {
        console.error('Failed to fetch lottery results:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch results' },
            { status: 500 }
        );
    }
}

function formatToday(): string {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
}

async function fetchLotteryResults(dateStr: string, region?: string | null) {
    // Parse date
    const [day, month, year] = dateStr.split('-');

    // Try fetching from multiple sources
    const sources = [
        `https://xoso.me/xskt/ngay-${day}-${month}-${year}.html`,
        `https://xskt.com.vn/xskq-xo-so-ket-qua/xsmb-${day}-${month}-${year}.html`,
    ];

    for (const sourceUrl of sources) {
        try {
            // Use a public CORS proxy
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(sourceUrl)}`;
            const response = await fetch(proxyUrl, {
                next: { revalidate: 300 } // Cache for 5 minutes
            });

            if (response.ok) {
                const html = await response.text();
                const parsed = parseHTML(html, dateStr, region);
                if (Object.keys(parsed).length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.log(`Source ${sourceUrl} failed, trying next...`);
        }
    }

    // Return empty if all sources fail
    return {};
}

function parseHTML(html: string, dateStr: string, region?: string | null) {
    // Basic HTML parsing - in production, use a proper parser
    const results: Record<string, any> = {};

    // Extract numbers using regex patterns
    // This is a simplified parser - real implementation would be more robust
    const numberPattern = /\b\d{2,6}\b/g;
    const numbers = html.match(numberPattern) || [];

    // Group numbers by prize structure (simplified)
    if (numbers.length > 0) {
        results['parsed'] = {
            name: 'Kết quả',
            region: region || 'nam',
            date: dateStr,
            numbers: [...new Set(numbers)].slice(0, 50),
        };
    }

    return results;
}
