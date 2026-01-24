'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

function OAuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            localStorage.setItem('token', token);
            // Decode token to get user data if needed, or fetch profile
            // For now, we'll just redirect to dashboard which might refetch user
            // We can also decode the token here if it contains user info, but usually it's better to fetch /me

            // Let's fetch the user profile to store in localStorage like login does
            fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    localStorage.setItem('user', JSON.stringify(data));
                    router.push('/dashboard');
                })
                .catch((err) => {
                    console.error('Failed to fetch user profile', err);
                    router.push('/login?error=auth_failed');
                });
        } else {
            router.push('/login?error=no_token');
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
            >
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-slate-700">Authenticating...</h2>
            </motion.div>
        </div>
    );
}

export default function OAuthCallback() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center">Loading...</div>}>
            <OAuthCallbackContent />
        </Suspense>
    );
}
