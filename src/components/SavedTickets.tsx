'use client';

import { Trash2, Award, Clock } from 'lucide-react';
import { formatCurrency, provinces } from '@/lib/lottery';

interface SavedTicket {
    id: string;
    number: string;
    date: string;
    province?: string;
    winnings?: Array<{
        province: string;
        prize: string;
        prizeAmount: number;
    }>;
    createdAt: number;
}

interface SavedTicketsProps {
    tickets: SavedTicket[];
    onDelete: (id: string) => void;
}

export function SavedTickets({ tickets, onDelete }: SavedTicketsProps) {
    if (tickets.length === 0) {
        return (
            <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="text-2xl">📋</span> Vé Đã Lưu
                </h2>
                <div className="text-center py-8 text-white/50">
                    <span className="text-4xl block mb-2">📭</span>
                    <p>Chưa có vé số nào được lưu</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span> Vé Đã Lưu
                <span className="ml-auto text-sm font-normal text-white/50">
                    {tickets.length} vé
                </span>
            </h2>

            <div className="space-y-2 max-h-80 overflow-y-auto">
                {tickets.map((ticket) => {
                    const hasWin = ticket.winnings && ticket.winnings.length > 0;
                    const totalWin = ticket.winnings?.reduce((s, w) => s + w.prizeAmount, 0) || 0;

                    return (
                        <div
                            key={ticket.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition ${hasWin
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="font-mono text-lg font-semibold text-purple-400">
                                    {ticket.number}
                                </div>
                                <div className="text-xs text-white/50 flex items-center gap-2">
                                    <Clock size={12} />
                                    {ticket.date}
                                    {ticket.province && (
                                        <span>• {provinces[ticket.province]?.name || ticket.province}</span>
                                    )}
                                </div>
                            </div>

                            {hasWin ? (
                                <div className="flex items-center gap-1 px-3 py-1 success-gradient rounded-full text-sm font-semibold animate-glow">
                                    <Award size={14} />
                                    {formatCurrency(totalWin)}
                                </div>
                            ) : (
                                <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/50">
                                    ✓ Đã dò
                                </span>
                            )}

                            <button
                                onClick={() => onDelete(ticket.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition"
                                title="Xóa"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
