'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { dailyAPI, progressAPI } from '@/lib/services';
import { FaCalendarDay, FaCheckCircle, FaExternalLinkAlt, FaClock } from 'react-icons/fa';

export default function DailyChallengeCard() {
    const [challenge, setChallenge] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        dailyAPI.getToday()
            .then(res => {
                setChallenge(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to get daily challenge', err);
                setLoading(false);
            });
    }, []);

    // Countdown Timer to Midnight
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const diff = tomorrow.getTime() - now.getTime();

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (loading) return (
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 animate-pulse mb-8 h-48"></div>
    );

    if (!challenge || !challenge.problem) return null; // Or show "No challenge"

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 relative overflow-hidden mb-8"
        >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-purple-50 p-2 rounded-lg backdrop-blur-sm">
                            <FaCalendarDay className="text-purple-600" />
                        </div>
                        <span className="font-bold text-sm tracking-widest uppercase text-slate-500">Daily Challenge</span>
                        <div className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full border border-slate-200">
                            <FaClock className="text-xs" />
                            <span>Resets in {timeLeft}</span>
                        </div>
                    </div>

                    <h2 className="text-3xl font-heading font-bold mb-2 text-slate-900">{challenge.problem.title}</h2>
                    <p className="text-slate-500 mb-4 max-w-xl text-lg hidden md:block">
                        {challenge.message || "Consistency is the key to mastery. Solve today's picked problem!"}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${challenge.problem.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                challenge.problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                            }`}>
                            {challenge.problem.difficulty}
                        </span>
                        <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600 border border-slate-200">
                            {challenge.problem.platform}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[180px]">
                    {challenge.isSolved ? (
                        <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-100">
                            <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-2" />
                            <p className="font-bold text-lg text-green-800">Solved!</p>
                            <p className="text-xs text-green-600">Great job today.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 w-full">
                            <a
                                href={challenge.problem.problemUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200 hover:scale-105"
                            >
                                <span>Solve Now</span>
                                <FaExternalLinkAlt className="text-sm" />
                            </a>

                            <button
                                onClick={async () => {
                                    const timeStr = prompt('Time taken (minutes)?', '15');
                                    if (timeStr === null) return;

                                    try {
                                        setLoading(true);
                                        await progressAPI.markSolved({
                                            problemId: challenge.problem._id,
                                            timeTaken: parseInt(timeStr) || 15
                                        });
                                        window.location.reload(); // update everywhere
                                    } catch (e) {
                                        alert('Failed to save');
                                        setLoading(false);
                                    }
                                }}
                                className="bg-white hover:bg-slate-50 text-slate-600 px-6 py-2 rounded-2xl font-bold text-sm transition-colors border border-slate-200"
                            >
                                Mark as Solved
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
