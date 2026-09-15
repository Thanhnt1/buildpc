"use client";

import { useState } from "react";
import { PcComponent, BuildSelection } from "@/lib/types";
import { PRESET_BUILDS, PresetBuild, findComponentForPreset } from "@/lib/presets";
import { Sparkles, Gamepad2, Zap, Flame, Crown, Check, ArrowRight, Monitor } from "lucide-react";

interface BuildPresetsProps {
  components: PcComponent[];
  onApplyPreset: (selection: BuildSelection) => void;
}

export default function BuildPresets({ components, onApplyPreset }: BuildPresetsProps) {
  const [activeTab, setActiveTab] = useState<string>(PRESET_BUILDS[1].id); // Mặc định Gaming Quốc Dân
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const currentPreset = PRESET_BUILDS.find((p) => p.id === activeTab) || PRESET_BUILDS[0];

  const handleApply = (preset: PresetBuild) => {
    const newSelection: BuildSelection = {};

    if (components.length > 0) {
      newSelection.cpu = findComponentForPreset(components, "cpu", preset.matcher.cpu);
      newSelection.mainboard = findComponentForPreset(components, "mainboard", preset.matcher.mainboard);
      newSelection.ram = findComponentForPreset(components, "ram", preset.matcher.ram);
      newSelection.gpu = findComponentForPreset(components, "gpu", preset.matcher.gpu);
      newSelection.storage = findComponentForPreset(components, "storage", preset.matcher.storage);
      newSelection.psu = findComponentForPreset(components, "psu", preset.matcher.psu);
      newSelection.case = findComponentForPreset(components, "case", preset.matcher.case);
      newSelection.cooler = findComponentForPreset(components, "cooler", preset.matcher.cooler);
    }

    onApplyPreset(newSelection);
    setAppliedId(preset.id);
    setTimeout(() => setAppliedId(null), 2500);

    // Smooth scroll to top of selector
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "gamepad":
        return <Gamepad2 className="w-4 h-4 text-blue-500" />;
      case "zap":
        return <Zap className="w-4 h-4 text-emerald-500" />;
      case "flame":
        return <Flame className="w-4 h-4 text-purple-500" />;
      case "crown":
        return <Crown className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-brand" />;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-brand border border-indigo-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Bộ cấu hình mẫu sẵn theo ngân sách
            </h2>
            <p className="text-sm text-slate-500">
              Chọn cấu hình tối ưu sẵn kèm thông số FPS thực tế trong các tựa game hot.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        {PRESET_BUILDS.map((preset) => {
          const isSelected = preset.id === activeTab;
          return (
            <button
              key={preset.id}
              onClick={() => setActiveTab(preset.id)}
              className={`p-3 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? "border-brand bg-brand/5 shadow-sm ring-2 ring-brand/20"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1 rounded-lg bg-white shadow-xs border border-slate-100">
                  {getIcon(preset.iconName)}
                </span>
                <span className="text-[11px] font-extrabold text-amber-600">
                  {preset.budgetRange}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{preset.name}</h3>
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{preset.tagline}</p>
            </button>
          );
        })}
      </div>

      {/* Active Preset Detail & FPS Showcase */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-900">{currentPreset.name}</h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${currentPreset.badgeColor}`}
              >
                Ngân sách: {currentPreset.budgetRange}
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl">{currentPreset.description}</p>
          </div>

          <button
            onClick={() => handleApply(currentPreset)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shrink-0 ${
              appliedId === currentPreset.id
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-brand hover:bg-brand-dark text-white shadow-sm hover:shadow"
            }`}
          >
            {appliedId === currentPreset.id ? (
              <>
                <Check className="w-4 h-4" /> Đã nạp vào bộ kiểm tra!
              </>
            ) : (
              <>
                <span>Áp dụng cấu hình này</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Game FPS Benchmark Matrix */}
        <div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-indigo-500" /> Bảng hiệu năng FPS thực tế trong game
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {currentPreset.gameFps.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">{item.game}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                      {item.resolution}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mb-2">{item.settings}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-lg font-black text-indigo-600 leading-none">
                      {item.avgFps}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-0.5">FPS Avg</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    1%: ~{item.low1Percent}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
