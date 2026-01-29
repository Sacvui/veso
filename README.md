# 🎟️ Dò Vé Số - Ứng dụng dò vé số tự động

Ứng dụng web giúp người dùng dò vé số tự động bằng cách chụp ảnh hoặc nhập số thủ công.

## ✨ Tính năng

- 📸 **Chụp/Upload ảnh vé số** - Hỗ trợ camera trên điện thoại
- 🔍 **OCR nhận diện tự động** - Sử dụng Tesseract.js để đọc số từ ảnh
- 🎯 **Dò tất cả các đài** - Miền Bắc, Miền Trung, Miền Nam
- 💾 **Lưu trữ vé số** - Lưu vào localStorage, không cần đăng ký
- 📊 **Xem kết quả xổ số** - Tra cứu kết quả theo ngày
- 🏆 **Hiển thị chi tiết trúng thưởng** - Số tiền, giải thưởng, đài xổ

## 🚀 Cài đặt

```bash
# Clone repository
git clone https://github.com/hailp1/veso2.git
cd veso2

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

Mở [http://localhost:3000](http://localhost:3000) để sử dụng.

## 🛠️ Công nghệ sử dụng

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **OCR**: Tesseract.js
- **Icons**: Lucide React

## 📁 Cấu trúc thư mục

```
src/
├── app/
│   ├── api/lottery/       # API route lấy kết quả xổ số
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Trang chính
├── components/
│   ├── ImageUploader.tsx  # Component upload/chụp ảnh
│   ├── TicketForm.tsx     # Form nhập số vé
│   ├── ResultsDisplay.tsx # Hiển thị kết quả dò
│   ├── SavedTickets.tsx   # Danh sách vé đã lưu
│   └── TodayResults.tsx   # Kết quả xổ số hôm nay
├── hooks/
│   ├── useOCR.ts          # Hook xử lý OCR
│   └── useTicketStorage.ts # Hook lưu trữ vé
└── lib/
    └── lottery.ts         # Logic xổ số & dữ liệu đài
```

## 🎰 Hướng dẫn sử dụng

1. **Chụp ảnh vé số** hoặc upload từ thư viện
2. Hệ thống tự động **nhận diện các dãy số** trên vé
3. Chọn **ngày xổ** và **đài xổ** (hoặc để trống để dò tất cả đài)
4. Nhấn **"Dò Số Ngay"** để kiểm tra kết quả
5. Xem kết quả trúng thưởng và số tiền

## 📝 Lưu ý

- Ứng dụng chỉ mang tính chất tham khảo
- Vui lòng đối chiếu với kết quả chính thức từ đài xổ số
- Dữ liệu được lưu trên trình duyệt (localStorage)

## 📄 License

MIT License

## 👨‍💻 Tác giả

- [hailp1](https://github.com/hailp1)
