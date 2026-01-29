'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { provinces } from '@/lib/lottery';

interface TicketFormProps {
    initialNumbers?: string[];
    onSubmit: (data: { date: string; province: string; numbers: string[] }) => Promise<void>;
    isLoading?: boolean;
}

export function TicketForm({ initialNumbers = [], onSubmit, isLoading }: TicketFormProps) {
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });
    const [province, setProvince] = useState('');
    const [numbers, setNumbers] = useState(initialNumbers.join('\n'));

    // Update numbers when initialNumbers changes
    useState(() => {
        if (initialNumbers.length > 0) {
            setNumbers(initialNumbers.join('\n'));
        }
    });

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

    return (
        <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">✏️</span> Nhập Thông Tin Vé
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm text-white/70 mb-1">Ngày xổ</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                </div>

                <div>
                    <label className="block text-sm text-white/70 mb-1">Đài xổ (để trống = dò tất cả đài)</label>
                    <select
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    >
                        <option value="">-- Tất cả đài --</option>
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
                </div>

                <div>
                    <label className="block text-sm text-white/70 mb-1">
                        Dãy số vé (mỗi số một dòng hoặc cách nhau bởi dấu phẩy)
                    </label>
                    <textarea
                        value={numbers}
                        onChange={(e) => setNumbers(e.target.value)}
                        rows={4}
                        placeholder="VD: 123456&#10;789012&#10;hoặc: 123456, 789012"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-y font-mono"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !numbers.trim()}
                    className="w-full py-4 btn-primary rounded-lg font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Đang dò số...
                        </>
                    ) : (
                        <>
                            <Search size={20} />
                            Dò Số Ngay
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
