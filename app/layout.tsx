import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "BUILD PC — Tra cứu linh kiện, kiểm tra tương thích & so sánh cấu hình",
  description:
    "Danh sách linh kiện máy tính, công cụ kiểm tra tương thích phần cứng và so sánh 2 bộ cấu hình PC trực diện.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-slate-50/50 min-h-screen flex flex-col text-slate-800 antialiased">
        <Header />
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex-1 w-full">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-xs text-slate-400 border-t border-slate-200 mt-12 w-full text-center sm:text-left">
          Giá hiển thị là giá tham khảo, có thể chênh lệch so với thực tế tại cửa hàng.
        </footer>
      </body>
    </html>
  );
}
