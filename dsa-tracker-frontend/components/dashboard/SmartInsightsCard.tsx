'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { analyticsAPI } from '@/lib/services';
import { FaBolt, FaBrain, FaExclamationTriangle, FaMagic, FaClock } from 'react-icons/fa';

interface Insights {
    weakestTopic: { topic: string; ratio: number; solved: number; total: number };
    fastestDiff: { difficulty: string; avgTime: number };
    revisionRate: number;
    totalRevisions: number;
    totalTimeSpent: number;
}

export default function SmartInsightsCard({ sheetId }: { sheetId?: string }) {
    const [insights, setInsights] = useState<Insights | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        analyticsAPI
            .getInsights(sheetId ? { sheetId } : {})
            .then((res) => {
                setInsights(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch insights:', err);
                setError('Failed to load.' + (err.message || ''));
                setLoading(false);
            });
    }, [sheetId]);

    if (loading) return (
        <div className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm animate-pulse mb-8">
            <div className="h-6 w-32 bg-slate-100 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 h-24 rounded-3xl"></div>
                <div className="bg-slate-50 h-24 rounded-3xl"></div>
                <div className="bg-slate-50 h-24 rounded-3xl"></div>
                <div className="bg-slate-50 h-24 rounded-3xl"></div>
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 rounded-[40px] p-6 border border-red-100 mb-8 text-red-500 text-sm font-medium text-center">
            Unable to load smart insights. {error}
        </div>
    );

    if (!insights) return null;

    // Helper to format time
    const formatTime = (mins: number) => {
        if (!mins) return '0m';
        if (mins < 60) return `${mins}m`;
        return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    };

    return (
        <div className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <FaMagic className="text-purple-500" />
                <h3 className="font-bold text-slate-900 font-heading">Smart Insights</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Speed Insight */}
                <div className="bg-blue-50 rounded-3xl p-4 flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600 mt-1">
                        <FaBolt />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Speed</p>
                        {insights.fastestDiff.difficulty !== 'None' ? (
                            <>
                                <p className="text-slate-800 font-bold text-sm leading-snug">
                                    You solve <span className="capitalize text-blue-600">{insights.fastestDiff.difficulty}</span> problems fastest.
                                </p>
                                <p className="text-slate-500 text-xs mt-1">Avg: {formatTime(insights.fastestDiff.avgTime)}</p>
                            </>
                        ) : (
                            <p className="text-slate-500 text-xs">Not enough data yet.</p>
                        )}
                    </div>
                </div>

                {/* 2. Weakness Insight */}
                <div className="bg-orange-50 rounded-3xl p-4 flex items-start gap-3">
                    <div className="bg-orange-100 p-2 rounded-xl text-orange-600 mt-1">
                        <FaExclamationTriangle />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">Focus</p>
                        {insights.weakestTopic.topic !== 'None' ? (
                            <>
                                <p className="text-slate-800 font-bold text-sm leading-snug">
                                    <span className="text-orange-600">{insights.weakestTopic.topic}</span> needs attention.
                                </p>
                                <p className="text-slate-500 text-xs mt-1">
                                    {Math.round(insights.weakestTopic.ratio * 100)}% solved
                                </p>
                            </>
                        ) : (
                            <p className="text-slate-500 text-xs">All topics look good!</p>
                        )}
                    </div>
                </div>

                {/* 3. Revision Insight */}
                <div className="bg-emerald-50 rounded-3xl p-4 flex items-start gap-3">
                    <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600 mt-1">
                        <FaBrain />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Retention</p>
                        <p className="text-slate-800 font-bold text-sm leading-snug">
                            Success: <span className="text-emerald-600">{insights.revisionRate}%</span>
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                            {insights.revisionRate >= 80 ? 'Excellent!' : 'Review needed.'}
                        </p>
                    </div>
                </div>

                {/* 4. Total Time Insight - NEW */}
                <div className="bg-purple-50 rounded-3xl p-4 flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-xl text-purple-600 mt-1">
                        <FaClock />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Time Invested</p>
                        <p className="text-slate-800 font-bold text-sm leading-snug">
                            Total: <span className="text-purple-600">{formatTime(insights.totalTimeSpent)}</span>
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                            Keep grinding! ⏳
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
