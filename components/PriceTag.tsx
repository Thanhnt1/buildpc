function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

export default function PriceTag({
  min,
  max,
  updatedAt,
}: {
  min: number | null;
  max: number | null;
  updatedAt: string | null;
}) {
  if (min == null && max == null) {
    return <span className="text-slate-400 text-sm">Chưa có giá</span>;
  }
  const label =
    min != null && max != null && min !== max
      ? `${formatVnd(min)} - ${formatVnd(max)}`
      : formatVnd((min ?? max) as number);

  return (
    <div>
      <div className="font-semibold text-brand">{label}</div>
      {updatedAt && (
        <div className="text-[11px] text-slate-400">Cập nhật {updatedAt}</div>
      )}
    </div>
  );
}
