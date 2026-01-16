'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { PROVINCES, getDistrictsByProvince } from '@/lib/districts';
import { searchListings } from '@/app/lib/actions';
import { Listing } from '@/lib/api';

const RentalHeatmap = dynamic(() => import('@/components/Map/RentalHeatmap'), { ssr: false });

export default function MapPage() {
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch data when district changes or on mount
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const data = await searchListings({
                province: province,
                district: district || undefined,
                limit: 2000 // Get all to show correct count
            });
            setListings(data as Listing[]);
            setLoading(false);
        }
        loadData();
    }, [district, province]);

    return (
        <div className="min-h-screen pt-20 bg-slate-900">

            {/* Map Section */}
            <div className="relative h-screen w-full border-b border-white/10">
                <div className="absolute top-4 left-4 z-[1000] max-w-xs w-full">
                    <div className="glass-card p-4 rounded-xl border border-white/10 shadow-2xl bg-slate-900/90 backdrop-blur-md">
                        <h1 className="text-lg font-bold text-white mb-2">Bản Đồ Nhiệt (Heatmap)</h1>
                        <div className="space-y-2">
                            {/* Province Selector */}
                            <div>
                                <select
                                    value={province}
                                    onChange={(e) => {
                                        setProvince(e.target.value);
                                        setDistrict(''); // Reset district when province changes
                                    }}
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-cyan-500 outline-none mb-2"
                                >
                                    <option value="">Toàn Quốc</option>
                                    {PROVINCES.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            {/* District Selector */}
                            <div>
                                <select
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-white text-sm focus:border-cyan-500 outline-none"
                                >
                                    <option value="">{province ? `Toàn ${province.replace('Thành phố ', '').replace('Tỉnh ', '')}` : 'Toàn Quốc'} ({listings.length})</option>
                                    {province && getDistrictsByProvince(province).map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                    {/* Temporary: Allow switching to mock HCM if needed, but user data is mainly Hanoi */}
                                </select>
                            </div>
                            {/* Province Selector (Hidden for now as main data is Hanoi, but ready to enable) */}
                            {/* <select className="...">...</select> */}

                            {/* Quick Filters */}
                            <div className="flex gap-2 text-[10px] text-gray-400">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Giá cao</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Giá thấp</span>
                            </div>
                        </div>
                    </div>
                </div>
                <RentalHeatmap filterDistrict={district} />
            </div>
        </div>
    );
}
