// /redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Persist Config
const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['auth', 'language'], // Specify which slices to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure Store
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {

                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
    // Optional: Add middleware here if needed
});

// Persistor
export const persistor = persistStore(store);

export default store;
