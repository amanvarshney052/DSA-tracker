import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaBell, FaClock, FaBrain, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { revisionAPI } from '@/lib/services';

interface RevisionStats {
    dueToday: number;
    overdue: number;
    totalPending: number;
    weakTopics: { topic: string; count: number }[];
}

export default function RevisionDashboard() {
    const [stats, setStats] = useState<RevisionStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await revisionAPI.getStats();
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch revision stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    if (loading) {
        return <div className="animate-pulse h-40 bg-slate-100 rounded-2xl w-full mb-8"></div>;
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
            {/* Revisions Due Today */}
            <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                        <FaBell size={20} />
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-primary-100 text-primary-700 rounded-lg">Today</span>
                </div>
                <div>
                    <h3 className="text-slate-500 text-sm font-medium mb-1">Revisions Due</h3>
                    <p className="text-3xl font-bold text-slate-800">{stats?.dueToday || 0}</p>
                </div>
            </motion.div>

            {/* Overdue Revisions */}
            <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                        <FaExclamationTriangle size={20} />
                    </div>
                    {stats?.overdue ? (
                        <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded-lg">Action Needed</span>
                    ) : null}
                </div>
                <div>
                    <h3 className="text-slate-500 text-sm font-medium mb-1">Overdue</h3>
                    <p className="text-3xl font-bold text-slate-800">{stats?.overdue || 0}</p>
                </div>
            </motion.div>

            {/* Total Marked */}
            <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <FaBrain size={20} />
                    </div>
                </div>
                <div>
                    <h3 className="text-slate-500 text-sm font-medium mb-1">Total Active Revisions</h3>
                    <p className="text-3xl font-bold text-slate-800">{stats?.totalPending || 0}</p>
                </div>
            </motion.div>

            {/* Weak Topics */}
            <motion.div variants={item} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <FaChartLine size={20} />
                    </div>
                    <span className="text-xs font-bold text-purple-600">Focus Area</span>
                </div>
                <div>
                    <h3 className="text-slate-500 text-sm font-medium mb-2">Weakest Topics</h3>
                    <div className="space-y-1">
                        {stats?.weakTopics && stats.weakTopics.length > 0 ? (
                            stats.weakTopics.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <span className="text-slate-700 font-medium truncate max-w-[120px]">{item.topic}</span>
                                    <span className="text-slate-400 text-xs">{item.count} items</span>
                                </div>
                            ))
                        ) : (
                            <span className="text-slate-400 text-sm italic">No data yet</span>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
