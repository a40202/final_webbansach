# Deploy BookStore lên Render

Ứng dụng gồm **3 phần**:

| Thành phần | Công nghệ | Trên Render |
|------------|-----------|-------------|
| Frontend | Next.js | Web Service |
| API | NestJS | Web Service (`backend/`) |
| Database | PostgreSQL | Render Postgres **hoặc** Neon (đang dùng) |

---

## Chuẩn bị

1. **Đẩy code lên GitHub** (public hoặc private đều được).
2. Tài khoản [render.com](https://render.com) — đăng nhập bằng GitHub.
3. Chuẩn bị **JWT secret** dài (≥ 32 ký tự), ví dụ:  
   `openssl rand -base64 32` (Git Bash / WSL / Mac).

---

## Bước 1 — Database

### Cách A: Giữ Neon (đã có sẵn)

- Vào [Neon Console](https://console.neon.tech) → project → **Connection string**.
- Copy chuỗi `postgresql://...` (bật **SSL** nếu có).
- Dùng làm `DATABASE_URL` cho API (bước 2).

### Cách B: Postgres trên Render

1. Dashboard → **New +** → **PostgreSQL**.
2. Name: `bookstore-db`, plan **Free**.
3. Sau khi tạo xong, copy **Internal Database URL** (dùng cho service cùng Render) hoặc **External** (nếu API ở chỗ khác).

---

## Bước 2 — Deploy API (NestJS)

1. **New +** → **Web Service** → chọn repo GitHub.
2. Cấu hình:

| Mục | Giá trị |
|-----|---------|
| **Name** | `bookstore-api` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run db:migrate:deploy && npm run start:prod` |
| **Health Check Path** | `/api/health` |

3. **Environment Variables**:

| Key | Giá trị |
|-----|---------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Chuỗi Postgres (Neon hoặc Render) |
| `JWT_SECRET` | Chuỗi bí mật dài, **không** dùng giá trị mẫu |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | Để tạm `http://localhost:3000`, sửa lại sau bước 3 |

> Render tự gán `PORT` — không cần set `PORT` thủ công.

4. **Create Web Service** — đợi build xong.
5. Copy URL API, ví dụ: `https://bookstore-api-xxxx.onrender.com`  
   → API gọi tại: `https://bookstore-api-xxxx.onrender.com/api`

### Seed dữ liệu demo (chỉ lần đầu, DB trống)

Trên máy local (đã có `DATABASE_URL` production trong `backend/.env`):

```bash
cd backend
npx prisma migrate deploy
npm run db:seed
```

Hoặc Render → service API → **Shell** (plan trả phí) / chạy local trỏ `DATABASE_URL` production.

**Cảnh báo:** `db:seed` **xóa hết** dữ liệu cũ rồi nạp lại — chỉ chạy khi DB mới.

Tài khoản demo sau seed:

- Admin: `admin@bookstore.com` / `admin123`
- Khách: `customer@gmail.com` / `customer123`

---

## Bước 3 — Deploy Frontend (Next.js)

1. **New +** → **Web Service** → cùng repo.
2. Cấu hình:

| Mục | Giá trị |
|-----|---------|
| **Name** | `bookstore-web` |
| **Root Directory** | *(để trống — thư mục gốc repo)* |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

3. **Environment Variables**:

| Key | Giá trị |
|-----|---------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | `https://bookstore-api-xxxx.onrender.com/api` |

4. **Create Web Service** — đợi build.

---

## Bước 4 — Nối Frontend ↔ API (CORS)

1. Lấy URL frontend, ví dụ: `https://bookstore-web-xxxx.onrender.com`
2. Vào service **bookstore-api** → **Environment**:
   - Sửa `FRONTEND_URL` = URL frontend (không có `/` ở cuối).
3. **Save & redeploy** API.

---

## Bước 5 — Kiểm tra

1. Mở URL frontend → trang chủ, sách, đăng nhập.
2. Mở `https://...-api.../api/health` → `{"status":"ok",...}`.
3. Đăng nhập admin → `/admin`.

---

## Deploy bằng Blueprint (tuỳ chọn)

Repo có file `render.yaml`:

1. Dashboard → **New +** → **Blueprint**.
2. Chọn repo → sau khi tạo service, **sửa** env:
   - `FRONTEND_URL` → URL web thật
   - `NEXT_PUBLIC_API_URL` → URL API + `/api`
3. Redeploy cả hai service.

---

## Lưu ý Render Free

- Service **ngủ** sau ~15 phút không truy cập → lần mở đầu **chậm 30–60s**.
- Postgres free có giới hạn dung lượng / hết hạn sau 90 ngày (theo chính sách Render).
- `NEXT_PUBLIC_*` được nhúng lúc **build** — đổi URL API phải **Redeploy** frontend.

---

## Xử lý lỗi thường gặp

| Triệu chứng | Cách xử lý |
|-------------|------------|
| Frontend không gọi được API | Kiểm tra `NEXT_PUBLIC_API_URL` đúng `/api`, redeploy web |
| CORS / blocked | `FRONTEND_URL` khớp URL web (https, không slash cuối), redeploy API |
| 401 sau deploy | Token cũ — đăng nhập lại |
| Build API lỗi Prisma | Đảm bảo `DATABASE_URL` đúng, có `postinstall` generate |
| Migration failed | Chạy `npm run db:migrate:deploy` trong `backend` với `DATABASE_URL` production |

---

## Checklist nhanh

- [ ] Code trên GitHub
- [ ] `DATABASE_URL` (Neon hoặc Render Postgres)
- [ ] Web Service **backend** — migrate + start prod
- [ ] Web Service **frontend** — `NEXT_PUBLIC_API_URL`
- [ ] `FRONTEND_URL` trên API = URL frontend
- [ ] Seed DB (lần đầu)
- [ ] Test login + admin
