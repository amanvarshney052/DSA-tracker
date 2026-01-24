'use client';

import { useState } from 'react';
import { FaExchangeAlt, FaCheck, FaBookOpen } from 'react-icons/fa';
import { authAPI } from '@/lib/services';
import { motion, AnimatePresence } from 'framer-motion';

interface SheetSwitcherProps {
    sheets: any[];
    currentSheetId?: string;
    onSwitch: () => void;
    stats?: { totalSolved: number; totalProblems: number };
}

export default function SheetSwitcher({ sheets, currentSheetId, onSwitch, stats }: SheetSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [switching, setSwitching] = useState(false);

    const currentSheet = sheets.find(s => s._id === currentSheetId);
    const progress = stats?.totalProblems ? Math.round((stats.totalSolved / stats.totalProblems) * 100) : 0;

    const handleSwitch = async (sheetId: string | null) => {
        if (sheetId === currentSheetId) {
            setIsOpen(false);
            return;
        }

        setSwitching(true);
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await authAPI.updateProfile({ activeSheet: sheetId });
            localStorage.setItem('user', JSON.stringify({ ...user, activeSheet: sheetId }));

            onSwitch(); // Trigger refresh
        } catch (error) {
            console.error('Switch failed', error);
        } finally {
            setSwitching(false);
            setIsOpen(false);
        }
    };

    // Removed early return to allow rendering "Overall" state

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 bg-white border border-slate-200 hover:border-primary-500 hover:bg-primary-50 text-slate-700 px-4 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
            >
                <div className="bg-primary-50 p-1.5 rounded-lg text-primary-500">
                    <FaBookOpen className="text-sm" />
                </div>

                <div className="flex flex-col items-start text-left w-[140px]">
                    <span className="font-bold text-xs text-slate-900 truncate w-full mb-0.5">
                        {currentSheet?.name || 'Overall Progress'}
                    </span>
                    <div className="flex items-center gap-2 w-full">
                        <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 leading-none">{progress}%</span>
                    </div>
                </div>

                <FaExchangeAlt className="text-slate-400 text-xs" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 overflow-hidden py-2"
                        >
                            <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Switch Sheet
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                <button
                                    onClick={() => handleSwitch(null)}
                                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left ${!currentSheetId ? 'bg-primary-50 text-primary-700' : 'text-slate-600'
                                        }`}
                                >
                                    <span className="font-medium text-sm truncate">Overall Progress</span>
                                    {!currentSheetId && <FaCheck className="text-primary-500 text-xs" />}
                                </button>
                                {sheets.map(sheet => (
                                    <button
                                        key={sheet._id}
                                        onClick={() => handleSwitch(sheet._id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left ${sheet._id === currentSheetId ? 'bg-primary-50 text-primary-700' : 'text-slate-600'
                                            }`}
                                    >
                                        <span className="font-medium text-sm truncate">{sheet.name}</span>
                                        {sheet._id === currentSheetId && <FaCheck className="text-primary-500 text-xs" />}
                                    </button>
                                ))}
                            </div>
                            <div className="px-4 py-2 border-t border-slate-100 mt-1">
                                <a href="/sheets" className="text-xs text-primary-600 font-bold hover:underline">
                                    + Browse More Sheets
                                </a>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper var for loading check (not defined above but inferred)
const loading = false;
