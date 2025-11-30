import React, { useState, useEffect } from "react";
import { Star, Send, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function ReviewForm({
    isConnected,
    address,
    productSku,
    productName,
    onReviewSubmitted,
    wallet
}) {
    const [reviewText, setReviewText] = useState("");
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState(null); // 'success' or 'error'
    const [message, setMessage] = useState('');
    const [hasReviewed, setHasReviewed] = useState(false);

    // Check local storage for previous reviews
    useEffect(() => {
        if (address && productSku) {
            const reviewed = localStorage.getItem(`review_${address}_${productSku}`);
            if (reviewed) {
                setHasReviewed(true);
            }
        }
    }, [address, productSku]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isConnected) {
            setStatus('error');
            setMessage('Please connect your wallet first.');
            return;
        }

        if (rating === 0) {
            setStatus('error');
            setMessage('Please select a star rating.');
            return;
        }

        if (reviewText.trim().length < 10) {
            setStatus('error');
            setMessage('Review must be at least 10 characters long.');
            return;
        }

        setIsSubmitting(true);
        setStatus(null);
        setMessage('Building transaction...');

        try {
            const reviewData = {
                walletAddress: address,
                productSku,
                rating,
                reviewText,
                reviewerPubKeyHash: 'mock_pubkey_hash'
            };
            console.log("Sending data:", reviewData);

            // Step 1: Build transaction
            const response = await fetch('http://localhost:3000/api/reviews/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            });

            const data = await response.json();
            console.log("Response data:", data);

            if (!data.success) {
                throw new Error(data.error || 'Submission failed');
            }

            // Step 2: Sign transaction (if not mock)
            if (data.data && data.data.unsignedTx && wallet) {
                setMessage('Please sign the transaction in your wallet...');
                try {
                    // Use partial signing (true) to get witness set, then merge on backend
                    const witnessCbor = await wallet.signTx(data.data.unsignedTx, true);

                    setMessage('Submitting transaction to blockchain...');

                    // Step 3: Submit unsigned tx + witnesses for backend to merge
                    const submitResponse = await fetch('http://localhost:3000/api/transaction/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            unsignedTxCbor: data.data.unsignedTx,
                            witnessCbor: witnessCbor
                        })
                    });

                    const submitData = await submitResponse.json();
                    if (!submitData.success) {
                        throw new Error(submitData.error || 'Transaction submission failed');
                    }
                    console.log("Transaction submitted:", submitData.txHash);
                } catch (signError) {
                    console.error("Signing error:", signError);
                    // If signing fails (e.g. user rejected), we stop here
                    throw new Error("Transaction signing failed: " + signError.message);
                }
            }

            // Mark as reviewed locally
            localStorage.setItem(`review_${address}_${productSku}`, 'true');
            setHasReviewed(true);

            setStatus('success');
            setMessage('Review submitted successfully! It is now being verified on the blockchain.');

            setReviewText('');

            if (onReviewSubmitted) {
                const reviewData = {
                    rating,
                    reviewText,
                    productSku,
                    productName
                };
                console.log("Calling onReviewSubmitted with:", reviewData);
                onReviewSubmitted(reviewData);
            }

        } catch (error) {
            console.error('Error submitting review:', error);
            setStatus('error');
            setMessage(error.message || 'Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (hasReviewed) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col items-center text-center">
                <CheckCircle size={48} className="text-green-500 mb-2" />
                <h3 className="text-lg font-bold text-green-800">Review Submitted</h3>
                <p className="text-green-700">Thank you for reviewing {productName}. Your feedback is verified.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Debug Info - Temporary for troubleshooting */}
            <div className="bg-gray-100 p-2 rounded text-xs font-mono text-gray-600 mb-2">
                <p><strong>Debug Status:</strong></p>
                <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
                <p>Address: {address ? `${address.slice(0, 15)}...` : 'None'}</p>
                {!isConnected && (
                    <button
                        type="button"
                        onClick={() => {
                            // Manually trigger a demo login via a hidden prop or global event if needed, 
                            // but since we can't easily reach up to App.jsx from here without props,
                            // we'll ask the user to use the Navbar or just refresh.
                            // Actually, let's try to reload the page to trigger the new useWallet logic.
                            window.location.reload();
                        }}
                        className="mt-2 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-black"
                    >
                        Retry Connection
                    </button>
                )}
            </div>

            {!isConnected && (
                <div className="bg-red-50 border border-red-200 p-3 rounded text-red-700 text-sm mb-4">
                    <p className="font-bold flex items-center gap-2"><AlertCircle size={16} /> Wallet Disconnected</p>
                    <p>Please connect your wallet to submit a review.</p>
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                    Overall Rating
                </label>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                            disabled={isSubmitting}
                        >
                            <Star
                                size={32}
                                className={`${star <= (hoverRating || rating)
                                    ? "fill-[#ffa41c] text-[#ffa41c]"
                                    : "text-gray-300"
                                    }`}
                            />
                        </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500 font-medium">
                        {rating > 0 ? (rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Fair' : 'Poor') : 'Select a rating'}
                    </span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                    Add a written review
                </label>
                <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="What did you like or dislike? What did you use this product for?"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#e77600] focus:border-transparent min-h-[120px] text-sm text-gray-900"
                    disabled={isSubmitting}
                />
            </div>

            {status === 'error' && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                    <AlertCircle size={16} />
                    {message}
                </div>
            )}

            <div className="flex justify-between items-center">
                <button
                    type="button"
                    onClick={() => {
                        localStorage.removeItem(`review_${address}_${productSku}`);
                        setHasReviewed(false);
                        setReviewText('');
                        setRating(0);
                        setStatus(null);
                        setMessage('');
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                    Reset Demo
                </button>

                <button
                    type="submit"
                    className={`
                        px-6 py-2 rounded-lg font-medium text-sm shadow-sm flex items-center gap-2
                        ${isSubmitting
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            : 'bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200]'}
                    `}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                    ) : (
                        <><Send size={16} /> Submit Review</>
                    )}
                </button>
            </div>
        </form>
    );
}
