"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CATEGORY_LABELS, CATEGORY_ORDER, BuildSelection, PcComponent } from "@/lib/types";
import { checkCompatibility, summarize, CompatibilityIssue } from "@/lib/compatibility";
import PubgCompatibility from "@/components/PubgCompatibility";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

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

export default function CompatibilityPage() {
  const [components, setComponents] = useState<PcComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState<BuildSelection>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("pc_components").select("*").order("name");
      setComponents((data as PcComponent[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const byCategory = useMemo(() => {
    const map: Record<string, PcComponent[]> = {};
    for (const cat of CATEGORY_ORDER) map[cat] = components.filter((c) => c.category === cat);
    return map;
  }, [components]);

  const issues = useMemo(() => {
    const raw = checkCompatibility(selection);
    // Ưu tiên hiển thị: Lỗi (error) trước -> Cảnh báo (warning) -> Ổn (ok)
    const levelOrder: Record<string, number> = { error: 0, warning: 1, ok: 2 };
    return [...raw].sort((a, b) => (levelOrder[a.level] ?? 1) - (levelOrder[b.level] ?? 1));
  }, [selection]);

  const summary = summarize(issues);
  const selectedCount = Object.keys(selection).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Kiểm tra tương thích linh kiện</h1>
        <p className="text-slate-500 mt-1">
          Chọn mỗi loại một linh kiện, hệ thống sẽ đối chiếu socket, loại RAM, kích thước,
          công suất... để báo xung đột trước khi bạn mua.
        </p>
      </div>

      {loading && <p className="text-slate-400 text-sm">Đang tải dữ liệu linh kiện...</p>}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORY_ORDER.map((cat) => (
              <div key={cat}>
                <label className="text-sm font-medium mb-1 block">
                  {CATEGORY_LABELS[cat]}
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
                  <option value="">-- Chưa chọn --</option>
                  {byCategory[cat]?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.brand} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 h-fit sticky top-24">
            <h2 className="font-semibold mb-3">Kết quả tương thích</h2>
            <div className="flex gap-3 text-sm mb-4">
              <span className="text-red-600 font-medium">{summary.errors} lỗi</span>
              <span className="text-amber-600 font-medium">
                {summary.warnings} cảnh báo
              </span>
              <span className="text-emerald-600 font-medium">{summary.oks} ổn</span>
            </div>
            <ul className="space-y-2">
              {issues.map((issue, i) => (
                <IssueRow key={i} issue={issue} />
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Phân tích hiệu năng & tương thích với game PUBG PC */}
      {!loading && <PubgCompatibility selection={selection} />}
    </div>
  );
}
