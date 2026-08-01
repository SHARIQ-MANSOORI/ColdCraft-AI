import React, { useRef } from 'react';
import { DocumentIcon, XMarkIcon, ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const DocumentUploader = ({ file, onFileSelect, onFileRemove }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            onFileSelect(selected);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="w-full">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                    <DocumentIcon className="w-3.5 h-3.5 text-blue-600" />
                    Attach Resume / Document (Optional)
                </span>
                <span className="text-[10px] text-slate-400 font-normal lowercase">PDF, DOCX, TXT (Max 5MB)</span>
            </label>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
            />

            {!file ? (
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-xl p-4 text-center cursor-pointer transition-all duration-200 group"
                >
                    <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowUpTrayIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-700">
                                Click to upload <span className="font-normal text-slate-500">or drag & drop</span>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Resume, CV, cover letter or background doc</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <DocumentTextIcon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                            <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-500">{formatFileSize(file.size)}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onFileRemove}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-white transition-colors"
                        title="Remove file"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default DocumentUploader;
