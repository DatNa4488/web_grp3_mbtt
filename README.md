# JFinder - Hệ Thống Hỗ Trợ Quyết Định Thuê Mặt Bằng Kinh Doanh 🏢

**JFinder** là nền tảng Bất động sản thương mại (Commercial Real Estate) thế hệ mới, tích hợp **Big Data** và **AI (Trí tuệ nhân tạo)** để giúp chủ doanh nghiệp tìm kiếm, đánh giá và định giá mặt bằng kinh doanh chính xác nhất.

![JFinder Dashboard](/app/opengraph-image.png)

---

## 🌟 Tính Năng Nổi Bật

### 1. 🤖 Định Giá AI (AI Valuation)
-   Sử dụng mô hình **Deep Learning (TensorFlow.js)** kết hợp với logic thị trường để dự báo giá thuê hợp lý.
-   Phân tích dựa trên: Vị trí (Quận/Huyện), Diện tích, Mặt tiền, Số tầng.
-   Tích hợp qua **n8n Webhook** để xử lý tính toán.

### 2. 📊 Phân Tích ROI (ROI Calculator)
-   Công cụ tính toán **Lợi nhuận đầu tư (ROI)** và **Điểm hòa vốn** tự động.
-   Giúp người thuê ước tính doanh thu, chi phí vận hành và lợi nhuận ròng trước khi xuống tiền.

### 3. 🗺️ Dashboard Thị Trường (Real-time)
-   Thống kê trực quan về thị trường BĐS tại 7 thành phố lớn (Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ, Hải Phòng, Bình Dương, Đồng Nai).
-   Biểu đồ phân bố giá, diện tích và loại hình (Shophouse, Office, Retail...).
-   Dữ liệu được cập nhật động từ API.

### 4. 🏙️ Tìm Kiếm Thông Minh
-   Bộ lọc chi tiết: Thành phố, Quận/Huyện, Mức giá, Diện tích.
-   Hiển thị trực quan với bản đồ và hình ảnh thực tế.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

-   **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), React, TailwindCSS.
-   **Backend / API**: [n8n](https://n8n.io/) (Workflow Automation), Next.js Server Actions.
-   **Database**: PostgreSQL (với PostGIS cho bản đồ).
-   **AI/ML**: TensorFlow.js, Neural Networks.
-   **DevOps**: Docker, Docker Compose.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Yêu cầu hệ thống
-   **Node.js** (v18+)
-   **Docker Desktop** (Để chạy PostgreSQL & n8n)
-   **Git**

### 2. Cài đặt Source Code

B1. Clone dự án:
```bash
git clone https://github.com/jian131/grp3_mbtt.git
cd grp3_mbtt
```

B2. Cài đặt thư viện:
```bash
npm install
```

### 3. Cấu hình Môi trường (.env)

Copy file mẫu và cấu hình:
```bash
cp .env.example .env
```
*Lưu ý: Nếu bạn chạy n8n trên server riêng, hãy cập nhật `NEXT_PUBLIC_N8N_URL` trong file `.env`.*

### 4. Khởi chạy Database & Services (Docker)

```bash
docker-compose up -d
```
*Lệnh này sẽ bật PostgreSQL, n8n và các dịch vụ phụ trợ.*

### 5. Khởi tạo Dữ liệu (Quan trọng)

Để app hoạt động đúng, bạn cần làm các bước sau:

**B1. Tạo bảng Database:**
```bash
npx prisma db push
```

**B2. Sinh dữ liệu giả lập (Mock Data):**
Script này sẽ tạo 400 tin đăng rải đều 7 thành phố và xáo trộn ngẫu nhiên.
```bash
node generate_multicity_data.js
```

**B3. Nạp dữ liệu vào Database:**
```bash
npx prisma db seed
```

### 6. Khởi chạy Ứng dụng Web

```bash
npm run dev
```
Truy cập: **http://localhost:3000**

---

## 🔌 Cấu Hình n8n (Workflow Integration)

Dự án sử dụng **n8n** làm Backend xử lý Logic. Bạn cần Import workflow vào n8n:

1.  Truy cập n8n: `http://localhost:5678`
2.  Tạo mới Workflow.
3.  Copy nội dung file `n8n/workflow.json` (nếu có) hoặc tự cấu hình các node:
    -   `POST /valuation`
    -   `POST /roi`
    -   `GET /districts`
    -   `GET /listings`
    -   `GET /stats`

---

## ⚠️ Troubleshooting (Lỗi thường gặp)

**1. Không thấy dữ liệu Quận/Huyện trên Dashboard?**
-   Kiểm tra n8n đã chạy chưa (`docker ps`).
-   Kiểm tra `NEXT_PUBLIC_N8N_URL` trong `.env`.
-   Nếu n8n chết, hệ thống sẽ tự dùng dữ liệu backup (nhưng cần reload trang).

**2. Lỗi `PrismaClientInitializationError`?**
-   Database chưa sẵn sàng. Hãy đợi 1-2 phút sau khi chạy `docker-compose up`.

**3. Ảnh không hiển thị?**
-   Chạy script tải ảnh mẫu: `npx ts-node scripts/setupLocalImages.ts` (nếu có) hoặc kiểm tra folder `public/mock`.

---

**© 2026 JFinder Team - Capstone Project**
