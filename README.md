# JFinder - Smart Rental Decision Support System 🏢✨

Hệ thống hỗ trợ quyết định tìm kiếm mặt bằng cho thuê thông minh, tích hợp **n8n** làm Backend API và **Next.js** làm Frontend.

---

## 🎯 Mục tiêu

Chuyển đổi từ **"Tìm kiếm thụ động"** sang **"Tư vấn chủ động"**:
- Trả lời câu hỏi: *"Tại sao tôi nên thuê chỗ này?"* thay vì chỉ *"Chỗ này giá bao nhiêu?"*
- Kết hợp **BI (Business Intelligence)**, **Geo-marketing** và **AI định giá**

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                   │
│         localhost:3000 - Web Portal / Dashboard         │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP API Calls
                            ▼
┌─────────────────────────────────────────────────────────┐
│               BACKEND API (n8n Automation)              │
│   localhost:5678/webhook/* - REST API Endpoints         │
│   • /listings - Danh sách mặt bằng                      │
│   • /stats - Thống kê thị trường                        │
│   • /districts - Danh sách quận                         │
│   • /valuation - AI Định giá                            │
│   • /roi - Tính ROI/Break-even                          │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Tính năng đã triển khai (theo đề cương)

| Chức năng | Mô tả | Trạng thái |
|-----------|-------|------------|
| **Heatmap (Bản đồ nhiệt)** | Hiển thị mật độ giá/tiềm năng trên bản đồ | ✅ |
| **Lọc nâng cao** | Theo quận, loại, khoảng giá | ✅ |
| **AI Định giá (Valuation)** | Gợi ý giá thuê hợp lý, nhãn "Rẻ/Đắt" | ✅ |
| **ROI Calculator** | Tính break-even point | ✅ |
| **Dashboard BI** | Thống kê theo quận, loại mặt bằng | ✅ |
| **Landlord Portal** | Gợi ý giá cho chủ nhà | ✅ |
| **n8n Backend** | API tự động hóa, không cần code | ✅ |

---

## 🚀 Cài đặt & Chạy

### 1. Yêu cầu
- Node.js 18+
- Docker Desktop

### 2. Khởi động Backend (n8n)
```bash
docker-compose up -d
```
Truy cập: `http://localhost:5678` (admin/admin)

### 3. Import Workflow
1. Mở n8n → Menu → Import from File
2. Chọn file `n8n_backend.json`
3. **Bật workflow** (Toggle ON)

### 4. Chạy Frontend
```bash
npm install
npm run dev
```
Truy cập: `http://localhost:3000`

---

## 📁 Cấu trúc dự án

```
grp3_mbtt/
├── app/                    # Next.js Pages
│   ├── page.tsx           # Home
│   ├── map/               # Bản đồ + Lọc
│   ├── dashboard/         # Dashboard BI
│   ├── analysis/          # Phân tích AI
│   └── landlord/          # Portal chủ nhà
├── components/            # React Components
│   ├── Map/               # Heatmap
│   └── Analysis/          # Valuation Card
├── lib/
│   └── api.ts             # API Helper (gọi n8n)
├── n8n_backend.json       # Workflow n8n chính
├── docker-compose.yml     # Cấu hình Docker (n8n)
└── README.md
```

---

## 🔌 API Endpoints (n8n)

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/webhook/listings` | GET | Lấy danh sách mặt bằng |
| `/webhook/stats` | GET | Thống kê tổng hợp |
| `/webhook/districts` | GET | Danh sách quận + giá TB |
| `/webhook/valuation` | POST | AI định giá |
| `/webhook/roi` | POST | Tính ROI |

---

## 👥 Đối tượng sử dụng

1. **Người thuê**: Tìm mặt bằng, xem phân tích tiềm năng
2. **Chủ cho thuê**: Định giá tài sản
3. **Quản trị viên**: Xem Dashboard, phân tích xu hướng

---

**Developed by Group 3 - MBTT @ Đại học Thủy Lợi**
