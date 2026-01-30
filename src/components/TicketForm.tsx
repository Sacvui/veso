'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Calendar, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { provinces } from '@/lib/lottery';

interface TicketFormProps {
    initialNumbers?: string[];
    initialDate?: string;
    initialProvince?: string;
    onSubmit: (data: { date: string; province: string; numbers: string[] }) => Promise<void>;
    isLoading?: boolean;
}

export function TicketForm({ initialNumbers = [], initialDate, initialProvince, onSubmit, isLoading }: TicketFormProps) {
    const [date, setDate] = useState(() => {
        if (initialDate) return initialDate;
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [province, setProvince] = useState(initialProvince || '');
    const [numbers, setNumbers] = useState(initialNumbers.join('\n'));
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(() => {
        const d = initialDate ? new Date(initialDate) : new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });
    const calendarRef = useRef<HTMLDivElement>(null);

    // Update numbers when initialNumbers changes (from OCR)
    useEffect(() => {
        if (initialNumbers.length > 0) {
            setNumbers(initialNumbers.join('\n'));
        }
    }, [initialNumbers]);

    // Update date when initialDate changes (from OCR)
    useEffect(() => {
        if (initialDate) {
            setDate(initialDate);
            setCalendarMonth(new Date(new Date(initialDate).getFullYear(), new Date(initialDate).getMonth(), 1));
        }
    }, [initialDate]);

    // Update province when initialProvince changes (from OCR)
    useEffect(() => {
        if (initialProvince) {
            setProvince(initialProvince);
        }
    }, [initialProvince]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numberList = numbers
            .split(/[\n,]+/)
            .map(n => n.trim())
            .filter(n => n.length >= 2);

        if (numberList.length === 0) return;

        await onSubmit({ date, province, numbers: numberList });
    };

    // Group provinces by region
    const groupedProvinces = {
        bac: Object.entries(provinces).filter(([, p]) => p.region === 'bac'),
        trung: Object.entries(provinces).filter(([, p]) => p.region === 'trung'),
        nam: Object.entries(provinces).filter(([, p]) => p.region === 'nam'),
    };

    // Format date for display (Vietnamese format)
    const formatDisplayDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${days[d.getDay()]}, ${day}/${month}/${year}`;
    };

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: (number | null)[] = [];

        // Add empty cells for days before the first day
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return days;
    };

    const selectDate = (day: number) => {
        const newDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
        setDate(newDate.toISOString().split('T')[0]);
        setShowCalendar(false);
    };

    const prevMonth = () => {
        setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
    };

    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

    const selectedDateObj = new Date(date);
    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
            calendarMonth.getMonth() === today.getMonth() &&
            calendarMonth.getFullYear() === today.getFullYear();
    };
    const isSelected = (day: number) => {
        return day === selectedDateObj.getDate() &&
            calendarMonth.getMonth() === selectedDateObj.getMonth() &&
            calendarMonth.getFullYear() === selectedDateObj.getFullYear();
    };

    return (
        <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">✏️</span> Nhập Thông Tin Vé
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Date Picker with Calendar */}
                <div className="relative" ref={calendarRef}>
                    <label className="block text-sm text-white/70 mb-1 flex items-center gap-1">
                        <Calendar size={14} /> Ngày xổ
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-left flex items-center justify-between hover:bg-white/10 transition"
                    >
                        <span className="font-medium">{formatDisplayDate(date)}</span>
                        <Calendar size={18} className="text-purple-400" />
                    </button>

                    {/* Calendar Popup */}
                    {showCalendar && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/20 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    type="button"
                                    onClick={prevMonth}
                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="font-semibold text-white">
                                    {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                                </span>
                                <button
                                    type="button"
                                    onClick={nextMonth}
                                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                                    <div key={d} className="text-center text-xs text-white/50 py-1">{d}</div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {getDaysInMonth(calendarMonth).map((day, i) => (
                                    <div key={i} className="aspect-square">
                                        {day && (
                                            <button
                                                type="button"
                                                onClick={() => selectDate(day)}
                                                className={`w-full h-full rounded-lg flex items-center justify-center text-sm transition-all
                                                    ${isSelected(day)
                                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg'
                                                        : isToday(day)
                                                            ? 'bg-purple-500/30 text-purple-300 font-medium'
                                                            : 'text-white/80 hover:bg-white/10'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Quick Select */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const today = new Date();
                                        setDate(today.toISOString().split('T')[0]);
                                        setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                                        setShowCalendar(false);
                                    }}
                                    className="flex-1 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition"
                                >
                                    Hôm nay
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const yesterday = new Date();
                                        yesterday.setDate(yesterday.getDate() - 1);
                                        setDate(yesterday.toISOString().split('T')[0]);
                                        setCalendarMonth(new Date(yesterday.getFullYear(), yesterday.getMonth(), 1));
                                        setShowCalendar(false);
                                    }}
                                    className="flex-1 py-2 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition"
                                >
                                    Hôm qua
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Province Selector */}
                <div>
                    <label className="block text-sm text-white/70 mb-1 flex items-center gap-1">
                        <MapPin size={14} /> Đài xổ
                    </label>
                    <select
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                        style={{ backgroundColor: '#1f2937' }}
                    >
                        <option value="">🎯 Dò tất cả đài</option>
                        <optgroup label="🔴 Miền Bắc">
                            {groupedProvinces.bac.map(([key, p]) => (
                                <option key={key} value={key}>{p.name}</option>
                            ))}
                        </optgroup>
                        <optgroup label="🟡 Miền Trung">
                            {groupedProvinces.trung.map(([key, p]) => (
                                <option key={key} value={key}>{p.name}</option>
                            ))}
                        </optgroup>
                        <optgroup label="🟢 Miền Nam">
                            {groupedProvinces.nam.map(([key, p]) => (
                                <option key={key} value={key}>{p.name}</option>
                            ))}
                        </optgroup>
                    </select>
                    {province && provinces[province] && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                ${provinces[province].region === 'bac' ? 'bg-red-500/20 text-red-300' :
                                    provinces[province].region === 'trung' ? 'bg-yellow-500/20 text-yellow-300' :
                                        'bg-green-500/20 text-green-300'}`}>
                                {provinces[province].region === 'bac' ? 'Miền Bắc' :
                                    provinces[province].region === 'trung' ? 'Miền Trung' : 'Miền Nam'}
                            </span>
                            <span className="text-white/50">
                                Xổ: {provinces[province].days.map(d => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d]).join(', ')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Number Input */}
                <div>
                    <label className="block text-sm text-white/70 mb-1">
                        🎫 Dãy số vé <span className="text-white/40">(mỗi số một dòng hoặc cách nhau bởi dấu phẩy)</span>
                    </label>
                    <textarea
                        value={numbers}
                        onChange={(e) => setNumbers(e.target.value)}
                        rows={4}
                        placeholder="VD: 123456&#10;789012&#10;hoặc: 123456, 789012"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-y font-mono text-lg"
                    />
                    {numbers.trim() && (
                        <div className="mt-2 text-sm text-white/50">
                            📝 Đã nhập: {numbers.split(/[\n,]+/).filter(n => n.trim().length >= 2).length} số
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading || !numbers.trim()}
                    className="w-full py-4 btn-primary rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform text-lg shadow-lg"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={22} />
                            Đang dò số...
                        </>
                    ) : (
                        <>
                            <Search size={22} />
                            🔍 Dò Số Ngay
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
