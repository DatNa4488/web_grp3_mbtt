// JFinder API Client - n8n Backend
// All requests go through n8n webhooks or fallback to Mock Data if API fails.
import mockListings from '@/app/data/mockListings.json'; // Data source for fallback
import { predictPrice } from '@/lib/ai/model';

const N8N_BASE = process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678/webhook';

// Types
export interface Listing {
  id: string | number;
  name: string; // Changed from title to match mock
  address?: string;
  city?: string;
  province?: string;
  district: string;
  ward?: string;
  price: number; // Changed from price_million
  area: number; // Changed from area_m2
  lat: number;
  lon: number; // Used in mock as longitude but interface expects lon/lat usually. Mock has longitude/latitude.
  latitude?: number;
  longitude?: number;
  type: string;
  images?: string[];
  image_url?: string;
  views: number;
  frontage?: number;
  ai?: {
    suggestedPrice: number;
    potentialScore: number;
    riskLevel: string;
    priceLabel?: string;
  };
  owner?: {
    name: string;
    phone: string;
  };
}

export interface SearchParams {
  province?: string;
  city?: string;
  district?: string;
  type?: string;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  limit?: number;
}

export interface ValuationResult {
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  potentialScore: number;
  riskLevel: string;
  priceLabel: string;
  explanation: string;
}

export interface ROIResult {
  monthlyRevenue: number;
  totalMonthlyCost: number;
  monthlyProfit: number;
  breakEvenDays: number;
  roiPercent: string;
}

export interface Stats {
  total: number;
  totalViews: number;
  avgPrice: number;
  avgArea: number;
  avgPotential: number;
  growth: number;
  byDistrict: Record<string, number>;
  byType: Record<string, number>;
}

// Helper: Normalize Listing Data
function normalizeListing(item: any): Listing {
  return {
    ...item,
    price: item.price || item.price_million,
    area: item.area || item.area_m2,
    lat: item.latitude || item.lat,
    lon: item.longitude || item.lon,
    images: item.images || (item.image_url ? [item.image_url] : []),
    views: item.views || 0,
    frontage: item.frontage || item.frontage_m || 0,
    ai: {
      suggestedPrice: item.ai?.suggestedPrice || item.ai_suggested_price || 0,
      potentialScore: item.ai?.potentialScore || item.ai_potential_score || 50,
      riskLevel: item.ai?.riskLevel || item.ai_risk_level || 'medium',
      priceLabel: item.ai?.priceLabel || 'fair'
    },
    owner: item.owner || undefined
  };
}

// Fetch listings with filters (Graceful Fallback)
export async function fetchListings(params?: SearchParams): Promise<Listing[]> {
  try {
    const query = new URLSearchParams();
    if (params?.city || params?.province) query.append('city', params.city || params.province || '');
    if (params?.district) query.append('district', params.district);
    if (params?.maxPrice) query.append('maxPrice', String(params.maxPrice));
    if (params?.minArea) query.append('minArea', String(params.minArea));
    if (params?.maxArea) query.append('maxArea', String(params.maxArea));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.type) query.append('type', params.type);

    // Timeout to prevent hanging if n8n is down
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const url = `${N8N_BASE}/listings${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url, { signal: controller.signal }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const json = await res.json();
      if (json.success) {
        let data: Listing[] = json.data.map(normalizeListing);

        // Client-side filtering with robust normalization
        if (params?.city || params?.province) {
          const normalize = (s: string) => s.toLowerCase()
            .replace(/^(thành phố|tỉnh|tp\.|tp)\s+/g, '')
            .replace(/\s+/g, ' ')
            .trim();

          const searchTerms = normalize(params.city || params.province || '');

          if (searchTerms) {
            data = data.filter(l => {
              const lCity = normalize(l.city || '');
              const lProv = normalize(l.province || '');
              return (lCity && (lCity.includes(searchTerms) || searchTerms.includes(lCity))) ||
                (lProv && (lProv.includes(searchTerms) || searchTerms.includes(lProv)));
            });
          }
        }
        if (params?.district) {
          const d = params.district.toLowerCase();
          data = data.filter(l => l.district && l.district.toLowerCase().includes(d));
        }

        return data;
      }
    }

    throw new Error('Fallback to mock');

  } catch (error) {
    console.warn('API Error/Timeout (listings). Using Mock Data.');

    // Filter Mock Data
    let data: Listing[] = mockListings.map(normalizeListing);

    if (params?.city || params?.province) {
      const p = (params.city || params.province || '').toLowerCase();
      data = data.filter(l =>
        (l.city && l.city.toLowerCase().includes(p)) ||
        (l.province && l.province.toLowerCase().includes(p))
      );
    }

    if (params?.district) {
      data = data.filter(l => l.district.includes(params.district || ''));
    }
    if (params?.type) {
      data = data.filter(l => l.type === params.type);
    }
    if (params?.maxPrice) {
      data = data.filter(l => l.price <= params.maxPrice!);
    }
    if (params?.minArea) {
      data = data.filter(l => l.area >= params.minArea!);
    }
    if (params?.maxArea) {
      data = data.filter(l => l.area <= params.maxArea!);
    }

    return data.slice(0, params?.limit || 100);
  }
}

// Fetch single listing by ID
export async function fetchListing(id: string | number): Promise<Listing | null> {
  // Try finding in mock first (fastest)
  const found = mockListings.find(l => l.id == id);
  if (found) return normalizeListing(found);

  return null;
}

// Fetch stats (from PostGIS views via n8n)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Helper: Calculate stats from a list of listings
function calculateStatsFromData(data: Listing[], groupByCity: boolean = false) {
  const total = data.length;
  if (total === 0) {
    return {
      total: 0,
      totalViews: 0,
      avgPrice: 0,
      avgArea: 0,
      avgPotential: 0,
      growth: 0,
      byDistrict: {},
      byType: {}
    };
  }

  const totalPrice = data.reduce((sum, item) => sum + item.price, 0);
  const totalArea = data.reduce((sum, item) => sum + item.area, 0);
  const totalPotential = data.reduce((sum, item) => sum + (item.ai?.potentialScore || 50), 0);
  const totalViews = data.reduce((sum, item) => sum + (item.views || 0), 0);

  const byDistrict: Record<string, number> = {};
  const byType: Record<string, number> = {};

  data.forEach(item => {
    // If grouping by city (All Cities view), use province/city name as key
    // Otherwise use district name
    const key = groupByCity ? (item.city || item.province || 'Khác') : item.district;
    byDistrict[key] = (byDistrict[key] || 0) + 1;
    byType[item.type] = (byType[item.type] || 0) + 1;
  });

  return {
    total,
    totalViews,
    avgPrice: Math.round((totalPrice / total) * 10) / 10,
    avgArea: Math.round(totalArea / total),
    avgPotential: Math.round(totalPotential / total),
    growth: 12.5, // Mock growth rate
    byDistrict,
    byType
  };
}

// Fetch stats (from PostGIS views via n8n)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchStats(filters?: { city?: string; district?: string }): Promise<any> {
  try {
    const query = new URLSearchParams();
    if (filters?.city) query.append('city', filters.city);
    if (filters?.district) query.append('district', filters.district);

    // If n8n has a parameterized stats endpoint, we would use it here.
    // For now assuming n8n endpoint is static or doesn't support params yet, 
    // OR we force fallback to calculate client-side if filters are present 
    // to give immediate feedback.

    // NOTE: To support true server-side filtering, n8n webhook needs update.
    // For this task, we will prioritize the "Mock Fallback" calculation 
    // which effectively acts as a client-side calculator on the full dataset.

    const res = await fetch(`${N8N_BASE}/stats?${query.toString()}`);
    const json = await res.json();
    if (json.success && json.data) return json.data;

    console.warn('API returned success:false or no data. Using Mock Data.');
    throw new Error('API returned error');
  } catch (error) {
    // console.error('API Error (stats):', error);

    // Dynamic Mock Calculation
    let filteredData: Listing[] = mockListings.map(normalizeListing);

    if (filters?.city) {
      filteredData = filteredData.filter(l => l.province === filters.city || l.city === filters.city);
    }
    if (filters?.district) {
      filteredData = filteredData.filter(l => l.district === filters.district);
    }

    return calculateStatsFromData(filteredData, !filters?.city);
  }
}

// AI Valuation - Advanced Deep Learning Model (TensorFlow.js)


// Fetch Districts Structure (from n8n or fallback)
export async function fetchDistricts(): Promise<Record<string, string[]>> {
  try {
    const res = await fetch(`${N8N_BASE}/districts`);
    const json = await res.json();
    if (json.success && json.data) return json.data;
    throw new Error('API returned error');
  } catch (error) {
    console.warn('API Error (districts). Using Static Data.');
    // Import dynamically to avoid circular deps if any, or just use the known structure
    // We will simple return the static data we know exists
    const { DISTRICTS_BY_PROVINCE } = require('./districts');
    return DISTRICTS_BY_PROVINCE;
  }
}

// AI Valuation - Advanced Deep Learning Model (TensorFlow.js) -> N8N Webhook
export async function getValuation(data: {
  district: string;
  area: number;
  frontage?: number;
  floors?: number;
  type?: string;
}): Promise<ValuationResult> {
  try {
    // 1. Call n8n Webhook
    const res = await fetch(`${N8N_BASE}/valuation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
    throw new Error('Using Fallback Model');

  } catch (error) {
    console.log('Using Client-Side Fallback for Valuation');

    // Fallback: Client-side prediction logic (kept for reliability)
    const predictedPrice = await predictPrice({
      district: data.district,
      area: data.area,
      frontage: data.frontage || 5,
      floors: data.floors || 1,
      type: data.type || 'other'
    });

    const finalPrice = predictedPrice;
    const districtScores: Record<string, number> = {
      'Quận 1': 95, 'Quận 3': 92, 'Hoàn Kiếm': 94, 'Tây Hồ': 90,
      'Cầu Giấy': 85, 'Ba Đình': 88, 'Đống Đa': 86, 'Hai Bà Trưng': 87
    };

    const locationScore = districtScores[data.district] || 70;
    const structureScore = Math.min(100, (data.frontage || 5) * 5 + (data.floors || 1) * 10);
    const potentialScore = Math.round((locationScore * 0.6) + (structureScore * 0.4));

    return {
      suggestedPrice: Math.round(finalPrice),
      priceRange: {
        min: Math.round(finalPrice * 0.9),
        max: Math.round(finalPrice * 1.1)
      },
      potentialScore: potentialScore,
      riskLevel: potentialScore > 85 ? 'low' : potentialScore > 70 ? 'medium' : 'high',
      priceLabel: 'fair',
      explanation: `Dự báo bởi mô hình Neural Network (Fallback Client-Side). Mức giá dự kiến: ${finalPrice.toFixed(1)} triệu.`
    };
  }
}

// ROI Calculator -> N8N Webhook
export async function calculateROI(data: {
  monthlyRent: number;
  productPrice: number;
  dailyCustomers: number;
  operatingCost?: number;
}): Promise<ROIResult> {
  try {
    const res = await fetch(`${N8N_BASE}/roi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
    throw new Error('Using Fallback ROI');
  } catch (error) {
    // Fallback: Client-side calculation
    const monthlyRevenue = data.productPrice * data.dailyCustomers * 30;
    const totalMonthlyCost = data.monthlyRent + (data.operatingCost || 0);
    const monthlyProfit = monthlyRevenue - totalMonthlyCost;
    const breakEvenDays = totalMonthlyCost / (data.productPrice * data.dailyCustomers);

    return {
      monthlyRevenue,
      totalMonthlyCost,
      monthlyProfit,
      breakEvenDays,
      roiPercent: ((monthlyProfit / totalMonthlyCost) * 100).toFixed(1)
    };
  }
}
