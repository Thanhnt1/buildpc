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
import SearchableSelect from "@/components/SearchableSelect";
import { CheckCircle2, AlertTriangle, XCircle, RotateCcw, Wrench } from "lucide-react";

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
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Chọn mỗi loại một linh kiện, hệ thống sẽ đối chiếu socket, loại RAM, kích thước,
            công suất... để báo xung đột trước khi bạn mua.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {selectedCount > 0 && (
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 whitespace-nowrap transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Xóa chọn</span>
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

          {/* Bộ chọn linh kiện & Kết quả tương thích (Được bọc trong Card Container đồng bộ) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Tùy chọn cấu hình & Kiểm tra tương thích
                  </h2>
                  <p className="text-sm text-slate-500">
                    Chọn linh kiện theo từng danh mục để đối chiếu thông số phần cứng theo thời gian thực.
                  </p>
                </div>
              </div>

              {selectedCount > 0 && (
                <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600 font-medium">
                  <span>Đã chọn: <strong className="text-indigo-600 font-bold">{selectedCount}/8</strong> danh mục</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CATEGORY_ORDER.map((cat) => (
                  <div
                    key={cat}
                    className="bg-slate-50/70 hover:bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 shadow-xs transition-colors"
                  >
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
                    <SearchableSelect
                      category={cat}
                      components={byCategory[cat] || []}
                      selectedComponent={selection[cat]}
                      onSelect={(comp) => {
                        setSelection((prev) => {
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

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 h-fit lg:sticky lg:top-24 shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/80">
                  <h3 className="font-bold text-slate-900 text-sm">Kết quả tương thích</h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedCount}/8 linh kiện
                  </span>
                </div>

                <div className="flex gap-2 text-xs mb-4">
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

                <ul className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {issues.map((issue, i) => (
                    <IssueRow key={i} issue={issue} />
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Phân tích hiệu năng & tương thích với game PUBG PC */}
          <PubgCompatibility selection={selection} />

          {/* Phân rã công suất điện & Ước tính tiền điện */}
          <PowerCalculator selection={selection} />
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
