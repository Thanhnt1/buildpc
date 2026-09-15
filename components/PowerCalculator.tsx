"use client";

import { useState, useMemo } from "react";
import { BuildSelection, CpuSpecs, GpuSpecs, PsuSpecs } from "@/lib/types";
import { Zap, Calculator, Gauge, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function PowerCalculator({ selection }: { selection: BuildSelection }) {
  const [hoursPerDay, setHoursPerDay] = useState<number>(5);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(30);
  const [kwhRate, setKwhRate] = useState<number>(2500); // 2.500 VNĐ / kWh

  const { cpu, gpu, psu } = selection;

  const powerData = useMemo(() => {
    const cpuW = cpu ? (cpu.specs as CpuSpecs).tdp_w || 65 : 0;
    const gpuW = gpu ? (gpu.specs as GpuSpecs).tdp_w || 150 : 0;
    const othersW = cpu || gpu ? 80 : 0; // Mainboard, RAM, SSD, Case Fans, AIO pump
    const totalMaxWatts = cpuW + gpuW + othersW;

    const psuW = psu ? (psu.specs as PsuSpecs).wattage_w || 650 : 0;
    const loadPercentage = psuW > 0 ? Math.round((totalMaxWatts / psuW) * 100) : 0;

    // Ước tính công suất thực tế trung bình khi chơi game (khoảng 70% công suất đỉnh)
    const avgGamingWatts = totalMaxWatts * 0.75;
    const monthlyKwh = (avgGamingWatts * hoursPerDay * daysPerMonth) / 1000;
    const monthlyCost = Math.round(monthlyKwh * kwhRate);

    return {
      cpuW,
      gpuW,
      othersW,
      totalMaxWatts,
      psuW,
      loadPercentage,
      avgGamingWatts: Math.round(avgGamingWatts),
      monthlyKwh: monthlyKwh.toFixed(1),
      monthlyCost,
    };
  }, [cpu, gpu, psu, hoursPerDay, daysPerMonth, kwhRate]);

  if (!cpu && !gpu && !psu) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mt-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 border border-amber-200/50">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Phân rã công suất điện & Ước tính tiền điện
          </h2>
          <p className="text-sm text-slate-500">
            Tính toán mức tiêu thụ năng lượng thực tế và chi phí điện sinh hoạt hàng tháng.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Power Breakdown */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-indigo-500" /> Công suất tiêu thụ tối đa
            </span>
            <span className="text-base font-extrabold text-slate-900">
              {powerData.totalMaxWatts}W / {powerData.psuW > 0 ? `${powerData.psuW}W (Nguồn)` : "Chưa chọn nguồn"}
            </span>
          </div>

          {/* Breakdown Visual Bar */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              {powerData.totalMaxWatts > 0 && (
                <>
                  <div
                    style={{
                      width: `${(powerData.cpuW / (powerData.psuW || powerData.totalMaxWatts)) * 100}%`,
                    }}
                    className="bg-blue-500 h-full transition-all"
                    title={`CPU: ${powerData.cpuW}W`}
                  />
                  <div
                    style={{
                      width: `${(powerData.gpuW / (powerData.psuW || powerData.totalMaxWatts)) * 100}%`,
                    }}
                    className="bg-purple-500 h-full transition-all"
                    title={`GPU: ${powerData.gpuW}W`}
                  />
                  <div
                    style={{
                      width: `${(powerData.othersW / (powerData.psuW || powerData.totalMaxWatts)) * 100}%`,
                    }}
                    className="bg-emerald-500 h-full transition-all"
                    title={`Linh kiện khác (Main, RAM, Fan): ${powerData.othersW}W`}
                  />
                </>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                CPU: <strong>{powerData.cpuW}W</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                VGA (Card đồ họa): <strong>{powerData.gpuW}W</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Main / RAM / Quạt / SSD: <strong>~{powerData.othersW}W</strong>
              </span>
            </div>
          </div>

          {/* PSU Load Ratio Evaluation */}
          {powerData.psuW > 0 && (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                powerData.loadPercentage > 85
                  ? "bg-red-50 text-red-800 border-red-200"
                  : powerData.loadPercentage >= 50 && powerData.loadPercentage <= 80
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-blue-50 text-blue-800 border-blue-200"
              }`}
            >
              {powerData.loadPercentage > 85 ? (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <strong>Tải nguồn: {powerData.loadPercentage}% công suất định mức.</strong>{" "}
                {powerData.loadPercentage > 85
                  ? "Nguồn đang gánh tải khá cao (>85%). Nên nâng cấp lên nguồn công suất lớn hơn để tăng tuổi thọ và độ ổn định."
                  : powerData.loadPercentage >= 50 && powerData.loadPercentage <= 80
                  ? "Nằm trong dải tải vàng 50% - 80%, giúp nguồn đạt hiệu suất chuyển đổi điện (80 Plus) cao nhất và quạt nguồn chạy êm ái."
                  : "Nguồn rất dư dả, thoải mái nâng cấp CPU hoặc VGA khủng hơn trong tương lai."}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Electricity Cost Estimator */}
        <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-amber-500" /> Dự toán tiền điện hàng tháng
            </span>
            <span className="text-xs text-slate-500">Tải trung bình: ~{powerData.avgGamingWatts}W</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                Thời gian chơi / ngày
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Math.max(1, Math.min(24, Number(e.target.value))))}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white text-center font-bold"
                />
                <span className="text-xs text-slate-500">giờ</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                Số ngày / tháng
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={daysPerMonth}
                  onChange={(e) => setDaysPerMonth(Math.max(1, Math.min(31, Number(e.target.value))))}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white text-center font-bold"
                />
                <span className="text-xs text-slate-500">ngày</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                Giá điện (VNĐ/kWh)
              </label>
              <input
                type="number"
                step={100}
                min={1000}
                max={5000}
                value={kwhRate}
                onChange={(e) => setKwhRate(Math.max(500, Number(e.target.value)))}
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white text-center font-bold"
              />
            </div>
          </div>

          {/* Output Highlight */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Điện năng tiêu thụ ước tính</span>
              <span className="text-sm font-extrabold text-slate-800">
                {powerData.monthlyKwh} kWh / tháng
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Tiền điện phát sinh</span>
              <span className="text-lg font-black text-amber-600">
                ~{powerData.monthlyCost.toLocaleString("vi-VN")} đ / tháng
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
