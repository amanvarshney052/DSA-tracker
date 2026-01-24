'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    FaArrowLeft,
    FaPlus,
    FaEdit,
    FaTrash,
    FaSave,
    FaTimes,
    FaBook,
    FaCode,
    FaTag,
} from 'react-icons/fa';
import { notesAPI } from '@/lib/services';
import { DSA_TOPICS } from '@/lib/constants';

export default function NotesPage() {
    const router = useRouter();
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingNote, setEditingNote] = useState<any>(null);
    const [selectedNote, setSelectedNote] = useState<any>(null);
    const [filterTopic, setFilterTopic] = useState<string>('all');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        loadNotes();
    }, [router]);

    const loadNotes = async (topic?: string) => {
        try {
            const res = await notesAPI.getAll(topic ? { topic } : {});
            setNotes(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch notes:', err);
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            await notesAPI.delete(id);
            loadNotes(filterTopic !== 'all' ? filterTopic : undefined);
        } catch (err) {
            console.error('Failed to delete note:', err);
            alert('Failed to delete note');
        }
    };

    const handleFilterChange = (topic: string) => {
        setFilterTopic(topic);
        loadNotes(topic !== 'all' ? topic : undefined);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center">
                <div className="text-xl text-slate-500 font-medium">Loading notes...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f4f9f4] p-6">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-medium"
                    >
                        <FaArrowLeft />
                        Back to Dashboard
                    </Link>
                </div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-primary-50 p-3 rounded-2xl">
                                <FaBook className="text-primary-600 text-2xl" />
                            </div>
                            <h1 className="text-4xl font-heading font-bold text-slate-900">Learning Notes</h1>
                        </div>
                        <p className="text-slate-500 text-lg">
                            Document your insights, patterns, and code templates
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingNote(null);
                            setShowEditor(true);
                        }}
                        className="bg-primary-600 text-white rounded-xl px-6 py-3 font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <FaPlus />
                        New Note
                    </button>
                </motion.div>

                {/* Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[32px] p-6 mb-8 border border-gray-100 shadow-sm md:inline-flex md:items-center gap-4"
                >
                    <div className="flex items-center gap-2 mb-2 md:mb-0">
                        <FaTag className="text-primary-500" />
                        <h3 className="font-bold text-slate-700">Filter by Topic</h3>
                    </div>
                    <select
                        value={filterTopic}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="w-full md:w-64 bg-slate-50 border-none text-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary-500 cursor-pointer font-medium"
                    >
                        <option value="all">All Topics</option>
                        {DSA_TOPICS.map((topic) => (
                            <option key={topic} value={topic}>
                                {topic}
                            </option>
                        ))}
                    </select>
                </motion.div>

                {/* Notes List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {notes.length === 0 ? (
                        <div className="bg-white rounded-[40px] p-12 text-center border border-gray-100 shadow-sm">
                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaBook className="text-4xl text-slate-300" />
                            </div>
                            <p className="text-2xl font-bold text-slate-800 mb-2 font-heading">No notes yet</p>
                            <p className="text-slate-500">
                                Create your first note to start documenting your learning
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {notes.map((note, index) => (
                                <NoteCard
                                    key={note._id}
                                    note={note}
                                    index={index}
                                    onEdit={() => {
                                        setEditingNote(note);
                                        setShowEditor(true);
                                    }}
                                    onDelete={() => handleDelete(note._id)}
                                    onView={() => setSelectedNote(note)}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* View Detail Modal */}
                {selectedNote && (
                    <NoteDetailModal
                        note={selectedNote}
                        onClose={() => setSelectedNote(null)}
                        onEdit={() => {
                            setSelectedNote(null);
                            setEditingNote(selectedNote);
                            setShowEditor(true);
                        }}
                    />
                )}

                {/* Editor Modal */}
                {showEditor && (
                    <NoteEditor
                        note={editingNote}
                        onClose={() => {
                            setShowEditor(false);
                            setEditingNote(null);
                        }}
                        onSave={() => {
                            setShowEditor(false);
                            setEditingNote(null);
                            loadNotes(filterTopic !== 'all' ? filterTopic : undefined);
                        }}
                    />
                )}
            </div>
        </div>
    );
}



function NoteDetailModal({
    note,
    onClose,
    onEdit,
}: {
    note: any;
    onClose: () => void;
    onEdit: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full max-w-3xl rounded-[32px] bg-white p-8 shadow-2xl"
                >
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-bold uppercase tracking-wide">
                                    {note.topic}
                                </span>
                                {note.tags?.map((tag: string) => (
                                    <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h2 className="text-3xl font-bold font-heading text-slate-900 mb-2">
                                {note.title}
                            </h2>
                            <p className="text-slate-400 text-sm">
                                Last updated {new Date(note.updatedAt || note.createdAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={onEdit}
                                className="p-3 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-primary-600"
                                title="Edit Note"
                            >
                                <FaEdit size={20} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                                title="Close"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="prose prose-slate max-w-none">
                        <div className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap mb-8">
                            {note.content}
                        </div>

                        {note.codeTemplate && (
                            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-900/5">
                                <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-white/10">
                                    <FaCode className="text-primary-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Code Snippet</span>
                                </div>
                                <div className="p-4 overflow-x-auto">
                                    <pre className="font-mono text-sm text-slate-200">
                                        <code>{note.codeTemplate}</code>
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function NoteCard({
    note,
    index,
    onEdit,
    onDelete,
    onView,
}: {
    note: any;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
    onView: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={onView}
            className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 group cursor-pointer h-full flex flex-col"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">{note.title}</h3>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-bold uppercase tracking-wide">
                            {note.topic}
                        </span>
                    </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-primary-600"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2 hover:bg-red-50 rounded-xl transition-colors text-slate-400 hover:text-red-500"
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>

            <p className="text-slate-600 text-sm line-clamp-4 mb-4 leading-relaxed flex-grow">{note.content}</p>

            <div className="pt-4 border-t border-gray-50 text-xs text-slate-400 font-medium flex items-center justify-between">
                <span>Updated {new Date(note.updatedAt || note.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                })}</span>
                {note.codeTemplate && <FaCode className="text-slate-300" />}
            </div>
        </motion.div>
    );
}

function NoteEditor({
    note,
    onClose,
    onSave,
}: {
    note: any;
    onClose: () => void;
    onSave: () => void;
}) {
    const [formData, setFormData] = useState({
        topic: note?.topic || 'Array',
        title: note?.title || '',
        content: note?.content || '',
        codeTemplate: note?.codeTemplate || '',
        tags: note?.tags?.join(', ') || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const noteData = {
                ...formData,
                tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
            };

            if (note) {
                await notesAPI.update(note._id, noteData);
            } else {
                await notesAPI.create(noteData);
            }

            onSave();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to save note');
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="flex min-h-full items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full max-w-3xl rounded-[32px] bg-white p-8 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold font-heading text-slate-900">
                            {note ? 'Edit Note' : 'Create New Note'}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Topic *</label>
                                <select
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                    required
                                >
                                    {DSA_TOPICS.map((topic) => (
                                        <option key={topic} value={topic}>
                                            {topic}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium placeholder:text-slate-400"
                                    placeholder="pattern, tip, interview"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold text-lg placeholder:text-slate-400"
                                placeholder="e.g., Sliding Window Pattern"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Content *</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[150px] leading-relaxed placeholder:text-slate-400"
                                placeholder="Write your notes, insights, or explanations..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Code Template (Optional)</label>
                            <textarea
                                value={formData.codeTemplate}
                                onChange={(e) => setFormData({ ...formData, codeTemplate: e.target.value })}
                                className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                                rows={6}
                                placeholder="// Add your code template here..."
                            />
                        </div>

                        <div className="flex gap-4 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl py-3 font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3 font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    'Saving...'
                                ) : (
                                    <>
                                        <FaSave />
                                        {note ? 'Update Note' : 'Create Note'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
