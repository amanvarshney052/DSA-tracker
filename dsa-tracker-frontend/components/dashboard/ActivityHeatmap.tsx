'use client';

import { useMemo } from 'react';

interface ActivityHeatmapProps {
    submissionCalendar: Record<string, number>;
    submissionDates?: (string | number)[];
}

export default function ActivityHeatmap({ submissionCalendar, submissionDates }: ActivityHeatmapProps) {
    // 1. Normalize Calendar Data to Local Timezone Midnights
    // This allows us to work with local dates reliably without server timezone offsets messing up "Today" vs "Yesterday"
    const localSubmissionData = useMemo(() => {
        const map = new Map<string, number>();

        // Priority: Use raw submissionDates if available (most accurate client-side Aggregation)
        if (submissionDates && submissionDates.length > 0) {
            submissionDates.forEach(ts => {
                const date = new Date(ts);
                date.setHours(0, 0, 0, 0); // Local Midnight
                const localKey = date.toDateString();
                map.set(localKey, (map.get(localKey) || 0) + 1);
            });
            return map;
        }

        // Fallback: Use server-aggregated calendar
        if (!submissionCalendar) return map;

        Object.entries(submissionCalendar).forEach(([ts, count]) => {
            // Timestamp from server is in seconds.
            // Create date object (browser interprets it in local timezone)
            const date = new Date(parseInt(ts) * 1000);
            // Normalize to Local Midnight
            date.setHours(0, 0, 0, 0);
            const localKey = date.toDateString(); // e.g., "Fri Oct 20 2025"
            map.set(localKey, (map.get(localKey) || 0) + count);
        });
        return map;
    }, [submissionCalendar, submissionDates]);

    // 2. Generate Data for Last 4 Months (Distinct Month Blocks)
    const monthBlocks = useMemo(() => {
        const today = new Date();
        // We want the current month + previous 3 months
        const blocks = [];
        for (let i = 3; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = d.getFullYear();
            const month = d.getMonth(); // 0-11
            const monthName = d.toLocaleString('default', { month: 'short' });

            // Get number of days in this month
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            // Get day of week for the 1st (0=Sun, 1=Mon, ...)
            // We usually want 7 rows: Sun(0)..Sat(6) or Mon..Sun?
            // GitHub uses Sun(0) at top.
            // Let's stick to Grid flow: 7 rows.
            // We need to know which rowIndex the 1st falls on.
            const startDay = new Date(year, month, 1).getDay(); // 0-6

            const days = [];
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                date.setHours(0, 0, 0, 0);
                days.push(date);
            }

            blocks.push({
                year,
                month,
                name: monthName,
                startOffset: startDay, // 0-6
                days
            });
        }
        return blocks;
    }, []);

    // 3. Robust Streak Calculation
    const stats = useMemo(() => {
        let total = 0;
        localSubmissionData.forEach(v => total += v);

        // Streak Logic: Check consecutive days backwards from Today
        let streak = 0;
        const checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);

        // If solved today, start with 1, else start with 0 and check yesterday
        if (localSubmissionData.has(checkDate.toDateString())) {
            streak = 1;
        } else {
            // Check yesterday
            checkDate.setDate(checkDate.getDate() - 1);
            if (localSubmissionData.has(checkDate.toDateString())) {
                streak = 1;
            }
        }

        // Continue checking backwards if streak started
        if (streak > 0) {
            while (true) {
                checkDate.setDate(checkDate.getDate() - 1);
                if (localSubmissionData.has(checkDate.toDateString())) {
                    streak++;
                } else {
                    break;
                }
            }
        }

        return { total, streak };
    }, [localSubmissionData]);

    const getColor = (count: number) => {
        if (count === 0) return 'bg-gray-100';
        if (count <= 2) return 'bg-emerald-200';
        if (count <= 4) return 'bg-emerald-300';
        if (count <= 6) return 'bg-emerald-500';
        return 'bg-emerald-700';
    };

    return (
        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 w-full h-[400px] md:h-[500px] flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-auto gap-4">
                <h3 className="text-slate-900 text-xl font-bold font-heading">Activity</h3>
                <div className="flex gap-3">
                    <div className="text-slate-500 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-2">
                        <span>🔥 {stats.streak} Streak</span>
                    </div>
                    <div className="text-slate-500 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        {stats.total} submissions (4 mo)
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto flex-1 flex items-center no-scrollbar">
                <div className="min-w-max mx-auto flex gap-6">
                    {monthBlocks.map((block, i) => (
                        <div key={i} className="flex flex-col gap-3">
                            <div className="text-xs font-bold text-slate-400 text-center uppercase tracking-wider">{block.name}</div>

                            {/* Month Grid */}
                            <div
                                className="grid grid-rows-7 gap-1.5 grid-flow-col"
                            >
                                {/* Empty placeholders for start offset */}
                                {Array.from({ length: block.startOffset }).map((_, idx) => (
                                    <div key={`empty-${idx}`} className="w-8 h-8"></div>
                                ))}

                                {/* Actual Days */}
                                {block.days.map((date, dayIdx) => {
                                    const count = localSubmissionData.get(date.toDateString()) || 0;
                                    return (
                                        <div
                                            key={dayIdx}
                                            className={`w-8 h-8 rounded-md ${getColor(count)} transition-all hover:scale-110 relative group cursor-default`}
                                            title={`${date.toDateString()}: ${count}`}
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg pointer-events-none whitespace-nowrap shadow-xl z-20">
                                                {count} submissions
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3 mt-auto pt-4 text-xs text-slate-400 justify-end font-medium">
                <span>Less</span>
                <div className="flex gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-gray-100"></div>
                    <div className="w-6 h-6 rounded-md bg-emerald-200"></div>
                    <div className="w-6 h-6 rounded-md bg-emerald-300"></div>
                    <div className="w-6 h-6 rounded-md bg-emerald-500"></div>
                    <div className="w-6 h-6 rounded-md bg-emerald-700"></div>
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
