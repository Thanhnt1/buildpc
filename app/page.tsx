"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CATEGORY_LABELS, CATEGORY_ORDER, Category, PcComponent } from "@/lib/types";
import ComponentCard from "@/components/ComponentCard";
import ComponentModal from "@/components/ComponentModal";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal,
  X,
  Search,
} from "lucide-react";

const PAGE_SIZE_OPTIONS = [12, 24, 36, 48];

type SortOption = "default" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
type PriceRangeOption = "all" | "under_2m" | "2m_5m" | "5m_10m" | "10m_20m" | "above_20m";

export default function HomePage() {
  const [components, setComponents] = useState<PcComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PcComponent | null>(null);

  // Filters state
  const [category, setCategory] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<PriceRangeOption>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [socketFilter, setSocketFilter] = useState<string>("all");
  const [ramTypeFilter, setRamTypeFilter] = useState<string>("all");
  const [storageInterfaceFilter, setStorageInterfaceFilter] = useState<string>("all");
  const [coolerTypeFilter, setCoolerTypeFilter] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination state
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

  // Danh sách các hãng tương ứng với dữ liệu
  const availableBrands = useMemo(() => {
    const list = category === "all" ? components : components.filter((c) => c.category === category);
    const brandsCount = new Map<string, number>();
    list.forEach((c) => {
      if (c.brand) {
        brandsCount.set(c.brand, (brandsCount.get(c.brand) || 0) + 1);
      }
    });
    return Array.from(brandsCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([brand]) => brand);
  }, [components, category]);

  // Reset page về 1 khi đổi bất kỳ bộ lọc nào
  useEffect(() => {
    setCurrentPage(1);
  }, [
    category,
    search,
    selectedBrand,
    priceRange,
    sortBy,
    socketFilter,
    ramTypeFilter,
    storageInterfaceFilter,
    coolerTypeFilter,
    pageSize,
  ]);

  // Đếm số lượng bộ lọc đang được kích hoạt (khác mặc định)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (category !== "all") count++;
    if (selectedBrand !== "all") count++;
    if (priceRange !== "all") count++;
    if (sortBy !== "default") count++;
    if (socketFilter !== "all") count++;
    if (ramTypeFilter !== "all") count++;
    if (storageInterfaceFilter !== "all") count++;
    if (coolerTypeFilter !== "all") count++;
    if (search.trim()) count++;
    return count;
  }, [
    category,
    selectedBrand,
    priceRange,
    sortBy,
    socketFilter,
    ramTypeFilter,
    storageInterfaceFilter,
    coolerTypeFilter,
    search,
  ]);

  const handleResetFilters = () => {
    setCategory("all");
    setSearch("");
    setSelectedBrand("all");
    setPriceRange("all");
    setSortBy("default");
    setSocketFilter("all");
    setRamTypeFilter("all");
    setStorageInterfaceFilter("all");
    setCoolerTypeFilter("all");
  };

  // Logic lọc và sắp xếp sản phẩm
  const filtered = useMemo(() => {
    let result = components.filter((c) => {
      // 1. Loại linh kiện
      if (category !== "all" && c.category !== category) return false;

      // 2. Tìm kiếm tên / hãng
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.brand.toLowerCase().includes(q))
          return false;
      }

      // 3. Hãng sản xuất
      if (selectedBrand !== "all" && c.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      // 4. Khoảng giá
      const price = c.price_min ?? c.price_max ?? 0;
      if (priceRange === "under_2m" && price > 2000000) return false;
      if (priceRange === "2m_5m" && (price < 2000000 || price > 5000000)) return false;
      if (priceRange === "5m_10m" && (price < 5000000 || price > 10000000)) return false;
      if (priceRange === "10m_20m" && (price < 10000000 || price > 20000000)) return false;
      if (priceRange === "above_20m" && price < 20000000) return false;

      // 5. Lọc thông số Socket (cho CPU hoặc Mainboard)
      if (socketFilter !== "all" && (c.category === "cpu" || c.category === "mainboard")) {
        const socket = c.specs?.socket?.toUpperCase();
        if (socket !== socketFilter.toUpperCase()) return false;
      }

      // 6. Lọc chuẩn RAM (DDR4 / DDR5)
      if (ramTypeFilter !== "all" && (c.category === "ram" || c.category === "mainboard" || c.category === "cpu")) {
        const ramType = (c.specs?.ram_type || c.specs?.type || "").toUpperCase();
        if (!ramType.includes(ramTypeFilter.toUpperCase())) return false;
      }

      // 7. Lọc chuẩn giao tiếp Ổ cứng (NVMe / SATA)
      if (storageInterfaceFilter !== "all" && c.category === "storage") {
        const iface = (c.specs?.interface || "").toUpperCase();
        if (iface !== storageInterfaceFilter.toUpperCase()) return false;
      }

      // 8. Lọc loại tản nhiệt (air / aio)
      if (coolerTypeFilter !== "all" && c.category === "cooler") {
        const type = (c.specs?.type || "").toLowerCase();
        if (type !== coolerTypeFilter.toLowerCase()) return false;
      }

      return true;
    });

    // Sắp xếp
    if (sortBy === "price_asc") {
      result.sort((a, b) => (a.price_min ?? 0) - (b.price_min ?? 0));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => (b.price_min ?? 0) - (a.price_min ?? 0));
    } else if (sortBy === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name_desc") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [
    components,
    category,
    search,
    selectedBrand,
    priceRange,
    sortBy,
    socketFilter,
    ramTypeFilter,
    storageInterfaceFilter,
    coolerTypeFilter,
  ]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, currentPage, pageSize]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

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
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Danh sách linh kiện máy tính</h1>
          <p className="text-slate-500 mt-1">
            Tổng hợp 430+ linh kiện từ GearVN & Phong Vũ — thông số kỹ thuật chuẩn và giá tham khảo.
          </p>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-200 bg-rose-50/80 text-rose-700 hover:bg-rose-100 transition-colors w-fit"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Xóa bộ lọc ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Primary Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, dòng sản phẩm..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Selector */}
          <div className="sm:col-span-3">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as Category | "all");
                setSelectedBrand("all");
                setSocketFilter("all");
                setRamTypeFilter("all");
                setStorageInterfaceFilter("all");
                setCoolerTypeFilter("all");
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm bg-white font-medium"
            >
              <option value="all">Tất cả loại linh kiện</option>
              {CATEGORY_ORDER.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm bg-white"
            >
              <option value="default">Sắp xếp: Mặc định</option>
              <option value="price_asc">Giá: Thấp đến Cao ↑</option>
              <option value="price_desc">Giá: Cao đến Thấp ↓</option>
              <option value="name_asc">Tên: A - Z</option>
              <option value="name_desc">Tên: Z - A</option>
            </select>
          </div>

          {/* Advanced Filter Toggle Button */}
          <div className="sm:col-span-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`w-full h-full min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                showAdvancedFilters || activeFiltersCount > 0
                  ? "bg-brand text-white border-brand shadow-xs"
                  : "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Bộ lọc nâng cao</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-brand text-[10px] font-black flex items-center justify-center ml-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-slate-100">
          <button
            onClick={() => {
              setCategory("all");
              setSelectedBrand("all");
            }}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              category === "all"
                ? "bg-slate-900 text-white font-bold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất cả
          </button>
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setSelectedBrand("all");
              }}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                category === cat
                  ? "bg-brand text-white font-bold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Advanced Filters Drawer / Section */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-xl">
            {/* Price Range Filter */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Khoảng giá (VNĐ)
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as PriceRangeOption)}
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
              >
                <option value="all">Tất cả mức giá</option>
                <option value="under_2m">Dưới 2 triệu</option>
                <option value="2m_5m">2 triệu - 5 triệu</option>
                <option value="5m_10m">5 triệu - 10 triệu</option>
                <option value="10m_20m">10 triệu - 20 triệu</option>
                <option value="above_20m">Trên 20 triệu</option>
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Hãng sản xuất
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
              >
                <option value="all">Tất cả hãng ({availableBrands.length})</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Socket Filter (for CPU/Mainboard) */}
            {(category === "all" || category === "cpu" || category === "mainboard") && (
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Socket CPU / Main
                </label>
                <select
                  value={socketFilter}
                  onChange={(e) => setSocketFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                >
                  <option value="all">Tất cả Socket</option>
                  <option value="LGA1700">Intel LGA1700 (12-14th gen)</option>
                  <option value="LGA1851">Intel LGA1851 (Core Ultra)</option>
                  <option value="AM5">AMD AM5 (Ryzen 7000/9000)</option>
                  <option value="AM4">AMD AM4 (Ryzen 3000/5000)</option>
                </select>
              </div>
            )}

            {/* RAM Type Filter */}
            {(category === "all" || category === "ram" || category === "mainboard" || category === "cpu") && (
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Chuẩn RAM
                </label>
                <select
                  value={ramTypeFilter}
                  onChange={(e) => setRamTypeFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                >
                  <option value="all">Tất cả chuẩn RAM</option>
                  <option value="DDR4">DDR4</option>
                  <option value="DDR5">DDR5</option>
                </select>
              </div>
            )}

            {/* Storage Interface Filter */}
            {(category === "all" || category === "storage") && (
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Giao tiếp Ổ cứng
                </label>
                <select
                  value={storageInterfaceFilter}
                  onChange={(e) => setStorageInterfaceFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                >
                  <option value="all">Tất cả giao tiếp</option>
                  <option value="NVMe">M.2 NVMe PCIe</option>
                  <option value="SATA">SATA (2.5" / 3.5")</option>
                </select>
              </div>
            )}

            {/* Cooler Type Filter */}
            {(category === "all" || category === "cooler") && (
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Loại Tản nhiệt
                </label>
                <select
                  value={coolerTypeFilter}
                  onChange={(e) => setCoolerTypeFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                >
                  <option value="all">Tất cả loại tản</option>
                  <option value="air">Tản nhiệt khí (Air Cooler)</option>
                  <option value="aio">Tản nhiệt nước AIO (Liquid Cooler)</option>
                </select>
              </div>
            )}

            {/* Page Size in Advanced filter */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Số mục / trang
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} sản phẩm / trang
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {loading && <p className="text-slate-400 text-sm">Đang tải...</p>}
      {error && (
        <p className="text-red-500 text-sm">
          Không tải được dữ liệu: {error}. Kiểm tra đã chạy database.sql / seed.sql trên
          Supabase và biến môi trường NEXT_PUBLIC_SUPABASE_URL / ANON_KEY chưa.
        </p>
      )}
      {!loading && !error && totalItems === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-600 font-medium text-base mb-1">Không tìm thấy linh kiện phù hợp.</p>
          <p className="text-slate-400 text-xs mb-4">Hãy thử điều chỉnh lại từ khóa tìm kiếm hoặc các tiêu chí bộ lọc.</p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white shadow-xs hover:bg-brand-dark transition-colors"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}

      {!loading && !error && totalItems > 0 && (
        <>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
            <span>
              Tìm thấy <strong className="text-slate-800">{totalItems}</strong> linh kiện (Hiển thị{" "}
              <strong className="text-slate-800">
                {startItem}-{endItem}
              </strong>
              )
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
