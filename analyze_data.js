const fs = require('fs');
const path = require('path');

const mockPath = path.join(process.cwd(), 'mockListings.json');
const csvPath = path.join(process.cwd(), 'data', 'jfinder_listings.csv');

function analyzeJson() {
    try {
        if (!fs.existsSync(mockPath)) return { count: 0, locations: [] };
        const data = JSON.parse(fs.readFileSync(mockPath, 'utf8'));
        const locations = new Set(data.map(i => i.province || i.city || 'Unknown'));
        return { count: data.length, locations: Array.from(locations) };
    } catch (e) {
        return { error: e.message };
    }
}

function analyzeCsv() {
    try {
        if (!fs.existsSync(csvPath)) return { count: 0, locations: [] };
        const content = fs.readFileSync(csvPath, 'utf8');
        const lines = content.split('\n').filter(l => l.trim().length > 0);
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const cityIdx = headers.indexOf('province') !== -1 ? headers.indexOf('province') : headers.indexOf('city');

        // Simple CSV parse (ignoring commas in quotes for now as checking for quick stats)
        const locations = new Set();
        // Start from 1 to skip header
        const dataLines = lines.slice(1);

        dataLines.forEach(line => {
            const cols = line.split(',');
            if (cityIdx !== -1 && cols[cityIdx]) locations.add(cols[cityIdx].trim());
        });

        return { count: dataLines.length, locations: Array.from(locations) };
    } catch (e) {
        return { error: e.message };
    }
}

console.log('--- Mock Data (App Running Data) ---');
console.log(JSON.stringify(analyzeJson(), null, 2));
console.log('\n--- CSV Data (Source Data) ---');
console.log(JSON.stringify(analyzeCsv(), null, 2));
