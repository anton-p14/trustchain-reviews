import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, ShieldCheck, Lock, MapPin } from 'lucide-react';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import useWallet from '../hooks/useWallet';

export default function ProductDetail({ product, onBack, address, isConnected, connectWallet, wallet }) {
    console.log("ProductDetail.jsx - Props:", { address, isConnected });
    // Removed internal useWallet hook to rely on props from App.jsx
    const [newReview, setNewReview] = useState(null);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [refreshReviews, setRefreshReviews] = useState(0); // Trigger to refresh reviews

    const handleReviewSubmitted = (review) => {
        console.log("ProductDetail received review:", review);
        setNewReview(review);
        setRefreshReviews(prev => prev + 1); // Trigger refresh
        console.log("newReview state updated and refresh triggered");
    };

    const handleBuy = async () => {
        if (!isConnected) {
            connectWallet();
            return;
        }

        setIsBuying(true);
        try {
            const res = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ walletAddress: address, productId: product.id })
            });
            const data = await res.json();
            if (data.success) {
                setHasPurchased(true);
                alert("Purchase Successful! You can now review this product.");
            }
        } catch (err) {
            console.error("Buy failed", err);
        } finally {
            setIsBuying(false);
        }
    };

    return (
        <div className="bg-white min-h-screen pb-12">
            {/* Sub-nav for breadcrumbs */}
            <div className="bg-[#fafafa] border-b border-gray-200 px-4 py-2 text-xs text-[#565959] mb-4">
                <span className="hover:underline cursor-pointer" onClick={onBack}>Back to results</span>
                <span className="mx-2">›</span>
                <span className="font-bold text-[#c45500]">{product.name}</span>
            </div>

            <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Left Column: Image (5 cols) */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24">
                            <div className="flex justify-center items-center h-[500px]">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Center Column: Details (4 cols) */}
                    <div className="lg:col-span-4 space-y-4">
                        <h1 className="text-2xl font-medium text-[#0f1111] leading-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
                            <div className="flex text-[#ffa41c]">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} className={i < Math.floor(product.rating) ? "text-[#ffa41c]" : "text-gray-300"} />
                                ))}
                            </div>
                            <span className="text-[#007185] hover:text-[#c7511f] hover:underline cursor-pointer text-sm font-medium">
                                {product.reviews} ratings
                            </span>
                            <span className="text-gray-300">|</span>
                            <span className="text-[#007185] text-sm">TrustChain Verified</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-start gap-1">
                                <span className="text-sm mt-1">$</span>
                                <span className="text-3xl font-medium text-[#0f1111]">{Math.floor(product.price)}</span>
                                <span className="text-sm mt-1">{product.price.toString().split('.')[1] || '00'}</span>
                            </div>
                            <div className="text-sm text-[#565959]">
                                No Import Fees Deposit & <span className="font-bold">Free Shipping</span> to Cardano City
                            </div>
                        </div>

                        <div className="py-4">
                            <h3 className="font-bold text-[#0f1111] mb-2">About this item</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-[#0f1111]">
                                <li>{product.description || "Experience the future of technology with this premium product."}</li>
                                <li>Verified authenticity via Cardano Blockchain.</li>
                                <li>Immutable reviews stored on IPFS.</li>
                                <li>Earn reputation tokens for every verified review.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Buy Box (3 cols) */}
                    <div className="lg:col-span-3">
                        <div className="amazon-card p-5 space-y-4 sticky top-24">
                            <div className="text-2xl font-medium text-[#b12704]">${product.price}</div>
                            <div className="text-sm text-[#007185]">
                                FREE delivery <span className="font-bold text-[#0f1111]">Tomorrow</span>
                            </div>
                            <div className="text-sm text-[#007185] flex items-center gap-1">
                                <MapPin size={14} /> Deliver to {address ? `${address.slice(0, 6)}...` : 'Select location'}
                            </div>
                            <div className="text-lg text-[#007600] font-medium">In Stock</div>

                            {!hasPurchased ? (
                                <button
                                    onClick={handleBuy}
                                    disabled={isBuying}
                                    className="w-full bg-[#ffd814] hover:bg-[#f7ca00] border border-[#fcd200] rounded-full py-2 text-sm text-[#0f1111] shadow-sm font-medium"
                                >
                                    {isBuying ? "Processing..." : "Add to Cart"}
                                </button>
                            ) : (
                                <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-center gap-2 text-green-800 text-sm">
                                    <ShieldCheck size={18} />
                                    <span className="font-bold">Verified Purchase</span>
                                </div>
                            )}

                            <button className="w-full bg-[#ffa41c] hover:bg-[#fa8900] border border-[#ff8f00] rounded-full py-2 text-sm text-[#0f1111] shadow-sm font-medium">
                                Buy Now
                            </button>

                            <div className="text-xs text-[#565959] space-y-1 pt-2">
                                <div className="grid grid-cols-2">
                                    <span>Ships from</span>
                                    <span>TrustChain</span>
                                </div>
                                <div className="grid grid-cols-2">
                                    <span>Sold by</span>
                                    <span>BinaryVerse</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 mt-12 pt-8 grid lg:grid-cols-12 gap-8">
                    {/* Review Sidebar */}
                    <div className="lg:col-span-4">
                        <h2 className="text-xl font-bold text-[#0f1111] mb-2">Customer reviews</h2>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex text-[#ffa41c]">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={20} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} className={i < Math.floor(product.rating) ? "text-[#ffa41c]" : "text-gray-300"} />
                                ))}
                            </div>
                            <span className="text-lg font-medium">{product.rating} out of 5</span>
                        </div>
                        <div className="text-sm text-[#565959] mb-6">{product.reviews} global ratings</div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="font-bold text-[#0f1111] mb-2">Review this product</h3>
                            <p className="text-sm text-[#0f1111] mb-4">Share your thoughts with other customers.</p>

                            {hasPurchased ? (
                                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                    <h4 className="font-bold mb-2">Write a Review</h4>
                                    <ReviewForm
                                        productSku={product.id}
                                        productName={product.name}
                                        onReviewSubmitted={handleReviewSubmitted}
                                        address={address}
                                        isConnected={isConnected}
                                        wallet={wallet}
                                    />
                                </div>
                            ) : (
                                <button className="w-full border border-gray-300 rounded-lg py-1 text-sm shadow-sm hover:bg-gray-50 bg-white opacity-50 cursor-not-allowed">
                                    Write a customer review (Verified Purchase Only)
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="lg:col-span-8">
                        <ReviewList productId={product.id} refreshTrigger={refreshReviews} />
                    </div>
                </div>
            </div>
        </div>
    );
}
