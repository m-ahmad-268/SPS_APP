// /i18n/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import store from '../redux/store';
import { loadLanguage } from '../redux/slices/languageSlice';

// Import language files
// import en from './locales/en.json';
// import ar from './locales/ar.json';

const resources = {
    en: {
        translation: {
            "welcome": "Welcome",
            "requiredValid": "This field is required",
            "select_language": "Select Language",
            "serverErrorText": "Server error. Please contact admin !",
            "success": "Success",
            "error": "Error",

        }
    },
    ar: {
        translation: {
            "welcome": "أهلا بك",
            "requiredValid": "هذه الخانة مطلوبه",
            "select_language": "اختر اللغة",
            "serverErrorText": "خطأ في الخادم. يرجى الاتصال بالمسؤول!",
            "success": "نجاح",
            "error": "خطأ",
        }
    }
};

// resources: {
//     en: { translation: en },
//     ar: { translation: ar },
// },

i18n
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        resources,
        interpolation: { escapeValue: false },
    });

// Listen to Redux store for language changes
store.subscribe(() => {
    const state = store.getState();
    const currentLanguage = state.language.language;
    if (i18n.language !== currentLanguage) {
        i18n.changeLanguage(currentLanguage);
    }
});

// Initialize language from AsyncStorage on app start
const initializeLanguage = async () => {
    const storedLanguage = await AsyncStorage.getItem('user-language');
    if (storedLanguage) {
        // store.dispatch(loadLanguage(storedLanguage));
    }
};

initializeLanguage();

export default i18n;
