'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaCode, FaChartLine, FaBrain, FaTrophy } from 'react-icons/fa';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#f4f9f4]">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary-50 p-2 rounded-xl">
                            <FaCode className="text-primary-600 text-xl" />
                        </div>
                        <span className="text-xl font-heading font-bold text-primary-900">
                            DSA Tracker
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href="/login"
                            className="px-4 py-2 text-slate-600 hover:text-primary-600 transition-colors font-medium"
                        >
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 rounded-full text-white font-medium transition-colors shadow-lg shadow-primary-200"
                        >
                            Get Started
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-4xl mx-auto"
                >
                    <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 text-slate-900 leading-tight">
                        Master{' '}
                        <span className="text-primary-600 relative">
                            DSA
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent-300 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                        <br />
                        Track Your Progress
                    </h1>
                    <p className="text-xl text-slate-500 mb-8 max-w-2xl mx-auto font-light">
                        Track your Data Structures & Algorithms journey across LeetCode,
                        Codeforces, GeeksforGeeks, and more. Build consistency, master
                        revision.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/register"
                            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 rounded-full text-white font-bold text-lg transition-all shadow-xl shadow-primary-200 hover:shadow-2xl hover:-translate-y-1"
                        >
                            Start Tracking
                        </Link>
                        <Link
                            href="/login"
                            className="px-8 py-4 bg-white border-2 border-slate-100 hover:border-primary-100 rounded-full text-slate-700 font-bold text-lg hover:bg-primary-50 transition-all"
                        >
                            Sign In
                        </Link>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
                >
                    <FeatureCard
                        icon={<FaCode />}
                        title="Multi-Platform"
                        description="Track problems from LeetCode, Codeforces, GFG, CodeChef & more"
                        color="text-primary-500"
                        bg="bg-primary-50"
                    />
                    <FeatureCard
                        icon={<FaChartLine />}
                        title="Deep Analytics"
                        description="Topic-wise strength, time analysis, consistency heatmaps"
                        color="text-accent-500"
                        bg="bg-accent-50"
                    />
                    <FeatureCard
                        icon={<FaBrain />}
                        title="Smart Revision"
                        description="Spaced repetition system with 1d, 7d, 30d revision cycles"
                        color="text-emerald-500"
                        bg="bg-emerald-50"
                    />
                    <FeatureCard
                        icon={<FaTrophy />}
                        title="Gamification"
                        description="XP points, streak badges, levels & achievement system"
                        color="text-amber-500"
                        bg="bg-amber-50"
                    />
                </motion.div>
            </main>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
    color,
    bg,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
    bg?: string;
}) {
    return (
        <div className="bg-white rounded-[40px] p-8 hover:shadow-xl transition-all group border border-gray-100 hover:-translate-y-1">
            <div className={`text-3xl mb-6 ${color} ${bg} p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-slate-800">{title}</h3>
            <p className="text-slate-500 leading-relaxed">{description}</p>
        </div>
    );
}
