# JFinder - Hướng Dẫn Cài Đặt Chi Tiết

## 📋 YÊU CẦU HỆ THỐNG

Trước khi bắt đầu, đảm bảo máy của bạn đã cài đặt:

-   **Node.js** v18+ ([Download](https://nodejs.org/))
-   **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
-   **Git** ([Download](https://git-scm.com/))

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT

### Bước 1: Clone Repository

```bash
git clone https://github.com/jian131/grp3_mbtt.git
cd grp3_mbtt
```

### Bước 2: Cài Đặt Dependencies

```bash
npm install
```

*Thời gian: 2-3 phút tùy tốc độ mạng*

### Bước 3: Cấu Hình Môi Trường (.env)

Copy file mẫu:

**Windows (Command Prompt):**
```cmd
copy .env.example .env
```

**Windows (PowerShell) / Mac / Linux:**
```bash
cp .env.example .env
```

**Nội dung file `.env` mặc định:**
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jfinder"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# n8n Backend
NEXT_PUBLIC_N8N_URL="http://localhost:5678/webhook"
```

> **Lưu ý**: Nếu bạn muốn dùng Google Login, cần tạo OAuth credentials tại [Google Cloud Console](https://console.cloud.google.com/).

### Bước 4: Khởi Chạy Docker Services

Mở **Docker Desktop**, sau đó chạy:

```bash
docker-compose up -d
```

Lệnh này sẽ khởi động:
-   **PostgreSQL** (Database) - Port 5432
-   **n8n** (Workflow Automation) - Port 5678

Kiểm tra trạng thái:
```bash
docker ps
```

Đảm bảo tất cả containers đều **Running** (màu xanh).

### Bước 5: Khởi Tạo Database

**5.1. Tạo Schema (Tables):**
```bash
npx prisma db push
```

**5.2. Sinh Dữ Liệu Mẫu (400 listings):**
```bash
node generate_multicity_data.js
```

Script này sẽ tạo:
-   100 tin đăng tại **Hà Nội**
-   100 tin đăng tại **TP.HCM**
-   40 tin đăng mỗi tỉnh: **Đà Nẵng, Cần Thơ, Hải Phòng, Bình Dương, Đồng Nai**
-   Dữ liệu được **xáo trộn ngẫu nhiên** để tránh gom cụm

**5.3. Nạp Dữ Liệu vào Database:**
```bash
npx prisma db seed
```

### Bước 6: Cấu Hình n8n Workflow (Quan trọng)

1.  Truy cập n8n: **http://localhost:5678**
2.  Tạo tài khoản admin (lần đầu)
3.  Import workflow từ file `n8n/workflow.json` (nếu có) hoặc tự tạo các endpoint:
    -   `GET /webhook/listings`
    -   `GET /webhook/stats`
    -   `GET /webhook/districts`
    -   `POST /webhook/valuation`
    -   `POST /webhook/roi`

> **Fallback**: Nếu n8n chưa cấu hình, app vẫn hoạt động với dữ liệu mock nội bộ.

### Bước 7: Khởi Chạy Ứng Dụng

```bash
npm run dev
```

Truy cập: **http://localhost:3000**

---

## ✅ KIỂM TRA CÀI ĐẶT

Sau khi chạy `npm run dev`, kiểm tra các trang sau:

| Trang | URL | Kiểm tra |
|-------|-----|----------|
| **Home** | http://localhost:3000 | Landing page hiển thị đúng |
| **Search** | http://localhost:3000/search | Có dữ liệu 400 listings |
| **Dashboard** | http://localhost:3000/dashboard | Biểu đồ hiển thị 7 thành phố |
| **Landlord** | http://localhost:3000/landlord | Cần đăng nhập (role: LANDLORD) |

---

## ⚠️ TROUBLESHOOTING

### 1. Lỗi `Can't reach database server`

**Nguyên nhân**: Docker chưa chạy hoặc port 5432 bị chiếm.

**Khắc phục**:
```bash
# Kiểm tra Docker
docker ps

# Restart Docker services
docker-compose restart
```

### 2. Lỗi `Port 5432 already allocated`

**Nguyên nhân**: PostgreSQL khác đang chạy.

**Khắc phục**:
-   Tắt PostgreSQL cũ
-   Hoặc sửa port trong `docker-compose.yml`:
    ```yaml
    ports:
      - "5433:5432"  # Đổi từ 5432 thành 5433
    ```
-   Cập nhật `DATABASE_URL` trong `.env`:
    ```env
    DATABASE_URL="postgresql://postgres:postgres@localhost:5433/jfinder"
    ```

### 3. Dashboard không hiển thị dữ liệu đủ 7 thành phố

**Nguyên nhân**: Chưa chạy script sinh dữ liệu mới.

**Khắc phục**:
```bash
node generate_multicity_data.js
npx prisma db seed
```

### 4. Lỗi Google Login

**Nguyên nhân**: Chưa cấu hình `GOOGLE_CLIENT_ID`.

**Khắc phục**:
1.  Vào [Google Cloud Console](https://console.cloud.google.com/)
2.  Tạo OAuth 2.0 Client ID
3.  Thêm Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4.  Copy Client ID và Secret vào `.env`

### 5. n8n không hoạt động

**Kiểm tra**:
```bash
docker logs grp3_mbtt-n8n-1
```

**Khắc phục**:
-   Đảm bảo port 5678 không bị chiếm
-   Restart container: `docker-compose restart n8n`

---

## 🔧 LỆNH HỮU ÍCH

```bash
# Xem logs Docker
docker-compose logs -f

# Restart tất cả services
docker-compose restart

# Dừng tất cả services
docker-compose down

# Xóa database và tạo lại
npx prisma db push --force-reset

# Mở Prisma Studio (GUI quản lý database)
npx prisma studio

# Build production
npm run build
npm start
```

---

## 📚 TÀI LIỆU THAM KHẢO

-   **Prisma Docs**: https://www.prisma.io/docs
-   **Next.js Docs**: https://nextjs.org/docs
-   **n8n Docs**: https://docs.n8n.io
-   **NextAuth.js**: https://next-auth.js.org

---

**© 2026 JFinder Team**
