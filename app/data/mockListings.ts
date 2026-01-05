// Import dữ liệu 1000 mặt bằng kinh doanh từ JSON
import listingsData from './mockListings.json';

export interface Listing {
  id: string;
  name: string;
  address: string;
  district: string;
  ward: string;
  latitude: number;
  longitude: number;
  price: number;
  area: number;
  frontage: number;
  floors: number;
  type: 'shophouse' | 'kiosk' | 'office' | 'retail';
  images: string[];
  amenities: {
    schools: number;
    offices: number;
    competitors: number;
    busStops: number;
    markets: number;
  };
  ai: {
    suggestedPrice: number;
    priceLabel: 'cheap' | 'fair' | 'expensive';
    potentialScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    growthForecast: number;
  };
  views: number;
  savedCount: number;
  postedAt: string;
  owner: {
    name: string;
    phone: string;
  };
}

export const mockListings: Listing[] = listingsData as Listing[];

// Hàm lấy màu cho Heatmap dựa trên giá
export const getPriceColor = (price: number): string => {
  if (price > 100) return '#ef4444';
  if (price > 50) return '#f59e0b';
  if (price > 25) return '#22c55e';
  return '#3b82f6';
};

// Hàm lấy màu cho Potential Score
export const getPotentialColor = (score: number): string => {
  if (score >= 85) return '#22d3ee';
  if (score >= 70) return '#60a5fa';
  if (score >= 50) return '#818cf8';
  return '#a78bfa';
};

// Thống kê tổng hợp
export const getStatistics = () => {
  const total = mockListings.length;
  const avgPrice = mockListings.reduce((sum, l) => sum + l.price, 0) / total;
  const avgArea = mockListings.reduce((sum, l) => sum + l.area, 0) / total;
  const avgPotential = mockListings.reduce((sum, l) => sum + l.ai.potentialScore, 0) / total;
  const totalViews = mockListings.reduce((sum, l) => sum + l.views, 0);

  return { total, avgPrice, avgArea, avgPotential, totalViews };
};

// Lọc theo quận
export const getByDistrict = (district: string) =>
  mockListings.filter(l => l.district === district);

// Lọc theo loại
export const getByType = (type: Listing['type']) =>
  mockListings.filter(l => l.type === type);

// Lọc theo khoảng giá
export const getByPriceRange = (min: number, max: number) =>
  mockListings.filter(l => l.price >= min && l.price <= max);

// Lấy top tiềm năng
export const getTopPotential = (limit: number = 10) =>
  [...mockListings].sort((a, b) => b.ai.potentialScore - a.ai.potentialScore).slice(0, limit);

// Lấy danh sách quận
export const getDistricts = () =>
  [...new Set(mockListings.map(l => l.district))].sort();

// Thống kê theo quận
export const getDistrictStats = () => {
  const stats: Record<string, { count: number; avgPrice: number; avgPotential: number }> = {};

  mockListings.forEach(l => {
    if (!stats[l.district]) {
      stats[l.district] = { count: 0, avgPrice: 0, avgPotential: 0 };
    }
    stats[l.district].count++;
    stats[l.district].avgPrice += l.price;
    stats[l.district].avgPotential += l.ai.potentialScore;
  });

  Object.keys(stats).forEach(d => {
    stats[d].avgPrice = Math.round(stats[d].avgPrice / stats[d].count);
    stats[d].avgPotential = Math.round(stats[d].avgPotential / stats[d].count);
  });

  return stats;
};
