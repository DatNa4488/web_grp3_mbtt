import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    try {
        // Relative to execution directory (project root)
        const mockDataPath = path.join(process.cwd(), 'app/data/mockListings.json');

        if (!fs.existsSync(mockDataPath)) {
            console.error(`Mock data file not found at: ${mockDataPath}`);
            return;
        }

        const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));

        // Create a default Landlord user if not exists to assign these listings to
        const defaultLandlord = await prisma.user.upsert({
            where: { email: 'landlord@demo.com' },
            update: {},
            create: {
                email: 'landlord@demo.com',
                name: 'Demo Landlord',
                password: '$2a$10$abcdefg', // Dummy password
                role: 'LANDLORD',
            },
        });

        // Clean up existing listings to ensure we only have the new dataset
        console.log('Cleaning up old listings...');
        await prisma.listing.deleteMany({});
        console.log('Old listings deleted.');

        for (const item of mockData) {
            // Map mock data to Prisma model
            // Note: We use upsert to avoid duplicates if run multiple times
            await prisma.listing.upsert({
                where: { id: String(item.id) }, // Assuming mock ID is string or convertible
                update: {
                    name: item.name,
                    title: item.name,
                    description: `Mặt bằng ${item.type} tại ${item.address}, ${item.district}, ${item.city}. Diện tích ${item.area}m2.`,
                    price: parseFloat(item.price),
                    area: parseFloat(item.area),
                    address: item.address,
                    city: item.city,
                    province: item.province || item.city,
                    district: item.district,
                    ward: item.ward || 'Phường Trung Tâm',

                    lat: parseFloat(item.latitude || item.lat),
                    lon: parseFloat(item.longitude || item.lon),

                    type: item.type,
                    images: item.images || (item.image_url ? [item.image_url] : []),
                    frontage: parseFloat(item.frontage || 0),
                    floors: parseInt(item.floors || 1),
                    views: parseInt(item.views || 0),

                    ai_suggestedPrice: parseFloat(item.ai?.suggestedPrice || 0),
                    ai_potentialScore: parseInt(item.ai?.potentialScore || 0),
                    ai_riskLevel: item.ai?.riskLevel || 'medium',
                    ai_priceLabel: item.ai?.priceLabel || 'fair',

                    ownerName: item.owner?.name || "Chính Chủ",
                    ownerPhone: item.owner?.phone || "0909000000",
                    ownerRole: item.owner?.role || "Owner",
                },
                create: {
                    id: String(item.id),
                    name: item.name,
                    title: item.name,
                    description: `Mặt bằng ${item.type} tại ${item.address}, ${item.district}, ${item.city}. Diện tích ${item.area}m2.`,
                    price: parseFloat(item.price),
                    area: parseFloat(item.area),
                    address: item.address,
                    city: item.city,
                    province: item.province || item.city,
                    district: item.district,
                    ward: item.ward || 'Phường Trung Tâm',

                    lat: parseFloat(item.latitude || item.lat),
                    lon: parseFloat(item.longitude || item.lon),

                    type: item.type,
                    images: item.images || (item.image_url ? [item.image_url] : []),
                    frontage: parseFloat(item.frontage || 0),
                    floors: parseInt(item.floors || 1),
                    views: parseInt(item.views || 0),

                    ai_suggestedPrice: parseFloat(item.ai?.suggestedPrice || 0),
                    ai_potentialScore: parseInt(item.ai?.potentialScore || 0),
                    ai_riskLevel: item.ai?.riskLevel || 'medium',
                    ai_priceLabel: item.ai?.priceLabel || 'fair',

                    ownerName: item.owner?.name || "Chính Chủ",
                    ownerPhone: item.owner?.phone || "0909000000",
                    ownerRole: item.owner?.role || "Owner",

                    landlordId: defaultLandlord.id // Assign all to demo landlord initially
                },
            });
        }

        console.log(`Seeding finished. Imported ${mockData.length} listings.`);
    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
