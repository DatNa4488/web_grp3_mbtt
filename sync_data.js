const fs = require('fs');
const path = require('path');

const mockPath = path.join(process.cwd(), 'mockListings.json');
const csvPath = path.join(process.cwd(), 'data', 'jfinder_listings.csv');

try {
    // 1. Read Mock Data
    const jsonData = fs.readFileSync(mockPath, 'utf8');
    const listings = JSON.parse(jsonData);

    console.log(`Found ${listings.length} records in mockListings.json`);

    // 2. Define CSV Headers (matching the existing CSV structure)
    // Existing: id,name,district,type,price,area,frontage,floors,potential_score,risk_level,views
    const headers = [
        'id',
        'name',
        'district',
        'type',
        'price',
        'area',
        'frontage',
        'floors',
        'potential_score',
        'risk_level',
        'views'
    ];

    // 3. Convert to CSV Rows
    const csvRows = listings.map(item => {
        return [
            item.id,
            // Wrap string fields in quotes if they strictly have commas, but for simplicity/compatibility we just sanitize
            `"${item.name.replace(/"/g, '""')}"`,
            `"${item.district}"`,
            item.type,
            item.price,
            item.area,
            item.frontage,
            item.floors,
            item.ai_potential_score || item.ai?.potential_score || 50, // Handle flatter or nested structure if any
            item.ai_risk_level || item.ai?.risk_level || 'medium',
            item.views
        ].join(',');
    });

    // 4. Combine Header and Rows
    const csvContent = [headers.join(',')].concat(csvRows).join('\n');

    // 5. Write to CSV File
    fs.writeFileSync(csvPath, csvContent, 'utf8');

    console.log(`Successfully wrote ${csvRows.length} records to ${csvPath}`);

} catch (error) {
    console.error('Error syncing data:', error);
}
