"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CATEGORY_LABELS, CATEGORY_ORDER, BuildSelection, PcComponent } from "@/lib/types";
import { checkCompatibility, summarize, CompatibilityIssue } from "@/lib/compatibility";
import PubgCompatibility from "@/components/PubgCompatibility";
import PowerCalculator from "@/components/PowerCalculator";
import BuildPresets from "@/components/BuildPresets";
import ShareBuildButton from "@/components/ShareBuildButton";
import { CheckCircle2, AlertTriangle, XCircle, RotateCcw } from "lucide-react";

function IssueRow({ issue }: { issue: CompatibilityIssue }) {
  const icon =
    issue.level === "error" ? (
      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
    ) : issue.level === "warning" ? (
      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
    ) : (
      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
    );
  return (
    <li className="flex items-start gap-2 text-sm">
      {icon}
      <span
        className={
          issue.level === "error"
            ? "text-red-700"
            : issue.level === "warning"
            ? "text-amber-700"
            : "text-emerald-700"
        }
      >
        {issue.message}
      </span>
    </li>
  );
}

function CompatibilityContent() {
  const searchParams = useSearchParams();
  const [components, setComponents] = useState<PcComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState<BuildSelection>({});
  const [initializedFromUrl, setInitializedFromUrl] = useState(false);

  // Tải danh sách linh kiện từ Supabase
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("pc_components").select("*").order("name");
      const list = (data as PcComponent[]) ?? [];
      setComponents(list);
      setLoading(false);
    })();
  }, []);

  // Khôi phục lựa chọn từ URL params nếu có
  useEffect(() => {
    if (!loading && components.length > 0 && !initializedFromUrl) {
      const initialSelection: BuildSelection = {};
      let hasParam = false;

      CATEGORY_ORDER.forEach((cat) => {
        const id = searchParams.get(cat);
        if (id) {
          const comp = components.find((c) => c.id === id && c.category === cat);
          if (comp) {
            initialSelection[cat] = comp;
            hasParam = true;
          }
        }
      });

      if (hasParam) {
        setSelection(initialSelection);
      }
      setInitializedFromUrl(true);
    }
  }, [loading, components, searchParams, initializedFromUrl]);

  // Cập nhật URLSearchParams theo thời gian thực khi selection thay đổi
  useEffect(() => {
    if (initializedFromUrl && typeof window !== "undefined") {
      const params = new URLSearchParams();
      CATEGORY_ORDER.forEach((cat) => {
        if (selection[cat]?.id) {
          params.set(cat, selection[cat]!.id);
        }
      });
      const query = params.toString();
      const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
  }, [selection, initializedFromUrl]);

  const byCategory = useMemo(() => {
    const map: Record<string, PcComponent[]> = {};
    for (const cat of CATEGORY_ORDER) map[cat] = components.filter((c) => c.category === cat);
    return map;
  }, [components]);

  const issues = useMemo(() => {
    const raw = checkCompatibility(selection);
    const levelOrder: Record<string, number> = { error: 0, warning: 1, ok: 2 };
    return [...raw].sort((a, b) => (levelOrder[a.level] ?? 1) - (levelOrder[b.level] ?? 1));
  }, [selection]);

  const summary = summarize(issues);
  const selectedCount = Object.keys(selection).length;

  const handleReset = () => {
    setSelection({});
  };

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kiểm tra tương thích linh kiện</h1>
          <p className="text-slate-500 mt-1">
            Chọn mỗi loại một linh kiện, hệ thống sẽ đối chiếu socket, loại RAM, kích thước,
            công suất... để báo xung đột trước khi bạn mua.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedCount > 0 && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Xóa chọn
            </button>
          )}
          <ShareBuildButton selection={selection} />
        </div>
      </div>

      {loading && <p className="text-slate-400 text-sm">Đang tải dữ liệu linh kiện...</p>}

      {!loading && (
        <>
          {/* Bộ cấu hình mẫu sẵn theo ngân sách */}
          <BuildPresets components={components} onApplyPreset={setSelection} />

          {/* Bộ chọn linh kiện & Kết quả tương thích */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CATEGORY_ORDER.map((cat) => (
                <div key={cat} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      {CATEGORY_LABELS[cat]}
                    </label>
                    {selection[cat] && (
                      <span className="text-[11px] font-bold text-indigo-600">
                        {selection[cat]?.price_min
                          ? `${selection[cat]?.price_min?.toLocaleString("vi-VN")} đ`
                          : "Chưa có giá"}
                      </span>
                    )}
                  </div>
                  <select
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand/40"
                    value={selection[cat]?.id ?? ""}
                    onChange={(e) => {
                      const comp = byCategory[cat].find((c) => c.id === e.target.value);
                      setSelection((prev) => {
                        const next = { ...prev };
                        if (comp) next[cat] = comp;
                        else delete next[cat];
                        return next;
                      });
                    }}
                  >
                    <option value="">-- Chưa chọn {CATEGORY_LABELS[cat]} --</option>
                    {byCategory[cat]?.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.brand}] {c.name} {c.price_min ? `(${c.price_min.toLocaleString("vi-VN")} đ)` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 h-fit sticky top-24 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 text-sm">Kết quả tương thích</h2>
                <span className="text-xs text-slate-500 font-medium">
                  {selectedCount}/8 linh kiện
                </span>
              </div>

              <div className="flex gap-3 text-xs mb-4">
                <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                  {summary.errors} lỗi
                </span>
                <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                  {summary.warnings} cảnh báo
                </span>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {summary.oks} ổn
                </span>
              </div>

              <ul className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {issues.map((issue, i) => (
                  <IssueRow key={i} issue={issue} />
                ))}
              </ul>
            </div>
          </div>

          {/* Phân rã công suất điện & Ước tính tiền điện */}
          <PowerCalculator selection={selection} />

          {/* Phân tích hiệu năng & tương thích với game PUBG PC */}
          <PubgCompatibility selection={selection} />
        </>
      )}
    </div>
  );
}

export default function CompatibilityPage() {
  return (
    <Suspense fallback={<p className="text-slate-400 text-sm">Đang tải...</p>}>
      <CompatibilityContent />
    </Suspense>
  );
}
