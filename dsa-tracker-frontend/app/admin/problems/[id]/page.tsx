'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import AdminGuard from '@/components/auth/AdminGuard';
import ProblemForm from '@/components/admin/ProblemForm';
import { problemsAPI } from '@/lib/services';

export default function EditProblemPage() {
    const params = useParams();
    const [problem, setProblem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblem = async () => {
            if (!params.id) return;
            try {
                const res = await problemsAPI.getById(params.id as string);
                setProblem(res.data);
            } catch (error) {
                console.error('Failed to fetch problem:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [params.id]);

    if (loading) {
        return (
            <AdminGuard>
                <div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center">
                    <div className="text-xl text-slate-500 font-medium">Loading problem...</div>
                </div>
            </AdminGuard>
        );
    }

    if (!problem) {
        return (
            <AdminGuard>
                <div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center">
                    <div className="text-xl text-red-500 font-medium">Problem not found</div>
                </div>
            </AdminGuard>
        );
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-[#f4f9f4]">
                <div className="container mx-auto px-6 py-8">
                    <div className="mb-8">
                        <Link href="/admin/problems" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-4 transition-colors">
                            <FaArrowLeft /> Back to Problems
                        </Link>
                        <h1 className="text-3xl font-heading font-bold text-slate-900">Edit Problem</h1>
                        <p className="text-slate-500">Update problem details</p>
                    </div>

                    <ProblemForm initialData={problem} isEditing={true} />
                </div>
            </div>
        </AdminGuard>
    );
}
