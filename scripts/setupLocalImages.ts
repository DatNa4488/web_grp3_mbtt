
import fs from 'fs';
import path from 'path';
import https from 'https';

// --- Configuration ---
const MOCK_DIR = path.join(process.cwd(), 'public', 'mock');
const LISTINGS_PATH = path.join(process.cwd(), 'mockListings.json');


// Reusing the curated list but defined here for self-containment
const IMAGES_BY_TYPE: Record<string, string[]> = {
    office: [
        // 35 Office Images
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1504384308090-c54be3855485?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800", // Replaced duplicate/bad
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1495433324511-bf8e92934d90?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1503423571797-2d2bb372094a?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1568992687947-86c22da26851?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1531973576160-7125cd663d86?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1488998527040-85054a85150e?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1534951474654-88aa02c2c082?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1593642702749-b7d2a804fbcf?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1560264280-88b68371db39?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1556740714-a8395b3bf30f?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1517502884422-41e157d2ed44?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1565514020125-63b78c8c50e2?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1537726235470-8504e3beef77?auto=format&fit=crop&w=800"
    ],
    retail: [
        // 35 Retail/Store Images
        "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1549488352-84b67534d411?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1550963295-019d9a7645d4?auto=format&fit=crop&w=800", // Replaced vegetables
        "https://images.unsplash.com/photo-1507914464562-6ff4ac29642f?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1570857502809-08184874388e?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1555685812-4b943f3e9942?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1550963295-019d9a7645d4?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1580793241553-e9f1cce181af?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1550963295-019d9a7645d4?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1604719312566-b7cb0463f336?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1524312861213-909772c6326e?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1535401991769-cf6d8837a3b4?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1567958441989-8d34c676239f?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1572584642822-6f8de0243c93?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1516455590571-0034d7569f3d?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1506318164473-2dfd3ede3623?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1496747611176-66381b896472?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1519567241046-7f570eee3d9f?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1566576912904-4c6e9a72cd27?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1546213290-e1b492ab3eee?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1561518776-e76a5e48f731?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1508899693757-78d52f9631c4?auto=format&fit=crop&w=800"
    ],
    kiosk: [
        // 35 Kiosk/Booth Images
        "https://images.unsplash.com/photo-1536766820879-059fec98ec0a?auto=format&fit=crop&w=800", // Food Stall replaced
        "https://images.unsplash.com/photo-1567129937968-cdad8f07e2f8?auto=format&fit=crop&w=800", // Street food
        "https://images.unsplash.com/photo-1596468138838-29138697b0a8?auto=format&fit=crop&w=800", // Flowers
        "https://images.unsplash.com/photo-1542601098-8fc114e148e2?auto=format&fit=crop&w=800", // Newsstand
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800", // Storefront
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800", // Coffee shop
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800", // Cafe
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800", // Replaced coffee hands
        "https://images.unsplash.com/photo-1520263622080-33230c1c3851?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1507914372368-b2b085b925a1?auto=format&fit=crop&w=800", // Replaced person
        "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1507914372368-b2b085b925a1?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1563245372-f21727e36924?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1579618218290-c1a590b50eee?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1532153955177-f597a366d5d6?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1463797221720-6b07e6426c24?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1560963689-02e085c8f742?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1561758033-d8f3689aa211?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1536766820879-059fec98ec0a?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1596001004818-47c0b064add1?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1556228378-e54707dc816a?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1576449539311-66c30f81d13f?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1593359677879-a4bb15360a08?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1506459225024-1428097a7e18?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1595701386708-34863f86e921?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1518340244795-584bc5451994?auto=format&fit=crop&w=800"
    ],
    shophouse: [
        // 35 Shophouse Images
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1513584687574-9c7229ea6768?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1469022569037-aaae27927947?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1591474200742-dfc605f27009?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1560185127-d0303f9b8911?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1560185008-5d51381fd5ae?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1560185007-c5ca9d2c0156?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1628744876497-eb30460be9f6?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1596178060871-020477b8ae25?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1628744448840-55bdb2497bd4?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1628745277937-2abd1956550e?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1628745677937-2abd1956550e?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1512413110906-8dce65fa1929?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1597047084897-51e81819a499?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1460317442991-0ec209860395?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800"
    ],
    other: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1497424269661-897b69c4c11b?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1497942304796-b8bc2cc898f3?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1462206092226-f46025ffe607?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1622675363311-3e1904de1891?auto=format&fit=crop&w=800",
        "https://images.unsplash.com/photo-1581553673752-167d4f9add7d?auto=format&fit=crop&w=800"
    ]
};

const TYPE_MAPPING: Record<string, string> = {
    'office': 'office',
    'retail': 'retail',
    'kiosk': 'kiosk',
    'shophouse': 'shophouse',
    'streetfront': 'shophouse',
    'villa': 'shophouse'
};

// --- Helpers ---

async function downloadImage(url: string, destPath: string): Promise<boolean> {
    return new Promise((resolve) => {
        if (fs.existsSync(destPath)) {
            // Skip if already exists
            resolve(true);
            return;
        }

        const file = fs.createWriteStream(destPath);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`Downloaded: ${path.basename(destPath)}`);
                    resolve(true);
                });
            } else {
                console.error(`Failed to download ${url}: ${response.statusCode}`);
                fs.unlink(destPath, () => { }); // Delete partial file
                resolve(false);
            }
        }).on('error', (err) => {
            console.error(`Error downloading ${url}:`, err.message);
            fs.unlink(destPath, () => { });
            resolve(false);
        });
    });
}

// --- Main Script ---

async function main() {
    console.log('Starting Local Image Setup...');

    // 1. Create directories
    if (!fs.existsSync(MOCK_DIR)) {
        fs.mkdirSync(MOCK_DIR, { recursive: true });
        console.log('Created directory:', MOCK_DIR);
    }

    // 2. Download Images & Build Local Mapping
    const localImageMap: Record<string, string[]> = {};

    for (const [category, urls] of Object.entries(IMAGES_BY_TYPE)) {
        const categoryDir = path.join(MOCK_DIR, category);
        if (!fs.existsSync(categoryDir)) {
            fs.mkdirSync(categoryDir, { recursive: true });
        }

        localImageMap[category] = [];

        // Download Loop
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const filename = `img_${i + 1}.jpg`;
            const destPath = path.join(categoryDir, filename);

            // Parallel-ish downloads (awaiting one by one for simplicity/safety)
            const success = await downloadImage(url, destPath);
            if (success) {
                // Path relative to public folder (for Next.js)
                localImageMap[category].push(`/mock/${category}/${filename}`);
            }
        }
    }

    // 3. Update Listings
    try {
        const data = fs.readFileSync(LISTINGS_PATH, 'utf-8');
        const listings = JSON.parse(data);
        let updatedCount = 0;

        // Track used images to ensure first 50 are distinct
        const usedImages = new Set<string>();

        const updatedListings = listings.map((listing: any, index: number) => {
            const category = TYPE_MAPPING[listing.type] || 'other';
            const imagePool = localImageMap[category] || localImageMap.other;

            if (!imagePool || imagePool.length === 0) {
                // console.warn(`No local images for category: ${category}`);
                return listing;
            }

            let selectedImages: string[] = [];

            // LOGIC FOR FIRST 50 LISTINGS: Attempt to be distinct
            if (index < 50) {
                // Try to find an unused image in the pool
                const unusedImage = imagePool.find(img => !usedImages.has(img));

                if (unusedImage) {
                    selectedImages.push(unusedImage);
                    usedImages.add(unusedImage);

                    // Add 1-2 more random images (can be reused) for gallery depth
                    const numExtras = Math.floor(Math.random() * 2) + 1;
                    const others = imagePool.filter(img => img !== unusedImage);
                    const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
                    selectedImages.push(...shuffledOthers.slice(0, numExtras));

                } else {
                    // Fallback if we run out of unique images
                    const shuffled = [...imagePool].sort(() => 0.5 - Math.random());
                    selectedImages = shuffled.slice(0, 3);
                }
            }
            // LOGIC FOR REST: Random assignment
            else {
                const numImages = Math.floor(Math.random() * 4) + 1;
                const shuffled = [...imagePool].sort(() => 0.5 - Math.random());
                selectedImages = shuffled.slice(0, numImages);
            }

            updatedCount++;
            return {
                ...listing,
                images: selectedImages
            };
        });

        fs.writeFileSync(LISTINGS_PATH, JSON.stringify(updatedListings, null, 2), 'utf-8');
        console.log(`SUCCESS: Updated ${updatedCount} listings with LOCAL paths.`);

    } catch (err) {
        console.error('Failed to update listings:', err);
    }
}

main();
