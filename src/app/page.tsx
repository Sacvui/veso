'use client';

import { useState, useEffect } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { TicketForm } from '@/components/TicketForm';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { TodayResults } from '@/components/TodayResults';
import { SavedTickets } from '@/components/SavedTickets';
import { useTicketStorage } from '@/hooks/useTicketStorage';
import { fetchLotteryResults, checkTicket, WinningResult } from '@/lib/lottery';

interface CheckResult {
  number: string;
  winnings: WinningResult[];
}

export default function Home() {
  const [detectedNumbers, setDetectedNumbers] = useState<string[]>([]);
  const [checkResults, setCheckResults] = useState<CheckResult[] | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { tickets, addTicket, removeTicket, isLoaded } = useTicketStorage();

  const handleNumbersDetected = (numbers: string[]) => {
    setDetectedNumbers(numbers);
  };

  const handleCheckNumbers = async (data: { date: string; province: string; numbers: string[] }) => {
    setIsChecking(true);
    try {
      const date = new Date(data.date);
      const results = await fetchLotteryResults(date, data.province || undefined);

      const allResults: CheckResult[] = [];

      for (const num of data.numbers) {
        const winnings = checkTicket(num, results);
        allResults.push({ number: num, winnings });

        // Save ticket
        addTicket({
          number: num,
          date: data.date,
          province: data.province,
          winnings: winnings.map(w => ({
            province: w.province,
            prize: w.prize,
            prizeAmount: w.prizeAmount,
          })),
        });
      }

      setCheckResults(allResults);
    } catch (error) {
      console.error('Check failed:', error);
    }
    setIsChecking(false);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="text-center py-8 px-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-4xl animate-float">🎟️</span>
          <h1 className="text-3xl font-bold gradient-text">Dò Vé Số</h1>
        </div>
        <p className="text-white/60">Chụp ảnh • Nhận diện • Dò số tự động</p>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Image Upload */}
        <ImageUploader onNumbersDetected={handleNumbersDetected} />

        {/* Ticket Form */}
        <TicketForm
          initialNumbers={detectedNumbers}
          onSubmit={handleCheckNumbers}
          isLoading={isChecking}
        />

        {/* Check Results */}
        {checkResults && (
          <ResultsDisplay
            results={checkResults}
            onClose={() => setCheckResults(null)}
          />
        )}

        {/* Saved Tickets */}
        {isLoaded && (
          <SavedTickets
            tickets={tickets}
            onDelete={removeTicket}
          />
        )}

        {/* Today's Results */}
        <TodayResults />
      </main>

      {/* Footer */}
      <footer className="text-center py-8 px-4 mt-8 text-white/40 text-sm">
        <p>© 2024 Dò Vé Số - Công cụ dò vé số miễn phí</p>
        <p className="mt-1 text-xs">
          ⚠️ Chỉ mang tính chất tham khảo. Vui lòng đối chiếu với kết quả chính thức.
        </p>
      </footer>
    </div>
  );
}
