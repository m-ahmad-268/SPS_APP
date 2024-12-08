import axiosInstance from './axiosInstance.js';
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

export const searchQuotationsByCustomer = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/searchQuotationsByCustomer`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const updateMaintenance = async (credentials, headers = {}) => {
    const url = `${financialModuleApiBaseUrl}/setup/accounts/updateMaintenance`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getCustomerDocumentTypes = async (credentials, headers = {}) => {
    const url = `${financialModuleApiBaseUrl}/customerDocument/getCustomerDocumentTypes`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const search = async (credentials, headers = {}) => {
    const url = `${financialModuleApiBaseUrl}/customer/itemAssignment/search`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const searchOrderByCustomer = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/searchOrderByCustomer`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const userActivity = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/api/userActivity`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getAllFilters = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/filters/getAll`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const calculateBill = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/calculateBill`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const findCustomerByCustomerId = async (credentials, headers = {}) => {
    const url = `${imsModuleApiBaseUrl}/customerMaintenance/findCustomerByCustomerId`;
    return apiRequest({
        url: url,
        method: "POST",
        data: { customerId: credentials },
        headers: headers,
    });
};

export const getDetailsByCustomerOrderId = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/getDetailsByCustomerOrderId`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};
export const create = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/create`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const validateQuantityBeforeSubmit = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/validateQuantityBeforeSubmit`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const createTransactionEntry = async (credentials, headers = {}) => {
    const url = `${imsModuleApiBaseUrl}/createTransactionEntry/create`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const submit = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/submit`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const cencelOrderOrQuotation = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/cencelOrderOrQuotation`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const requestPrioritiesForDropDown = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/spsControlSetup/requestPrioritiesForDropDown`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const shippingAddressByCustomer = async (credentials, headers = {}) => {
    const url = `${financialModuleApiBaseUrl}/setup/accounts/shippingAddressByCustomer`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getAllDocumentByCustomerId = async (credentials, headers = {}) => {
    const url = `${financialModuleApiBaseUrl}/customerDocument/getAllDocumentByCustomerId`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getCustomerByEmail = async (credentials, headers = {}) => {
    const url = `${financialModuleApiBaseUrl}/customerMaintenance/getCustomerByEmail`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getSalesInvoiceAttachment = async (credentials, headers = {}) => {
    const url = `${imsModuleApiBaseUrl}/salesTransactionEntry/getSalesInvoiceAttachment`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const deleteSalesInvoiceAttachment = async (credentials, headers = {}) => {
    const url = `${imsModuleApiBaseUrl}/salesTransactionEntry/deleteSalesInvoiceAttachment`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const uploadSalesInvoiceAttachment = async (credentials, headers = {}) => {
    const url = `${imsModuleApiBaseUrl}/salesTransactionEntry/uploadSalesInvoiceAttachment`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const saveOrUpdate = async (credentials, headers = {}) => {
    const url = `${financialModuleApiBaseUrl}/customerDocument/saveOrUpdate`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const saveMaintenanceShippingAddress = async (credentials, headers = {}) => {
    const url = `${financialModuleApiBaseUrl}/setup/accounts/saveMaintenanceShippingAddress`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const deleteShippingAddress = async (credentials, headers = {}) => {
    const url = `${financialModuleApiBaseUrl}/setup/accounts/deleteShippingAddress`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const downloadById = async (credentials, headers = {}) => {
    const url = `${financialModuleApiBaseUrl}/customerDocument/downloadById`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getCustomerAccountDetailByCustomerId = async (credentials, headers = {}) => {
    const url = `${financialModuleApiBaseUrl}/transaction/accountReceivable/getCustomerAccountDetailByCustomerId`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getExpiredCustomerDocuments = async (credentials, headers = {}) => {
    const url = `${financialModuleApiBaseUrl}/customerDocument/getExpiredCustomerDocuments`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getExpiredInDaysCustomerDocuments = async (credentials, headers = {}) => {
    const url = `${financialModuleApiBaseUrl}/customerDocument/getExpiredInDaysCustomerDocuments`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const maintenanceGetById = async (credentials, headers = {}) => {
    const url = `${financialModuleApiBaseUrl}/setup/accounts/maintenanceGetById`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getData = async (credentials, headers = {}) => {
    const url = `${imsModuleApiBaseUrl}/invoiceTracking/data`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const searchAllInvoicesAndReturn = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/searchAllInvoicesAndReturn`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getByIdForReturn = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/getByIdForReturn`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getByCustomerReturnId = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/getByCustomerReturnId`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const checkItemAllowToReturn = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/checkItemAllowToReturn`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const submitReturn = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/submitReturn`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const createReturn = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/createReturn`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getCustomerOrderById = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/getById`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const searchInDeliverySaleOrderByCustomer = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/searchInDeliverySaleOrderByCustomer`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const searchInReturnSaleOrderByCustomer = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/searchInReturnSaleOrderByCustomer`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const searchInvoiceAndRetrunCount = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/searchInvoiceAndRetrunCount`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const submitForClient = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/submitForClient`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getById = async (credentials, headers = {}) => {
    const url = `${imsModuleApiBaseUrl}/salesTransactionEntry/getById`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const postSaleAndSaleReturnData = async (credentials, headers = {}) => {
    const url = `${imsModuleApiBaseUrl}/salesTransactionEntry/postSaleAndSaleReturnData`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const searchCustomerQutationCount = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/searchCustomerQutationCount`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getQuotationById = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/getById`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const approveQuotation = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/approveQuotation`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getAll = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/spsControlSetup/getAll`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const deleteCustomerOrder = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/delete`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const getGraphData = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/getGraphData`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};

export const searchCustomerOrderCount = async (credentials, headers = {}) => {
    const url = `${salesModuleApiBaseUrl}/customerOrder/searchCustomerOrderCount`;
    return apiRequest({
        url: url,
        method: "POST",
        data: credentials,
        headers: headers,
    });
};