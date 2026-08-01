import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HomeIcon, PlusIcon, ClockIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useCampaign } from '../context/CampaignContext';

const Sidebar = () => {
    const { history, loading, selectedCampaign, selectCampaign, startNewCampaign } = useCampaign();
    const navigate = useNavigate();

    const handleNewClick = () => {
        startNewCampaign();
        navigate('/dashboard');
    };

    const handleItemClick = (item) => {
        selectCampaign(item);
        navigate('/dashboard');
    };

    return (
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex h-full">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/80 shrink-0">
                <h1 className="text-xl font-extrabold text-blue-600 tracking-tight">
                    ColdCraft<span className="text-mint-600">.ai</span>
                </h1>
            </div>

            {/* Navigation & Action */}
            <div className="p-4 space-y-2 shrink-0">
                <button
                    onClick={handleNewClick}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm text-xs"
                >
                    <PlusIcon className="w-4 h-4" />
                    New Campaign
                </button>

                <NavLink
                    to="/dashboard"
                    onClick={startNewCampaign}
                    className={({ isActive }) =>
                        `flex items-center px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                            isActive && !selectedCampaign
                                ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`
                    }
                >
                    <HomeIcon className="w-4 h-4 mr-2.5 text-slate-400" />
                    Dashboard
                </NavLink>
            </div>

            {/* Chat History Section */}
            <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col min-h-0">
                <div className="flex items-center justify-between px-1 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                        <ClockIcon className="w-3.5 h-3.5" />
                        Chat History
                    </span>
                    <span className="bg-mint-50 text-mint-700 border border-mint-200 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                        {history.length}
                    </span>
                </div>

                {loading ? (
                    <p className="text-xs text-slate-400 px-2 py-3">Loading history...</p>
                ) : history.length === 0 ? (
                    <div className="text-center py-6 text-slate-400">
                        <ChatBubbleLeftRightIcon className="w-6 h-6 mx-auto mb-1 opacity-40" />
                        <p className="text-xs">No saved history yet</p>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        {history.map((item) => {
                            const isSelected = selectedCampaign?._id === item._id;
                            return (
                                <button
                                    key={item._id}
                                    onClick={() => handleItemClick(item)}
                                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-all border ${
                                        isSelected
                                            ? 'bg-blue-50/80 border-blue-300 text-blue-900 font-medium shadow-sm'
                                            : 'border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200/60'
                                    }`}
                                >
                                    <p className="truncate font-medium text-slate-800 mb-1">
                                        {item.prompt}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                                        <span className="px-1.5 py-0.5 rounded bg-mint-50 text-mint-700 font-medium border border-mint-200">
                                            {item.tone || 'Professional'}
                                        </span>
                                        <span>
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200/80 shrink-0">
                <div className="text-[11px] text-center text-slate-400 font-medium">
                    ColdCraft.ai
                </div>
            </div>
        </div>
    );
};

export default Sidebar;