'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaCode, FaLock } from 'react-icons/fa';
import { authAPI } from '@/lib/services';

export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useParams(); // Use useParams hook
    // It's safe to cast since we're in a dynamic route [token]
    // However, in compilation it might complain if not handled properly.
    // Let's assume params.token exists.
    const token = params?.token as string;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters');
            return;
        }

        setStatus('loading');

        try {
            await authAPI.resetPassword(password, token);
            setStatus('success');
            setMessage('Password reset successfully!');
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="bg-primary-50 p-2 rounded-xl">
                            <FaCode className="text-primary-600 text-2xl" />
                        </div>
                        <span className="text-2xl font-heading font-bold text-primary-900">
                            DSA Tracker
                        </span>
                    </Link>
                    <h1 className="text-3xl font-heading font-bold mb-2 text-slate-900">Reset Password</h1>
                    <p className="text-slate-500">Create a new strong password</p>
                </div>

                <div className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {(status === 'error' || status === 'success') && (
                            <div className={`rounded-xl p-3 text-sm border ${status === 'success'
                                    ? 'bg-green-50 text-green-600 border-green-100'
                                    : 'bg-red-50 text-red-600 border-red-100'
                                }`}>
                                {message}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700">New Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-700">Confirm Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3 font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
