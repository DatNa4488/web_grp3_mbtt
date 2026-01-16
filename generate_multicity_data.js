
const fs = require('fs');
const path = require('path');

// 1. Data Definitions
// 1. Data Definitions with Precise Centers
const PROVINCES_DATA = {
    "Thành phố Hồ Chí Minh": {
        districts: {
            "Quận 1": { lat: 10.7769, lon: 106.7009, streets: ["Nguyễn Huệ", "Lê Lợi", "Pasteur", "Đồng Khởi", "Lê Thánh Tôn", "Hai Bà Trưng", "Mạc Đĩnh Chi"] },
            "Quận 3": { lat: 10.7844, lon: 106.6843, streets: ["Võ Văn Tần", "Trương Định", "Nguyễn Đình Chiểu", "Nam Kỳ Khởi Nghĩa", "Cao Thắng", "Lê Văn Sỹ"] },
            "Quận 4": { lat: 10.7578, lon: 106.7072, streets: ["Hoàng Diệu", "Khánh Hội", "Tôn Đản", "Đoàn Văn Bơ"] },
            "Quận 5": { lat: 10.7538, lon: 106.6634, streets: ["Nguyễn Trãi", "Trần Hưng Đạo", "Hùng Vương", "An Dương Vương"] },
            "Quận 7": { lat: 10.7327, lon: 106.7161, streets: ["Nguyễn Văn Linh", "Huỳnh Tấn Phát", "Nguyễn Thị Thập", "Lê Văn Lương"] },
            "Thành phố Thủ Đức": { lat: 10.8231, lon: 106.7747, streets: ["Võ Văn Ngân", "Đặng Văn Bi", "Kha Vạn Cân", "Phạm Văn Đồng", "Thảo Điền", "Song Hành"] },
            "Quận Bình Thạnh": { lat: 10.8106, lon: 106.7091, streets: ["Điện Biên Phủ", "Xô Viết Nghệ Tĩnh", "Phan Đăng Lưu", "Nơ Trang Long"] }
        }
    },
    "Thành phố Hà Nội": {
        districts: {
            "Quận Hoàn Kiếm": { lat: 21.0285, lon: 105.8542, streets: ["Phố Huế", "Hàng Bài", "Tràng Tiền", "Đinh Tiên Hoàng", "Lý Thái Tổ"] },
            "Quận Ba Đình": { lat: 21.0341, lon: 105.8291, streets: ["Kim Mã", "Đội Cấn", "Liễu Giai", "Hoàng Diệu", "Phan Đình Phùng"] },
            "Quận Đống Đa": { lat: 21.0152, lon: 105.8247, streets: ["Chùa Bộc", "Thái Hà", "Nguyễn Lương Bằng", "Tôn Đức Thắng", "Xã Đàn"] },
            "Quận Cầu Giấy": { lat: 21.0366, lon: 105.7932, streets: ["Cầu Giấy", "Xuân Thủy", "Trần Thái Tông", "Duy Tân", "Hồ Tùng Mậu"] },
            "Quận Tây Hồ": { lat: 21.0624, lon: 105.8126, streets: ["Lạc Long Quân", "Xuân Diệu", "u Cơ", "Trích Sài"] },
            "Quận Hai Bà Trưng": { lat: 21.0090, lon: 105.8569, streets: ["Bà Triệu", "Phố Huế", "Đại Cồ Việt", "Lò Đúc", "Minh Khai"] }
        }
    },
    "Thành phố Đà Nẵng": {
        districts: {
            "Quận Hải Châu": { lat: 16.0600, lon: 108.2200, streets: ["Bạch Đằng", "Lê Duẩn", "Nguyễn Văn Linh", "Hùng Vương"] },
            "Quận Sơn Trà": { lat: 16.1000, lon: 108.2400, streets: ["Phạm Văn Đồng", "Võ Nguyên Giáp", "Ngô Quyền"] },
            "Quận Thanh Khê": { lat: 16.0600, lon: 108.1800, streets: ["Điện Biên Phủ", "Nguyễn Tất Thành", "Hà Huy Tập"] }
        }
    },
    "Thành phố Cần Thơ": {
        districts: {
            "Quận Ninh Kiều": { lat: 10.0371, lon: 105.7882, streets: ["Đại lộ Hòa Bình", "30 Tháng 4", "Mậu Thân", "Nguyễn Trãi"] },
            "Quận Cái Răng": { lat: 10.0086, lon: 105.7958, streets: ["Phạm Hùng", "Quang Trung", "Võ Nguyên Giáp"] }
        }
    },
    "Thành phố Hải Phòng": {
        districts: {
            "Quận Hồng Bàng": { lat: 20.8651, lon: 106.6715, streets: ["Điện Biên Phủ", "Minh Khai", "Lê Đại Hành"] },
            "Quận Ngô Quyền": { lat: 20.8602, lon: 106.6917, streets: ["Lạch Tray", "Cầu Đất", "Lê Lợi"] }
        }
    },
    "Tỉnh Bình Dương": {
        districts: {
            "Thành phố Thủ Dầu Một": { lat: 10.9805, lon: 106.6519, streets: ["Đại lộ Bình Dương", "Yersin", "Cách Mạng Tháng 8"] },
            "Thành phố Thuận An": { lat: 10.9248, lon: 106.6976, streets: ["DT743", "Nguyễn Trãi", "Lái Thiêu"] }
        }
    },
    "Tỉnh Đồng Nai": {
        districts: {
            "Thành phố Biên Hòa": { lat: 10.9574, lon: 106.8427, streets: ["Phạm Văn Thuận", "Nguyễn Ái Quốc", "Đồng Khởi", "Võ Thị Sáu"] }
        }
    }
};

const BUSINESS_PREFIXES = {
    "shophouse": ["Shop thời trang", "Cửa hàng tiện lợi", "Showroom mỹ phẩm", "Tiệm bánh cao cấp", "Nhà hàng Nhật Bản", "Quán Cafe Acoustic"],
    "office": ["Văn phòng Luật sư", "Văn phòng Startup", "Trụ sở công ty Tech", "Co-working Space", "Văn phòng đại diện", "Studio thiết kế"],
    "retail": ["Siêu thị mini", "Shop quần áo", "Cửa hàng điện thoại", "Showroom nội thất", "Spa & Clinic", "Phòng khám nha khoa"],
    "kiosk": ["Kiosk trà sữa", "Quầy thuốc tây", "Sạp hàng khô", "Kiosk ăn vặt"]
};

// Fallback streets if district not found
const GENERIC_STREETS = ["Đường Chính", "Đường Số 1", "Đại Lộ Hùng Vương", "Đường Lê Lợi", "Đường Trần Phú"];

const TYPES = ["shophouse", "office", "retail", "kiosk"];
const OWNERS = [
    { name: "Nguyễn Văn A", phone: "0901234567" },
    { name: "Trần Thị B", phone: "0912345678" }
];
const IMAGES = [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
];

function randomFloat(min, max) { return Math.random() * (max - min) + min; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateListing(id, provinceName) {
    const provinceInfo = PROVINCES_DATA[provinceName];
    // Simple fallback for unspecified provinces
    if (!provinceInfo) {
        return {
            id: `MB${String(id).padStart(4, '0')}`,
            name: `Mặt bằng kinh doanh - Trung tâm ${provinceName}`,
            address: `Số ${randomInt(1, 200)} Đường Trần Phú`,
            city: provinceName,
            province: provinceName,
            district: "Thành phố",
            latitude: 16.0, longitude: 108.0,
            price: 50, area: 100, frontage: 5, floors: 1, type: "retail",
            images: [randomChoice(IMAGES)], owner: OWNERS[0],
            ai: { suggestedPrice: 50, potentialScore: 80, riskLevel: "low", priceLabel: "fair" },
            views: 100, postedAt: new Date().toISOString()
        };
    }

    let district, lat, lon, street;

    // Check if we have specific district data
    if (provinceInfo.districts && !Array.isArray(provinceInfo.districts)) {
        district = randomChoice(Object.keys(provinceInfo.districts));
        const districtData = provinceInfo.districts[district];
        lat = districtData.lat + randomFloat(-0.015, 0.015);
        lon = districtData.lon + randomFloat(-0.015, 0.015);
        street = districtData.streets ? randomChoice(districtData.streets) : randomChoice(GENERIC_STREETS);
    } else {
        // Fallback for array format or missing data
        district = randomChoice(provinceInfo.districts || ["Quận Trung Tâm"]);
        lat = (provinceInfo.lat || 21.0) + randomFloat(-0.05, 0.05);
        lon = (provinceInfo.lon || 105.0) + randomFloat(-0.05, 0.05);
        street = randomChoice(GENERIC_STREETS);
    }

    const type = randomChoice(TYPES);
    const owner = randomChoice(OWNERS);
    const area = randomInt(30, 300);
    const price = Math.round(area * randomFloat(0.3, 0.8)); // Price algo

    // Generate realistic name
    // Generate name as requested: "Mặt bằng [District] - [Type]"
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    const name = `Mặt bằng ${district} - ${capitalizedType}`;

    return {
        id: `MB${String(id).padStart(4, '0')}`,
        name: name,
        address: `Số ${randomInt(1, 300)} ${street}, P. ${randomInt(1, 15)}`,
        city: provinceName,
        province: provinceName,
        district: district,
        latitude: lat,
        longitude: lon,
        price: price,
        area: area,
        frontage: parseFloat(randomFloat(4, 10).toFixed(1)),
        floors: randomInt(1, 4),
        type: type,
        images: [randomChoice(IMAGES)],
        owner: owner,
        ai: {
            suggestedPrice: Math.round(price * 1.05),
            potentialScore: randomInt(60, 95),
            riskLevel: "low",
            priceLabel: price > 100 ? "expensive" : "reasonable"
        },
        views: randomInt(50, 2000),
        postedAt: new Date().toISOString()
    };
}

const listings = [];
let idCounter = 1;

// Specific counters requested:
// 100 HCM
// 100 Hanoi
// 200 Others (split evenly among 5 others = 40 each)

const TARGETS = [
    { name: "Thành phố Hồ Chí Minh", count: 100 },
    { name: "Thành phố Hà Nội", count: 100 },
    { name: "Thành phố Đà Nẵng", count: 40 },
    { name: "Thành phố Cần Thơ", count: 40 },
    { name: "Thành phố Hải Phòng", count: 40 },
    { name: "Tỉnh Bình Dương", count: 40 },
    { name: "Tỉnh Đồng Nai", count: 40 }
];

for (const target of TARGETS) {
    for (let i = 0; i < target.count; i++) {
        const item = generateListing(idCounter++, target.name);
        if (item) listings.push(item);
    }
}

// Shuffle the listings array to ensure random distribution in the database
for (let i = listings.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [listings[i], listings[j]] = [listings[j], listings[i]];
}

fs.writeFileSync(path.join(process.cwd(), 'app', 'data', 'mockListings.json'), JSON.stringify(listings, null, 2));

// Also call sync_data.js logic here to keep it simple or run it separately.
// Let's just write to CSV directly here too to save a step.
const csvPath = path.join(process.cwd(), 'data', 'jfinder_listings.csv');
const supersetPath = path.join(process.cwd(), 'data', 'superset_listings.csv');

const headers = ['id', 'name', 'district', 'type', 'price', 'area', 'frontage', 'floors', 'potential_score', 'risk_level', 'views'];
const csvRows = listings.map(item => [
    item.id,
    `"${item.name.replace(/"/g, '""')}"`,
    `"${item.district}"`,
    item.type,
    item.price,
    item.area,
    item.frontage,
    item.floors,
    item.ai.potentialScore, // Note: ai was nested object in my new generation logic, fixing access
    item.ai.riskLevel,
    item.views
].join(','));
const csvContent = [headers.join(',')].concat(csvRows).join('\n');

fs.writeFileSync(csvPath, csvContent, 'utf8');
fs.writeFileSync(supersetPath, csvContent, 'utf8');

console.log(`Generated ${listings.length} listings across all cities and synced to CSV.`);
