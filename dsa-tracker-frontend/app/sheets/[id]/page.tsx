'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaArrowLeft, FaExternalLinkAlt, FaCheck, FaFilter, FaListUl, FaTrophy } from 'react-icons/fa';
import { sheetsAPI, progressAPI } from '@/lib/services';
import { PLATFORM_ICONS, PLATFORM_COLORS, DIFFICULTY_COLORS } from '@/lib/constants';
import MarkSolvedModal from '@/components/modals/MarkSolvedModal';

export default function SheetDetailPage() {
    const router = useRouter();
    const params = useParams();
    const sheetId = params.id as string;

    const [sheet, setSheet] = useState<any>(null);
    const [problems, setProblems] = useState<any[]>([]);
    const [filteredProblems, setFilteredProblems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        platform: 'all',
        difficulty: 'all',
        status: 'all',
        topic: 'all',
    });
    const [solvingProblem, setSolvingProblem] = useState<any | null>(null);

    // Extract unique topics
    const uniqueTopics = Array.from(new Set(
        problems.flatMap(p => p.topics || [])
    )).sort();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        sheetsAPI
            .getById(sheetId)
            .then((res) => {
                setSheet(res.data);
                setProblems(res.data.problems || []);
                setFilteredProblems(res.data.problems || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch sheet:', err);
                setLoading(false);
            });
    }, [sheetId, router]);

    useEffect(() => {
        let filtered = [...problems];

        if (filters.platform !== 'all') {
            filtered = filtered.filter((p) => p.platform === filters.platform);
        }

        if (filters.difficulty !== 'all') {
            filtered = filtered.filter((p) => p.difficulty === filters.difficulty);
        }

        if (filters.status !== 'all') {
            filtered = filtered.filter((p) => {
                const isSolved = p.userProgress?.solved || false;
                return filters.status === 'solved' ? isSolved : !isSolved;
            });
        }

        if (filters.topic !== 'all') {
            filtered = filtered.filter((p) => p.topics?.includes(filters.topic));
        }

        setFilteredProblems(filtered);
    }, [filters, problems]);

    const handleMarkSolved = async (data: any) => {
        try {
            await progressAPI.markSolved(data);

            // Refresh sheet data
            const res = await sheetsAPI.getById(sheetId);
            setSheet(res.data);
            setProblems(res.data.problems || []);
            setSolvingProblem(null);
        } catch (err) {
            console.error('Failed to mark as solved:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center">
                <div className="text-xl text-slate-500 font-medium">Loading sheet...</div>
            </div>
        );
    }

    if (!sheet) {
        return (
            <div className="min-h-screen bg-[#f4f9f4] p-6 flex flex-col items-center justify-center">
                <div className="bg-white p-8 rounded-[40px] shadow-sm text-center max-w-md">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Sheet not found</h2>
                    <p className="text-slate-500 mb-6">The sheet you are looking for does not exist or has been removed.</p>
                    <Link href="/sheets" className="text-primary-600 font-bold hover:underline">
                        Back to Sheets
                    </Link>
                </div>
            </div>
        );
    }

    const solvedCount = problems.filter((p) => p.userProgress?.solved).length;
    const progressPercentage = problems.length > 0 ? (solvedCount / problems.length) * 100 : 0;

    return (
        <div className="min-h-screen bg-[#f4f9f4] p-6">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/sheets"
                        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-medium"
                    >
                        <FaArrowLeft />
                        Back to Sheets
                    </Link>
                </div>

                {/* Sheet Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[40px] p-8 mb-6 shadow-sm border border-gray-100 relative overflow-hidden"
                >
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 z-0"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-primary-100 p-2 rounded-xl text-primary-600">
                                        <FaListUl />
                                    </div>
                                    <span className="text-sm font-bold text-primary-600 uppercase tracking-wider">DSA Sheet</span>
                                </div>
                                <h1 className="text-4xl font-heading font-bold text-slate-900 mb-4">{sheet.name}</h1>
                                <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">
                                    {sheet.description || 'Master Data Structures and Algorithms with this curated problem set.'}
                                </p>
                            </div>
                            <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 self-start">
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-wide block mb-1">Difficulty</span>
                                <span className="text-lg font-bold text-slate-900 capitalize">{sheet.difficulty}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <FaTrophy className="text-yellow-500" />
                                    <span className="font-bold text-slate-700">Your Progress</span>
                                </div>
                                <span className="text-sm font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
                                    {solvedCount} / {problems.length} Solved
                                </span>
                            </div>
                            <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-xs font-medium text-slate-400">
                                <span>Start</span>
                                <span>{progressPercentage.toFixed(0)}% Complete</span>
                                <span>Master</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[32px] p-6 mb-6 shadow-sm border border-gray-100"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <FaFilter className="text-primary-500" />
                        <h3 className="font-bold text-slate-800">Filter Problems</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <select
                                value={filters.platform}
                                onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium appearance-none"
                            >
                                <option value="all">All Platforms</option>
                                <option value="leetcode">LeetCode</option>
                                <option value="codeforces">Codeforces</option>
                                <option value="gfg">GeeksforGeeks</option>
                                <option value="codechef">CodeChef</option>
                                <option value="hackerrank">HackerRank</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                        <div className="relative">
                            <select
                                value={filters.difficulty}
                                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium appearance-none"
                            >
                                <option value="all">All Difficulties</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                        <div className="relative">
                            <select
                                value={filters.topic}
                                onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium appearance-none"
                            >
                                <option value="all">All Topics</option>
                                {uniqueTopics.map(topic => (
                                    <option key={topic} value={topic}>{topic}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                        <div className="relative">
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium appearance-none"
                            >
                                <option value="all">All Problems</option>
                                <option value="unsolved">Unsolved</option>
                                <option value="solved">Solved</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                    </div>
                </motion.div>

                {/* Problems List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {filteredProblems.length === 0 ? (
                        <div className="bg-white rounded-[40px] p-12 text-center shadow-sm border border-gray-100">
                            <p className="text-slate-400 font-medium text-lg">No problems match your filters</p>
                            <button
                                onClick={() => setFilters({ platform: 'all', difficulty: 'all', status: 'all', topic: 'all' })}
                                className="mt-4 text-primary-600 font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredProblems.map((problem, index) => (
                                <ProblemCard
                                    key={problem._id}
                                    problem={problem}
                                    index={index}
                                    onMarkSolved={() => setSolvingProblem(problem)}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Solve Modal */}
            <AnimatePresence>
                {solvingProblem && (
                    <MarkSolvedModal
                        problem={solvingProblem}
                        onClose={() => setSolvingProblem(null)}
                        onSubmit={handleMarkSolved}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function ProblemCard({
    problem,
    index,
    onMarkSolved,
}: {
    problem: any;
    index: number;
    onMarkSolved: () => void;
}) {
    const PlatformIcon = PLATFORM_ICONS[problem.platform as keyof typeof PLATFORM_ICONS];
    const isSolved = problem.userProgress?.solved || false;

    // Difficulty accent colors matching the image style
    const getDifficultyStyle = (diff: string) => {
        switch (diff.toLowerCase()) {
            case 'easy': return 'bg-emerald-100/80 text-emerald-700';
            case 'medium': return 'bg-amber-100/80 text-amber-700';
            case 'hard': return 'bg-rose-100/80 text-rose-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group bg-white rounded-2xl p-4 md:p-5 shadow-sm border transition-all hover:shadow-md ${isSolved ? 'border-green-200 shadow-green-100' : 'border-slate-100'
                } flex flex-col md:flex-row items-center gap-4`}
        >
            {/* Left: Checkbox & Icon */}
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button
                    onClick={!isSolved ? onMarkSolved : undefined}
                    className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center transition-all duration-300 ${isSolved
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 scale-100'
                        : 'bg-slate-100 text-transparent hover:bg-slate-200 scale-95 hover:scale-100'
                        }`}
                >
                    <FaCheck size={16} className={isSolved ? 'opacity-100' : 'opacity-0'} />
                </button>

                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-100 shadow-sm text-slate-400 md:hidden"
                >
                    <PlatformIcon size={18} />
                </div>
            </div>

            {/* Middle: Content */}
            <div className="flex-1 w-full text-left">
                <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-bold truncate ${isSolved ? 'text-slate-900' : 'text-slate-900 group-hover:text-primary-600 transition-colors'}`}>
                        {problem.title}
                    </h3>
                    <div className="hidden md:flex w-8 h-8 rounded-full items-center justify-center bg-slate-50 border border-slate-100 text-slate-400">
                        <PlatformIcon size={14} />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getDifficultyStyle(problem.difficulty)}`}>
                        {problem.difficulty}
                    </span>
                    {problem.topics?.slice(0, 3).map((topic: string) => (
                        <span key={topic} className="px-2.5 py-1 bg-slate-100/80 text-slate-500 rounded-lg text-xs font-bold">
                            {topic}
                        </span>
                    ))}
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end mt-2 md:mt-0">
                <a
                    href={problem.problemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center gap-2 text-sm font-bold transition-all active:scale-95"
                >
                    <FaExternalLinkAlt size={12} />
                    Solve
                </a>

                {isSolved ? (
                    <div className="px-5 py-2.5 bg-green-100 text-green-700 rounded-xl text-sm font-bold flex items-center gap-2 cursor-default">
                        <FaCheck size={12} />
                        Done
                    </div>
                ) : (
                    <button
                        onClick={onMarkSolved}
                        className="px-5 py-2.5 bg-white border-2 border-slate-100 hover:border-green-500 hover:text-green-600 text-slate-400 rounded-xl text-sm font-bold transition-all active:scale-95"
                    >
                        Mark Done
                    </button>
                )}
            </div>
        </motion.div>
    );
}
