# JFinder - Hướng Dẫn Deploy Production

Tài liệu này hướng dẫn cách deploy dự án **JFinder** lên môi trường Production **HOÀN TOÀN MIỄN PHÍ**.

---

## 📋 TỔNG QUAN

Dự án JFinder bao gồm 3 thành phần:

1.  **Frontend + Backend (Next.js)** → **Vercel** (Free)
2.  **Database (PostgreSQL)** → **Railway** (Free $5/month credit)
3.  **n8n Workflow** → **Railway** (Free)

---

## 🚀 HƯỚNG DẪN DEPLOY (100% MIỄN PHÍ)

### BƯỚC 1: Chuẩn bị Code

```bash
# Đảm bảo code đã commit
git add .
git commit -m "Ready for production"
git push origin main
```

---

### BƯỚC 2: Deploy Database (Railway)

#### 2.1. Tạo Railway Account

1.  Truy cập [Railway.app](https://railway.app/)
2.  Click **"Start a New Project"**
3.  Đăng nhập bằng GitHub

#### 2.2. Tạo PostgreSQL Database

1.  Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2.  Đợi Railway tạo database (khoảng 30 giây)
3.  Click vào **PostgreSQL service** vừa tạo
4.  Vào tab **"Variables"**
5.  Copy giá trị của biến **`DATABASE_URL`**
    ```
    postgresql://postgres:password@region.railway.app:5432/railway
    ```
6.  **LƯU LẠI** connection string này để dùng cho Vercel

---

### BƯỚC 3: Deploy Next.js (Vercel)

#### 3.1. Import Project

1.  Truy cập [Vercel.com](https://vercel.com/)
2.  Click **"Add New..."** → **"Project"**
3.  Import repository `grp3_mbtt` từ GitHub
4.  **KHÔNG** click Deploy ngay, làm tiếp bước 3.2

#### 3.2. Cấu hình Environment Variables

Thêm các biến môi trường sau:

```env
# Database (từ Railway)
DATABASE_URL=postgresql://postgres:xxxxx@region.railway.app:5432/railway

# NextAuth
NEXTAUTH_SECRET=your-random-32-character-string
NEXTAUTH_URL=https://your-app-name.vercel.app

# Google OAuth (Tùy chọn)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# n8n (Sẽ cập nhật sau ở Bước 4)
NEXT_PUBLIC_N8N_URL=https://your-n8n.up.railway.app/webhook
```

**Tạo NEXTAUTH_SECRET**:
```bash
# Chạy lệnh này để tạo random string
openssl rand -base64 32
```

#### 3.3. Deploy

1.  Click **"Deploy"**
2.  Đợi build xong (2-3 phút)
3.  Copy **Production URL** (ví dụ: `https://jfinder.vercel.app`)

---

### BƯỚC 4: Khởi tạo Database

#### 4.1. Cài Vercel CLI

```bash
npm install -g vercel
vercel login
```

#### 4.2. Link Project

```bash
cd d:\grp3_mbtt
vercel link
```

#### 4.3. Pull Environment Variables

```bash
vercel env pull .env.production
```

#### 4.4. Chạy Migration & Seed

```bash
# Tạo bảng
npx prisma db push

# Sinh dữ liệu mẫu (400 listings)
node generate_multicity_data.js

# Nạp vào database
npx prisma db seed
```

---

### BƯỚC 5: Deploy n8n (Railway)

#### 5.1. Tạo n8n Service

1.  Quay lại **Railway Dashboard**
2.  Click **"+ New"** → **"Empty Service"**
3.  Đặt tên: `n8n`
4.  Vào tab **"Settings"**
5.  Chọn **"Deploy from GitHub repo"**
6.  Hoặc dùng **Docker Image**: `n8nio/n8n:latest`

#### 5.2. Cấu hình n8n

Vào tab **"Variables"**, thêm:

```env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-strong-password
WEBHOOK_URL=https://your-n8n.up.railway.app
```

#### 5.3. Generate Public Domain

1.  Vào tab **"Settings"**
2.  Scroll xuống **"Networking"**
3.  Click **"Generate Domain"**
4.  Copy URL (ví dụ: `https://n8n-production.up.railway.app`)

#### 5.4. Cập nhật Vercel

1.  Quay lại **Vercel Dashboard**
2.  Vào **Settings** → **Environment Variables**
3.  Sửa `NEXT_PUBLIC_N8N_URL`:
    ```
    https://n8n-production.up.railway.app/webhook
    ```
4.  Click **"Redeploy"** để áp dụng

---

### BƯỚC 6: Cấu hình Google OAuth (Tùy chọn)

#### 6.1. Tạo OAuth Credentials

1.  Vào [Google Cloud Console](https://console.cloud.google.com/)
2.  Tạo project mới hoặc chọn project có sẵn
3.  Vào **APIs & Services** → **Credentials**
4.  Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
5.  Application type: **Web application**
6.  Thêm **Authorized redirect URIs**:
    ```
    https://your-app.vercel.app/api/auth/callback/google
    ```
7.  Copy **Client ID** và **Client Secret**

#### 6.2. Cập nhật Vercel

Thêm vào Environment Variables:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
```

Redeploy lại app.

---

## ✅ KIỂM TRA SAU KHI DEPLOY

### Checklist

-   [ ] Truy cập được `https://your-app.vercel.app`
-   [ ] Trang chủ hiển thị đúng
-   [ ] `/search` có dữ liệu (400 listings)
-   [ ] `/dashboard` hiển thị biểu đồ
-   [ ] `/map` hiển thị bản đồ
-   [ ] Đăng nhập Google hoạt động (nếu đã cấu hình)
-   [ ] n8n truy cập được (hoặc app dùng fallback)

### Debug Commands

```bash
# Xem logs Vercel
vercel logs --follow

# Xem logs Railway
railway logs

# Test database connection
npx prisma studio
```

---

## 💰 CHI PHÍ (MIỄN PHÍ)

| Service | Free Tier | Giới hạn |
|---------|-----------|----------|
| **Vercel** | ✅ Free | 100GB bandwidth/tháng |
| **Railway** | ✅ $5 credit/tháng | Đủ cho DB + n8n nhỏ |
| **Google OAuth** | ✅ Free | Unlimited |

**Tổng chi phí**: **$0/tháng** (trong giới hạn free tier)

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Railway Credit

Railway cho **$5 credit miễn phí mỗi tháng**. Nếu hết credit:
-   Dừng n8n service (app vẫn chạy với fallback)
-   Hoặc nâng cấp lên Pro ($5/tháng)

### 2. Database Backup

Railway **KHÔNG** tự động backup. Nên:
```bash
# Export database định kỳ
pg_dump $DATABASE_URL > backup.sql
```

### 3. n8n Fallback

App đã được thiết kế để hoạt động ngay cả khi n8n offline. Tất cả tính năng sẽ dùng logic nội bộ.

---

## 🔧 TROUBLESHOOTING

### Lỗi: "Can't reach database server"

**Nguyên nhân**: Railway database chưa sẵn sàng hoặc `DATABASE_URL` sai.

**Khắc phục**:
1.  Kiểm tra Railway dashboard, đảm bảo PostgreSQL đang chạy
2.  Copy lại `DATABASE_URL` từ Railway
3.  Cập nhật lại trên Vercel

### Lỗi: Build timeout trên Vercel

**Khắc phục**: Tạo file `vercel.json`:
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": { "maxDuration": 60 }
    }
  ]
}
```

### n8n không truy cập được

**Khắc phục**:
1.  Kiểm tra Railway logs: `railway logs`
2.  Đảm bảo đã generate public domain
3.  Thử truy cập trực tiếp: `https://your-n8n.up.railway.app`

---

## 📚 TÀI LIỆU THAM KHẢO

-   [Vercel Docs](https://vercel.com/docs)
-   [Railway Docs](https://docs.railway.app/)
-   [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
-   [NextAuth.js](https://next-auth.js.org/deployment)

---

**© 2026 JFinder Team - Deploy 100% Miễn Phí**
