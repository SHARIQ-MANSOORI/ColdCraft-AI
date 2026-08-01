import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { CampaignProvider } from '../context/CampaignContext';

const Layout = () => {
    return (
        <CampaignProvider>
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </CampaignProvider>
    );
};

export default Layout;