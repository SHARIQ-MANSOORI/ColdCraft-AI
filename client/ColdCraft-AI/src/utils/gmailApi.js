import api from './api';

export const getGmailStatus = async () => {
    const { data } = await api.get('/gmail/status');
    return data;
};

export const initiateGmailConnect = async () => {
    const { data } = await api.get('/gmail/connect');
    if (data.authUrl) {
        window.location.href = data.authUrl;
    }
};

export const disconnectGmail = async () => {
    const { data } = await api.post('/gmail/disconnect');
    return data;
};

export const sendEmailViaGmail = async (formData) => {
    const { data } = await api.post('/gmail/send', formData);
    return data;
};
