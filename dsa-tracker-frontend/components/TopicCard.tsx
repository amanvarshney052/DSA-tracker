import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';

interface TopicCardProps {
    id: string;
    title: string;
    description: string;
    totalProblems: number;
    solvedProblems?: number;
    difficulty?: string;
    index: number;
    isAdmin?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    theme?: 'light' | 'dark';
}

export default function TopicCard({
    id,
    title,
    description,
    totalProblems,
    solvedProblems = 0,
    difficulty,
    index,
    isAdmin = false,
    onEdit,
    onDelete,
    theme = 'light',
}: TopicCardProps) {
    const progress = totalProblems > 0 ? (solvedProblems / totalProblems) * 100 : 0;
    const formattedIndex = String(index + 1).padStart(2, '0');

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between overflow-hidden"
        >
            <Link href={`/sheets/${id}`} className="block h-full">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-primary-200/80 font-mono tracking-tighter">
                            {formattedIndex}.
                        </span>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-primary-600 transition-colors">
                            {title}
                        </h3>
                    </div>
                    <div className="text-slate-300 group-hover:text-primary-500 transition-colors transform -rotate-45 group-hover:rotate-0 duration-300">
                        <FaArrowRight size={18} />
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-sm font-bold text-slate-700">
                            {solvedProblems}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                            / {totalProblems} solved
                        </span>
                    </div>

                    <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </Link>

            {isAdmin && (
                <div className="absolute top-4 right-12 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onEdit?.();
                        }}
                        className="p-1.5 bg-slate-50 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors text-xs font-medium"
                    >
                        Edit
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onDelete?.();
                        }}
                        className="p-1.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors text-xs font-medium"
                    >
                        Delete
                    </button>
                </div>
            )}
        </motion.div>
    );
}

