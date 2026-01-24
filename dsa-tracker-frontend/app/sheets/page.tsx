'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { sheetsAPI } from '@/lib/services';
import TopicCard from '@/components/TopicCard';

export default function SheetsPage() {
    const router = useRouter();
    const [sheets, setSheets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        sheetsAPI
            .getAll()
            .then((res) => {
                setSheets(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch sheets:', err);
                setLoading(false);
            });
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center">
                <div className="text-2xl">Loading sheets...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f9f4] p-6">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors"
                    >
                        <FaArrowLeft />
                        Back to Dashboard
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-4">DSA Sheets</h1>
                    <p className="text-slate-500 max-w-2xl text-lg">
                        Curated lists of problems to help you master Data Structures and Algorithms.
                    </p>
                </motion.div>

                {sheets.length === 0 ? (
                    <div className="bg-white rounded-[40px] p-12 text-center border border-gray-100">
                        <p className="text-xl text-slate-500">
                            No sheets available yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sheets.map((sheet, index) => (
                            <TopicCard
                                key={sheet._id}
                                id={sheet._id}
                                title={sheet.name}
                                description={sheet.description || 'No description provided'}
                                totalProblems={sheet.totalProblems}
                                solvedProblems={sheet.solvedProblems || 0}
                                difficulty={sheet.difficulty}
                                index={index}
                                theme="light"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
