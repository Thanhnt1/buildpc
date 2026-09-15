import { PcComponent } from "@/lib/types";
import PriceTag from "./PriceTag";
import ComponentImage from "./ComponentImage";

function specLine(component: PcComponent): string {
  const s = component.specs;
  switch (component.category) {
    case "cpu":
      return `Socket ${s.socket} · TDP ${s.tdp_w}W · RAM ${s.ram_type} · ${s.cores}C/${s.threads}T`;
    case "mainboard":
      return `Socket ${s.socket} · ${s.form_factor} · RAM ${s.ram_type} tối đa ${s.max_ram_mhz}MHz · ${s.m2_slots} khe M.2`;
    case "ram":
      return `${s.type} · ${s.speed_mhz}MHz · ${s.modules}x${s.capacity_gb_per_module}GB`;
    case "gpu":
      return `Dài ${s.length_mm}mm · TDP ${s.tdp_w}W · Nguồn khuyến nghị ${s.recommended_psu_w}W`;
    case "psu":
      return `${s.wattage_w}W · ${s.form_factor} · ${s.efficiency ?? ""}`;
    case "case":
      return `Hỗ trợ main: ${s.supported_form_factors?.join(", ")} · GPU tối đa ${s.max_gpu_length_mm}mm`;
    case "cooler":
      return s.type === "air"
        ? `Tản khí · cao ${s.height_mm}mm · hỗ trợ ${s.socket_support?.join(", ")}`
        : `Tản nước AIO ${s.radiator_size_mm}mm · hỗ trợ ${s.socket_support?.join(", ")}`;
    case "storage":
      return `${s.interface} · ${s.form_factor} · ${s.capacity_gb}GB`;
    default:
      return "";
  }
}

export default function ComponentCard({
  component,
  onClick,
}: {
  component: PcComponent;
  onClick?: (component: PcComponent) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(component)}
      className="text-left rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col hover:shadow-md hover:border-brand/40 transition-all"
    >
      <ComponentImage
        category={component.category}
        imageUrl={component.image_url}
        alt={component.name}
        className="w-full h-36"
      />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-400">
            {component.brand}
          </div>
          <div className="font-semibold leading-snug">{component.name}</div>
        </div>
        <p className="text-sm text-slate-500">{specLine(component)}</p>
        <div className="mt-auto pt-2">
          <PriceTag
            min={component.price_min}
            max={component.price_max}
            updatedAt={component.price_updated_at}
          />
        </div>
      </div>
    </button>
  );
}
