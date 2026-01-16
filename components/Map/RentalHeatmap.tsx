'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { fetchListings, Listing } from '@/lib/api';

// Dynamic Import of the Map Component (SSR Safe)
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 animate-pulse rounded-xl flex items-center justify-center text-cyan-500">
      <div className="text-center">
        <div className="text-xl font-bold mb-2">JFinder Intelligence</div>
        <div className="text-sm text-gray-400">Loading map...</div>
      </div>
    </div>
  )
});

type HeatmapMode = 'price' | 'potential';

interface Props {
  filterDistrict?: string;
  filterType?: Listing['type'];
  filterPriceMax?: number;
  listings?: Listing[];
}

export default function RentalHeatmap({ filterDistrict, filterType, filterPriceMax, listings: externalListings }: Props) {
  const [mode, setMode] = useState<HeatmapMode>('price');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Nếu có external listings (từ Search page), dùng luôn
    if (externalListings) {
      setListings(externalListings);
      setLoading(false);
      return;
    }

    // Nếu không, tự fetch
    async function loadData() {
      setLoading(true);
      const data = await fetchListings({
        district: filterDistrict,
        type: filterType,
        maxPrice: filterPriceMax,
        limit: 500,
      });
      setListings(data);
      setLoading(false);
    }
    loadData();
  }, [filterDistrict, filterType, filterPriceMax, externalListings]);

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-2xl border border-white/10 relative z-0">
      {/* Mode Toggle */}
      <div className="absolute top-4 left-4 z-[1000] flex gap-2">
        <button
          onClick={() => setMode('price')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'price' ? 'bg-cyan-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
        >
          💰 Price Map
        </button>
        <button
          onClick={() => setMode('potential')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'potential' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
        >
          🎯 Potential Map
        </button>
      </div>

      {/* Stats Badge */}
      <div className="absolute top-4 right-20 z-[1000] glass-panel px-3 py-1.5 rounded-full">
        <span className="text-xs text-cyan-400 font-bold">
          {loading ? 'Loading...' : `${listings.length} listings (n8n API)`}
        </span>
      </div>

      <LeafletMap listings={listings} district={filterDistrict} mode={mode} />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 glass-panel p-4 rounded-lg shadow-lg z-[1000] space-y-2 border border-white/10">
        <h4 className="font-bold text-cyan-400 text-sm mb-2 uppercase tracking-wider">
          {mode === 'price' ? '💰 Price Heatmap' : '🎯 Potential Map'}
        </h4>
        {mode === 'price' ? (
          <>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <div className="w-4 h-4 rounded-full bg-red-500"></div> Cao (&gt;100tr)
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <div className="w-4 h-4 rounded-full bg-orange-500"></div> Trung bình (50-100tr)
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <div className="w-4 h-4 rounded-full bg-green-500"></div> Thấp (25-50tr)
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div> Rất thấp (&lt;25tr)
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <div className="w-4 h-4 rounded-full bg-cyan-400"></div> Rất cao (&gt;85)
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <div className="w-4 h-4 rounded-full bg-blue-400"></div> Cao (70-85)
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <div className="w-4 h-4 rounded-full bg-indigo-400"></div> Trung bình (50-70)
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <div className="w-4 h-4 rounded-full bg-purple-400"></div> Thấp (&lt;50)
            </div>
          </>
        )}
      </div>
    </div>
  );
}
