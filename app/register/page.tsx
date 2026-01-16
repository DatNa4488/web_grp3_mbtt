'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

import { createAccount, authenticateGoogle } from '@/app/lib/actions';

function RegisterButton() {
    const { pending } = useFormStatus();
    return (
        <button
            className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/30 flex justify-center items-center"
            aria-disabled={pending}
        >
            {pending ? <Loader2 className="animate-spin w-5 h-5" /> : 'Tạo Tài Khoản'}
        </button>
    );
}

export default function RegisterPage() {
    const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [errorMessage, dispatch] = useActionState(createAccount, undefined);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 flex justify-center items-center relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-green-500/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Đăng Ký Mới</h1>
                    <p className="text-gray-400">Tham gia cộng đồng JFinder ngay hôm nay.</p>
                </div>

                {/* Role Selection Tabs */}
                <div className="flex p-1 bg-slate-800 rounded-xl mb-6">
                    <button
                        type="button"
                        onClick={() => setRole('tenant')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'tenant' ? 'bg-cyan-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Khách Thuê
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('landlord')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'landlord' ? 'bg-green-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Chủ Nhà
                    </button>
                </div>

                <form action={dispatch} className="space-y-4">
                    <input type="hidden" name="role" value={role.toUpperCase()} />

                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Họ & Tên</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Nguyễn Văn A"
                            required
                            className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 focus:bg-slate-800 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="example@gmail.com"
                            required
                            className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 focus:bg-slate-800 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Mật Khẩu</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 focus:bg-slate-800 outline-none transition-all"
                        />
                    </div>

                    <RegisterButton />

                    {errorMessage && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg text-center">
                            {errorMessage}
                        </div>
                    )}
                </form>

                <div className="my-6">
                    <form action={authenticateGoogle}>
                        <button
                            type="submit"
                            className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl transition-all hover:bg-gray-100 flex justify-center items-center gap-2"
                        >
                            <span className="text-xl font-bold">G</span>
                            Đăng ký bằng Google
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center text-sm text-gray-400">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="text-cyan-400 font-bold hover:underline">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}
