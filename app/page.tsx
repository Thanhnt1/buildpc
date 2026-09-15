"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CATEGORY_LABELS, CATEGORY_ORDER, Category, PcComponent } from "@/lib/types";
import ComponentCard from "@/components/ComponentCard";
import ComponentModal from "@/components/ComponentModal";

export default function HomePage() {
  const [components, setComponents] = useState<PcComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PcComponent | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("pc_components")
        .select("*")
        .order("category")
        .order("brand");
      if (error) setError(error.message);
      else setComponents((data as PcComponent[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return components.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.brand.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [components, category, search]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Danh sách linh kiện máy tính</h1>
        <p className="text-slate-500 mt-1">
          Thông số và giá tham khảo — dữ liệu tĩnh, cập nhật định kỳ thủ công.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc hãng..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | "all")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">Tất cả loại linh kiện</option>
          {CATEGORY_ORDER.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-slate-400 text-sm">Đang tải...</p>}
      {error && (
        <p className="text-red-500 text-sm">
          Không tải được dữ liệu: {error}. Kiểm tra đã chạy database.sql / seed.sql trên
          Supabase và biến môi trường NEXT_PUBLIC_SUPABASE_URL / ANON_KEY chưa.
        </p>
      )}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-slate-400 text-sm">Không tìm thấy linh kiện phù hợp.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <ComponentCard key={c.id} component={c} onClick={setSelected} />
        ))}
      </div>

      <ComponentModal component={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
