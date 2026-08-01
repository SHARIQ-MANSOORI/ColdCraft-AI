import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const CampaignContext = createContext();

export const CampaignProvider = ({ children }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/ai/history');
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching campaign history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const selectCampaign = (campaign) => {
        setSelectedCampaign(campaign);
    };

    const startNewCampaign = () => {
        setSelectedCampaign(null);
    };

    const addGeneratedCampaign = (newCampaign) => {
        setHistory(prev => [newCampaign, ...prev]);
        setSelectedCampaign(newCampaign);
    };

    return (
        <CampaignContext.Provider
            value={{
                history,
                loading,
                selectedCampaign,
                fetchHistory,
                selectCampaign,
                startNewCampaign,
                addGeneratedCampaign
            }}
        >
            {children}
        </CampaignContext.Provider>
    );
};

export const useCampaign = () => {
    return useContext(CampaignContext);
};
