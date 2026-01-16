
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Save } from 'lucide-react';
import { updateListing } from '@/app/lib/actions';
import { PROVINCES, getDistrictsByProvince } from '@/lib/districts';

export default async function EditListingPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const session = await auth();

    if (!session?.user || session.user.role !== 'LANDLORD') {
        redirect('/login');
    }

    const listing = await prisma.listing.findUnique({
        where: { id },
    });

    if (!listing || listing.landlordId !== session.user.id) {
        redirect('/landlord');
    }

    const updateListingWithId = updateListing.bind(null, id);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 bg-slate-950">
            <div className="max-w-2xl mx-auto">
                <Link href="/landlord" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Quay lại
                </Link>

                <div className="glass-card p-8 rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl">
                    <h1 className="text-3xl font-bold text-white mb-2">Chỉnh Sửa Tin Đăng</h1>
                    <p className="text-gray-400 mb-8">Cập nhật thông tin chi tiết cho mặt bằng của bạn.</p>

                    <form action={updateListingWithId} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Tiêu đề tin đăng *</label>
                            <input
                                name="title"
                                type="text"
                                required
                                defaultValue={listing.title || listing.name}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Province (Static for now/simplify or make client component if need dynamic district) */}
                            {/* For simplicity in Server Component edit, we assume city doesn't change OR we use a client wrapper.
                                Because district depends on city, a client component is better.
                                However, to save time/complexity, standard HTML select works but UX is lower.
                                Let's use a Client Component wrapper if we want dynamic.
                                OR just render purely server side and if they change city, district options won't update?
                                Ah, `create-listing` uses client state.
                                I'll copy the client-side approach from create-listing basically.
                                But this is a Server Component page fetching data.
                                I'll wrap the form in a Client Component `EditListingForm`.
                            */}
                            {/* Server Component Part */}
                            <EditListingClientForm listing={listing} />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Separate Client Component for the Form to handle State
import EditListingClientForm from './EditListingClientForm';
