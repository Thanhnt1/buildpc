"use client";

import { BuildSelection } from "@/lib/types";
import { evaluatePubgCompatibility } from "@/lib/pubgCompatibility";
import {
  Gamepad2,
  Coins,
  Cpu,
  Monitor,
  HardDrive,
  Layers,
  Sparkles,
  Sliders,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Flame,
  Zap,
} from "lucide-react";

export default function PubgCompatibility({ selection }: { selection: BuildSelection }) {
  const evalResult = evaluatePubgCompatibility(selection);
  const selectedCount = Object.keys(selection).length;

  if (selectedCount === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mt-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Đánh giá tương thích với game PUBG PC
            </h2>
            <p className="text-sm text-slate-500">
              Chọn các linh kiện ở bảng trên để phân tích chi tiết hiệu năng chiến PUBG.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm mt-8 transition-all">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">
                  Tương thích & Hiệu năng PUBG PC
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Flame className="w-3.5 h-3.5" /> Battlegrounds
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Phân tích chuyên sâu từ bộ quy chuẩn phần cứng Unreal Engine 4 và trải nghiệm thực tế.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">
                Tổng chi phí linh kiện đã chọn
              </span>
              <span className="text-xl font-extrabold text-amber-400">
                {evalResult.formattedPrice}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">
              Phân khúc hiệu năng
            </span>
            <div
              className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border mb-1.5 ${evalResult.tierBadgeColor}`}
            >
              {evalResult.tierTitle}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {evalResult.tierDescription}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Điểm hiệu năng PUBG
              </span>
              <span className="text-xs font-bold text-indigo-600">
                {evalResult.overallScore}/100
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-500 ${
                  evalResult.overallScore >= 80
                    ? "bg-purple-600"
                    : evalResult.overallScore >= 65
                    ? "bg-emerald-500"
                    : evalResult.overallScore >= 45
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(5, evalResult.overallScore))}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Tính toán dựa trên tương quan CPU (40%), VGA (45%) & RAM (15%).
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">
              Tổng tiền build
            </span>
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-lg mb-1">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>{evalResult.formattedPrice}</span>
            </div>
            <p className="text-xs text-slate-500">
              {selectedCount} / 8 danh mục linh kiện đã được chọn.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide block mb-1">
              Độ sẵn sàng hệ thống
            </span>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border mb-1.5 ${evalResult.systemReadiness.badgeColor}`}
            >
              {evalResult.systemReadiness.status === "ready" && (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              )}
              {evalResult.systemReadiness.status === "has_errors" && (
                <XCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
              )}
              {evalResult.systemReadiness.status === "missing_parts" && (
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              )}
              <span>{evalResult.systemReadiness.title}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {evalResult.systemReadiness.message}
            </p>
          </div>
        </div>

        {/* Cảnh báo nổi bật nếu có lỗi xung đột phần cứng */}
        {evalResult.systemReadiness.status === "has_errors" && (
          <div className="rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-800">
            <div className="flex items-center gap-2 font-bold text-red-900 mb-1.5">
              <XCircle className="w-4 h-4 text-red-600" />
              <span>Phát hiện xung đột phần cứng khiến hệ thống không thể khởi động hoặc lắp ráp:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-red-700 ml-1">
              {evalResult.systemReadiness.errorMessages.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 1: Estimated FPS Grid */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-slate-800 text-base">
              Ước tính khung hình FPS trong trận đấu
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1080p Competitive */}
            <div className="rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-900 uppercase">
                  1080p Competitive
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-medium">
                  Thi đấu Esport
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-indigo-700">
                  ~{evalResult.fpsEstimates.fhdCompetitive.avg}
                </span>
                <span className="text-xs font-bold text-slate-500">FPS Avg</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                1% Low: <span className="font-semibold text-slate-700">~{evalResult.fpsEstimates.fhdCompetitive.min1Percent} FPS</span>
              </div>
            </div>

            {/* 1080p Ultra */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase">
                  1080p Ultra
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                  Đồ họa tối đa
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-800">
                  ~{evalResult.fpsEstimates.fhdUltra.avg}
                </span>
                <span className="text-xs font-bold text-slate-500">FPS Avg</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                1% Low: <span className="font-semibold text-slate-700">~{evalResult.fpsEstimates.fhdUltra.min1Percent} FPS</span>
              </div>
            </div>

            {/* 2K 1440p Competitive */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase">
                  2K 1440p Competitive
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">
                  Màn 2K nét căng
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-800">
                  ~{evalResult.fpsEstimates.qhdCompetitive.avg}
                </span>
                <span className="text-xs font-bold text-slate-500">FPS Avg</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                1% Low: <span className="font-semibold text-slate-700">~{evalResult.fpsEstimates.qhdCompetitive.min1Percent} FPS</span>
              </div>
            </div>

            {/* 4K Ultra */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase">
                  4K 2160p Ultra
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-medium">
                  4K Cinematic
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-800">
                  ~{evalResult.fpsEstimates.uhdUltra.avg}
                </span>
                <span className="text-xs font-bold text-slate-500">FPS Avg</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                1% Low: <span className="font-semibold text-slate-700">~{evalResult.fpsEstimates.uhdUltra.min1Percent} FPS</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            * 1% Low FPS là chỉ số mượt mà thực tế khi giao tranh bom khói, lái xe tốc độ cao hoặc đáp dù đông người.
          </p>
        </div>

        {/* Section 2: Detailed Component Evaluation */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-slate-800 text-base">
              Thông tin chi tiết từng linh kiện với PUBG
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* CPU */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    Bộ vi xử lý (CPU)
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    evalResult.componentDetails.cpu.status === "good"
                      ? "bg-emerald-100 text-emerald-800"
                      : evalResult.componentDetails.cpu.status === "warning"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {evalResult.componentDetails.cpu.status === "good"
                    ? "Tốt"
                    : evalResult.componentDetails.cpu.status === "warning"
                    ? "Cân nhắc"
                    : "Chưa đạt"}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {evalResult.componentDetails.cpu.message}
              </p>
            </div>

            {/* GPU */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    Card đồ họa (VGA)
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    evalResult.componentDetails.gpu.status === "good"
                      ? "bg-emerald-100 text-emerald-800"
                      : evalResult.componentDetails.gpu.status === "warning"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {evalResult.componentDetails.gpu.status === "good"
                    ? "Tốt"
                    : evalResult.componentDetails.gpu.status === "warning"
                    ? "Cân nhắc"
                    : "Chưa đạt"}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {evalResult.componentDetails.gpu.message}
              </p>
            </div>

            {/* RAM */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    Bộ nhớ RAM
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    evalResult.componentDetails.ram.status === "good"
                      ? "bg-emerald-100 text-emerald-800"
                      : evalResult.componentDetails.ram.status === "warning"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {evalResult.componentDetails.ram.status === "good"
                    ? "Tốt"
                    : evalResult.componentDetails.ram.status === "warning"
                    ? "Cân nhắc"
                    : "Chưa đạt"}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {evalResult.componentDetails.ram.message}
              </p>
            </div>

            {/* Storage */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    Ổ cứng lưu trữ
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    evalResult.componentDetails.storage.status === "good"
                      ? "bg-emerald-100 text-emerald-800"
                      : evalResult.componentDetails.storage.status === "warning"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {evalResult.componentDetails.storage.status === "good"
                    ? "Tốt"
                    : evalResult.componentDetails.storage.status === "warning"
                    ? "Cân nhắc"
                    : "Chưa đạt"}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {evalResult.componentDetails.storage.message}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Recommendations / Suggestions */}
        {evalResult.recommendations.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-amber-900 text-base">
                Gợi ý nâng cấp & Bổ sung linh kiện tối ưu cho PUBG
              </h3>
            </div>
            <ul className="space-y-2">
              {evalResult.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="mt-0.5 text-amber-600 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section 4: Optimal In-Game Settings */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sliders className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-800 text-base">
              Thông số thiết lập (In-Game Settings) khuyên dùng cho cấu hình này
            </h3>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Thiết lập đồ họa</th>
                  <th className="px-4 py-3">Mức khuyên dùng</th>
                  <th className="px-4 py-3">Mục đích tối ưu khi bắn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {evalResult.inGameSettings.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                      {item.setting}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-indigo-600 whitespace-nowrap">
                      {item.value}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {item.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
