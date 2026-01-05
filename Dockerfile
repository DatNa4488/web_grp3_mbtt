# Sử dụng Node.js image nhẹ
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file định nghĩa package trước để tận dụng cache
COPY package*.json ./

# Cài đặt dependencies (dùng --legacy-peer-deps để tránh lỗi conflict version nếu có)
RUN npm install --legacy-peer-deps

# Copy toàn bộ mã nguồn vào image
COPY . .

# Build ứng dụng Next.js (Production build)
RUN npm run build

# Mở port 3000
EXPOSE 3000

# Lệnh chạy ứng dụng
CMD ["npm", "start"]
