import axios from 'axios';
// this file is used to create an instance of axios with a base URL and an interceptor to add the authorization
// token to the headers of each request. 
// The base URL is taken from the environment variable VITE_API_URL, or defaults to 'http://localhost:5000' if not set.
// The interceptor checks for a token in localStorage and adds it to the request headers if it exists. Finally, 
// the configured axios instance is exported for use in other parts of the application.

const api = axios.create({
    baseURL:import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

module.exports = api;