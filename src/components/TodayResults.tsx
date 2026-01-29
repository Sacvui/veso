'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
    fetchLotteryResults,
    formatDateDisplay,
    prizeStructure,
    LotteryResult
} from '@/lib/lottery';

type Region = 'nam' | 'trung' | 'bac';

export function TodayResults() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [region, setRegion] = useState<Region>('nam');
    const [results, setResults] = useState<Record<string, LotteryResult>>({});
    const [isLoading, setIsLoading] = useState(true);

    // Check if date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(currentDate);
    compareDate.setHours(0, 0, 0, 0);
    const isFutureDate = compareDate > today;
    const isToday = compareDate.getTime() === today.getTime();

    useEffect(() => {
        loadResults();
    }, [currentDate, region]);

    const loadResults = async () => {
        // Don't load results for future dates
        if (isFutureDate) {
            setResults({});
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const data = await fetchLotteryResults(currentDate, region);
            setResults(data);
        } catch (error) {
            console.error('Failed to load results:', error);
        }
        setIsLoading(false);
    };

    const changeDate = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + delta);
        // Don't allow going to future dates
        if (delta > 0 && newDate > today) return;
        setCurrentDate(newDate);
    };

    const filteredResults = Object.entries(results).filter(
        ([, r]) => r.region === region
    );

    const prizeOrder = ['DB', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'];

    return (
        <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span> Kết Quả Xổ Số
            </h2>

            {/* Date Picker */}
            <div className="flex items-center justify-center gap-4 mb-4">
                <button
                    onClick={() => changeDate(-1)}
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="text-lg font-medium min-w-[180px] text-center">
                    {formatDateDisplay(currentDate)}
                </span>
                <button
                    onClick={() => changeDate(1)}
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Region Tabs */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-full mb-6">
                {(['nam', 'trung', 'bac'] as Region[]).map((r) => (
                    <button
                        key={r}
                        onClick={() => setRegion(r)}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition ${region === r
                            ? 'btn-primary text-white'
                            : 'text-white/60 hover:text-white'
                            }`}
                    >
                        {r === 'nam' ? 'Miền Nam' : r === 'trung' ? 'Miền Trung' : 'Miền Bắc'}
                    </button>
                ))}
            </div>

            {/* Results Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/50">
                    <Loader2 className="animate-spin mb-2" size={32} />
                    <p>Đang tải kết quả...</p>
                </div>
            ) : filteredResults.length === 0 ? (
                <div className="text-center py-12 text-white/50">
                    <p>Không có kết quả xổ số cho ngày và miền đã chọn.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredResults.map(([key, data]) => (
                        <div key={key} className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <h3 className="font-semibold text-purple-400 mb-3 pb-2 border-b border-white/10">
                                {data.name}
                            </h3>
                            <div className="space-y-1">
                                {prizeOrder
                                    .filter((p) => data.prizes[p])
                                    .map((p) => (
                                        <div key={p} className="flex items-start py-1 text-sm">
                                            <span className="w-10 text-white/50 flex-shrink-0">
                                                {prizeStructure[data.region]?.[p]?.label || p}
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {data.prizes[p].map((num, i) => (
                                                    <span
                                                        key={i}
                                                        className={`font-mono px-2 py-0.5 rounded ${p === 'DB'
                                                            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg'
                                                            : 'bg-white/10'
                                                            }`}
                                                    >
                                                        {num}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
