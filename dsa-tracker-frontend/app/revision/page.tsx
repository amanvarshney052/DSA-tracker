'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    FaArrowLeft,
    FaCalendar,
    FaCheck,
    FaExclamationTriangle,
    FaExternalLinkAlt,
    FaFire,
    FaTrash,
} from 'react-icons/fa';
import { revisionAPI } from '@/lib/services';
import { PLATFORM_ICONS, PLATFORM_COLORS, DIFFICULTY_COLORS } from '@/lib/constants';

import RevisionDashboard from '@/components/RevisionDashboard';

export default function RevisionPage() {
    const router = useRouter();
    const [revisions, setRevisions] = useState<any[]>([]);
    const [overdueRevisions, setOverdueRevisions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'overdue' | 'upcoming'>('all');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        loadRevisions();
    }, [router]);

    const loadRevisions = async () => {
        try {
            const [revisionsRes, overdueRes] = await Promise.all([
                revisionAPI.getSchedule(),
                revisionAPI.getOverdue(),
            ]);

            setRevisions(revisionsRes.data);
            setOverdueRevisions(overdueRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch revisions:', err);
            setLoading(false);
        }
    };

    const handleMarkComplete = async (revisionId: string) => {
        try {
            await revisionAPI.markComplete(revisionId);
            loadRevisions();
        } catch (err) {
            console.error('Failed to mark revision as complete:', err);
            alert('Failed to mark revision as complete');
        }
    };

    const handleDelete = async (revisionId: string) => {
        if (!confirm('Are you sure you want to stop revising this problem?')) return;
        try {
            await revisionAPI.delete(revisionId);
            loadRevisions();
        } catch (err) {
            console.error('Failed to delete revision:', err);
            alert('Failed to delete revision');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center">
                <div className="text-xl text-slate-500 font-medium">Loading revisions...</div>
            </div>
        );
    }

    const upcomingRevisions = revisions.filter(
        (r) => !overdueRevisions.some((o) => o._id === r._id)
    );

    const displayedRevisions =
        filter === 'overdue'
            ? overdueRevisions
            : filter === 'upcoming'
                ? upcomingRevisions
                : [...overdueRevisions, ...upcomingRevisions];

    return (
        <div className="min-h-screen bg-[#f4f9f4] p-6">
            <div className="container mx-auto max-w-6xl">
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
                            <FaCalendar className="text-primary-600 text-2xl" />
                        </div>
                        <h1 className="text-4xl font-heading font-bold text-slate-900">Revision Schedule</h1>
                    </div>
                    <p className="text-slate-500 text-lg">
                        Review problems using spaced repetition for better retention
                    </p>
                </motion.div>

                {/* Dashboard Stats */}
                <RevisionDashboard />

                {/* Filter Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-2 mb-8 inline-flex gap-2 shadow-sm border border-gray-100"
                >
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${filter === 'all'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        All ({revisions.length})
                    </button>
                    <button
                        onClick={() => setFilter('overdue')}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${filter === 'overdue'
                            ? 'bg-red-500 text-white shadow-md'
                            : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        Overdue ({overdueRevisions.length})
                    </button>
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${filter === 'upcoming'
                            ? 'bg-accent-500 text-white shadow-md'
                            : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        Upcoming ({upcomingRevisions.length})
                    </button>
                </motion.div>

                {/* Revisions List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {displayedRevisions.length === 0 ? (
                        <div className="bg-white rounded-[40px] p-12 text-center border border-gray-100 shadow-sm">
                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaCalendar className="text-4xl text-slate-300" />
                            </div>
                            <p className="text-2xl font-bold text-slate-800 mb-2 font-heading">
                                {filter === 'overdue'
                                    ? 'No overdue revisions! 🎉'
                                    : filter === 'upcoming'
                                        ? 'No upcoming revisions'
                                        : 'No revisions scheduled'}
                            </p>
                            <p className="text-slate-500">
                                {filter === 'all' && 'Solve problems and enable revision to see them here'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {displayedRevisions.map((revision, index) => (
                                <RevisionCard
                                    key={revision._id}
                                    revision={revision}
                                    index={index}
                                    isOverdue={overdueRevisions.some((o) => o._id === revision._id)}
                                    onMarkComplete={handleMarkComplete}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

function RevisionCard({
    revision,
    index,
    isOverdue,
    onMarkComplete,
    onDelete,
}: {
    revision: any;
    index: number;
    isOverdue: boolean;
    onMarkComplete: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const problem = revision.problemId;
    const PlatformIcon = PLATFORM_ICONS[problem?.platform as keyof typeof PLATFORM_ICONS];

    const scheduledDate = new Date(revision.scheduledDate);
    const today = new Date();
    const daysUntil = Math.ceil(
        (scheduledDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const getRevisionLabel = () => {
        if (revision.revisionNumber === 1) return '1st Revision (1 day)';
        if (revision.revisionNumber === 2) return '2nd Revision (7 days)';
        if (revision.revisionNumber === 3) return '3rd Revision (30 days)';
        return `Revision ${revision.revisionNumber}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group ${isOverdue ? 'ring-2 ring-red-100' : ''}`}
        >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-5 flex-1 w-full">
                    {/* Platform Icon */}
                    {problem && (
                        <div
                            className="p-3 rounded-2xl bg-gray-50 group-hover:bg-white group-hover:shadow-sm transition-all border border-gray-100"
                            style={{ color: PLATFORM_COLORS[problem.platform as keyof typeof PLATFORM_COLORS] }}
                        >
                            <PlatformIcon size={24} />
                        </div>
                    )}

                    {/* Problem Info */}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                            {problem?.title || 'Unknown Problem'}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            {problem && (
                                <span
                                    className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border"
                                    style={{
                                        backgroundColor: `${DIFFICULTY_COLORS[problem.difficulty as keyof typeof DIFFICULTY_COLORS]}10`,
                                        color: DIFFICULTY_COLORS[problem.difficulty as keyof typeof DIFFICULTY_COLORS],
                                        borderColor: `${DIFFICULTY_COLORS[problem.difficulty as keyof typeof DIFFICULTY_COLORS]}20`,
                                    }}
                                >
                                    {problem.difficulty}
                                </span>
                            )}
                            <span
                                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${isOverdue
                                    ? 'bg-red-50 text-red-600 border-red-100'
                                    : 'bg-accent-50 text-accent-600 border-accent-100'
                                    }`}
                            >
                                {getRevisionLabel()}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm font-medium">
                            <div className="flex items-center gap-2 text-slate-500">
                                <FaCalendar className="text-slate-400" />
                                <span>
                                    {scheduledDate.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                            {isOverdue ? (
                                <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                                    {Math.abs(daysUntil)} {Math.abs(daysUntil) === 1 ? 'day' : 'days'} overdue
                                </span>
                            ) : daysUntil === 0 ? (
                                <span className="text-accent-500 bg-accent-50 px-2 py-0.5 rounded-md">Due today</span>
                            ) : (
                                <span className="text-slate-400">
                                    In {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex w-full md:w-auto items-center gap-3 pl-16 md:pl-0">
                    {problem && (
                        <a
                            href={problem.problemUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors"
                        >
                            <FaExternalLinkAlt size={12} />
                            Solve
                        </a>
                    )}
                    <button
                        onClick={() => onMarkComplete(revision._id)}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    >
                        <FaCheck />
                        Mark Complete
                    </button>
                    <button
                        onClick={() => onDelete(revision._id)}
                        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors"
                        title="Remove from revision"
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
