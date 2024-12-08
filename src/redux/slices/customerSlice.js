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
        cartItems: [],
        isVisible: false,
        isLoading: false,
        error: null,
    },
    reducers: {
        setCartVisible: (state, action) => {
            state.isVisible = action.payload;
        },
        setCartItems: (state, action) => {
            // console.log('setDtoReservationGridList', action);
            // const existingIndex = state.dtoReservationGridList.findIndex(
            //     (reservation) =>
            //         (reservation.startDate === action.payload.value.startDate && reservation.startTime === action.payload.value.startTime)
            // );
            switch (action.payload.action) {
                case 'ADD_TO_CART_LIST':
                    // if (existingIndex === -1) {
                    state.cartItems = action.payload.value;
                    // } else {
                    //   state.listStatus = 404;
                    // }
                    break;
                case 'ADD_TO_CART':
                    // if (existingIndex === -1) {
                    state.cartItems.push(action.payload.value);
                    // } else {
                    //   state.listStatus = 404;
                    // }
                    break;
                case 'MODIFY_CART':
                    // if (existingIndex !== -1) {
                    const index = state.cartItems.length ? state.cartItems.findIndex(x => x.itemNumber == action.payload.value.indexOf) : -1;
                    if (index != -1)
                        state.cartItems[index] = { ...state.cartItems[index], ...action.payload.value.obj };
                    // state.cartItems[action.payload.value.index] = { ...state.cartItems[action.payload.value.index], ...action.payload.value.obj };
                    // } else {
                    //   listStatus = 404;
                    // }
                    break;
                case 'DELETE_CART':
                    // if (existingIndex !== -1) {
                    // console.log('index==================samjh aiii', action.payload.value.index);
                    state.cartItems.splice(action.payload.value.index, 1);
                    // } else {
                    //   listStatus = 404;
                    // }
                    break;
                case 'EMPTY_CART':
                    state.cartItems = [];
                    break;
                default:
                    state.error = 'Error Occurred';
                    break;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomerDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCustomerDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cartItems = action.payload;
            })
            .addCase(fetchCustomerDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload.message || 'Failed to fetch customer details';
            });
    },
});

export const { setCartItems, setCartVisible, } = customerSlice.actions;

export default customerSlice.reducer;
