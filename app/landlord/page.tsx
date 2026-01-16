import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Eye, Users, ArrowUpRight, Edit, MapPin } from 'lucide-react';
import ValuationSection from './ValuationSection';
import DeleteListingButton from './DeleteListingButton';

export default async function LandlordDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'LANDLORD') {
    redirect('/login');
  }

  // Fetch Landlord's Listings
  const myListings = await prisma.listing.findMany({
    where: { landlordId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate Personal Stats
  const totalViews = myListings.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalListings = myListings.length;
  // Mock leads
  const totalLeads = Math.round(totalViews / 15);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="inline-block px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full text-green-400 text-xs font-bold mb-4">
              DASHBOARD CHỦ NHÀ
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
              Xin chào, {session.user.name}
            </h1>
            <p className="text-gray-400">Quản lý tài sản và tối ưu hóa lợi nhuận.</p>
          </div>

          <Link
            href="/landlord/create-listing"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-white hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-5 h-5" /> Đăng Tin Mới
          </Link>
        </header>

        {/* Dashboard KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Tổng Lượt Xem', val: totalViews.toLocaleString(), sub: 'Trên tất cả tin đăng', icon: Eye, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Khách Quan Tâm', val: totalLeads.toLocaleString(), sub: 'Ước tính liên hệ', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { label: 'Tin Đang Hiển Thị', val: totalListings, sub: 'Đang hoạt động', icon: ArrowUpRight, color: 'text-green-400', bg: 'bg-green-500/10' }
          ].map((stat, idx) => (
            <div key={idx} className="glass-card p-6 rounded-2xl flex items-center gap-5 hover:bg-white/5 transition-colors border border-white/5">
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-3xl font-bold text-white leading-none mb-1">{stat.val}</div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* My Listings */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Tin Đăng Của Tôi</h2>

          {myListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map(listing => (
                <div key={listing.id} className="glass-card rounded-2xl overflow-hidden border border-white/10 group hover:border-cyan-500/50 transition-colors">
                  {/* Image */}
                  <div className="h-48 bg-slate-800 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={listing.images[0] || '/placeholder.jpg'}
                      alt={listing.title || listing.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-xs text-white font-bold">
                      {listing.views} Views
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{listing.title || listing.name}</h3>
                    <div className="text-cyan-400 font-bold mb-3">{listing.price} Triệu / Tháng</div>
                    <div className="text-sm text-gray-400 mb-4 line-clamp-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {listing.city || 'TP.HCM'} - {listing.district}
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/listing/${listing.id}`} className="flex-1 py-2 bg-white/5 rounded-lg text-center text-sm font-medium text-white hover:bg-white/10 transition-colors">
                        Xem Chi Tiết
                      </Link>
                      <Link href={`/landlord/edit-listing/${listing.id}`} className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-colors" title="Chỉnh sửa">
                        <Edit className="w-5 h-5" />
                      </Link>
                      <DeleteListingButton listingId={listing.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 border-dashed">
              <p className="text-gray-400 mb-4">Bạn chưa có tin đăng nào.</p>
              <Link
                href="/landlord/create-listing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 text-cyan-400 rounded-xl font-bold hover:bg-cyan-500/30 transition-colors"
              >
                <Plus className="w-5 h-5" /> Tạo Tin Đầu Tiên
              </Link>
            </div>
          )}
        </div>

        {/* Valuation Tool */}
        <ValuationSection />
      </div>
    </div>
  );
}
