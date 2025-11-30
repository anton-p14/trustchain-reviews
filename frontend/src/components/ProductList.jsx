import React, { useState, useEffect } from "react";
import { Star, Check } from 'lucide-react';

export default function ProductList({ onProductSelect }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3000/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch products:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="text-center py-20 text-black">Loading Store...</div>;

    return (
        <div className="max-w-[1500px] mx-auto px-4 py-6">
            {/* Hero Banner (Amazon Style) */}
            <div className="bg-white p-4 mb-6 shadow-sm border border-gray-200 text-center">
                <h2 className="text-xl font-bold text-gray-800">
                    TrustChain Verified Store
                </h2>
                <p className="text-sm text-gray-600">
                    Shop with confidence. Every review is verified on the Cardano blockchain.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="amazon-card flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => onProductSelect(product)}
                    >
                        {/* Image Area */}
                        <div className="bg-gray-50 h-64 p-4 flex items-center justify-center relative">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="max-h-full max-w-full object-contain mix-blend-multiply"
                            />
                        </div>

                        {/* Content Area */}
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-base font-medium text-[#0f1111] leading-snug hover:text-[#c7511f] hover:underline mb-1 line-clamp-2">
                                {product.name}
                            </h3>

                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-1">
                                <div className="flex text-[#ffa41c]">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} className={i < Math.floor(product.rating) ? "text-[#ffa41c]" : "text-gray-300"} />
                                    ))}
                                </div>
                                <span className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline ml-1">
                                    {product.reviews}
                                </span>
                            </div>

                            {/* Price */}
                            <div className="mb-2">
                                <span className="text-xs align-top">$</span>
                                <span className="text-2xl font-medium">{Math.floor(product.price)}</span>
                                <span className="text-xs align-top">{product.price.toString().split('.')[1] || '00'}</span>
                            </div>

                            {/* Prime / Verified Badge */}
                            <div className="flex items-center gap-1 mb-2 text-xs text-[#565959]">
                                <span className="text-[#007185] font-bold flex items-center gap-0.5">
                                    <Check size={14} className="text-orange-500" />
                                    TrustChain Verified
                                </span>
                                <span>Get it by <span className="font-bold text-[#0f1111]">Tomorrow</span></span>
                            </div>

                            <div className="mt-auto">
                                <button className="w-full bg-[#ffd814] hover:bg-[#f7ca00] border border-[#fcd200] rounded-full py-1.5 text-sm text-[#0f1111] shadow-sm">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
