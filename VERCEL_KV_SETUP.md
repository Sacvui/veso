# Hướng Dẫn Cài Đặt Vercel KV

Vercel KV được sử dụng để cache kết quả xổ số trong 30 ngày.

## Bước 1: Tạo KV Database trên Vercel

1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project **veso**
3. Vào tab **Storage**
4. Click **Create Database**
5. Chọn **KV** → **Create**
6. Đặt tên: `veso-lottery-cache`
7. Chọn region gần nhất (Singapore recommended)

## Bước 2: Connect với Project

Sau khi tạo KV, Vercel sẽ tự động thêm các Environment Variables:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

## Bước 3: Test Local (Optional)

Để test local, bạn cần pull env variables từ Vercel:

```bash
npx vercel env pull .env.local
```

Hoặc copy các biến từ Vercel Dashboard vào `.env.local`:

```env
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

## Luồng Cache

```
Request → Check KV Cache → 
  ├── Cache HIT → Return cached data (source: "cache")
  └── Cache MISS → Fetch from sources → Save to KV (30 days TTL) → Return (source: "fresh")
```

## Free Tier Limits

- 30,000 requests/month
- 256MB storage
- Đủ cho ~1,000 users/ngày

## Debug

Xem response có field `source`:
- `"cache"` = Data từ KV cache
- `"fresh"` = Data mới fetch từ nguồn
