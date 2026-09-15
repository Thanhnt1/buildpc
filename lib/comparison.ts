import { BuildSelection, CpuSpecs, GpuSpecs, RamSpecs, StorageSpecs, PsuSpecs, CATEGORY_ORDER } from "./types";
import { evaluatePubgCompatibility, PubgEvaluation } from "./pubgCompatibility";

export interface BuildSummary {
  name: string;
  selection: BuildSelection;
  totalPriceMin: number;
  totalPriceMax: number;
  formattedPrice: string;
  totalWatts: number;
  pubgEval: PubgEvaluation;
  gameFps: {
    pubg: number;
    cs2: number;
    wukong: number;
    valorant: number;
    cyberpunk: number;
  };
}

export interface ComparisonResult {
  buildA: BuildSummary;
  buildB: BuildSummary;
  priceDiff: number; // positive: A more expensive, negative: B more expensive
  priceDiffFormatted: string;
  cheaperBuild: "A" | "B" | "equal";
  fpsDiff: {
    pubg: { diff: number; winner: "A" | "B" | "equal" };
    cs2: { diff: number; winner: "A" | "B" | "equal" };
    wukong: { diff: number; winner: "A" | "B" | "equal" };
    valorant: { diff: number; winner: "A" | "B" | "equal" };
    cyberpunk: { diff: number; winner: "A" | "B" | "equal" };
  };
  wattsDiff: number;
  betterPerformanceBuild: "A" | "B" | "equal";
  verdict: string;
  highlights: string[];
}

function calculateBuildSummary(name: string, selection: BuildSelection): BuildSummary {
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

  const cpuW = selection.cpu ? (selection.cpu.specs as CpuSpecs).tdp_w || 65 : 0;
  const gpuW = selection.gpu ? (selection.gpu.specs as GpuSpecs).tdp_w || 150 : 0;
  const totalWatts = (selection.cpu || selection.gpu) ? cpuW + gpuW + 80 : 0;

  const pubgEval = evaluatePubgCompatibility(selection);
  const baseScore = pubgEval.overallScore;

  // Tính toán FPS các game dựa trên điểm tổng hợp CPU, GPU, RAM
  const gameFps = {
    pubg: pubgEval.fpsEstimates.fhdCompetitive.avg,
    cs2: Math.min(450, Math.round((baseScore / 100) * 360)),
    wukong: Math.min(130, Math.round((baseScore / 100) * 95)),
    valorant: Math.min(500, Math.round((baseScore / 100) * 440)),
    cyberpunk: Math.min(140, Math.round((baseScore / 100) * 105)),
  };

  return {
    name,
    selection,
    totalPriceMin,
    totalPriceMax,
    formattedPrice,
    totalWatts,
    pubgEval,
    gameFps,
  };
}

export function compareTwoBuilds(
  selectionA: BuildSelection,
  selectionB: BuildSelection,
  nameA: string = "Cấu hình A",
  nameB: string = "Cấu hình B"
): ComparisonResult {
  const buildA = calculateBuildSummary(nameA, selectionA);
  const buildB = calculateBuildSummary(nameB, selectionB);

  const priceA = (buildA.totalPriceMin + buildA.totalPriceMax) / 2;
  const priceB = (buildB.totalPriceMin + buildB.totalPriceMax) / 2;
  const priceDiff = Math.round(priceA - priceB);

  let cheaperBuild: "A" | "B" | "equal" = "equal";
  let priceDiffFormatted = "Giá tương đương nhau";

  if (priceDiff > 0) {
    cheaperBuild = "B";
    const percent = priceA > 0 ? Math.round((priceDiff / priceA) * 100) : 0;
    priceDiffFormatted = `Cấu hình B tiết kiệm hơn ${priceDiff.toLocaleString("vi-VN")} đ (${percent}%)`;
  } else if (priceDiff < 0) {
    cheaperBuild = "A";
    const absDiff = Math.abs(priceDiff);
    const percent = priceB > 0 ? Math.round((absDiff / priceB) * 100) : 0;
    priceDiffFormatted = `Cấu hình A tiết kiệm hơn ${absDiff.toLocaleString("vi-VN")} đ (${percent}%)`;
  }

  // So sánh FPS từng game
  const compareFpsGame = (valA: number, valB: number): { diff: number; winner: "A" | "B" | "equal" } => {
    const diff = valA - valB;
    const winner: "A" | "B" | "equal" = diff > 3 ? "A" : diff < -3 ? "B" : "equal";
    return { diff: Math.abs(diff), winner };
  };

  const fpsDiff = {
    pubg: compareFpsGame(buildA.gameFps.pubg, buildB.gameFps.pubg),
    cs2: compareFpsGame(buildA.gameFps.cs2, buildB.gameFps.cs2),
    wukong: compareFpsGame(buildA.gameFps.wukong, buildB.gameFps.wukong),
    valorant: compareFpsGame(buildA.gameFps.valorant, buildB.gameFps.valorant),
    cyberpunk: compareFpsGame(buildA.gameFps.cyberpunk, buildB.gameFps.cyberpunk),
  };

  const scoreDiff = buildA.pubgEval.overallScore - buildB.pubgEval.overallScore;
  const betterPerformanceBuild: "A" | "B" | "equal" =
    scoreDiff > 3 ? "A" : scoreDiff < -3 ? "B" : "equal";

  const wattsDiff = buildA.totalWatts - buildB.totalWatts;

  // Tổng hợp highlights & Nhận xét
  const highlights: string[] = [];

  if (betterPerformanceBuild === "A") {
    highlights.push(`⚡ Cấu hình A cho hiệu năng game cao hơn ~${Math.abs(scoreDiff)}%`);
  } else if (betterPerformanceBuild === "B") {
    highlights.push(`⚡ Cấu hình B cho hiệu năng game cao hơn ~${Math.abs(scoreDiff)}%`);
  } else {
    highlights.push(`⚖️ Cả 2 cấu hình có sức mạnh đồ họa và FPS tương đương nhau.`);
  }

  if (cheaperBuild !== "equal") {
    highlights.push(`💰 ${priceDiffFormatted}`);
  }

  if (Math.abs(wattsDiff) >= 30) {
    if (wattsDiff < 0) {
      highlights.push(`🌱 Cấu hình A tiết kiệm điện hơn (ít hơn ~${Math.abs(wattsDiff)}W công suất đỉnh).`);
    } else {
      highlights.push(`🌱 Cấu hình B tiết kiệm điện hơn (ít hơn ~${wattsDiff}W công suất đỉnh).`);
    }
  }

  // Lời khuyên kết luận
  let verdict = "";
  if (cheaperBuild === "B" && betterPerformanceBuild === "B") {
    verdict = "🏆 Cấu hình B vượt trội hoàn toàn: vừa có mức giá tiết kiệm hơn, vừa đạt mức FPS và hiệu năng cao hơn. Khuyên chọn Cấu hình B!";
  } else if (cheaperBuild === "A" && betterPerformanceBuild === "A") {
    verdict = "🏆 Cấu hình A vượt trội hoàn toàn: mức giá tốt hơn đồng thời mang lại hiệu năng cao hơn. Khuyên chọn Cấu hình A!";
  } else if (cheaperBuild === "B" && betterPerformanceBuild === "A") {
    verdict = `💡 Cấu hình A cho hiệu năng nhỉnh hơn nhưng Cấu hình B lại tiết kiệm được ${Math.abs(priceDiff).toLocaleString("vi-VN")} đ. Nếu ưu tiên tiết kiệm ngân sách, Cấu hình B là lựa chọn P/P (Price/Performance) rất tốt.`;
  } else if (cheaperBuild === "A" && betterPerformanceBuild === "B") {
    verdict = `💡 Cấu hình B cho hiệu năng cao hơn nhưng đắt hơn ${Math.abs(priceDiff).toLocaleString("vi-VN")} đ. Nếu muốn tối đa hóa trải nghiệm game, Cấu hình B rất đáng đầu tư thêm.`;
  } else {
    verdict = "⚖️ Hai cấu hình có mức giá và hiệu năng khá cân bằng nhau. Bạn có thể chọn theo sở thích thương hiệu (Intel/AMD) hoặc ngoại hình vỏ case.";
  }

  return {
    buildA,
    buildB,
    priceDiff,
    priceDiffFormatted,
    cheaperBuild,
    fpsDiff,
    wattsDiff,
    betterPerformanceBuild,
    verdict,
    highlights,
  };
}
