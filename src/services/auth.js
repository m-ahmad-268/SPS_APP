// /api/auth.js
import axiosInstance from './axiosInstance';
import getEnvVars from '../Config/env.js';
import { inspectApiCall } from '../Utils/inspector.js'; // Assuming you have an inspector utility

const { API_URL, imsModuleApiBaseUrl, hcmModuleApiBaseUrl, financialModuleApiBaseUrl, salesModuleApiBaseUrl, selfCareBAseAPIUrl, userModuleApiBaseUrl, financialModuleApiDirectBaseUrl } = getEnvVars();

// Merge headers utility
const mergeHeaders = (customHeaders) => {
    const defaultHeaders = {
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
    };
    return { ...defaultHeaders, ...customHeaders };
};

export const setScreenFieldsData = async (fieldsValue, moduleCode, screenCode, headers = {}) => {
    const url = `${userModuleApiBaseUrl}/screenGridDetail`;
    const data = { accessRoleId: 1, moduleCode, screenCode };
    try {
        const response = await apiRequest({
            url,
            method: 'POST',
            data,
            headers,
        });

        if (response?.result?.dtoScreenDetail?.fieldList) {
            return response.result.dtoScreenDetail.fieldList.reduce((acc, item) => {
                acc[item.fieldName] = {
                    fieldValue: item.fieldValue,
                };
                return acc;
            }, {});
        } else {
            return {};
        }
    } catch (error) {
        throw error;
    }
};


// Generic API request function
const apiRequest = async ({ url, method = 'GET', data = null, headers = {} }) => {
    try {
        const response = await axiosInstance({
            url,
            method,
            data,
            headers: mergeHeaders(headers),
        });
        inspectApiCall(url, method, data, mergeHeaders(headers), response); // Call inspector
        return response.data;
    } catch (error) {
        inspectApiCall(url, method, data, mergeHeaders(headers), error); // Call inspector on error
        throw error; // Re-throw the error for the calling function to handle
    }
};

export const loginUserForOtp = async (credentials) => {
    const url = `${userModuleApiBaseUrl}/login/loginUserForOtp`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: {},
    });
};

export const getCountryList = async (headers = {}) => {
    const url = `${userModuleApiBaseUrl}/getCountryList`;
    return apiRequest({
        url: url,
        method: "GET",
        headers: headers,
    });
};

export const getStateListByCountryId = async (body, headers = {}) => {
    const url = `${userModuleApiBaseUrl}/getStateListByCountryId`;
    return apiRequest({
        url: url,
        method: "POST",
        data: body,
        headers: headers,
    });
};

export const getCityListByStateId = async (body, headers = {}) => {
    const url = `${userModuleApiBaseUrl}/getCityListByStateId`;
    return apiRequest({
        url: url,
        method: "POST",
        data: body,
        headers: headers,
    });
};

export const verifyOtpAuthentication = async (credentials) => {
    const url = `${userModuleApiBaseUrl}/login/verifyOtpAuthentication`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: {},
    });
};

export const companyListByUserId = async (credentials) => {
    const url = `${userModuleApiBaseUrl}/companyListByUserId`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: {},
    });
};

export const checkCompanyAccess = async (credentials) => {
    const url = `${userModuleApiBaseUrl}/login/checkCompanyAccess`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: {},
    });
};

export const getRolesByEmail = async (credentials, headers = {}) => {
    const url = `${financialModuleApiBaseUrl}/customerMaintenance/customerUser/getRolesByEmail`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getCustomerByEmailApi = async (credentials, headers = {}) => {
    const url = `${financialModuleApiBaseUrl}/customerMaintenance/getCustomerByEmail`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const logoutApi = async (credentials, headers = {}) => {
    const url = `${userModuleApiBaseUrl}/user/logout`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const logoutBeforeCompanySelectionApi = async (credentials, headers = {}) => {
    const url = `${userModuleApiBaseUrl}/user/logoutBeforeCompanySelection`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const acceptTermsAndConditionsApi = async (credentials, headers = {}) => {
    const url = `${userModuleApiBaseUrl}/user/acceptTermsAndConditions`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const setPasswordApi = async (credentials, headers = {}) => {
    const url = `${userModuleApiBaseUrl}/user/setPassword`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const updateActiveSession = async (credentials, headers = {}) => {
    const url = `${userModuleApiBaseUrl}/updateActiveSession`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const checkSessionApi = async (headers = {}) => {
    console.log('toocheckSession');
    const url = `${userModuleApiBaseUrl}/login/checkSession`;
    return apiRequest({
        url: url,
        headers: headers,
    });
};

export const refreshTokenApi = async (refreshToken) => {
    const response = await axiosInstance.post('/refresh-token', { refreshToken });
    return response.data;
};

export const validateTokenApi = async (token) => {
    const response = await axiosInstance.get('/validate-token', {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.status === 200;
};
