# Deploy BUILD PC lên buildpc.thanhntr.io.vn

Mô hình triển khai: GitHub -> Vercel (tự động deploy) -> Cloudflare DNS.

## 1. Kiểm tra trước khi deploy

1. Code đã được push lên repository `Thanhnt1/buildpc`, nhánh `main`.
2. Chạy tại máy local:
   ```bash
   npm run build
   ```
3. Chuẩn bị hai biến môi trường từ file `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

Không commit file `.env.local` hoặc dán giá trị biến môi trường vào tài liệu công khai.

## 2. Tạo project trên Vercel

1. Mở [Vercel Dashboard](https://vercel.com/dashboard), chọn **Add New** -> **Project**.
2. Import repository `Thanhnt1/buildpc` từ GitHub.
3. Xác nhận các thiết lập:
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: giữ mặc định
4. Trong **Environment Variables**, thêm `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` cho các môi trường Production, Preview và Development.
5. Chọn **Deploy**. Sau khi thành công, kiểm tra URL mặc định `https://buildpc.vercel.app`.

## 3. Gắn buildpc.thanhntr.io.vn

### Trên Vercel

1. Vào project `buildpc` -> **Settings** -> **Domains**.
2. Thêm domain `buildpc.thanhntr.io.vn`.
3. Giữ trang này mở để đối chiếu DNS target mà Vercel cung cấp. Target CNAME thông thường là `cname.vercel-dns.com`.

### Trên Cloudflare

1. Mở zone `thanhntr.io.vn` -> **DNS** -> **Records**.
2. Tạo hoặc cập nhật bản ghi:
   ```
   Type: CNAME
   Name: buildpc
   Target: cname.vercel-dns.com
   Proxy status: DNS only
   TTL: Auto
   ```
3. Nếu đã có bản ghi `buildpc` khác, thay thế nó. Bản ghi cụ thể `buildpc` sẽ được ưu tiên hơn wildcard `*.thanhntr.io.vn`.
4. Không bật Cloudflare Proxy cho đến khi Vercel xác nhận domain hợp lệ và SSL đã được cấp.

## 4. Xác minh

1. Đợi DNS cập nhật, thường 5-30 phút.
2. Trong Vercel -> Settings -> Domains, domain phải hiện **Valid Configuration**.
3. Mở `https://buildpc.thanhntr.io.vn` và kiểm tra:
   - Trang danh sách linh kiện tải được dữ liệu Supabase.
   - `/compatibility` và `/compare` hoạt động.
   - HTTPS không báo chứng chỉ lỗi.

## Auto-deploy

Mỗi lần push vào `main`, Vercel sẽ tự build và deploy Production. Pull request sẽ tạo Preview Deployment riêng.

## Cập nhật dữ liệu linh kiện

Dữ liệu nằm tại Supabase. Sửa giá hoặc thêm linh kiện qua Supabase Table Editor/SQL Editor sẽ không cần deploy lại ứng dụng.
