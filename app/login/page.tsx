'use client';

import { useActionState } from 'react';
// import { signIn } from 'next-auth/react'; // Client-side signin if needed, or use server action
// For now, let's use a server action or simple form submission
import { authenticate, authenticateGoogle } from '@/app/lib/actions'; // We need to create this action
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react'; // Check if Google icon exists or use generic
import Link from 'next/link';

function LoginButton() {
    const { pending } = useFormStatus();
    return (
        <button
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/30 flex justify-center items-center"
            aria-disabled={pending}
        >
            {pending ? <Loader2 className="animate-spin w-5 h-5" /> : 'Đăng Nhập'}
        </button>
    );
}

export default function LoginPage() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 flex justify-center items-center relative overflow-hidden">
            {/* Background blobs similar to Landing Page */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Chào Mừng Trở Lại!</h1>
                    <p className="text-gray-400">Đăng nhập để tiếp tục quản lý bất động sản.</p>
                </div>

                <form action={dispatch} className="space-y-4">
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

                    <div className="flex justify-end">
                        <Link href="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300">
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <LoginButton />

                    {errorMessage && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-sm rounded-lg text-center">
                            {errorMessage}
                        </div>
                    )}
                </form>

                <div className="my-6 flex items-center gap-4">
                    <div className="h-px bg-white/10 flex-1"></div>
                    <span className="text-gray-500 text-xs uppercase">Hoặc</span>
                    <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <form action={authenticateGoogle}>
                    <button
                        type="submit"
                        className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl transition-all hover:bg-gray-100 flex justify-center items-center gap-2"
                    >
                        {/* <Google className="w-5 h-5" /> */}
                        {/* Using text for Google if icon not available immediately */}
                        <span className="text-xl font-bold">G</span>
                        Đăng nhập bằng Google
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-400">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="text-cyan-400 font-bold hover:underline">
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </div>
    );
}
