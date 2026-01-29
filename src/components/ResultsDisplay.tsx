'use client';

import { WinningResult, formatCurrency, prizeStructure } from '@/lib/lottery';
import { Trophy, XCircle, PartyPopper } from 'lucide-react';

interface CheckResult {
    number: string;
    winnings: WinningResult[];
}

interface ResultsDisplayProps {
    results: CheckResult[];
    onClose?: () => void;
}

export function ResultsDisplay({ results, onClose }: ResultsDisplayProps) {
    const totalWinnings = results.reduce(
        (sum, r) => sum + r.winnings.reduce((s, w) => s + w.prizeAmount, 0),
        0
    );

    const hasAnyWin = results.some(r => r.winnings.length > 0);

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="text-2xl">🏆</span> Kết Quả Dò Số
                </h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-white/50 hover:text-white transition"
                    >
                        <XCircle size={24} />
                    </button>
                )}
            </div>

            {/* Total Winnings Banner */}
            {totalWinnings > 0 && (
                <div className="mb-6 p-4 success-gradient rounded-xl text-center animate-glow">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <PartyPopper size={24} />
                        <span className="text-lg font-bold">CHÚC MỪNG BẠN TRÚNG THƯỞNG!</span>
                        <PartyPopper size={24} />
                    </div>
                    <p className="text-2xl font-bold">
                        Tổng tiền thưởng: {formatCurrency(totalWinnings)}
                    </p>
                </div>
            )}

            {/* Results List */}
            <div className="space-y-4">
                {results.map((result, idx) => {
                    const isWinner = result.winnings.length > 0;
                    const prizeSum = result.winnings.reduce((s, w) => s + w.prizeAmount, 0);

                    return (
                        <div
                            key={idx}
                            className={`p-4 rounded-xl border transition-all ${isWinner
                                    ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30'
                                    : 'bg-white/5 border-white/10'
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl font-bold font-mono tracking-wider">
                                    {result.number}
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${isWinner
                                            ? 'success-gradient text-white'
                                            : 'bg-white/10 text-white/50'
                                        }`}
                                >
                                    {isWinner ? '🎉 TRÚNG!' : 'Không trúng'}
                                </span>
                            </div>

                            {/* Winning Details */}
                            {isWinner ? (
                                <div className="space-y-2">
                                    {result.winnings.map((w, widx) => (
                                        <div
                                            key={widx}
                                            className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg text-sm"
                                        >
                                            <Trophy size={16} className="text-yellow-400" />
                                            <span className="text-green-300">
                                                {w.province} - {prizeStructure[w.province === 'Miền Bắc' ? 'bac' : 'nam']?.[w.prize]?.label || w.prize}:
                                            </span>
                                            <span className="font-mono text-white">{w.prizeNumber}</span>
                                            <span className="text-white/50">(khớp {w.matchedDigits} số cuối)</span>
                                            <span className="ml-auto font-bold text-green-400">
                                                +{formatCurrency(w.prizeAmount)}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="text-right text-green-400 font-bold pt-2 border-t border-green-500/20">
                                        Tổng: {formatCurrency(prizeSum)}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-white/50 text-sm">
                                    Số này không trúng giải nào. Chúc bạn may mắn lần sau! 🍀
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {!hasAnyWin && (
                <div className="mt-4 p-4 bg-white/5 rounded-xl text-center text-white/50">
                    <p>Không có số nào trúng thưởng.</p>
                    <p className="text-sm mt-1">Hãy thử vận may với vé số mới! 🎟️</p>
                </div>
            )}
        </div>
    );
}
