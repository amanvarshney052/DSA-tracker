'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPlus, FaTrash, FaEdit, FaExternalLinkAlt } from 'react-icons/fa';
import AdminGuard from '@/components/auth/AdminGuard';
import { problemsAPI } from '@/lib/services';

export default function ManageProblemsPage() {
    const [problems, setProblems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchProblems = async () => {
        try {
            const res = await problemsAPI.getAll();
            setProblems(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProblems();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this problem?')) {
            try {
                await problemsAPI.delete(id);
                fetchProblems(); // Refresh
            } catch (error) {
                alert('Failed to delete problem');
            }
        }
    };

    const filteredProblems = problems.filter(problem =>
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.difficulty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (problem.sheetId?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminGuard>
            <div className="min-h-screen bg-[#f4f9f4]">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                        <div>
                            <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-4 transition-colors">
                                <FaArrowLeft /> Back to Admin Dashboard
                            </Link>
                            <h1 className="text-3xl font-heading font-bold text-slate-900">Manage Problems</h1>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Search by title, platform..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-64 bg-white border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-sm"
                            />
                            <Link
                                href="/admin/problems/new"
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
                            >
                                <FaPlus /> New Problem
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-4 text-sm font-semibold text-slate-500 uppercase">Problem</th>
                                        <th className="px-8 py-4 text-sm font-semibold text-slate-500 uppercase">Sheet</th>
                                        <th className="px-8 py-4 text-sm font-semibold text-slate-500 uppercase">Difficulty</th>
                                        <th className="px-8 py-4 text-sm font-semibold text-slate-500 uppercase">Platform</th>
                                        <th className="px-8 py-4 text-sm font-semibold text-slate-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-8 py-8 text-center text-slate-500">Loading...</td></tr>
                                    ) : filteredProblems.length === 0 ? (
                                        <tr><td colSpan={5} className="px-8 py-8 text-center text-slate-500">No problems found requesting your search.</td></tr>
                                    ) : (
                                        filteredProblems.map((problem) => (
                                            <tr key={problem._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-4">
                                                    <div className="font-medium text-slate-900">{problem.title}</div>
                                                    <a href={problem.problemUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500 hover:underline inline-flex items-center gap-1">
                                                        View Problem <FaExternalLinkAlt className="text-[10px]" />
                                                    </a>
                                                </td>
                                                <td className="px-8 py-4 text-slate-500">{problem.sheetId?.name || 'N/A'}</td>
                                                <td className="px-8 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide 
                                                        ${problem.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                                                            problem.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-rose-100 text-rose-700'}`}>
                                                        {problem.difficulty}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-slate-500 capitalize">{problem.platform}</td>
                                                <td className="px-8 py-4">
                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={`/admin/problems/${problem._id}`}
                                                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <FaEdit />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(problem._id)}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
}
