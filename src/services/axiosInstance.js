// /api/axiosInstance.js
import axios from 'axios';
import store from '../redux/store';
import { refreshToken, logout } from '../redux/slices/authSlice';

const axiosInstance = axios.create({
    baseURL: 'https://your-api.com',
});

// Request Interceptor to add token to headers
axiosInstance.interceptors.request.use(
    async (config) => {
        const state = store.getState();
        // const token = state.auth.token;
        // if (token) {
        //     config.headers['Authorization'] = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor to handle token expiration
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await store.dispatch(refreshToken()).unwrap();
                const state = store.getState();
                const newToken = state.auth.token;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } catch (err) {
                store.dispatch(logout());
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
