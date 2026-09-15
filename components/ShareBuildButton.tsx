"use client";

import { useState } from "react";
import { BuildSelection, CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/types";
import { Share2, Copy, Check, Printer, FileText, ExternalLink } from "lucide-react";

interface ShareBuildButtonProps {
  selection: BuildSelection;
}

export default function ShareBuildButton({ selection }: { selection: BuildSelection }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const selectedCount = Object.keys(selection).length;

  // Sinh link chia sẻ URL Permalink
  const generateShareUrl = () => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams();
    CATEGORY_ORDER.forEach((cat) => {
      if (selection[cat]?.id) {
        params.set(cat, selection[cat]!.id);
      }
    });
    const queryString = params.toString();
    return queryString
      ? `${window.location.origin}${window.location.pathname}?${queryString}`
      : `${window.location.origin}${window.location.pathname}`;
  };

  // Sao chép link URL
  const handleCopyLink = () => {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Sao chép dạng văn bản / Markdown báo giá
  const handleCopyText = () => {
    let text = "🖥️ BẢNG CẤU HÌNH MÁY TÍNH (BUILD PC)\n";
    text += "====================================\n";
    let totalMin = 0;
    let totalMax = 0;

    CATEGORY_ORDER.forEach((cat) => {
      const comp = selection[cat];
      if (comp) {
        const price = comp.price_min
          ? `${comp.price_min.toLocaleString("vi-VN")} đ`
          : "Chưa có giá";
        text += `• ${CATEGORY_LABELS[cat]}: [${comp.brand}] ${comp.name} - ${price}\n`;
        totalMin += comp.price_min || 0;
        totalMax += comp.price_max || comp.price_min || 0;
      }
    });

    text += "====================================\n";
    text += `💰 TỔNG TIỀN: ${
      totalMin === totalMax
        ? `${totalMin.toLocaleString("vi-VN")} VNĐ`
        : `${totalMin.toLocaleString("vi-VN")} - ${totalMax.toLocaleString("vi-VN")} VNĐ`
    }\n`;
    text += `🔗 Xem chi tiết & Tương thích: ${generateShareUrl()}\n`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (selectedCount === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs whitespace-nowrap transition-all hover:border-slate-300"
      >
        <Share2 className="w-3.5 h-3.5 text-brand shrink-0" />
        <span className="whitespace-nowrap">Chia sẻ / Xuất báo giá</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Chia sẻ & Xuất cấu hình
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {/* Copy URL Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-brand/40 hover:bg-brand/5 text-left transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-brand">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Sao chép Link chia sẻ</div>
                    <div className="text-[10px] text-slate-500">Mã hóa toàn bộ linh kiện vào URL</div>
                  </div>
                </div>
                {copiedLink ? (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Đã chép
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {/* Copy Text / Markdown */}
              <button
                onClick={handleCopyText}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-brand/40 hover:bg-brand/5 text-left transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Sao chép Báo giá (Text)</div>
                    <div className="text-[10px] text-slate-500">Dán nhanh vào Zalo / Messenger</div>
                  </div>
                </div>
                {copiedText ? (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Đã chép
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {/* Print View */}
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-brand/40 hover:bg-brand/5 text-left transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                    <Printer className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">In / Lưu file PDF</div>
                    <div className="text-[10px] text-slate-500">Bản in sạch đẹp để lưu trữ</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
