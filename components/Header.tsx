"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutGrid, Wrench, Scale } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "Linh kiện",
      icon: LayoutGrid,
    },
    {
      href: "/compatibility",
      label: "Kiểm tra tương thích",
      icon: Wrench,
    },
    {
      href: "/compare",
      label: "So sánh cấu hình",
      icon: Scale,
    },
  ];

  return (
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group w-fit"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Image
              src="/ntr-logo.png"
              alt="NTR"
              width={40}
              height={40}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="font-extrabold text-xl tracking-tight text-slate-900">
            BUILD<span className="text-brand">PC</span>
          </div>
        </Link>

        {/* Navigation Buttons */}
        <nav className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white text-brand shadow-xs shadow-slate-200/50 border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-brand" : "text-slate-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
