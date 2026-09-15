-- ============================================================
-- BUILD PC - Bảng dữ liệu linh kiện (chạy trong cùng Supabase
-- project với NTR, nhưng KHÔNG đụng tới bảng projects/tasks).
-- Vào Supabase Dashboard -> SQL Editor -> dán & Run.
-- ============================================================

CREATE TABLE IF NOT EXISTS pc_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(20) NOT NULL CHECK (category IN (
    'cpu', 'mainboard', 'ram', 'gpu', 'psu', 'case', 'cooler', 'storage'
  )),
  brand VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  price_min BIGINT,              -- giá tham khảo thấp nhất (VNĐ)
  price_max BIGINT,              -- giá tham khảo cao nhất (VNĐ)
  price_updated_at DATE,         -- ngày cập nhật giá lần cuối
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,  -- thông số riêng theo từng loại (xem lib/types.ts)
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pc_components_category ON pc_components(category);
CREATE INDEX IF NOT EXISTS idx_pc_components_brand ON pc_components(brand);

-- Đọc công khai (đây là dữ liệu tham khảo, không phải dữ liệu cá nhân),
-- không cho ghi/sửa/xoá qua API công khai (chỉ chỉnh qua SQL Editor / service role).
ALTER TABLE pc_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read components" ON pc_components
  FOR SELECT USING (true);

-- Không tạo policy INSERT/UPDATE/DELETE => chặn ghi từ anon key.
