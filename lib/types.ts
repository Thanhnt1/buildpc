export type Category =
  | "cpu"
  | "mainboard"
  | "ram"
  | "gpu"
  | "psu"
  | "case"
  | "cooler"
  | "storage";

export const CATEGORY_LABELS: Record<Category, string> = {
  cpu: "CPU",
  mainboard: "Mainboard",
  ram: "RAM",
  gpu: "VGA (Card đồ hoạ)",
  psu: "Nguồn (PSU)",
  case: "Case (Vỏ máy)",
  cooler: "Tản nhiệt",
  storage: "Ổ cứng",
};

export const CATEGORY_ORDER: Category[] = [
  "cpu",
  "mainboard",
  "ram",
  "gpu",
  "storage",
  "psu",
  "case",
  "cooler",
];

// Thông số riêng theo từng loại linh kiện. Lưu trong cột `specs` (jsonb).
export interface CpuSpecs {
  socket: string; // "LGA1700" | "AM5" | "AM4" ...
  tdp_w: number;
  // Một số CPU (vd Intel 12-14th gen) hỗ trợ cả 2 loại RAM tuỳ theo Mainboard đi kèm.
  ram_type: "DDR4" | "DDR5" | "DDR4/DDR5";
  cores?: number;
  threads?: number;
  integrated_graphics?: boolean;
}

export interface MainboardSpecs {
  socket: string;
  form_factor: "ATX" | "mATX" | "ITX";
  ram_type: "DDR4" | "DDR5";
  max_ram_mhz?: number;
  ram_slots?: number;
  m2_slots?: number;
  sata_slots?: number;
  psu_connector?: "ATX24"; // hầu hết đều dùng đầu ATX 24-pin chuẩn
}

export interface RamSpecs {
  type: "DDR4" | "DDR5";
  speed_mhz: number;
  modules: number; // số thanh trong bộ kit
  capacity_gb_per_module: number;
}

export interface GpuSpecs {
  length_mm: number;
  tdp_w: number;
  power_connectors?: string; // "8-pin" | "8+8-pin" | "16-pin (12VHPWR)" | "none"
  recommended_psu_w: number;
  slot_width?: number; // số khe PCIe chiếm chỗ (2-3 slot)
}

export interface PsuSpecs {
  wattage_w: number;
  form_factor: "ATX" | "SFX";
  efficiency?: string; // "80+ Bronze" | "80+ Gold" ...
}

export interface CaseSpecs {
  supported_form_factors: ("ATX" | "mATX" | "ITX")[];
  max_gpu_length_mm: number;
  max_cooler_height_mm: number;
  supported_psu_form_factors: ("ATX" | "SFX")[];
  supported_radiator_sizes_mm?: number[]; // vd [240, 280, 360]
}

export interface CoolerSpecs {
  type: "air" | "aio";
  height_mm?: number; // với tản khí
  radiator_size_mm?: number; // với tản nước AIO
  socket_support: string[]; // ["LGA1700","AM5",...]
  tdp_rating_w?: number; // công suất toả nhiệt tối đa khuyến nghị
}

export interface StorageSpecs {
  interface: "SATA" | "NVMe";
  form_factor: "2.5-inch" | "3.5-inch" | "M.2-2280";
  capacity_gb: number;
}

export type Specs =
  | CpuSpecs
  | MainboardSpecs
  | RamSpecs
  | GpuSpecs
  | PsuSpecs
  | CaseSpecs
  | CoolerSpecs
  | StorageSpecs;

export interface PcComponent {
  id: string;
  category: Category;
  brand: string;
  name: string;
  price_min: number | null;
  price_max: number | null;
  price_updated_at: string | null;
  specs: Record<string, any>;
  image_url: string | null;
}

// Lựa chọn linh kiện của người dùng trên trang compatibility checker
export type BuildSelection = Partial<Record<Category, PcComponent>>;
