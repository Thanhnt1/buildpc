import { PcComponent, Category } from "./types";

export interface ComponentMatcherCriteria {
  keywords?: string[];
  specs?: Record<string, any>;
}

export interface PresetBuild {
  id: string;
  name: string;
  tagline: string;
  budgetRange: string;
  badgeColor: string;
  iconName: "gamepad" | "zap" | "flame" | "crown";
  description: string;
  matcher: Record<Category, ComponentMatcherCriteria>;
  gameFps: {
    game: string;
    resolution: string;
    settings: string;
    avgFps: number;
    low1Percent: number;
    rating: "Smooth" | "Ultra Smooth" | "Esport Pro" | "Cinematic Max";
  }[];
}

export const PRESET_BUILDS: PresetBuild[] = [
  {
    id: "budget-esport-12m",
    name: "Cấu hình Esport Cơ Bản",
    tagline: "Chiến mượt mà mọi game Online & Esport 1080p",
    budgetRange: "~10 - 13 Triệu",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    iconName: "gamepad",
    description: "Bộ máy tối ưu chi phí với Core i3-12100F và RTX 3050 6GB/8GB, RAM DDR4 3200MHz, thích hợp cho học tập, làm việc và chiến game phổ thông.",
    matcher: {
      cpu: { keywords: ["12100F"] },
      mainboard: { keywords: ["H610M"], specs: { ram_type: "DDR4" } },
      ram: { keywords: ["DDR4", "3200"], specs: { type: "DDR4" } },
      gpu: { keywords: ["3050"] },
      storage: { keywords: ["500GB"], specs: { interface: "NVMe" } },
      psu: { keywords: ["550W"] },
      case: { keywords: ["MYX"] },
      cooler: { keywords: ["AG400"], specs: { type: "air" } },
    },
    gameFps: [
      { game: "PUBG PC", resolution: "1080p", settings: "Very Low", avgFps: 75, low1Percent: 55, rating: "Smooth" },
      { game: "CS2", resolution: "1080p", settings: "Medium", avgFps: 160, low1Percent: 110, rating: "Ultra Smooth" },
      { game: "Valorant", resolution: "1080p", settings: "High", avgFps: 220, low1Percent: 160, rating: "Esport Pro" },
      { game: "Black Myth: Wukong", resolution: "1080p", settings: "Low (FSR)", avgFps: 48, low1Percent: 36, rating: "Smooth" },
      { game: "GTA V / FiveM", resolution: "1080p", settings: "High", avgFps: 85, low1Percent: 65, rating: "Smooth" },
    ],
  },
  {
    id: "gaming-mainstream-20m",
    name: "Cấu hình Gaming Quốc Dân",
    tagline: "Chuẩn màn hình 144Hz - 165Hz cho game thủ tryhard",
    budgetRange: "~18 - 23 Triệu",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    iconName: "zap",
    description: "Cấu hình quốc dân: Intel Core i5-13400F đi kèm Mainboard B760M DDR4, kit RAM 16GB DDR4 3200MHz và RTX 4060 8GB, cân mượt mọi game AAA và Esport 1080p.",
    matcher: {
      cpu: { keywords: ["13400F"] },
      mainboard: { keywords: ["B760M"], specs: { ram_type: "DDR4" } },
      ram: { keywords: ["16GB", "DDR4"], specs: { type: "DDR4" } },
      gpu: { keywords: ["4060"] },
      storage: { keywords: ["500GB", "NVMe"] },
      psu: { keywords: ["650W"] },
      case: { keywords: ["Gaming X"] },
      cooler: { keywords: ["AK400"], specs: { type: "air" } },
    },
    gameFps: [
      { game: "PUBG PC", resolution: "1080p", settings: "Competitive", avgFps: 145, low1Percent: 105, rating: "Esport Pro" },
      { game: "CS2", resolution: "1080p", settings: "High", avgFps: 240, low1Percent: 175, rating: "Esport Pro" },
      { game: "Valorant", resolution: "1080p", settings: "Ultra", avgFps: 350, low1Percent: 240, rating: "Esport Pro" },
      { game: "Black Myth: Wukong", resolution: "1080p", settings: "High (DLSS)", avgFps: 72, low1Percent: 58, rating: "Smooth" },
      { game: "Cyberpunk 2077", resolution: "1080p", settings: "Ultra (DLSS)", avgFps: 82, low1Percent: 64, rating: "Smooth" },
    ],
  },
  {
    id: "pro-streamer-35m",
    name: "Cấu hình 2K Pro & Streamer",
    tagline: "Chiến game 2K 144Hz + Livestream / Edit Video 4K",
    budgetRange: "~32 - 40 Triệu",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    iconName: "flame",
    description: "Bộ máy hiệu năng cao trang bị Ryzen 7 7800X3D kết hợp Mainboard B650 ATX, 32GB RAM DDR5 6000MHz, Card RTX 4070 SUPER / 5070 12GB và Vỏ Case Mid-Tower hỗ trợ tản nước AIO 360mm.",
    matcher: {
      cpu: { keywords: ["7800X3D"] },
      mainboard: { keywords: ["B650"], specs: { socket: "AM5", form_factor: "ATX" } },
      ram: { keywords: ["32GB", "6000"], specs: { type: "DDR5" } },
      gpu: { keywords: ["4070"] },
      storage: { keywords: ["1TB", "NVMe"] },
      psu: { keywords: ["750W"] },
      case: { keywords: ["4000D"] },
      cooler: { keywords: ["360"], specs: { type: "aio" } },
    },
    gameFps: [
      { game: "PUBG PC", resolution: "2K 1440p", settings: "Competitive", avgFps: 220, low1Percent: 165, rating: "Esport Pro" },
      { game: "Black Myth: Wukong", resolution: "2K 1440p", settings: "Very High (DLSS)", avgFps: 90, low1Percent: 74, rating: "Ultra Smooth" },
      { game: "Cyberpunk 2077", resolution: "2K 1440p", settings: "Ray Tracing Ultra", avgFps: 88, low1Percent: 70, rating: "Ultra Smooth" },
      { game: "CS2", resolution: "2K 1440p", settings: "High", avgFps: 320, low1Percent: 230, rating: "Esport Pro" },
      { game: "GTA V / FiveM", resolution: "2K 1440p", settings: "Ultra Max", avgFps: 140, low1Percent: 110, rating: "Esport Pro" },
    ],
  },
  {
    id: "flagship-ultimate-70m",
    name: "Cấu hình Flagship 4K Vô Địch",
    tagline: "Đỉnh cao công nghệ, không giới hạn sức mạnh 4K / VR",
    budgetRange: "~65 - 90+ Triệu",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    iconName: "crown",
    description: "Cấu hình tối thượng với CPU Vua Game AMD Ryzen 7 9800X3D, Mainboard X870E, 64GB RAM DDR5 6000MHz, Card khủng RTX 5080/5090, nguồn 1000W và tản AIO 360mm.",
    matcher: {
      cpu: { keywords: ["9800X3D"] },
      mainboard: { keywords: ["X870"], specs: { socket: "AM5", form_factor: "ATX" } },
      ram: { keywords: ["64GB", "6000"], specs: { type: "DDR5" } },
      gpu: { keywords: ["5080"] },
      storage: { keywords: ["2TB", "NVMe"] },
      psu: { keywords: ["1000W"] },
      case: { keywords: ["O11D Evo"] },
      cooler: { keywords: ["Ryujin", "360"], specs: { type: "aio" } },
    },
    gameFps: [
      { game: "PUBG PC", resolution: "4K 2160p", settings: "Ultra Settings", avgFps: 210, low1Percent: 160, rating: "Cinematic Max" },
      { game: "Black Myth: Wukong", resolution: "4K 2160p", settings: "Cinematic Ray Tracing", avgFps: 85, low1Percent: 72, rating: "Cinematic Max" },
      { game: "Cyberpunk 2077", resolution: "4K 2160p", settings: "Path Tracing Overdrive", avgFps: 95, low1Percent: 78, rating: "Cinematic Max" },
      { game: "CS2", resolution: "4K 2160p", settings: "Max Ultra", avgFps: 380, low1Percent: 280, rating: "Esport Pro" },
      { game: "Flight Simulator 2024", resolution: "4K 2160p", settings: "Ultra Photorealism", avgFps: 75, low1Percent: 62, rating: "Cinematic Max" },
    ],
  },
];

export function findComponentForPreset(
  components: PcComponent[],
  category: Category,
  criteria: ComponentMatcherCriteria
): PcComponent | undefined {
  const list = components.filter((c) => c.category === category);
  if (list.length === 0) return undefined;

  // Tìm sản phẩm khớp cả keywords và specs
  const matched = list.find((c) => {
    const nameUpper = (c.name + " " + c.brand).toUpperCase();

    if (criteria.keywords && criteria.keywords.length > 0) {
      for (const kw of criteria.keywords) {
        if (!nameUpper.includes(kw.toUpperCase())) return false;
      }
    }

    if (criteria.specs && Object.keys(criteria.specs).length > 0) {
      for (const [key, val] of Object.entries(criteria.specs)) {
        if (c.specs && c.specs[key] !== val) return false;
      }
    }

    return true;
  });

  if (matched) return matched;

  // Fallback 1: Khớp theo specs nếu không khớp toàn bộ keywords
  if (criteria.specs && Object.keys(criteria.specs).length > 0) {
    const specMatched = list.find((c) => {
      for (const [key, val] of Object.entries(criteria.specs!)) {
        if (c.specs && c.specs[key] !== val) return false;
      }
      return true;
    });
    if (specMatched) return specMatched;
  }

  // Fallback 2: Khớp keyword đầu tiên
  if (criteria.keywords && criteria.keywords.length > 0) {
    const kw0 = criteria.keywords[0].toUpperCase();
    const kwMatched = list.find((c) => (c.name + " " + c.brand).toUpperCase().includes(kw0));
    if (kwMatched) return kwMatched;
  }

  return list[0];
}
