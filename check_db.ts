
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const listings = await prisma.listing.groupBy({
        by: ['city'],
        _count: {
            id: true,
        },
    });

    console.log("Listing count by city:");
    listings.forEach(l => {
        console.log(`${l.city}: ${l._count.id}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
