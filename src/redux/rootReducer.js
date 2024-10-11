// /redux/rootReducer.js
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import languageReducer from './slices/languageSlice';
import customerReducer from './slices/customerSlice';
// Import other reducers as needed

const rootReducer = combineReducers({
    auth: authReducer,
    language: languageReducer,
    customer: customerReducer,
    // Add other reducers here
});

export default rootReducer;