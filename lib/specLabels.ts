import { Category } from "./types";

interface SpecField {
  key: string;
  label: string;
  format?: (v: any) => string;
}

const yesNo = (v: any) => (v ? "Có" : "Không");
const list = (v: any) => (Array.isArray(v) ? v.join(", ") : String(v));

export const SPEC_FIELDS: Record<Category, SpecField[]> = {
  cpu: [
    { key: "socket", label: "Socket" },
    { key: "cores", label: "Số nhân" },
    { key: "threads", label: "Số luồng" },
    { key: "tdp_w", label: "TDP", format: (v) => `${v}W` },
    { key: "ram_type", label: "Hỗ trợ RAM" },
    { key: "integrated_graphics", label: "Card đồ hoạ tích hợp", format: yesNo },
  ],
  mainboard: [
    { key: "socket", label: "Socket" },
    { key: "form_factor", label: "Kích thước (Form factor)" },
    { key: "ram_type", label: "Loại RAM" },
    { key: "max_ram_mhz", label: "Xung RAM tối đa", format: (v) => `${v}MHz` },
    { key: "ram_slots", label: "Số khe RAM" },
    { key: "m2_slots", label: "Số khe M.2" },
    { key: "sata_slots", label: "Số cổng SATA" },
  ],
  ram: [
    { key: "type", label: "Loại" },
    { key: "speed_mhz", label: "Xung nhịp", format: (v) => `${v}MHz` },
    { key: "modules", label: "Số thanh trong kit" },
    { key: "capacity_gb_per_module", label: "Dung lượng mỗi thanh", format: (v) => `${v}GB` },
  ],
  gpu: [
    { key: "length_mm", label: "Chiều dài", format: (v) => `${v}mm` },
    { key: "tdp_w", label: "Công suất tiêu thụ (TDP)", format: (v) => `${v}W` },
    { key: "power_connectors", label: "Đầu cấp nguồn" },
    { key: "recommended_psu_w", label: "Nguồn khuyến nghị tối thiểu", format: (v) => `${v}W` },
    { key: "slot_width", label: "Số khe PCIe chiếm chỗ" },
  ],
  psu: [
    { key: "wattage_w", label: "Công suất", format: (v) => `${v}W` },
    { key: "form_factor", label: "Kích thước (Form factor)" },
    { key: "efficiency", label: "Chuẩn hiệu suất" },
  ],
  case: [
    { key: "supported_form_factors", label: "Hỗ trợ Mainboard", format: list },
    { key: "max_gpu_length_mm", label: "VGA tối đa", format: (v) => `${v}mm` },
    { key: "max_cooler_height_mm", label: "Tản khí tối đa", format: (v) => `${v}mm` },
    { key: "supported_psu_form_factors", label: "Hỗ trợ Nguồn", format: list },
    { key: "supported_radiator_sizes_mm", label: "Hỗ trợ Radiator AIO", format: (v) => (v?.length ? list(v) + "mm" : "Không rõ") },
  ],
  cooler: [
    { key: "type", label: "Loại", format: (v) => (v === "air" ? "Tản khí" : "Tản nước AIO") },
    { key: "height_mm", label: "Chiều cao", format: (v) => (v ? `${v}mm` : "—") },
    { key: "radiator_size_mm", label: "Kích thước Radiator", format: (v) => (v ? `${v}mm` : "—") },
    { key: "socket_support", label: "Hỗ trợ Socket", format: list },
    { key: "tdp_rating_w", label: "TDP khuyến nghị tối đa", format: (v) => (v ? `${v}W` : "—") },
  ],
  storage: [
    { key: "interface", label: "Chuẩn kết nối" },
    { key: "form_factor", label: "Kích thước" },
    { key: "capacity_gb", label: "Dung lượng", format: (v) => (v >= 1000 ? `${v / 1000}TB` : `${v}GB`) },
  ],
};

export function specRows(category: Category, specs: Record<string, any>) {
  return SPEC_FIELDS[category]
    .filter((f) => specs[f.key] !== undefined && specs[f.key] !== null)
    .map((f) => ({
      label: f.label,
      value: f.format ? f.format(specs[f.key]) : String(specs[f.key]),
    }));
}
