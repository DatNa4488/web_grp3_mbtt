'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ImageWithFallback from '@/app/components/ui/image-fallback';
import { Search, MapPin, TrendingUp, Eye, Loader2, Filter, Grid3X3, Map as MapIcon } from 'lucide-react';
import { Listing } from '@/lib/api';
import { searchListings } from '@/app/lib/actions';
import { PROVINCES, getDistrictsByProvince, getProvinceShortName } from '@/lib/districts';
import dynamic from 'next/dynamic';
import * as turf from '@turf/turf';

const RentalHeatmap = dynamic(() => import('@/components/Map/RentalHeatmap'), { ssr: false });
const AMENITIES_OPTIONS = ['Trường học', 'Bệnh viện', 'Siêu thị', 'Công viên', 'Gym'];

export default function SearchPage() {
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [type, setType] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(1000); // 1000 Tr max
  const [minArea, setMinArea] = useState<number>(0);
  const [maxArea, setMaxArea] = useState<number>(500);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [visibleCount, setVisibleCount] = useState(24);

  // Advanced Filters
  const [radius, setRadius] = useState<number>(5); // km
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  // Initial load
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch() {
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchListings({
        province: province || undefined, // Pass province to API
        district: district || undefined,
        type: type || undefined,
        maxPrice,
        minArea,
        maxArea,
        limit: 2000 // Get all matches
      });
      // Cast data to Listing[] if needed, but searchListings returns compatible shape
      setListings(data as any);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location: ", error);
          setIsLocating(false);
          alert("Không thể lấy vị trí của bạn.");
        }
      );
    } else {
      setIsLocating(false);
      alert("Trình duyệt không hỗ trợ Geolocation.");
    }
  };

  // Filter listings by Radius & Amenities (Client-side logic)
  const filteredListings = listings.filter(listing => {
    // 1. Radius Filter (if user location is set)
    if (userLocation && listing.lat && listing.lng) {
      const from = turf.point([userLocation.lng, userLocation.lat]);
      const to = turf.point([listing.lng, listing.lat]);
      const distance = turf.distance(from, to, { units: 'kilometers' });
      if (distance > radius) return false;
    }

    // 2. Amenities Filter 
    if (selectedAmenities.length > 0 && (listing as any).amenities) {
      const hasAll = selectedAmenities.every(a => (listing as any).amenities.includes(a));
      if (!hasAll) return false;
    }

    return true;
  });

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(prev => prev.filter(a => a !== amenity));
    } else {
      setSelectedAmenities(prev => [...prev, amenity]);
    }
  };

  const getPriceLabel = (listing: Listing) => {
    switch (listing.ai?.priceLabel) {
      case 'cheap': return { text: 'Giá Tốt', color: 'bg-green-500/10 text-green-400 border-green-500/20' };
      case 'expensive': return { text: 'Giá Cao', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
      default: return { text: 'Hợp Lý', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-200 mb-4">
            Tìm Kiếm Mặt Bằng
          </h1>
          <p className="text-gray-400 text-lg">
            {listings.length > 0 ? `Tìm thấy ${filteredListings.length} mặt bằng phù hợp` : 'Tìm kiếm và lọc theo nhu cầu. Dữ liệu real-time từ n8n Backend.'}
          </p>
        </header>

        {/* Search Form */}
        <div className="glass-card rounded-2xl p-8 mb-10 border border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Filter className="w-5 h-5 text-cyan-400" />
              Bộ Lọc Tìm Kiếm
            </h2>

            {/* View Toggle */}
            {listings.length > 0 && (
              <div className="flex gap-2 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${viewMode === 'map' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <MapIcon className="w-4 h-4" />
                  Map
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            {/* Province Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Thành Phố</label>
              <select
                value={province}
                onChange={e => {
                  setProvince(e.target.value);
                  setDistrict('');
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all cursor-pointer"
              >
                <option value="" className="bg-slate-900">Tất cả</option>
                {PROVINCES.map(prov => (
                  <option key={prov} value={prov} className="bg-slate-900">
                    {getProvinceShortName(prov)}
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Quận / Huyện</label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all cursor-pointer"
              >
                <option value="" className="bg-slate-900">{province ? 'Tất cả quận' : 'Chọn thành phố'}</option>
                {province && getDistrictsByProvince(province).map(dist => (
                  <option key={dist} value={dist} className="bg-slate-900">{dist}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Loại Hình</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all cursor-pointer"
              >
                <option value="" className="bg-slate-900">Tất cả loại</option>
                <option value="shophouse" className="bg-slate-900">Shophouse</option>
                <option value="kiosk" className="bg-slate-900">Kiosk</option>
                <option value="office" className="bg-slate-900">Văn phòng</option>
                <option value="retail" className="bg-slate-900">Cửa hàng</option>
                <option value="streetfront" className="bg-slate-900">Mặt Tiền</option>
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Giá tối đa</label>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all pr-10"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-3 text-gray-400 text-sm font-bold">Tr</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>

            {/* Area Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Diện tích (m²)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={minArea}
                    onChange={e => setMinArea(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all pl-3"
                    placeholder="Min"
                  />
                  <div className="absolute right-3 top-3 text-gray-500 text-xs font-bold pointer-events-none">Từ</div>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={maxArea}
                    onChange={e => setMaxArea(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all pl-3"
                    placeholder="Max"
                  />
                  <div className="absolute right-3 top-3 text-gray-500 text-xs font-bold pointer-events-none">Đến</div>
                </div>
              </div>
            </div>


          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-bold text-white shadow-lg shadow-cyan-900/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang tìm kiếm...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Tìm Kiếm Ngay
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {
          listings.length > 0 ? (
            viewMode === 'grid' ? (
              // Grid View
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.slice(0, visibleCount).map(listing => {
                    const priceLabel = getPriceLabel(listing);
                    return (
                      <Link
                        key={listing.id}
                        href={`/listing/${listing.id}`}
                        className="glass-card rounded-xl overflow-hidden hover:bg-white/10 transition-all group border border-white/10 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-900/20"
                      >
                        {/* Image Thumbnail */}
                        <div className="relative w-full h-48 bg-slate-800">
                          {listing.images && listing.images.length > 0 ? (
                            <ImageWithFallback
                              src={listing.images[0]}
                              alt={listing.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                              <MapPin className="w-12 h-12" />
                            </div>
                          )}
                          <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full border backdrop-blur-sm ${priceLabel.color}`}>
                            {priceLabel.text}
                          </span>
                        </div>

                        {/* Card Content */}
                        <div className="p-6">
                          <h4 className="font-bold text-white mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">{listing.name}</h4>
                          <p className="text-sm text-gray-400 flex items-center gap-1 mb-4">
                            <MapPin className="w-3 h-3" />
                            {listing.province ? `${getProvinceShortName(listing.province)} - ${listing.district}` : listing.district}
                          </p>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Giá thuê:</span>
                              <span className="font-bold text-green-400">{listing.price} Tr/tháng</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Diện tích:</span>
                              <span className="text-white">{listing.area} m²</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Mặt tiền:</span>
                              <span className="text-white">{listing.frontage || 'N/A'}m</span>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1 text-purple-400">
                                <TrendingUp className="w-3 h-3" />
                                <span className="font-bold">{listing.ai?.potentialScore || 'N/A'}/100</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Eye className="w-3 h-3" />
                                {listing.views}
                              </div>
                            </div>
                            <span className="text-xs text-cyan-400 font-bold group-hover:underline">
                              Chi tiết →
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Show More Button */}
                {visibleCount < filteredListings.length && (
                  <div className="text-center mt-12">
                    <button
                      onClick={() => setVisibleCount(prev => prev + 24)}
                      className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-bold transition-all"
                    >
                      Xem thêm ({filteredListings.length - visibleCount} mặt bằng)
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Map View
              <div className="h-[700px] rounded-2xl overflow-hidden border border-white/10">
                <RentalHeatmap listings={listings} />
              </div>
            )
          ) : !loading && (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                Nhấn nút <span className="text-cyan-400 font-bold">"Tìm Kiếm Ngay"</span> để xem kết quả
              </p>
            </div>
          )
        }
      </div >
    </div >
  );
}
