'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    FaCode,
    FaTrophy,
    FaFire,
    FaChartLine,
    FaSignOutAlt,
    FaBook,
    FaStickyNote,
    FaCalendar,
    FaUser,
} from 'react-icons/fa';
import Link from 'next/link';
import { progressAPI, authAPI, sheetsAPI } from '@/lib/services';
import SolvedProblemsCard from '@/components/dashboard/SolvedProblemsCard';
import TopicProgressChart from '@/components/dashboard/TopicProgressChart';
import ConsistencyGraph from '@/components/dashboard/ConsistencyGraph';
import FocusTopicCard from '@/components/dashboard/FocusTopicCard';
import ShareProgress from '@/components/ui/ShareProgress';
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import SheetSelectionModal from '@/components/dashboard/SheetSelectionModal';
import SheetSwitcher from '@/components/dashboard/SheetSwitcher';
import SmartInsightsCard from '@/components/dashboard/SmartInsightsCard';
import DailyChallengeCard from '@/components/dashboard/DailyChallengeCard';
import MobileNav from '@/components/ui/MobileNav';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [sheets, setSheets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSheetModal, setShowSheetModal] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser._id) setUser(storedUser);
    }, [router]);

    useEffect(() => {
        const fetchData = async () => {
            if (!localStorage.getItem('token')) return;

            try {
                const profileRes = await authAPI.getProfile();
                const freshUser = profileRes.data;
                setUser(freshUser);
                localStorage.setItem('user', JSON.stringify(freshUser));

                // Fetch sheets
                const sheetsRes = await sheetsAPI.getAll();
                setSheets(sheetsRes.data);

                if (!freshUser.activeSheet && !freshUser.hasOnboarded) {
                    setShowSheetModal(true);
                    setLoading(false);
                    return;
                }

                const statsRes = await progressAPI.getStats(freshUser.activeSheet ? { sheetId: freshUser.activeSheet } : {});
                setStats(statsRes.data);
                setShowSheetModal(false);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router, refreshTrigger]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
    };

    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center">
                <div className="text-2xl text-slate-500 font-heading">Loading...</div>
            </div>
        );
    }

    const currentSheetName = user?.activeSheet
        ? sheets.find((s: any) => s._id === user.activeSheet)?.name || 'Selected Sheet'
        : 'Overall Progress';

    return (
        <div className="min-h-screen bg-[#f4f9f4]">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
                <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center relative">
                    <div className="flex items-center gap-4 sm:gap-8">
                        {/* Mobile Menu Button - Visible only on mobile */}
                        <MobileNav role={user?.role} />

                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="bg-primary-50 p-2 rounded-xl">
                                <FaCode className="text-primary-600 text-xl" />
                            </div>
                            <span className="text-xl font-heading font-bold text-primary-900 hidden sm:inline">
                                DSA Tracker
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex gap-6">
                            <Link href="/dashboard" className="text-primary-600 font-medium border-b-2 border-primary-600">Dashboard</Link>
                            <Link href="/sheets" className="text-slate-500 hover:text-primary-600 font-medium px-3 py-1">Sheets</Link>
                            <Link href="/revision" className="text-slate-500 hover:text-primary-600 font-medium px-3 py-1">Revision</Link>
                            <Link href="/analytics" className="text-slate-500 hover:text-primary-600 font-medium px-3 py-1">Analytics</Link>
                            <Link href="/notes" className="text-slate-500 hover:text-primary-600 font-medium px-3 py-1">Notes</Link>
                            {user?.role === 'admin' && (
                                <Link href="/admin" className="text-primary-600 font-bold px-3 py-1">Admin Panel</Link>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <SheetSwitcher
                            sheets={sheets}
                            currentSheetId={user?.activeSheet}
                            stats={stats}
                            onSwitch={() => setRefreshTrigger(p => p + 1)}
                        />

                        <Link
                            href="/profile"
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-slate-600 hover:text-primary-600 transition-colors hover:bg-slate-50 rounded-lg"
                        >
                            <FaUser />
                            <span className="hidden sm:inline">Profile</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-slate-600 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
                        >
                            <FaSignOutAlt />
                        </button>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 py-8">
                {/* Welcome Section - White Theme */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 leading-tight">
                                    Hello, {user?.name || 'Friend'}
                                </h1>
                                <motion.span
                                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                                    className="text-4xl md:text-5xl inline-block origin-bottom-right"
                                >
                                    👋
                                </motion.span>
                            </div>
                            <p className="text-slate-500 text-lg max-w-xl font-medium">
                                You’re getting closer to mastering DSA — keep going!
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Focus</p>
                                <p className="font-bold text-primary-600 text-lg bg-white/50 px-4 py-1 rounded-full inline-block border border-slate-100">
                                    {currentSheetName}
                                </p>
                            </div>
                            {stats && user && (
                                <ShareProgress
                                    stats={{
                                        totalSolved: stats.totalSolved || 0,
                                        streak: user.streak || 0,
                                        level: user.level || 1,
                                        xpPoints: user.xpPoints || 0,
                                    }}
                                    userName={user.name}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Daily Challenge - TOP PRIORITY (Only on Overall View) */}
                {!user?.activeSheet && <DailyChallengeCard />}

                {/* Focus Topic */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="mb-8"
                >
                    <FocusTopicCard sheetId={user?.activeSheet} />
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    {/* Daily Target Card */}
                    <DailyTargetCard
                        dailyGoal={user?.dailyGoal || 3}
                        solvedToday={stats?.solvedToday || 0}
                    />

                    <StatsCard
                        title="Total Solved"
                        value={`${stats?.totalSolved || 0} / ${stats?.totalProblems || 0}`}
                        icon={<FaCode />}
                        color="text-primary-600"
                        bgColor="bg-primary-50"
                    />
                    <StatsCard
                        title="Current Streak"
                        value={`${user?.streak || 0} days`}
                        icon={<FaFire />}
                        color="text-orange-500"
                        bgColor="bg-orange-50"
                    />
                    <StatsCard
                        title="XP Points"
                        value={user?.xpPoints || 0}
                        icon={<FaChartLine />}
                        color="text-accent-500"
                        bgColor="bg-accent-50"
                    />
                </motion.div>

                {/* Smart Insights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-8"
                >
                    <SmartInsightsCard sheetId={user?.activeSheet} />
                </motion.div>

                {/* Solved Problems & Consistency */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                >
                    <SolvedProblemsCard stats={stats} />
                    <ConsistencyGraph sheetId={user?.activeSheet} />
                </motion.div>

                {/* Charts Section: Topic Progress & Activity Heatmap */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8"
                >
                    <TopicProgressChart sheetId={user?.activeSheet} />
                    <ActivityHeatmap
                        submissionCalendar={stats?.submissionCalendar || {}}
                        submissionDates={stats?.submissionDates || []}
                    />
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-2xl font-bold mb-4 text-slate-800 font-heading">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ActionCard
                            title="Browse Sheets"
                            description="Explore DSA problem sheets"
                            icon={<FaBook />}
                            href="/sheets"
                            color="text-primary-600"
                            bg="bg-primary-50"
                        />
                        <ActionCard
                            title="Revision"
                            description="Review scheduled problems"
                            icon={<FaCalendar />}
                            href="/revision"
                            color="text-accent-500"
                            bg="bg-accent-50"
                        />
                        <ActionCard
                            title="Analytics"
                            description="View your progress insights"
                            icon={<FaChartLine />}
                            href="/analytics"
                            color="text-emerald-500"
                            bg="bg-emerald-50"
                        />
                        <ActionCard
                            title="Notes"
                            description="Access your learning notes"
                            icon={<FaStickyNote />}
                            href="/notes"
                            color="text-amber-500"
                            bg="bg-amber-50"
                        />
                    </div>
                </motion.div>

                <SheetSelectionModal
                    isOpen={showSheetModal}
                    onSelect={() => setRefreshTrigger(prev => prev + 1)}
                />
            </main>

            <footer className="py-8 text-center text-slate-400 text-sm font-medium border-t border-gray-100 bg-white/50">
                <p>&copy; 2026 DSA Tracker • Built for consistency • Made with ❤️ by Aman Varshney</p>
            </footer>
        </div>
    );
}

function StatsCard({
    title,
    value,
    icon,
    color,
    bgColor,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}) {
    return (
        <div className="bg-white rounded-[40px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{title}</p>
                <div className={`${bgColor} ${color} p-3 rounded-2xl`}>{icon}</div>
            </div>
            <p className="text-4xl font-bold text-slate-800 font-heading">{value}</p>
        </div>
    );
}

function DifficultyCard({
    title,
    count,
    color,
}: {
    title: string;
    count: number;
    color: string;
}) {
    return (
        <div className="bg-white rounded-[40px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 ${color} rounded-full ring-2 ring-offset-2 ring-white`}></div>
                <p className="text-slate-500 font-medium">{title}</p>
            </div>
            <p className="text-4xl font-bold text-slate-800 font-heading">{count}</p>
        </div>
    );
}

function ActionCard({
    title,
    description,
    icon,
    href,
    color,
    bg,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    color: string;
    bg?: string;
}) {
    return (
        <Link href={href}>
            <div className="bg-white rounded-[40px] p-6 hover:shadow-lg transition-all group cursor-pointer border border-gray-100 h-full hover:-translate-y-1">
                <div className={`${color} ${bg} text-2xl mb-4 p-3 rounded-2xl w-fit group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <h3 className="text-lg font-bold mb-1 text-slate-800 font-heading">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
            </div>
        </Link>
    );
}

function DailyTargetCard({ dailyGoal, solvedToday }: { dailyGoal: number; solvedToday: number }) {
    const remaining = Math.max(0, dailyGoal - solvedToday);
    const progress = Math.min(100, (solvedToday / dailyGoal) * 100);
    const isCompleted = solvedToday >= dailyGoal;

    return (
        <div className="bg-white rounded-[40px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden group">
            {isCompleted && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-10 -mt-10 blur-2xl opacity-50"></div>
            )}

            <div className="flex items-center justify-between mb-4 relative z-10">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">
                    Daily Target
                </p>
                <div className={`p-3 rounded-2xl ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-primary-50 text-primary-600'
                    }`}>
                    <FaTrophy />
                </div>
            </div>

            <div className="relative z-10">
                {isCompleted ? (
                    <div>
                        <p className="text-3xl font-bold font-heading mb-1 text-slate-800">Target Met! 🎉</p>
                        <p className="text-emerald-600 text-sm font-medium">Great consistency!</p>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-baseline gap-2 mb-1">
                            <p className="text-4xl font-bold font-heading text-slate-800">{solvedToday}<span className="text-xl text-slate-400">/{dailyGoal}</span></p>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">
                            {remaining} problem{remaining !== 1 ? 's' : ''} left today
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
                            <div
                                className="bg-primary-500 h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
