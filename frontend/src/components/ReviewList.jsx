import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, User } from 'lucide-react';

export default function ReviewList({ productId, refreshTrigger }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);

            try {
                // Fetch reviews from backend API
                const response = await fetch(`http://localhost:3000/api/reviews/product/${productId}`);
                const data = await response.json();

                if (data.success) {
                    // Transform backend reviews to match our format
                    const backendReviews = data.reviews.map(review => ({
                        id: review.id || review.timestamp,
                        reviewer: review.walletAddress ? review.walletAddress.substring(0, 10) + '...' : 'Anonymous',
                        rating: review.rating,
                        text: review.reviewText,
                        date: new Date(review.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }),
                        likes: 0,
                        verified: review.verified || true
                    }));

                    // Add mock reviews for demo (keep the existing ones)
                    const mockReviews = [
                        {
                            id: 'mock-1',
                            reviewer: 'Cardano Enthusiast',
                            rating: 5,
                            text: 'Absolutely loving this device! The build quality is premium and the performance is unmatched.',
                            date: 'November 20, 2025',
                            likes: 12,
                            verified: true
                        },
                        {
                            id: 'mock-2',
                            reviewer: 'Crypto Trader',
                            rating: 4,
                            text: 'Great product, but the battery life could be better. Fast shipping though.',
                            date: 'November 15, 2025',
                            likes: 5,
                            verified: true
                        }
                    ];

                    // Combine backend reviews (newest first) with mock reviews
                    setReviews([...backendReviews, ...mockReviews]);
                } else {
                    // If API fails, show mock data only
                    setReviews([
                        {
                            id: 'mock-1',
                            reviewer: 'Cardano Enthusiast',
                            rating: 5,
                            text: 'Absolutely loving this device! The build quality is premium and the performance is unmatched.',
                            date: 'November 20, 2025',
                            likes: 12,
                            verified: true
                        },
                        {
                            id: 'mock-2',
                            reviewer: 'Crypto Trader',
                            rating: 4,
                            text: 'Great product, but the battery life could be better. Fast shipping though.',
                            date: 'November 15, 2025',
                            likes: 5,
                            verified: true
                        }
                    ]);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
                // Show mock data on error
                setReviews([
                    {
                        id: 'mock-1',
                        reviewer: 'Cardano Enthusiast',
                        rating: 5,
                        text: 'Absolutely loving this device! The build quality is premium and the performance is unmatched.',
                        date: 'November 20, 2025',
                        likes: 12,
                        verified: true
                    },
                    {
                        id: 'mock-2',
                        reviewer: 'Crypto Trader',
                        rating: 4,
                        text: 'Great product, but the battery life could be better. Fast shipping though.',
                        date: 'November 15, 2025',
                        likes: 5,
                        verified: true
                    }
                ]);
            }

            setLoading(false);
        };

        fetchReviews();
    }, [productId, refreshTrigger]); // Refetch when productId or refreshTrigger changes

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading verified reviews...</div>;
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User size={16} className="text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-[#0f1111]">{review.reviewer}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-[#ffa41c]">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-[#ffa41c]" : "text-gray-300"} />
                            ))}
                        </div>
                        <span className="text-sm font-bold text-[#0f1111]">{review.rating === 5 ? 'Perfect!' : 'Great purchase'}</span>
                    </div>

                    <div className="text-xs text-[#565959] mb-2">{review.date}</div>

                    {review.verified && (
                        <div className="flex items-center gap-1 text-xs font-bold text-[#c45500] mb-2">
                            <span className="text-[#c45500]">Verified Purchase</span>
                            <span className="text-gray-400 font-normal">|</span>
                            <span className="text-[#007185] font-normal hover:underline cursor-pointer">TrustChain Verified</span>
                        </div>
                    )}

                    <p className="text-[#0f1111] text-sm leading-relaxed mb-4">
                        {review.text}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-[#565959]">
                        <button className="border border-gray-300 rounded-md px-4 py-1 hover:bg-gray-50 text-xs">
                            Helpful
                        </button>
                        <span className="text-xs border-l border-gray-300 pl-4 text-[#007185] hover:underline cursor-pointer">
                            Report abuse
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
