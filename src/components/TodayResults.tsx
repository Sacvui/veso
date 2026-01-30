'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Calendar, MapPin, ChevronDown } from 'lucide-react';
import {
    fetchLotteryResults,
    prizeStructure,
    LotteryResult,
    provinces
} from '@/lib/lottery';

type Region = 'nam' | 'trung' | 'bac';

export function TodayResults() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [region, setRegion] = useState<Region>('nam');
    const [selectedProvince, setSelectedProvince] = useState<string>('');
    const [results, setResults] = useState<Record<string, LotteryResult>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const calendarRef = useRef<HTMLDivElement>(null);

    // Check if date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(currentDate);
    compareDate.setHours(0, 0, 0, 0);
    const isFutureDate = compareDate > today;

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        loadResults();
    }, [currentDate, region]);

    const loadResults = async () => {
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

    // Get provinces for current region
    const regionProvinces = Object.entries(provinces)
        .filter(([, p]) => p.region === region)
        .map(([key, p]) => ({ key, ...p }));

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: (number | null)[] = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const selectDate = (day: number) => {
        const newDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
        if (newDate > today) return;
        setCurrentDate(newDate);
        setShowCalendar(false);
    };

    const prevMonth = () => {
        setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        const next = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
        if (next <= today) {
            setCalendarMonth(next);
        }
    };

    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

    const isToday = (day: number) => {
        return day === today.getDate() &&
            calendarMonth.getMonth() === today.getMonth() &&
            calendarMonth.getFullYear() === today.getFullYear();
    };
    const isSelected = (day: number) => {
        return day === currentDate.getDate() &&
            calendarMonth.getMonth() === currentDate.getMonth() &&
            calendarMonth.getFullYear() === currentDate.getFullYear();
    };
    const isFuture = (day: number) => {
        const checkDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
        return checkDate > today;
    };

    // Format date for display
    const formatDisplayDate = (date: Date) => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${days[date.getDay()]}, ${day}/${month}/${date.getFullYear()}`;
    };

    // Filter results by selected province
    const filteredResults = Object.entries(results).filter(([key, r]) => {
        if (selectedProvince) {
            return key === selectedProvince;
        }
        return r.region === region;
    });

    const prizeOrder = ['DB', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'];

    return (
        <div className="glass-card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl sm:text-2xl">📊</span> Kết Quả Xổ Số
            </h2>

            {/* Mobile-optimized Controls */}
            <div className="space-y-3 mb-4">
                {/* Date Picker */}
                <div className="relative" ref={calendarRef}>
                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 text-left flex items-center justify-between hover:bg-white/10 transition active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-purple-400" />
                            <span className="font-medium text-sm sm:text-base">{formatDisplayDate(currentDate)}</span>
                        </div>
                        <ChevronDown size={18} className={`text-white/50 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Calendar Popup - Fixed for mobile */}
                    {showCalendar && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/20 rounded-xl shadow-2xl z-50 p-3 sm:p-4 max-h-[70vh] overflow-auto">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-3">
                                <button
                                    type="button"
                                    onClick={prevMonth}
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition active:scale-95"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="font-semibold text-white text-sm sm:text-base">
                                    {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                                </span>
                                <button
                                    type="button"
                                    onClick={nextMonth}
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition active:scale-95"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                                    <div key={d} className="text-center text-xs text-white/50 py-1">{d}</div>
                                ))}
                            </div>

                            {/* Days Grid - Larger touch targets */}
                            <div className="grid grid-cols-7 gap-1">
                                {getDaysInMonth(calendarMonth).map((day, i) => (
                                    <div key={i} className="aspect-square">
                                        {day && (
                                            <button
                                                type="button"
                                                onClick={() => !isFuture(day) && selectDate(day)}
                                                disabled={isFuture(day)}
                                                className={`w-full h-full rounded-lg flex items-center justify-center text-sm font-medium transition-all active:scale-90
                                                    ${isFuture(day)
                                                        ? 'text-white/20 cursor-not-allowed'
                                                        : isSelected(day)
                                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg'
                                                            : isToday(day)
                                                                ? 'bg-purple-500/30 text-purple-300'
                                                                : 'text-white/80 hover:bg-white/10 active:bg-white/20'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Quick Select - Larger buttons for mobile */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCurrentDate(new Date());
                                        setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                                        setShowCalendar(false);
                                    }}
                                    className="flex-1 py-3 bg-purple-500/20 text-purple-300 rounded-xl text-sm font-medium hover:bg-purple-500/30 transition active:scale-95"
                                >
                                    Hôm nay
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const yesterday = new Date();
                                        yesterday.setDate(yesterday.getDate() - 1);
                                        setCurrentDate(yesterday);
                                        setCalendarMonth(new Date(yesterday.getFullYear(), yesterday.getMonth(), 1));
                                        setShowCalendar(false);
                                    }}
                                    className="flex-1 py-3 bg-white/10 rounded-xl text-sm font-medium hover:bg-white/20 transition active:scale-95"
                                >
                                    Hôm qua
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Region + Province in a row on mobile */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Region Dropdown */}
                    <div className="relative">
                        <select
                            value={region}
                            onChange={(e) => {
                                setRegion(e.target.value as Region);
                                setSelectedProvince('');
                            }}
                            className="w-full px-3 py-3 bg-gray-800 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                            style={{ backgroundColor: '#1f2937' }}
                        >
                            <option value="nam">🟢 Miền Nam</option>
                            <option value="trung">🟡 Miền Trung</option>
                            <option value="bac">🔴 Miền Bắc</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                    </div>

                    {/* Province Dropdown */}
                    <div className="relative">
                        <select
                            value={selectedProvince}
                            onChange={(e) => setSelectedProvince(e.target.value)}
                            className="w-full px-3 py-3 bg-gray-800 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                            style={{ backgroundColor: '#1f2937' }}
                        >
                            <option value="">📍 Tất cả tỉnh</option>
                            {regionProvinces.map((p) => (
                                <option key={p.key} value={p.key}>{p.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Results Grid - Mobile optimized */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/50">
                    <Loader2 className="animate-spin mb-2" size={28} />
                    <p className="text-sm">Đang tải kết quả...</p>
                </div>
            ) : filteredResults.length === 0 ? (
                <div className="text-center py-12 text-white/50">
                    <span className="text-3xl block mb-2">📭</span>
                    <p className="text-sm">Không có kết quả cho ngày này</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredResults.map(([key, data]) => (
                        <div key={key} className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10">
                            <h3 className="font-semibold text-purple-400 mb-3 pb-2 border-b border-white/10 flex items-center gap-2 text-sm sm:text-base">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${data.region === 'bac' ? 'bg-red-500' :
                                        data.region === 'trung' ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}></span>
                                <span className="truncate">{data.name}</span>
                                <span className="text-xs text-white/40 font-normal ml-auto flex-shrink-0">{data.date}</span>
                            </h3>
                            <div className="space-y-1.5">
                                {prizeOrder
                                    .filter((p) => data.prizes[p] && data.prizes[p].length > 0)
                                    .map((p) => (
                                        <div key={p} className="flex items-start py-1 text-xs sm:text-sm">
                                            <span className="w-8 sm:w-10 text-white/50 flex-shrink-0 font-medium">
                                                {prizeStructure[data.region]?.[p]?.label || p}
                                            </span>
                                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                {data.prizes[p].map((num, i) => (
                                                    <span
                                                        key={i}
                                                        className={`font-mono px-1.5 sm:px-2 py-0.5 rounded ${p === 'DB'
                                                            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-base sm:text-lg'
                                                            : 'bg-white/10 text-xs sm:text-sm'
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
