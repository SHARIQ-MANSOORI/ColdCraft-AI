import React from 'react';
import { ExclamationTriangleIcon, DocumentPlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const MissingAttachmentModal = ({ isOpen, onUploadClick, onContinueAnyway, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 text-center transform transition-all">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Missing Resume / Document?</h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    You mentioned attaching a resume or document in your prompt, but no file is currently uploaded. Would you like to upload your document now or generate without it?
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                        type="button"
                        onClick={onUploadClick}
                        className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
                    >
                        <DocumentPlusIcon className="w-4 h-4" />
                        Upload Document
                    </button>
                    <button
                        type="button"
                        onClick={onContinueAnyway}
                        className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                    >
                        Continue Without File
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MissingAttachmentModal;
