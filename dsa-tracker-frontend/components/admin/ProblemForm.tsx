'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { problemsAPI, sheetsAPI } from '@/lib/services';
import { FaSave, FaTimes } from 'react-icons/fa';

interface ProblemFormProps {
    initialData?: {
        _id?: string;
        title: string;
        problemUrl: string;
        platform: string;
        difficulty: string;
        sheetId: string;
        topics?: string[];
        estimatedTime?: number;
    };
    isEditing?: boolean;
}

export default function ProblemForm({ initialData, isEditing = false }: ProblemFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        problemUrl: initialData?.problemUrl || '',
        platform: initialData?.platform || 'leetcode',
        difficulty: initialData?.difficulty || 'easy',
        sheetId: initialData?.sheetId || '',
        topics: initialData?.topics?.join(', ') || '',
        estimatedTime: initialData?.estimatedTime || 30,
    });
    const [sheets, setSheets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch sheets for the dropdown
        const fetchSheets = async () => {
            try {
                const res = await sheetsAPI.getAll();
                setSheets(res.data);
                // Set default sheet if creating new and sheets exist
                if (!isEditing && res.data.length > 0 && !formData.sheetId) {
                    setFormData(prev => ({ ...prev, sheetId: res.data[0]._id }));
                }
            } catch (err) {
                console.error('Failed to fetch sheets', err);
            }
        };
        fetchSheets();
    }, [isEditing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                topics: formData.topics.split(',').map(t => t.trim()).filter(t => t),
            };

            if (isEditing && initialData?._id) {
                await problemsAPI.update(initialData._id, payload);
            } else {
                await problemsAPI.create(payload);
            }
            router.push('/admin/problems');
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save problem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 max-w-2xl">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Problem Title</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                        placeholder="e.g., Two Sum"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Problem URL</label>
                    <input
                        type="url"
                        value={formData.problemUrl}
                        onChange={(e) => setFormData({ ...formData, problemUrl: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                        placeholder="https://leetcode.com/problems/..."
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
                        <select
                            value={formData.platform}
                            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                        >
                            <option value="leetcode">LeetCode</option>
                            <option value="gfg">GeeksForGeeks</option>
                            <option value="codeforces">CodeForces</option>
                            <option value="codechef">CodeChef</option>
                            <option value="hackerrank">HackerRank</option>
                            <option value="custom">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty</label>
                        <select
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sheet</label>
                    <select
                        value={formData.sheetId}
                        onChange={(e) => setFormData({ ...formData, sheetId: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                        required
                    >
                        <option value="">Select a Sheet</option>
                        {sheets.map(sheet => (
                            <option key={sheet._id} value={sheet._id}>{sheet.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Topics (comma separated)</label>
                    <input
                        type="text"
                        value={formData.topics}
                        onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                        placeholder="Array, Hash Table, Sorting"
                    />
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors flex items-center gap-2"
                    >
                        <FaTimes /> Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none ml-auto"
                    >
                        <FaSave /> {loading ? 'Saving...' : 'Save Problem'}
                    </button>
                </div>
            </div>
        </form>
    );
}
