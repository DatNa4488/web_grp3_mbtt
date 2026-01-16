import * as tf from '@tensorflow/tfjs';
import mockListings from '@/mockListings.json';

// --- Types ---
export interface PredictionInput {
    district: string;
    area: number;
    frontage: number;
    floors: number;
    type: string;
}

// --- Configuration ---
// Map text types to numbers (Label Encoding)
// Map text types to numbers (Label Encoding)
// Higher number = Higher expected value per m2
// Map text types to numbers (Label Encoding)
// Higher number = Higher expected value per m2
const TYPE_MAP: Record<string, number> = {
    'streetfront': 9.5, // Mặt tiền (Premium)
    'shophouse': 9,   // Shophouse
    'retail': 8,      // Cửa hàng (Increased)
    'corner': 8.5,    // Lô góc
    'office': 6,      // Văn phòng
    'kiosk': 4,       // Kiosk
    'alley_big': 6,   // Ngõ ô tô
    'alley_small': 3, // Ngõ nhỏ
    'villa': 9,     // Biệt thự
    'other': 2
};

// Map districts to "Base Value" scores (Simple encoding of location value)
const DISTRICT_SCORE: Record<string, number> = {
    'Quận 1': 10,
    'Quận 3': 9.5,
    'Quận Hoàn Kiếm': 10,  // Increased
    'Quận Ba Đình': 9,     // Increased
    'Quận Tây Hồ': 9.5,    // Increased
    'Quận Cầu Giấy': 9,    // Increased (Was 7)
    'Quận Đống Đa': 9,     // Increased
    'Quận Hai Bà Trưng': 8.5,
    'Quận Thanh Xuân': 8,
    'Quận Nam Từ Liêm': 7,
    'Quận Bắc Từ Liêm': 6,
    'Quận Hà Đông': 6,
    'Quận Long Biên': 6,
    'Quận Hoàng Mai': 6.5,
    'Thành phố Thủ Đức': 7.5, // Increased
    'Quận Bình Thạnh': 8.5,
    'Quận Phú Nhuận': 8.5,
    'Quận Tân Bình': 8,
    'Quận Gò Vấp': 7,
    'Quận 7': 8.5,
    'Quận 4': 7,
    'Quận 10': 8.5,
    'Quận 5': 8,
    'Quận Liên Chiểu': 5,
    'Quận Hải Châu': 8.5
};

let model: tf.Sequential | null = null;
let isTraining = false;

// --- Data Preparation ---
function preprocessData() {
    const inputs: number[][] = [];
    const outputs: number[] = [];

    mockListings.forEach((item: any) => {
        // Features: [DistrictScore, Area, Frontage, Floors, TypeCode]
        const districtVal = DISTRICT_SCORE[item.district] || 3; // Default 3 for unknown
        const typeVal = TYPE_MAP[item.type] || 0;

        // Normalize roughly to 0-1 range for better training
        inputs.push([
            districtVal / 10,   // 0.1 - 1.0
            (item.area || 50) / 500, // 0 - 1 (Assuming max area 500)
            (item.frontage || 5) / 20, // 0 - 1
            (item.floors || 1) / 10,   // 0 - 1
            typeVal / 10        // 0.1 - 0.7
        ]);

        // Output: Price (Normalize by dividing by 1000 to keep numbers small, verify output scale later)
        outputs.push(item.price ? item.price / 500 : 0.05);
    });

    return {
        xs: tf.tensor2d(inputs),
        ys: tf.tensor2d(outputs, [outputs.length, 1])
    };
}

// --- Model Definition ---
export async function trainModel() {
    if (model || isTraining) return; // Already trained or training
    isTraining = true;

    // Try loading existing model first
    try {
        model = await tf.loadLayersModel('indexeddb://jfinder-model') as tf.Sequential;
        console.log('⚡ AI Model: Loaded from IndexedDB (Skipping Training)');
        // Warmup with dummy data
        model.predict(tf.tensor2d([[0.5, 0.5, 0.5, 0.5, 0.5]]));
        isTraining = false;
        return;
    } catch (e) {
        console.log('🤖 AI Model: No saved model found. Starting Training...');
    }

    // 1. Prepare Data
    const { xs, ys } = preprocessData();

    // 2. Define Architecture (Multi-Layer Perceptron)
    model = tf.sequential();

    // Input Layer -> Hidden Layer 1 (Relu)
    model.add(tf.layers.dense({
        inputShape: [5], // 5 features
        units: 32,
        activation: 'relu'
    }));

    // Hidden Layer 2
    model.add(tf.layers.dense({
        units: 16,
        activation: 'relu'
    }));

    // Output Layer (Linear for Regression)
    model.add(tf.layers.dense({
        units: 1,
        activation: 'linear'
    }));

    // 3. Compile
    model.compile({
        optimizer: tf.train.adam(0.01), // Learning rate
        loss: 'meanSquaredError'
    });

    // 4. Train
    await model.fit(xs, ys, {
        epochs: 20,
        shuffle: true,
        // callbacks: {
        //   onEpochEnd: (epoch, logs) => console.log(`Epoch ${epoch}: loss = ${logs?.loss}`)
        // }
    });

    // Save Model
    try {
        await model.save('indexeddb://jfinder-model');
        console.log('💾 AI Model: Saved to IndexedDB');
    } catch (e) {
        console.warn('Failed to save model:', e);
    }

    // Clean up tensors
    xs.dispose();
    ys.dispose();

    isTraining = false;
    console.log('✅ AI Model: Training Complete!');
}

// --- Prediction ---
export async function predictPrice(input: PredictionInput): Promise<number> {
    // Ensure model is trained
    if (!model) {
        await trainModel();
    }

    if (!model) return 0; // Should not happen

    return tf.tidy(() => {
        const districtVal = DISTRICT_SCORE[input.district] || 5; // Default 5
        const typeVal = TYPE_MAP[input.type] || 0;

        // Must match normalization logic in preprocessData
        const tensorInput = tf.tensor2d([[
            districtVal / 10,
            input.area / 500,
            input.frontage / 20,
            input.floors / 10,
            typeVal / 10
        ]]);

        const prediction = model!.predict(tensorInput) as tf.Tensor;
        const value = prediction.dataSync()[0];

        // Denormalize: value * 500 (since we divided by 500)
        let finalPrice = value * 500;

        // --- MARKET CORRECTION HEURISTIC ---
        // The mock data training set was conservative. We apply a correction
        // factor to align with real-world 2026 market rates in major cities.
        // Base correction: +30%
        finalPrice = finalPrice * 1.3;

        // Additional Location Boost for Hanoi/HCM/Da Nang Centers
        const primeDistricts = [
            'Quận 1', 'Quận 3', 'Quận 5', 'Quận 10', 'Quận 7', 'Quận Phú Nhuận', 'Quận Bình Thạnh', // HCM
            'Quận Hoàn Kiếm', 'Quận Cầu Giấy', 'Quận Đống Đa', 'Quận Tây Hồ', 'Quận Ba Đình', 'Quận Hai Bà Trưng', // Hanoi
            'Quận Hải Châu' // Da Nang
        ];

        if (primeDistricts.includes(input.district)) {
            finalPrice = finalPrice * 1.15; // +15% more for prime districts
        }

        // Safety clamp
        return Math.max(5, Math.round(finalPrice));
    });
}

// --- Explainable AI (XAI) ---
export interface FeatureImportance {
    feature: string;
    importance: number; // Percentage 0-100
    label: string;
    color: string;
}

export async function getFeatureImportance(input: PredictionInput): Promise<FeatureImportance[]> {
    const basePrice = await predictPrice(input);
    const results: FeatureImportance[] = [];

    // Perturbation Analysis: Small change in one feature -> Impact on Price?

    // 1. Location Importance (Compare vs Average District Score)
    // Concept: What if this property was in an "Average" district (Score 7)?
    const avgDistrictInput = { ...input, district: 'Quận Bình Thạnh' }; // Assuming ~7 score
    const locPrice = await predictPrice(avgDistrictInput);
    const locImpact = Math.abs(basePrice - locPrice);

    // 2. Area Importance (Change by 10%)
    const areaInput = { ...input, area: input.area * 1.1 };
    const areaPrice = await predictPrice(areaInput);
    const areaImpact = Math.abs(basePrice - areaPrice);

    // 3. Frontage Importance (Change by 1m)
    const frontageInput = { ...input, frontage: input.frontage + 1 };
    const frontagePrice = await predictPrice(frontageInput);
    const frontageImpact = Math.abs(basePrice - frontagePrice);

    // 4. Type Importance (Compare vs "Other")
    const typeInput = { ...input, type: 'other' };
    const typePrice = await predictPrice(typeInput);
    const typeImpact = Math.abs(basePrice - typePrice);

    // Calculate Total Impact for Normalization
    const totalImpact = locImpact + areaImpact + frontageImpact + typeImpact + 0.001; // Avoid div by 0

    return [
        { feature: 'location', label: 'Vị Trí', importance: Math.round((locImpact / totalImpact) * 100), color: 'bg-blue-500' },
        { feature: 'area', label: 'Diện Tích', importance: Math.round((areaImpact / totalImpact) * 100), color: 'bg-green-500' },
        { feature: 'frontage', label: 'Mặt Tiền', importance: Math.round((frontageImpact / totalImpact) * 100), color: 'bg-purple-500' },
        { feature: 'type', label: 'Loại Hình', importance: Math.round((typeImpact / totalImpact) * 100), color: 'bg-orange-500' }
    ].sort((a, b) => b.importance - a.importance);
}

// --- Predictive Analytics (KNN) ---
export interface SimilarListing {
    id: string | number;
    name: string;
    price: number;
    similarity: number; // 0-100%
}

export function findSimilarListings(input: PredictionInput, limit: number = 3): SimilarListing[] {
    // Simple KNN based on normalized features
    const targetVector = [
        (DISTRICT_SCORE[input.district] || 3) / 10,
        Math.min(1, input.area / 200),
        Math.min(1, input.frontage / 10),
        (TYPE_MAP[input.type] || 0) / 10
    ];

    const similarities = mockListings.map((item: any) => {
        const itemVector = [
            (DISTRICT_SCORE[item.district] || 3) / 10,
            Math.min(1, (item.area || 50) / 200),
            Math.min(1, (item.frontage || 5) / 10),
            (TYPE_MAP[item.type] || 0) / 10
        ];

        // Euclidean Distance
        const dist = Math.sqrt(
            targetVector.reduce((sum, val, idx) => sum + Math.pow(val - itemVector[idx], 2), 0)
        );

        // Convert distance to similarity score (1 - distance, clamped)
        // Max theoretical distance is sqrt(4) = 2. So logic: 1 - (dist/2)
        const similarity = Math.max(0, Math.round((1 - (dist / 2)) * 100));

        return {
            id: item.id,
            name: item.title || item.name,
            price: item.price || item.price_million,
            similarity
        };
    });

    // Sort by similarity desc
    return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
}
