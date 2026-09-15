import {
  BuildSelection,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CaseSpecs,
  CoolerSpecs,
  CpuSpecs,
  GpuSpecs,
  MainboardSpecs,
  PsuSpecs,
  RamSpecs,
} from "./types";

export type IssueLevel = "error" | "warning" | "ok";

export interface CompatibilityIssue {
  level: IssueLevel;
  message: string;
}

/**
 * So khớp từng cặp linh kiện đã chọn theo các luật tương thích cơ bản
 * (giống cách PCPartPicker làm phần "Compatibility Notes"), không cần
 * dữ liệu giá/tồn kho theo thời gian thực — chỉ cần specs chuẩn.
 */
export function checkCompatibility(selection: BuildSelection): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];
  const { cpu, mainboard, ram, gpu, psu, case: pcCase, cooler, storage } = selection;

  // 1) CPU <-> Mainboard: socket
  if (cpu && mainboard) {
    const cpuSpecs = cpu.specs as CpuSpecs;
    const mbSpecs = mainboard.specs as MainboardSpecs;
    if (cpuSpecs.socket !== mbSpecs.socket) {
      issues.push({
        level: "error",
        message: `CPU (${cpu.name}, socket ${cpuSpecs.socket}) không khớp socket với Mainboard (${mainboard.name}, socket ${mbSpecs.socket}).`,
      });
    } else {
      issues.push({
        level: "ok",
        message: `CPU và Mainboard cùng socket ${cpuSpecs.socket}.`,
      });
    }

    // Loại RAM mà CPU hỗ trợ vs mainboard
    const cpuRamOk =
      cpuSpecs.ram_type === "DDR4/DDR5" || cpuSpecs.ram_type === mbSpecs.ram_type;
    if (!cpuRamOk) {
      issues.push({
        level: "error",
        message: `CPU hỗ trợ ${cpuSpecs.ram_type} nhưng Mainboard dùng khe ${mbSpecs.ram_type}.`,
      });
    }
  }

  // 2) RAM <-> Mainboard: loại RAM (DDR4/DDR5) + tốc độ
  if (ram && mainboard) {
    const ramSpecs = ram.specs as RamSpecs;
    const mbSpecs = mainboard.specs as MainboardSpecs;
    if (ramSpecs.type !== mbSpecs.ram_type) {
      issues.push({
        level: "error",
        message: `RAM ${ramSpecs.type} không tương thích khe RAM ${mbSpecs.ram_type} trên Mainboard.`,
      });
    } else if (mbSpecs.max_ram_mhz && ramSpecs.speed_mhz > mbSpecs.max_ram_mhz) {
      issues.push({
        level: "warning",
        message: `RAM ${ramSpecs.speed_mhz}MHz vượt xung nhịp tối đa Mainboard hỗ trợ chính thức (${mbSpecs.max_ram_mhz}MHz) — vẫn chạy được nhưng sẽ tự hạ xung hoặc cần bật XMP/EXPO.`,
      });
    } else {
      issues.push({ level: "ok", message: `RAM tương thích loại khe và nằm trong xung nhịp hỗ trợ.` });
    }

    if (mbSpecs.ram_slots && ramSpecs.modules > mbSpecs.ram_slots) {
      issues.push({
        level: "error",
        message: `Bộ RAM có ${ramSpecs.modules} thanh nhưng Mainboard chỉ có ${mbSpecs.ram_slots} khe RAM.`,
      });
    }
  }

  // 3) Mainboard <-> Case: form factor
  if (mainboard && pcCase) {
    const mbSpecs = mainboard.specs as MainboardSpecs;
    const caseSpecs = pcCase.specs as CaseSpecs;
    if (!caseSpecs.supported_form_factors.includes(mbSpecs.form_factor)) {
      issues.push({
        level: "error",
        message: `Mainboard chuẩn ${mbSpecs.form_factor} không lắp vừa Case (Case chỉ hỗ trợ: ${caseSpecs.supported_form_factors.join(", ")}).`,
      });
    } else {
      issues.push({ level: "ok", message: `Mainboard (${mbSpecs.form_factor}) lắp vừa Case.` });
    }
  }

  // 4) PSU <-> Case: form factor
  if (psu && pcCase) {
    const psuSpecs = psu.specs as PsuSpecs;
    const caseSpecs = pcCase.specs as CaseSpecs;
    if (!caseSpecs.supported_psu_form_factors.includes(psuSpecs.form_factor)) {
      issues.push({
        level: "error",
        message: `Nguồn chuẩn ${psuSpecs.form_factor} không lắp vừa khoang nguồn của Case (Case hỗ trợ: ${caseSpecs.supported_psu_form_factors.join(", ")}).`,
      });
    }
  }

  // 5) GPU <-> Case: chiều dài
  if (gpu && pcCase) {
    const gpuSpecs = gpu.specs as GpuSpecs;
    const caseSpecs = pcCase.specs as CaseSpecs;
    if (gpuSpecs.length_mm > caseSpecs.max_gpu_length_mm) {
      issues.push({
        level: "error",
        message: `VGA dài ${gpuSpecs.length_mm}mm, vượt quá khoảng trống Case cho phép (${caseSpecs.max_gpu_length_mm}mm).`,
      });
    } else {
      issues.push({ level: "ok", message: `VGA (${gpuSpecs.length_mm}mm) vừa khoang Case.` });
    }
  }

  // 6) Cooler <-> CPU: socket
  if (cooler && cpu) {
    const coolerSpecs = cooler.specs as CoolerSpecs;
    const cpuSpecs = cpu.specs as CpuSpecs;
    if (!coolerSpecs.socket_support.includes(cpuSpecs.socket)) {
      issues.push({
        level: "error",
        message: `Tản nhiệt không có ngàm hỗ trợ socket ${cpuSpecs.socket} của CPU.`,
      });
    }
    if (coolerSpecs.tdp_rating_w && cpuSpecs.tdp_w > coolerSpecs.tdp_rating_w) {
      issues.push({
        level: "warning",
        message: `CPU toả nhiệt ${cpuSpecs.tdp_w}W có thể vượt khả năng tản nhiệt khuyến nghị (${coolerSpecs.tdp_rating_w}W) của tản đã chọn.`,
      });
    }
  }

  // 7) Cooler <-> Case: chiều cao (khí) hoặc kích thước radiator (nước)
  if (cooler && pcCase) {
    const coolerSpecs = cooler.specs as CoolerSpecs;
    const caseSpecs = pcCase.specs as CaseSpecs;
    if (coolerSpecs.type === "air" && coolerSpecs.height_mm) {
      if (coolerSpecs.height_mm > caseSpecs.max_cooler_height_mm) {
        issues.push({
          level: "error",
          message: `Tản khí cao ${coolerSpecs.height_mm}mm vượt giới hạn Case cho phép (${caseSpecs.max_cooler_height_mm}mm) — sẽ không đóng được nắp hông.`,
        });
      }
    }
    if (coolerSpecs.type === "aio" && coolerSpecs.radiator_size_mm) {
      const supported = caseSpecs.supported_radiator_sizes_mm || [];
      if (!supported.includes(coolerSpecs.radiator_size_mm)) {
        issues.push({
          level: "warning",
          message: `Case chưa xác nhận hỗ trợ radiator ${coolerSpecs.radiator_size_mm}mm (Case hỗ trợ: ${supported.join(", ") || "không rõ"}). Nên kiểm tra thêm vị trí lắp trước khi mua.`,
        });
      }
    }
  }

  // 8) Nguồn điện tổng hệ thống <-> PSU
  if (psu && (cpu || gpu)) {
    const psuSpecs = psu.specs as PsuSpecs;
    const cpuW = cpu ? (cpu.specs as CpuSpecs).tdp_w : 0;
    const gpuW = gpu ? (gpu.specs as GpuSpecs).tdp_w : 0;
    const estimateW = cpuW + gpuW + 120; // buffer cho mainboard, ổ cứng, quạt...
    if (estimateW > psuSpecs.wattage_w) {
      issues.push({
        level: "error",
        message: `Ước tính công suất hệ thống (~${estimateW}W) vượt công suất nguồn (${psuSpecs.wattage_w}W). Nên chọn nguồn cao hơn.`,
      });
    } else if (estimateW > psuSpecs.wattage_w * 0.8) {
      issues.push({
        level: "warning",
        message: `Ước tính công suất hệ thống (~${estimateW}W) khá sát công suất nguồn (${psuSpecs.wattage_w}W), nên còn ít dư địa nâng cấp.`,
      });
    } else {
      issues.push({
        level: "ok",
        message: `Nguồn ${psuSpecs.wattage_w}W đủ dư cho công suất ước tính ~${estimateW}W.`,
      });
    }

    if (gpu) {
      const gpuSpecs = gpu.specs as GpuSpecs;
      if (gpuSpecs.recommended_psu_w > psuSpecs.wattage_w) {
        issues.push({
          level: "warning",
          message: `Nhà sản xuất VGA khuyến nghị nguồn tối thiểu ${gpuSpecs.recommended_psu_w}W, cao hơn nguồn đã chọn (${psuSpecs.wattage_w}W).`,
        });
      }
    }
  }

  // 9) Storage: thông tin tham khảo (hầu hết mainboard hiện đại đều có sẵn SATA + M.2)
  if (storage && mainboard) {
    const mbSpecs = mainboard.specs as MainboardSpecs;
    const storageSpecs = storage.specs;
    if (storageSpecs.interface === "NVMe" && (!mbSpecs.m2_slots || mbSpecs.m2_slots < 1)) {
      issues.push({
        level: "warning",
        message: `Chưa xác nhận Mainboard có khe M.2 cho ổ NVMe đã chọn.`,
      });
    }
  }

  // 10) Cảnh báo các linh kiện chưa chọn
  for (const cat of CATEGORY_ORDER) {
    if (!selection[cat]) {
      issues.push({
        level: "warning",
        message: `Chưa chọn ${CATEGORY_LABELS[cat]}: Hãy chọn để kiểm tra tương thích đầy đủ.`,
      });
    }
  }

  return issues;
}

export function summarize(issues: CompatibilityIssue[]) {
  return {
    errors: issues.filter((i) => i.level === "error").length,
    warnings: issues.filter((i) => i.level === "warning").length,
    oks: issues.filter((i) => i.level === "ok").length,
  };
}
