"use client";

import { useState } from "react";
import { BuildSelection, PcComponent, CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/types";
import { PRESET_BUILDS, findComponentForPreset } from "@/lib/presets";
import { compareTwoBuilds, ComparisonResult } from "@/lib/comparison";
import SearchableSelect from "./SearchableSelect";
import {
  Scale,
  ArrowRightLeft,
  Copy,
  Trash2,
  Trophy,
  Zap,
  CheckCircle2,
  Coins,
  Gamepad2,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface BuildComparisonProps {
  currentSelection: BuildSelection;
  components: PcComponent[];
  onApplyBuildToMain: (selection: BuildSelection) => void;
}

export default function BuildComparison({
  currentSelection,
  components,
  onApplyBuildToMain,
}: BuildComparisonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [buildA, setBuildA] = useState<BuildSelection>(currentSelection);
  const [buildB, setBuildB] = useState<BuildSelection>({});
  const [nameA, setNameA] = useState("Cấu hình A (Hiện tại)");
  const [nameB, setNameB] = useState("Cấu hình B");
  const [showComponentDetail, setShowComponentDetail] = useState(true);

  // Nhóm linh kiện theo danh mục
  const byCategory = (cat: string) => components.filter((c) => c.category === cat);

  // Sao chép cấu hình chính hiện tại vào Slot A
  const handleCopyCurrentToA = () => {
    setBuildA({ ...currentSelection });
    setNameA("Cấu hình A (Hiện tại)");
  };

  // Sao chép cấu hình chính hiện tại vào Slot B
  const handleCopyCurrentToB = () => {
    setBuildB({ ...currentSelection });
    setNameB("Cấu hình B (Bản sao)");
  };

  // Hoán đổi 2 cấu hình A <-> B
  const handleSwap = () => {
    const tempBuild = { ...buildA };
    const tempName = nameA;
    setBuildA({ ...buildB });
    setNameA(nameB);
    setBuildB(tempBuild);
    setNameB(tempName);
  };

  // Nạp 1 Preset mẫu vào Slot B
  const handleLoadPresetToB = (presetId: string) => {
    const preset = PRESET_BUILDS.find((p) => p.id === presetId);
    if (!preset) return;

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

    setBuildB(newBuild);
    setNameB(preset.name);
  };

  // Kết quả so sánh
  const comparison: ComparisonResult = compareTwoBuilds(buildA, buildB, nameA, nameB);

  const countA = Object.keys(buildA).length;
  const countB = Object.keys(buildB).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-8 transition-all">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">
                So sánh 2 bộ cấu hình PC
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Đối đầu trực diện
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              So sánh chi tiết chênh lệch giá tiền, hiệu năng FPS game, công suất điện và linh kiện từng món.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-xs transition-colors shrink-0"
        >
          <span>{isOpen ? "Thu gọn so sánh" : "Mở bảng so sánh 2 dàn máy"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-6 space-y-6 animate-in fade-in duration-200">
          {/* Action Quick Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyCurrentToA}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Copy className="w-3.5 h-3.5 text-blue-500" /> Nạp dàn hiện tại vào A
              </button>
              <button
                onClick={handleCopyCurrentToB}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Copy className="w-3.5 h-3.5 text-purple-500" /> Nạp dàn hiện tại vào B
              </button>
              <button
                onClick={handleSwap}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 shadow-xs"
                title="Đổi chỗ A và B"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" /> Đổi chỗ A ⇄ B
              </button>
            </div>

            {/* Quick Preset for B */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Nhanh cho B:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) handleLoadPresetToB(e.target.value);
                  e.target.value = "";
                }}
                defaultValue=""
                className="rounded-lg border border-slate-300 px-2 py-1 text-xs bg-white font-medium"
              >
                <option value="" disabled>
                  -- Chọn mẫu --
                </option>
                {PRESET_BUILDS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.budgetRange})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Verdict Banner (Kết luận thông minh) */}
          {(countA > 0 || countB > 0) && (
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-emerald-50/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  Đánh giá so sánh & Lời khuyên tối ưu
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {comparison.verdict}
              </p>

              {comparison.highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {comparison.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 shadow-xs text-slate-800"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Side-by-Side Summary Scoreboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column A */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/20 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                      A
                    </span>
                    <input
                      value={nameA}
                      onChange={(e) => setNameA(e.target.value)}
                      className="text-base font-bold text-slate-900 bg-transparent border-b border-dashed border-blue-300 focus:outline-none focus:border-blue-600 px-1 py-0.5"
                    />
                  </div>
                  <span className="text-xs text-slate-500 ml-8 block mt-0.5">
                    {countA}/8 linh kiện đã chọn
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 uppercase font-medium block">
                    Tổng tiền A
                  </span>
                  <span className="text-lg font-black text-blue-700">
                    {comparison.buildA.formattedPrice}
                  </span>
                </div>
              </div>

              {/* Stats A */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-blue-100 shadow-xs">
                  <span className="text-[10px] text-slate-500 block mb-0.5">Điểm sức mạnh</span>
                  <span className="text-base font-black text-blue-600">
                    {comparison.buildA.pubgEval.overallScore}/100
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-100 shadow-xs">
                  <span className="text-[10px] text-slate-500 block mb-0.5">PUBG (1080p)</span>
                  <span className="text-base font-black text-slate-800">
                    ~{comparison.buildA.gameFps.pubg} FPS
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-100 shadow-xs">
                  <span className="text-[10px] text-slate-500 block mb-0.5">Công suất đỉnh</span>
                  <span className="text-base font-black text-slate-800">
                    {comparison.buildA.totalWatts}W
                  </span>
                </div>
              </div>

              {/* Load A to Main Board Button */}
              <button
                onClick={() => onApplyBuildToMain(buildA)}
                className="w-full py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
              >
                Đưa Cấu hình A lên bảng chính để kiểm tra chi tiết
              </button>
            </div>

            {/* Column B */}
            <div className="rounded-2xl border border-purple-200 bg-purple-50/20 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">
                      B
                    </span>
                    <input
                      value={nameB}
                      onChange={(e) => setNameB(e.target.value)}
                      className="text-base font-bold text-slate-900 bg-transparent border-b border-dashed border-purple-300 focus:outline-none focus:border-purple-600 px-1 py-0.5"
                    />
                  </div>
                  <span className="text-xs text-slate-500 ml-8 block mt-0.5">
                    {countB}/8 linh kiện đã chọn
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 uppercase font-medium block">
                    Tổng tiền B
                  </span>
                  <span className="text-lg font-black text-purple-700">
                    {comparison.buildB.formattedPrice}
                  </span>
                </div>
              </div>

              {/* Stats B */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-purple-100 shadow-xs">
                  <span className="text-[10px] text-slate-500 block mb-0.5">Điểm sức mạnh</span>
                  <span className="text-base font-black text-purple-600">
                    {comparison.buildB.pubgEval.overallScore}/100
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-purple-100 shadow-xs">
                  <span className="text-[10px] text-slate-500 block mb-0.5">PUBG (1080p)</span>
                  <span className="text-base font-black text-slate-800">
                    ~{comparison.buildB.gameFps.pubg} FPS
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-purple-100 shadow-xs">
                  <span className="text-[10px] text-slate-500 block mb-0.5">Công suất đỉnh</span>
                  <span className="text-base font-black text-slate-800">
                    {comparison.buildB.totalWatts}W
                  </span>
                </div>
              </div>

              {/* Load B to Main Board Button */}
              <button
                onClick={() => onApplyBuildToMain(buildB)}
                className="w-full py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-xs"
              >
                Đưa Cấu hình B lên bảng chính để kiểm tra chi tiết
              </button>
            </div>
          </div>

          {/* Game FPS Head-to-Head Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-indigo-600" /> Bảng so sánh FPS trong các tựa game
              </span>
              <span className="text-[11px] text-slate-500">Thiết lập 1080p Esport / High</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Tựa Game</th>
                    <th className="px-4 py-2.5 font-semibold text-blue-700">A: {nameA}</th>
                    <th className="px-4 py-2.5 font-semibold text-purple-700">B: {nameB}</th>
                    <th className="px-4 py-2.5 font-semibold text-slate-800">Chênh lệch FPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* PUBG */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-bold text-slate-800">PUBG PC</td>
                    <td className="px-4 py-2.5 font-bold text-slate-700">~{comparison.buildA.gameFps.pubg} FPS</td>
                    <td className="px-4 py-2.5 font-bold text-slate-700">~{comparison.buildB.gameFps.pubg} FPS</td>
                    <td className="px-4 py-2.5 font-semibold">
                      {comparison.fpsDiff.pubg.winner === "A" && (
                        <span className="text-blue-600 font-bold">A nhỉnh hơn +{comparison.fpsDiff.pubg.diff} FPS</span>
                      )}
                      {comparison.fpsDiff.pubg.winner === "B" && (
                        <span className="text-purple-600 font-bold">B nhỉnh hơn +{comparison.fpsDiff.pubg.diff} FPS</span>
                      )}
                      {comparison.fpsDiff.pubg.winner === "equal" && (
                        <span className="text-slate-400">Ngang nhau</span>
                      )}
                    </td>
                  </tr>

                  {/* CS2 */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-bold text-slate-800">Counter-Strike 2 (CS2)</td>
                    <td className="px-4 py-2.5 font-bold text-slate-700">~{comparison.buildA.gameFps.cs2} FPS</td>
                    <td className="px-4 py-2.5 font-bold text-slate-700">~{comparison.buildB.gameFps.cs2} FPS</td>
                    <td className="px-4 py-2.5 font-semibold">
                      {comparison.fpsDiff.cs2.winner === "A" && (
                        <span className="text-blue-600 font-bold">A nhỉnh hơn +{comparison.fpsDiff.cs2.diff} FPS</span>
                      )}
                      {comparison.fpsDiff.cs2.winner === "B" && (
                        <span className="text-purple-600 font-bold">B nhỉnh hơn +{comparison.fpsDiff.cs2.diff} FPS</span>
                      )}
                      {comparison.fpsDiff.cs2.winner === "equal" && (
                        <span className="text-slate-400">Ngang nhau</span>
                      )}
                    </td>
                  </tr>

                  {/* Black Myth: Wukong */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-bold text-slate-800">Black Myth: Wukong</td>
                    <td className="px-4 py-2.5 font-bold text-slate-700">~{comparison.buildA.gameFps.wukong} FPS</td>
                    <td className="px-4 py-2.5 font-bold text-slate-700">~{comparison.buildB.gameFps.wukong} FPS</td>
                    <td className="px-4 py-2.5 font-semibold">
                      {comparison.fpsDiff.wukong.winner === "A" && (
                        <span className="text-blue-600 font-bold">A nhỉnh hơn +{comparison.fpsDiff.wukong.diff} FPS</span>
                      )}
                      {comparison.fpsDiff.wukong.winner === "B" && (
                        <span className="text-purple-600 font-bold">B nhỉnh hơn +{comparison.fpsDiff.wukong.diff} FPS</span>
                      )}
                      {comparison.fpsDiff.wukong.winner === "equal" && (
                        <span className="text-slate-400">Ngang nhau</span>
                      )}
                    </td>
                  </tr>

                  {/* Valorant */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-bold text-slate-800">Valorant</td>
                    <td className="px-4 py-2.5 font-bold text-slate-700">~{comparison.buildA.gameFps.valorant} FPS</td>
                    <td className="px-4 py-2.5 font-bold text-slate-700">~{comparison.buildB.gameFps.valorant} FPS</td>
                    <td className="px-4 py-2.5 font-semibold">
                      {comparison.fpsDiff.valorant.winner === "A" && (
                        <span className="text-blue-600 font-bold">A nhỉnh hơn +{comparison.fpsDiff.valorant.diff} FPS</span>
                      )}
                      {comparison.fpsDiff.valorant.winner === "B" && (
                        <span className="text-purple-600 font-bold">B nhỉnh hơn +{comparison.fpsDiff.valorant.diff} FPS</span>
                      )}
                      {comparison.fpsDiff.valorant.winner === "equal" && (
                        <span className="text-slate-400">Ngang nhau</span>
                      )}
                    </td>
                  </tr>

                  {/* Cyberpunk 2077 */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-bold text-slate-800">Cyberpunk 2077</td>
                    <td className="px-4 py-2.5 font-bold text-slate-700">~{comparison.buildA.gameFps.cyberpunk} FPS</td>
                    <td className="px-4 py-2.5 font-bold text-slate-700">~{comparison.buildB.gameFps.cyberpunk} FPS</td>
                    <td className="px-4 py-2.5 font-semibold">
                      {comparison.fpsDiff.cyberpunk.winner === "A" && (
                        <span className="text-blue-600 font-bold">A nhỉnh hơn +{comparison.fpsDiff.cyberpunk.diff} FPS</span>
                      )}
                      {comparison.fpsDiff.cyberpunk.winner === "B" && (
                        <span className="text-purple-600 font-bold">B nhỉnh hơn +{comparison.fpsDiff.cyberpunk.diff} FPS</span>
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

          {/* Detailed Component Selectors for Slot A & Slot B */}
          <div className="rounded-2xl border border-slate-200 p-5 space-y-4 bg-slate-50/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-500" /> Tùy chỉnh linh kiện từng món cho 2 cấu hình
              </span>
              <button
                onClick={() => setShowComponentDetail(!showComponentDetail)}
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
              >
                {showComponentDetail ? "Ẩn danh sách chọn" : "Hiện danh sách chọn"}
              </button>
            </div>

            {showComponentDetail && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Slot A Component Pickers */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-blue-700 block pb-1 border-b border-blue-200">
                    Danh sách linh kiện: {nameA}
                  </span>
                  {CATEGORY_ORDER.map((cat) => (
                    <div key={`a-${cat}`}>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        {CATEGORY_LABELS[cat]}
                      </label>
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
                <div className="space-y-3">
                  <span className="text-xs font-bold text-purple-700 block pb-1 border-b border-purple-200">
                    Danh sách linh kiện: {nameB}
                  </span>
                  {CATEGORY_ORDER.map((cat) => (
                    <div key={`b-${cat}`}>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        {CATEGORY_LABELS[cat]}
                      </label>
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
