'use client';

import { useActionState, useState } from 'react';
import { createListing } from '@/app/lib/actions';
import { PROVINCES, getDistrictsByProvince } from '@/lib/districts';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';

export default function CreateListingPage() {
    const [state, formAction, isPending] = useActionState(createListing, null);

    // Local state for form fields to support "Fill Demo Data"
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [area, setArea] = useState('');
    const [address, setAddress] = useState('');
    const [type, setType] = useState('retail');
    const [ownerName, setOwnerName] = useState('');
    const [ownerPhone, setOwnerPhone] = useState('');

    // Local state for dependent dropdowns
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');

    const fillDemoData = () => {
        setTitle('Mặt bằng kinh doanh sầm uất Nguyễn Huệ');
        setPrice('150');
        setArea('120');
        setAddress('68 Nguyễn Huệ, Phường Bến Nghé');
        setType('shophouse');
        setOwnerName('Nguyễn Văn A');
        setOwnerPhone('0909123456');
        setProvince('Hồ Chí Minh');
        setDistrict('Quận 1');
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 bg-slate-950">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <Link href="/landlord" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Quay lại
                    </Link>
                    <button
                        type="button"
                        onClick={fillDemoData}
                        className="text-xs font-bold px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
                    >
                        ⚡ Điền Dữ Liệu Mẫu
                    </button>
                </div>

                <div className="glass-card p-8 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl">
                    <h1 className="text-3xl font-bold text-white mb-2">Đăng Tin Mới</h1>
                    <p className="text-gray-400 mb-8">Điền thông tin chi tiết để tiếp cận hàng ngàn khách thuê.</p>

                    <form action={formAction} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Tiêu đề tin đăng *</label>
                            <input
                                name="title"
                                type="text"
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ví dụ: Cho thuê mặt bằng Quận 1, vị trí đắc địa..."
                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Province */}
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Thành Phố *</label>
                                <select
                                    name="city"
                                    required
                                    value={province}
                                    onChange={e => {
                                        setProvince(e.target.value);
                                        setDistrict(''); // Reset district
                                    }}
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                                >
                                    <option value="">Chọn thành phố</option>
                                    {PROVINCES.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>

                            {/* District */}
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Quận / Huyện *</label>
                                <select
                                    name="district"
                                    required
                                    value={district}
                                    onChange={e => setDistrict(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                                >
                                    <option value="">{province ? 'Chọn quận/huyện' : 'Chọn TP trước'}</option>
                                    {province && getDistrictsByProvince(province).map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Địa chỉ chi tiết</label>
                            <input
                                name="address"
                                type="text"
                                required
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder="Số nhà, tên đường..."
                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Price */}
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Giá thuê (Triệu/tháng) *</label>
                                <input
                                    name="price"
                                    type="number"
                                    required
                                    min="0"
                                    step="0.1"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all"
                                />
                            </div>

                            {/* Area */}
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Diện tích (m²) *</label>
                                <input
                                    name="area"
                                    type="number"
                                    required
                                    min="0"
                                    value={area}
                                    onChange={e => setArea(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Loại hình</label>
                            <select
                                name="type"
                                required
                                value={type}
                                onChange={e => setType(e.target.value)}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                            >
                                <option value="retail">Mặt bằng bán lẻ (Retail)</option>
                                <option value="office">Văn phòng (Office)</option>
                                <option value="shophouse">Shophouse</option>
                                <option value="kiosk">Kiosk</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Tên người liên hệ</label>
                                <input
                                    name="ownerName"
                                    type="text"
                                    value={ownerName}
                                    onChange={e => setOwnerName(e.target.value)}
                                    placeholder="Tên chủ nhà"
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Số điện thoại</label>
                                <input
                                    name="ownerPhone"
                                    type="text"
                                    value={ownerPhone}
                                    onChange={e => setOwnerPhone(e.target.value)}
                                    placeholder="09xx..."
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Hình ảnh mặt bằng *</label>
                            <div className="flex gap-2 items-center">
                                <label className="flex-1 cursor-pointer">
                                    <div className="bg-slate-800/50 border border-white/10 hover:border-cyan-500 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:text-cyan-400 transition-all group h-32">
                                        <Upload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-medium">Click để tải ảnh lên (Max 5MB)</span>
                                    </div>
                                    <input
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Error Message */}
                        {state?.message && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold">
                                {state.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-white hover:opacity-90 transition-opacity flex justify-center items-center gap-2 disabled:opacity-50"
                        >
                            {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                            {isPending ? 'Đang Xử Lý...' : 'Đăng Tin Ngay'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
