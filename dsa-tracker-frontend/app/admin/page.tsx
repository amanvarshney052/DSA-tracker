'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaBook, FaCode, FaChartLine, FaArrowLeft, FaUpload, FaCalendarPlus } from 'react-icons/fa';
import AdminGuard from '@/components/auth/AdminGuard';
import { sheetsAPI, problemsAPI, progressAPI, adminAPI } from '@/lib/services';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalSheets: 0,
        totalProblems: 0,
        totalUsers: 0, // We might not have this endpoint yet, but placeholder is fine
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const statsRes = await adminAPI.getStats();

                setStats({
                    totalSheets: statsRes.data.totalSheets,
                    totalProblems: statsRes.data.totalProblems,
                    totalUsers: statsRes.data.totalUsers
                });
            } catch (error) {
                console.error("Error fetching admin stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <AdminGuard>
            <div className="min-h-screen bg-[#f4f9f4]">
                <div className="container mx-auto px-6 py-8">
                    <div className="mb-8">
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-4 transition-colors">
                            <FaArrowLeft /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-heading font-bold text-slate-900">Admin Dashboard</h1>
                        <p className="text-slate-500">Manage content and view platform statistics</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <StatsCard
                            title="Total Sheets"
                            value={stats.totalSheets}
                            icon={<FaBook />}
                            color="text-primary-600"
                            bg="bg-primary-50"
                        />
                        <StatsCard
                            title="Total Problems"
                            value={stats.totalProblems}
                            icon={<FaCode />}
                            color="text-accent-500"
                            bg="bg-accent-50"
                        />
                        <Link href="/admin/users" className="block transition-transform hover:-translate-y-1">
                            <StatsCard
                                title="Users"
                                value={stats.totalUsers}
                                icon={<FaChartLine />}
                                color="text-emerald-500"
                                bg="bg-emerald-50"
                            />
                        </Link>
                    </div>

                    <h2 className="text-2xl font-heading font-bold text-slate-900 mb-6">Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AdminActionCard
                            title="Manage Sheets"
                            description="Create, edit, or delete problem sheets categories."
                            href="/admin/sheets"
                            icon={<FaBook />}
                        />
                        <AdminActionCard
                            title="Manage Problems"
                            description="Add new problems to existing sheets."
                            href="/admin/problems"
                            icon={<FaCode />}
                        />
                        <AdminActionCard
                            title="Bulk Import"
                            description="Upload CSV files to add multiple problems at once."
                            href="/admin/import"
                            icon={<FaUpload />}
                        />
                        <AdminActionCard
                            title="Daily Problem"
                            description="Schedule daily challenges for users."
                            href="/admin/daily"
                            icon={<FaCalendarPlus />}
                        />
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
}

function StatsCard({ title, value, icon, color, bg }: any) {
    return (
        <div className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`${bg} ${color} p-4 rounded-2xl text-2xl`}>
                {icon}
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">{title}</p>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
}

function AdminActionCard({ title, description, href, icon }: any) {
    return (
        <Link href={href}>
            <div className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                <div className="bg-slate-50 text-slate-600 w-12 h-12 flex items-center justify-center rounded-xl text-xl mb-4">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-slate-500">{description}</p>
            </div>
        </Link>
    );
}
