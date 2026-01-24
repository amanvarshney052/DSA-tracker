'use client';

import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import AdminGuard from '@/components/auth/AdminGuard';
import SheetForm from '@/components/admin/SheetForm';

export default function NewSheetPage() {
    return (
        <AdminGuard>
            <div className="min-h-screen bg-[#f4f9f4]">
                <div className="container mx-auto px-6 py-8">
                    <div className="mb-8">
                        <Link href="/admin/sheets" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-4 transition-colors">
                            <FaArrowLeft /> Back to Sheets
                        </Link>
                        <h1 className="text-3xl font-heading font-bold text-slate-900">Create New Sheet</h1>
                        <p className="text-slate-500">Add a new problem sheet to the platform</p>
                    </div>

                    <SheetForm />
                </div>
            </div>
        </AdminGuard>
    );
}
