'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaBullseye, FaChartLine, FaFire, FaPlay } from 'react-icons/fa';
import { analyticsAPI } from '@/lib/services';

interface FocusTopic {
    topic: string;
    count: number;
    reason: string;
    recommendation?: {
        title: string;
        url: string;
        difficulty: string;
        _id: string;
    } | null;
}

interface FocusTopicCardProps {
    sheetId?: string;
}

export default function FocusTopicCard({ sheetId }: FocusTopicCardProps) {
    const [focusTopic, setFocusTopic] = useState<FocusTopic | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        analyticsAPI
            .getTopicStrength(sheetId ? { sheetId } : {})
            .then((res) => {
                const topicData = res.data;
                const topics = Object.entries(topicData).map(([name, stats]: [string, any]) => ({
                    name,
                    solved: stats.total, // "total" is solved count from backend
                    available: stats.totalAvailable || 0,
                    percentage: stats.totalAvailable ? (stats.total / stats.totalAvailable) * 100 : 100,
                    recommendation: stats.recommendation
                }));

                // Logic 1: If Sheet Selected -> Recommend Lowest %
                if (sheetId) {
                    const validTopics = topics.filter(t => t.available > 0);

                    if (validTopics.length > 0) {
                        // Sort: Lowest %, then Highest Available
                        validTopics.sort((a, b) => {
                            if (a.percentage !== b.percentage) return a.percentage - b.percentage;
                            return b.available - a.available;
                        });

                        const target = validTopics[0];
                        setFocusTopic({
                            topic: target.name,
                            count: target.solved,
                            reason: target.percentage === 0
                                ? `You haven't started ${target.name} yet.`
                                : `${target.solved}/${target.available} problems solved (${Math.round(target.percentage)}%). Keep going!`,
                            recommendation: target.recommendation
                        });
                    } else {
                        setFocusTopic({ topic: 'Start Solving', count: 0, reason: 'Select a problem to begin' });
                    }
                }
                // Logic 2: Overall (No Sheet)
                else {
                    if (Object.keys(topicData).length > 0) {
                        const sorted = topics.sort((a, b) => a.solved - b.solved);
                        const target = sorted[0];
                        setFocusTopic({
                            topic: target.name,
                            count: target.solved,
                            reason: `Strengthen your ${target.name} skills!`
                        });
                    } else {
                        setFocusTopic({ topic: 'Arrays', count: 0, reason: 'Great starting point!' });
                    }
                }

                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch focus topic:', err);
                setFocusTopic({ topic: 'Arrays', count: 0, reason: 'Recommended for you' });
                setLoading(false);
            });
    }, [sheetId]);

    if (loading) {
        return (
            <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 flex items-center justify-center min-h-[200px]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-slate-100 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-slate-100 rounded mb-2"></div>
                </div>
            </div>
        );
    }

    if (!focusTopic) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-purple-600 rounded-[40px] p-8 text-white relative overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 text-purple-100">
                        <FaBullseye className="text-xl" />
                        <span className="font-semibold uppercase tracking-wider text-sm">
                            {sheetId ? 'Sheet Focus' : 'Recommended Focus'}
                        </span>
                    </div>

                    <h3 className="text-4xl font-heading font-bold mb-3">{focusTopic.topic}</h3>

                    <p className="text-purple-100 text-lg mb-6 leading-relaxed opacity-90">
                        {focusTopic.reason}
                    </p>

                    <div className="flex items-center gap-4">
                        {focusTopic.recommendation ? (
                            <a
                                href={focusTopic.recommendation.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors shadow-sm group"
                            >
                                <FaPlay className="text-sm group-hover:scale-110 transition-transform" />
                                <span>Solve: {focusTopic.recommendation.title}</span>
                            </a>
                        ) : (
                            <button className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer">
                                <FaChartLine />
                                <span className="font-medium">See Details</span>
                            </button>
                        )}

                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                            <FaFire className="text-orange-300" />
                            <span>High Priority</span>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block">
                    <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/20">
                        <div className="bg-white text-purple-600 p-4 rounded-2xl shadow-sm">
                            <FaBullseye className="text-4xl" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
