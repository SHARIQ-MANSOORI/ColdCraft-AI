import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import GmailStatusBanner from './GmailStatusBanner';

const Navbar = ({ onGmailStatusUpdate }) => {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 shrink-0">
            <div className="text-sm font-semibold text-slate-800 hidden md:block">
                Welcome back, <span className="text-blue-600 font-bold">{user?.username || user?.email || 'User'}</span>
            </div>
            {/* Mobile Title */}
            <div className="text-lg font-bold text-blue-600 md:hidden">
                ColdCraft<span className="text-mint-600">.ai</span>
            </div>

            <div className="flex items-center space-x-4">
                <GmailStatusBanner onStatusChange={onGmailStatusUpdate} />
                <button
                    onClick={logout}
                    className="flex items-center text-slate-500 hover:text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-all"
                >
                    <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-1.5" />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;