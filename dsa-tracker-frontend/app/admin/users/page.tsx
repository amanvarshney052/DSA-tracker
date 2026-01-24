'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaTrash, FaBan, FaUserShield, FaCheck } from 'react-icons/fa';
import AdminGuard from '@/components/auth/AdminGuard';
import { adminAPI } from '@/lib/services';

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await adminAPI.getUsers();
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleUpdate = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`Change role to ${newRole}?`)) return;

        try {
            await adminAPI.updateRole(userId, newRole);
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            alert('Failed to update role');
        }
    };

    const handleBlockToggle = async (userId: string, isBlocked: boolean) => {
        const action = isBlocked ? 'Unblock' : 'Block';
        if (!confirm(`${action} this user?`)) return;

        try {
            await adminAPI.toggleBlock(userId);
            setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: !isBlocked } : u));
        } catch (error) {
            alert('Failed to toggle block status');
        }
    };

    const handleResetProgress = async (userId: string) => {
        if (!confirm('Are you sure? This will delete ALL progress for this user. This cannot be undone.')) return;

        try {
            await adminAPI.resetProgress(userId);
            alert('Progress reset successfully');
        } catch (error) {
            alert('Failed to reset progress');
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-[#f4f9f4] p-6">
                <div className="container mx-auto">
                    <div className="mb-8">
                        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 mb-4 transition-colors">
                            <FaArrowLeft /> Back to Admin
                        </Link>
                        <h1 className="text-3xl font-heading font-bold text-slate-900">User Management</h1>
                        <p className="text-slate-500">Manage registered users</p>
                    </div>

                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="p-6 font-bold text-slate-500 text-sm uppercase tracking-wide">User</th>
                                        <th className="p-6 font-bold text-slate-500 text-sm uppercase tracking-wide">Role</th>
                                        <th className="p-6 font-bold text-slate-500 text-sm uppercase tracking-wide">Joined</th>
                                        <th className="p-6 font-bold text-slate-500 text-sm uppercase tracking-wide">Status</th>
                                        <th className="p-6 font-bold text-slate-500 text-sm uppercase tracking-wide text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.map(user => (
                                        <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-6">
                                                <p className="font-bold text-slate-900">{user.name}</p>
                                                <p className="text-sm text-slate-500">{user.email}</p>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-6 text-slate-600 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-6">
                                                {user.isBlocked ? (
                                                    <span className="text-red-500 font-bold text-sm flex items-center gap-1">
                                                        <FaBan /> Blocked
                                                    </span>
                                                ) : (
                                                    <span className="text-emerald-500 font-bold text-sm flex items-center gap-1">
                                                        <FaCheck /> Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-6 flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleRoleUpdate(user._id, user.role)}
                                                    title={user.role === 'admin' ? "Revoke Admin" : "Make Admin"}
                                                    className={`p-2 rounded-lg transition-colors ${user.role === 'admin'
                                                            ? 'text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200'
                                                            : 'text-purple-500 hover:text-purple-700 bg-purple-50 hover:bg-purple-100'
                                                        }`}
                                                >
                                                    <FaUserShield />
                                                </button>

                                                <button
                                                    onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                                                    title={user.isBlocked ? "Unblock User" : "Block User"}
                                                    className={`p-2 rounded-lg transition-colors ${user.isBlocked
                                                            ? 'text-emerald-500 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                                            : 'text-orange-500 hover:text-orange-700 bg-orange-50 hover:bg-orange-100'
                                                        }`}
                                                >
                                                    <FaBan />
                                                </button>

                                                <button
                                                    onClick={() => handleResetProgress(user._id)}
                                                    title="Reset Progress"
                                                    className="p-2 rounded-lg text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && !loading && (
                                <div className="p-12 text-center text-slate-500">
                                    No users found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
}
