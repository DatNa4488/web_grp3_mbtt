'use client';

import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { MapPin, TrendingUp, Activity, Car, Coffee, ShoppingBag, Utensils } from 'lucide-react';

interface LocationAnalyticsProps {
    district: string;
}

// Mock Data for Analytics
const RADAR_DATA = [
    { subject: 'Ăn uống', A: 120, fullMark: 150 },
    { subject: 'Mua sắm', A: 98, fullMark: 150 },
    { subject: 'Giải trí', A: 86, fullMark: 150 },
    { subject: 'Giao thông', A: 99, fullMark: 150 },
    { subject: 'An ninh', A: 85, fullMark: 150 },
    { subject: 'Dân cư', A: 65, fullMark: 150 },
];

const TRAFFIC_DATA = [
    { name: 'Sáng', traffic: 4000 },
    { name: 'Trưa', traffic: 3000 },
    { name: 'Chiều', traffic: 2000 },
    { name: 'Tối', traffic: 2780 },
    { name: 'Khuy', traffic: 1890 },
];

export default function LocationAnalytics({ district }: LocationAnalyticsProps) {
    return (
        <div className="glass-card rounded-2xl p-8 mt-8 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Phân Tích Khu Vực: {district}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Radar Chart: Amenities Score */}
                <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-gray-400 mb-4 text-center">Chỉ Số Tiện Ích</h4>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={RADAR_DATA}>
                                <PolarGrid stroke="#ffffff20" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar
                                    name="Score"
                                    dataKey="A"
                                    stroke="#06b6d4"
                                    strokeWidth={2}
                                    fill="#06b6d4"
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart: Traffic Density */}
                <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-gray-400 mb-4 text-center">Lưu Lượng Giao Thông (Giả lập)</h4>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={TRAFFIC_DATA}>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="traffic" radius={[4, 4, 0, 0]}>
                                    {TRAFFIC_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 3 ? '#22d3ee' : '#334155'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Quick Stats Tags */}
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
                <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2 text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-bold">Khu vực đang phát triển mạnh</span>
                </div>
                <div className="px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center gap-2 text-orange-400">
                    <Car className="w-4 h-4" />
                    <span className="text-sm font-bold">Mật độ xe cao và giờ tan tầm</span>
                </div>
                <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center gap-2 text-purple-400">
                    <Utensils className="w-4 h-4" />
                    <span className="text-sm font-bold">Thiên đường ẩm thực</span>
                </div>
            </div>
        </div>
    );
}
