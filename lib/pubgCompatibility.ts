import { BuildSelection, CpuSpecs, GpuSpecs, RamSpecs, StorageSpecs } from "./types";

export interface PubgEvaluation {
  totalPriceMin: number;
  totalPriceMax: number;
  formattedPrice: string;
  hasEssentialParts: boolean;
  missingParts: string[];
  tier: "unplayable" | "entry" | "esport_144" | "hardcore_240";
  tierTitle: string;
  tierBadgeColor: string;
  tierDescription: string;
  cpuScore: number;
  gpuScore: number;
  ramScore: number;
  overallScore: number; // 0 - 100
  fpsEstimates: {
    fhdCompetitive: { avg: number; min1Percent: number };
    fhdUltra: { avg: number; min1Percent: number };
    qhdCompetitive: { avg: number; min1Percent: number };
    uhdUltra: { avg: number; min1Percent: number };
  };
  componentDetails: {
    cpu: { status: "good" | "warning" | "bad" | "missing"; message: string };
    gpu: { status: "good" | "warning" | "bad" | "missing"; message: string };
    ram: { status: "good" | "warning" | "bad" | "missing"; message: string };
    storage: { status: "good" | "warning" | "bad" | "missing"; message: string };
  };
  recommendations: string[];
  inGameSettings: {
    setting: string;
    value: string;
    reason: string;
  }[];
}

export function evaluatePubgCompatibility(selection: BuildSelection): PubgEvaluation {
  const { cpu, mainboard, ram, gpu, psu, case: pcCase, cooler, storage } = selection;

  // 1. Tính tổng giá
  let totalPriceMin = 0;
  let totalPriceMax = 0;
  Object.values(selection).forEach((comp) => {
    if (comp) {
      totalPriceMin += comp.price_min ?? 0;
      totalPriceMax += comp.price_max ?? comp.price_min ?? 0;
    }
  });

  const formattedPrice =
    totalPriceMin === 0
      ? "0 VNĐ"
      : totalPriceMin === totalPriceMax
      ? `${totalPriceMin.toLocaleString("vi-VN")} VNĐ`
      : `${totalPriceMin.toLocaleString("vi-VN")} - ${totalPriceMax.toLocaleString("vi-VN")} VNĐ`;

  // Kiểm tra linh kiện thiết yếu
  const missingParts: string[] = [];
  if (!cpu) missingParts.push("CPU");
  if (!mainboard) missingParts.push("Mainboard");
  if (!ram) missingParts.push("RAM");
  if (!gpu && !(cpu && (cpu.specs as CpuSpecs).integrated_graphics)) {
    missingParts.push("Card màn hình (VGA)");
  }
  if (!storage) missingParts.push("Ổ cứng (SSD)");
  if (!psu) missingParts.push("Nguồn (PSU)");
  if (!pcCase) missingParts.push("Vỏ Case");

  const hasEssentialParts: boolean = Boolean(
    cpu &&
    mainboard &&
    ram &&
    (gpu || (cpu && (cpu.specs as CpuSpecs).integrated_graphics)) &&
    storage &&
    psu
  );

  // 2. Đánh giá CPU
  let cpuScore = 0;
  let cpuStatus: "good" | "warning" | "bad" | "missing" = "missing";
  let cpuMessage = "Chưa chọn CPU. PUBG là tựa game cực kỳ ăn CPU và Cache L3.";

  if (cpu) {
    const name = cpu.name.toUpperCase();
    const specs = cpu.specs as CpuSpecs;
    const cores = specs.cores || 4;

    if (name.includes("X3D") || name.includes("7800X3D") || name.includes("9800X3D")) {
      cpuScore = 10;
      cpuStatus = "good";
      cpuMessage = "CPU trang bị công nghệ 3D V-Cache (Vua game PUBG). Cho FPS 1% Low ổn định tuyệt đối trong các pha giao tranh bom khói và nhảy dù đông người.";
    } else if (
      name.includes("14900") ||
      name.includes("13900") ||
      name.includes("9950") ||
      name.includes("9900") ||
      name.includes("285K") ||
      name.includes("265K")
    ) {
      cpuScore = 9.5;
      cpuStatus = "good";
      cpuMessage = "CPU cao cấp đa nhân xung nhịp cao, đáp ứng mức 200+ FPS mượt mà ngay cả khi vừa chơi vừa livestream/quay highlight.";
    } else if (
      name.includes("14700") ||
      name.includes("13700") ||
      name.includes("14600") ||
      name.includes("13600") ||
      name.includes("9700X") ||
      name.includes("7700X") ||
      name.includes("245K")
    ) {
      cpuScore = 9.0;
      cpuStatus = "good";
      cpuMessage = "CPU cận cao cấp cực mạnh cho PUBG, giữ khung hình ổn định ở các vòng bo cuối nhiều người mà không bị giật lag.";
    } else if (
      name.includes("14400") ||
      name.includes("13400") ||
      name.includes("12400") ||
      name.includes("7500F") ||
      name.includes("7600") ||
      name.includes("5700") ||
      name.includes("5600X") ||
      name.includes("5600")
    ) {
      cpuScore = 7.5;
      cpuStatus = "good";
      cpuMessage = "CPU tầm trung quốc dân, tối ưu hoàn hảo mức 120-160 FPS chuẩn màn hình 144Hz.";
    } else if (name.includes("12100") || name.includes("14100") || name.includes("5500") || name.includes("3600")) {
      cpuScore = 6.0;
      cpuStatus = "good";
      cpuMessage = "CPU 4-6 nhân giá rẻ đủ chơi tốt PUBG 60-100 FPS ở thiết lập thi đấu. Có thể tụt nhẹ FPS khi nhảy Pochinki/Bootcamp đông người.";
    } else if (name.includes("3200G") || name.includes("3000G") || cores <= 4) {
      cpuScore = 3.5;
      cpuStatus = "warning";
      cpuMessage = "CPU đời cũ hoặc số nhân/luồng thấp, sẽ bị nghẽn (bottleneck) khiến FPS trồi sụt không đều.";
    } else {
      cpuScore = 6.5;
      cpuStatus = "good";
      cpuMessage = "CPU đáp ứng tốt yêu cầu xử lý vật lý và chuyển động trong PUBG.";
    }
  }

  // 3. Đánh giá GPU (VGA)
  let gpuScore = 0;
  let gpuStatus: "good" | "warning" | "bad" | "missing" = "missing";
  let gpuMessage = "Chưa chọn Card đồ họa (VGA).";

  if (gpu) {
    const name = gpu.name.toUpperCase();
    if (name.includes("4090") || name.includes("5090")) {
      gpuScore = 10;
      gpuStatus = "good";
      gpuMessage = "VGA đầu bảng vô đối. Cân mượt mà PUBG ở độ phân giải 4K Ultra Settings > 165 FPS.";
    } else if (name.includes("4080") || name.includes("5080") || name.includes("7900 XTX")) {
      gpuScore = 9.5;
      gpuStatus = "good";
      gpuMessage = "Card đồ họa phân khúc Hi-End. Đạt 200+ FPS ở 2K 1440p và trên 100 FPS ở 4K.";
    } else if (name.includes("4070 TI") || name.includes("5070 TI") || name.includes("7800 XT") || name.includes("4070 SUPER") || name.includes("5070") || name.includes("4070")) {
      gpuScore = 8.8;
      gpuStatus = "good";
      gpuMessage = "Card đồ họa chuẩn Esport cao cấp. Đạt 165 - 240 FPS ở 1080p và 140+ FPS ở 2K (1440p).";
    } else if (name.includes("4060 TI") || name.includes("7700 XT") || name.includes("3060 TI") || name.includes("6700 XT")) {
      gpuScore = 8.0;
      gpuStatus = "good";
      gpuMessage = "Card đồ họa tối ưu nhất cho màn hình 144Hz - 165Hz Full HD. Bắn cực mượt, không sợ drop hình.";
    } else if (name.includes("4060") || name.includes("3060") || name.includes("7600") || name.includes("B580") || name.includes("6600")) {
      gpuScore = 7.2;
      gpuStatus = "good";
      gpuMessage = "Card đồ họa tầm trung quốc dân, đạt 120 - 160 FPS ở thiết lập Competitive Settings 1080p.";
    } else if (name.includes("3050") || name.includes("1660") || name.includes("6500 XT") || name.includes("5050")) {
      gpuScore = 5.5;
      gpuStatus = "warning";
      gpuMessage = "Đáp ứng chơi tốt PUBG ở 1080p Very Low/Medium (60 - 90 FPS).";
    } else if (name.includes("1650") || name.includes("1050") || name.includes("GTX")) {
      gpuScore = 4.0;
      gpuStatus = "warning";
      gpuMessage = "Card đồ họa phổ thông, chỉ chơi được 1080p Very Low khoảng 50 - 65 FPS.";
    } else {
      gpuScore = 6.5;
      gpuStatus = "good";
      gpuMessage = "Card đồ họa rời đáp ứng tốt yêu cầu xử lý hình ảnh 3D của PUBG.";
    }
  } else if (cpu && (cpu.specs as CpuSpecs).integrated_graphics) {
    gpuScore = 2.0;
    gpuStatus = "bad";
    gpuMessage = "Đang dùng GPU tích hợp trên CPU (iGPU). PUBG chỉ chạy được ở độ phân giải thấp (720p Very Low ~ 30-45 FPS), rất giật lag.";
  } else {
    gpuStatus = "bad";
    gpuMessage = "Chưa có card đồ họa rời và CPU không có đồ họa tích hợp. Máy tính sẽ không thể hiển thị và chơi game.";
  }

  // 4. Đánh giá RAM
  let ramScore = 0;
  let ramStatus: "good" | "warning" | "bad" | "missing" = "missing";
  let ramMessage = "Chưa chọn RAM.";

  if (ram) {
    const specs = ram.specs as RamSpecs;
    const totalGb = (specs.modules || 1) * (specs.capacity_gb_per_module || 8);
    const isDual = (specs.modules || 1) >= 2;
    const isDdr5 = specs.type === "DDR5";

    if (totalGb >= 32) {
      ramScore = isDual ? (isDdr5 ? 10 : 9.5) : 8.0;
      ramStatus = "good";
      ramMessage = `32GB RAM ${isDual ? "Dual Channel" : "Single Channel"} (${specs.type}): Dung lượng lý tưởng cho PUBG (ngốn ~12-14GB khi chạy) kèm Discord, trình duyệt và phần mềm quay video mà không lo giật lag.`;
    } else if (totalGb >= 16) {
      if (isDual) {
        ramScore = isDdr5 ? 9.0 : 8.0;
        ramStatus = "good";
        ramMessage = `16GB RAM Dual Channel (${specs.modules} thanh): Chuẩn khuyến nghị cho PUBG, băng thông kép giúp duy trì FPS tối thiểu (1% Low) rất tốt.`;
      } else {
        ramScore = 6.0;
        ramStatus = "warning";
        ramMessage = `16GB RAM Single Channel (1 thanh đơn): PUBG rất nhạy cảm với băng thông RAM. Dùng 1 thanh sẽ dễ bị tụt FPS (drop 1% Low) khi xe chạy hoặc bom nổ. Khuyên dùng 2 thanh (2x8GB).`;
      }
    } else {
      ramScore = 3.5;
      ramStatus = "bad";
      ramMessage = `RAM chỉ có ${totalGb}GB. PUBG yêu cầu tối thiểu 16GB để không bị hiện tượng tràn RAM và văng game (crash) ra màn hình.`;
    }
  }

  // 5. Đánh giá Storage
  let storageStatus: "good" | "warning" | "bad" | "missing" = "missing";
  let storageMessage = "Chưa chọn ổ cứng.";

  if (storage) {
    const specs = storage.specs as StorageSpecs;
    if (specs.interface === "NVMe" || specs.form_factor === "M.2-2280") {
      storageStatus = "good";
      storageMessage = `Ổ SSD NVMe M.2 tốc độ cao: Load map, vào trận cực nhanh và triệt tiêu hoàn toàn lỗi chậm tải kết cấu (lỗi nhà đất sét khi tiếp đất).`;
    } else if (specs.interface === "SATA" && specs.form_factor === "2.5-inch") {
      storageStatus = "good";
      storageMessage = `Ổ SSD SATA 2.5": Tốc độ đủ mượt để load game PUBG nhanh chóng.`;
    } else {
      storageStatus = "warning";
      storageMessage = `Ổ cứng cơ HDD: PUBG cài trên HDD dễ bị lỗi "nhà đất sét" (chưa kịp load mô hình công trình khi vừa nhảy dù xuống) và load game lâu.`;
    }
  }

  // 6. Tính điểm tổng và ước tính FPS
  const overallScore = Math.round(
    (cpuScore * 0.4 + gpuScore * 0.45 + ramScore * 0.15) * 10
  );

  let tier: PubgEvaluation["tier"] = "entry";
  let tierTitle = "Cấu hình Cơ Bản (60+ FPS)";
  let tierBadgeColor = "bg-amber-100 text-amber-800 border-amber-300";
  let tierDescription = "Chơi mượt mà ở độ phân giải 1080p thiết lập Very Low/Low.";

  if (overallScore >= 85) {
    tier = "hardcore_240";
    tierTitle = "Chuẩn Hardcore / 2K Pro (240+ FPS)";
    tierBadgeColor = "bg-purple-100 text-purple-800 border-purple-300";
    tierDescription = "Cấu hình đỉnh cao, tối ưu tuyệt đối cho màn hình 240Hz/360Hz hoặc chơi mượt ở độ phân giải 2K/4K.";
  } else if (overallScore >= 70) {
    tier = "esport_144";
    tierTitle = "Chuẩn Thi Đấu Esport (144+ FPS)";
    tierBadgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
    tierDescription = "FPS ổn định trên 144Hz trong mọi tình huống giao tranh, phù hợp nhất cho leo rank tryhard.";
  } else if (overallScore >= 50) {
    tier = "entry";
    tierTitle = "Chơi Ổn Định (60 - 100 FPS)";
    tierBadgeColor = "bg-blue-100 text-blue-800 border-blue-300";
    tierDescription = "Đáp ứng tốt màn hình 60Hz - 75Hz, trải nghiệm bắn súng ổn định.";
  } else {
    tier = "unplayable";
    tierTitle = "Chưa Đủ Cấu Hình Chơi Mượt";
    tierBadgeColor = "bg-red-100 text-red-800 border-red-300";
    tierDescription = "Hệ thống sẽ bị giật lag, tụt khung hình hoặc không đủ linh kiện cần thiết.";
  }

  // Ước lượng FPS dựa trên điểm CPU & GPU & RAM
  const baseAvg = Math.max(25, Math.round((overallScore / 100) * 260));
  const fpsEstimates = {
    fhdCompetitive: {
      avg: Math.min(360, Math.round(baseAvg * 1.15)),
      min1Percent: Math.min(260, Math.round(baseAvg * 0.72)),
    },
    fhdUltra: {
      avg: Math.min(240, Math.round(baseAvg * 0.75)),
      min1Percent: Math.min(180, Math.round(baseAvg * 0.52)),
    },
    qhdCompetitive: {
      avg: Math.min(240, Math.round(baseAvg * 0.8)),
      min1Percent: Math.min(180, Math.round(baseAvg * 0.55)),
    },
    uhdUltra: {
      avg: Math.min(160, Math.round(baseAvg * 0.42)),
      min1Percent: Math.min(110, Math.round(baseAvg * 0.28)),
    },
  };

  // 7. Gợi ý thêm linh kiện / Tối ưu hóa (Recommendations)
  const recommendations: string[] = [];

  if (!gpu && (!cpu || !(cpu.specs as CpuSpecs).integrated_graphics)) {
    recommendations.push("🚨 Bắt buộc chọn thêm Card màn hình rời (VGA) như RTX 3060, RTX 4060 hoặc RX 7600 để có thể chơi game.");
  } else if (!gpu && cpu && (cpu.specs as CpuSpecs).integrated_graphics) {
    recommendations.push("💡 Nên bổ sung Card đồ họa rời (tối thiểu RTX 3050 hoặc RTX 4060). Đồ họa tích hợp của CPU không đủ sức gánh PUBG mượt mà.");
  }

  if (ram) {
    const specs = ram.specs as RamSpecs;
    const totalGb = (specs.modules || 1) * (specs.capacity_gb_per_module || 8);
    if ((specs.modules || 1) === 1) {
      recommendations.push("⚡ Nâng cấp lên 2 thanh RAM (Dual Channel) thay vì 1 thanh đơn. Băng thông RAM kép giúp tăng 15-25% FPS 1% Low trong PUBG.");
    }
    if (totalGb < 16) {
      recommendations.push("💾 Nâng cấp dung lượng RAM lên tối thiểu 16GB (khuyên dùng 32GB) để tránh tình trạng tràn RAM giật lag khi chơi lâu.");
    }
  } else {
    recommendations.push("🚨 Cần chọn thêm RAM: Khuyên dùng kit 16GB (2x8GB) hoặc 32GB (2x16GB) Bus 3200MHz (DDR4) hoặc 6000MHz (DDR5).");
  }

  if (storage && (storage.specs as StorageSpecs).interface === "SATA" && (storage.specs as StorageSpecs).form_factor === "3.5-inch") {
    recommendations.push("🚀 Đổi sang ổ cứng SSD M.2 NVMe (như Kingston NV3, Samsung 980/990 Pro) để tải map và vào game nhanh gấp 5-10 lần so với HDD.");
  } else if (!storage) {
    recommendations.push("🚨 Cần chọn thêm ổ cứng SSD M.2 NVMe dung lượng từ 500GB - 1TB để cài Windows và PUBG.");
  }

  if (cpu && gpu) {
    const cpuSpecs = cpu.specs as CpuSpecs;
    const gpuSpecs = gpu.specs as GpuSpecs;
    if (gpuSpecs.tdp_w > 250 && cpuSpecs.cores && cpuSpecs.cores <= 6 && !cpu.name.toUpperCase().includes("X3D")) {
      recommendations.push("🔥 CPU hiện tại có thể hơi đuối so với VGA cao cấp đã chọn. Nếu muốn max FPS 240Hz, nên cân nhắc CPU có 3D V-Cache (Ryzen 7 7800X3D / 9800X3D) hoặc i7-14700K.");
    }
  }

  // 8. Bảng thông số cài đặt tối ưu trong game (In-Game Settings Guide)
  const inGameSettings = [
    {
      setting: "Render Scale (Tỉ lệ hiển thị)",
      value: "100",
      reason: "Giữ hình ảnh sắc nét chuẩn pixel, không nên đẩy lên >100 nếu không dùng màn 2K/4K.",
    },
    {
      setting: "Anti-Aliasing (Khử răng cưa)",
      value: "Medium hoặc High",
      reason: "Giúp viền người và vật thể mượt mà, dễ phân biệt đối phương từ khoảng cách xa.",
    },
    {
      setting: "Post-Processing (Hậu kỳ)",
      value: "Very Low",
      reason: "Tắt hiệu ứng làm mờ không cần thiết, tăng độ trong của tầm nhìn và tăng FPS.",
    },
    {
      setting: "Shadows (Đổ bóng)",
      value: "Very Low",
      reason: "Làm sáng các góc tối, dễ soi địch trốn trong nhà/bụi cây và tiết kiệm nhiều tài nguyên GPU.",
    },
    {
      setting: "Textures (Họa tiết)",
      value: gpuScore >= 7 ? "High / Ultra" : "Medium",
      reason: "Giúp vân bề mặt súng, nhân vật và nhà cửa chi tiết rõ nét (chỉ tốn VRAM, ít ảnh hưởng FPS).",
    },
    {
      setting: "Effects (Hiệu ứng)",
      value: "Very Low",
      reason: "Tránh tụt giật khung hình khi ném bom khói (Smoke), Red zone hoặc cháy nổ.",
    },
    {
      setting: "Foliage (Lá cây / Cỏ)",
      value: "Very Low",
      reason: "Giảm độ rậm của cỏ giúp dễ nhìn thấy đối thủ đang nằm bò trườn từ xa.",
    },
    {
      setting: "View Distance (Tầm nhìn)",
      value: "Medium hoặc High",
      reason: "Đảm bảo nhìn thấy phương tiện xe cộ, dù và nhà cửa từ khoảng cách xa.",
    },
    {
      setting: "DirectX Version",
      value: "DirectX 11 Enhanced",
      reason: "Phiên bản ổn định nhất, hạn chế crash và cho FPS mượt mà nhất trên hầu hết cấu hình.",
    },
    {
      setting: "V-Sync & Motion Blur",
      value: "Disable (Tắt)",
      reason: "Triệt tiêu độ trễ chuột (Input Lag) và tránh bị chóng mặt khi lia chuột nhanh.",
    },
  ];

  return {
    totalPriceMin,
    totalPriceMax,
    formattedPrice,
    hasEssentialParts,
    missingParts,
    tier,
    tierTitle,
    tierBadgeColor,
    tierDescription,
    cpuScore,
    gpuScore,
    ramScore,
    overallScore,
    fpsEstimates,
    componentDetails: {
      cpu: { status: cpuStatus, message: cpuMessage },
      gpu: { status: gpuStatus, message: gpuMessage },
      ram: { status: ramStatus, message: ramMessage },
      storage: { status: storageStatus, message: storageMessage },
    },
    recommendations,
    inGameSettings,
  };
}
