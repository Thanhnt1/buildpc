"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { PcComponent, Category, CATEGORY_LABELS } from "@/lib/types";
import { Search, ChevronDown, X, Check, Tag } from "lucide-react";

interface SearchableSelectProps {
  category: Category;
  components: PcComponent[];
  selectedComponent?: PcComponent;
  onSelect: (component?: PcComponent) => void;
}

export default function SearchableSelect({
  category,
  components,
  selectedComponent,
  onSelect,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tự động focus vào ô tìm kiếm khi mở popup
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Lọc sản phẩm theo từ khóa
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return components;
    const q = searchQuery.toLowerCase();
    return components.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q)
    );
  }, [components, searchQuery]);

  const handleSelect = (comp?: PcComponent) => {
    onSelect(comp);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(undefined);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Nút bấm hiển thị sản phẩm đã chọn hoặc placeholder */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs transition-all ${
          isOpen
            ? "border-brand ring-2 ring-brand/20 bg-white"
            : selectedComponent
            ? "border-slate-300 bg-white hover:border-slate-400"
            : "border-slate-200 bg-white/80 hover:bg-white hover:border-slate-300"
        }`}
      >
        <div className="flex-1 min-w-0">
          {selectedComponent ? (
            <div className="flex items-baseline gap-1.5 truncate">
              <span className="font-extrabold text-indigo-700 shrink-0">
                [{selectedComponent.brand}]
              </span>
              <span className="font-semibold text-slate-800 truncate" title={selectedComponent.name}>
                {selectedComponent.name}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 font-normal">
              -- Nhập hoặc chọn {CATEGORY_LABELS[category]} --
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {selectedComponent && (
            <span
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Bỏ chọn"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-brand" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Popup tìm kiếm & chọn linh kiện */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Ô Input Search */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Tìm ${CATEGORY_LABELS[category]} theo tên, hãng...`}
                className="w-full rounded-xl border border-slate-300 pl-8 pr-7 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Danh sách kết quả */}
          <div className="max-h-60 overflow-y-auto p-1.5 divide-y divide-slate-50 text-xs">
            {/* Tùy chọn Bỏ chọn */}
            <button
              type="button"
              onClick={() => handleSelect(undefined)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors text-left font-medium"
            >
              <span>-- Không chọn {CATEGORY_LABELS[category]} --</span>
              {!selectedComponent && <Check className="w-3.5 h-3.5 text-brand" />}
            </button>

            {filteredList.map((c) => {
              const isSelected = selectedComponent?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-brand/10 text-brand font-bold"
                      : "hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-indigo-600 shrink-0">
                        [{c.brand}]
                      </span>
                      <span className="truncate">{c.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-slate-900 text-[11px] whitespace-nowrap">
                      {c.price_min
                        ? `${c.price_min.toLocaleString("vi-VN")} đ`
                        : "Chưa có giá"}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-brand shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}

            {filteredList.length === 0 && (
              <div className="py-6 text-center text-slate-400 text-xs">
                Không tìm thấy linh kiện nào khớp với &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
