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
            "logout": "Logout",
            "CANCEL": "Cancel",
            "ok": "Ok",
            "submit": "Submit",
            "NO_DATA_TO_DISPLAY": "No data to display",
            "invoices": "Invoices",
            "quotation": "Quotation",
            "order": "Order",
            "draft": "Draft",
            "delivered": "Delivered",
            "SAR": "SAR",
            "search": "Search",
            "select": "Select",
            "save": "Save",
            "PLEASE_FILL_COMPLETE_DATA": "Please Fill Complete Data",
            "CUSTOMER_NOT_FOUND": "Customer Not Found",
            "confirmation": "Confirmation",
            "COMPARED_TO_LAST_MONTH": "compared to last month",
            'update': 'Update',
            'clear': 'Clear',
            'map': 'Map',
            'allowedFileType': "Allowed File Type",
            'MaximumAllowedSize': "Maximum Allowed Size",
            'MAXIMUM_ALLOWED_FILE_OR_IMAGE_SIZE': 'Maximum Allowed File Or Image Size',
            'DRAFT': 'Draft',
            'SUBMITTED': 'Submitted',
            'APPROVED': 'Approved',
            'Rejected': 'REJECTED',
            'ACCEPTED': 'Accepted',
            'DELIVERED': 'Delivered',
            'RETURN_REQUEST_SUBMITTED': 'Return Request Submitted',
            'delete': 'Delete',
            'cancel_transaction': 'Cancel Transaction',
            'print': 'Print',
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
            "logout": "تسجيل خروج",
            "CANCEL": "إلغاء",
            "ok": "حسنا",
            "submit": "رفع",
            "NO_DATA_TO_DISPLAY": "لا توجد بيانات لعرض",
            "invoices": "الفواتير",
            "quotation": "عرض سعر",
            "order": 'طلب',
            "draft": "مسودة",
            "delivered": "تم التوصيل",
            "SAR": "ريال",
            "search": "بحث",
            "select": "تحديد",
            "save": "حفظ",
            "PLEASE_FILL_COMPLETE_DATA": "الرجاء تعبئة البيانات كاملة",
            "CUSTOMER_NOT_FOUND": "لم يتم العثور على العميل",
            "confirmation": "تأكيد",
            "COMPARED_TO_LAST_MONTH": "مقارنة بالشهر الماضي",
            "update": "تحديث",
            "clear": "واضح",
            "map": "رسم خريطة",
            "allowedFileType": "نوع الملف المسموح به",
            'MaximumAllowedSize': "الحجم الأقصى المسموح به",
            'MAXIMUM_ALLOWED_FILE_OR_IMAGE_SIZE': "الحد الأقصى المسموح به لحجم الملف أو الصورة",
            'ACCEPTED': "مقبول",
            'REJECTED': "مرفوض",
            'APPROVED': "تمت الموافقة",
            'SUBMITTED': "مُقَدَّم",
            'DELIVERED': "تم التوصيل",
            'DRAFT': "مسودة",
            'print': "طباعة",
            'cancel_transaction': "إلغاء الحركة",
            'delete': "حذف",
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

    }
};

initializeLanguage();

export default i18n;
