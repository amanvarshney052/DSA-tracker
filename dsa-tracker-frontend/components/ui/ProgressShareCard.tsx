import React, { forwardRef } from 'react';
import { FaCode, FaFire, FaTrophy, FaChartLine } from 'react-icons/fa';

interface ProgressShareCardProps {
    stats: {
        totalSolved: number;
        streak: number;
        level: number;
        xpPoints: number;
    };
    userName: string;
}

// Explicit Hex codes for html2canvas compatibility
const colors = {
    bg: '#f4f9f4',
    primary100: '#ede9fe',
    primary600: '#7c3aed',
    primary700: '#6d28d9',
    accent100: '#fce7f3',
    accent500: '#ec4899',
    slate900: '#0f172a',
    slate500: '#64748b',
    slate200: '#e2e8f0',
    white: '#ffffff',
    amber50: '#fffbeb',
    amber100: '#fef3c7',
    amber500: '#f59e0b',
    amber600: '#d97706',
    amber700: '#b45309',
    orange100: '#ffedd5',
    orange500: '#f97316',
};

const ProgressShareCard = forwardRef<HTMLDivElement, ProgressShareCardProps>(({ stats, userName }, ref) => {
    return (
        <div
            ref={ref}
            className="w-[600px] h-[315px] p-8 flex flex-col justify-between relative overflow-hidden font-sans"
            style={{
                fontFamily: 'Inter, sans-serif',
                backgroundColor: colors.bg
            }}
        >
            {/* Background Gradients using inline styles for safety */}
            <div
                className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl -mr-20 -mt-20 opacity-60"
                style={{ backgroundColor: colors.primary100 }}
            ></div>
            <div
                className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-3xl -ml-20 -mb-10 opacity-60"
                style={{ backgroundColor: colors.accent100 }}
            ></div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="p-2.5 rounded-xl text-white"
                        style={{ backgroundColor: colors.primary600 }}
                    >
                        <FaCode size={24} />
                    </div>
                    <span
                        className="text-2xl font-bold tracking-tight"
                        style={{ color: colors.slate900 }}
                    >
                        DSA Tracker
                    </span>
                </div>
                <div className="text-right">
                    <p
                        className="text-sm font-bold uppercase tracking-wider"
                        style={{ color: colors.slate500 }}
                    >
                        Tracker Profile
                    </p>
                    <p
                        className="text-lg font-bold"
                        style={{ color: colors.primary700 }}
                    >
                        {userName}
                    </p>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="relative z-10 grid grid-cols-2 gap-6 mt-2">
                {/* Problems Solved */}
                <div
                    className="col-span-2 backdrop-blur-sm p-5 rounded-2xl shadow-sm flex items-center justify-between"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        borderWidth: '1px'
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="p-3 rounded-xl"
                            style={{ backgroundColor: colors.primary100, color: colors.primary600 }}
                        >
                            <FaCode size={28} />
                        </div>
                        <div>
                            <p
                                className="text-3xl font-extrabold"
                                style={{ color: colors.slate900 }}
                            >
                                {stats.totalSolved}
                            </p>
                            <p
                                className="text-sm font-medium uppercase tracking-wide"
                                style={{ color: colors.slate500 }}
                            >
                                Problems Solved
                            </p>
                        </div>
                    </div>
                    {/* Level Badge */}
                    <div
                        className="px-4 py-2 rounded-xl flex items-center gap-2 border"
                        style={{
                            backgroundColor: colors.amber50,
                            borderColor: colors.amber100
                        }}
                    >
                        <FaTrophy style={{ color: colors.amber500, fontSize: '1.25rem' }} />
                        <div>
                            <p
                                className="text-xs font-bold uppercase"
                                style={{ color: colors.amber600 }}
                            >
                                Current Level
                            </p>
                            <p
                                className="text-xl font-bold leading-none"
                                style={{ color: colors.amber700 }}
                            >
                                {stats.level}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Streak */}
                <div
                    className="backdrop-blur-sm p-4 rounded-2xl shadow-sm flex items-center gap-3"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        borderWidth: '1px'
                    }}
                >
                    <div
                        className="p-2.5 rounded-xl"
                        style={{ backgroundColor: colors.orange100, color: colors.orange500 }}
                    >
                        <FaFire size={20} />
                    </div>
                    <div>
                        <p
                            className="text-2xl font-bold"
                            style={{ color: colors.slate900 }}
                        >
                            {stats.streak} Days
                        </p>
                        <p
                            className="text-xs font-medium uppercase"
                            style={{ color: colors.slate500 }}
                        >
                            Streak 🔥
                        </p>
                    </div>
                </div>

                {/* XP */}
                <div
                    className="backdrop-blur-sm p-4 rounded-2xl shadow-sm flex items-center gap-3"
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        borderWidth: '1px'
                    }}
                >
                    <div
                        className="p-2.5 rounded-xl"
                        style={{ backgroundColor: colors.accent100, color: colors.accent500 }}
                    >
                        <FaChartLine size={20} />
                    </div>
                    <div>
                        <p
                            className="text-2xl font-bold"
                            style={{ color: colors.slate900 }}
                        >
                            {stats.xpPoints} XP
                        </p>
                        <p
                            className="text-xs font-medium uppercase"
                            style={{ color: colors.slate500 }}
                        >
                            Total XP
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div
                className="relative z-10 mt-4 pt-4 flex items-center justify-between"
                style={{ borderTop: `1px solid rgba(226, 232, 240, 0.5)` }}
            >
                <p
                    className="text-sm font-medium"
                    style={{ color: colors.slate500 }}
                >
                    Track your journey consistently
                </p>
                <p
                    className="text-sm font-bold"
                    style={{ color: colors.primary600 }}
                >
                    dsa-tracker.app
                </p>
            </div>
        </div>
    );
});

ProgressShareCard.displayName = 'ProgressShareCard';

export default ProgressShareCard;
