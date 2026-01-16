'use client';

import { useSession } from 'next-auth/react';
import { User, Mail, Shield, Award, Calendar } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
    const { data: session } = useSession();

    if (!session) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 flex items-center justify-center">
                <div className="text-center text-gray-400">
                    Vui lòng <a href="/login" className="text-cyan-400 font-bold hover:underline">đăng nhập</a> để xem thông tin.
                </div>
            </div>
        );
    }

    const user = session.user;

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 relative overflow-hidden bg-slate-900">
            {/* Background Decor */}
            <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Hồ Sơ Người Dùng</h1>
                    <p className="text-gray-400">Quản lý thông tin cá nhân và tài khoản.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & Basic Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center shadow-xl">
                            <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/5 ring-2 ring-cyan-500/50">
                                {user?.image ? (
                                    <img
                                        src={user.image}
                                        alt={user.name || 'User Avatar'}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-gray-400">
                                        <User className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">{user?.name}</h2>
                            <p className="text-sm text-gray-400 mb-3">{user?.email}</p>
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${user?.role === 'LANDLORD'
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                }`}>
                                {user?.role || 'USER'}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Detailed Info */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-cyan-400" />
                                Thông Tin Chi Tiết
                            </h3>

                            <div className="space-y-6">
                                <div className="group">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Họ và Tên</label>
                                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                                        <User className="w-5 h-5 text-cyan-400" />
                                        <span className="text-white font-medium">{user?.name}</span>
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                                        <Mail className="w-5 h-5 text-purple-400" />
                                        <span className="text-white font-medium">{user?.email}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vai Trò</label>
                                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                                            <Award className="w-5 h-5 text-yellow-400" />
                                            <span className="text-white font-medium">{user?.role}</span>
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ID Tài Khoản</label>
                                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                                            <Calendar className="w-5 h-5 text-green-400" />
                                            <span className="text-white font-medium text-xs truncate" title={user?.id}>{user?.id?.slice(0, 8)}...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Stats or Additional Info could go here */}
                    </div>
                </div>
            </div>
        </div>
    );
}
