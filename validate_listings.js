const fs = require('fs');
const path = require('path');

// Read mock listings
const mockListings = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'app', 'data', 'mockListings.json'), 'utf-8')
);

console.log(`\n📊 Kiểm tra ${mockListings.length} listings...\n`);

let errors = [];
let warnings = [];

mockListings.forEach((listing, index) => {
    const { id, name, district, city, province } = listing;

    // Check 1: Name should follow pattern "Mặt bằng [District] - [Type]"
    if (!name.startsWith('Mặt bằng ')) {
        errors.push(`[${id}] Tên không bắt đầu bằng "Mặt bằng": ${name}`);
    }

    // Check 2: District in name should match district field
    const expectedPattern = `Mặt bằng ${district}`;
    if (!name.includes(district)) {
        warnings.push(`[${id}] Tên không chứa tên quận "${district}": ${name}`);
    }

    // Check 3: City and Province should match
    if (city !== province) {
        warnings.push(`[${id}] City và Province không khớp: city="${city}", province="${province}"`);
    }

    // Check 4: District should not be empty
    if (!district || district.trim() === '') {
        errors.push(`[${id}] District trống`);
    }
});

// Summary
console.log(`✅ Tổng số listings: ${mockListings.length}`);
console.log(`❌ Lỗi nghiêm trọng: ${errors.length}`);
console.log(`⚠️  Cảnh báo: ${warnings.length}\n`);

if (errors.length > 0) {
    console.log('🔴 LỖI NGHIÊM TRỌNG:');
    errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
    if (errors.length > 10) console.log(`  ... và ${errors.length - 10} lỗi khác`);
}

if (warnings.length > 0) {
    console.log('\n🟡 CẢNH BÁO:');
    warnings.slice(0, 10).forEach(warn => console.log(`  - ${warn}`));
    if (warnings.length > 10) console.log(`  ... và ${warnings.length - 10} cảnh báo khác`);
}

// Distribution check
const cityCount = {};
mockListings.forEach(l => {
    cityCount[l.city] = (cityCount[l.city] || 0) + 1;
});

console.log('\n📍 Phân bố theo thành phố:');
Object.entries(cityCount).sort((a, b) => b[1] - a[1]).forEach(([city, count]) => {
    console.log(`  ${city}: ${count} listings`);
});

console.log('\n✅ Kiểm tra hoàn tất!\n');
