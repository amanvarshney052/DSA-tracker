'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBook, FaCheckCircle, FaLock } from 'react-icons/fa';
import { sheetsAPI, authAPI } from '@/lib/services';
import { useRouter } from 'next/navigation';

export default function SheetSelectionModal({ isOpen, onSelect }: { isOpen: boolean; onSelect: () => void }) {
    const [sheets, setSheets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            sheetsAPI.getAll()
                .then(res => {
                    setSheets(res.data);
                    setLoading(false);
                })
                .catch(err => console.error(err));
        }
    }, [isOpen]);

    const handleSelect = async (sheetId: string | null) => {
        setUpdating(sheetId || 'overall');
        try {
            // Update user profile with active sheet
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const res = await authAPI.updateProfile({ activeSheet: sheetId, hasOnboarded: true });

            // Update local storage
            localStorage.setItem('user', JSON.stringify({ ...user, activeSheet: sheetId }));

            // Callback to refresh dashboard
            onSelect();
        } catch (error) {
            console.error('Failed to set active sheet', error);
        } finally {
            setUpdating(null);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-[40px] w-full max-w-2xl p-8 shadow-2xl overflow-hidden relative"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                <FaBook />
                            </div>
                            <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">Pick Your Path</h2>
                            <p className="text-slate-500 text-lg">Select a DSA Sheet to start your journey. You can switch anytime.</p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2">
                                <button
                                    onClick={() => handleSelect(null)}
                                    disabled={!!updating}
                                    className="group relative flex flex-col items-start p-6 rounded-3xl border-2 border-slate-100 hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
                                >
                                    <div className="flex items-center justify-between w-full mb-2">
                                        <span className="px-3 py-1 bg-white rounded-lg text-xs font-bold text-slate-500 border border-slate-100 group-hover:border-primary-200">
                                            All Problems
                                        </span>
                                        {updating === 'overall' && (
                                            <div className="animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary-900 mb-1">
                                        Overall Progress
                                    </h3>
                                    <p className="text-sm text-slate-400 group-hover:text-primary-600 line-clamp-2">
                                        Track your combined stats across all sheets.
                                    </p>
                                </button>
                                {sheets.map((sheet) => (
                                    <button
                                        key={sheet._id}
                                        onClick={() => handleSelect(sheet._id)}
                                        disabled={!!updating}
                                        className="group relative flex flex-col items-start p-6 rounded-3xl border-2 border-slate-100 hover:border-primary-500 hover:bg-primary-50 transition-all text-left"
                                    >
                                        <div className="flex items-center justify-between w-full mb-2">
                                            <span className="px-3 py-1 bg-white rounded-lg text-xs font-bold text-slate-500 border border-slate-100 group-hover:border-primary-200">
                                                {sheet.problems?.length || 0} Problems
                                            </span>
                                            {updating === sheet._id && (
                                                <div className="animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary-900 mb-1">
                                            {sheet.name}
                                        </h3>
                                        <p className="text-sm text-slate-400 group-hover:text-primary-600 line-clamp-2">
                                            {sheet.description || 'Comprehensive DSA roadmap'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
