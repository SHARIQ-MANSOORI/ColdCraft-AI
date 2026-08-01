import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { ClipboardDocumentIcon, CheckIcon, AdjustmentsHorizontalIcon, PlusIcon, PaperAirplaneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useCampaign } from '../context/CampaignContext';
import DocumentUploader from '../components/DocumentUploader';
import MissingAttachmentModal from '../components/MissingAttachmentModal';
import { detectMissingAttachment } from '../utils/attachmentDetector';

const Dashboard = () => {
    const { selectedCampaign, startNewCampaign, addGeneratedCampaign } = useCampaign();

    const [prompt, setPrompt] = useState('');
    const [tone, setTone] = useState('Professional');
    const [length, setLength] = useState('Medium');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState('');

    const tones = [
        { id: 'Professional', label: 'Professional', desc: 'Polished & Standard' },
        { id: 'Light', label: 'Light & Casual', desc: 'Friendly & Conversational' },
        { id: 'Hard', label: 'Hard Sell', desc: 'High Intensity & Bold' },
        { id: 'Executive', label: 'Executive', desc: 'Direct & Metrics-Focused' },
        { id: 'Urgent', label: 'Urgent', desc: 'Time-Sensitive' },
    ];

    const lengths = [
        { id: 'Short', label: 'Short', desc: '~60 words' },
        { id: 'Medium', label: 'Medium', desc: '~150 words' },
        { id: 'Long', label: 'Long', desc: '~250 words' },
    ];

    // Sync state when a campaign is selected from Sidebar
    useEffect(() => {
        if (selectedCampaign) {
            setResult(selectedCampaign);
            setPrompt(selectedCampaign.prompt || '');
            setTone(selectedCampaign.tone || 'Professional');
            setLength(selectedCampaign.length || 'Medium');
            setUploadedFile(null);
        } else {
            setResult(null);
            setPrompt('');
            setUploadedFile(null);
        }
    }, [selectedCampaign]);

    const executeGeneration = async (overrideSkipAttachmentCheck = false) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('prompt', prompt.trim());
            formData.append('tone', tone);
            formData.append('length', length);
            if (uploadedFile) {
                formData.append('document', uploadedFile);
            }

            const { data } = await api.post('/ai/generate-email', formData);

            const generatedItem = data.data || data;
            setResult(generatedItem);
            addGeneratedCampaign(generatedItem);
            toast.success('Successfully generated!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate. Please try again.');
        } finally {
            setLoading(false);
            setShowAttachmentModal(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Validation: must have either a prompt OR an uploaded file
        if (!prompt.trim() && !uploadedFile) {
            toast.error('Please provide a text prompt or attach a resume/document.');
            return;
        }

        // Detect missing attachment phrases if user mentioned attachment but no file is present
        if (!uploadedFile && detectMissingAttachment(prompt)) {
            setShowAttachmentModal(true);
            return;
        }

        executeGeneration();
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(''), 2000);
    };

    const handleSendWithGmail = (subjectText, bodyText) => {
        if (!recipientEmail || !recipientEmail.trim()) {
            toast.error('Please enter a recipient email address');
            return;
        }
        const toParam = encodeURIComponent(recipientEmail.trim());
        const subjectParam = encodeURIComponent(subjectText || '');
        const bodyParam = encodeURIComponent(bodyText || '');
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${toParam}&su=${subjectParam}&body=${bodyParam}`;
        window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    };

    const ResultCard = ({ title, content, type, subjectText, bodyText, isEmailType = false }) => (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <h3 className="font-bold text-slate-800 text-sm tracking-wide flex items-center gap-2">
                    {title}
                </h3>
                <div className="flex items-center gap-2">
                    {isEmailType && (
                        <button
                            onClick={() => handleSendWithGmail(subjectText, bodyText)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
                            title="Open in Gmail Compose"
                        >
                            <PaperAirplaneIcon className="w-3.5 h-3.5" />
                            Send with Gmail
                        </button>
                    )}
                    <button
                        onClick={() => copyToClipboard(content, type)}
                        className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-md hover:bg-slate-100 flex items-center gap-1 text-xs font-medium border border-slate-200"
                        title="Copy text"
                    >
                        {copied === type ? (
                            <CheckIcon className="w-4 h-4 text-mint-600" />
                        ) : (
                            <ClipboardDocumentIcon className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">{content}</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
            {/* Missing Attachment Warning Modal */}
            <MissingAttachmentModal
                isOpen={showAttachmentModal}
                onUploadClick={() => setShowAttachmentModal(false)}
                onContinueAnyway={() => executeGeneration(true)}
                onClose={() => setShowAttachmentModal(false)}
            />

            {/* Input Section */}
            <div className="w-full lg:w-1/3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <AdjustmentsHorizontalIcon className="w-5 h-5 text-blue-600" />
                        {selectedCampaign ? 'Edit / Re-generate' : 'New Campaign'}
                    </h2>
                    {selectedCampaign && (
                        <button
                            type="button"
                            onClick={() => {
                                startNewCampaign();
                                setUploadedFile(null);
                            }}
                            className="text-xs text-blue-600 hover:underline font-semibold"
                        >
                            + Clear & New
                        </button>
                    )}
                </div>
                
                <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col space-y-4">
                    {/* Document Upload Component */}
                    <DocumentUploader
                        file={uploadedFile}
                        onFileSelect={(file) => setUploadedFile(file)}
                        onFileRemove={() => setUploadedFile(null)}
                    />

                    {/* Recipient Email Input */}
                    <div>
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <EnvelopeIcon className="w-3.5 h-3.5 text-slate-500" />
                            Recipient Email (Optional)
                        </label>
                        <input
                            type="email"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-400"
                            placeholder="prospect@company.com"
                        />
                    </div>

                    {/* Prompt Textarea */}
                    <div>
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 block">
                            Context / Prompt {uploadedFile && <span className="text-[10px] text-slate-400 font-normal">(Optional when document uploaded)</span>}
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full h-28 border border-slate-300 rounded-lg p-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none text-slate-800 placeholder-slate-400"
                            placeholder="e.g. Target a VP of Sales offering AI analytics, or leave blank to generate solely from your uploaded document..."
                        />
                    </div>

                    {/* Writing Tone Selector */}
                    <div>
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 block">Writing Tone</label>
                        <div className="grid grid-cols-2 gap-2">
                            {tones.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTone(t.id)}
                                    className={`px-3 py-2 text-xs rounded-lg border text-left transition-all ${
                                        tone === t.id
                                            ? 'bg-blue-50 border-blue-400 text-blue-800 font-semibold shadow-sm'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="font-bold">{t.label}</div>
                                    <div className="text-[10px] text-slate-400 font-normal">{t.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Length Selector */}
                    <div>
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 block">Content Length</label>
                        <div className="grid grid-cols-3 gap-2">
                            {lengths.map((l) => (
                                <button
                                    key={l.id}
                                    type="button"
                                    onClick={() => setLength(l.id)}
                                    className={`px-2 py-2 text-xs rounded-lg border text-center transition-all ${
                                        length === l.id
                                            ? 'bg-mint-50 border-mint-400 text-mint-800 font-semibold shadow-sm'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="font-bold">{l.label}</div>
                                    <div className="text-[10px] text-slate-400 font-normal">{l.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || (!prompt.trim() && !uploadedFile)}
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Parsing & Generating ({tone} • {length})...
                            </span>
                        ) : `Generate (${tone} • ${length})`}
                    </button>
                </form>
            </div>

            {/* Output Section */}
            <div className="w-full lg:w-2/3 flex flex-col overflow-y-auto">
                {result ? (
                    <div>
                        {/* Results Header Bar with Recipient Quick Input */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900">AI Results</h2>
                                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                                    Tone: {result.tone || tone}
                                </span>
                                <span className="text-xs px-2.5 py-1 rounded-full bg-mint-50 text-mint-700 font-semibold border border-mint-200">
                                    Length: {result.length || length}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="email"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                    placeholder="Recipient email..."
                                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-44 sm:w-52"
                                />
                                <button
                                    onClick={() => {
                                        startNewCampaign();
                                        setUploadedFile(null);
                                    }}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors flex items-center gap-1 shadow-sm shrink-0"
                                >
                                    <PlusIcon className="w-3.5 h-3.5" />
                                    New
                                </button>
                            </div>
                        </div>

                        <ResultCard title="Subject Line" content={result.subject} type="subject" />
                        <ResultCard
                            title="Cold Email"
                            content={result.emailBody}
                            type="email"
                            subjectText={result.subject}
                            bodyText={result.emailBody}
                            isEmailType={true}
                        />
                        <ResultCard title="LinkedIn DM" content={result.linkedInDM} type="linkedin" />
                        <ResultCard
                            title="Follow-up Email"
                            content={result.followUpEmail}
                            type="followup"
                            subjectText={`Re: ${result.subject}`}
                            bodyText={result.followUpEmail}
                            isEmailType={true}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100">
                            <ClipboardDocumentIcon className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Upload a Document or enter a Prompt, select Tone & Length, and generate.</p>
                        <p className="text-xs text-slate-400 mt-1">Or pick a past campaign from the <b>Sidebar</b> on the left to view or edit.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;