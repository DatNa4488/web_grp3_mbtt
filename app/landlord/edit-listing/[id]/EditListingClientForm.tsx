'use client';

import { useActionState, useState } from 'react';
import { updateListing } from '@/app/lib/actions';
import { PROVINCES, getDistrictsByProvince } from '@/lib/districts';
import { Loader2, Upload, Save } from 'lucide-react';

export default function EditListingClientForm({ listing }: { listing: any }) {
    const updateAction = updateListing.bind(null, listing.id);
    const [state, formAction, isPending] = useActionState(updateAction, null);

    // Local state initialized with listing data
    const [title, setTitle] = useState(listing.title || listing.name || '');
    const [price, setPrice] = useState(listing.price?.toString() || '');
    const [area, setArea] = useState(listing.area?.toString() || '');
    const [address, setAddress] = useState(listing.address || '');
    const [type, setType] = useState(listing.type || 'retail');
    const [ownerName, setOwnerName] = useState(listing.ownerName || '');
    const [ownerPhone, setOwnerPhone] = useState(listing.ownerPhone || '');

    // Dependent dropdowns
    const [province, setProvince] = useState(listing.city || listing.province || '');
    // If district doesn't match the new province logic, it might look empty, but that's acceptable for now.
    const [district, setDistrict] = useState(listing.district || '');

    return (
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
                    placeholder="Ví dụ: Cho thuê mặt bằng Quận 1..."
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

            {/* Image Section */}
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Hình ảnh (Chỉ upload nếu muốn thay đổi)</label>

                {/* Show existing image preview if available */}
                {listing.images && listing.images.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-1">Ảnh hiện tại:</p>
                        <img src={listing.images[0]} alt="Current" className="h-32 w-auto rounded-lg border border-white/10 object-cover" />
                    </div>
                )}

                <div className="flex gap-2 items-center">
                    <label className="flex-1 cursor-pointer">
                        <div className="bg-slate-800/50 border border-white/10 hover:border-cyan-500 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:text-cyan-400 transition-all group h-32">
                            <Upload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Click để thay đổi ảnh (nếu cần)</span>
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
                {isPending ? 'Đang Lưu...' : 'Lưu Thay Đổi'} <Save className="w-4 h-4 ml-1" />
            </button>
        </form>
    );
}
