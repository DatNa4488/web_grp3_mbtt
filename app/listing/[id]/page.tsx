import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import ImageGallery from '@/components/Listing/ImageGallery';
import { MapPin, TrendingUp, Eye, Calendar, Heart, Phone, User, Building2, School, Briefcase, Store } from 'lucide-react';
import Link from 'next/link';
import BackButton from './BackButton';
import ReviewSection from './ReviewSection';

// Removed unused MapComponent via next/dynamic to fix Server Component error

export default async function ListingDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  const id = params.id;

  // Fetch Listing from DB
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      // owner info is flat in model (ownerName, ownerPhone) or via landlord relation
      reviews: {
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!listing) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Không tìm thấy mặt bằng</h2>
          <Link
            href="/search"
            className="mt-4 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white font-bold inline-block"
          >
            Quay lại tìm kiếm
          </Link>
        </div>
      </div>
    );
  }

  // Normalize data for UI if needed (handling optional fields)
  // Schema has ai_suggetedPrice etc.
  const aiData = {
    suggestedPrice: listing.ai_suggestedPrice || 0,
    potentialScore: listing.ai_potentialScore || 50,
    riskLevel: listing.ai_riskLevel || 'medium',
    priceLabel: listing.ai_priceLabel || 'fair'
  };

  const priceLabel = aiData.priceLabel === 'cheap'
    ? { text: 'Giá Tốt', color: 'bg-green-500/10 text-green-400 border-green-500/20' }
    : aiData.priceLabel === 'expensive'
      ? { text: 'Giá Cao', color: 'bg-red-500/10 text-red-400 border-red-500/20' }
      : { text: 'Hợp Lý', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };

  // Owner info: prioritize specific owner fields, fallback to landlord relation if we fetched it (but we didn't include it yet), or defaults
  const ownerInfo = {
    name: listing.ownerName || 'Chính Chủ',
    phone: listing.ownerPhone || 'Liên hệ'
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 bg-slate-950">
      <div className="max-w-7xl mx-auto">

        {/* Back Button - Sticky */}
        <div className="sticky top-20 z-10 mb-6 bg-[#0f172a]/80 backdrop-blur-md py-2 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-white/5">
          <BackButton />
        </div>

        {/* Image Gallery */}
        <ImageGallery images={listing.images || []} title={listing.name || listing.title || 'Mặt bằng'} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

          {/* Left Column: Property Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header */}
            <div className="glass-card rounded-2xl p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-black text-white mb-2">{listing.name || listing.title}</h1>
                  <p className="text-gray-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {listing.city || listing.province} - {listing.district}
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${priceLabel.color}`}>
                  {priceLabel.text}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-black text-green-400">{listing.price} Tr</div>
                  <div className="text-xs text-gray-500 mt-1">Giá thuê / tháng</div>
                </div>
                {listing.area > 0 && (
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <div className="text-2xl font-black text-cyan-400">{(listing.price / listing.area * 1000).toFixed(0)}k/m²</div>
                    <div className="text-xs text-gray-500 mt-1">Giá thuê / m²</div>
                  </div>
                )}
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-black text-white">{listing.area} m²</div>
                  <div className="text-xs text-gray-500 mt-1">Diện tích</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-black text-white">{listing.frontage || '-'}m</div>
                  <div className="text-xs text-gray-500 mt-1">Mặt tiền</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl font-black text-white">{listing.floors || 1}</div>
                  <div className="text-xs text-gray-500 mt-1">Số tầng</div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Phân Tích AI
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-500/10 to-transparent p-6 rounded-xl border border-purple-500/20">
                  <div className="text-sm text-purple-300 mb-2">Điểm Tiềm Năng</div>
                  <div className="text-4xl font-black text-white">{aiData.potentialScore}/100</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/10 to-transparent p-6 rounded-xl border border-cyan-500/20">
                  <div className="text-sm text-cyan-300 mb-2">Giá Gợi Ý</div>
                  <div className="text-4xl font-black text-white">{aiData.suggestedPrice} Tr</div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-white/5 rounded-lg">
                <div className="text-sm text-gray-400">
                  Mức độ rủi ro: <span className={`font-bold ${aiData.riskLevel === 'low' ? 'text-green-400' :
                    aiData.riskLevel === 'high' ? 'text-red-400' : 'text-yellow-400'
                    }`}>{aiData.riskLevel === 'low' ? 'Thấp' : aiData.riskLevel === 'high' ? 'Cao' : 'Trung bình'}</span>
                </div>
              </div>
            </div>

            {/* Geo Analysis */}
            <LocationAnalytics district={listing.district} />

            {/* Reviews */}
            <ReviewSection listingId={id} reviews={listing.reviews} currentUser={session?.user} />

          </div>

          {/* Right Column: Contact & Stats */}
          <div className="space-y-6">

            {/* Owner Contact */}
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                Thông Tin Chủ Nhà
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">
                    {ownerInfo.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{ownerInfo.name}</div>
                    <div className="text-sm text-gray-400">{listing.ownerRole || 'Chủ sở hữu'}</div>
                  </div>
                </div>
                <a
                  href={`tel:${ownerInfo.phone}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-white font-bold transition-all"
                >
                  <Phone className="w-5 h-5" />
                  {ownerInfo.phone}
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Thống Kê</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Lượt xem
                  </span>
                  <span className="font-bold text-white">{listing.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Đăng ngày
                  </span>
                  <span className="font-bold text-white">{new Date(listing.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Loại hình
                  </span>
                  <span className="font-bold text-white capitalize">{listing.type}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
