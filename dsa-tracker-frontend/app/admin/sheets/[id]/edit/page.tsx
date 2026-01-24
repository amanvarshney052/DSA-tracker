'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import AdminGuard from '@/components/auth/AdminGuard';
import SheetForm from '@/components/admin/SheetForm';
import { sheetsAPI, problemsAPI } from '@/lib/services';
import { motion } from 'framer-motion';

export default function EditSheetPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [sheet, setSheet] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchSheet = async () => {
        try {
            const res = await sheetsAPI.getById(id);
            setSheet(res.data);
        } catch (error) {
            console.error(error);
            alert('Failed to load sheet details');
            router.push('/admin/sheets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSheet();
    }, [id]);

    const handleDeleteProblem = async (problemId: string) => {
        if (confirm('Are you sure you want to remove this problem from the sheet? This cannot be undone.')) {
            try {
                await problemsAPI.delete(problemId);
                // Refresh data to remove the problem from the list
                fetchSheet();
            } catch (error) {
                console.error(error);
                alert('Failed to delete problem');
            }
        }
    };

    if (loading) {
        return (
            <AdminGuard>
                <div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center">
                    <div className="text-slate-500">Loading sheet details...</div>
                </div>
            </AdminGuard>
        );
    }

    if (!sheet) return null;

    return (
        <AdminGuard>
            <div className="min-h-screen bg-[#f4f9f4]">
                <div className="container mx-auto px-6 py-8">
                    <div className="mb-8">
                        <Link href="/admin/sheets" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-4 transition-colors">
                            <FaArrowLeft /> Back to Sheets
                        </Link>
                        <h1 className="text-3xl font-heading font-bold text-slate-900">Edit Sheet</h1>
                        <p className="text-slate-500">Update sheet details and manage problems</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Sheet Form */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-8">
                                <h2 className="text-xl font-bold text-slate-800 mb-4">Sheet Details</h2>
                                <SheetForm
                                    initialData={sheet}
                                    isEditing={true}
                                />
                            </div>
                        </div>

                        {/* Right Column: Problem Management */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-slate-800">
                                    Problems ({sheet.problems?.length || 0})
                                </h2>
                                <Link
                                    href="/admin/problems"
                                    className="text-sm font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg transition-colors"
                                >
                                    + Add New Problem
                                </Link>
                            </div>

                            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
                                {sheet.problems && sheet.problems.length > 0 ? (
                                    <div className="space-y-4">
                                        {sheet.problems.map((problem: any, index: number) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                key={problem._id}
                                                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all group"
                                            >
                                                <div className="flex-1 min-w-0 mr-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`w-2 h-2 rounded-full ${problem.difficulty === 'easy' ? 'bg-green-500' :
                                                            problem.difficulty === 'medium' ? 'bg-yellow-500' :
                                                                'bg-red-500'
                                                            }`} />
                                                        <h3 className="font-bold text-slate-800 truncate">{problem.title}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                                        <span className="capitalize">{problem.platform}</span>
                                                        <span>•</span>
                                                        <a
                                                            href={problem.problemUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 hover:text-primary-600 transition-colors"
                                                        >
                                                            Link <FaExternalLinkAlt className="text-[10px]" />
                                                        </a>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleDeleteProblem(problem._id)}
                                                    className="p-3 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Remove Problem"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        <p>No problems in this sheet yet.</p>
                                        <Link href="/admin/problems" className="text-primary-600 font-bold hover:underline mt-2 inline-block">
                                            Add problems now
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
}
