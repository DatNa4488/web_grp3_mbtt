'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group w-fit"
        >
            <div className="p-2 rounded-full bg-white/5 group-hover:bg-cyan-500/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
            </div>
            <span className="font-semibold text-sm uppercase tracking-wide">Quay lại</span>
        </button>
    );
}
