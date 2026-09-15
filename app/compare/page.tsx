"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { PcComponent, BuildSelection, CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/types";
import { PRESET_BUILDS, findComponentForPreset } from "@/lib/presets";
import { compareTwoBuilds, ComparisonResult } from "@/lib/comparison";
import SearchableSelect from "@/components/SearchableSelect";
import Link from "next/link";
import {
  Scale,
  ArrowRightLeft,
  RotateCcw,
  Trophy,
  Zap,
  Gamepad2,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function ComparePage() {
  const [components, setComponents] = useState<PcComponent[]>([]);
  const [loading, setLoading] = useState(true);

  // Khởi tạo 2 cấu hình mẫu mặc định để người dùng thấy so sánh trực quan ngay khi vào trang
  const [buildA, setBuildA] = useState<BuildSelection>({});
  const [buildB, setBuildB] = useState<BuildSelection>({});
  const [nameA, setNameA] = useState("Cấu hình Gaming Quốc Dân");
  const [nameB, setNameB] = useState("Cấu hình 2K Pro & Streamer");

  // Tải danh sách linh kiện từ Supabase
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("pc_components").select("*").order("name");
      const list = (data as PcComponent[]) ?? [];
      setComponents(list);

      // Tự động nạp sẵn Cấu hình Quốc Dân vào A và Cấu hình 2K Pro vào B
      if (list.length > 0) {
        const presetA = PRESET_BUILDS[1]; // Gaming Quốc Dân ~20M
        const presetB = PRESET_BUILDS[2]; // 2K Pro ~35M

        setBuildA({
          cpu: findComponentForPreset(list, "cpu", presetA.matcher.cpu),
          mainboard: findComponentForPreset(list, "mainboard", presetA.matcher.mainboard),
          ram: findComponentForPreset(list, "ram", presetA.matcher.ram),
          gpu: findComponentForPreset(list, "gpu", presetA.matcher.gpu),
          storage: findComponentForPreset(list, "storage", presetA.matcher.storage),
          psu: findComponentForPreset(list, "psu", presetA.matcher.psu),
          case: findComponentForPreset(list, "case", presetA.matcher.case),
          cooler: findComponentForPreset(list, "cooler", presetA.matcher.cooler),
        });

        setBuildB({
          cpu: findComponentForPreset(list, "cpu", presetB.matcher.cpu),
          mainboard: findComponentForPreset(list, "mainboard", presetB.matcher.mainboard),
          ram: findComponentForPreset(list, "ram", presetB.matcher.ram),
          gpu: findComponentForPreset(list, "gpu", presetB.matcher.gpu),
          storage: findComponentForPreset(list, "storage", presetB.matcher.storage),
          psu: findComponentForPreset(list, "psu", presetB.matcher.psu),
          case: findComponentForPreset(list, "case", presetB.matcher.case),
          cooler: findComponentForPreset(list, "cooler", presetB.matcher.cooler),
        });
      }

      setLoading(false);
    })();
  }, []);

  const byCategory = (cat: string) => components.filter((c) => c.category === cat);

  // Nạp Preset vào A hoặc B
  const handleApplyPreset = (presetId: string, target: "A" | "B") => {
    const preset = PRESET_BUILDS.find((p) => p.id === presetId);
    if (!preset || components.length === 0) return;

    const newBuild: BuildSelection = {
      cpu: findComponentForPreset(components, "cpu", preset.matcher.cpu),
      mainboard: findComponentForPreset(components, "mainboard", preset.matcher.mainboard),
      ram: findComponentForPreset(components, "ram", preset.matcher.ram),
      gpu: findComponentForPreset(components, "gpu", preset.matcher.gpu),
      storage: findComponentForPreset(components, "storage", preset.matcher.storage),
      psu: findComponentForPreset(components, "psu", preset.matcher.psu),
      case: findComponentForPreset(components, "case", preset.matcher.case),
      cooler: findComponentForPreset(components, "cooler", preset.matcher.cooler),
    };

    if (target === "A") {
      setBuildA(newBuild);
      setNameA(preset.name);
    } else {
      setBuildB(newBuild);
      setNameB(preset.name);
    }
  };

  // Hoán đổi vị trí A <-> B
  const handleSwap = () => {
    const tempBuild = { ...buildA };
    const tempName = nameA;
    setBuildA({ ...buildB });
    setNameA(nameB);
    setBuildB(tempBuild);
    setNameB(tempName);
  };

  // Xóa trắng cấu hình
  const handleClearBuild = (target: "A" | "B") => {
    if (target === "A") {
      setBuildA({});
      setNameA("Cấu hình A");
    } else {
      setBuildB({});
      setNameB("Cấu hình B");
    }
  };

  // Kết quả so sánh tính toán theo thời gian thực
  const comparison: ComparisonResult = useMemo(() => {
    return compareTwoBuilds(buildA, buildB, nameA, nameB);
  }, [buildA, buildB, nameA, nameB]);

  const countA = Object.keys(buildA).length;
  const countB = Object.keys(buildB).length;

  // Link xuất qua trang Kiểm tra tương thích
  const getCompatibilityUrl = (selection: BuildSelection) => {
    const params = new URLSearchParams();
    CATEGORY_ORDER.forEach((cat) => {
      if (selection[cat]?.id) params.set(cat, selection[cat]!.id);
    });
    return `/compatibility?${params.toString()}`;
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Scale className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">So sánh 2 bộ cấu hình PC</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Đối đầu trực diện giữa 2 dàn máy: so sánh chênh lệch giá tiền, sức mạnh hiệu năng,
            FPS trong các tựa game hot và công suất tiêu thụ điện.
          </p>
        </div>

        <button
          onClick={handleSwap}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-colors shrink-0"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
          <span>Hoán đổi vị trí (A ⇄ B)</span>
        </button>
      </div>

      {loading && <p className="text-slate-400 text-sm">Đang tải dữ liệu linh kiện...</p>}

      {!loading && (
        <>
          {/* Verdict Banner (Kết luận P/P & Lời khuyên thông minh) */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-emerald-50/80 p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                Đánh giá & Kết luận tối ưu (Price / Performance)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {comparison.verdict}
            </p>

            {comparison.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {comparison.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 shadow-xs text-slate-800"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Side-by-Side Summary Scoreboards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column A Card */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/20 p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-blue-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                    A
                  </span>
                  <input
                    value={nameA}
                    onChange={(e) => setNameA(e.target.value)}
                    className="text-base font-bold text-slate-900 bg-transparent border-b border-dashed border-blue-300 focus:outline-none focus:border-blue-600 px-1 py-0.5"
                    title="Nhấp để đổi tên"
                  />
                </div>

                <div className="sm:text-right">
                  <span className="text-[11px] text-slate-500 uppercase font-medium block">
                    Tổng tiền A
                  </span>
                  <span className="text-xl font-black text-blue-700">
                    {comparison.buildA.formattedPrice}
                  </span>
                </div>
              </div>

              {/* Preset Selector for A */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-slate-500 text-[11px] font-medium shrink-0">Nạp mẫu:</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleApplyPreset(e.target.value, "A");
                      e.target.value = "";
                    }}
                    defaultValue=""
                    className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs bg-white font-medium"
                  >
                    <option value="" disabled>
                      -- Chọn bộ cấu hình mẫu --
                    </option>
                    {PRESET_BUILDS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.budgetRange})
                      </option>
                    ))}
                  </select>
                </div>
                {countA > 0 && (
                  <button
                    onClick={() => handleClearBuild("A")}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Xóa cấu hình A"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Stats A */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs pt-1">
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-xs">
                  <span className="text-[10px] text-slate-500 block mb-0.5">Điểm sức mạnh</span>
                  <span className="text-lg font-black text-blue-600">
                    {comparison.buildA.pubgEval.overallScore}/100
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-xs">
                  <span className="text-[10px] text-slate-500 block mb-0.5">PUBG (1080p)</span>
                  <span className="text-lg font-black text-slate-800">
                    ~{comparison.buildA.gameFps.pubg} FPS
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-xs">
                  <span className="text-[10px] text-slate-500 block mb-0.5">Công suất đỉnh</span>
                  <span className="text-lg font-black text-slate-800">
                    {comparison.buildA.totalWatts}W
                  </span>
                </div>
              </div>

              {/* Jump to Compatibility check for A */}
              {countA > 0 && (
                <Link
                  href={getCompatibilityUrl(buildA)}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Kiểm tra chi tiết tương thích Cấu hình A</span>
                </Link>
              )}
            </div>

            {/* Column B Card */}
            <div className="rounded-2xl border border-purple-200 bg-purple-50/20 p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                    B
                  </span>
                  <input
                    value={nameB}
                    onChange={(e) => setNameB(e.target.value)}
                    className="text-base font-bold text-slate-900 bg-transparent border-b border-dashed border-purple-300 focus:outline-none focus:border-purple-600 px-1 py-0.5"
                    title="Nhấp để đổi tên"
                  />
                </div>

                <div className="sm:text-right">
                  <span className="text-[11px] text-slate-500 uppercase font-medium block">
                    Tổng tiền B
                  </span>
                  <span className="text-xl font-black text-purple-700">
                    {comparison.buildB.formattedPrice}
                  </span>
                </div>
              </div>

              {/* Preset Selector for B */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-slate-500 text-[11px] font-medium shrink-0">Nạp mẫu:</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleApplyPreset(e.target.value, "B");
                      e.target.value = "";
                    }}
                    defaultValue=""
                    className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs bg-white font-medium"
                  >
                    <option value="" disabled>
                      -- Chọn bộ cấu hình mẫu --
                    </option>
                    {PRESET_BUILDS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.budgetRange})
                      </option>
                    ))}
                  </select>
                </div>
                {countB > 0 && (
                  <button
                    onClick={() => handleClearBuild("B")}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Xóa cấu hình B"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Stats B */}
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs pt-1">
                <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-xs">
                  <span className="text-[10px] text-slate-500 block mb-0.5">Điểm sức mạnh</span>
                  <span className="text-lg font-black text-purple-600">
                    {comparison.buildB.pubgEval.overallScore}/100
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-xs">
                  <span className="text-[10px] text-slate-500 block mb-0.5">PUBG (1080p)</span>
                  <span className="text-lg font-black text-slate-800">
                    ~{comparison.buildB.gameFps.pubg} FPS
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-xs">
                  <span className="text-[10px] text-slate-500 block mb-0.5">Công suất đỉnh</span>
                  <span className="text-lg font-black text-slate-800">
                    {comparison.buildB.totalWatts}W
                  </span>
                </div>
              </div>

              {/* Jump to Compatibility check for B */}
              {countB > 0 && (
                <Link
                  href={getCompatibilityUrl(buildB)}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Kiểm tra chi tiết tương thích Cấu hình B</span>
                </Link>
              )}
            </div>
          </div>

          {/* Game FPS Head-to-Head Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-indigo-600" /> Bảng so sánh FPS trong các tựa game
              </span>
              <span className="text-[11px] text-slate-500">Thiết lập 1080p Esport / High Settings</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 font-bold text-slate-700">Tựa Game</th>
                    <th className="px-5 py-3 font-bold text-blue-700">A: {nameA}</th>
                    <th className="px-5 py-3 font-bold text-purple-700">B: {nameB}</th>
                    <th className="px-5 py-3 font-bold text-slate-800">Chênh lệch FPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* PUBG */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-bold text-slate-800">PUBG PC</td>
                    <td className="px-5 py-3 font-bold text-slate-700">~{comparison.buildA.gameFps.pubg} FPS</td>
                    <td className="px-5 py-3 font-bold text-slate-700">~{comparison.buildB.gameFps.pubg} FPS</td>
                    <td className="px-5 py-3 font-semibold">
                      {comparison.fpsDiff.pubg.winner === "A" && (
                        <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                          A nhỉnh hơn +{comparison.fpsDiff.pubg.diff} FPS
                        </span>
                      )}
                      {comparison.fpsDiff.pubg.winner === "B" && (
                        <span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
                          B nhỉnh hơn +{comparison.fpsDiff.pubg.diff} FPS
                        </span>
                      )}
                      {comparison.fpsDiff.pubg.winner === "equal" && (
                        <span className="text-slate-400">Ngang nhau</span>
                      )}
                    </td>
                  </tr>

                  {/* CS2 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-bold text-slate-800">Counter-Strike 2 (CS2)</td>
                    <td className="px-5 py-3 font-bold text-slate-700">~{comparison.buildA.gameFps.cs2} FPS</td>
                    <td className="px-5 py-3 font-bold text-slate-700">~{comparison.buildB.gameFps.cs2} FPS</td>
                    <td className="px-5 py-3 font-semibold">
                      {comparison.fpsDiff.cs2.winner === "A" && (
                        <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                          A nhỉnh hơn +{comparison.fpsDiff.cs2.diff} FPS
                        </span>
                      )}
                      {comparison.fpsDiff.cs2.winner === "B" && (
                        <span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
                          B nhỉnh hơn +{comparison.fpsDiff.cs2.diff} FPS
                        </span>
                      )}
                      {comparison.fpsDiff.cs2.winner === "equal" && (
                        <span className="text-slate-400">Ngang nhau</span>
                      )}
                    </td>
                  </tr>

                  {/* Black Myth: Wukong */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-bold text-slate-800">Black Myth: Wukong</td>
                    <td className="px-5 py-3 font-bold text-slate-700">~{comparison.buildA.gameFps.wukong} FPS</td>
                    <td className="px-5 py-3 font-bold text-slate-700">~{comparison.buildB.gameFps.wukong} FPS</td>
                    <td className="px-5 py-3 font-semibold">
                      {comparison.fpsDiff.wukong.winner === "A" && (
                        <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                          A nhỉnh hơn +{comparison.fpsDiff.wukong.diff} FPS
                        </span>
                      )}
                      {comparison.fpsDiff.wukong.winner === "B" && (
                        <span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
                          B nhỉnh hơn +{comparison.fpsDiff.wukong.diff} FPS
                        </span>
                      )}
                      {comparison.fpsDiff.wukong.winner === "equal" && (
                        <span className="text-slate-400">Ngang nhau</span>
                      )}
                    </td>
                  </tr>

                  {/* Valorant */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-bold text-slate-800">Valorant</td>
                    <td className="px-5 py-3 font-bold text-slate-700">~{comparison.buildA.gameFps.valorant} FPS</td>
                    <td className="px-5 py-3 font-bold text-slate-700">~{comparison.buildB.gameFps.valorant} FPS</td>
                    <td className="px-5 py-3 font-semibold">
                      {comparison.fpsDiff.valorant.winner === "A" && (
                        <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                          A nhỉnh hơn +{comparison.fpsDiff.valorant.diff} FPS
                        </span>
                      )}
                      {comparison.fpsDiff.valorant.winner === "B" && (
                        <span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
                          B nhỉnh hơn +{comparison.fpsDiff.valorant.diff} FPS
                        </span>
                      )}
                      {comparison.fpsDiff.valorant.winner === "equal" && (
                        <span className="text-slate-400">Ngang nhau</span>
                      )}
                    </td>
                  </tr>

                  {/* Cyberpunk 2077 */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-bold text-slate-800">Cyberpunk 2077</td>
                    <td className="px-5 py-3 font-bold text-slate-700">~{comparison.buildA.gameFps.cyberpunk} FPS</td>
                    <td className="px-5 py-3 font-bold text-slate-700">~{comparison.buildB.gameFps.cyberpunk} FPS</td>
                    <td className="px-5 py-3 font-semibold">
                      {comparison.fpsDiff.cyberpunk.winner === "A" && (
                        <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                          A nhỉnh hơn +{comparison.fpsDiff.cyberpunk.diff} FPS
                        </span>
                      )}
                      {comparison.fpsDiff.cyberpunk.winner === "B" && (
                        <span className="text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">
                          B nhỉnh hơn +{comparison.fpsDiff.cyberpunk.diff} FPS
                        </span>
                      )}
                      {comparison.fpsDiff.cyberpunk.winner === "equal" && (
                        <span className="text-slate-400">Ngang nhau</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Component Pickers Grid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Layers className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Tùy chỉnh linh kiện từng món cho 2 cấu hình
                </h2>
                <p className="text-xs text-slate-500">
                  Thay đổi bất kỳ linh kiện nào để đối chiếu thay đổi giá tiền và hiệu năng ngay lập tức.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Slot A Component Pickers */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-blue-600">
                  <span className="text-sm font-extrabold text-blue-700 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                      A
                    </span>
                    {nameA}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {comparison.buildA.formattedPrice}
                  </span>
                </div>

                {CATEGORY_ORDER.map((cat) => (
                  <div key={`a-${cat}`} className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        {CATEGORY_LABELS[cat]}
                      </label>
                      {buildA[cat] && (
                        <span className="text-[11px] font-bold text-blue-600">
                          {buildA[cat]?.price_min
                            ? `${buildA[cat]?.price_min?.toLocaleString("vi-VN")} đ`
                            : "Chưa có giá"}
                        </span>
                      )}
                    </div>
                    <SearchableSelect
                      category={cat}
                      components={byCategory(cat)}
                      selectedComponent={buildA[cat]}
                      onSelect={(comp) => {
                        setBuildA((prev) => {
                          const next = { ...prev };
                          if (comp) next[cat] = comp;
                          else delete next[cat];
                          return next;
                        });
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Slot B Component Pickers */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b-2 border-purple-600">
                  <span className="text-sm font-extrabold text-purple-700 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center">
                      B
                    </span>
                    {nameB}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {comparison.buildB.formattedPrice}
                  </span>
                </div>

                {CATEGORY_ORDER.map((cat) => (
                  <div key={`b-${cat}`} className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        {CATEGORY_LABELS[cat]}
                      </label>
                      {buildB[cat] && (
                        <span className="text-[11px] font-bold text-purple-600">
                          {buildB[cat]?.price_min
                            ? `${buildB[cat]?.price_min?.toLocaleString("vi-VN")} đ`
                            : "Chưa có giá"}
                        </span>
                      )}
                    </div>
                    <SearchableSelect
                      category={cat}
                      components={byCategory(cat)}
                      selectedComponent={buildB[cat]}
                      onSelect={(comp) => {
                        setBuildB((prev) => {
                          const next = { ...prev };
                          if (comp) next[cat] = comp;
                          else delete next[cat];
                          return next;
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
