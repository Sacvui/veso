import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Cache TTL: 30 days in seconds
const CACHE_TTL = 30 * 24 * 60 * 60;

// Real lottery data API - fetches from multiple Vietnamese lottery sources with KV caching
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || formatToday();
    const region = searchParams.get('region') || 'nam';

    const cacheKey = `lottery:${date}:${region}`;

    try {
        // Step 1: Check KV cache first
        let cached = null;
        try {
            cached = await kv.get(cacheKey);
            if (cached) {
                console.log(`Cache HIT: ${cacheKey}`);
                return NextResponse.json({
                    success: true,
                    data: cached,
                    date,
                    source: 'cache'
                });
            }
        } catch (kvError) {
            // KV not configured or error - continue to fetch
            console.log('KV not available, fetching fresh data');
        }

        console.log(`Cache MISS: ${cacheKey}, fetching from sources...`);

        // Step 2: Fetch from sources
        const results = await fetchRealLotteryData(date, region);

        // Step 3: Save to KV cache (only if we got results and KV is available)
        if (Object.keys(results).length > 0) {
            try {
                await kv.set(cacheKey, results, { ex: CACHE_TTL });
                console.log(`Cached: ${cacheKey} for ${CACHE_TTL}s`);
            } catch (kvError) {
                console.log('Failed to cache result:', kvError);
            }
        }

        return NextResponse.json({ success: true, data: results, date, source: 'fresh' });
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

async function fetchRealLotteryData(dateStr: string, region: string) {
    const [day, month, year] = dateStr.split('-');
    const proxyUrl = 'https://api.allorigins.win/raw?url=';

    // Try multiple sources in order of reliability

    // Source 1: minhngoc.net.vn (fastest, most popular)
    try {
        const regionPath = region === 'bac' ? 'mien-bac' : region === 'trung' ? 'mien-trung' : 'mien-nam';
        const url = `https://www.minhngoc.net.vn/ket-qua-xo-so/${regionPath}/${day}-${month}-${year}.html`;
        const response = await fetch(proxyUrl + encodeURIComponent(url), {
            next: { revalidate: 300 } // Cache for 5 min at edge
        });

        if (response.ok) {
            const html = await response.text();
            const parsed = parseHTML(html, dateStr, region);
            if (Object.keys(parsed).length > 0) return parsed;
        }
    } catch (e) { console.log('minhngoc failed'); }

    // Source 2: kqxs.vn
    try {
        const regionPath = region === 'bac' ? 'mien-bac' : region === 'trung' ? 'mien-trung' : 'mien-nam';
        const url = `https://kqxs.vn/xo-so-${regionPath}/${day}-${month}-${year}`;
        const response = await fetch(proxyUrl + encodeURIComponent(url));

        if (response.ok) {
            const html = await response.text();
            const parsed = parseHTML(html, dateStr, region);
            if (Object.keys(parsed).length > 0) return parsed;
        }
    } catch (e) { console.log('kqxs.vn failed'); }

    // Source 3: xoso.me
    try {
        const url = `https://xoso.me/xskt/ngay-${day}-${month}-${year}.html`;
        const response = await fetch(proxyUrl + encodeURIComponent(url));

        if (response.ok) {
            const html = await response.text();
            const parsed = parseHTML(html, dateStr, region);
            if (Object.keys(parsed).length > 0) return parsed;
        }
    } catch (e) { console.log('xoso.me failed'); }

    // Source 4: xoso.com.vn
    try {
        const url = `https://xoso.com.vn/xsmn-${day}-${month}-${year}.html`;
        const response = await fetch(proxyUrl + encodeURIComponent(url));

        if (response.ok) {
            const html = await response.text();
            const parsed = parseHTML(html, dateStr, region);
            if (Object.keys(parsed).length > 0) return parsed;
        }
    } catch (e) { console.log('xoso.com.vn failed'); }

    return {};
}

// Generic HTML parser - extracts lottery numbers from any source
function parseHTML(html: string, dateStr: string, region: string) {
    const results: Record<string, any> = {};

    // Extract all numbers from HTML
    const allMatches = html.match(/>\s*(\d{2,6})\s*</g) || [];
    const numbers = allMatches
        .map(n => n.replace(/[><\s]/g, ''))
        .filter(n => n.length >= 2 && n.length <= 6);

    const unique = [...new Set(numbers)];

    if (unique.length >= 15) {
        // Categorize by digit length
        const six = unique.filter(n => n.length === 6);
        const five = unique.filter(n => n.length === 5);
        const four = unique.filter(n => n.length === 4);
        const three = unique.filter(n => n.length === 3);
        const two = unique.filter(n => n.length === 2);

        const regionKey = region === 'bac' ? 'mien-bac' : region === 'trung' ? 'mien-trung' : 'mien-nam';
        const regionName = region === 'bac' ? 'Miền Bắc' : region === 'trung' ? 'Miền Trung' : 'Miền Nam';

        results[regionKey] = {
            name: regionName,
            region: region || 'nam',
            date: dateStr,
            prizes: {
                'DB': six.length > 0 ? six.slice(0, 1) : five.slice(0, 1),
                'G1': five.slice(0, 1),
                'G2': five.slice(1, 2),
                'G3': five.slice(2, 4),
                'G4': five.slice(4, 11),
                'G5': four.slice(0, 1),
                'G6': four.slice(1, 4),
                'G7': three.slice(0, 1),
                'G8': two.slice(0, 1),
            },
        };
    }

    return results;
}
