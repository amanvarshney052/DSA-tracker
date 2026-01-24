'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    FaArrowLeft,
    FaChartLine,
    FaClock,
    FaFire,
    FaTrophy,
} from 'react-icons/fa';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { analyticsAPI } from '@/lib/services';
import TopicProgressChart from '@/components/dashboard/TopicProgressChart';
import ConsistencyGraph from '@/components/dashboard/ConsistencyGraph';

export default function AnalyticsPage() {
    const router = useRouter();
    const [timeDistribution, setTimeDistribution] = useState<any[]>([]);
    const [platformStats, setPlatformStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        loadAnalytics();
    }, [router]);

    const loadAnalytics = async () => {
        try {
            const [timeRes, platformRes] = await Promise.all([
                analyticsAPI.getTimeDistribution(),
                analyticsAPI.getPlatformStats(),
            ]);

            // Format time distribution data
            const timeData = [
                { difficulty: 'Easy', avgTime: timeRes.data.easy || 0 },
                { difficulty: 'Medium', avgTime: timeRes.data.medium || 0 },
                { difficulty: 'Hard', avgTime: timeRes.data.hard || 0 },
            ];
            setTimeDistribution(timeData);

            // Format platform stats data
            const platformData = Object.entries(platformRes.data).map(([name, count]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value: count as number,
            }));
            setPlatformStats(platformData);

            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center">
                <div className="text-xl text-slate-500 font-medium">Loading analytics...</div>
            </div>
        );
    }

    const COLORS = ['#0ea5e9', '#a855f7', '#22c55e', '#f59e0b', '#ef4444'];

    return (
        <div className="min-h-screen bg-[#f4f9f4] p-6">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-medium"
                    >
                        <FaArrowLeft />
                        Back to Dashboard
                    </Link>
                </div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary-50 p-3 rounded-2xl">
                            <FaChartLine className="text-primary-600 text-2xl" />
                        </div>
                        <h1 className="text-4xl font-heading font-bold text-slate-900">Analytics Dashboard</h1>
                    </div>
                    <p className="text-slate-500 text-lg">
                        Detailed insights into your DSA progress and performance
                    </p>
                </motion.div>

                {/* Topic Progress & Consistency */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
                >
                    <TopicProgressChart />
                    <ConsistencyGraph />
                </motion.div>

                {/* Time Distribution & Platform Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Time Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-accent-50 rounded-xl">
                                <FaClock className="text-accent-500 text-lg" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Average Solve Time</h3>
                                <p className="text-sm text-slate-500">Minutes per difficulty level</p>
                            </div>
                        </div>

                        {timeDistribution.every((d) => d.avgTime === 0) ? (
                            <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-3xl">
                                <p className="text-slate-400 font-medium">No timing data available yet</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={timeDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                    <XAxis
                                        dataKey="difficulty"
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                                        stroke="#cbd5e1"
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        stroke="#cbd5e1"
                                        axisLine={false}
                                        tickLine={false}
                                        label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#94a3b8', style: { textAnchor: 'middle' } }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: 'none',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            color: '#1e293b',
                                            padding: '12px'
                                        }}
                                        formatter={(value: any) => [`${value} min`, 'Avg Time']}
                                        cursor={{ fill: '#f1f5f9' }}
                                    />
                                    <Bar dataKey="avgTime" radius={[8, 8, 8, 8]} barSize={50}>
                                        {timeDistribution.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    entry.difficulty === 'Easy'
                                                        ? '#22c55e'
                                                        : entry.difficulty === 'Medium'
                                                            ? '#f59e0b'
                                                            : '#ef4444'
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </motion.div>

                    {/* Platform Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-yellow-50 rounded-xl">
                                <FaTrophy className="text-yellow-500 text-lg" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Platform Distribution</h3>
                                <p className="text-sm text-slate-500">Problems by platform</p>
                            </div>
                        </div>

                        {platformStats.length === 0 || platformStats.every((p) => p.value === 0) ? (
                            <div className="h-[300px] flex items-center justify-center bg-slate-50 rounded-3xl">
                                <p className="text-slate-400 font-medium">No platform data available yet</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center">
                                <div className="w-full h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={platformStats}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {platformStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                    color: '#1e293b',
                                                    padding: '12px'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Custom Legend */}
                                <div className="mt-6 flex flex-wrap justify-center gap-4">
                                    {platformStats.map((platform, index) => (
                                        <div key={platform.name} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            />
                                            <span className="text-sm font-medium text-slate-600">
                                                {platform.name}
                                                <span className="text-slate-400 ml-1">({platform.value})</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Insights Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-orange-50 rounded-xl">
                            <FaFire className="text-orange-500 text-lg" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Key Insights</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6 bg-slate-50 rounded-3xl">
                            <div className="text-4xl font-heading font-bold text-primary-600 mb-2">
                                {timeDistribution.reduce((sum, d) => sum + d.avgTime, 0) > 0
                                    ? Math.round(
                                        timeDistribution.reduce((sum, d) => sum + d.avgTime, 0) /
                                        timeDistribution.filter((d) => d.avgTime > 0).length || 1
                                    )
                                    : 0}
                                <span className="text-lg text-primary-400 ml-1">min</span>
                            </div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Avg Solve Time</p>
                        </div>

                        <div className="text-center p-6 bg-slate-50 rounded-3xl">
                            <div className="text-4xl font-heading font-bold text-primary-600 mb-2">
                                {platformStats.reduce((sum, p) => sum + p.value, 0)}
                            </div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Total Solved</p>
                        </div>

                        <div className="text-center p-6 bg-slate-50 rounded-3xl">
                            <div className="text-4xl font-heading font-bold text-primary-600 mb-2">
                                {platformStats.length}
                            </div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Platforms</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
