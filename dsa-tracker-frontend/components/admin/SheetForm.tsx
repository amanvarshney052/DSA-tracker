'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sheetsAPI } from '@/lib/services';
import { FaSave, FaTimes } from 'react-icons/fa';

interface SheetFormProps {
    initialData?: {
        _id?: string;
        name: string;
        description: string;
    };
    isEditing?: boolean;
}

export default function SheetForm({ initialData, isEditing = false }: SheetFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEditing && initialData?._id) {
                await sheetsAPI.update(initialData._id, formData);
            } else {
                await sheetsAPI.create(formData);
            }
            router.push('/admin/sheets');
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save sheet');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 max-w-2xl">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sheet Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                        placeholder="e.g., Love Babbar 450"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all h-32 resize-none"
                        placeholder="Brief description of this sheet..."
                        required
                    />
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors flex items-center gap-2"
                    >
                        <FaTimes /> Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none ml-auto"
                    >
                        <FaSave /> {loading ? 'Saving...' : 'Save Sheet'}
                    </button>
                </div>
            </div>
        </form>
    );
}
