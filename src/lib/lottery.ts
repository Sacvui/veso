// Province data with lottery schedule
export const provinces: Record<string, { name: string; region: 'bac' | 'trung' | 'nam'; days: number[]; code: string }> = {
    'mien-bac': { name: 'Miền Bắc', region: 'bac', days: [0, 1, 2, 3, 4, 5, 6], code: 'xsmb' },
    'thua-thien-hue': { name: 'Thừa Thiên Huế', region: 'trung', days: [0], code: 'xshue' },
    'phu-yen': { name: 'Phú Yên', region: 'trung', days: [1], code: 'xspy' },
    'dak-lak': { name: 'Đắk Lắk', region: 'trung', days: [2], code: 'xsdlk' },
    'quang-nam': { name: 'Quảng Nam', region: 'trung', days: [2], code: 'xsqna' },
    'da-nang': { name: 'Đà Nẵng', region: 'trung', days: [3], code: 'xsdng' },
    'khanh-hoa': { name: 'Khánh Hòa', region: 'trung', days: [0, 3], code: 'xskh' },
    'binh-dinh': { name: 'Bình Định', region: 'trung', days: [4], code: 'xsbdi' },
    'quang-tri': { name: 'Quảng Trị', region: 'trung', days: [4], code: 'xsqt' },
    'quang-binh': { name: 'Quảng Bình', region: 'trung', days: [4], code: 'xsqb' },
    'gia-lai': { name: 'Gia Lai', region: 'trung', days: [5], code: 'xsgl' },
    'ninh-thuan': { name: 'Ninh Thuận', region: 'trung', days: [5], code: 'xsnt' },
    'quang-ngai': { name: 'Quảng Ngãi', region: 'trung', days: [6], code: 'xsqng' },
    'dak-nong': { name: 'Đắk Nông', region: 'trung', days: [6], code: 'xsdno' },
    'kon-tum': { name: 'Kon Tum', region: 'trung', days: [0], code: 'xskt' },
    'tphcm': { name: 'TP.HCM', region: 'nam', days: [1, 6], code: 'xshcm' },
    'dong-thap': { name: 'Đồng Tháp', region: 'nam', days: [1], code: 'xsdt' },
    'ca-mau': { name: 'Cà Mau', region: 'nam', days: [1], code: 'xscm' },
    'ben-tre': { name: 'Bến Tre', region: 'nam', days: [2], code: 'xsbt' },
    'vung-tau': { name: 'Vũng Tàu', region: 'nam', days: [2], code: 'xsvt' },
    'bac-lieu': { name: 'Bạc Liêu', region: 'nam', days: [2], code: 'xsbl' },
    'dong-nai': { name: 'Đồng Nai', region: 'nam', days: [3], code: 'xsdn' },
    'can-tho': { name: 'Cần Thơ', region: 'nam', days: [3], code: 'xsct' },
    'soc-trang': { name: 'Sóc Trăng', region: 'nam', days: [3], code: 'xsst' },
    'tay-ninh': { name: 'Tây Ninh', region: 'nam', days: [4], code: 'xstn' },
    'an-giang': { name: 'An Giang', region: 'nam', days: [4], code: 'xsag' },
    'binh-thuan': { name: 'Bình Thuận', region: 'nam', days: [4], code: 'xsbth' },
    'vinh-long': { name: 'Vĩnh Long', region: 'nam', days: [5], code: 'xsvl' },
    'binh-duong': { name: 'Bình Dương', region: 'nam', days: [5], code: 'xsbd' },
    'tra-vinh': { name: 'Trà Vinh', region: 'nam', days: [5], code: 'xstv' },
    'long-an': { name: 'Long An', region: 'nam', days: [6], code: 'xsla' },
    'binh-phuoc': { name: 'Bình Phước', region: 'nam', days: [6], code: 'xsbp' },
    'hau-giang': { name: 'Hậu Giang', region: 'nam', days: [6], code: 'xshg' },
    'tien-giang': { name: 'Tiền Giang', region: 'nam', days: [0], code: 'xstg' },
    'kien-giang': { name: 'Kiên Giang', region: 'nam', days: [0], code: 'xskg' },
    'da-lat': { name: 'Đà Lạt', region: 'nam', days: [0], code: 'xsdl' },
};

// Prize structure for each region
export const prizeStructure: Record<string, Record<string, { label: string; digits: number; count: number }>> = {
    nam: {
        'DB': { label: 'ĐB', digits: 6, count: 1 },
        'G1': { label: 'G1', digits: 5, count: 1 },
        'G2': { label: 'G2', digits: 5, count: 1 },
        'G3': { label: 'G3', digits: 5, count: 2 },
        'G4': { label: 'G4', digits: 5, count: 7 },
        'G5': { label: 'G5', digits: 4, count: 1 },
        'G6': { label: 'G6', digits: 4, count: 3 },
        'G7': { label: 'G7', digits: 3, count: 1 },
        'G8': { label: 'G8', digits: 2, count: 1 },
    },
    trung: {
        'DB': { label: 'ĐB', digits: 6, count: 1 },
        'G1': { label: 'G1', digits: 5, count: 1 },
        'G2': { label: 'G2', digits: 5, count: 1 },
        'G3': { label: 'G3', digits: 5, count: 2 },
        'G4': { label: 'G4', digits: 5, count: 7 },
        'G5': { label: 'G5', digits: 4, count: 1 },
        'G6': { label: 'G6', digits: 4, count: 3 },
        'G7': { label: 'G7', digits: 3, count: 1 },
        'G8': { label: 'G8', digits: 2, count: 1 },
    },
    bac: {
        'DB': { label: 'ĐB', digits: 5, count: 1 },
        'G1': { label: 'G1', digits: 5, count: 1 },
        'G2': { label: 'G2', digits: 5, count: 2 },
        'G3': { label: 'G3', digits: 5, count: 6 },
        'G4': { label: 'G4', digits: 4, count: 4 },
        'G5': { label: 'G5', digits: 4, count: 6 },
        'G6': { label: 'G6', digits: 3, count: 3 },
        'G7': { label: 'G7', digits: 2, count: 4 },
    },
};

export interface LotteryResult {
    name: string;
    region: 'bac' | 'trung' | 'nam';
    date: string;
    prizes: Record<string, string[]>;
}

export interface WinningResult {
    province: string;
    prize: string;
    prizeNumber: string;
    yourNumber: string;
    matchedDigits: number;
    prizeAmount: number;
}

// Format date to DD-MM-YYYY
export function formatDate(date: Date): string {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
}

// Format date for display
export function formatDateDisplay(date: Date): string {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${days[date.getDay()]}, ${d}/${m}/${date.getFullYear()}`;
}

// Get provinces by day and region
export function getProvincesByDay(date: Date, region?: string) {
    const dayOfWeek = date.getDay();
    return Object.entries(provinces)
        .filter(([, p]) => p.days.includes(dayOfWeek) && (!region || p.region === region))
        .map(([key, province]) => ({ key, ...province }));
}

// Cache for results
const resultsCache: Map<string, { data: Record<string, LotteryResult>; timestamp: number }> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch REAL lottery results from API
export async function fetchLotteryResults(date: Date, region?: string): Promise<Record<string, LotteryResult>> {
    const dateStr = formatDate(date);
    const cacheKey = `${dateStr}-${region || 'all'}`;

    // Check cache
    const cached = resultsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }

    try {
        // Fetch from our API route which handles CORS
        const response = await fetch(`/api/lottery/real?date=${dateStr}&region=${region || ''}`);
        if (response.ok) {
            const json = await response.json();
            if (json.success && json.data) {
                resultsCache.set(cacheKey, { data: json.data, timestamp: Date.now() });
                return json.data;
            }
        }
    } catch (error) {
        console.error('Failed to fetch from API:', error);
    }

    // Fallback: try direct fetch with CORS proxy
    try {
        const results = await fetchFromXoSo(date, region);
        if (Object.keys(results).length > 0) {
            resultsCache.set(cacheKey, { data: results, timestamp: Date.now() });
            return results;
        }
    } catch (error) {
        console.error('Failed to fetch from xoso:', error);
    }

    // Return empty if all sources fail
    return {};
}

// Fetch from xoso.com.vn via CORS proxy
async function fetchFromXoSo(date: Date, region?: string): Promise<Record<string, LotteryResult>> {
    const dateStr = formatDate(date);
    const [day, month, year] = dateStr.split('-');

    const results: Record<string, LotteryResult> = {};
    const provinceList = getProvincesByDay(date, region);

    // Use allorigins.win as CORS proxy
    const proxyUrl = 'https://api.allorigins.win/raw?url=';

    for (const province of provinceList) {
        try {
            const url = `https://xoso.com.vn/kqxs/${province.code}-${day}-${month}-${year}.html`;
            const response = await fetch(proxyUrl + encodeURIComponent(url));

            if (response.ok) {
                const html = await response.text();
                const prizes = parseXoSoHTML(html, province.region);

                if (Object.keys(prizes).length > 0) {
                    results[province.key] = {
                        name: province.name,
                        region: province.region,
                        date: dateStr,
                        prizes,
                    };
                }
            }
        } catch (e) {
            console.log(`Failed to fetch ${province.name}:`, e);
        }
    }

    return results;
}

// Parse HTML to extract lottery numbers
function parseXoSoHTML(html: string, region: string): Record<string, string[]> {
    const prizes: Record<string, string[]> = {};

    // Extract numbers using regex patterns for different prize levels
    const patterns: Record<string, RegExp> = {
        'DB': /class="[^"]*giai-db[^"]*"[^>]*>[\s\S]*?(\d{5,6})/gi,
        'G1': /class="[^"]*giai-1[^"]*"[^>]*>[\s\S]*?(\d{5})/gi,
        'G2': /class="[^"]*giai-2[^"]*"[^>]*>[\s\S]*?(\d{5})/gi,
        'G3': /class="[^"]*giai-3[^"]*"[^>]*>[\s\S]*?(\d{5})/gi,
        'G4': /class="[^"]*giai-4[^"]*"[^>]*>[\s\S]*?(\d{4,5})/gi,
        'G5': /class="[^"]*giai-5[^"]*"[^>]*>[\s\S]*?(\d{4})/gi,
        'G6': /class="[^"]*giai-6[^"]*"[^>]*>[\s\S]*?(\d{3,4})/gi,
        'G7': /class="[^"]*giai-7[^"]*"[^>]*>[\s\S]*?(\d{2,3})/gi,
        'G8': /class="[^"]*giai-8[^"]*"[^>]*>[\s\S]*?(\d{2})/gi,
    };

    // Alternative: extract all numbers and organize by position
    const allNumbers = html.match(/>\s*(\d{2,6})\s*</g) || [];
    const cleanNumbers = allNumbers.map(n => n.replace(/[><\s]/g, '')).filter(n => n.length >= 2);

    if (cleanNumbers.length > 0) {
        // Organize numbers based on prize structure
        const structure = prizeStructure[region];
        let index = 0;

        for (const [key, config] of Object.entries(structure)) {
            prizes[key] = [];
            for (let i = 0; i < config.count && index < cleanNumbers.length; i++) {
                const num = cleanNumbers[index];
                if (num && num.length >= 2) {
                    prizes[key].push(num);
                    index++;
                }
            }
        }
    }

    return prizes;
}

// Check number match
function checkNumberMatch(ticket: string, prize: string): { matched: boolean; digits: number } {
    for (let d = Math.min(ticket.length, prize.length); d >= 2; d--) {
        if (ticket.slice(-d) === prize.slice(-d)) {
            return { matched: true, digits: d };
        }
    }
    return { matched: false, digits: 0 };
}

// Get prize amount
function getPrizeAmount(prizeKey: string, digits: number): number {
    const table: Record<string, Record<number, number>> = {
        'DB': { 6: 2000000000, 5: 40000000, 4: 15000000, 3: 6500000, 2: 100000 },
        'G1': { 5: 30000000, 4: 10000000, 3: 5000000, 2: 80000 },
        'G2': { 5: 15000000, 4: 6500000, 3: 3000000, 2: 70000 },
        'G3': { 5: 10000000, 4: 4000000, 2: 70000 },
        'G4': { 5: 3000000, 4: 1000000, 2: 70000 },
        'G5': { 4: 1000000, 2: 70000 },
        'G6': { 4: 400000, 3: 200000, 2: 70000 },
        'G7': { 3: 200000, 2: 70000 },
        'G8': { 2: 70000 },
    };
    return table[prizeKey]?.[digits] || 0;
}

// Check ticket against results
export function checkTicket(ticketNumber: string, results: Record<string, LotteryResult>): WinningResult[] {
    const winnings: WinningResult[] = [];
    const numStr = ticketNumber.trim().replace(/\D/g, '');

    if (numStr.length < 2) return winnings;

    for (const [, data] of Object.entries(results)) {
        for (const [prize, numbers] of Object.entries(data.prizes)) {
            for (const prizeNum of numbers) {
                const match = checkNumberMatch(numStr, prizeNum);
                if (match.matched) {
                    winnings.push({
                        province: data.name,
                        prize,
                        prizeNumber: prizeNum,
                        yourNumber: numStr,
                        matchedDigits: match.digits,
                        prizeAmount: getPrizeAmount(prize, match.digits),
                    });
                }
            }
        }
    }

    return winnings;
}

// Format currency
export function formatCurrency(amount: number): string {
    if (amount >= 1e9) return (amount / 1e9).toFixed(1) + ' tỷ';
    if (amount >= 1e6) return (amount / 1e6).toFixed(0) + ' triệu';
    if (amount >= 1e3) return (amount / 1e3).toFixed(0) + ' nghìn';
    return amount + ' đồng';
}
