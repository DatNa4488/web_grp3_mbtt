import fs from 'fs';
import path from 'path';

// Curated list of high-quality real estate images (Unsplash)
// Categorized for better relevance

const IMAGES_BY_TYPE: Record<string, string[]> = {
    // Office Buildings / Interiors
    office: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=800",
        // Cleaned up URLs
        "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800"
    ],
    // Retail / Shops / Showrooms
    retail: [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1549488352-84b67534d411?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1472851294608-415522f96485?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1507914464562-6ff4ac29642f?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1570857502809-08184874388e?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1519642918688-7e43b19245d8?auto=format&fit=crop&w=800"
    ],
    // Kiosks / Small food stalls
    kiosk: [
        "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800"
    ],
    // Shophouse / Mixed Use / Streetfront
    shophouse: [
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800"
    ],
    // Fallback / Generic
    other: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800"
    ]
};

// Map listing 'type' to our image categories
const TYPE_MAPPING: Record<string, string> = {
    'office': 'office',
    'retail': 'retail',
    'kiosk': 'kiosk',
    'shophouse': 'shophouse',
    'streetfront': 'shophouse',
    'villa': 'shophouse'
};

const mockListingsPath = path.join(process.cwd(), 'mockListings.json');

function updateImages() {
    try {
        const data = fs.readFileSync(mockListingsPath, 'utf-8');
        const listings = JSON.parse(data);

        const updatedListings = listings.map((listing: any) => {
            // Determine category
            const category = TYPE_MAPPING[listing.type] || 'other';
            const imagePool = IMAGES_BY_TYPE[category] || IMAGES_BY_TYPE.other;

            // Pick 1 to 4 random images FROM THE MATCHING CATEGORY
            const numImages = Math.floor(Math.random() * 4) + 1;
            const selectedImages = [];
            const shuffled = [...imagePool].sort(() => 0.5 - Math.random());

            for (let i = 0; i < numImages; i++) {
                // Use modulus to cycle if fewer images than requested, or just cap at pool size
                if (i < shuffled.length) {
                    selectedImages.push(shuffled[i]);
                }
            }

            return {
                ...listing,
                images: selectedImages
            };
        });

        fs.writeFileSync(mockListingsPath, JSON.stringify(updatedListings, null, 2), 'utf-8');
        console.log(`Successfully updated ${updatedListings.length} listings with CATEGORIZED images.`);

    } catch (error) {
        console.error('Error updating images:', error);
    }
}

updateImages();
