import React from 'react';
import { Wallet, Search, ShoppingCart, Menu } from 'lucide-react';

export default function Navbar({ isConnected, address, balance, isDemoMode, onConnect, onDisconnect }) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#131921] text-white shadow-md">
            {/* Main Header */}
            <div className="flex items-center justify-between h-16 px-4 gap-4 max-w-[1500px] mx-auto">
                {/* Logo */}
                <div className="flex items-center gap-1 hover:border hover:border-white p-1 rounded cursor-pointer transition-colors">
                    <span className="text-2xl font-bold tracking-tight">TrustChain</span>
                    <span className="text-xs text-orange-400 self-start mt-1">store</span>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-3xl hidden sm:flex h-10 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-orange-400">
                    <div className="bg-gray-100 text-gray-600 px-3 flex items-center text-xs border-r border-gray-300 cursor-pointer hover:bg-gray-200">
                        All
                    </div>
                    <input
                        type="text"
                        className="flex-1 px-3 text-black outline-none"
                        placeholder="Search for products..."
                    />
                    <button className="bg-[#febd69] hover:bg-[#f3a847] px-4 flex items-center justify-center text-slate-900 transition-colors">
                        <Search size={20} />
                    </button>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-6">
                    {/* Wallet / Account */}
                    <div
                        className="flex flex-col text-xs hover:border hover:border-white p-1 rounded cursor-pointer transition-colors relative group"
                    >
                        <div onClick={!isConnected ? onConnect : undefined}>
                            <span className="text-gray-300">
                                {isConnected ? (isDemoMode ? '🔴 DEMO MODE' : 'Wallet Connected') : 'Hello, Sign in'}
                            </span>
                            <span className="font-bold text-sm">
                                {isConnected ? (isDemoMode ? 'Demo User' : `${address.slice(0, 6)}...${address.slice(-4)}`) : 'Connect Wallet'}
                            </span>
                        </div>

                        {/* Dropdown for Disconnect */}
                        {isConnected && (
                            <div className="absolute top-full right-0 mt-1 w-32 bg-white text-black rounded shadow-lg hidden group-hover:block z-50">
                                <button
                                    onClick={onDisconnect}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 font-bold"
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Balance (Only if connected) */}
                    {isConnected && (
                        <div className="hidden md:flex flex-col text-xs hover:border hover:border-white p-1 rounded cursor-pointer">
                            <span className="text-gray-300">Balance</span>
                            <span className="font-bold text-sm text-[#febd69]">{balance ? balance.toFixed(2) : '0.00'} ₳</span>
                        </div>
                    )}

                    {/* Cart */}
                    <div className="flex items-end gap-1 hover:border hover:border-white p-1 rounded cursor-pointer transition-colors">
                        <div className="relative">
                            <ShoppingCart size={28} />
                            <span className="absolute -top-1 -right-1 bg-[#febd69] text-[#131921] text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                0
                            </span>
                        </div>
                        <span className="font-bold text-sm hidden md:block">Cart</span>
                    </div>
                </div>
            </div>

            {/* Sub Header - Simplified */}
            <div className="bg-[#232f3e] h-10 flex items-center px-4 gap-6 text-sm text-white overflow-x-auto max-w-[1500px] mx-auto">
                <div className="flex items-center gap-1 font-bold cursor-pointer hover:border hover:border-white p-1 rounded">
                    <Menu size={20} /> All
                </div>
                <span className="text-gray-300 text-xs">TrustChain Verified: 100% Authentic Reviews on Cardano</span>
            </div>
        </nav>
    );
}
