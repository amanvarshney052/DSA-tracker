'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheck, FaClock, FaCalendarAlt } from 'react-icons/fa';

interface MarkSolvedModalProps {
    problem: any;
    onClose: () => void;
    onSubmit: (data: {
        problemId: string;
        timeTaken: number;
        markedForRevision: boolean;
        revisionDays: number[];
    }) => void;
}

export default function MarkSolvedModal({ problem, onClose, onSubmit }: MarkSolvedModalProps) {
    const [formData, setFormData] = useState({
        timeTaken: 30,
        markedForRevision: true,
    });
    const [revisionSchedules, setRevisionSchedules] = useState<{ label: string; days: number; selected: boolean }[]>([
        { label: '1 Week', days: 7, selected: true },
        { label: '2 Weeks', days: 14, selected: false },
        { label: '3 Weeks', days: 21, selected: false },
        { label: '4 Weeks', days: 28, selected: false },
    ]);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const selectedRevisionDays = revisionSchedules
                .filter(s => s.selected)
                .map(s => s.days);

            await onSubmit({
                problemId: problem._id,
                ...formData,
                markedForRevision: selectedRevisionDays.length > 0,
                revisionDays: selectedRevisionDays,
            });
            onClose();
        } catch (err) {
            console.error('Failed to mark as solved:', err);
            setSubmitting(false);
        }
    };

    const toggleSchedule = (index: number) => {
        const newSchedules = [...revisionSchedules];
        newSchedules[index].selected = !newSchedules[index].selected;
        setRevisionSchedules(newSchedules);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-start justify-between shrink-0">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 bg-green-100 text-green-600 rounded-xl">
                                    <FaCheck size={20} />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Mark as Solved</h2>
                            </div>
                            <p className="text-slate-500 font-medium ml-12">{problem.title}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    <div className="p-8 overflow-y-auto custom-scrollbar">
                        <form id="solve-form" onSubmit={handleSubmit} className="space-y-8">
                            {/* Time Taken */}
                            <div className="glass-panel p-6 rounded-xl border border-slate-100 bg-slate-50/50">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                                    <FaClock className="text-primary-500" />
                                    Time Taken (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={formData.timeTaken}
                                    onChange={(e) =>
                                        setFormData({ ...formData, timeTaken: parseInt(e.target.value) || 0 })
                                    }
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-slate-800"
                                    min="1"
                                    required
                                />
                            </div>

                            {/* Revision Schedule */}
                            <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-6 border border-primary-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                                        <FaCalendarAlt />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">Schedule Revisions</h3>
                                        <p className="text-sm text-slate-500">When would you like to review this problem?</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {revisionSchedules.map((schedule, index) => (
                                        <label
                                            key={index}
                                            className={`
                                                relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all
                                                ${schedule.selected
                                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                    : 'border-slate-200 bg-white text-slate-500 hover:border-primary-200 hover:bg-primary-50/50'
                                                }
                                            `}
                                        >
                                            <input
                                                type="checkbox"
                                                className="absolute opacity-0 w-full h-full cursor-pointer"
                                                checked={schedule.selected}
                                                onChange={() => toggleSchedule(index)}
                                            />
                                            <span className="text-2xl font-bold mb-1">{schedule.days / 7}</span>
                                            <span className="text-xs font-bold uppercase tracking-wider">Week{schedule.days > 7 ? 's' : ''}</span>
                                            {schedule.selected && (
                                                <div className="absolute top-2 right-2 text-primary-500">
                                                    <FaCheck size={12} />
                                                </div>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 border-t border-slate-100 p-6 flex gap-4 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl py-4 font-bold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="solve-form"
                            disabled={submitting}
                            className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-4 font-bold transition-all shadow-lg shadow-primary-500/20 disabled:opacity-70 flex items-center justify-center gap-3"
                        >
                            {submitting ? 'Saving...' : (
                                <>
                                    <FaCheck />
                                    Mark as Solved
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

