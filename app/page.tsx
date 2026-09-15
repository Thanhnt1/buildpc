"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CATEGORY_LABELS, CATEGORY_ORDER, Category, PcComponent } from "@/lib/types";
import ComponentCard from "@/components/ComponentCard";
import ComponentModal from "@/components/ComponentModal";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const PAGE_SIZE_OPTIONS = [12, 24, 36, 48];

export default function HomePage() {
  const [components, setComponents] = useState<PcComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PcComponent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

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

  // Reset page về 1 khi đổi bộ lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [category, search, pageSize]);

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

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Lấy danh sách linh kiện của trang hiện tại
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, currentPage, pageSize]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Tạo danh sách số trang hiển thị thông minh (có dấu ...)
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
        >
          <option value="all">Tất cả loại linh kiện</option>
          {CATEGORY_ORDER.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
          title="Số lượng mỗi trang"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} linh kiện / trang
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
      {!loading && !error && totalItems === 0 && (
        <p className="text-slate-400 text-sm">Không tìm thấy linh kiện phù hợp.</p>
      )}

      {!loading && !error && totalItems > 0 && (
        <>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
            <span>
              Hiển thị <strong className="text-slate-800">{startItem}-{endItem}</strong> trên tổng số <strong className="text-slate-800">{totalItems}</strong> linh kiện
            </span>
            <span>
              Trang <strong className="text-slate-800">{currentPage}</strong> / {totalPages}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {paginatedItems.map((c) => (
              <ComponentCard key={c.id} component={c} onClick={setSelected} />
            ))}
          </div>

          {/* Thanh phân trang Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Hiển thị {startItem} - {endItem} trong {totalItems} sản phẩm
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Trang đầu"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 mx-1">
                  {pageNumbers.map((p, idx) =>
                    p === "..." ? (
                      <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400 text-xs">
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p as number)}
                        className={`min-w-[34px] h-[34px] px-2.5 rounded-lg text-xs font-medium transition-colors ${
                          currentPage === p
                            ? "bg-brand text-white font-bold shadow-sm"
                            : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Trang sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Trang cuối"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ComponentModal component={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
