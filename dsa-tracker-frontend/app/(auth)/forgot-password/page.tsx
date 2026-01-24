'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaCode, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { authAPI } from '@/lib/services';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            await authAPI.forgotPassword(email);
            setStatus('success');
            setMessage('Password reset link sent! Check your server console (local dev).');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Failed to send reset link');
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
                    <h1 className="text-3xl font-heading font-bold mb-2 text-slate-900">Forgot Password?</h1>
                    <p className="text-slate-500">Enter your email to receive a reset link</p>
                </div>

                <div className="bg-white rounded-[40px] p-8 shadow-xl border border-gray-100">
                    {status === 'success' ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                                ✓
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Link Sent!</h3>
                            <p className="text-slate-500">
                                {message}
                            </p>
                            <Link
                                href="/login"
                                className="block w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3 font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all mt-6"
                            >
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {status === 'error' && (
                                <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm border border-red-100">
                                    {message}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-700">Email Address</label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-slate-400"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3 font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                            >
                                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <div className="text-center">
                                <Link href="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 font-medium transition-colors">
                                    <FaArrowLeft className="text-sm" />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
