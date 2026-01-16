'use client';

import { useActionState } from 'react';
import { submitReview } from '@/app/lib/actions';
import { Star, User } from 'lucide-react';
import { useState } from 'react';

// Define Prop Types locally or import
interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: Date;
    user: {
        name: string | null;
    }
}

export default function ReviewSection({ listingId, reviews, currentUser }: { listingId: string, reviews: Review[], currentUser: any }) {
    const [rating, setRating] = useState(5);
    const [state, formAction, isPending] = useActionState(async (prev: any, formData: FormData) => {
        const result = await submitReview(listingId, rating, formData.get('comment') as string);
        return result;
    }, null);

    return (
        <div className="glass-card rounded-2xl p-8 mt-8 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6">Đánh Giá Từ Khách Thuê</h3>

            {/* Review List */}
            <div className="space-y-6 mb-10">
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{review.user.name || 'Người dùng ẩn danh'}</div>
                                        <div className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-300 pl-14">{review.comment}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 italic">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                )}
            </div>

            {/* Review Form */}
            {currentUser ? (
                <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                    <h4 className="font-bold text-white mb-4">Viết Đánh Giá Của Bạn</h4>
                    <form action={formAction}>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Mức độ hài lòng</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-400 mb-2">Nhận xét</label>
                            <textarea
                                name="comment"
                                required
                                placeholder="Chia sẻ trải nghiệm của bạn về mặt bằng này..."
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none transition-all h-24 resize-none"
                            ></textarea>
                        </div>

                        {state?.message && (
                            <div className={`p-3 mb-4 rounded-lg text-sm font-bold ${state.message === 'Success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {state.message === 'Success' ? 'Đã gửi đánh giá thành công!' : state.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold text-white transition-colors disabled:opacity-50"
                        >
                            {isPending ? 'Đang Gửi...' : 'Gửi Đánh Giá'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                    <p className="text-blue-200 mb-2">Bạn cần đăng nhập để viết đánh giá.</p>
                    {/* Add login link if needed */}
                </div>
            )}
        </div>
    );
}
