import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

// Cache TTL: 30 days in seconds
const CACHE_TTL = 30 * 24 * 60 * 60;

// Redis client
let redis: Redis | null = null;

function getRedis(): Redis | null {
    if (!process.env.REDIS_URL) {
        return null;
    }
    if (!redis) {
        redis = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        });
    }
    return redis;
}

// API to prefetch and cache lottery results for the last 30 days
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const region = searchParams.get('region') || 'nam';

    const redisClient = getRedis();
    if (!redisClient) {
        return NextResponse.json({
            success: false,
            error: 'REDIS_URL not configured'
        }, { status: 500 });
    }

    const results: Array<{ date: string; status: string; count: number }> = [];
    const proxyUrl = 'https://api.allorigins.win/raw?url=';

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
        const cacheKey = `lottery:${dateStr}:${region}`;

        try {
            // Check if already cached
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                const parsedCache = JSON.parse(cached);
                results.push({ date: dateStr, status: 'cached', count: Object.keys(parsedCache).length });
                continue;
            }

            // Fetch and cache
            const data = await fetchLotteryForDate(dateStr, region, proxyUrl);
            if (Object.keys(data).length > 0) {
                await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
                results.push({ date: dateStr, status: 'fetched', count: Object.keys(data).length });
            } else {
                results.push({ date: dateStr, status: 'no_data', count: 0 });
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error(`Error for ${dateStr}:`, error);
            results.push({ date: dateStr, status: 'error', count: 0 });
        }
    }

    const summary = {
        total: results.length,
        cached: results.filter(r => r.status === 'cached').length,
        fetched: results.filter(r => r.status === 'fetched').length,
        noData: results.filter(r => r.status === 'no_data').length,
        errors: results.filter(r => r.status === 'error').length,
    };

    return NextResponse.json({ success: true, summary, results });
}

async function fetchLotteryForDate(dateStr: string, region: string, proxyUrl: string) {
    const [day, month, year] = dateStr.split('-');

    // Try minhngoc.net.vn
    try {
        const regionPath = region === 'bac' ? 'mien-bac' : region === 'trung' ? 'mien-trung' : 'mien-nam';
        const url = `https://www.minhngoc.net.vn/ket-qua-xo-so/${regionPath}/${day}-${month}-${year}.html`;
        const response = await fetch(proxyUrl + encodeURIComponent(url));

        if (response.ok) {
            const html = await response.text();
            const parsed = parseHTML(html, dateStr, region);
            if (Object.keys(parsed).length > 0) return parsed;
        }
    } catch (e) { /* continue */ }

    // Try kqxs.vn
    try {
        const regionPath = region === 'bac' ? 'mien-bac' : region === 'trung' ? 'mien-trung' : 'mien-nam';
        const url = `https://kqxs.vn/xo-so-${regionPath}/${day}-${month}-${year}`;
        const response = await fetch(proxyUrl + encodeURIComponent(url));

        if (response.ok) {
            const html = await response.text();
            const parsed = parseHTML(html, dateStr, region);
            if (Object.keys(parsed).length > 0) return parsed;
        }
    } catch (e) { /* continue */ }

    return {};
}

function parseHTML(html: string, dateStr: string, region: string) {
    const results: Record<string, any> = {};

    const allMatches = html.match(/>\s*(\d{2,6})\s*</g) || [];
    const numbers = allMatches
        .map(n => n.replace(/[><\s]/g, ''))
        .filter(n => n.length >= 2 && n.length <= 6);

    const unique = [...new Set(numbers)];

    if (unique.length >= 15) {
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
