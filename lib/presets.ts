import { PcComponent, Category } from "./types";

export interface PresetBuild {
  id: string;
  name: string;
  tagline: string;
  budgetRange: string;
  badgeColor: string;
  iconName: "gamepad" | "zap" | "flame" | "crown";
  description: string;
  matcher: {
    cpu: string;
    mainboard: string;
    ram: string;
    gpu: string;
    storage: string;
    psu: string;
    case: string;
    cooler: string;
  };
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
    description: "Bộ máy tối ưu chi phí với Core i3-12100F/14100F và GTX 1650/RTX 3050, thích hợp cho học tập, làm việc và chiến game phổ thông.",
    matcher: {
      cpu: "12100F",
      mainboard: "H610M",
      ram: "16GB",
      gpu: "3050",
      storage: "500GB",
      psu: "550W",
      case: "MYX",
      cooler: "AG400",
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
    description: "Cấu hình được ưa chuộng nhất: Intel Core i5-12400F/13400F hoặc Ryzen 5 7500F đi kèm RTX 4060 8GB, cân mượt mọi game AAA và Esport ở 1080p.",
    matcher: {
      cpu: "13400F",
      mainboard: "B760M",
      ram: "16GB",
      gpu: "4060",
      storage: "500GB",
      psu: "650W",
      case: "Gaming X",
      cooler: "AK400",
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
    description: "Bộ máy hiệu năng cao trang bị Core i5-14600K hoặc Ryzen 7 7800X3D kết hợp RTX 4070 SUPER / 5070 12GB và 32GB RAM DDR5, sẵn sàng cho màn hình 2K.",
    matcher: {
      cpu: "7800X3D",
      mainboard: "B650",
      ram: "32GB",
      gpu: "4070",
      storage: "1TB",
      psu: "750W",
      case: "D300",
      cooler: "360",
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
    description: "Cấu hình tối thượng với CPU Vua Game AMD Ryzen 7 9800X3D / i9-14900K, Card khủng RTX 4080 Super / RTX 5090 và tản nhiệt nước AIO cao cấp.",
    matcher: {
      cpu: "9800X3D",
      mainboard: "X870",
      ram: "64GB",
      gpu: "5080",
      storage: "2TB",
      psu: "1000W",
      case: "O11",
      cooler: "Ryujin",
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
  keyword: string
): PcComponent | undefined {
  const list = components.filter((c) => c.category === category);
  if (list.length === 0) return undefined;

  const keyUpper = keyword.toUpperCase();
  const matched = list.find(
    (c) => c.name.toUpperCase().includes(keyUpper) || c.brand.toUpperCase().includes(keyUpper)
  );

  return matched || list[0];
}
