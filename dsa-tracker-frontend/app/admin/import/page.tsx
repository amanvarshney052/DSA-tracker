'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaArrowLeft, FaUpload, FaFileCsv, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Papa from 'papaparse';
import { sheetsAPI, problemsAPI } from '@/lib/services';

export default function ImportPage() {
    const router = useRouter();
    const [sheets, setSheets] = useState<any[]>([]);
    const [selectedSheet, setSelectedSheet] = useState('');
    const [parsedData, setParsedData] = useState<any[]>([]);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    useEffect(() => {
        sheetsAPI.getAll()
            .then(res => setSheets(res.data))
            .catch(err => console.error('Failed to load sheets', err));
    }, []);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rawData = results.data;
                // Normalize keys to lowercase and handle aliases
                const normalizedData = rawData.map((row: any) => {
                    const newRow: any = {};
                    Object.keys(row).forEach(key => {
                        // Aggressive cleaning: remove non-alphanumeric (keep only a-z, 0-9)
                        // This handles formatting issues, BOMs, extra spaces, etc.
                        const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

                        // Handle aliases
                        if (cleanKey === 'topic' || cleanKey === 'topics') {
                            newRow['topics'] = row[key];
                        } else if (cleanKey === 'link') {
                            newRow['url'] = row[key];
                        } else {
                            newRow[cleanKey] = row[key];
                        }
                    });
                    return newRow;
                });

                validateData(normalizedData);
                setParsedData(normalizedData);
            },
            error: (error) => {
                console.error('CSV Error:', error);
                setValidationErrors(['Failed to parse CSV file']);
            }
        });
    };

    const validateData = (data: any[]) => {
        const errors: string[] = [];
        if (data.length === 0) {
            errors.push('CSV file is empty');
        }

        // Basic check on first row keys
        if (data.length > 0) {
            const keys = Object.keys(data[0]);
            if (!keys.includes('title') || !keys.includes('url')) {
                errors.push(`CSV must have "Title" and "URL" columns. Found: ${keys.join(', ')}`);
            }
        }
        setValidationErrors(errors);
    };

    const handleImport = async () => {
        if (!selectedSheet) {
            alert('Please select a target sheet');
            return;
        }
        if (parsedData.length === 0 || validationErrors.length > 0) return;

        setIsUploading(true);
        try {
            await problemsAPI.bulkImport({
                sheetId: selectedSheet,
                problems: parsedData
            });
            setUploadSuccess(true);
            setTimeout(() => {
                router.push(`/sheets/${selectedSheet}`);
            }, 1500);
        } catch (error: any) {
            console.error('Import failed', error);
            alert(error.response?.data?.message || 'Import failed');
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f9f4] p-6">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-8">
                    <Link href="/admin" className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors font-medium w-fit mb-4">
                        <FaArrowLeft /> Back to Admin
                    </Link>
                    <h1 className="text-3xl font-heading font-bold text-slate-900">Bulk Import Problems</h1>
                    <p className="text-slate-500 mt-2">Upload a CSV file to add multiple problems at once.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel: Configuration */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-slate-800 mb-4">1. Select Target Sheet</h3>
                            <select
                                value={selectedSheet}
                                onChange={(e) => setSelectedSheet(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                            >
                                <option value="">-- Choose a Sheet --</option>
                                {sheets.map(sheet => (
                                    <option key={sheet._id} value={sheet._id}>{sheet.name}</option>
                                ))}
                            </select>
                            {sheets.length === 0 && <p className="text-xs text-red-500 mt-2">No sheets found. Create one first.</p>}
                        </div>

                        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-slate-800 mb-4">2. Upload CSV</h3>
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <FaFileCsv className="text-4xl text-slate-400 mx-auto mb-3" />
                                <p className="text-sm font-bold text-slate-600">Click to upload CSV</p>
                                <p className="text-xs text-slate-400 mt-1">Format: Title, Platform, URL, Difficulty, Topics</p>
                            </div>
                        </div>

                        {/* Format Guide */}
                        <div className="bg-blue-50 rounded-[32px] p-6 border border-blue-100">
                            <div className="flex items-start gap-3">
                                <FaExclamationTriangle className="text-blue-500 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-blue-700 text-sm mb-1">CSV Format Required</h4>
                                    <p className="text-xs text-blue-600 leading-relaxed">
                                        Ensure columns match exactly:<br />
                                        <strong>Title</strong>, <strong>Platform</strong>, <strong>URL</strong>, <strong>Difficulty</strong>, <strong>Topics</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Preview */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-800">3. Preview Data ({parsedData.length})</h3>
                                {parsedData.length > 0 && validationErrors.length === 0 && (
                                    <button
                                        onClick={handleImport}
                                        disabled={isUploading || !selectedSheet}
                                        className={`px-6 py-2 rounded-xl font-bold text-white transition-all flex items-center gap-2 ${isUploading || !selectedSheet
                                            ? 'bg-slate-300 cursor-not-allowed'
                                            : 'bg-primary-600 hover:bg-primary-700 active:scale-95 shadow-lg shadow-primary-500/30'
                                            }`}
                                    >
                                        {isUploading ? 'Importing...' : 'Import Problems'}
                                        {!isUploading && <FaUpload />}
                                    </button>
                                )}
                            </div>

                            {validationErrors.length > 0 && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm font-medium">
                                    {validationErrors.map((err, i) => <div key={i}>• {err}</div>)}
                                </div>
                            )}

                            {uploadSuccess ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 text-4xl shadow-green-200 shadow-xl">
                                        <FaCheckCircle />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Import Successful!</h2>
                                    <p className="text-slate-500">Redirecting to sheet...</p>
                                </div>
                            ) : parsedData.length > 0 ? (
                                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                            <tr>
                                                <th className="px-4 py-3">Title</th>
                                                <th className="px-4 py-3">Platform</th>
                                                <th className="px-4 py-3">Diff</th>
                                                <th className="px-4 py-3">Topics</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {parsedData.slice(0, 10).map((row, i) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-medium text-slate-700 truncate max-w-[200px]">{row.Title || row.title}</td>
                                                    <td className="px-4 py-3 text-slate-500 capitalize">{row.Platform || row.platform}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${(row.Difficulty || row.difficulty)?.toLowerCase() === 'hard' ? 'bg-rose-100 text-rose-600' :
                                                            (row.Difficulty || row.difficulty)?.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-600' :
                                                                'bg-emerald-100 text-emerald-600'
                                                            }`}>
                                                            {row.Difficulty || row.difficulty || 'Easy'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-[150px]">{row.Topics || row.topics}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        {parsedData.length > 10 && (
                                            <tfoot>
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-3 text-center text-slate-400 italic bg-slate-50">
                                                        ...and {parsedData.length - 10} more rows
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-100 rounded-3xl">
                                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                                        <FaFileCsv className="text-3xl text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No data to display</p>
                                    <p className="text-slate-400 text-sm mt-1">Upload a CSV file to see preview</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
