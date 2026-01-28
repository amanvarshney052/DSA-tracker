'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    FaBars,
    FaTimes,
    FaHome,
    FaBook,
    FaCalendar,
    FaChartLine,
    FaStickyNote,
    FaLock
} from 'react-icons/fa';

interface MobileNavProps {
    role?: string;
}

export default function MobileNav({ role }: MobileNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
        { href: '/sheets', label: 'Sheets', icon: <FaBook /> },
        { href: '/revision', label: 'Revision', icon: <FaCalendar /> },
        { href: '/analytics', label: 'Analytics', icon: <FaChartLine /> },
        { href: '/notes', label: 'Notes', icon: <FaStickyNote /> },
    ];

    if (role === 'admin') {
        navLinks.push({ href: '/admin', label: 'Admin Panel', icon: <FaLock /> });
    }

    return (
        <div className="md:hidden">
            <button
                onClick={toggleMenu}
                className="p-2 text-slate-600 hover:text-primary-600 focus:outline-none"
                aria-label="Toggle menu"
            >
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 z-50 rounded-b-3xl overflow-hidden"
                    >
                        <nav className="flex flex-col p-4">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-colors ${isActive
                                                ? 'bg-primary-50 text-primary-600 font-bold'
                                                : 'text-slate-500 hover:bg-gray-50 hover:text-primary-600 font-medium'
                                            }`}
                                    >
                                        <div className={`text-lg ${isActive ? 'text-primary-600' : 'text-slate-400'}`}>
                                            {link.icon}
                                        </div>
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Overlay backdrop to close when clicking outside (actually just fills usage for full screen if needed, but here sticking to dropdown) */}
                        <div className="h-2 bg-gradient-to-b from-gray-50 to-transparent"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop for the rest of the page when menu is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 top-[73px]"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
