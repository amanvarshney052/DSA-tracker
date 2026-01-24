'use client';

import { motion } from 'framer-motion';

interface SolvedProblemsCardProps {
    stats: {
        totalSolved: number;
        totalProblems: number;
        easy: number;
        totalEasy: number;
        medium: number;
        totalMedium: number;
        hard: number;
        totalHard: number;
    } | null;
}

export default function SolvedProblemsCard({ stats }: SolvedProblemsCardProps) {
    if (!stats) return null;

    // Calculate percentages for the circle
    // We want the circle to be composed of 3 segments based on solved counts relative to TOTAL SOLVED (for distribution)
    // OR relative to Total Problems? The image shows a full circle where the colored parts represent the solved portion.
    // Actually, usually it's: colored arc = solved / total problems.
    // Let's assume the circle represents 100% of problems in the DB.

    // Circle config
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const totalSolvedPercent = (stats.totalSolved / (stats.totalProblems || 1)) * 100;
    const strokeDashoffset = circumference - (totalSolvedPercent / 100) * circumference;

    return (
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 font-sans h-full">
            <h3 className="text-slate-400 text-xs font-bold mb-6 uppercase tracking-wider">Solved Problems</h3>

            <div className="flex items-center gap-8 h-full">
                {/* Circular Progress */}
                <div className="relative w-36 h-36 flex flex-col items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background Circle */}
                        <circle
                            cx="72"
                            cy="72"
                            r={radius}
                            stroke="#f1f5f9"
                            strokeWidth="8"
                            fill="transparent"
                        />
                        {/* Foreground Circle handled by Gradient below */}
                    </svg>

                    {/* Conic Gradient for detailed segments */}
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `conic-gradient(
                                #10b981 0% ${stats.easy / stats.totalProblems * 100}%, 
                                #f59e0b ${stats.easy / stats.totalProblems * 100}% ${(stats.easy + stats.medium) / stats.totalProblems * 100}%, 
                                #f43f5e ${(stats.easy + stats.medium) / stats.totalProblems * 100}% ${(stats.easy + stats.medium + stats.hard) / stats.totalProblems * 100}%,
                                #f1f5f9 ${(stats.easy + stats.medium + stats.hard) / stats.totalProblems * 100}% 100%
                            )`,
                            mask: 'radial-gradient(transparent 58%, black 60%)',
                            WebkitMask: 'radial-gradient(transparent 58%, black 60%)',
                            // Add slight margin to fit inside SVG stroke if needed, or just match radius
                            // Radius 50 is relative to viewBox. CSS 100% matches div size.
                        }}
                    ></div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold font-heading text-slate-900">{stats.totalSolved}</span>
                        <span className="text-xs text-slate-400 font-medium mt-1">/ {stats.totalProblems}</span>
                        <div className="mt-2 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <span className="text-emerald-600 text-[10px] font-bold">✓ SOLVED</span>
                        </div>
                    </div>
                </div>

                {/* Legend / details */}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <span className="text-sm font-bold text-slate-600">Easy</span>
                        <div className="text-right flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{stats.easy}</span>
                            <span className="text-xs text-slate-400 font-medium">/{stats.totalEasy}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <span className="text-sm font-bold text-slate-600">Medium</span>
                        <div className="text-right flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{stats.medium}</span>
                            <span className="text-xs text-slate-400 font-medium">/{stats.totalMedium}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <span className="text-sm font-bold text-slate-600">Hard</span>
                        <div className="text-right flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{stats.hard}</span>
                            <span className="text-xs text-slate-400 font-medium">/{stats.totalHard}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
