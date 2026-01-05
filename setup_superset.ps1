# Script tự động cấu hình Superset sau khi container đã khởi động
# Chờ Superset sẵn sàng trước khi chạy script này (khoảng 2-3 phút sau khi docker up)

Write-Host "Dang cau hinh Superset... Vui long doi..." -ForegroundColor Cyan

# 1. Tạo tài khoản Admin
Write-Host "1. Tao tai khoan Admin (user: admin / pass: admin)..."
docker exec -it grp3_mbtt-superset-1 superset fab create-admin --username admin --firstname Superset --lastname Admin --email admin@jfinder.com --password admin

# 2. Nâng cấp Database
Write-Host "2. Nang cap Database (DB Upgrade)..."
docker exec -it grp3_mbtt-superset-1 superset db upgrade

# 3. Khởi tạo quyền và roles
Write-Host "3. Khoi tao quyen (Init)..."
docker exec -it grp3_mbtt-superset-1 superset init

Write-Host " "
Write-Host "==========================================" -ForegroundColor Green
Write-Host "CAU HINH HOAN TAT!" -ForegroundColor Green
Write-Host "Truy cap Superset tai: http://localhost:8088" -ForegroundColor Yellow
Write-Host "User: admin" -ForegroundColor Yellow
Write-Host "Pass: admin" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Green
