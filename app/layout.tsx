import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "BUILD PC — Tra cứu linh kiện & kiểm tra tương thích",
  description:
    "Danh sách linh kiện máy tính và công cụ kiểm tra tương thích khi build PC.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg text-brand">
              BUILD<span className="text-slate-900">PC</span>
            </Link>
            <nav className="flex gap-4 text-sm font-medium">
              <Link href="/" className="hover:text-brand">
                Linh kiện
              </Link>
              <Link href="/compatibility" className="hover:text-brand">
                Kiểm tra tương thích
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-xs text-slate-400 border-t border-slate-200 mt-12">
          Giá hiển thị là giá tham khảo, có thể chênh lệch so với thực tế tại cửa hàng.
        </footer>
      </body>
    </html>
  );
}
