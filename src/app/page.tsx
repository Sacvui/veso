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

interface OCRDetectionResult {
  numbers: string[];
  date?: string;
  province?: string;
}

export default function Home() {
  const [detectedNumbers, setDetectedNumbers] = useState<string[]>([]);
  const [detectedDate, setDetectedDate] = useState<string | undefined>();
  const [detectedProvince, setDetectedProvince] = useState<string | undefined>();
  const [checkResults, setCheckResults] = useState<CheckResult[] | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { tickets, addTicket, removeTicket, isLoaded } = useTicketStorage();

  const handleNumbersDetected = (result: OCRDetectionResult) => {
    setDetectedNumbers(result.numbers);
    if (result.date) {
      setDetectedDate(result.date);
    }
    if (result.province) {
      setDetectedProvince(result.province);
    }
  };

  // Create ICS calendar file for reminder
  const createCalendarReminder = (drawDate: string, numbers: string[], province: string) => {
    const date = new Date(drawDate);
    // Set time to 5PM (17:00)
    date.setHours(17, 0, 0, 0);

    const formatICSDate = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const endDate = new Date(date.getTime() + 30 * 60 * 1000); // 30 min duration
    const provinceName = province || 'Miền Nam';

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Dò Vé Số//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${Date.now()}@doveso.app
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(date)}
DTEND:${formatICSDate(endDate)}
SUMMARY:🎟️ Nhớ dò vé số!
DESCRIPTION:Số vé: ${numbers.join(', ')}\\nĐài: ${provinceName}\\n\\nVào app Dò Vé Số để kiểm tra kết quả!
LOCATION:https://veso.vercel.app
BEGIN:VALARM
TRIGGER:-PT0M
ACTION:DISPLAY
DESCRIPTION:🎟️ Đã đến giờ dò vé số!
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `do-ve-so-${drawDate}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCheckNumbers = async (data: { date: string; province: string; numbers: string[] }) => {
    setIsChecking(true);
    try {
      const date = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);

      const diffTime = today.getTime() - compareDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Check if draw date is in the future
      if (compareDate > today) {
        const daysUntil = Math.ceil((compareDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const wantReminder = confirm(
          `📅 Ngày xổ số chưa tới!\n\n` +
          `Ngày mở thưởng: ${data.date}\n` +
          `Còn ${daysUntil} ngày nữa\n\n` +
          `Bạn có muốn tạo lịch nhắc dò số lúc 17:00 ngày ${data.date} không?`
        );

        if (wantReminder) {
          createCalendarReminder(data.date, data.numbers, data.province);
          alert('✅ Đã tải file lịch nhắc!\n\nMở file .ics để thêm vào Calendar của điện thoại.');
        }

        setIsChecking(false);
        return;
      }

      // Check if ticket is older than 30 days
      if (diffDays > 30) {
        alert(`⚠️ Vé số đã hết hạn dò!\n\nNgày mở thưởng: ${data.date}\nĐã qua: ${diffDays} ngày\n\nTheo quy định, vé số chỉ có giá trị trong 30 ngày kể từ ngày mở thưởng.`);
        setIsChecking(false);
        return;
      }

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
          initialDate={detectedDate}
          initialProvince={detectedProvince}
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
