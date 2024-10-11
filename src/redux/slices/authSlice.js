// /redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, refreshTokenApi, checkSessionApi, validateTokenApi } from '../../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async Thunks
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, thunkAPI) => {
        try {
            console.log('hello-----LoginAPI------------------', credentials);
            const response = await loginApi(credentials);
            return response;
        } catch (error) {
            console.log('yooooError', error);
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const refreshToken = createAsyncThunk(
    'auth/refreshToken',
    async (_, thunkAPI) => {
        try {
            console.log('hello-----refreshTokenasdasdsad------------------');
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            const response = await refreshTokenApi(refreshToken);
            await AsyncStorage.setItem('userToken', response.token);
            return response.token;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const checkSession = createAsyncThunk(
    'auth/CheckSession',
    async (_, thunkAPI) => {
        try {
            const getData = await AsyncStorage.getItem('currentUser') || '{}';
            const activeUser = JSON.parse(getData);
            const headres = {
                'session': activeUser.session || '',
                'userId': activeUser.userId || '',
                'content-type': 'application/json'
            }
            // const refreshToken = await AsyncStorage.getItem('refreshToken');
            console.log('headres', headres);
            const response = await checkSessionApi(headres);
            // await AsyncStorage.setItem('userToken', response.token);
            return response;
        } catch (error) {
            console.log('yooooError', error);
            // dispatch(logout());
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        userProfile: {},
    },
    reducers: {
        logout(state) {
            state.refreshToken = null;
            state.error = null;
            state.userProfile = {};
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            AsyncStorage.removeItem('currentUser');
            // AsyncStorage.removeItem('refreshToken');
        },
        setLoading(state) {
            state.isLoading = true;
        },
        resetLoading(state) {
            state.isLoading = false;
        },
        setUserData(state, action) {
            state.userProfile = { ...state.userProfile, ...action?.payload };
        },
        resetUserData(state, action) {
            state.userProfile = null;
        },
        setToken(state, action) {
            console.log(action);

            const randomValue = Math.floor(Math.random() * 101);
            state.token = randomValue;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                console.log('brawooPendinggg');

                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                console.log('brawooFufil', action?.payload);
                state.isLoading = false;
                const responseCode = action?.payload.code; // Assuming responseCode is part of the payload
                if (responseCode === 202) {
                    // state.token = action.payload.token;
                    // state.refreshToken = action.payload.refreshToken;
                    state.isAuthenticated = true;
                } else {
                    // Handle other response codes (e.g., 400, 401)
                    state.error = action.payload?.btiMessage?.message || 'Session Expired';
                    state.isAuthenticated = false;
                }
            })
            .addCase(login.rejected, (state, action) => {
                console.log('brawoo');

                state.isLoading = false;
                state.error = action.payload.message || 'Login failed';
            })
            // Refresh Token
            .addCase(refreshToken.fulfilled, (state, action) => {
                console.log('brawooRefresh');
                state.token = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(refreshToken.rejected, (state) => {
                state.token = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
            })
            // CheckSession Token
            .addCase(checkSession.pending, (state) => {
                console.log('chcekSessionPEndingState-----------------');

                state.isLoading = true;
                state.error = null;
            })
            .addCase(checkSession.fulfilled, (state, action) => {
                console.log('checkSessinFulFilState------------', action?.payload.code);
                state.isLoading = false;
                const responseCode = action?.payload.code; // Assuming responseCode is part of the payload
                if (responseCode === 200) {
                    state.userProfile = { ...action.payload?.result };
                    // state.refreshToken = action.payload.refreshToken;
                    state.isAuthenticated = true;
                } else {
                    // Handle other response codes (e.g., 400, 401)
                    state.error = action.payload?.btiMessage?.message || 'Session Expired';
                    state.isAuthenticated = false;
                }
            })
            .addCase(checkSession.rejected, (state) => {
                console.log('CheckSessinRejecttedState------------------    ');
                state.token = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.isLoading = false;
            });
    },
});

export const { logout, setLoading, resetLoading, setUserData, resetUserData, setToken } = authSlice.actions;
export default authSlice.reducer;
