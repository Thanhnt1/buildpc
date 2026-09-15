# Deploy BUILD PC lên buildpc.thanhntr.io.vn

Theo đúng pattern đã dùng cho NTR: GitHub → Vercel (auto-deploy) → Cloudflare DNS trỏ subdomain.

## Bước 1: Đẩy code lên GitHub

```bash
cd "C:\Claude Cowork\PROJECTS\Personal\BUILD PC"
git init
git add .
git commit -m "Initial commit: BUILD PC MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/buildpc.git
git push -u origin main
```

(Repo tên `buildpc`, tạo trước trên GitHub, để Public hoặc Private tuỳ bạn — Vercel dùng được cả hai.)

## Bước 2: Import project vào Vercel

1. https://vercel.com/dashboard → **Add New** → **Project**
2. Import repo `buildpc` từ GitHub
3. Framework Preset: **Next.js** (tự nhận diện)
4. Environment Variables — thêm 2 biến từ `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://mjgefyylfgydnfoskwna.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_15RWYaTyA7mRJaaqKRcNpg_jzEJrXUD
   ```
5. Deploy

Sau khi deploy xong bạn sẽ có: `https://buildpc.vercel.app` (hoặc tên tương tự).

## Bước 3: Gắn subdomain buildpc.thanhntr.io.vn

### 3.1 Ở Vercel

1. Project `buildpc` → **Settings** → **Domains**
2. Add Domain: `buildpc.thanhntr.io.vn`
3. Vercel sẽ show CNAME target, thường là:
   ```
   Name: buildpc
   Type: CNAME
   Target: cname.vercel-dns.com
   ```

### 3.2 Ở Cloudflare

1. https://dash.cloudflare.com → chọn domain `thanhntr.io.vn` → **DNS**
2. **Add record**:
   ```
   Type: CNAME
   Name: buildpc
   Target: cname.vercel-dns.com
   Proxy status: DNS only
   TTL: Auto
   ```
3. Save

Lưu ý: nếu domain hiện có bản ghi wildcard `*.thanhntr.io.vn` trỏ về VPS (giống setup NTR), bản ghi CNAME riêng cho `buildpc` sẽ override đúng cho subdomain này — không ảnh hưởng các subdomain khác.

### 3.3 Verify

- Đợi 5-30 phút DNS propagate
- Vercel → Settings → Domains sẽ hiện `✓ buildpc.thanhntr.io.vn (Valid Configuration)`
- Truy cập https://buildpc.thanhntr.io.vn

## Auto-deploy sau này

Từ giờ chỉ cần:

```bash
git add .
git commit -m "Cập nhật ..."
git push origin main
```

Vercel tự build + deploy lại (~1-2 phút), không cần làm lại bước domain.

## Cập nhật dữ liệu linh kiện

Dữ liệu nằm ở Supabase (không nằm trong code), nên cập nhật giá/thêm linh kiện mới **không cần deploy lại** — chỉ cần sửa trực tiếp trong Supabase Table Editor hoặc SQL Editor, trang web sẽ tự lấy dữ liệu mới ở lần tải sau.
