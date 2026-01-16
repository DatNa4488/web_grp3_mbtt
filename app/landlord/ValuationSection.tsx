'use client';

import { useState } from 'react';
import { Loader2, DollarSign } from 'lucide-react';
import { getValuation } from '@/lib/api';
import { PROVINCES, getDistrictsByProvince, getProvinceShortName } from '@/lib/districts';

export default function ValuationSection() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        province: '',
        district: '',
        area: 80,
        frontage: 5,
        floors: 2,
        type: 'shophouse'
    });
    const [result, setResult] = useState<any>(null);

    const handleValuation = async () => {
        setLoading(true);
        try {
            const data = await getValuation({
                district: formData.district || 'Quận 1',
                area: formData.area,
                frontage: formData.frontage,
                floors: formData.floors,
                type: formData.type
            });
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card rounded-3xl p-1 border border-white/10 relative overflow-hidden mt-12">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-[20px] p-8 md:p-12">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                    <span className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white shadow-lg shadow-cyan-500/20">
                        <DollarSign className="w-5 h-5" />
                    </span>
                    Công Cụ Định Giá Thông Minh (AI Valuation)
                </h2>

                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Province Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Thành Phố</label>
                            <select
                                value={formData.province}
                                onChange={e => setFormData({ ...formData, province: e.target.value, district: '' })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all cursor-pointer"
                            >
                                <option value="">Chọn thành phố</option>
                                {PROVINCES.map(p => (
                                    <option key={p} value={p}>{getProvinceShortName(p)}</option>
                                ))}
                            </select>
                        </div>

                        {/* District Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Quận / Huyện</label>
                            <select
                                value={formData.district}
                                onChange={e => setFormData({ ...formData, district: e.target.value })}
                                disabled={!formData.province}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none disabled:opacity-50 transition-all cursor-pointer"
                            >
                                <option value="">{formData.province ? 'Chọn quận' : 'Vui lòng chọn TP trước'}</option>
                                {formData.province && getDistrictsByProvince(formData.province).map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        {/* Other Inputs */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Diện Tích (m²)</label>
                            <input
                                type="number"
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Mặt Tiền (m)</label>
                            <input
                                type="number"
                                value={formData.frontage}
                                onChange={(e) => setFormData({ ...formData, frontage: Number(e.target.value) })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Số Tầng</label>
                            <input
                                type="number"
                                value={formData.floors}
                                onChange={(e) => setFormData({ ...formData, floors: Number(e.target.value) })}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-cyan-500/30 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex-1">
                            <div className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-1">Mức Giá AI Gợi Ý</div>
                            {result ? (
                                <div className="animate-fade-in-up">
                                    <div className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-baseline gap-2">
                                        {result.priceRange.min} - {result.priceRange.max} <span className="text-lg font-medium text-gray-400">Triệu / Tháng</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Độ tin cậy: <span className="text-green-400 font-bold">{result.riskLevel === 'low' ? 'Cao' : 'Trung bình'}</span> •
                                        Điểm tiềm năng: <span className="text-cyan-400 font-bold">{result.potentialScore}/100</span>
                                    </p>
                                </div>
                            ) : (
                                <div className="text-gray-500 text-lg italic">
                                    Nhập thông tin và bấm nút để định giá...
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleValuation}
                            disabled={loading}
                            type="button"
                            className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:bg-cyan-50 transition-colors shadow-xl text-nowrap flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Đang Tính Toán...' : 'Định Giá Ngay'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
