'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Dynamic import for Leaflet components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Interface for Heatmap Data Points
interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number; // 0-1 (Price or Demand)
  price: number;
}

// Mock Data
const MOCK_POINTS: HeatmapPoint[] = [
  { lat: 10.7769, lng: 106.7009, intensity: 0.9, price: 2500 }, // Bitexco
  { lat: 10.7721, lng: 106.6983, intensity: 0.8, price: 1800 }, // Ben Thanh
  { lat: 10.7796, lng: 106.6990, intensity: 0.7, price: 1500 }, // Notre Dame
  { lat: 10.7626, lng: 106.6823, intensity: 0.6, price: 1200 }, // District 5 border
  { lat: 10.7826, lng: 106.6963, intensity: 0.85, price: 2100 }, // Turtle Lake
];

export default function RentalHeatmap() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="w-full h-full bg-slate-900 animate-pulse rounded-xl flex items-center justify-center text-cyan-500">Loading JFinder Map...</div>;
  }

  const getColor = (intensity: number) => {
    return intensity > 0.8 ? '#22d3ee' : // Cyan - High (JFinder Theme)
      intensity > 0.6 ? '#60a5fa' : // Blue - Med-High
        intensity > 0.4 ? '#818cf8' : // Indigo - Med
          '#a78bfa';  // Purple - Low
  };

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-2xl border border-white/10 relative z-0">
      {/* @ts-ignore */}
      <MapContainer
        center={[10.7769, 106.7009]}
        zoom={14}
        style={{ height: '100%', width: '100%', background: '#020617' }}
        className="z-0"
      >
        {/* CARTODB DARK MATTER TILES (FREE, NO KEY, DARK THEME) */}
        {/* @ts-ignore */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {MOCK_POINTS.map((point, idx) => (
          // @ts-ignore
          <CircleMarker
            key={idx}
            center={[point.lat, point.lng]}
            pathOptions={{
              color: getColor(point.intensity),
              fillColor: getColor(point.intensity),
              fillOpacity: 0.6,
              weight: 1
            }}
            radius={18}
          >
            {/* @ts-ignore */}
            <Popup>
              <div className="p-2 text-center bg-slate-900 text-white border-0">
                <h3 className="font-bold text-lg text-cyan-400">${point.price}</h3>
                <p className="text-sm text-gray-400">Rent per month</p>
                <div className="mt-2 text-xs font-semibold px-2 py-1 rounded bg-cyan-900/50 text-cyan-200 inline-block">
                  Demand: {point.intensity * 100}%
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend Overlay - Dark Mode */}
      <div className="absolute top-4 right-4 glass-panel p-4 rounded-lg shadow-lg z-[1000] space-y-2 border border-white/10">
        <h4 className="font-bold text-cyan-400 text-sm mb-2 uppercase tracking-wider">Market Heatmap</h4>
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div> High ($2000+)
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <div className="w-4 h-4 rounded-full bg-blue-400"></div> Medium ($1500+)
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <div className="w-4 h-4 rounded-full bg-purple-400"></div> Low (&lt;$1200)
        </div>
      </div>
    </div>
  );
}
