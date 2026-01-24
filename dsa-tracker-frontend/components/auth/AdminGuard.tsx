'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/login');
            return;
        }

        try {
            const user = JSON.parse(userStr);
            if (user.role !== 'admin') {
                router.push('/dashboard');
                return;
            }
            setAuthorized(true);
        } catch (error) {
            router.push('/login');
        }
    }, [router]);

    if (!authorized) {
        return null;
    }

    return <>{children}</>;
}
