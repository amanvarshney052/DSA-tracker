'use client';

import { useEffect, useState } from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { analyticsAPI } from '@/lib/services';

interface TopicData {
    topic: string;
    count: number;
    easy: number;
    medium: number;
    hard: number;
}

interface TopicProgressChartProps {
    sheetId?: string;
}

export default function TopicProgressChart({ sheetId }: TopicProgressChartProps) {
    const [data, setData] = useState<TopicData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        analyticsAPI
            .getTopicStrength(sheetId ? { sheetId } : {})
            .then((res) => {
                // Convert object to array format for Recharts
                const topicData = Object.entries(res.data).map(([topic, stats]: [string, any]) => ({
                    topic,
                    count: stats.total,
                    easy: stats.easy,
                    medium: stats.medium,
                    hard: stats.hard,
                }));

                // Sort by total count and take top 8 topics
                const sortedData = topicData
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 8);

                setData(sortedData);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch topic strength:', err);
                setLoading(false);
            });
    }, [sheetId]);

    if (loading) {
        return (
            <div className="bg-white rounded-[40px] p-6 h-[400px] flex items-center justify-center border border-gray-100 shadow-sm">
                <div className="text-slate-400">Loading topic data...</div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-[40px] p-6 h-[400px] flex items-center justify-center border border-gray-100 shadow-sm">
                <div className="text-center">
                    <p className="text-slate-500 mb-2 font-medium">No topic data available yet</p>
                    <p className="text-sm text-slate-400">
                        Start solving problems to see your topic-wise progress
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm h-[500px] flex flex-col">
            <h3 className="text-xl font-bold mb-2 text-slate-900">Topic-Wise Progress</h3>
            <p className="text-sm text-slate-500 mb-4">
                Your top {data.length} topics by problems solved
            </p>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis
                            dataKey="topic"
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                        />
                        <PolarRadiusAxis
                            angle={90}
                            domain={[0, 'auto']}
                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                            axisLine={false}
                        />
                        <Radar
                            name="Problems Solved"
                            dataKey="count"
                            stroke="#0ea5e9"
                            fill="#0ea5e9"
                            fillOpacity={0.5}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                color: '#1e293b',
                                padding: '12px'
                            }}
                            formatter={(value: any, name: any, props: any) => {
                                const item = props.payload;
                                return [
                                    <div key="tooltip" className="p-1">
                                        <p className="font-bold mb-2 text-slate-800 border-b border-slate-100 pb-1">{item.topic}</p>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-600">Total: {item.count}</p>
                                            <div className="flex gap-3 text-xs">
                                                <span className="text-green-600 font-medium">E: {item.easy}</span>
                                                <span className="text-yellow-600 font-medium">M: {item.medium}</span>
                                                <span className="text-red-600 font-medium">H: {item.hard}</span>
                                            </div>
                                        </div>
                                    </div>,
                                    '',
                                ];
                            }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-4 flex gap-6 justify-center text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-slate-600 font-medium">Easy</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-slate-600 font-medium">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-slate-600 font-medium">Hard</span>
                </div>
            </div>
        </div>
    );
}
