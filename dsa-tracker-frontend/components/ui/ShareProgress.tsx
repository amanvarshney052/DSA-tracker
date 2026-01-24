'use client';

import { useState, useRef } from 'react';
import { FaTwitter, FaLinkedin, FaLink, FaCheck, FaShare, FaDownload, FaImage } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import ProgressShareCard from './ProgressShareCard';

interface ShareProgressProps {
    stats: {
        totalSolved: number;
        streak: number;
        level: number;
        xpPoints: number;
    };
    userName: string;
}

export default function ShareProgress({ stats, userName }: ShareProgressProps) {
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Ref for the card we want to capture
    const cardRef = useRef<HTMLDivElement>(null);

    const shareText = `🚀 My DSA Progress on DSA Tracker:
✅ ${stats.totalSolved} problems solved
🔥 ${stats.streak} day streak
🏆 Level ${stats.level}
⭐ ${stats.xpPoints} XP

Keep grinding! 💪 #DSA #Coding #LeetCode`;

    const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

    const handleTwitterShare = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText
        )}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
        setShowShareMenu(false);
    };

    const handleLinkedInShare = () => {
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            shareUrl
        )}`;
        window.open(linkedInUrl, '_blank', 'width=550,height=420');
        setShowShareMenu(false);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setShowShareMenu(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDownloadImage = async () => {
        if (!cardRef.current) return;

        setGenerating(true);
        try {
            // Wait a bit for fonts to load if needed, or just capture
            const canvas = await html2canvas(cardRef.current, {
                scale: 2, // Better quality
                backgroundColor: '#f4f9f4', // Match card bg
                useCORS: true,
            });

            const image = canvas.toDataURL('image/png');

            // Trigger download
            const link = document.createElement('a');
            link.href = image;
            link.download = `dsa-progress-${stats.totalSolved}-solved.png`;
            link.click();

            setShowShareMenu(false);
        } catch (err) {
            console.error('Failed to generate image:', err);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all"
            >
                <FaShare />
                <span>Share Progress</span>
            </button>

            {/* Hidden Card for Capture */}
            <div className="fixed left-[-9999px] top-[-9999px]">
                <ProgressShareCard ref={cardRef} stats={stats} userName={userName} />
            </div>

            <AnimatePresence>
                {showShareMenu && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowShareMenu(false)}
                        />

                        {/* Menu */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 mt-3 w-72 bg-white rounded-2xl p-2 shadow-2xl z-50 border border-gray-100 ring-1 ring-black/5"
                        >
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide px-4 py-3 border-b border-gray-50 mb-2">
                                Share stats
                            </p>
                            <div className="space-y-1">
                                <button
                                    onClick={handleDownloadImage}
                                    disabled={generating}
                                    className="w-full flex items-center gap-4 px-4 py-3 bg-white hover:bg-violet-50 rounded-xl transition-colors text-left group"
                                >
                                    <div className="p-2 bg-violet-100 text-violet-600 rounded-lg group-hover:scale-110 transition-transform">
                                        {generating ? <div className="animate-spin w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full" /> : <FaDownload size={18} />}
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-700 group-hover:text-slate-900 block">Download Image</span>
                                        <span className="text-xs text-slate-400 font-medium">Perfect for Instagram/LinkedIn</span>
                                    </div>
                                </button>

                                <div className="h-px bg-slate-100 my-1 mx-4"></div>

                                <button
                                    onClick={handleTwitterShare}
                                    className="w-full flex items-center gap-4 px-4 py-3 bg-white hover:bg-sky-50 rounded-xl transition-colors text-left group"
                                >
                                    <div className="p-2 bg-sky-100 text-[#1DA1F2] rounded-lg group-hover:scale-110 transition-transform">
                                        <FaTwitter size={18} />
                                    </div>
                                    <span className="font-bold text-slate-700 group-hover:text-slate-900">Twitter</span>
                                </button>

                                <button
                                    onClick={handleLinkedInShare}
                                    className="w-full flex items-center gap-4 px-4 py-3 bg-white hover:bg-blue-50 rounded-xl transition-colors text-left group"
                                >
                                    <div className="p-2 bg-blue-100 text-[#0A66C2] rounded-lg group-hover:scale-110 transition-transform">
                                        <FaLinkedin size={18} />
                                    </div>
                                    <span className="font-bold text-slate-700 group-hover:text-slate-900">LinkedIn</span>
                                </button>

                                <button
                                    onClick={handleCopyLink}
                                    className="w-full flex items-center gap-4 px-4 py-3 bg-white hover:bg-emerald-50 rounded-xl transition-colors text-left group"
                                >
                                    {copied ? (
                                        <>
                                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                                <FaCheck size={18} />
                                            </div>
                                            <span className="font-bold text-emerald-700">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg group-hover:scale-110 transition-transform">
                                                <FaLink size={18} />
                                            </div>
                                            <span className="font-bold text-slate-700 group-hover:text-slate-900">Copy Link</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
