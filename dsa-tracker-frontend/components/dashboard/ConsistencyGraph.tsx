'use client';

import { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { analyticsAPI } from '@/lib/services';

interface ConsistencyData {
    date: string;
    count: number;
}

interface ConsistencyGraphProps {
    sheetId?: string;
}

export default function ConsistencyGraph({ sheetId }: ConsistencyGraphProps) {
    const [data, setData] = useState<ConsistencyData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        analyticsAPI
            .getConsistency(sheetId ? { sheetId } : {})
            .then((res) => {
                // Get last 7 days only for weekly view
                const last7Days = res.data.slice(-7).map((item: any) => ({
                    date: new Date(item.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                    }),
                    count: item.count,
                }));

                setData(last7Days);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch consistency data:', err);
                setLoading(false);
            });
    }, [sheetId]);

    if (loading) {
        return (
            <div className="bg-white rounded-[40px] p-6 h-[300px] flex items-center justify-center border border-gray-100 shadow-sm">
                <div className="text-slate-400">Loading consistency data...</div>
            </div>
        );
    }

    const maxCount = Math.max(...data.map((d) => d.count), 5);

    return (
        <div className="bg-white rounded-[40px] p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold mb-2 text-slate-900">Weekly Consistency</h3>
            <p className="text-sm text-slate-500 mb-6">
                Problems solved in the last 7 days
            </p>

            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                        stroke="#cbd5e1"
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                    />
                    <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        stroke="#cbd5e1"
                        domain={[0, maxCount]}
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
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
                        cursor={{ fill: '#f1f5f9' }}
                        formatter={(value: any) => [`${value} problems`, 'Solved']}
                    />
                    <Bar
                        dataKey="count"
                        fill="url(#colorGradient)"
                        radius={[8, 8, 8, 8]}
                        barSize={40}
                    />
                    <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1} />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity={1} />
                        </linearGradient>
                    </defs>
                </BarChart>
            </ResponsiveContainer>

            {/* Summary */}
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="text-sm">
                    <span className="text-slate-500">Total this week: </span>
                    <span className="font-bold text-primary-600">
                        {data.reduce((sum, item) => sum + item.count, 0)} problems
                    </span>
                </div>
                <div className="text-sm text-slate-400 font-medium">
                    Keep your streak alive! 🔥
                </div>
            </div>
        </div>
    );
}
