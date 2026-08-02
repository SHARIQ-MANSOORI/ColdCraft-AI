import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getGmailStatus, initiateGmailConnect, disconnectGmail } from '../utils/gmailApi';
import { CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const GmailStatusBanner = ({ onStatusChange }) => {
    const [gmailState, setGmailState] = useState({ connected: false, email: '' });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const loadStatus = async () => {
        try {
            const data = await getGmailStatus();
            setGmailState(data);
            if (onStatusChange) onStatusChange(data);
        } catch (err) {
            if (err.response?.status === 401) {
                console.warn('User session unauthenticated or expired (401).');
            } else {
                console.warn('Failed to fetch Gmail status:', err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStatus();

        // Check query params if redirected back from OAuth callback
        const params = new URLSearchParams(window.location.search);
        const gmailParam = params.get('gmail');
        if (gmailParam === 'connected') {
            toast.success('Gmail connected successfully!');
            // Clean URL query param
            window.history.replaceState({}, document.title, window.location.pathname);
            loadStatus();
        } else if (gmailParam === 'denied') {
            toast.error('Google OAuth authorization was canceled.');
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (gmailParam === 'error') {
            toast.error('Failed to connect Gmail. Please try again.');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleConnect = async () => {
        setActionLoading(true);
        try {
            await initiateGmailConnect();
        } catch (err) {
            if (err.response?.status === 401) {
                toast.error('Your session expired. Please log out and log in again.');
            } else {
                toast.error('Failed to initiate Google OAuth login.');
            }
            setActionLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!window.confirm('Are you sure you want to disconnect your Gmail account?')) return;
        setActionLoading(true);
        try {
            await disconnectGmail();
            toast.success('Gmail account disconnected.');
            await loadStatus();
        } catch (err) {
            toast.error('Failed to disconnect Gmail.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-xs text-slate-400">
                <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                <span>Checking Gmail status...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            {gmailState.connected ? (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-[200px]" title={gmailState.email}>
                        Gmail: {gmailState.email}
                    </span>
                    <button
                        onClick={handleDisconnect}
                        disabled={actionLoading}
                        className="ml-1 text-[11px] font-semibold text-emerald-700 hover:text-red-600 hover:underline transition-colors"
                    >
                        Disconnect
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleConnect}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:border-blue-400 text-slate-700 hover:text-blue-600 shadow-2xs transition-all disabled:opacity-50"
                >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>{actionLoading ? 'Connecting...' : 'Connect Gmail'}</span>
                </button>
            )}
        </div>
    );
};

export default GmailStatusBanner;
