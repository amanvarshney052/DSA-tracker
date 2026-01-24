'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPlus } from 'react-icons/fa';
import AdminGuard from '@/components/auth/AdminGuard';
import { sheetsAPI } from '@/lib/services';
import TopicCard from '@/components/TopicCard';
import { useRouter } from 'next/navigation';

export default function ManageSheetsPage() {
    const router = useRouter();
    const [sheets, setSheets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSheets = async () => {
        try {
            const res = await sheetsAPI.getAll();
            setSheets(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSheets();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this sheet?')) {
            try {
                await sheetsAPI.delete(id);
                fetchSheets(); // Refresh
            } catch (error) {
                alert('Failed to delete sheet');
            }
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-[#f4f9f4] p-6">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-4 transition-colors">
                                <FaArrowLeft /> Back to Admin Dashboard
                            </Link>
                            <h1 className="text-3xl font-heading font-bold text-slate-900">Manage Sheets</h1>
                        </div>
                        <Link
                            href="/admin/sheets/new"
                            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5"
                        >
                            <FaPlus /> New Sheet
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center text-slate-500 py-12">Loading sheets...</div>
                    ) : sheets.length === 0 ? (
                        <div className="text-center text-slate-500 py-12 bg-white rounded-2xl border border-gray-100">
                            No sheets found. Create one to get started.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sheets.map((sheet, index) => (
                                <TopicCard
                                    key={sheet._id}
                                    id={sheet._id}
                                    title={sheet.name}
                                    description={sheet.description || ''}
                                    totalProblems={sheet.totalProblems}
                                    solvedProblems={0}
                                    difficulty={sheet.difficulty}
                                    index={index}
                                    isAdmin={true}
                                    onEdit={() => router.push(`/admin/sheets/${sheet._id}/edit`)}
                                    onDelete={() => handleDelete(sheet._id)}
                                    theme="light"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminGuard>
    );
}
