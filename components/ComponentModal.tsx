"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { CATEGORY_LABELS, PcComponent } from "@/lib/types";
import { specRows } from "@/lib/specLabels";
import ComponentImage from "./ComponentImage";
import PriceTag from "./PriceTag";

export default function ComponentModal({
  component,
  onClose,
}: {
  component: PcComponent | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!component) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [component, onClose]);

  if (!component) return null;

  const rows = specRows(component.category, component.specs);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <ComponentImage
            category={component.category}
            imageUrl={component.image_url}
            alt={component.name}
            className="w-full h-56"
            iconClassName="w-16 h-16"
          />
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 hover:bg-white shadow"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="absolute top-3 left-3 text-xs font-medium bg-white/90 rounded-full px-2.5 py-1">
            {CATEGORY_LABELS[component.category]}
          </span>
        </div>

        <div className="p-5">
          <div className="text-xs uppercase tracking-wide text-slate-400">
            {component.brand}
          </div>
          <h2 className="text-lg font-bold mb-2">{component.name}</h2>

          <PriceTag
            min={component.price_min}
            max={component.price_max}
            updatedAt={component.price_updated_at}
          />

          <table className="w-full mt-4 text-sm">
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-slate-100">
                  <td className="py-2 pr-3 text-slate-500 whitespace-nowrap">{row.label}</td>
                  <td className="py-2 font-medium text-right">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
