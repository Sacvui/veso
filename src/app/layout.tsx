import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Dò Vé Số - Chụp & Dò Tự Động",
  description: "Ứng dụng dò vé số tự động - Chụp ảnh vé số, hệ thống tự động nhận diện và dò kết quả ngay lập tức cho tất cả các đài xổ số Việt Nam",
  keywords: ["dò vé số", "xổ số", "kết quả xổ số", "KQXS", "vé số miền nam", "vé số miền bắc"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
