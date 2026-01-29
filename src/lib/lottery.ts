// Province data with lottery schedule
export const provinces: Record<string, { name: string; region: 'bac' | 'trung' | 'nam'; days: number[] }> = {
    'mien-bac': { name: 'Miền Bắc', region: 'bac', days: [0, 1, 2, 3, 4, 5, 6] },
    'thua-thien-hue': { name: 'Thừa Thiên Huế', region: 'trung', days: [0] },
    'phu-yen': { name: 'Phú Yên', region: 'trung', days: [1] },
    'dak-lak': { name: 'Đắk Lắk', region: 'trung', days: [2] },
    'quang-nam': { name: 'Quảng Nam', region: 'trung', days: [2] },
    'da-nang': { name: 'Đà Nẵng', region: 'trung', days: [3] },
    'khanh-hoa': { name: 'Khánh Hòa', region: 'trung', days: [0, 3] },
    'binh-dinh': { name: 'Bình Định', region: 'trung', days: [4] },
    'quang-tri': { name: 'Quảng Trị', region: 'trung', days: [4] },
    'quang-binh': { name: 'Quảng Bình', region: 'trung', days: [4] },
    'gia-lai': { name: 'Gia Lai', region: 'trung', days: [5] },
    'ninh-thuan': { name: 'Ninh Thuận', region: 'trung', days: [5] },
    'quang-ngai': { name: 'Quảng Ngãi', region: 'trung', days: [6] },
    'dak-nong': { name: 'Đắk Nông', region: 'trung', days: [6] },
    'kon-tum': { name: 'Kon Tum', region: 'trung', days: [0] },
    'tphcm': { name: 'TP.HCM', region: 'nam', days: [1, 6] },
    'dong-thap': { name: 'Đồng Tháp', region: 'nam', days: [1] },
    'ca-mau': { name: 'Cà Mau', region: 'nam', days: [1] },
    'ben-tre': { name: 'Bến Tre', region: 'nam', days: [2] },
    'vung-tau': { name: 'Vũng Tàu', region: 'nam', days: [2] },
    'bac-lieu': { name: 'Bạc Liêu', region: 'nam', days: [2] },
    'dong-nai': { name: 'Đồng Nai', region: 'nam', days: [3] },
    'can-tho': { name: 'Cần Thơ', region: 'nam', days: [3] },
    'soc-trang': { name: 'Sóc Trăng', region: 'nam', days: [3] },
    'tay-ninh': { name: 'Tây Ninh', region: 'nam', days: [4] },
    'an-giang': { name: 'An Giang', region: 'nam', days: [4] },
    'binh-thuan': { name: 'Bình Thuận', region: 'nam', days: [4] },
    'vinh-long': { name: 'Vĩnh Long', region: 'nam', days: [5] },
    'binh-duong': { name: 'Bình Dương', region: 'nam', days: [5] },
    'tra-vinh': { name: 'Trà Vinh', region: 'nam', days: [5] },
    'long-an': { name: 'Long An', region: 'nam', days: [6] },
    'binh-phuoc': { name: 'Bình Phước', region: 'nam', days: [6] },
    'hau-giang': { name: 'Hậu Giang', region: 'nam', days: [6] },
    'tien-giang': { name: 'Tiền Giang', region: 'nam', days: [0] },
    'kien-giang': { name: 'Kiên Giang', region: 'nam', days: [0] },
    'da-lat': { name: 'Đà Lạt', region: 'nam', days: [0] },
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

// Generate random number with N digits
function generateRandomNumber(digits: number): string {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

// Generate mock prizes
function generateMockPrizes(region: string): Record<string, string[]> {
    const structure = prizeStructure[region];
    const prizes: Record<string, string[]> = {};
    for (const [k, c] of Object.entries(structure)) {
        prizes[k] = Array.from({ length: c.count }, () => generateRandomNumber(c.digits));
    }
    return prizes;
}

// Fetch lottery results (mock for now, will integrate real API)
export async function fetchLotteryResults(date: Date, region?: string): Promise<Record<string, LotteryResult>> {
    const provinceList = getProvincesByDay(date, region);
    const results: Record<string, LotteryResult> = {};

    for (const p of provinceList) {
        results[p.key] = {
            name: p.name,
            region: p.region,
            date: formatDate(date),
            prizes: generateMockPrizes(p.region),
        };
    }

    return results;
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
