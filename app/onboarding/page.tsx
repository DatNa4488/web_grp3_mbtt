'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const { update } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    const handleRoleSelection = async (role: 'TENANT' | 'LANDLORD') => {
        setIsLoading(true);
        try {
            // Update session (in a real app, you'd also update the DB via an API route)
            // For now, let's assume we just redirect properly or update simple state
            // Since we are not saving role to DB in this step yet (need server action or API)
            // Ideally, we would call an API to update the user's role in the database.

            /* 
            // Example API call:
            await fetch('/api/user/role', { 
                method: 'POST', 
                body: JSON.stringify({ role }) 
            });
            */

            // Force refresh session to pick up changes if any
            await update({ role });

            // Redirect based on role
            // Landlord -> specialized Valuation Tool
            if (role === 'LANDLORD') {
                router.push('/landlord');
            } else {
                // Tenant -> AI Analysis (Their main tool)
                router.push('/analysis');
            }
        } catch (error) {
            console.error("Failed to update role", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 flex justify-center items-center relative overflow-hidden bg-slate-900">
            {/* Background blobs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-2xl bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 text-center">
                <h1 className="text-3xl md:text-4xl font-black text-white mb-4">Chào mừng đến với JFinder!</h1>
                <p className="text-gray-400 text-lg mb-10">
                    Để bắt đầu, hãy cho chúng tôi biết mục đích sử dụng của bạn.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tenant Option */}
                    <button
                        onClick={() => handleRoleSelection('TENANT')}
                        disabled={isLoading}
                        className="group relative p-6 bg-slate-800/50 border border-white/10 rounded-2xl hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all text-left"
                    >
                        <div className="text-5xl mb-4">🏠</div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400">Tôi muốn thuê mặt bằng</h3>
                        <p className="text-sm text-gray-400">
                            Tìm kiếm, phân tích và so sánh các địa điểm kinh doanh phù hợp nhất.
                        </p>
                    </button>

                    {/* Landlord Option */}
                    <button
                        onClick={() => handleRoleSelection('LANDLORD')}
                        disabled={isLoading}
                        className="group relative p-6 bg-slate-800/50 border border-white/10 rounded-2xl hover:bg-green-500/10 hover:border-green-500/50 transition-all text-left"
                    >
                        <div className="text-5xl mb-4">🔑</div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400">Tôi là chủ nhà</h3>
                        <p className="text-sm text-gray-400">
                            Đăng tin, quản lý bất động sản và tiếp cận khách thuê tiềm năng.
                        </p>
                    </button>
                </div>

                {isLoading && (
                    <div className="mt-8 flex justify-center text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Đang xử lý...
                    </div>
                )}
            </div>
        </div>
    );
}
