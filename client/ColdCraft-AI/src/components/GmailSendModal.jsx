import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { sendEmailViaGmail } from '../utils/gmailApi';
import { XMarkIcon, PaperClipIcon, PaperAirplaneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const GmailSendModal = ({ isOpen, onClose, initialTo, initialSubject, initialBody, senderEmail }) => {
    const [to, setTo] = useState('');
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [replyTo, setReplyTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [showCcBcc, setShowCcBcc] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTo(initialTo || '');
            setSubject(initialSubject || '');
            setBody(initialBody || '');
            setCc('');
            setBcc('');
            setReplyTo('');
            setAttachments([]);
            setShowCcBcc(false);
        }
    }, [isOpen, initialTo, initialSubject, initialBody]);

    if (!isOpen) return null;

    const handleFileAdd = (e) => {
        const selected = Array.from(e.target.files);
        if (selected.length > 0) {
            setAttachments(prev => [...prev, ...selected]);
        }
    };

    const handleFileRemove = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!to || !to.trim()) {
            toast.error('Recipient email (To) is required.');
            return;
        }

        if (!subject || !subject.trim()) {
            toast.error('Email subject line is required.');
            return;
        }

        setSending(true);
        try {
            const formData = new FormData();
            formData.append('to', to.trim());
            formData.append('cc', cc.trim());
            formData.append('bcc', bcc.trim());
            formData.append('replyTo', replyTo.trim());
            formData.append('subject', subject.trim());
            formData.append('emailBody', body);

            if (attachments.length > 0) {
                attachments.forEach(file => {
                    formData.append('attachments', file);
                });
            }

            await sendEmailViaGmail(formData);
            toast.success('Email sent successfully via Gmail API!');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to send email via Gmail.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                            <PaperAirplaneIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Send Email via Connected Gmail</h3>
                            {senderEmail && (
                                <p className="text-[11px] text-slate-500">From: <span className="font-semibold text-blue-600">{senderEmail}</span></p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
                    {/* To Input & CC/BCC Toggle */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">To (Recipient)</label>
                            <button
                                type="button"
                                onClick={() => setShowCcBcc(!showCcBcc)}
                                className="text-[11px] text-blue-600 font-semibold hover:underline"
                            >
                                {showCcBcc ? '- Hide CC/BCC' : '+ Add CC/BCC / Reply-To'}
                            </button>
                        </div>
                        <input
                            type="email"
                            required
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            placeholder="prospect@company.com"
                            className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                        />
                    </div>

                    {/* Optional CC, BCC, Reply-To */}
                    {showCcBcc && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">CC</label>
                                <input
                                    type="email"
                                    value={cc}
                                    onChange={(e) => setCc(e.target.value)}
                                    placeholder="cc@company.com"
                                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">BCC</label>
                                <input
                                    type="email"
                                    value={bcc}
                                    onChange={(e) => setBcc(e.target.value)}
                                    placeholder="bcc@company.com"
                                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Reply-To</label>
                                <input
                                    type="email"
                                    value={replyTo}
                                    onChange={(e) => setReplyTo(e.target.value)}
                                    placeholder="replies@company.com"
                                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 bg-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* Subject Line */}
                    <div>
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 block">Subject Line</label>
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Email Subject..."
                            className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900"
                        />
                    </div>

                    {/* Email Body */}
                    <div>
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 block">Email Message Body</label>
                        <textarea
                            rows={8}
                            required
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg p-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 resize-none font-sans leading-relaxed"
                        />
                    </div>

                    {/* Attachments Section */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                                <PaperClipIcon className="w-3.5 h-3.5 text-slate-500" />
                                Attachments ({attachments.length})
                            </label>
                            <label className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer">
                                + Add File
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileAdd}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {attachments.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs text-slate-700 font-medium">
                                        <span className="truncate max-w-[160px]">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleFileRemove(idx)}
                                            className="text-slate-400 hover:text-red-500"
                                        >
                                            <XMarkIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={sending}
                            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                            <PaperAirplaneIcon className="w-4 h-4" />
                            <span>{sending ? 'Sending via Gmail...' : 'Send via Gmail API'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GmailSendModal;
