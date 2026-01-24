'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    FaArrowLeft,
    FaUser,
    FaTrophy,
    FaFire,
    FaCode,
    FaSave,
    FaChartLine,
    FaEnvelope,
} from 'react-icons/fa';
import { authAPI } from '@/lib/services';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        goal: '',
        dailyGoal: 3,
        preferredLanguage: 'javascript',
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch user profile
        authAPI
            .getProfile()
            .then((res) => {
                console.log('Profile API Response:', res.data); // DEBUG: Check if goal is present
                setUser(res.data);
                setFormData({
                    name: res.data.name,
                    goal: res.data.goal || '', // Ensure it's not undefined
                    dailyGoal: res.data.dailyGoal,
                    preferredLanguage: res.data.preferredLanguage,
                });
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch profile:', err);
                setLoading(false);
            });
    }, [router]);
    // ...

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const response = await authAPI.updateProfile(formData);
            const updatedUser = response.data;

            // Update local storage
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedUser }));

            setUser({ ...user, ...updatedUser });
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center">
                <div className="text-xl text-slate-500 font-medium">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f9f4] p-6">
            <div className="container mx-auto max-w-5xl">
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-medium"
                    >
                        <FaArrowLeft />
                        Back to Dashboard
                    </Link>
                </div>

                <div className="space-y-8">
                    {/* Full Width Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col md:flex-row items-center gap-8"
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-50 to-white/0 z-0"></div>

                        {/* Avatar */}
                        <div className="relative z-10 w-32 h-32 flex-shrink-0">
                            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-4xl text-white shadow-lg border-4 border-white">
                                <FaUser />
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="relative z-10 text-center md:text-left flex-grow">
                            <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-2">{user?.name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                                <div className="flex items-center gap-2 text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-lg">
                                    <FaEnvelope className="text-slate-400" />
                                    {user?.email}
                                </div>
                                <div className="flex items-center gap-2 text-primary-600 font-medium bg-primary-50 px-3 py-1 rounded-lg">
                                    <FaCode className="text-primary-500" />
                                    {user?.role === 'admin' ? 'Admin' : 'User'}
                                </div>
                            </div>

                            {/* Visual Goal Badge */}
                            {user?.goal && (
                                <div className="inline-flex items-center gap-2 text-white font-bold text-sm bg-gradient-to-r from-primary-600 to-primary-500 py-2 px-6 rounded-full shadow-md shadow-primary-200">
                                    <span className="text-base">🎯</span>
                                    <span>{user.goal}</span>
                                </div>
                            )}
                        </div>

                        {/* Quick Stats (Optional right side) */}
                        <div className="relative z-10 hidden md:flex gap-6 items-center">
                            <div className="text-center">
                                <div className="text-xl font-bold text-slate-900">{user?.streak || 0} 🔥</div>
                                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Day Streak</div>
                            </div>
                            <div className="w-px h-10 bg-slate-200"></div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-slate-900">{user?.xpPoints || 0} XP</div>
                                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total XP</div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Detailed Performance */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-6"
                        >
                            {/* Stats Summary */}
                            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 h-full">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 font-heading">Performance Stats</h3>
                                <div className="space-y-5">
                                    <StatItem
                                        icon={<FaTrophy />}
                                        label="Level"
                                        value={user?.level || 1}
                                        color="text-amber-500"
                                        bg="bg-amber-50"
                                    />
                                    <StatItem
                                        icon={<FaChartLine />}
                                        label="XP Points"
                                        value={user?.xpPoints || 0}
                                        color="text-accent-500"
                                        bg="bg-accent-50"
                                    />
                                    <StatItem
                                        icon={<FaFire />}
                                        label="Current Streak"
                                        value={`${user?.streak || 0} days`}
                                        color="text-orange-500"
                                        bg="bg-orange-50"
                                    />
                                    <div className="pt-4 border-t border-slate-100 mt-4">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                                            Level Progress
                                        </h4>
                                        <div className="flex justify-between mb-2 text-slate-900 font-bold text-sm">
                                            <span>{(user?.xpPoints || 0) % 100} XP</span>
                                            <span>To Level {(user?.level || 1) + 1}</span>
                                        </div>
                                        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${((user?.xpPoints || 0) % 100)}%` }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column: Settings Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2"
                        >
                            <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-gray-100 h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900 font-heading">Account Settings</h2>
                                    {saving && <span className="text-sm text-primary-600 font-medium animate-pulse">Saving...</span>}
                                </div>

                                {message && (
                                    <div
                                        className={`mb-8 p-4 rounded-2xl flex items-center gap-3 ${message.includes('success')
                                            ? 'bg-green-50 text-green-700 border border-green-100'
                                            : 'bg-red-50 text-red-700 border border-red-100'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${message.includes('success') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="font-medium">{message}</span>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Name - Now styled correctly */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, name: e.target.value })
                                                }
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-900 transition-all focus:bg-white"
                                                required
                                            />
                                        </div>
                                        {/* Email (Read-only) */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={user?.email}
                                                disabled
                                                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 font-medium cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    {/* Goal */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Current Goal
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.goal}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, goal: e.target.value })
                                                }
                                                placeholder="e.g. SDE / Backend / Placements 2026"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-900 transition-all focus:bg-white"
                                            />
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🎯</div>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2 font-medium">
                                            This will be displayed on your profile header
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Daily Goal */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                Daily Problem Goal
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.dailyGoal}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            dailyGoal: parseInt(e.target.value),
                                                        })
                                                    }
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-900 appearance-none transition-all focus:bg-white"
                                                >
                                                    <option value="1">1 problem per day</option>
                                                    <option value="2">2 problems per day</option>
                                                    <option value="3">3 problems per day</option>
                                                    <option value="5">5 problems per day</option>
                                                    <option value="10">10 problems per day</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                            </div>
                                        </div>

                                        {/* Preferred Language */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                Preferred Programming Language
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={formData.preferredLanguage}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            preferredLanguage: e.target.value,
                                                        })
                                                    }
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-slate-900 appearance-none transition-all focus:bg-white"
                                                >
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="typescript">TypeScript</option>
                                                    <option value="python">Python</option>
                                                    <option value="java">Java</option>
                                                    <option value="cpp">C++</option>
                                                    <option value="csharp">C#</option>
                                                    <option value="go">Go</option>
                                                    <option value="rust">Rust</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <div className="pt-4 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="bg-primary-600 text-white rounded-xl py-3 px-8 font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <FaSave />
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatItem({
    icon,
    label,
    value,
    color,
    bg,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
    bg?: string;
}) {
    return (
        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className={`${color} ${bg} p-2.5 rounded-xl text-lg`}>{icon}</div>
                <span className="text-slate-500 font-medium">{label}</span>
            </div>
            <span className="font-bold text-slate-900 text-lg capitalize">{value}</span>
        </div>
    );
}
