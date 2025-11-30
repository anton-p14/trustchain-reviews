import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Star, Zap } from 'lucide-react';

export default function Hero() {
    return (
        <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute top-40 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-sm text-slate-300">Live on Cardano Preprod</span>
                    </div>

                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8">
                        <span className="block text-white mb-2">Decentralized Trust</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary via-primary to-accent">
                            Verified on Chain
                        </span>
                    </h1>

                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-400 mb-10">
                        The first review platform powered by Cardano smart contracts.
                        Immutable, transparent, and rewarding for honest feedback.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 rounded-full bg-white text-slate-900 font-bold text-lg shadow-xl hover:bg-slate-100 transition-colors flex items-center gap-2"
                        >
                            Start Reviewing <ArrowRight size={20} />
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
                        >
                            View Explorer
                        </motion.button>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    <FeatureCard
                        icon={<Shield className="w-8 h-8 text-secondary" />}
                        title="Tamper-Proof"
                        desc="Reviews are stored on Cardano blockchain and cannot be altered or deleted."
                    />
                    <FeatureCard
                        icon={<Zap className="w-8 h-8 text-primary" />}
                        title="Instant Rewards"
                        desc="Earn tokens automatically when your reviews are verified by the community."
                    />
                    <FeatureCard
                        icon={<Star className="w-8 h-8 text-accent" />}
                        title="Reputation System"
                        desc="Build your on-chain reputation score and unlock premium features."
                    />
                </motion.div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="glass-card p-8 rounded-2xl text-left hover:bg-white/5 transition-colors group">
            <div className="mb-4 p-3 rounded-xl bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{desc}</p>
        </div>
    );
}
