// /redux/slices/languageSlice.js
import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const languageSlice = createSlice({
    name: 'language',
    initialState: {
        language: 'en', // default language
        LTR: {},
        RTL: {},
        // default language
    },
    reducers: {
        setLanguage(state, action) {
            state.language = action.payload;
        },
        loadLanguage(state, action) {
            state.language = action.payload;
        },
    },
});

export const { setLanguage, loadLanguage } = languageSlice.actions;
export default languageSlice.reducer;
