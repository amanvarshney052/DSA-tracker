'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaCalendarPlus, FaHistory } from 'react-icons/fa';
import AdminGuard from '@/components/auth/AdminGuard';
import { adminAPI, dailyAPI, problemsAPI } from '@/lib/services';

export default function DailyProblemAdmin() {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [problems, setProblems] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0], // Today
        problemId: '',
        message: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            dailyAPI.getAll(),
            problemsAPI.getAll()
        ]).then(([dailyRes, probsRes]) => {
            setChallenges(dailyRes.data);
            setProblems(probsRes.data);
            setLoading(false);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dailyAPI.create(formData);
            alert('Daily Challenge Scheduled!');
            // Refresh list
            const res = await dailyAPI.getAll();
            setChallenges(res.data);
        } catch (error) {
            console.error(error);
            alert('Failed to schedule challenge');
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-[#f4f9f4] p-6">
                <div className="container mx-auto max-w-4xl">
                    <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-6 transition-colors">
                        <FaArrowLeft /> Back to Admin
                    </Link>

                    <h1 className="text-3xl font-heading font-bold text-slate-900 mb-8">Daily Problem Scheduler</h1>

                    {/* Scheduler Form */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 mb-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <FaCalendarPlus className="text-purple-500" />
                            Schedule Challenge
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Problem</label>
                                    <select
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                                        value={formData.problemId}
                                        onChange={e => setFormData({ ...formData, problemId: e.target.value })}
                                    >
                                        <option value="">-- Choose a Problem --</option>
                                        {problems.map(p => (
                                            <option key={p._id} value={p._id}>
                                                [{p.platform}] {p.title} ({p.difficulty})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Admin Message (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Focus on sliding window technique!"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="bg-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl w-full md:w-auto"
                            >
                                Publish Challenge
                            </button>
                        </form>
                    </div>

                    {/* History List */}
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <FaHistory className="text-slate-400" />
                            Scheduled Challenges
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-100">
                                    <tr>
                                        <th className="pb-4 font-bold text-slate-400 text-sm">Date</th>
                                        <th className="pb-4 font-bold text-slate-400 text-sm">Problem</th>
                                        <th className="pb-4 font-bold text-slate-400 text-sm">Message</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {challenges.map(c => (
                                        <tr key={c._id} className="hover:bg-slate-50">
                                            <td className="py-4 font-mono text-sm text-slate-600">{c.date}</td>
                                            <td className="py-4 font-bold text-slate-800">
                                                {c.problemId?.title || 'Unknown Problem'}
                                            </td>
                                            <td className="py-4 text-sm text-slate-500 italic">
                                                {c.message || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
}
