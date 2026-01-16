# JFinder - Tổng Quan Hệ Thống

## 📊 KIẾN TRÚC TỔNG THỂ

```
┌─────────────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js 15 App Router)               │
│                    http://localhost:3000                        │
│                                                                 │
│  Pages:                                                         │
│  • / (Home) - Landing page                                     │
│  • /search - Tìm kiếm mặt bằng (Smart Filters)                │
│  • /listing/[id] - Chi tiết tin đăng + Reviews                │
│  • /analysis - AI Analysis + ROI Calculator                    │
│  • /landlord - Dashboard chủ nhà + AI Valuation              │
│  • /dashboard - Thống kê thị trường 7 thành phố              │
│                                                                 │
│  Authentication: NextAuth.js (Google OAuth + Credentials)      │
│  Database ORM: Prisma (PostgreSQL)                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         │ lib/api.ts → N8N_BASE
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            BACKEND API (n8n Workflow Automation)                │
│                    http://localhost:5678/webhook                │
│                                                                 │
│  Endpoints:                                                     │
│  • GET  /listings        - Danh sách mặt bằng (with filters)  │
│  • GET  /stats           - Thống kê tổng hợp (by city/dist)   │
│  • GET  /districts       - Danh sách quận theo tỉnh           │
│  • POST /valuation       - AI Định giá (TensorFlow.js)        │
│  • POST /roi             - ROI Calculator                      │
│                                                                 │
│  Fallback: Client-side mock data nếu n8n offline              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               DATABASE (PostgreSQL + Prisma)                    │
│                    localhost:5432                               │
│                                                                 │
│  Tables:                                                        │
│  • User        - Người dùng (TENANT/LANDLORD/ADMIN)           │
│  • Listing     - Tin đăng mặt bằng (400 records)              │
│  • Review      - Đánh giá từ người thuê                       │
│  • Favorite    - Danh sách yêu thích                          │
│  • Account     - OAuth accounts (Google)                       │
│  • Session     - User sessions                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ TÍNH NĂNG CHÍNH

### 1. 🔍 Tìm Kiếm Thông Minh
-   **Bộ lọc đa chiều**: Thành phố, Quận/Huyện, Loại hình, Giá, Diện tích
-   **Dữ liệu phân bố**: 400 tin đăng rải đều 7 tỉnh/thành phố
-   **Hiển thị**: Grid cards với hình ảnh, giá, diện tích, AI score

### 2. 🤖 AI Valuation (Định Giá Thông Minh)
-   **Model**: TensorFlow.js Neural Network
-   **Input**: Quận, Diện tích, Mặt tiền, Số tầng, Loại hình
-   **Output**: Giá gợi ý, Khoảng giá (min-max), Potential Score, Risk Level
-   **Tích hợp**: n8n webhook với fallback client-side

### 3. 📊 ROI Calculator
-   **Tính toán**: Doanh thu, Chi phí, Lợi nhuận, Điểm hòa vốn
-   **Input**: Giá thuê, Giá sản phẩm, Số khách/ngày, Chi phí vận hành
-   **Use case**: Giúp tenant đánh giá khả năng sinh lời trước khi thuê

### 4. 📈 Dashboard Thị Trường
-   **Phạm vi**: 7 thành phố (HN, HCM, ĐN, CT, HP, BD, ĐN)
-   **Thống kê**: Tổng tin, Giá TB, Diện tích TB, Potential TB
-   **Biểu đồ**: Phân bố theo khu vực, Phân bố theo loại hình
-   **Bộ lọc động**: City/District selector (load từ API)

### 5. 🏠 Landlord Dashboard
-   **Quản lý tin đăng**: Xem, Sửa, Xóa listings
-   **KPIs**: Tổng tin, Lượt xem, Giá TB
-   **AI Valuation Tool**: Định giá nhanh cho chủ nhà

### 6. 🔐 Authentication & Authorization
-   **NextAuth.js**: Google OAuth + Email/Password
-   **Role-based Access**: TENANT, LANDLORD, ADMIN
-   **Protected Routes**: `/landlord`, `/admin`

---

## 🗂️ CẤU TRÚC DỮ LIỆU

### Prisma Schema (Database)
```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  name     String?
  role     Role     @default(TENANT)
  listings Listing[]
  reviews  Review[]
  favorites Favorite[]
}

model Listing {
  id          String   @id @default(cuid())
  name        String   // "Mặt bằng [District] - [Type]"
  city        String?
  province    String?
  district    String
  address     String?
  price       Float    // Triệu/tháng
  area        Float    // m²
  type        String   // shophouse, office, retail, kiosk
  images      String[]
  views       Int      @default(0)
  landlordId  String
  landlord    User     @relation(...)
  reviews     Review[]
}
```

### Mock Data Generation
-   **Script**: `generate_multicity_data.js`
-   **Quota**: 100 HN, 100 HCM, 40 mỗi tỉnh còn lại (total 400)
-   **Shuffle**: Xáo trộn ngẫu nhiên để tránh gom cụm theo thành phố
-   **Naming**: "Mặt bằng [Quận] - [Loại hình]"

---

## 🔄 DATA FLOW

### Luồng Tìm Kiếm
```
User → /search
  → Select filters (city, district, type, price)
  → Click "Tìm Kiếm"
  → fetchListings({ city, district, type, maxPrice })
  → Try: GET ${N8N_BASE}/listings?...
  → Fallback: Filter mockListings.json
  → Display results in Grid
```

### Luồng Định Giá AI
```
User → /landlord
  → Enter: district, area, frontage, floors, type
  → Click "Định Giá Ngay"
  → getValuation({ district, area, ... })
  → Try: POST ${N8N_BASE}/valuation
  → Fallback: predictPrice() (TensorFlow.js)
  → Display: suggestedPrice, priceRange, potentialScore
```

### Luồng Dashboard Stats
```
User → /dashboard
  → Select city/district filter
  → fetchStats({ city, district })
  → Try: GET ${N8N_BASE}/stats?city=...
  → Fallback: calculateStatsFromData(mockListings)
  → Display: Charts (byDistrict, byType)
```

---

## 🛠️ TECH STACK

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 (App Router) | React framework với SSR/SSG |
| **Styling** | TailwindCSS | Utility-first CSS |
| **Database** | PostgreSQL | Relational database |
| **ORM** | Prisma | Type-safe database client |
| **Auth** | NextAuth.js | Authentication & sessions |
| **Backend** | n8n | Workflow automation & API |
| **AI/ML** | TensorFlow.js | Client-side ML model |
| **DevOps** | Docker Compose | Container orchestration |

---

## 📡 API ENDPOINTS (n8n)

| Method | Endpoint | Description | Fallback |
|--------|----------|-------------|----------|
| GET | `/listings` | Fetch listings with filters | mockListings.json |
| GET | `/stats` | Market statistics | calculateStatsFromData() |
| GET | `/districts` | Districts by province | lib/districts.ts |
| POST | `/valuation` | AI price prediction | predictPrice() (TF.js) |
| POST | `/roi` | ROI calculation | Client-side formula |

---

## 🚀 DEPLOYMENT CHECKLIST

- [x] Database schema (Prisma)
- [x] Mock data generation (400 listings)
- [x] n8n workflow setup
- [x] Authentication (Google OAuth)
- [x] Role-based access control
- [x] AI Valuation (TensorFlow.js)
- [x] Dashboard với 7 cities
- [x] Responsive UI (Mobile-friendly)
- [ ] Production deployment (Vercel/Railway)
- [ ] Real data integration (API thực tế)

---

**Last Updated**: 2026-01-16  
**Version**: 3.0 (n8n Integration Complete)
