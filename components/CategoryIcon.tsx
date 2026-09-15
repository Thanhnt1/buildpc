import { Cpu, CircuitBoard, MemoryStick, Zap, Box, Fan, HardDrive, Layers } from "lucide-react";
import { Category } from "@/lib/types";

const ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  cpu: Cpu,
  mainboard: CircuitBoard,
  ram: MemoryStick,
  gpu: Layers,
  psu: Zap,
  case: Box,
  cooler: Fan,
  storage: HardDrive,
};

// Màu nền placeholder theo loại linh kiện, để dễ phân biệt khi chưa có ảnh thật.
const COLORS: Record<Category, string> = {
  cpu: "bg-blue-50 text-blue-500",
  mainboard: "bg-violet-50 text-violet-500",
  ram: "bg-emerald-50 text-emerald-500",
  gpu: "bg-rose-50 text-rose-500",
  psu: "bg-amber-50 text-amber-500",
  case: "bg-slate-100 text-slate-500",
  cooler: "bg-cyan-50 text-cyan-500",
  storage: "bg-indigo-50 text-indigo-500",
};

export default function CategoryIcon({
  category,
  className = "w-8 h-8",
}: {
  category: Category;
  className?: string;
}) {
  const Icon = ICONS[category];
  return <Icon className={className} />;
}

export function categoryPlaceholderClass(category: Category) {
  return COLORS[category];
}
