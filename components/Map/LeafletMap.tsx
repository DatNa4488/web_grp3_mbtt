'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Listing } from '@/lib/api';

interface LeafletMapProps {
    listings: Listing[];
    district?: string;
    mode: 'price' | 'potential';
}

// Helpers for color/radius
const getPriceColor = (price: number): string => {
    if (price > 100) return '#ef4444';
    if (price > 50) return '#f59e0b';
    if (price > 25) return '#22c55e';
    return '#3b82f6';
};

const getPotentialColor = (score: number): string => {
    if (score >= 85) return '#22d3ee';
    if (score >= 70) return '#60a5fa';
    if (score >= 50) return '#818cf8';
    return '#a78bfa';
};

// Map Updater Component
function MapUpdater({ district, listings }: { district?: string, listings?: Listing[] }) {
    const map = useMap();

    // Dictionary of District Coordinates (For centers)
    const DISTRICT_COORDS: Record<string, [number, number]> = {
        // Hà Nội
        'Quận Ba Đình': [21.0341, 105.8291], 'Quận Bắc Từ Liêm': [21.0625, 105.7486], 'Quận Cầu Giấy': [21.0366, 105.7932],
        'Quận Hai Bà Trưng': [21.0090, 105.8569], 'Quận Hoàn Kiếm': [21.0285, 105.8542], 'Quận Hoàng Mai': [20.9760, 105.8534],
        'Quận Hà Đông': [20.9634, 105.7705], 'Quận Long Biên': [21.0396, 105.9080], 'Quận Nam Từ Liêm': [21.0127, 105.7608],
        'Quận Thanh Xuân': [20.9937, 105.8114], 'Quận Tây Hồ': [21.0624, 105.8126], 'Quận Đống Đa': [21.0152, 105.8247],
        // TP.HCM
        'Quận 1': [10.7769, 106.7009], 'Quận 3': [10.7844, 106.6843], 'Quận 4': [10.7578, 106.7072],
        'Quận 5': [10.7538, 106.6634], 'Quận 7': [10.7327, 106.7161], 'Quận 10': [10.7725, 106.6681],
        'Quận 11': [10.7645, 106.6508], 'Quận Bình Thạnh': [10.8106, 106.7091], 'Quận Gò Vấp': [10.8387, 106.6666],
        'Quận Phú Nhuận': [10.7992, 106.6814], 'Quận Tân Bình': [10.8037, 106.6582], 'Thành phố Thủ Đức': [10.8494, 106.7537],
        // Đà Nẵng
        'Quận Cẩm Lệ': [16.02, 108.20], 'Quận Hải Châu': [16.06, 108.22], 'Quận Liên Chiểu': [16.09, 108.14],
        'Quận Ngũ Hành Sơn': [16.00, 108.25], 'Quận Sơn Trà': [16.10, 108.24], 'Quận Thanh Khê': [16.06, 108.18],
        'Quận Ninh Kiều': [10.03, 105.78], 'Thành phố Dĩ An': [10.92, 106.75], 'Thành phố Biên Hòa': [10.95, 106.82]
    };

    useEffect(() => {
        if (listings && listings.length > 0) {
            try {
                const bounds = L.latLngBounds(listings.map(l => [l.latitude || l.lat, l.longitude || l.lon]));
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
                }
            } catch (e) {
                console.warn('Invalid bounds', e);
            }
        } else if (district && DISTRICT_COORDS[district]) {
            map.flyTo(DISTRICT_COORDS[district], 14, { duration: 1.5 });
        }
    }, [district, listings, map]);

    return null;
}

export default function LeafletMap({ listings, district, mode }: LeafletMapProps) {
    const getColor = (listing: Listing) => {
        return mode === 'price'
            ? getPriceColor(listing.price)
            : getPotentialColor(listing.ai?.potentialScore || 50);
    };

    const getRadius = (listing: Listing) => {
        const base = mode === 'price'
            ? (listing.views || 0) / 200
            : (listing.ai?.potentialScore || 50) / 10;
        return Math.max(5, Math.min(15, base));
    };

    return (
        <MapContainer
            center={[21.0285, 105.8542]}
            zoom={12}
            style={{ height: '100%', width: '100%', background: '#020617' }}
            className="z-0"
            preferCanvas={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapUpdater district={district} listings={listings} />

            {listings.map((listing) => (
                <CircleMarker
                    key={listing.id}
                    center={[listing.latitude || listing.lat, listing.longitude || listing.lon]}
                    pathOptions={{
                        color: getColor(listing),
                        fillColor: getColor(listing),
                        fillOpacity: 0.8,
                        weight: 2,
                        interactive: true
                    }}
                    radius={getRadius(listing)}
                >
                    <Tooltip sticky direction="top" offset={[0, -10]} opacity={1}>
                        <div className="z-[9999] text-xs font-bold text-slate-900 bg-white px-3 py-2 rounded shadow-xl border border-cyan-500 min-w-[120px]">
                            <div className="truncate font-extrabold text-blue-800">{listing.name}</div>
                            <div className="text-red-600 font-black text-sm mt-1">{listing.price} Triệu/th</div>
                        </div>
                    </Tooltip>
                    <Popup>
                        <div className="p-3 min-w-[220px] bg-slate-900 text-white rounded-lg">
                            <h3 className="font-bold text-sm text-cyan-400 mb-2 line-clamp-2">{listing.name}</h3>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Giá thuê:</span>
                                    <span className="font-bold text-green-400">{listing.price} tr/tháng</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Diện tích:</span>
                                    <span>{listing.area} m²</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">AI Score:</span>
                                    <span className="font-bold text-purple-400">{listing.ai?.potentialScore || 'N/A'}/100</span>
                                </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-white/10 text-xs text-gray-400">
                                📍 {listing.district}
                            </div>
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
}
