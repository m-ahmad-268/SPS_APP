// /redux/slices/customerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCustomerDetailsApi } from '../../api/customer';

// Async Thunk
export const fetchCustomerDetails = createAsyncThunk(
    'customer/fetchDetails',
    async (_, thunkAPI) => {
        try {
            const response = await fetchCustomerDetailsApi();
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Slice
const customerSlice = createSlice({
    name: 'customer',
    initialState: {
        details: [],
        isLoading: false,
        error: null,
    },
    reducers: {
        // Define synchronous actions if needed
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomerDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCustomerDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.details = action.payload;
            })
            .addCase(fetchCustomerDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload.message || 'Failed to fetch customer details';
            });
    },
});

export default customerSlice.reducer;
